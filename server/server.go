package server

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"html/template"
	"io"
	"io/ioutil"
	"log"
	"net"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"path"
	"regexp"
	"strconv"
	"strings"

	"github.com/coreos/dex/api"
	"github.com/coreos/dex/connector"
	"github.com/coreos/dex/connector/ldap"
	"github.com/coreos/pkg/capnslog"
	"github.com/coreos/pkg/health"

	"github.com/openshift/console/auth"
	"github.com/openshift/console/pkg/proxy"
	"github.com/openshift/console/version"

	"github.com/Sirupsen/logrus"
)

const (
	// NOTE: k8s bearer token 가져오기 위해 추가 // 정동민
	k8sInClusterCA          = "/var/run/secrets/kubernetes.io/serviceaccount/ca.crt"
	k8sInClusterBearerToken = "/var/run/secrets/kubernetes.io/serviceaccount/token"

	indexPageTemplateName     = "index.html"
	tokenizerPageTemplateName = "tokener.html"

	authLoginEndpoint         = "/auth/login"
	AuthLoginCallbackEndpoint = "/auth/callback"
	AuthLoginSuccessEndpoint  = "/"
	AuthLoginErrorEndpoint    = "/error"
	authLogoutEndpoint        = "/auth/logout"
	k8sProxyEndpoint          = "/api/kubernetes/"
	prometheusProxyEndpoint   = "/api/prometheus"
	hypercloudProxyEndpoint   = "/api/hypercloud/"
	jaegerProxyEndpoint       = "/api/jaeger/"
	approvalProxyEndpoint     = "/api/approve/"
	grafanaProxyEndpoint      = "/api/grafana/"
	kialiProxyEndpoint        = "/api/kiali/"
	hyperflowEndpoint         = "/api/hyperflow/"
	vncEndpoint               = "/api/vnc/"
	hyperAuthEndpoint         = "/api/auth/"
	// NOTE: hypercloud api 프록시를 위해 hypercloudProxyEndpoint 추가 // 정동민
)

var (
	plog = capnslog.NewPackageLogger("github.com/openshift/console", "server")
)

type jsGlobals struct {
	ConsoleVersion string `json:"consoleVersion"`
	// AuthDisabled         bool   `json:"authDisabled"`
	// KubectlClientID      string `json:"kubectlClientID"`
	BasePath string `json:"basePath"`
	// LoginURL             string `json:"loginURL"`
	// LoginSuccessURL      string `json:"loginSuccessURL"`
	// LoginErrorURL        string `json:"loginErrorURL"`
	// LogoutURL            string `json:"logoutURL"`
	// LogoutRedirect       string `json:"logoutRedirect"`
	KubeAPIServerURL  string `json:"kubeAPIServerURL"`
	PrometheusBaseURL string `json:"prometheusBaseURL"`
	// DeveloperConsoleURL  string `json:"developerConsoleURL"`
	// Branding             string `json:"branding"`
	// DocumentationBaseURL string `json:"documentationBaseURL"`
	// ClusterName          string `json:"clusterName"`
	// GoogleTagManagerID   string `json:"googleTagManagerID"`
	// LoadTestFactor       int    `json:"loadTestFactor"`
	ReleaseModeFlag    bool   `json:"releaseModeFlag"`
	HDCModeFlag        bool   `json:"HDCModeFlag"`
	TmaxCloudPortalURL string `json:tmaxCloudPortalURL`
	KeycloakRealm      string `json:keycloakRealm`
	KeycloakAuthURL    string `json:keycloakAuthURL`
	KeycloakClientId   string `json:keycloakClientId`
}

type Server struct {
	K8sProxyConfig       *proxy.Config
	BaseURL              *url.URL
	LogoutRedirect       *url.URL
	PublicDir            string
	TectonicVersion      string
	TectonicCACertFile   string
	Auther               *auth.Authenticator
	StaticUser           *auth.User
	KubectlClientID      string
	ClusterName          string
	KubeAPIServerURL     string
	DeveloperConsoleURL  string
	DocumentationBaseURL *url.URL
	Branding             string
	GoogleTagManagerID   string
	LoadTestFactor       int
	MasterToken          string
	ReleaseModeFlag      bool
	HDCModeFlag          bool
	TmaxCloudPortalURL   string
	KeycloakRealm        string
	KeycloakAuthURL      string
	KeycloakClientId     string
	// Helpers for logging into kubectl and rendering kubeconfigs. These fields
	// may be nil.
	KubectlAuther  *auth.Authenticator
	KubeConfigTmpl *KubeConfigTmpl
	DexClient      api.DexClient
	// A client with the correct TLS setup for communicating with the API server.
	K8sClient             *http.Client
	PrometheusProxyConfig *proxy.Config
	HypercloudProxyConfig *proxy.Config
	JaegerProxyConfig     *proxy.Config
	ApprovalProxyConfig   *proxy.Config
	GrafanaProxyConfig    *proxy.Config
	KialiProxyConfig      *proxy.Config
	HyperflowProxyConfig  *proxy.Config
	VncProxyConfig        *proxy.Config
	HyperAuthProxyConfig  *proxy.Config

	// NOTE: hypercloud api 프록시를 위해 HypercloudProxyConfig 추가 // 정동민
}

