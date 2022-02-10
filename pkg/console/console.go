package console

import (
	"errors"
	"fmt"
	"html/template"
	"net/http"
	"net/url"
	"os"
	"path"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/justinas/alice"
	"k8s.io/client-go/discovery"
	"k8s.io/client-go/rest"
	"k8s.io/klog"

	v1 "console/pkg/api/v1"
	"console/pkg/auth"
	"console/pkg/hypercloud/proxy"
	"console/pkg/serverutils"
	"console/pkg/version"

	helmhandlerspkg "console/pkg/helm/handlers"

	"github.com/sirupsen/logrus"
)

var (
	log = logrus.New().WithField("MODULE", "CONSOLE")
)

const (
	indexPageTemplateName = "index.html"

	k8sProxyPath               = "/api/kubernetes/"
	prometheusProxyPath        = "/api/prometheus"
	prometheusTenancyProxyPath = "/api/prometheus-tenancy"
	alertManagerProxyPath      = "/api/alertmanager"

	grafanaProxyPath          = "/api/grafana/"
	kialiProxyPath            = "/api/kiali"
	webhookPath               = "/api/webhook/"
	hypercloudServerPath      = "/api/hypercloud/"
	multiHypercloudServerPath = "/api/multi-hypercloud/"
	kibanaPath                = "/api/kibana/"
	kubeflowPath              = "/api/kubeflow/"

	consolePath = "/api/console"
)

type jsGlobals struct {
	ConsoleVersion string `json:"consoleVersion"`
	BasePath       string `json:"basePath"`

	KubeAPIServerURL         string `json:"kubeAPIServerURL"`
	PrometheusBaseURL        string `json:"prometheusBaseURL"`
	PrometheusTenancyBaseURL string `json:"prometheusTenancyBaseURL"`
	AlertManagerBaseURL      string `json:"alertManagerBaseURL"`

	GrafanaPublicURL    string `json:"grafanaPublicURL"`
	PrometheusPublicURL string `json:"prometheusPublicURL"`
	GitlabURL           string `json:"gitlabURL"`

	GOARCH string `json:"GOARCH"`
	GOOS   string `json:"GOOS"`

	KeycloakRealm           string `json:keycloakRealm`
	KeycloakAuthURL         string `json:keycloakAuthURL`
	KeycloakClientId        string `json:keycloakClientId`
	KeycloakUseHiddenIframe bool   `json:keycloakUseHiddenIframe`

	McMode            bool   `json:mcMode`
	ReleaseModeFlag   bool   `json:"releaseModeFlag"`
	CustomProductName string `json:"customProductName"`
}

type Console struct {
	BaseURL    *url.URL
	PublicDir  string
	StaticUser *auth.User
	// A lister for resource listing a particular kind
	GOARCH      string
	GOOS        string
	KubeVersion string
	// customization
	McMode            bool
	ReleaseModeFlag   bool
	GitlabURL         string
	CustomProductName string
	// Keycloak (Hyperauth) information for logging to console
	KeycloakRealm           string
	KeycloakAuthURL         string
	KeycloakClientId        string
	KeycloakUseHiddenIframe bool
	// Proxy
	// A client with the correct TLS setup for communicating with the API server.
	K8sProxyConfig                   *proxy.Config
	K8sClient                        *http.Client
	PrometheusProxyConfig            *proxy.Config
	AlertManagerProxyConfig          *proxy.Config
	GrafanaProxyConfig               *proxy.Config
	KialiProxyConfig                 *proxy.Config
	WebhookProxyConfig               *proxy.Config
	HypercloudServerProxyConfig      *proxy.Config
	MultiHypercloudServerProxyConfig *proxy.Config
	KibanaProxyConfig                *proxy.Config
	KubeflowProxyConfig              *proxy.Config
}

func New(cfg *v1.Config) (*Console, error) {
	log.WithField("FILE", "routes.go").Infoln("Create Router based on *v1.Config")
	config := cfg.DeepCopy()

	return createConsole(config)
}

