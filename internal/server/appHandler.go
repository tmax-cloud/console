package server

import (
	"console/pkg/version"
	"html/template"
	"net/http"
	"os"
	"path"
	"runtime"

	kitlog "github.com/go-kit/log"
)

const (
	indexPageTemplateName = "index.html"
	prometheusProxyEndpoint          = "/api/prometheus"
	prometheusTenancyProxyEndpoint   = "/api/prometheus-tenancy"
	alertManagerProxyEndpoint        = "/api/alertmanager"
	alertManagerTenancyProxyEndpoint = "/api/alertmanager-tenancy"	
)

type App struct {
	BasePath  string `yaml:"basePath" json:"basePath"`
	PublicDir string `yaml:"publicDir,omitempty" json:"publicDir"`

	ConsoleVersion string `json:"consoleVersion"`
	GOARCH         string `json:"GOARCH"`
	GOOS           string `json:"GOOS"`

	KeycloakAuthURL         string `yaml:"keycloakAuthURL" json:keycloakAuthURL`
	KeycloakRealm           string `yaml:"keycloakRealm" json:keycloakRealm`
	KeycloakClientId        string `yaml:"keycloakClientId" json:keycloakClientId`
	KeycloakUseHiddenIframe bool   `yaml:"keycloakUseHiddenIframe,omitempty" json:keycloakUseHiddenIframe`

	McMode            bool   `yaml:"mcMode,omitempty" json:"mcMode"`
	ChatbotEmbed      bool   `yaml:"chatbotEmbed,omitempty" json:"chatbotEmbed"`
	ReleaseMode       bool   `yaml:"releaseMode,omitempty" json:"releaseMode"`
	CustomProductName string `yaml:"customProductName,omitempty" json:"customProductName"`

	PrometheusBaseURL        string `json:"prometheusBaseURL"`
	PrometheusTenancyBaseURL string `json:"prometheusTenancyBaseURL"`
	AlertManagerBaseURL      string `json:"alertManagerBaseURL"`
	
	logger kitlog.Logger
}

func NewAppConfig() *App {
	return &App{
		ConsoleVersion: version.Version,
		GOARCH:         runtime.GOARCH,
		GOOS:           runtime.GOOS,
		PrometheusBaseURL: prometheusProxyPath,
		PrometheusTenancyBaseURL: prometheusTenancyProxyPath,
		AlertManagerBaseURL: alertManagerProxyPath,
	}
}

func (a *App) AddLogger(logger kitlog.Logger) {
	a.logger = logger
}

func (a *App) indexHandler(w http.ResponseWriter, r *http.Request) {
	a.logger.Log("msg", "create template then response the index.html")
	tpl := template.New(indexPageTemplateName)
	tpl.Delims("[[", "]]")
	tpls, err := tpl.ParseFiles(path.Join(a.PublicDir, indexPageTemplateName))
	if err != nil {
		a.logger.Log("error", err, "msg", "index.html not found in configured public-dir path")
		os.Exit(1)
	}

	if err := tpls.ExecuteTemplate(w, indexPageTemplateName, a); err != nil {
		a.logger.Log("error", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}