type UserSecurityPolicy struct {
	Name      string   `json:"name"`
	OtpEnable string   `json:"otpEnable"`
	Otp       int      `json:"otp"`
	IPRange   []string `json:"ipRange"`
	Code      int      `json:"code"`
	Message   string   `json:"message"`
	Status    string   `json:"status"`
}

type TokenData struct {
	TokenId string `json:"tokenId"`
	Iss     string `json:"iss"`
	Id      string `json:"id"`
	Exp     int    `json:"exp"`
}

type AuthData struct {
	Id           string `json:"id"`
	AccessToken  string `json:"accessToken"`
	RefreshToken string `json:"refreshToken"`
}

func (s *Server) authDisabled() bool {
	// return s.Auther == nil
	return true
	// NOTE: OpenShift auth 사용하지 않음 // 정동민
}

func (s *Server) prometheusProxyEnabled() bool {
	return s.PrometheusProxyConfig != nil
}

func (s *Server) HTTPHandler() http.Handler {
	mux := http.NewServeMux()

	if len(s.BaseURL.Scheme) > 0 && len(s.BaseURL.Host) > 0 {
		s.K8sProxyConfig.Origin = fmt.Sprintf("%s://%s", s.BaseURL.Scheme, s.BaseURL.Host)
	}
	handle := func(path string, handler http.Handler) {
		mux.Handle(proxy.SingleJoiningSlash(s.BaseURL.Path, path), handler)
	}

	handleFunc := func(path string, handler http.HandlerFunc) { handle(path, handler) }

	fn := func(loginInfo auth.LoginJSON, successURL string, w http.ResponseWriter) {
		jsg := struct {
			auth.LoginJSON  `json:",inline"`
			LoginSuccessURL string `json:"loginSuccessURL"`
			Branding        string `json:"branding"`
		}{
			LoginJSON:       loginInfo,
			LoginSuccessURL: successURL,
			Branding:        s.Branding,
		}

		tpl := template.New(tokenizerPageTemplateName)
		tpl.Delims("[[", "]]")
		tpls, err := tpl.ParseFiles(path.Join(s.PublicDir, tokenizerPageTemplateName))
		if err != nil {
			fmt.Printf("%v not found in configured public-dir path: %v", tokenizerPageTemplateName, err)
			os.Exit(1)
		}

		if err := tpls.ExecuteTemplate(w, tokenizerPageTemplateName, jsg); err != nil {
			fmt.Printf("%v", err)
			os.Exit(1)
		}
	}

	authHandler := func(hf http.HandlerFunc) http.Handler {
		return authMiddleware(s.Auther, hf)
	}
	authHandlerWithUser := func(hf func(*auth.User, http.ResponseWriter, *http.Request)) http.Handler {
		return authMiddlewareWithUser(s.Auther, hf)
	}

	// NOTE: 여기 유심히 봐야 할 듯
	if s.authDisabled() {
		authHandler = func(hf http.HandlerFunc) http.Handler {
			return hf
		}
		authHandlerWithUser = func(hf func(*auth.User, http.ResponseWriter, *http.Request)) http.Handler {
			return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				// api 목록 서비스, logout 서비스에는 IP Range 검증하지 않음
				reg, _ := regexp.Compile("(?:apis|api|v[1-9]|v[1-9]beta[1-9]|v[1-9]alpha[1-9])$")
				if strings.Contains(string(r.URL.Path), "logout") || reg.MatchString(string(r.URL.Path)) {
					hf(s.StaticUser, w, r)
					return
				}

				// IP Range 검증을 위한 변수들 세팅
				var token string
				var tokenPayload string
				var id string
				var bodyId string
				var bodyToken string
				var requestBodyString string
				var bodyReadFlag bool
				var authData AuthData
				var tokenPayloadParsedJson TokenData

				// Authorization Header 가져오기
				headerTokens := r.Header["Authorization"]

				// Query에서 Token이 있다면 가져오기
				queryTokens, _ := r.URL.Query()["token"]

				// otp, login, refresh 서비스
				if strings.Contains(string(r.URL.Path), "otp") || strings.Contains(string(r.URL.Path), "login") || strings.Contains(string(r.URL.Path), "refresh") {

					// id나 token을 가져오기 위해 body를 parse
					body, err := ioutil.ReadAll(r.Body)
					if err != nil {
						panic(err)
					}
					requestBodyString = string(body) // body가 소모된 뒤 복구해주기 위한 사본 생성

					err = json.Unmarshal(body, &authData)
					if err != nil {
						panic(err)
					}

					bodyId = authData.Id
					bodyToken = authData.AccessToken
					bodyReadFlag = true
				}

				// id를 얻어오기, 필요한 경우 token을 parse하기
				if len(bodyId) == 0 {
					if len(bodyToken) > 0 {
						token = string(bodyToken)
					} else if len(headerTokens) > 0 {
						headerTokenSplit := strings.Split(string(headerTokens[0]), "Bearer ")
						if len(headerTokenSplit) > 1 {
							token = headerTokenSplit[1]
						} else {
							token = headerTokenSplit[0]
						}
					} else if len(queryTokens) > 0 {
						token = string(queryTokens[0])
					}

					tokenPayload = strings.Split(token, ".")[1]
					tokenPayloadParsed, _ := base64.StdEncoding.DecodeString(tokenPayload + "==")
					tokenPayloadParsedString := string(tokenPayloadParsed)

					json.Unmarshal([]byte(tokenPayloadParsedString), &tokenPayloadParsedJson)
					id = tokenPayloadParsedJson.Id
				} else {
					id = bodyId
				}

				// user security policy를 가져오기 위한 서비스콜
				path := "/apis/tmax.io/v1/usersecuritypolicies/" + id
				urltocall := proxy.SingleJoiningSlash(s.K8sProxyConfig.Endpoint.String(), path)

				var tokenForUserSecurityPolicy string
				// NOTE: in-cluster인 경우 MasterToken을 ""로 바꿔두었음. 이 경우 InClusterBearerToken 사용
				if s.MasterToken == "" {
					tokenForUserSecurityPolicy = s.StaticUser.Token
				} else {
					tokenForUserSecurityPolicy = s.MasterToken
				}
				// tokenForUserSecurityPolicy = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJUbWF4LVByb0F1dGgiLCJpZCI6ImFkbWluLXRtYXguY28ua3IiLCJleHAiOjE1OTE3NzMyNDcsInV1aWQiOiJmNDE3YTFhOS0xYjg5LTQwNDktODI1NS03Y2ZmYTE2MjY1YjQifQ.dhF3x2LPKeZiHV-6UqWPgm6sLt7CIxNRcX-zHBqPxPs"
				// body가 소모된 경우 복구
				clientAddr, _ := getIP(r)
				if bodyReadFlag {
					r.Body = ioutil.NopCloser(strings.NewReader(requestBodyString))
				}
				result, message := s.verifyIpRange(urltocall, tokenForUserSecurityPolicy, clientAddr)
				switch result {
				case true:
					if strings.Contains(string(r.URL.Path), "login") {
						plog.Info(message)
					}
					hf(s.StaticUser, w, r)
					return
				case false:
					plog.Info(message)
					sendResponse(w, http.StatusForbidden, apiError{"Your IP Address has been forbidden."})
					return
				}
				hf(s.StaticUser, w, r)
			})
		}
	}

	if !s.authDisabled() {
		handleFunc(authLoginEndpoint, s.Auther.LoginFunc)
		handleFunc(authLogoutEndpoint, s.Auther.LogoutFunc)
		handleFunc(AuthLoginCallbackEndpoint, s.Auther.CallbackFunc(fn))

		if s.KubectlAuther != nil {
			handleFunc("/api/tectonic/kubectl/code", s.KubectlAuther.LoginFunc)
			handleFunc("/api/tectonic/kubectl/config", s.handleRenderKubeConfig)
		}

		handle("/api/tectonic/clients", authHandlerWithUser(s.handleListClients))
		handle("/api/tectonic/revoke-token", authHandlerWithUser(s.handleTokenRevocation))
		handle("/api/openshift/delete-token", authHandlerWithUser(s.handleOpenShiftTokenDeletion))
	}

	handleFunc("/api/", notFoundHandler)

	staticHandler := http.StripPrefix(proxy.SingleJoiningSlash(s.BaseURL.Path, "/static/"), http.FileServer(http.Dir(s.PublicDir)))
	handle("/static/", securityHeadersMiddleware(staticHandler))

	// Scope of Service Worker needs to be higher than the requests it is intercepting (https://stackoverflow.com/a/35780776/6909941)
	handleFunc("/load-test.sw.js", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, path.Join(s.PublicDir, "load-test.sw.js"))
	})

	handleFunc("/health", health.Checker{
		Checks: []health.Checkable{},
	}.ServeHTTP)

	k8sProxy := proxy.NewProxy(s.K8sProxyConfig)
	handle(k8sProxyEndpoint, http.StripPrefix(
		proxy.SingleJoiningSlash(s.BaseURL.Path, k8sProxyEndpoint),
		authHandlerWithUser(func(user *auth.User, w http.ResponseWriter, r *http.Request) {
			// r.Header.Set("Authorization", fmt.Sprintf("Bearer %s", user.Token))
			k8sProxy.ServeHTTP(w, r)
		})),
	)
	// NOTE: login proxy를 등록한다 // 정동민
	hypercloudProxyAPIPath := hypercloudProxyEndpoint
	hypercloudProxy := proxy.NewProxy(s.HypercloudProxyConfig)
	handle(hypercloudProxyAPIPath, http.StripPrefix(
		proxy.SingleJoiningSlash(s.BaseURL.Path, hypercloudProxyAPIPath),
		authHandlerWithUser(func(user *auth.User, w http.ResponseWriter, r *http.Request) {
			hypercloudProxy.ServeHTTP(w, r)
		})),
	)
	approvalProxyAPIPath := approvalProxyEndpoint
	approvalProxy := proxy.NewProxy(s.ApprovalProxyConfig)
	handle(approvalProxyAPIPath, http.StripPrefix(
		proxy.SingleJoiningSlash(s.BaseURL.Path, approvalProxyAPIPath),
		authHandlerWithUser(func(user *auth.User, w http.ResponseWriter, r *http.Request) {
			approvalProxy.ServeHTTP(w, r)
		})),
	)
	if s.JaegerProxyConfig != nil {
		jaegerProxyAPIPath := jaegerProxyEndpoint
		jaegerProxy := httputil.NewSingleHostReverseProxy(s.JaegerProxyConfig.Endpoint)
		handle(jaegerProxyAPIPath, http.StripPrefix(
			proxy.SingleJoiningSlash(s.BaseURL.Path, jaegerProxyAPIPath),
			http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				jaegerProxy.ServeHTTP(w, r)
			})),
		)
	}

	// NOTE: 여기까지
	if s.prometheusProxyEnabled() {
		// Only proxy requests to the Prometheus API, not the UI.
		prometheusProxyAPIPath := prometheusProxyEndpoint + "/api/"
		prometheusProxy := proxy.NewProxy(s.PrometheusProxyConfig)
		handle(prometheusProxyAPIPath, http.StripPrefix(
			proxy.SingleJoiningSlash(s.BaseURL.Path, prometheusProxyAPIPath),
			authHandlerWithUser(func(user *auth.User, w http.ResponseWriter, r *http.Request) {
				// r.Header.Set("Authorization", fmt.Sprintf("Bearer %s", user.Token))
				prometheusProxy.ServeHTTP(w, r)
			})),
		)
	}

	// NOTE: grafan proxy 등록 // 윤진수
	if s.GrafanaProxyConfig != nil {
		grafanaProxyAPIPath := grafanaProxyEndpoint
		grafanaProxy := httputil.NewSingleHostReverseProxy(s.GrafanaProxyConfig.Endpoint)
		handle(grafanaProxyAPIPath, http.StripPrefix(
			proxy.SingleJoiningSlash(s.BaseURL.Path, grafanaProxyAPIPath),
			http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				grafanaProxy.ServeHTTP(w, r)
			})),
		)
	}
	// NOTE: 여기까지

	// NOTE: kiali proxy 등록 // 윤진수
	if s.KialiProxyConfig != nil {
		kialiProxyAPIPath := kialiProxyEndpoint
		kialiProxy := httputil.NewSingleHostReverseProxy(s.KialiProxyConfig.Endpoint)
		handle(kialiProxyAPIPath, http.StripPrefix(
			proxy.SingleJoiningSlash(s.BaseURL.Path, kialiProxyAPIPath),
			http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				kialiProxy.ServeHTTP(w, r)
			})),
		)
	}

	if s.HyperflowProxyConfig != nil {
		hyperflowProxyAPIPath := hyperflowEndpoint
		// hyperflowProxy := httputil.NewSingleHostReverseProxy(s.HyperflowProxyConfig.Endpoint)
		hyperflowProxy := proxy.NewProxyCloud(s.HyperflowProxyConfig)
		handle(hyperflowProxyAPIPath,
			http.StripPrefix(s.BaseURL.Path,
				http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
					hyperflowProxy.ServeHTTPCloud(w, r)
				})),
		)
	}

	if s.VncProxyConfig != nil {
		vncProxyAPIPath := vncEndpoint
		// vncProxy := httputil.NewSingleHostReverseProxy(s.VncProxyConfig.Endpoint)
		// websocket proxy를 위해 proxyCloud 추가
		vncProxy := proxy.NewProxyCloud(s.VncProxyConfig)
		handle(vncProxyAPIPath,
			http.StripPrefix(proxy.SingleJoiningSlashCloud(s.BaseURL.Path, vncProxyAPIPath),
				http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
					// r.Header.Add("Origin", "http://localhost")
					vncProxy.ServeHTTPCloud(w, r)
				})),
		)
	}

	// hyperAuth proxy for Authentication // jinsoo-youn
	if s.HyperAuthProxyConfig != nil {
		hyperAuthAPIPath := hyperAuthEndpoint
		hyperAuthProxy := httputil.NewSingleHostReverseProxy(s.HyperAuthProxyConfig.Endpoint)
		handle(hyperAuthAPIPath,
			http.StripPrefix(s.BaseURL.Path,
				http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
					hyperAuthProxy.ServeHTTP(w, r)
				})),
		)
	}

	handle("/api/tectonic/version", authHandler(s.versionHandler))
	handle("/api/tectonic/ldap/validate", authHandler(handleLDAPVerification))
	handle("/api/tectonic/certs", authHandler(s.certsHandler))
	mux.HandleFunc(s.BaseURL.Path, s.indexHandler)

	return securityHeadersMiddleware(http.Handler(mux))
}

