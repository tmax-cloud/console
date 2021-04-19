package server

import (
	"fmt"
	"html/template"
	"net/http"
	"net/url"
	"os"
	"path"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/justinas/alice"

	v1 "console/pkg/api/v1"
	"console/pkg/auth"
	"console/pkg/hypercloud/proxy"
	"console/pkg/version"

	"github.com/sirupsen/logrus"
)

var (
	log = logrus.New().WithField("MODULE", "SERVER")
)

const (
	indexPageTemplateName = "index.html"

	k8sProxyPath               = "/api/kubernetes/"
	prometheusProxyPath        = "/api/prometheus"
	prometheusTenancyProxyPath = "/api/prometheus-tenancy"
	alertManagerProxyPath      = "/api/alertmanager"

	grafanaProxyPath          = "/api/grafana/"
	kialiProxyPath            = "/api/kiali/"
	webhookPath               = "/api/webhook/"
	hypercloudServerPath      = "/api/hypercloud/"
	multiHypercloudServerPath = "/api/multi-hypercloud/"
	kibanaPath                = "/api/kibana/"
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
	ThanosPublicURL     string `json:"thanosPublicURL"`

	GOARCH string `json:"GOARCH"`
	GOOS   string `json:"GOOS"`

	KeycloakRealm    string `json:keycloakRealm`
	KeycloakAuthURL  string `json:keycloakAuthURL`
	KeycloakClientId string `json:keycloakClientId`

	McMode          bool `json:mcMode`
	ReleaseModeFlag bool `json:"releaseModeFlag"`
}

type Router struct {
	BaseURL    *url.URL
	PublicDir  string
	StaticUser *auth.User
	// A lister for resource listing a particular kind
	GOARCH string
	GOOS   string
	// customization
	// Branding          string
	// CustomProductName string
	// CustomLogoFile    string
	McMode          bool
	ReleaseModeFlag bool
	// Keycloak (Hyperauth) information for logging to console
	KeycloakRealm    string
	KeycloakAuthURL  string
	KeycloakClientId string
	// Proxy
	K8sProxyConfig                   *proxy.Config
	PrometheusProxyConfig            *proxy.Config
	ThanosProxyConfig                *proxy.Config
	ThanosTenancyProxyConfig         *proxy.Config
	AlertManagerProxyConfig          *proxy.Config
	GrafanaProxyConfig               *proxy.Config
	KialiProxyConfig                 *proxy.Config
	WebhookProxyConfig               *proxy.Config
	HypercloudServerProxyConfig      *proxy.Config
	MultiHypercloudServerProxyConfig *proxy.Config
	KibanaProxyConfig                *proxy.Config
}

func New(cfg *v1.Config) (*Router, error) {
	log.WithField("FILE", "routes.go").Infoln("Create Router based on *v1.Config")
	config := cfg.DeepCopy()

	return createRouter(config)

}

