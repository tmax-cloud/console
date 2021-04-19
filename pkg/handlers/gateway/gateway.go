package gateway

import (
	"console/pkg/auth"
	"console/pkg/hypercloud/proxy"
	"net/http"
	"net/url"

	"github.com/gorilla/mux"
	"github.com/sirupsen/logrus"
)

var (
	log = logrus.New().WithField("MODULE", "GATEWAY")
)

type Gateway struct {
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

// New creates Gateway
func New() (*Gateway, error) {
	log.Info("New GATEWAY")
	return &Gateway{}, nil
}

func (g *Gateway) Router() http.Handler {
	r := mux.NewRouter()

	return r
}