// Gateway is API gateway like reverse proxy server related in k8s, Prometheus, Grafana, and hypercloud-operator
func (c *Console) Gateway() http.Handler {
	// standardMiddleware := alice.New(c.RecoverPanic, c.LogRequest, c.JwtHandler, handlers.ProxyHeaders)
	// standardMiddleware := alice.New(c.RecoverPanic, c.LogRequest, handlers.ProxyHeaders)
	// tokenMiddleware := alice.New(c.jwtHandler, c.tokenHandler) // jwt validation handler + token handler
	tokenMiddleware := alice.New(c.TokenHandler) // select token depending on release-mode
	r := mux.NewRouter()

	handle := func(path string, handler http.Handler) {
		r.PathPrefix(proxy.SingleJoiningSlash(c.BaseURL.Path, path)).Handler(handler)
	}
	k8sProxy := proxy.NewProxy(c.K8sProxyConfig)
	handle(k8sProxyPath, http.StripPrefix(
		proxy.SingleJoiningSlash(c.BaseURL.Path, k8sProxyPath),
		tokenMiddleware.ThenFunc(func(w http.ResponseWriter, r *http.Request) {
			r.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.StaticUser.Token))
			k8sProxy.ServeHTTP(w, r)
		})),
	)
	// handle(consolePath, http.StripPrefix(
	// 	proxy.SingleJoiningSlash(c.BaseURL.Path, consolePath),
	// 	tokenMiddleware.ThenFunc(func(w http.ResponseWriter, r *http.Request) {
	// 		r.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.StaticUser.Token))
	// 		k8sProxy.ServeHTTP(w, r)
	// 	})),
	// )
	r.Methods("GET").PathPrefix(consolePath + "/apis/networking.k8s.io/").Handler(http.StripPrefix(consolePath,
		http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			log.Info("CHECK TOKEN: ", c.StaticUser.Token)
			r.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.StaticUser.Token))
			k8sProxy.ServeHTTP(w, r)
		})))

	if c.PrometheusProxyConfig != nil {
		// Only proxy requests to the Prometheus API, not the UI.
		var (
			labelSourcePath      = prometheusProxyPath + "/api/v1/label/"
			rulesSourcePath      = prometheusProxyPath + "/api/v1/rules"
			querySourcePath      = prometheusProxyPath + "/api/v1/query"
			queryRangeSourcePath = prometheusProxyPath + "/api/v1/query_range"
			targetAPIPath        = prometheusProxyPath + "/api/"

			tenancyQuerySourcePath      = prometheusTenancyProxyPath + "/api/v1/query"
			tenancyQueryRangeSourcePath = prometheusTenancyProxyPath + "/api/v1/query_range"
			tenancyTargetAPIPath        = prometheusTenancyProxyPath + "/api/"

			prometheusProxy = proxy.NewProxy(c.PrometheusProxyConfig)
			// hypercloud has not installed Thanos until now, so we use promethues proxy config instead thanos
			thanosProxy        = proxy.NewProxy(c.PrometheusProxyConfig)
			thanosTenancyProxy = proxy.NewProxy(c.PrometheusProxyConfig)
		)

		// global label, query, and query_range requests have to be proxied via thanos
		handle(querySourcePath, http.StripPrefix(
			proxy.SingleJoiningSlash(c.BaseURL.Path, targetAPIPath),
			tokenMiddleware.ThenFunc(func(w http.ResponseWriter, r *http.Request) {
				r.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.StaticUser.Token))
				thanosProxy.ServeHTTP(w, r)
			})),
		)
		handle(queryRangeSourcePath, http.StripPrefix(
			proxy.SingleJoiningSlash(c.BaseURL.Path, targetAPIPath),
			tokenMiddleware.ThenFunc(func(w http.ResponseWriter, r *http.Request) {
				r.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.StaticUser.Token))
				thanosProxy.ServeHTTP(w, r)
			})),
		)
		handle(labelSourcePath, http.StripPrefix(
			proxy.SingleJoiningSlash(c.BaseURL.Path, targetAPIPath),
			tokenMiddleware.ThenFunc(func(w http.ResponseWriter, r *http.Request) {
				r.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.StaticUser.Token))
				thanosProxy.ServeHTTP(w, r)
			})),
		)

		// alerting (rules) have to be proxied via cluster monitoring prometheus
		handle(rulesSourcePath, http.StripPrefix(
			proxy.SingleJoiningSlash(c.BaseURL.Path, targetAPIPath),
			tokenMiddleware.ThenFunc(func(w http.ResponseWriter, r *http.Request) {
				r.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.StaticUser.Token))
				prometheusProxy.ServeHTTP(w, r)
			})),
		)

		// tenancy queries and query ranges have to be proxied via thanos
		handle(tenancyQuerySourcePath, http.StripPrefix(
			proxy.SingleJoiningSlash(c.BaseURL.Path, tenancyTargetAPIPath),
			tokenMiddleware.ThenFunc(func(w http.ResponseWriter, r *http.Request) {
				r.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.StaticUser.Token))
				thanosTenancyProxy.ServeHTTP(w, r)
			})),
		)
		handle(tenancyQueryRangeSourcePath, http.StripPrefix(
			proxy.SingleJoiningSlash(c.BaseURL.Path, tenancyTargetAPIPath),
			tokenMiddleware.ThenFunc(func(w http.ResponseWriter, r *http.Request) {
				r.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.StaticUser.Token))
				thanosTenancyProxy.ServeHTTP(w, r)
			})),
		)
	}
	if c.AlertManagerProxyConfig != nil {
		alertManagerProxyAPIPath := alertManagerProxyPath + "/api/"
		alertManagerProxy := proxy.NewProxy(c.AlertManagerProxyConfig)
		handle(alertManagerProxyAPIPath, http.StripPrefix(
			proxy.SingleJoiningSlash(c.BaseURL.Path, alertManagerProxyAPIPath),
			tokenMiddleware.ThenFunc(func(w http.ResponseWriter, r *http.Request) {
				r.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.StaticUser.Token))
				alertManagerProxy.ServeHTTP(w, r)
			})),
		)
	}
	// NOTE: webhook proxy
	if c.WebhookProxyConfig != nil {
		webhookProxyAPIPath := webhookPath
		webhookProxy := proxy.NewProxy(c.WebhookProxyConfig)
		handle(webhookProxyAPIPath, http.StripPrefix(
			proxy.SingleJoiningSlash(c.BaseURL.Path, webhookProxyAPIPath),
			tokenMiddleware.ThenFunc(func(w http.ResponseWriter, r *http.Request) {
				r.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.StaticUser.Token))
				webhookProxy.ServeHTTP(w, r)
			})),
		)
	}
	// NOTE: hypercloudServer proxy
	if c.HypercloudServerProxyConfig != nil {
		hypercloudServerProxyAPIPath := hypercloudServerPath
		hypercloudServerProxy := proxy.NewProxy(c.HypercloudServerProxyConfig)
		handle(hypercloudServerProxyAPIPath, http.StripPrefix(
			proxy.SingleJoiningSlash(c.BaseURL.Path, hypercloudServerProxyAPIPath),
			tokenMiddleware.ThenFunc(func(w http.ResponseWriter, r *http.Request) {
				r.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.StaticUser.Token))
				hypercloudServerProxy.ServeHTTP(w, r)
			})),
		)
	}
	// NOTE: multi-hypercloudServer proxy
	if c.MultiHypercloudServerProxyConfig != nil {
		multiHypercloudServerProxyAPIPath := multiHypercloudServerPath
		multiHypercloudServerProxy := proxy.NewProxy(c.MultiHypercloudServerProxyConfig)
		handle(multiHypercloudServerProxyAPIPath, http.StripPrefix(
			proxy.SingleJoiningSlash(c.BaseURL.Path, multiHypercloudServerProxyAPIPath),
			tokenMiddleware.ThenFunc(func(w http.ResponseWriter, r *http.Request) {
				r.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.StaticUser.Token))
				multiHypercloudServerProxy.ServeHTTP(w, r)
			})),
		)
	}
	// NOTE: grafa proxy
	if c.GrafanaProxyConfig != nil {
		grafanaProxyAPIPath := grafanaProxyPath
		grafanaProxy := proxy.NewProxy(c.GrafanaProxyConfig)
		handle(grafanaProxyAPIPath, http.StripPrefix(
			proxy.SingleJoiningSlash(c.BaseURL.Path, grafanaProxyAPIPath),
			tokenMiddleware.ThenFunc(func(w http.ResponseWriter, r *http.Request) {
				grafanaProxy.ServeHTTP(w, r)
			})),
		)
	}
	// NOTE: kiali proxy
	if c.KialiProxyConfig != nil {
		kialiProxyAPIPath := kialiProxyPath
		kialiProxy := proxy.NewProxy(c.KialiProxyConfig)
		handle(kialiProxyAPIPath, http.StripPrefix(
			proxy.SingleJoiningSlash(c.BaseURL.Path, kialiProxyAPIPath),
			http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				kialiProxy.ServeHTTP(w, r)
			})),
		// tokenMiddleware.ThenFunc(func(w http.ResponseWriter, r *http.Request) {
		// 	kialiProxy.ServeHTTP(w, r)
		// })),
		)
	}
	// NOTE: kibana proxy
	if c.KibanaProxyConfig != nil {
		kibanaAPIPath := kibanaPath
		kibanaProxy := proxy.NewProxy(c.KibanaProxyConfig)
		handle(kibanaAPIPath, http.StripPrefix(
			proxy.SingleJoiningSlash(c.BaseURL.Path, kibanaAPIPath),
			tokenMiddleware.ThenFunc(func(w http.ResponseWriter, r *http.Request) {
				r.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.StaticUser.Token))
				kibanaProxy.ServeHTTP(w, r)
			})),
		)
	}
	// Kubeflow proxy
	if c.KubeflowProxyConfig != nil {
		kubeflowAPIPath := kubeflowPath
		kubeflowProxy := proxy.NewProxy(c.KubeflowProxyConfig)
		handle(kubeflowAPIPath, http.StripPrefix(
			proxy.SingleJoiningSlash(c.BaseURL.Path, kubeflowAPIPath),
			tokenMiddleware.ThenFunc(func(w http.ResponseWriter, r *http.Request) {
				kubeflowProxy.ServeHTTP(w, r)
			})),
		)
	}
	staticHandler := http.StripPrefix(proxy.SingleJoiningSlash(c.BaseURL.Path, "/static/"), http.FileServer(http.Dir(c.PublicDir)))
	handle("/static/", gzipHandler(staticHandler))
	k8sApiHandler := http.StripPrefix(proxy.SingleJoiningSlash(c.BaseURL.Path, "/api/resource/"), http.FileServer(http.Dir("./api")))
	handle("/api/resource/", gzipHandler(securityHeadersMiddleware(k8sApiHandler)))

	// Helm
	// fmt.Println(c.GetKubeVersion())
	// fmt.Println(c.KubeVersion)
	// c.KubeVersion = "v1.19.4"
	// fmt.Println(c.KubeVersion)
	helmHandlers := helmhandlerspkg.New(c.K8sProxyConfig.Endpoint.String(), c.K8sClient.Transport, c)
	// tlsClient := &http.Client{
	// 	Transport: &http.Transport{
	// 		TLSClientConfig: &tls.Config{
	// 			InsecureSkipVerify: true,
	// 		},
	// 		// TLSClientConfig: k8sProxyConfig.TLSClientConfig,
	// 	},
	// }
	// helmHandlers := helmhandlerspkg.New("https://k8s-at-home.com/", tlsClient.Transport, c)
	// Helm Endpoints
	handle("/api/helm/template", tokenMiddleware.ThenFunc(func(w http.ResponseWriter, r *http.Request) {
		r.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.StaticUser.Token))
		helmHandlers.HandleHelmRenderManifests(c.StaticUser, w, r)
	}))
	handle("/api/helm/releases", tokenMiddleware.ThenFunc(func(w http.ResponseWriter, r *http.Request) {
		r.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.StaticUser.Token))
		helmHandlers.HandleHelmList(c.StaticUser, w, r)
	}))
	handle("/api/helm/chart", tokenMiddleware.ThenFunc(func(w http.ResponseWriter, r *http.Request) {
		r.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.StaticUser.Token))
		helmHandlers.HandleChartGet(c.StaticUser, w, r)
	}))
	handle("/api/helm/release/history", tokenMiddleware.ThenFunc(func(w http.ResponseWriter, r *http.Request) {
		r.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.StaticUser.Token))
		helmHandlers.HandleGetReleaseHistory(c.StaticUser, w, r)
	}))
	handle("/api/helm/charts/index.yaml", tokenMiddleware.ThenFunc(func(w http.ResponseWriter, r *http.Request) {
		r.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.StaticUser.Token))
		helmHandlers.HandleIndexFile(c.StaticUser, w, r)
	}))

	handle("/api/helm/release", tokenMiddleware.ThenFunc(func(w http.ResponseWriter, r *http.Request) {

		r.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.StaticUser.Token))
		switch r.Method {
		case http.MethodGet:
			helmHandlers.HandleGetRelease(c.StaticUser, w, r)
		case http.MethodPost:
			helmHandlers.HandleHelmInstall(c.StaticUser, w, r)
		case http.MethodDelete:
			helmHandlers.HandleUninstallRelease(c.StaticUser, w, r)
		case http.MethodPatch:
			helmHandlers.HandleRollbackRelease(c.StaticUser, w, r)
		case http.MethodPut:
			helmHandlers.HandleUpgradeRelease(c.StaticUser, w, r)
		default:
			w.Header().Set("Allow", "GET, POST, PATCH, PUT, DELETE")
			serverutils.SendResponse(w, http.StatusMethodNotAllowed, serverutils.ApiError{Err: "Unsupported method, supported methods are GET, POST, PATCH, PUT, DELETE"})
		}
	}))

	r.PathPrefix(c.BaseURL.Path).HandlerFunc(c.indexHandler)
	r.PathPrefix("/api/").HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNotFound)
		fmt.Fprintln(w, "not found")
	})

	return r
}