func sendResponse(rw http.ResponseWriter, code int, resp interface{}) {
	enc, err := json.Marshal(resp)
	if err != nil {
		plog.Printf("Failed JSON-encoding HTTP response: %v", err)
		rw.WriteHeader(http.StatusInternalServerError)
		return
	}

	rw.Header().Set("Content-Type", "application/json")
	rw.WriteHeader(code)

	_, err = rw.Write(enc)
	if err != nil {
		plog.Errorf("Failed sending HTTP response body: %v", err)
	}
}

func getIP(r *http.Request) (string, error) {
	//Get IP from the X-REAL-IP header
	ip := r.Header.Get("X-REAL-IP")
	netIP := net.ParseIP(ip)
	if netIP != nil {
		return ip, nil
	}

	//Get IP from X-FORWARDED-FOR header
	ips := r.Header.Get("X-FORWARDED-FOR")
	splitIps := strings.Split(ips, ",")
	for _, ip := range splitIps {
		netIP := net.ParseIP(ip)
		if netIP != nil {
			return ip, nil
		}
	}

	//Get IP from RemoteAddr
	ip, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return "", err
	}
	netIP = net.ParseIP(ip)
	if netIP != nil {
		return ip, nil
	}
	return "", fmt.Errorf("No valid ip found")
}

