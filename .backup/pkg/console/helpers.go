package console

import (
	"compress/gzip"
	v1 "console/pkg/api/v1"
	"console/pkg/auth"
	"console/pkg/hypercloud/proxy"
	"crypto/tls"
	"crypto/x509"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"net/url"
	"runtime"
	"strings"

	oscrypto "github.com/openshift/library-go/pkg/crypto"
	// "github.com/openshift/library-go/pkg/crypto"
)

const (
	k8sInClusterCA          = "/var/run/secrets/kubernetes.io/serviceaccount/ca.crt"
	k8sInClusterBearerToken = "/var/run/secrets/kubernetes.io/serviceaccount/token"
	K8sEndpoint             = "https://kubernetes.default.svc"

	// Well-known location of the cluster monitoring (not user workload monitoring) Prometheus service for hypercloud.
	// This is only accessible in-cluster. This is used for non-tenant global (alerting) rules requests.
	hypercloudPrometheusEndpoint = "http://prometheus-k8s.monitoring.svc:9090/api"
	// Well-known location of the tenant aware Thanos service for hypercloud. This is only accessible in-cluster.
	// Thanos proxies requests to both cluster monitoring and user workload monitoring prometheus instances.
	// hypercloudThanosTenancyEndpoint = "http://prometheus-k8s.monitoring.svc:9090/api"
	// Well-known location of the Thanos service for hypercloud. This is only accessible in-cluster.
	// This is used for non-tenant global query requests
	// proxying to both cluster monitoring and user workload monitoring prometheus instances.
	// hypercloudThanosEndpoint = "http://prometheus-k8s.monitoring.svc:9090/api"
	// hypercloudThanosEndpoint = ""
	// Well-known location of Alert Manager service for hypercloud. This is only accessible in-cluster.
	hypercloudAlertManagerEndpoint = "http://alertmanager-main.monitoring.svc:9093/api"

	// Well-known location of hypercloud-server for hypercloud. This is only accessible in-clsuter.
	hypercloudServerEndpoint = "https://hypercloud5-api-server-service.hypercloud5-system.svc"

	// Well-known location of hypercloud-server for hypercloud. This is only accessible in-clsuter. // http port : 80 don't require
	multiHypercloudServerEndpoint = "https://hypercloud5-api-server-service.hypercloud5-system.svc"

	// webhook for hypercloud. This is only accessible in-clsuter
	webhookServerEndpoint = "https://hypercloud5-api-server-service.hypercloud5-system.svc"

	// Well-known location of garafana for hypercloud
	grafanaEndpoint = "http://grafana.monitoring.svc:3000/api/grafana/"
	// Well-known location of kibana for hypercloud
	kibanaEndpoint = "http://kibana.kube-logging.svc.cluster.local:5601/api/kibana/"
	// Well-known location of kubeflow for hypercloud
	kubeflowEndpoint = "http://istio-ingressgateway.istio-system.svc/api/kubeflow/"
)

