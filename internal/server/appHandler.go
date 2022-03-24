package server

import (
	"console/pkg/version"
	kitlog "github.com/go-kit/log"
	"html/template"
	"net/http"
	"os"
	"path"
	"runtime"
)
const (
	indexPageTemplateName = "index.html"
)

type App struct {
	BasePath         string `yaml:"basePath" json:"basePath"`
	PublicDir        string `yaml:"publicDir,omitempty" json:"publicDir"`

	ConsoleVersion string `json:"consoleVersion"`
	GOARCH         string `json:"GOARCH"`
	GOOS           string `json:"GOOS"`

	KeycloakAuthURL         string `yaml:"keycloakAuthURL" json:keycloakAuthURL`
	KeycloakRealm           string `yaml:"keycloakRealm" json:keycloakRealm`
	KeycloakClientId        string `yaml:"keycloakClientId" json:keycloakClientId`
	KeycloakUseHiddenIframe bool   `yaml:"keycloakUseHiddenIframe,omitempty" json:keycloakUseHiddenIframe`

	McMode            bool   `yaml:"mcMode,omitempty" json:"mcMode"`
	ReleaseMode       bool   `yaml:"releaseMode,omitempty" json:"releaseMode"`
	CustomProductName string `yaml:"customProductName,omitempty" json:"customProductName"`

	logger kitlog.Logger
}

func NewAppConfig() *App {
	return &App{
		ConsoleVersion: version.Version,
		GOARCH: runtime.GOARCH,
		GOOS:   runtime.GOOS,
	}
}

func (a *App) AddLogger(logger kitlog.Logger) {
	a.logger = logger
}

func (a *App) indexHandler(w http.ResponseWriter, r *http.Request)  {
	a.logger.Log("msg","create template then response the index.html")
	tpl := template.New(indexPageTemplateName)
	tpl.Delims("[[", "]]")
	tpls, err := tpl.ParseFiles(path.Join(a.PublicDir, indexPageTemplateName))
	if err != nil {
		a.logger.Log("error",err, "msg","index.html not found in configured public-dir path")
		os.Exit(1)
	}

	if err := tpls.ExecuteTemplate(w, indexPageTemplateName, a); err != nil {
		a.logger.Log("error", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}