type apiError struct {
	Err string `json:"error"`
}

func (s *Server) handleRenderKubeConfig(w http.ResponseWriter, r *http.Request) {
	statusCode, err := func() (int, error) {
		if r.Method != "POST" {
			return http.StatusMethodNotAllowed, errors.New("not found")
		}
		if s.KubeConfigTmpl == nil {
			return http.StatusNotImplemented, errors.New("Kubeconfig generation not configured.")
		}
		oauth2Code := r.FormValue("code")
		if oauth2Code == "" {
			return http.StatusBadRequest, errors.New("No 'code' form value provided.")
		}

		idToken, refreshToken, err := s.KubectlAuther.ExchangeAuthCode(oauth2Code)
		if err != nil {
			return http.StatusInternalServerError, fmt.Errorf("Failed to exchange auth token: %v", err)
		}
		buff := new(bytes.Buffer)
		if err := s.KubeConfigTmpl.Execute(buff, idToken, refreshToken); err != nil {
			return http.StatusInternalServerError, fmt.Errorf("Failed to render kubeconfig: %v", err)
		}
		w.Header().Set("Content-Length", strconv.Itoa(buff.Len()))
		buff.WriteTo(w)
		return 0, nil
	}()
	if err != nil {
		sendResponse(w, statusCode, apiError{err.Error()})
	}
}