func (router *Router) Start() http.Handler {
	standardMiddleware := alice.New(router.recoverPanic, router.logRequest, secureHeaders, handlers.ProxyHeaders)
	tokenMiddleware := alice.New(router.tokenHandler)

	gmux := mux.NewRouter()

	handle := func(path string, handler http.Handler) {
		gmux.PathPrefix(proxy.SingleJoiningSlash(router.BaseURL.Path, path)).Handler(handler)
	}

	k8sProxy := proxy.NewProxy(router.K8sProxyConfig)
	handle(k8sProxyPath, http.StripPrefix(
		proxy.SingleJoiningSlash(router.BaseURL.Path, k8sProxyPath),
		tokenMiddleware.ThenFunc(func(w http.ResponseWriter, r *http.Request) {
			r.Header.Set("Authorization", fmt.Sprintf("Bearer %s", router.StaticUser.Token))
			k8sProxy.ServeHTTP(w, r)
		})),
	)

	if router.prometheusProxyEnabled() {
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

			prometheusProxy    = proxy.NewProxy(router.PrometheusProxyConfig)
			thanosProxy        = proxy.NewProxy(router.ThanosProxyConfig)
			thanosTenancyProxy = proxy.NewProxy(router.ThanosTenancyProxyConfig)
		)

		// global label, query, and query_range requests have to be proxied via thanos
		handle(querySourcePath, http.StripPrefix(
			proxy.SingleJoiningSlash(router.BaseURL.Path, targetAPIPath),
			tokenMiddleware.ThenFunc(func(w http.ResponseWriter, r *http.Request) {
				r.Header.Set("Authorization", fmt.Sprintf("Bearer %s", router.StaticUser.Token))
				thanosProxy.ServeHTTP(w, r)
			})),
		)
		handle(queryRangeSourcePath, http.StripPrefix(
			proxy.SingleJoiningSlash(router.BaseURL.Path, targetAPIPath),
			tokenMiddleware.ThenFunc(func(w http.ResponseWriter, r *http.Request) {
				r.Header.Set("Authorization", fmt.Sprintf("Bearer %s", router.StaticUser.Token))
				thanosProxy.ServeHTTP(w, r)
			})),
		)
		handle(labelSourcePath, http.StripPrefix(
			proxy.SingleJoiningSlash(router.BaseURL.Path, targetAPIPath),
			tokenMiddleware.ThenFunc(func(w http.ResponseWriter, r *http.Request) {
				r.Header.Set("Authorization", fmt.Sprintf("Bearer %s", router.StaticUser.Token))
				thanosProxy.ServeHTTP(w, r)
			})),
		)

		// alerting (rules) have to be proxied via cluster monitoring prometheus
		handle(rulesSourcePath, http.StripPrefix(
			proxy.SingleJoiningSlash(router.BaseURL.Path, targetAPIPath),
			tokenMiddleware.ThenFunc(func(w http.ResponseWriter, r *http.Request) {
				r.Header.Set("Authorization", fmt.Sprintf("Bearer %s", router.StaticUser.Token))
				prometheusProxy.ServeHTTP(w, r)
			})),
		)

		// tenancy queries and query ranges have to be proxied via thanos
		handle(tenancyQuerySourcePath, http.StripPrefix(
			proxy.SingleJoiningSlash(router.BaseURL.Path, tenancyTargetAPIPath),
			tokenMiddleware.ThenFunc(func(w http.ResponseWriter, r *http.Request) {
				r.Header.Set("Authorization", fmt.Sprintf("Bearer %s", router.StaticUser.Token))
				thanosTenancyProxy.ServeHTTP(w, r)
			})),
		)
		handle(tenancyQueryRangeSourcePath, http.StripPrefix(
			proxy.SingleJoiningSlash(router.BaseURL.Path, tenancyTargetAPIPath),
			tokenMiddleware.ThenFunc(func(w http.ResponseWriter, r *http.Request) {
				r.Header.Set("Authorization", fmt.Sprintf("Bearer %s", router.StaticUser.Token))
				thanosTenancyProxy.ServeHTTP(w, r)
			})),
		)
	}

	if router.alertManagerProxyEnabled() {
		alertManagerProxyAPIPath := alertManagerProxyPath + "/api/"
		alertManagerProxy := proxy.NewProxy(router.AlertManagerProxyConfig)
		handle(alertManagerProxyAPIPath, http.StripPrefix(
			proxy.SingleJoiningSlash(router.BaseURL.Path, alertManagerProxyAPIPath),
			tokenMiddleware.ThenFunc(func(w http.ResponseWriter, r *http.Request) {
				r.Header.Set("Authorization", fmt.Sprintf("Bearer %s", router.StaticUser.Token))
				alertManagerProxy.ServeHTTP(w, r)
			})),
		)
	}

	// NOTE: webhook proxy
	if router.webhookEnable() {
		webhookProxyAPIPath := webhookPath
		webhookProxy := proxy.NewProxy(router.WebhookProxyConfig)
		handle(webhookProxyAPIPath, http.StripPrefix(
			proxy.SingleJoiningSlash(router.BaseURL.Path, webhookProxyAPIPath),
			tokenMiddleware.ThenFunc(func(w http.ResponseWriter, r *http.Request) {
				r.Header.Set("Authorization", fmt.Sprintf("Bearer %s", router.StaticUser.Token))
				webhookProxy.ServeHTTP(w, r)
			})),
		)
	}

	// NOTE: hypercloudServer proxy
	if router.hypercloudServerEnable() {
		hypercloudServerProxyAPIPath := hypercloudServerPath
		hypercloudServerProxy := proxy.NewProxy(router.HypercloudServerProxyConfig)
		handle(hypercloudServerProxyAPIPath, http.StripPrefix(
			proxy.SingleJoiningSlash(router.BaseURL.Path, hypercloudServerProxyAPIPath),
			tokenMiddleware.ThenFunc(func(w http.ResponseWriter, r *http.Request) {
				r.Header.Set("Authorization", fmt.Sprintf("Bearer %s", router.StaticUser.Token))
				hypercloudServerProxy.ServeHTTP(w, r)
			})),
		)
	}

	// NOTE: multi-hypercloudServer proxy
	if router.multiHypercloudServerEnable() {
		multiHypercloudServerProxyAPIPath := multiHypercloudServerPath
		multiHypercloudServerProxy := proxy.NewProxy(router.MultiHypercloudServerProxyConfig)
		handle(multiHypercloudServerProxyAPIPath, http.StripPrefix(
			proxy.SingleJoiningSlash(router.BaseURL.Path, multiHypercloudServerProxyAPIPath),
			tokenMiddleware.ThenFunc(func(w http.ResponseWriter, r *http.Request) {
				r.Header.Set("Authorization", fmt.Sprintf("Bearer %s", router.StaticUser.Token))
				multiHypercloudServerProxy.ServeHTTP(w, r)
			})),
		)
	}

	// NOTE: grafa proxy
	if router.grafanaEnable() {
		grafanaProxyAPIPath := grafanaProxyPath
		grafanaProxy := proxy.NewProxy(router.GrafanaProxyConfig)
		handle(grafanaProxyAPIPath, http.StripPrefix(
			proxy.SingleJoiningSlash(router.BaseURL.Path, grafanaProxyAPIPath),
			tokenMiddleware.ThenFunc(func(w http.ResponseWriter, r *http.Request) {
				grafanaProxy.ServeHTTP(w, r)
			})),
		)
	}

	// NOTE: kiali proxy
	if router.kialiEnable() {
		kialiProxyAPIPath := kialiProxyPath
		kialiProxy := proxy.NewProxy(router.KialiProxyConfig)
		handle(kialiProxyAPIPath, http.StripPrefix(
			proxy.SingleJoiningSlash(router.BaseURL.Path, kialiProxyAPIPath),
			tokenMiddleware.ThenFunc(func(w http.ResponseWriter, r *http.Request) {
				kialiProxy.ServeHTTP(w, r)
			})),
		)
	}

	// NOTE: kibana proxy
	if router.kibanaEnable() {
		kibanaAPIPath := kibanaPath
		kibanaProxy := proxy.NewProxy(router.KibanaProxyConfig)
		handle(kibanaAPIPath, http.StripPrefix(
			proxy.SingleJoiningSlash(router.BaseURL.Path, kibanaAPIPath),
			tokenMiddleware.ThenFunc(func(w http.ResponseWriter, r *http.Request) {
				r.Header.Set("Authorization", fmt.Sprintf("Bearer %s", router.StaticUser.Token))
				kibanaProxy.ServeHTTP(w, r)
			})),
		)
	}
	log.Info(proxy.SingleJoiningSlash(router.BaseURL.Path, "/static/"))
	staticHandler := http.StripPrefix(proxy.SingleJoiningSlash(router.BaseURL.Path, "/static/"), http.FileServer(http.Dir(router.PublicDir)))
	handle("/static/", gzipHandler(staticHandler))

	gmux.PathPrefix(router.BaseURL.Path).HandlerFunc(router.indexHandler)

	gmux.PathPrefix("/api/").HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte("not found"))
	})

	// n := negroni.New(negroni.NewLogger())
	// n.UseHandler(gmux)
	// return securityHeadersMiddleware(http.Handler(n))
	return standardMiddleware.Then(gmux)
	// return gmux

}

