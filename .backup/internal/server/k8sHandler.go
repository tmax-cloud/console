package server

import (
	"console/pkg/hypercloud/proxy"
	"crypto/tls"
	"crypto/x509"
	"fmt"
	oscrypto "github.com/openshift/library-go/pkg/crypto"
	"io/ioutil"

	"net/http"
	"net/url"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

type K8sHandler struct {
	K8sProxy  *proxy.Proxy
	K8sClient *http.Client
	K8sToken  string

	//logger kitlog.Logger
	logger zerolog.Logger
}

func (k *K8sHandler) AddLogger(logger zerolog.Logger) {
	k.logger = logger
}

func NewK8sHandlerConfig(k8sEndpoint string, k8sToken string) *K8sHandler {
	const (
		k8sInClusterCA          = "/var/run/secrets/kubernetes.io/serviceaccount/ca.crt"
		k8sInClusterBearerToken = "/var/run/secrets/kubernetes.io/serviceaccount/token"
		defaultK8sEndpoint      = "https://kubernetes.default.svc"
	)
	// Proxy Setting
	var (
		k8sAuthServiceAccountBearerToken string
		k8sURL                           *url.URL
	)
	k8sProxyConfig := &proxy.Config{}
	k8sClient := &http.Client{}

	// Console In Cluster
	if k8sEndpoint == "" || k8sEndpoint == defaultK8sEndpoint {
		k8sCertPEM, err := ioutil.ReadFile(k8sInClusterCA)
		if err != nil {
			log.Fatal().Err(err).Msg("Error inferring Kubernetes config from environment")
		}
		rootCAs := x509.NewCertPool()
		if !rootCAs.AppendCertsFromPEM(k8sCertPEM) {
			log.Fatal().Err(err).Msg("No CA found for the API server")
		}
		tlsConfig := oscrypto.SecureTLSConfig(&tls.Config{
			RootCAs: rootCAs,
		})
		bearerToken, err := ioutil.ReadFile(k8sInClusterBearerToken)
		k8sAuthServiceAccountBearerToken = string(bearerToken)
		if err != nil {
			log.Fatal().Err(err).Msg("failed to read bearer token")
		}
		k8sURL = validateURL("k8sEndpoint", k8sEndpoint)
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
		k8sAuthServiceAccountBearerToken = k8sToken
		k8sURL = validateURL("k8sEndpoint", k8sEndpoint)
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

	return &K8sHandler{
		K8sProxy:  proxy.NewProxy(k8sProxyConfig),
		K8sClient: k8sClient,
		K8sToken:  k8sAuthServiceAccountBearerToken,
	}
}

func (k *K8sHandler) ConsoleProxyHandler(w http.ResponseWriter, r *http.Request) {
	k.logger.Debug().Msg("Proxy k8s with a console token")
	r.Header.Set("Authorization", fmt.Sprintf("Bearer %s", k.K8sToken))
	k.K8sProxy.ServeHTTP(w, r)
}

func (k *K8sHandler) K8sProxyHandler(w http.ResponseWriter, r *http.Request) {
	k.logger.Debug().Msg("Proxy k8s with a user token")
	k.K8sProxy.ServeHTTP(w, r)
}