func (s *Server) indexHandler(w http.ResponseWriter, r *http.Request) {
	jsg := &jsGlobals{
		ConsoleVersion: version.Version,
		// AuthDisabled:         s.authDisabled(),
		// KubectlClientID:     s.KubectlClientID,
		BasePath: s.BaseURL.Path,
		// LoginURL:            proxy.SingleJoiningSlash(s.BaseURL.String(), authLoginEndpoint),
		// LoginSuccessURL:     proxy.SingleJoiningSlash(s.BaseURL.String(), AuthLoginSuccessEndpoint),
		// LoginErrorURL:       proxy.SingleJoiningSlash(s.BaseURL.String(), AuthLoginErrorEndpoint),
		// LogoutURL:           proxy.SingleJoiningSlash(s.BaseURL.String(), authLogoutEndpoint),
		// LogoutRedirect:      s.LogoutRedirect.String(),
		// ClusterName:         s.ClusterName,
		KubeAPIServerURL: s.KubeAPIServerURL,
		// DeveloperConsoleURL: s.DeveloperConsoleURL,
		// Branding:             s.Branding,
		// DocumentationBaseURL: s.DocumentationBaseURL.String(),
		// GoogleTagManagerID:   s.GoogleTagManagerID,
		// LoadTestFactor:       s.LoadTestFactor,
		ReleaseModeFlag:    s.ReleaseModeFlag,
		HDCModeFlag:        s.HDCModeFlag,
		TmaxCloudPortalURL: s.TmaxCloudPortalURL,
		KeycloakRealm:      s.KeycloakRealm,
		KeycloakAuthURL:    s.KeycloakAuthURL,
		KeycloakClientId:   s.KeycloakClientId,
	}

	if s.prometheusProxyEnabled() {
		jsg.PrometheusBaseURL = proxy.SingleJoiningSlash(s.BaseURL.Path, prometheusProxyEndpoint)
	}

	if !s.authDisabled() {
		s.Auther.SetCSRFCookie(s.BaseURL.Path, &w)
	}

	tpl := template.New(indexPageTemplateName)
	tpl.Delims("[[", "]]")
	tpls, err := tpl.ParseFiles(path.Join(s.PublicDir, indexPageTemplateName))
	if err != nil {
		fmt.Printf("index.html not found in configured public-dir path: %v", err)
		os.Exit(1)
	}

	if err := tpls.ExecuteTemplate(w, indexPageTemplateName, jsg); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func (s *Server) versionHandler(w http.ResponseWriter, r *http.Request) {
	sendResponse(w, http.StatusOK, struct {
		Version        string `json:"version"`
		ConsoleVersion string `json:"consoleVersion"`
	}{
		Version:        s.TectonicVersion,
		ConsoleVersion: version.Version,
	})
}

type certsInfo struct {
	CaCert struct {
		ExpirationDate int64  `json:"expirationDate"`
		ErrorMessage   string `json:"errorMessage"`
	} `json:"ca-cert"`
}

func (s *Server) certsHandler(w http.ResponseWriter, r *http.Request) {
	info := new(certsInfo)
	expiration, err := getCertExpiration(s.TectonicCACertFile)
	info.CaCert.ExpirationDate = expiration
	if err != nil {
		info.CaCert.ErrorMessage = err.Error()
		sendResponse(w, http.StatusInternalServerError, info)
		return
	}

	sendResponse(w, http.StatusOK, info)
}

func notFoundHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusNotFound)
	w.Write([]byte("not found"))
}