func createConsole(config *v1.Config) (*Console, error) {
	baseURL := &url.URL{}
	if config.BaseAddress != "" {
		baseURL = validateURL("base-address", config.BaseAddress)
	}
	baseURL.Path = config.BasePath
	if config.PublicDir == "" {
		config.PublicDir = "./frontend/public/dist"
	}

	// Proxy Setting
	var (
		k8sAuthServiceAccountBearerToken string
		k8sURL                           *url.URL
	)

	k8sProxyConfig := &proxy.Config{}
	k8sClient := &http.Client{}
	// Console In Cluster
	if config.K8sEndpoint == "" || config.K8sEndpoint == K8sEndpoint {
		k8sCertPEM, err := ioutil.ReadFile(k8sInClusterCA)
		if err != nil {
			log.Fatalf("Error inferring Kubernetes config from environment: %v", err)
		}
		rootCAs := x509.NewCertPool()
		if !rootCAs.AppendCertsFromPEM(k8sCertPEM) {
			log.Fatalf("No CA found for the API server")
		}
		tlsConfig := oscrypto.SecureTLSConfig(&tls.Config{
			RootCAs: rootCAs,
		})
		bearerToken, err := ioutil.ReadFile(k8sInClusterBearerToken)
		k8sAuthServiceAccountBearerToken = string(bearerToken)
		if err != nil {
			log.Fatalf("failed to read bearer token: %v", err)
		}
		k8sURL = validateURL("k8sEndpoint", K8sEndpoint)
		k8sProxyConfig = &proxy.Config{
			TLSClientConfig: tlsConfig,
			HeaderBlacklist: []string{"Cookie", "X-CSRFToken"},
			Endpoint:        k8sURL,
			Origin:          "http://localhost",
		}
		k8sClient = &http.Client{
			Transport: &http.Transport{
				TLSClientConfig: k8sProxyConfig.TLSClientConfig,
			},
		}
		// Console Off Cluster
	} else {
		k8sAuthServiceAccountBearerToken = config.ClusterInfo.BearerToken
		k8sURL = validateURL("k8sEndpoint", config.K8sEndpoint)
		k8sProxyConfig = &proxy.Config{
			HeaderBlacklist: []string{"Cookie", "X-CSRFToken"},
			TLSClientConfig: oscrypto.SecureTLSConfig(&tls.Config{
				InsecureSkipVerify: true,
			}),
			Endpoint: k8sURL,
			Origin:   "http://localhost",
		}
		k8sClient = &http.Client{
			Transport: &http.Transport{
				TLSClientConfig: k8sProxyConfig.TLSClientConfig,
			},
		}
	}

	if config.PrometheusEndpoint == "" {
		config.PrometheusEndpoint = hypercloudPrometheusEndpoint
	}
	if config.AlertmanagerEndpoint == "" {
		config.AlertmanagerEndpoint = hypercloudAlertManagerEndpoint
	}
	if config.HypercloudEndpoint == "" {
		config.HypercloudEndpoint = hypercloudServerEndpoint
	}
	if config.MultiHypercloudEndpoint == "" {
		config.MultiHypercloudEndpoint = multiHypercloudServerEndpoint
	}
	if config.WebhookEndpoint == "" {
		config.WebhookEndpoint = webhookServerEndpoint
	}
	if config.GrafanaEndpoint == "" {
		config.GrafanaEndpoint = grafanaEndpoint
	}
	if config.KialiEndpoint == "" {
		config.KialiEndpoint = "https://0.0.0.0/api/kiali"
	} // kiali doesn't have any default dns
	if config.KibanaEndpoint == "" {
		config.KibanaEndpoint = kibanaEndpoint
	}
	if config.KubeflowEndpoint == "" {
		config.KubeflowEndpoint = kubeflowEndpoint
	}

	return &Console{
		BaseURL:   baseURL,
		PublicDir: config.PublicDir,
		StaticUser: &auth.User{
			ID:       "hypercloud",
			Username: "hypercloud",
			Token:    k8sAuthServiceAccountBearerToken,
		},

		GOARCH: runtime.GOARCH,
		GOOS:   runtime.GOOS,
		// Branding:          config.Branding,
		// CustomProductName: config.CustomProductName,
		// CustomLogoFile:    config.CustomLogoFile,
		McMode:            config.McMode,
		ChatbotEmbed:      config.ChatbotEmbed,
		ReleaseModeFlag:   config.ReleaseMode,
		GitlabURL:         config.GitlabURL,
		CustomProductName: config.CustomProductName,

		KeycloakRealm:    config.KeycloakRealm,
		KeycloakAuthURL:  config.KeycloakAuthURL,
		KeycloakClientId: config.KeycloakClientId,

		K8sProxyConfig:        k8sProxyConfig,
		K8sClient:             k8sClient,
		PrometheusProxyConfig: newProxy(config.PrometheusEndpoint),
		// ThanosProxyConfig:                newProxy(config.ThanosEndpoint),
		// ThanosTenancyProxyConfig:         newProxy(config.PrometheusEndpoint),
		AlertManagerProxyConfig:          newProxy(config.AlertmanagerEndpoint),
		GrafanaProxyConfig:               newProxy(config.GrafanaEndpoint),
		KialiProxyConfig:                 newProxy(config.KialiEndpoint),
		WebhookProxyConfig:               newProxy(config.WebhookEndpoint),
		HypercloudServerProxyConfig:      newProxy(config.HypercloudEndpoint),
		MultiHypercloudServerProxyConfig: newProxy(config.MultiHypercloudEndpoint),
		KibanaProxyConfig:                newProxy(config.KibanaEndpoint),
		KubeflowProxyConfig:              newProxy(config.KubeflowEndpoint),
	}, nil
}

func newProxy(endpoint string) *proxy.Config {
	url := validateURL(endpoint, endpoint)
	return &proxy.Config{
		HeaderBlacklist: []string{"X-CSRFToken"},
		// TLSClientConfig: &tls.Config{
		// 	InsecureSkipVerify: true,
		// },
		TLSClientConfig: oscrypto.SecureTLSConfig(&tls.Config{
			InsecureSkipVerify: true,
		}),
		Endpoint: url,
		Origin:   "http://localhost",
	}
}

func (c *Console) serverError(w http.ResponseWriter, err error) {
	http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
}

func singleJoiningSlash(a, b string) string {
	aslash := strings.HasSuffix(a, "/")
	bslash := strings.HasPrefix(b, "/")
	switch {
	case aslash && bslash:
		return a + b[1:]
	case !aslash && !bslash:
		return a + "/" + b
	}
	return a + b
}

type gzipResponseWriter struct {
	io.Writer
	http.ResponseWriter
	sniffDone bool
}

func (w *gzipResponseWriter) Write(b []byte) (int, error) {
	if !w.sniffDone {
		if w.Header().Get("Content-Type") == "" {
			w.Header().Set("Content-Type", http.DetectContentType(b))
		}
		w.sniffDone = true
	}
	return w.Writer.Write(b)
}

func gzipHandler(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Add("Vary", "Accept-Encoding")
		if !strings.Contains(r.Header.Get("Accept-Encoding"), "gzip") {
			h.ServeHTTP(w, r)
			return
		}
		w.Header().Set("Content-Encoding", "gzip")
		gz := gzip.NewWriter(w)
		defer gz.Close()
		h.ServeHTTP(&gzipResponseWriter{Writer: gz, ResponseWriter: w}, r)
	})
}

func validateNotEmpty(name string, value string) string {
	if value == "" {
		FlagFatalf(name, "value is required")
	}

	return value
}

func validateURL(name string, value string) *url.URL {
	validateNotEmpty(name, value)

	ur, err := url.Parse(value)
	if err != nil {
		FlagFatalf(name, "%v", err)
	}

	if ur == nil || ur.String() == "" || ur.Scheme == "" || ur.Host == "" {
		FlagFatalf(name, "malformed URL")
	}

	return ur
}

func FlagFatalf(name string, format string, a ...interface{}) {
	log.Fatalf("Invalid flag: %s, error: %s", name, fmt.Sprintf(format, a...))
}

//