// Server is server only serving static asset & jsconfig
func (c *Console) Server() http.Handler {
	standardMiddleware := alice.New(c.RecoverPanic, c.LogRequest, handlers.ProxyHeaders)
	tokenMiddleware := alice.New(c.TokenHandler) // select token depending on release-mode
	r := mux.NewRouter()

	staticHandler := http.StripPrefix(proxy.SingleJoiningSlash(c.BaseURL.Path, "/static/"), http.FileServer(http.Dir(c.PublicDir)))
	r.PathPrefix(proxy.SingleJoiningSlash(c.BaseURL.Path, "/static/")).Handler(gzipHandler(staticHandler))
	k8sApiHandler := http.StripPrefix(proxy.SingleJoiningSlash(c.BaseURL.Path, "/api/resource/"), http.FileServer(http.Dir("./api")))
	r.PathPrefix(proxy.SingleJoiningSlash(c.BaseURL.Path, "/api/resource/")).Handler(gzipHandler(securityHeadersMiddleware(k8sApiHandler)))

	k8sProxy := proxy.NewProxy(c.K8sProxyConfig)
	k8sProxyHandler := http.StripPrefix(proxy.SingleJoiningSlash(c.BaseURL.Path, k8sProxyPath), tokenMiddleware.ThenFunc(func(rw http.ResponseWriter, r *http.Request) {
		r.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.StaticUser.Token))
		k8sProxy.ServeHTTP(rw, r)
	}))
	r.PathPrefix(proxy.SingleJoiningSlash(c.BaseURL.Path, k8sProxyPath)).Handler(k8sProxyHandler)

	r.Methods("GET").PathPrefix(consolePath + "/apis/networking.k8s.io/").Handler(http.StripPrefix(consolePath,
		http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			log.Info("Use default serviceaccount token")
			r.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.StaticUser.Token))
			k8sProxy.ServeHTTP(w, r)
		})))

	r.Methods("GET").PathPrefix(consolePath + "/apis/v1/").Handler(http.StripPrefix(consolePath,
		http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			log.Info("Use default serviceaccount token")
			r.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.StaticUser.Token))
			k8sProxy.ServeHTTP(w, r)
		})))

	r.PathPrefix(c.BaseURL.Path).HandlerFunc(c.indexHandler)

	r.PathPrefix("/api/").HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNotFound)
		fmt.Fprintln(w, "not found")
	})
	return standardMiddleware.Then(r)
}