// KubeConfigTmpl is a template which can be rendered into kubectl config file
// ready to talk to a tectonic installation.
type KubeConfigTmpl struct {
	tectonicClusterName string

	clientID     string
	clientSecret string

	k8sURL           string
	k8sCAPEMBase64ed string

	dexURL           string
	dexCAPEMBase64ed string
}

// NewKubeConfigTmpl takes the necessary arguments required to create a KubeConfigTmpl.
func NewKubeConfigTmpl(clusterName, clientID, clientSecret, k8sURL, dexURL string, k8sCA, dexCA []byte) *KubeConfigTmpl {
	encode := func(b []byte) string {
		if b == nil {
			return ""
		}
		return base64.StdEncoding.EncodeToString(b)
	}
	return &KubeConfigTmpl{
		tectonicClusterName: clusterName,
		clientID:            clientID,
		clientSecret:        clientSecret,
		k8sURL:              k8sURL,
		dexURL:              dexURL,
		k8sCAPEMBase64ed:    encode(k8sCA),
		dexCAPEMBase64ed:    encode(dexCA),
	}
}

// Execute renders a kubectl config file unqiue to an authentication session.
func (k *KubeConfigTmpl) Execute(w io.Writer, idToken, refreshToken string) error {
	data := kubeConfigTmplData{
		TectonicClusterName: k.tectonicClusterName,
		K8sCA:               k.k8sCAPEMBase64ed,
		K8sURL:              k.k8sURL,
		DexCA:               k.dexCAPEMBase64ed,
		DexURL:              k.dexURL,
		ClientID:            k.clientID,
		ClientSecret:        k.clientSecret,
		IDToken:             idToken,
		RefreshToken:        refreshToken,
	}
	return kubeConfigTmpl.Execute(w, data)
}

type kubeConfigTmplData struct {
	TectonicClusterName    string
	K8sCA, K8sURL          string
	DexCA, DexURL          string
	ClientID, ClientSecret string
	IDToken                string
	RefreshToken           string
}

