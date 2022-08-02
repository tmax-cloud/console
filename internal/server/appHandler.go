package server

import (
	"console/pkg/version"
	"github.com/rs/zerolog"
	"html/template"
	"net/http"
	"os"
	"path"
	"runtime"
)

const (
	indexPageTemplateName            = "index.html"
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

	logger zerolog.Logger
}

func NewAppConfig() *App {
	return &App{
		ConsoleVersion:           version.Version,
		GOARCH:                   runtime.GOARCH,
		GOOS:                     runtime.GOOS,
		PrometheusBaseURL:        prometheusProxyEndpoint,
		PrometheusTenancyBaseURL: prometheusTenancyProxyEndpoint,
		AlertManagerBaseURL:      alertManagerProxyEndpoint,
	}
}

func (a *App) AddLogger(logger zerolog.Logger) {
	a.logger = logger
}

func (a *App) indexHandler(w http.ResponseWriter, r *http.Request) {
	a.logger.Debug().Msg("create template then response the index.html")
	//a.logger.Log("msg", "create template then response the index.html")
	tpl := template.New(indexPageTemplateName)
	tpl.Delims("[[", "]]")
	tpls, err := tpl.ParseFiles(path.Join(a.PublicDir, indexPageTemplateName))
	if err != nil {
		a.logger.Error().AnErr("error", err).Msg("index.html not found in configured public-dir path")
		http.Error(w, err.Error(), http.StatusInternalServerError)
		os.Exit(1)
	}

	if err := tpls.ExecuteTemplate(w, indexPageTemplateName, a); err != nil {
		a.logger.Error().AnErr("error", err).Msg("failed to execute template")
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}