func (c *Console) Dashboard() http.Handler {
	r := mux.NewRouter()
	return r
}

func (c *Console) indexHandler(w http.ResponseWriter, r *http.Request) {
	jsg := &jsGlobals{
		ConsoleVersion:   version.Version,
		BasePath:         c.BaseURL.Path,
		KubeAPIServerURL: c.K8sProxyConfig.Endpoint.String(),

		GOARCH: c.GOARCH,
		GOOS:   c.GOOS,

		// return ekycloak info
		KeycloakRealm:           c.KeycloakRealm,
		KeycloakAuthURL:         c.KeycloakAuthURL,
		KeycloakClientId:        c.KeycloakClientId,
		KeycloakUseHiddenIframe: c.KeycloakUseHiddenIframe,

		GitlabURL:         c.GitlabURL,
		McMode:            c.McMode,
		ReleaseModeFlag:   c.ReleaseModeFlag,
		CustomProductName: c.CustomProductName,
	}
	if c.PrometheusProxyConfig != nil {
		jsg.PrometheusBaseURL = proxy.SingleJoiningSlash(c.BaseURL.Path, prometheusProxyPath)
		jsg.PrometheusTenancyBaseURL = proxy.SingleJoiningSlash(c.BaseURL.Path, prometheusTenancyProxyPath)
	}

	if c.AlertManagerProxyConfig != nil {
		jsg.AlertManagerBaseURL = proxy.SingleJoiningSlash(c.BaseURL.Path, alertManagerProxyPath)
	}

	tpl := template.New(indexPageTemplateName)
	tpl.Delims("[[", "]]")
	tpls, err := tpl.ParseFiles(path.Join(c.PublicDir, indexPageTemplateName))
	if err != nil {
		fmt.Printf("index.html not found in configured public-dir path: %v", err)
		os.Exit(1)
	}

	if err := tpls.ExecuteTemplate(w, indexPageTemplateName, jsg); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func (c *Console) GetKubeVersion() string {
	if c.KubeVersion != "" {
		return c.KubeVersion
	}
	config := &rest.Config{
		Host:      c.K8sProxyConfig.Endpoint.String(),
		Transport: c.K8sClient.Transport,
	}
	kubeVersion, err := kubeVersion(config)
	if err != nil {
		kubeVersion = ""
		klog.Warningf("Failed to get cluster k8s version from api server %s", err.Error())
	}
	c.KubeVersion = kubeVersion
	return c.KubeVersion
}

func kubeVersion(config *rest.Config) (string, error) {
	client, err := discovery.NewDiscoveryClientForConfig(config)
	if err != nil {
		return "", err
	}

	kubeVersion, err := client.ServerVersion()
	if err != nil {
		return "", err
	}

	if kubeVersion != nil {
		return kubeVersion.String(), nil
	}
	return "", errors.New("failed to get kubernetes version")
}

// func (c *Console) IngressHandler(w http.ResponseWriter, r *http.Request) {
// 	res := c.getIngress()
// 	w.Write([]byte(res))
// }

// func (c *Console) getIngress() string {
// 	config := &rest.Config{
// 		Host:        c.K8sProxyConfig.Endpoint.String(),
// 		Transport:   c.K8sClient.Transport,
// 		BearerToken: c.StaticUser.Token,
// 	}
// 	clientset, err := kubernetes.NewForConfig(config)
// 	if err != nil {
// 		fmt.Printf("%+v", err.Error())
// 	}
// 	ingresses, err := clientset.NetworkingV1().Ingresses("").List(context.TODO(), metav1.ListOptions{
// 		// LabelSelector: "kubernetes.io=test",
// 		// ,metav1.LabelSelector,
// 	})
// 	if err != nil {
// 		fmt.Printf("%+v", err.Error())
// 		fmt.Println(c.StaticUser.Token)
// 	}
// 	return ingresses.Items[0].Status.String()
// }