func (s *Router) indexHandler(w http.ResponseWriter, r *http.Request) {
	jsg := &jsGlobals{
		ConsoleVersion:   version.Version,
		BasePath:         s.BaseURL.Path,
		KubeAPIServerURL: s.K8sProxyConfig.Endpoint.String(),

		GOARCH: s.GOARCH,
		GOOS:   s.GOOS,

		// return ekycloak info
		KeycloakRealm:    s.KeycloakRealm,
		KeycloakAuthURL:  s.KeycloakAuthURL,
		KeycloakClientId: s.KeycloakClientId,

		McMode:          s.McMode,
		ReleaseModeFlag: s.ReleaseModeFlag,
	}

	if s.prometheusProxyEnabled() {
		jsg.PrometheusBaseURL = proxy.SingleJoiningSlash(s.BaseURL.Path, prometheusProxyPath)
		jsg.PrometheusTenancyBaseURL = proxy.SingleJoiningSlash(s.BaseURL.Path, prometheusTenancyProxyPath)
	}

	if s.alertManagerProxyEnabled() {
		jsg.AlertManagerBaseURL = proxy.SingleJoiningSlash(s.BaseURL.Path, alertManagerProxyPath)
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

func (router *Router) prometheusProxyEnabled() bool {
	return router.PrometheusProxyConfig != nil && router.ThanosTenancyProxyConfig != nil
}

func (router *Router) alertManagerProxyEnabled() bool {
	return router.AlertManagerProxyConfig != nil
}

func (router *Router) grafanaEnable() bool {
	return router.GrafanaProxyConfig != nil
}

func (router *Router) kialiEnable() bool {
	return router.KialiProxyConfig != nil
}

func (router *Router) webhookEnable() bool {
	return router.WebhookProxyConfig != nil
}

func (router *Router) hypercloudServerEnable() bool {
	return router.HypercloudServerProxyConfig != nil
}

func (router *Router) multiHypercloudServerEnable() bool {
	return router.MultiHypercloudServerProxyConfig != nil
}

func (router *Router) kibanaEnable() bool {
	return router.KibanaProxyConfig != nil
}