var kubeConfigTmpl = template.Must(template.New("kubeConfig").Parse(`apiVersion: v1
kind: Config

clusters:
- cluster:
    server: {{ .K8sURL }}{{ if .K8sCA }}
    certificate-authority-data: {{ .K8sCA }}{{ end }}
  name: {{ .TectonicClusterName }}

users:
- name: {{ .TectonicClusterName }}-user
  user:
    auth-provider:
      config:
        client-id: {{ .ClientID }}
        client-secret: {{ .ClientSecret }}
        id-token: {{ .IDToken }}{{ if .DexCA }}
        idp-certificate-authority-data: {{ .DexCA }}{{ end }}
        idp-issuer-url: {{ .DexURL }}{{ if .RefreshToken }}
        refresh-token: {{ .RefreshToken }}{{ end }}
        extra-scopes: groups
      name: oidc

preferences: {}

contexts:
- context:
    cluster: {{ .TectonicClusterName }}
    user: {{ .TectonicClusterName }}-user
  name: {{ .TectonicClusterName }}-context

current-context: {{ .TectonicClusterName }}-context
`))

// ldapReq is an attempt to test an LDAP configuration object for dex.
// It takes a username, password, and config object, then attempts to
// get user, email, and group information.
type ldapReq struct {
	Username string `json:"username"`
	Password string `json:"password"`

	// A full dex LDAP configuration object. Details can be found in the
	// dex source code and documentation.
	//
	// https://godoc.org/github.com/coreos/dex/connector/ldap#Config
	// https://github.com/coreos/dex/blob/master/Documentation/ldap-connector.md
	Config ldap.Config `json:"config"`
}

// On a successful LDAP verification request, the resulting user is returned.
type ldapResp struct {
	Username string   `json:"username"`
	Email    string   `json:"email"`
	Groups   []string `json:"groups"`
}

// If an error was returned, it will be in the following format.
type ldapError struct {
	Error  string `json:"error"`
	Reason string `json:"reason"`
}

func handleLDAPVerification(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		sendResponse(w, http.StatusBadRequest, &ldapError{
			Error:  "Invalid method",
			Reason: "Endpoint only responses to POSTs.",
		})
		return
	}

	var req ldapReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sendResponse(w, http.StatusBadRequest, &ldapError{
			Error:  "Malformed request body",
			Reason: err.Error(),
		})
		return
	}

	resp, err := verifyLDAP(r.Context(), req)
	if err != nil {
		sendResponse(w, http.StatusOK, err)
		return
	}
	sendResponse(w, http.StatusOK, resp)
}

func verifyLDAP(ctx context.Context, req ldapReq) (*ldapResp, *ldapError) {
	logger := &logrus.Logger{
		Out:       os.Stderr,
		Formatter: &logrus.TextFormatter{DisableColors: true},
		Level:     logrus.DebugLevel,
	}
	conn, err := req.Config.OpenConnector(logger)
	if err != nil {
		return nil, &ldapError{"Invalid config fields", err.Error()}
	}

	// Only search for groups if a base dn has been specified.
	scopes := connector.Scopes{Groups: req.Config.GroupSearch.BaseDN != ""}

	ident, validPassword, err := conn.Login(ctx, scopes, req.Username, req.Password)
	if err != nil {
		return nil, &ldapError{"LDAP query failed", err.Error()}
	}
	if !validPassword {
		return nil, &ldapError{"Failed to login", "Invalid username and password combination."}
	}

	return &ldapResp{
		Username: ident.Username,
		Email:    ident.Email,
		Groups:   ident.Groups,
	}, nil
}

func (s *Server) handleTokenRevocation(user *auth.User, w http.ResponseWriter, r *http.Request) {
	if s.DexClient == nil {
		sendResponse(w, http.StatusNotImplemented, apiError{"Failed to revoke refresh token: Dex API access not configured"})
		return
	}

	clientID := r.FormValue("clientId")
	if clientID == "" {
		sendResponse(w, http.StatusBadRequest, apiError{"Failed to revoke refresh token: client_id not provided"})
		return
	}

	req := &api.RevokeRefreshReq{
		UserId:   user.ID,
		ClientId: clientID,
	}

	resp, err := s.DexClient.RevokeRefresh(r.Context(), req)
	if err != nil {
		sendResponse(w, http.StatusBadRequest, apiError{fmt.Sprintf("Failed to revoke refresh token: %v", err)})
		return
	}
	if resp.NotFound {
		sendResponse(w, http.StatusNotFound, apiError{"Failed to revoke refresh token: refresh token not found"})
		return
	}

	sendResponse(w, http.StatusOK, apiError{})
}

func (s *Server) handleListClients(user *auth.User, w http.ResponseWriter, r *http.Request) {
	if s.DexClient == nil {
		sendResponse(w, http.StatusNotImplemented, apiError{"Failed to List Client: Dex API access not configured."})
		return
	}

	req := &api.ListRefreshReq{
		UserId: user.ID,
	}

	resp, err := s.DexClient.ListRefresh(r.Context(), req)
	if err != nil {
		sendResponse(w, http.StatusInternalServerError, apiError{fmt.Sprintf("Failed to list clients: %v", err)})
		return
	}

	sendResponse(w, http.StatusOK, struct {
		TokenData []*api.RefreshTokenRef `json:"token_data"`
	}{
		TokenData: resp.RefreshTokens,
	})
}

