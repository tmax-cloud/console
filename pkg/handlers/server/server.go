package server

import (
	"console/pkg/version"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"path"
	"text/template"

	"github.com/gorilla/mux"
	"github.com/sirupsen/logrus"
)

var (
	log = logrus.New().WithField("MODULE", "SERVER")
)

const (
	indexPageTemplateName = "index.html"
)

type Server struct {
	BaseURL   *url.URL
	PublicDir string
	// A lister for resource listing a particular kind
	GOARCH string
	GOOS   string

	McMode          bool
	ReleaseModeFlag bool
	// Keycloak (Hyperauth) information for logging to console
	KeycloakRealm           string
	KeycloakAuthURL         string
	KeycloakClientId        string
	KeycloakUseHiddenIframe bool `json:"keycloakUseHiddenIframe"`
}

type ProxyURL struct {
	// Proxy
	K8sProxyConfig                   *url.URL
	PrometheusProxyConfig            *url.URL
	ThanosProxyConfig                *url.URL
	ThanosTenancyProxyConfig         *url.URL
	AlertManagerProxyConfig          *url.URL
	GrafanaProxyConfig               *url.URL
	KialiProxyConfig                 *url.URL
	WebhookProxyConfig               *url.URL
	HypercloudServerProxyConfig      *url.URL
	MultiHypercloudServerProxyConfig *url.URL
	KibanaProxyConfig                *url.URL
}

func New() (*Server, error) {
	log.WithField("FILE", "server.go").Infoln("CREATE SERVER")
	s := &Server{}
	return s, nil
}

func (s *Server) Start() http.Handler {
	r := mux.NewRouter()
	r.PathPrefix("/").HandlerFunc(s.indexHandler)

	return r
}

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
	GitlabURL           string `json:"gitlabURL"`

	GOARCH string `json:"GOARCH"`
	GOOS   string `json:"GOOS"`

	KeycloakRealm    string `json:"keycloakRealm"`
	KeycloakAuthURL  string `json:"keycloakAuthURL"`
	KeycloakClientId string `json:"keycloakClientId"`

	McMode          bool `json:"mcMode"`
	ReleaseModeFlag bool `json:"releaseModeFlag"`
}

func (s *Server) indexHandler(w http.ResponseWriter, r *http.Request) {
	jsg := &jsGlobals{
		ConsoleVersion:   version.Version,
		BasePath:         s.BaseURL.Path,
		KubeAPIServerURL: s.BaseURL.String(),

		GOARCH: s.GOARCH,
		GOOS:   s.GOOS,

		// return ekycloak info
		KeycloakRealm:    s.KeycloakRealm,
		KeycloakAuthURL:  s.KeycloakAuthURL,
		KeycloakClientId: s.KeycloakClientId,

		McMode:          s.McMode,
		ReleaseModeFlag: s.ReleaseModeFlag,
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
