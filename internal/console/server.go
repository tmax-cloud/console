package console

import (
	"console/pkg/version"
	"errors"
	"fmt"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/rs/zerolog"
	flag "github.com/spf13/pflag"
	"net/http"
	"net/url"
	"runtime"
)

const (
	indexPageTemplateName          = "index.html"
	prometheusProxyEndpoint        = "/api/prometheus"
	prometheusTenancyProxyEndpoint = "/api/prometheus-tenancy"
	alertManagerProxyEndpoint      = "/api/alertmanager"
	hyperCloudEndpoint             = "/api/hypercloud"
	ConsoleEndpoint                = "/api/console"

	customProductName  = "hypercloud"
	traefikServiceType = "LoadBalancer"

	//keycloakURL      = "https://hyperauth.hyperauth.svc/auth"
	//keycloakRealm    = "tmax"
	//keycloakClientId = "hypercloud5"

	kubeAPIServerURL = "kubernetes.default.svc"
)

type Server struct {
	BasePath  string `json:"basePath"`
	PublicDir string `json:"publicDir"`

	McMode            bool   `description:"Activate Multi-Cluster Mode" json:"mcMode" toml:"mcMode,omitempty" yaml:"mcMode,omitempty" export:"true"`
	ChatbotEmbed      bool   `description:"Activate Chatbot" json:"chatbotEmbed" toml:"chatbotEmbed,omitempty" yaml:"chatbotEmbed,omitempty" export:"true"`
	CustomProductName string `description:"Setting Custom Product Name" json:"customProductName" toml:"customProductName,omitempty" yaml:"customProductName,omitempty" export:"true"`

	SvcType string `description:"Service type of api-gateway(traefik) default: LoadBalancer" yaml:"svcType" json:"svcType" export:"true"`

	KeycloakAuthURL  string `description:"HyperAuth(keycloak) URL, format: https://hyperauth.org/auth" json:"keycloakAuthURL,omitempty" toml:"keycloakAuthURL,omitempty" yaml:"keycloakAuthURL,omitempty" export:"true"`
	KeycloakRealm    string `description:"keycloak realm name" yaml:"keycloakRealm" json:"keycloakRealm" toml:"keycloakRealm" export:"true"`
	KeycloakClientId string `description:"keycloak client id" yaml:"keycloakClientId" json:"keycloakClientId" toml:"keycloakClientId" export:"true"`

	KubeAPIServerURL string `description:"kube API URL" json:"kubeAPIServerURL" yaml:"kubeAPIServerURL" toml:"kubeAPIServerURL" export:"true"`
	KubeToken        string `json:"kubeToken"`

	logger zerolog.Logger
}

func New(fs *flag.FlagSet) *Server {
	s := &Server{}
	fs.StringVar(&s.BasePath, "base-path", "/", "url base path")
	fs.StringVar(&s.PublicDir, "public-dir", "./frontend/public/dist", "directory containing static web assets.")
	fs.BoolVar(&s.McMode, "mc-mode", true, "Activate Multi-Cluster Mode")
	fs.BoolVar(&s.ChatbotEmbed, "chatbot-embed", true, "Activate Chatbot")
	fs.StringVar(&s.CustomProductName, "custom-product-name", customProductName, "Setting Custom Product Name")
	fs.StringVar(&s.SvcType, "svc-type", traefikServiceType, "Service type of api-gateway(traefik) default: LoadBalancer")
	// TODO: ADD logic to check keycloak info
	fs.StringVar(&s.KeycloakAuthURL, "keycloak-auth-url", "", "HyperAuth(keycloak) URL, format: https://<HYERAUTH_DOMAIN_NAME>/auth")
	fs.StringVar(&s.KeycloakRealm, "keycloak-realm", "", "Hyperauth(keycloak) realm name")
	fs.StringVar(&s.KeycloakClientId, "keycloak-client-id", "", "Hyperauth(keycloak) client id")
	fs.StringVar(&s.KubeAPIServerURL, "k8s-public-endpoint", kubeAPIServerURL, "kube API URL")
	fs.StringVar(&s.KubeToken, "k8s-auth-bearer-token", "", "Kubernetes SA Token")
	return s
}

func (s *Server) ValidateConfig() error {
	if s.KeycloakAuthURL == "" || s.KeycloakRealm == "" || s.KeycloakClientId == "" {
		return errors.New("keycloakAuthURL, keycloakRealm, keycloakClientId values are required")
	}
	ur, err := url.Parse(s.KeycloakAuthURL)
	if err != nil {
		msg := fmt.Sprintf("%v", err)
		return errors.New(msg)
	}
	if ur == nil || ur.String() == "" || ur.Scheme == "" || ur.Host == "" {
		return errors.New("malformed keycloakAuthURL")
	}
	return nil
}

func (s *Server) AddLogger(logger zerolog.Logger) {
	s.logger = logger
}

func (s *Server) CreateRouter() http.Handler {
	r := chi.NewRouter()

	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Logger)
	// Basic CORS // for more ideas, see: https://developer.github.com/v3/#cross-origin-resource-sharing
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"https://*", "http://*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300, // Maximum value not ignored by any of major browsers
	}))

	index := &Index{
		BasePath:                 s.BasePath,
		ConsoleVersion:           version.Version,
		GOARCH:                   runtime.GOARCH,
		GOOS:                     runtime.GOOS,
		PrometheusBaseURL:        prometheusProxyEndpoint,
		PrometheusTenancyBaseURL: prometheusTenancyProxyEndpoint,
		AlertManagerBaseURL:      alertManagerProxyEndpoint,

		KeycloakAuthURL:   s.KeycloakAuthURL,
		KeycloakRealm:     s.KeycloakRealm,
		KeycloakClientId:  s.KeycloakClientId,
		KubeAPIServerURL:  s.KubeAPIServerURL,
		SvcType:           s.SvcType,
		McMode:            s.McMode,
		ChatbotEmbed:      s.ChatbotEmbed,
		CustomProductName: s.CustomProductName,
	}
	index.AddLogger(s.logger)
	//r.Mount(c.BasePath, http.HandlerFunc(index.indexHandler))
	r.Mount(s.BasePath, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		index.indexHandler(w, s.PublicDir)
	}))

	r.Mount(hyperCloudEndpoint, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.Error(w, "501 StatusNotFound", http.StatusNotImplemented)
	}))

	fileServer(r, singleJoiningSlash(s.BasePath, "/static"), http.Dir(s.PublicDir))

	k8sProxy := NewK8sHandlerConfig(s.KubeAPIServerURL, s.KubeToken)
	k8sProxy.AddLogger(s.logger)
	consoleProxyPath := singleJoiningSlash(s.BasePath, ConsoleEndpoint)
	r.Route(consoleProxyPath, func(r chi.Router) {
		r.Method("GET", "/apis/networking.k8s.io/*",
			http.StripPrefix(consoleProxyPath, http.HandlerFunc(k8sProxy.ConsoleProxyHandler)))
		r.Method("GET", "/api/v1/*",
			http.StripPrefix(consoleProxyPath, http.HandlerFunc(k8sProxy.ConsoleProxyHandler)))
	})

	r.Method("GET", "/metrics", promhttp.Handler())

	return r
}