func (s *Server) handleOpenShiftTokenDeletion(user *auth.User, w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		sendResponse(w, http.StatusMethodNotAllowed, apiError{"Invalid method: only POST is allowed"})
		return
	}

	// Delete the OpenShift OAuthAccessToken.
	path := "/apis/oauth.openshift.io/v1/oauthaccesstokens/" // + user.Token
	url := proxy.SingleJoiningSlash(s.K8sProxyConfig.Endpoint.String(), path)
	req, err := http.NewRequest("DELETE", url, nil)
	if err != nil {
		sendResponse(w, http.StatusInternalServerError, apiError{fmt.Sprintf("Failed to create token DELETE request: %v", err)})
		return
	}

	// r.Header.Set("Authorization", fmt.Sprintf("Bearer %s", user.Token))
	resp, err := s.K8sClient.Do(req)
	if err != nil {
		sendResponse(w, http.StatusBadGateway, apiError{fmt.Sprintf("Failed to delete token: %v", err)})
		return
	}

	w.WriteHeader(resp.StatusCode)
	io.Copy(w, resp.Body)
	resp.Body.Close()
}

func (s *Server) httpCall(url, token string) []byte {
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		log.Fatal(err)
	}
	req.Header.Add("Authorization", "Bearer "+token)
	resp, err := s.K8sClient.Do(req)
	if err != nil {
		log.Fatal(err)
	}
	defer resp.Body.Close()
	respBody, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Fatal(err)
	}
	return respBody
}

func (s *Server) verifyIpRange(url, token, clientAddr string) (result bool, message string) {
	respBody := s.httpCall(url, token)

	// usersecuritypolicies CRD가 존재하지 않음, 검증 거치지 않음
	if strings.Contains(string(respBody), "page not found") {
		return true, "UserSecurityPolicy CRD does not exist. IP Range validation skipped."
	}
	// ipRange key가 존재하지 않을 경우, 검증 거치지 않음
	if !strings.Contains(string(respBody), "ipRange") {
		return true, "IP Range key does not exist. All IP allowed."
	}

	// user security parse
	var userSecurity UserSecurityPolicy
	err := json.Unmarshal(respBody, &userSecurity)
	if err != nil {
		return false, ("Failed to parse string to JSON. " + err.Error())
	}

	// usersecuritypolicies CRD는 존재하나, id는 존재하지않음
	if userSecurity.Status == "Failure" || userSecurity.Code == 404 {
		return true, ("User Security Policy for this user does not exist. All IP allowed. " + userSecurity.Message)
	}

	// id는 존재하나, IP Range가 설정되어 있지 않은 경우에는 모든 IP 차단
	if len(userSecurity.IPRange) == 0 {
		return false, ("IP Range(CIDR) for this user is not set. All IP blocked.")
	}

	// IP 정보를 가져와 parse
	if err != nil {
		return false, "Failed to get client IP."
	}

	ipAddr := strings.Split(clientAddr, ":")[0]
	ipRanges := userSecurity.IPRange
	for idx, ipRange := range ipRanges {
		_, subnet, err := net.ParseCIDR(ipRange)
		if err != nil {
			return false, "Failed to parse IP Range(CIDR) for this user."
		}
		// IP Range 검증에 성공한 경우
		result := subnet.Contains(net.ParseIP(ipAddr))
		if result == true {
			return true, "Access accepted. IP = " + ipAddr
		}
		// IP Range 검증에 실패한 경우
		if (idx + 1) == len(ipRanges) {
			return false, "Invalid IP Address. IP = " + ipAddr
		}
	}
	return false, "verifyIpRange fail"
}

// func httpCall(url, token string) []byte {
// 	transCfg := &http.Transport{
// 		TLSClientConfig: &tls.Config{InsecureSkipVerify: true}, // ignore expired SSL certificates https://www.socketloop.com/tutorials/golang-disable-security-check-for-http-ssl-with-bad-or-expired-certificate
// 	}
// 	req, err := http.NewRequest("GET", url, nil)
// 	if err != nil {
// 		panic(err)
// 	}
// 	req.Header.Add("Authorization", "Bearer "+token)
// 	client := &http.Client{Transport: transCfg}
// 	resp, err := client.Do(req)
// 	if err != nil {
// 		panic(err)
// 	}
// 	defer resp.Body.Close()
// 	respBody, err := ioutil.ReadAll(resp.Body)
// 	if err != nil {
// 		log.Fatal(err)
// 	}
// 	resp.Body.Close()
// 	return respBody
// }
