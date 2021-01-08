package main

import (
	"context"
	"crypto/tls"
	"crypto/x509"
	"encoding/json"
	"flag"
	"fmt"
	"os/exec"
	"runtime"

	"io/ioutil"
	"net/http"
	"net/url"
	"os"
	"strings"

	"github.com/coreos/pkg/capnslog"
	"github.com/coreos/pkg/flagutil"
	"github.com/openshift/console/pkg/hypercloud/safe"

	"github.com/openshift/console/pkg/auth"
	"github.com/openshift/console/pkg/backend"
	"github.com/openshift/console/pkg/config/dynamic"
	"github.com/openshift/console/pkg/provider/file"

	// "github.com/openshift/console/pkg/backend"
	"github.com/openshift/console/pkg/bridge"
	"github.com/openshift/console/pkg/crypto"
	"github.com/openshift/console/pkg/helm/chartproxy"
	pConfig "github.com/openshift/console/pkg/hypercloud/config"
	"github.com/openshift/console/pkg/hypercloud/middlewares/stripprefix"
	hproxy "github.com/openshift/console/pkg/hypercloud/proxy"
	"github.com/openshift/console/pkg/hypercloud/router"
	pServer "github.com/openshift/console/pkg/hypercloud/server"
	"github.com/openshift/console/pkg/knative"
	"github.com/openshift/console/pkg/proxy"
	"github.com/openshift/console/pkg/server"
	"github.com/openshift/console/pkg/serverconfig"
)

var (
	log = capnslog.NewPackageLogger("github.com/openshift/console", "cmd/main")
)

const (
	k8sInClusterCA          = "/var/run/secrets/kubernetes.io/serviceaccount/ca.crt"
	k8sInClusterBearerToken = "/var/run/secrets/kubernetes.io/serviceaccount/token"

	// Well-known location of the cluster monitoring (not user workload monitoring) Prometheus service for OpenShift.
	// This is only accessible in-cluster. This is used for non-tenant global (alerting) rules requests.
	openshiftPrometheusHost = "prometheus-k8s.monitoring.svc:9090"

	// Well-known location of the tenant aware Thanos service for OpenShift. This is only accessible in-cluster.
	// Thanos proxies requests to both cluster monitoring and user workload monitoring prometheus instances.
	openshiftThanosTenancyHost = "thanos-querier.openshift-monitoring.svc:9092"

	// Well-known location of the Thanos service for OpenShift. This is only accessible in-cluster.
	// This is used for non-tenant global query requests
	// proxying to both cluster monitoring and user workload monitoring prometheus instances.
	openshiftThanosHost = "thanos-querier.openshift-monitoring.svc:9091"

	// Well-known location of Alert Manager service for OpenShift. This is only accessible in-cluster.
	openshiftAlertManagerHost = "alertmanager-main.monitoring.svc:9093"

	// Well-known location of metering service for OpenShift. This is only accessible in-cluster.
	openshiftMeteringHost = "reporting-operator.openshift-metering.svc:8080"
)

func main() {
	rl := capnslog.MustRepoLogger("github.com/openshift/console")
	capnslog.SetFormatter(capnslog.NewStringFormatter(os.Stderr))

	fs := flag.NewFlagSet("bridge", flag.ExitOnError)
	fListen := fs.String("listen", "http://0.0.0.0:9000", "")

	fBaseAddress := fs.String("base-address", "", "Format: <http | https>://domainOrIPAddress[:port]. Example: https://openshift.example.com.")
	fBasePath := fs.String("base-path", "/", "")
	fConfig := fs.String("config", "", "The YAML config file.")

	// See https://github.com/openshift/service-serving-cert-signer
	fServiceCAFile := fs.String("service-ca-file", "", "CA bundle for OpenShift services signed with the service signing certificates.")

	fUserAuth := fs.String("user-auth", "disabled", "disabled | oidc | openshift")
	fUserAuthOIDCIssuerURL := fs.String("user-auth-oidc-issuer-url", "", "The OIDC/OAuth2 issuer URL.")
	fUserAuthOIDCCAFile := fs.String("user-auth-oidc-ca-file", "", "PEM file for the OIDC/OAuth2 issuer.")
	fUserAuthOIDCClientID := fs.String("user-auth-oidc-client-id", "", "The OIDC OAuth2 Client ID.")
	fUserAuthOIDCClientSecret := fs.String("user-auth-oidc-client-secret", "", "The OIDC OAuth2 Client Secret.")
	fUserAuthOIDCClientSecretFile := fs.String("user-auth-oidc-client-secret-file", "", "File containing the OIDC OAuth2 Client Secret.")
	fUserAuthLogoutRedirect := fs.String("user-auth-logout-redirect", "", "Optional redirect URL on logout needed for some single sign-on identity providers.")

	fK8sMode := fs.String("k8s-mode", "in-cluster", "in-cluster | off-cluster")
	fK8sModeOffClusterEndpoint := fs.String("k8s-mode-off-cluster-endpoint", "", "URL of the Kubernetes API server.")
	fK8sModeOffClusterSkipVerifyTLS := fs.Bool("k8s-mode-off-cluster-skip-verify-tls", false, "DEV ONLY. When true, skip verification of certs presented by k8s API server.")
	fK8sModeOffClusterPrometheus := fs.String("k8s-mode-off-cluster-prometheus", "", "DEV ONLY. URL of the cluster's Prometheus server.")
	fK8sModeOffClusterThanos := fs.String("k8s-mode-off-cluster-thanos", "", "DEV ONLY. URL of the cluster's Thanos server.")
	fK8sModeOffClusterAlertmanager := fs.String("k8s-mode-off-cluster-alertmanager", "", "DEV ONLY. URL of the cluster's AlertManager server.")
	fK8sModeOffClusterMetering := fs.String("k8s-mode-off-cluster-metering", "", "DEV ONLY. URL of the cluster's metering server.")

	fK8sAuth := fs.String("k8s-auth", "service-account", "service-account | bearer-token | oidc | openshift")
	fK8sAuthBearerToken := fs.String("k8s-auth-bearer-token", "", "Authorization token to send with proxied Kubernetes API requests.")

	fRedirectPort := fs.Int("redirect-port", 0, "Port number under which the console should listen for custom hostname redirect.")
	fLogLevel := fs.String("log-level", "", "level of logging information by package (pkg=level).")
	fPublicDir := fs.String("public-dir", "./frontend/public/dist", "directory containing static web assets.")
	fTlSCertFile := fs.String("tls-cert-file", "", "TLS certificate. If the certificate is signed by a certificate authority, the certFile should be the concatenation of the server's certificate followed by the CA's certificate.")
	fTlSKeyFile := fs.String("tls-key-file", "", "The TLS certificate key.")
	fCAFile := fs.String("ca-file", "", "P)EM File containing trusted certificates of trusted CAs. If not present, the system's Root CAs will be used.")
	fDexClientCertFile := fs.String("dex-client-cert-file", "", "PEM File containing certificates of dex client.")
	fDexClientKeyFile := fs.String("dex-client-key-file", "", "PEM File containing certificate key of the dex client.")
	fDexClientCAFile := fs.String("dex-client-ca-file", "", "PEM File containing trusted CAs for Dex client configuration. If blank, defaults to value of ca-file argument")

	fKubectlClientID := fs.String("kubectl-client-id", "", "The OAuth2 client_id of kubectl.")
	fKubectlClientSecret := fs.String("kubectl-client-secret", "", "The OAuth2 client_secret of kubectl.")
	fKubectlClientSecretFile := fs.String("kubectl-client-secret-file", "", "File containing the OAuth2 client_secret of kubectl.")
	fK8sPublicEndpoint := fs.String("k8s-public-endpoint", "", "Endpoint to use when rendering kubeconfigs for clients. Useful for when bridge uses an internal endpoint clients can't access for communicating with the API server.")

	fDexAPIHost := fs.String("dex-api-host", "", "Target host and port of the Dex API service.")
	fBranding := fs.String("branding", "okd", "Console branding for the masthead logo and title. One of okd, openshift, ocp, online, dedicated, or azure. Defaults to okd.")
	fCustomProductName := fs.String("custom-product-name", "", "Custom product name for console branding.")
	fCustomLogoFile := fs.String("custom-logo-file", "", "Custom product image for console branding.")
	fStatuspageID := fs.String("statuspage-id", "", "Unique ID assigned by statuspage.io page that provides status info.")
	fDocumentationBaseURL := fs.String("documentation-base-url", "", "The base URL for documentation links.")

	fAlermanagerPublicURL := fs.String("alermanager-public-url", "", "Public URL of the cluster's AlertManager server.")
	fGrafanaPublicURL := fs.String("grafana-public-url", "", "Public URL of the cluster's Grafana server.")
	fPrometheusPublicURL := fs.String("prometheus-public-url", "", "Public URL of the cluster's Prometheus server.")
	fThanosPublicURL := fs.String("thanos-public-url", "", "Public URL of the cluster's Thanos server.")

	fLoadTestFactor := fs.Int("load-test-factor", 0, "DEV ONLY. The factor used to multiply k8s API list responses for load testing purposes.")

	helmConfig := chartproxy.RegisterFlags(fs)

	// dynamic multi proxy config  2021/01/05 jinsoo
	// fDynamicConfig := fs.String("dynamic-config", "configs/dynamic-config.yaml", "The YAML proxy dynamic config file. (default file name: configs/dynamic-config.yaml)")
	// fOperator := fs.Bool("operator", false, "Choose whether using CRD (console) operator, true | false ")

	// NOTE: Keycloak 연동 추가 // 최여진 -> 윤진수 // 20.12.17
	fKeycloakRealm := fs.String("keycloak-realm", "", "Keycloak Realm Name")
	fKeycloakAuthURL := fs.String("keycloak-auth-url", "", "URL of the Keycloak Auth server.")
	fKeycloakClientId := fs.String("keycloak-client-id", "", "Keycloak Client Id")

	//NOTE: proxy config // jinsoo
	fGrafanaEndpoint := fs.String("grafana-endpoint", "", "URL of the Grafana API server.")
	fKialiEndpoint := fs.String("kiali-endpoint", "", "URL of the KIALI Portal")
	// NOTE: webhook 연동 추가
	fwebhookEndpoint := fs.String("webhook-endpoint", "", "URL of the hypercloud webhook endpoint")

	// NOTE: Multi Cluster(MC) Mode flags //jinsoo
	fMcMode := fs.Bool("mc-mode", false, "Multi Cluster => true | Single Cluster => false")
	fMcModeFile := fs.String("mc-mode-file", "configs/dynamic-config.yaml", "The YAML proxy config file")
	fMcModeOperator := fs.Bool("mc-mode-operator", false, "Using operator which watch crd = true, disable = false")

	if err := fs.Parse(os.Args[1:]); err != nil {
		fmt.Fprintln(os.Stderr, err.Error())
		os.Exit(1)
	}

	if err := flagutil.SetFlagsFromEnv(fs, "BRIDGE"); err != nil {
		fmt.Fprintln(os.Stderr, err.Error())
		os.Exit(1)
	}

	if *fConfig != "" {
		if err := serverconfig.SetFlagsFromConfig(fs, *fConfig); err != nil {
			log.Fatalf("Failed to load config: %v", err)
		}
	}

	baseURL := &url.URL{}
	if *fBaseAddress != "" {
		baseURL = bridge.ValidateFlagIsURL("base-address", *fBaseAddress)
	}

	if *fDexClientCAFile == "" {
		*fDexClientCAFile = *fCAFile
	}

	if !strings.HasPrefix(*fBasePath, "/") || !strings.HasSuffix(*fBasePath, "/") {
		bridge.FlagFatalf("base-path", "value must start and end with slash")
	}
	baseURL.Path = *fBasePath

	caCertFilePath := *fCAFile
	if *fK8sMode == "in-cluster" {
		caCertFilePath = k8sInClusterCA
	}

	logoutRedirect := &url.URL{}
	if *fUserAuthLogoutRedirect != "" {
		logoutRedirect = bridge.ValidateFlagIsURL("user-auth-logout-redirect", *fUserAuthLogoutRedirect)
	}

	documentationBaseURL := &url.URL{}
	if *fDocumentationBaseURL != "" {
		if !strings.HasSuffix(*fDocumentationBaseURL, "/") {
			bridge.FlagFatalf("documentation-base-url", "value must end with slash")
		}
		documentationBaseURL = bridge.ValidateFlagIsURL("documentation-base-url", *fDocumentationBaseURL)
	}

	alertManagerPublicURL := &url.URL{}
	if *fAlermanagerPublicURL != "" {
		alertManagerPublicURL = bridge.ValidateFlagIsURL("alermanager-public-url", *fAlermanagerPublicURL)
	}
	grafanaPublicURL := &url.URL{}
	if *fGrafanaPublicURL != "" {
		grafanaPublicURL = bridge.ValidateFlagIsURL("grafana-public-url", *fGrafanaPublicURL)
	}
	prometheusPublicURL := &url.URL{}
	if *fPrometheusPublicURL != "" {
		prometheusPublicURL = bridge.ValidateFlagIsURL("prometheus-public-url", *fPrometheusPublicURL)
	}
	thanosPublicURL := &url.URL{}
	if *fThanosPublicURL != "" {
		thanosPublicURL = bridge.ValidateFlagIsURL("thanos-public-url", *fThanosPublicURL)
	}

	branding := *fBranding
	if branding == "origin" {
		branding = "okd"
	}
	switch branding {
	case "okd":
	case "openshift":
	case "ocp":
	case "online":
	case "dedicated":
	case "azure":
	default:
		bridge.FlagFatalf("branding", "value must be one of okd, openshift, ocp, online, dedicated, or azure")
	}

	if *fCustomLogoFile != "" {
		if _, err := os.Stat(*fCustomLogoFile); err != nil {
			log.Fatalf("could not read logo file: %v", err)
		}
	}

	srv := &server.Server{
		PublicDir:             *fPublicDir,
		BaseURL:               baseURL,
		LogoutRedirect:        logoutRedirect,
		Branding:              branding,
		CustomProductName:     *fCustomProductName,
		CustomLogoFile:        *fCustomLogoFile,
		StatuspageID:          *fStatuspageID,
		DocumentationBaseURL:  documentationBaseURL,
		AlertManagerPublicURL: alertManagerPublicURL,
		GrafanaPublicURL:      grafanaPublicURL,
		PrometheusPublicURL:   prometheusPublicURL,
		ThanosPublicURL:       thanosPublicURL,
		LoadTestFactor:        *fLoadTestFactor,

		// NOTE: return keycloak infor
		KeycloakRealm:    *fKeycloakRealm,
		KeycloakAuthURL:  *fKeycloakAuthURL,
		KeycloakClientId: *fKeycloakClientId,
	}

	// if !in-cluster (dev) we should not pass these values to the frontend
	if *fK8sMode == "in-cluster" {
		srv.GOARCH = runtime.GOARCH
		srv.GOOS = runtime.GOOS
	}

	if (*fKubectlClientID == "") != (*fKubectlClientSecret == "" && *fKubectlClientSecretFile == "") {
		fmt.Fprintln(os.Stderr, "Must provide both --kubectl-client-id and --kubectl-client-secret or --kubectrl-client-secret-file")
		os.Exit(1)
	}

	if *fKubectlClientSecret != "" && *fKubectlClientSecretFile != "" {
		fmt.Fprintln(os.Stderr, "Cannot provide both --kubectl-client-secret and --kubectrl-client-secret-file")
		os.Exit(1)
	}

	capnslog.SetGlobalLogLevel(capnslog.INFO)
	if *fLogLevel != "" {
		llc, err := rl.ParseLogLevelConfig(*fLogLevel)
		if err != nil {
			log.Fatal(err)
		}
		rl.SetLogLevel(llc)
		log.Infof("Setting log level to %s", *fLogLevel)
	}

	var (
		// Hold on to raw certificates so we can render them in kubeconfig files.
		k8sCertPEM []byte
	)

	var (
		k8sAuthServiceAccountBearerToken string
	)

	if *fDexClientCertFile != "" && *fDexClientKeyFile != "" && *fDexAPIHost != "" {
		var err error

		if srv.DexClient, err = auth.NewDexClient(*fDexAPIHost, *fDexClientCAFile, *fDexClientCertFile, *fDexClientKeyFile); err != nil {
			log.Fatalf("Failed to create a Dex API client: %v", err)
		}
	}

	var secureCookies bool
	if baseURL.Scheme == "https" {
		secureCookies = true
		log.Info("cookies are secure!")
	} else {
		secureCookies = false
		log.Warning("cookies are not secure because base-address is not https!")
	}

	var k8sEndpoint *url.URL
	switch *fK8sMode {
	case "in-cluster":
		k8sEndpoint = &url.URL{Scheme: "https", Host: "kubernetes.default.svc"}

		var err error
		k8sCertPEM, err = ioutil.ReadFile(k8sInClusterCA)
		if err != nil {
			log.Fatalf("Error inferring Kubernetes config from environment: %v", err)
		}
		rootCAs := x509.NewCertPool()
		if !rootCAs.AppendCertsFromPEM(k8sCertPEM) {
			log.Fatalf("No CA found for the API server")
		}
		tlsConfig := &tls.Config{
			RootCAs:      rootCAs,
			CipherSuites: crypto.DefaultCiphers(),
		}

		bearerToken, err := ioutil.ReadFile(k8sInClusterBearerToken)
		if err != nil {
			log.Fatalf("failed to read bearer token: %v", err)
		}

		srv.K8sProxyConfig = &proxy.Config{
			TLSClientConfig: tlsConfig,
			HeaderBlacklist: []string{"Cookie", "X-CSRFToken"},
			Endpoint:        k8sEndpoint,
		}

		k8sAuthServiceAccountBearerToken = string(bearerToken)

		// If running in an OpenShift cluster, set up a proxy to the prometheus-k8s service running in the openshift-monitoring namespace.
		if *fServiceCAFile != "" {
			serviceCertPEM, err := ioutil.ReadFile(*fServiceCAFile)
			if err != nil {
				log.Fatalf("failed to read service-ca.crt file: %v", err)
			}
			serviceProxyRootCAs := x509.NewCertPool()
			if !serviceProxyRootCAs.AppendCertsFromPEM(serviceCertPEM) {
				log.Fatalf("no CA found for Kubernetes services")
			}
			serviceProxyTLSConfig := &tls.Config{
				RootCAs:      serviceProxyRootCAs,
				CipherSuites: crypto.DefaultCiphers(),
			}
			srv.PrometheusProxyConfig = &proxy.Config{
				TLSClientConfig: serviceProxyTLSConfig,
				HeaderBlacklist: []string{"Cookie", "X-CSRFToken"},
				Endpoint:        &url.URL{Scheme: "https", Host: openshiftPrometheusHost, Path: "/api"},
			}
			srv.ThanosProxyConfig = &proxy.Config{
				TLSClientConfig: serviceProxyTLSConfig,
				HeaderBlacklist: []string{"Cookie", "X-CSRFToken"},
				Endpoint:        &url.URL{Scheme: "https", Host: openshiftThanosHost, Path: "/api"},
			}
			srv.ThanosTenancyProxyConfig = &proxy.Config{
				TLSClientConfig: serviceProxyTLSConfig,
				HeaderBlacklist: []string{"Cookie", "X-CSRFToken"},
				Endpoint:        &url.URL{Scheme: "https", Host: openshiftThanosTenancyHost, Path: "/api"},
			}
			srv.AlertManagerProxyConfig = &proxy.Config{
				TLSClientConfig: serviceProxyTLSConfig,
				HeaderBlacklist: []string{"Cookie", "X-CSRFToken"},
				Endpoint:        &url.URL{Scheme: "https", Host: openshiftAlertManagerHost, Path: "/api"},
			}
			srv.MeteringProxyConfig = &proxy.Config{
				TLSClientConfig: serviceProxyTLSConfig,
				HeaderBlacklist: []string{"Cookie", "X-CSRFToken"},
				Endpoint:        &url.URL{Scheme: "https", Host: openshiftMeteringHost, Path: "/api"},
			}
			srv.TerminalProxyTLSConfig = serviceProxyTLSConfig

			// NOTE: grafanaEndpoint 추가 // 윤진수
			grafanaEndpoint := bridge.ValidateFlagIsURL("grafana-endpoint", *fGrafanaEndpoint)
			srv.GrafanaProxyConfig = &hproxy.Config{
				HeaderBlacklist: []string{"Cookie", "X-CSRFToken"},
				Endpoint:        grafanaEndpoint,
				Origin:          "http://localhost",
			}
			kialiEndpoint := bridge.ValidateFlagIsURL("kiali-endpoint", *fKialiEndpoint)
			srv.KialiProxyConfig = &hproxy.Config{
				HeaderBlacklist: []string{"X-CSRFToken"},
				TLSClientConfig: &tls.Config{
					InsecureSkipVerify: true,
				},
				Endpoint: kialiEndpoint,
				Origin:   "http://localhost",
			}

		}

	case "off-cluster":
		k8sEndpoint = bridge.ValidateFlagIsURL("k8s-mode-off-cluster-endpoint", *fK8sModeOffClusterEndpoint)
		serviceProxyTLSConfig := &tls.Config{
			InsecureSkipVerify: *fK8sModeOffClusterSkipVerifyTLS,
			CipherSuites:       crypto.DefaultCiphers(),
		}
		srv.K8sProxyConfig = &proxy.Config{
			TLSClientConfig: serviceProxyTLSConfig,
			HeaderBlacklist: []string{"Cookie", "X-CSRFToken"},
			Endpoint:        k8sEndpoint,
		}

		if *fK8sModeOffClusterPrometheus != "" {
			offClusterPrometheusURL := bridge.ValidateFlagIsURL("k8s-mode-off-cluster-prometheus", *fK8sModeOffClusterPrometheus)
			offClusterPrometheusURL.Path = "/api"
			srv.PrometheusProxyConfig = &proxy.Config{
				TLSClientConfig: serviceProxyTLSConfig,
				HeaderBlacklist: []string{"Cookie", "X-CSRFToken"},
				Endpoint:        offClusterPrometheusURL,
			}

			offClusterThanosURL := bridge.ValidateFlagIsURL("k8s-mode-off-cluster-thanos", *fK8sModeOffClusterThanos)
			offClusterThanosURL.Path = "/api"
			srv.ThanosTenancyProxyConfig = &proxy.Config{
				TLSClientConfig: serviceProxyTLSConfig,
				HeaderBlacklist: []string{"Cookie", "X-CSRFToken"},
				Endpoint:        offClusterThanosURL,
			}
			srv.ThanosProxyConfig = &proxy.Config{
				TLSClientConfig: serviceProxyTLSConfig,
				HeaderBlacklist: []string{"Cookie", "X-CSRFToken"},
				Endpoint:        offClusterThanosURL,
			}
		}

		if *fK8sModeOffClusterAlertmanager != "" {
			offClusterAlertManagerURL := bridge.ValidateFlagIsURL("k8s-mode-off-cluster-alertmanager", *fK8sModeOffClusterAlertmanager)
			offClusterAlertManagerURL.Path = "/api"
			srv.AlertManagerProxyConfig = &proxy.Config{
				TLSClientConfig: serviceProxyTLSConfig,
				HeaderBlacklist: []string{"Cookie", "X-CSRFToken"},
				Endpoint:        offClusterAlertManagerURL,
			}
		}

		if *fK8sModeOffClusterMetering != "" {
			offClusterMeteringURL := bridge.ValidateFlagIsURL("k8s-mode-off-cluster-metering", *fK8sModeOffClusterMetering)
			offClusterMeteringURL.Path = "/api"
			srv.MeteringProxyConfig = &proxy.Config{
				TLSClientConfig: serviceProxyTLSConfig,
				HeaderBlacklist: []string{"Cookie", "X-CSRFToken"},
				Endpoint:        offClusterMeteringURL,
			}
		}

		srv.TerminalProxyTLSConfig = serviceProxyTLSConfig

	default:
		bridge.FlagFatalf("k8s-mode", "must be one of: in-cluster, off-cluster")
	}

	// ADD proxy in,out cluster
	// NOTE: grafanaEndpoint 추가 // 윤진수
	grafanaEndpoint := bridge.ValidateFlagIsURL("grafana-endpoint", *fGrafanaEndpoint)
	srv.GrafanaProxyConfig = &hproxy.Config{
		HeaderBlacklist: []string{"X-CSRFToken"},
		Endpoint:        grafanaEndpoint,
		Origin:          "http://localhost",
	}
	kialiEndpoint := bridge.ValidateFlagIsURL("kiali-endpoint", *fKialiEndpoint)
	srv.KialiProxyConfig = &hproxy.Config{
		HeaderBlacklist: []string{"X-CSRFToken"},
		TLSClientConfig: &tls.Config{
			InsecureSkipVerify: true,
		},
		Endpoint: kialiEndpoint,
		Origin:   "http://localhost",
	}
	webhookEndpoint := bridge.ValidateFlagIsURL("webhook-endpoint", *fwebhookEndpoint)
	srv.WebhookProxyConfig = &hproxy.Config{
		HeaderBlacklist: []string{"X-CSRFToken"},
		TLSClientConfig: &tls.Config{
			InsecureSkipVerify: true,
		},
		Endpoint: webhookEndpoint,
		Origin:   "http://localhost",
	}

	apiServerEndpoint := *fK8sPublicEndpoint
	if apiServerEndpoint == "" {
		apiServerEndpoint = srv.K8sProxyConfig.Endpoint.String()
	}
	srv.KubeAPIServerURL = apiServerEndpoint
	srv.K8sClient = &http.Client{
		Transport: &http.Transport{
			TLSClientConfig: srv.K8sProxyConfig.TLSClientConfig,
		},
	}

	switch *fUserAuth {
	case "oidc", "openshift":
		bridge.ValidateFlagNotEmpty("base-address", *fBaseAddress)
		bridge.ValidateFlagNotEmpty("user-auth-oidc-client-id", *fUserAuthOIDCClientID)

		if *fUserAuthOIDCClientSecret == "" && *fUserAuthOIDCClientSecretFile == "" {
			fmt.Fprintln(os.Stderr, "Must provide either --user-auth-oidc-client-secret or --user-auth-oidc-client-secret-file")
			os.Exit(1)
		}

		if *fUserAuthOIDCClientSecret != "" && *fUserAuthOIDCClientSecretFile != "" {
			fmt.Fprintln(os.Stderr, "Cannot provide both --user-auth-oidc-client-secret and --user-auth-oidc-client-secret-file")
			os.Exit(1)
		}

		var (
			err                      error
			userAuthOIDCIssuerURL    *url.URL
			authLoginErrorEndpoint   = proxy.SingleJoiningSlash(srv.BaseURL.String(), server.AuthLoginErrorEndpoint)
			authLoginSuccessEndpoint = proxy.SingleJoiningSlash(srv.BaseURL.String(), server.AuthLoginSuccessEndpoint)
			oidcClientSecret         = *fUserAuthOIDCClientSecret
			// Abstraction leak required by NewAuthenticator. We only want the browser to send the auth token for paths starting with basePath/api.
			cookiePath  = proxy.SingleJoiningSlash(srv.BaseURL.Path, "/api/")
			refererPath = srv.BaseURL.String()
		)

		scopes := []string{"openid", "email", "profile", "groups"}
		authSource := auth.AuthSourceTectonic

		if *fUserAuth == "openshift" {
			// Scopes come from OpenShift documentation
			// https://docs.openshift.com/container-platform/3.9/architecture/additional_concepts/authentication.html#service-accounts-as-oauth-clients
			//
			// TODO(ericchiang): Support other scopes like view only permissions.
			scopes = []string{"user:full"}
			authSource = auth.AuthSourceOpenShift
			if *fUserAuthOIDCIssuerURL != "" {
				bridge.FlagFatalf("user-auth-oidc-issuer-url", "cannot be used with --user-auth=\"openshift\"")
			}
			userAuthOIDCIssuerURL = k8sEndpoint
		} else {
			userAuthOIDCIssuerURL = bridge.ValidateFlagIsURL("user-auth-oidc-issuer-url", *fUserAuthOIDCIssuerURL)
		}

		if *fUserAuthOIDCClientSecretFile != "" {
			buf, err := ioutil.ReadFile(*fUserAuthOIDCClientSecretFile)
			if err != nil {
				log.Fatalf("Failed to read client secret file: %v", err)
			}
			oidcClientSecret = string(buf)
		}

		// Config for logging into console.
		oidcClientConfig := &auth.Config{
			AuthSource:   authSource,
			IssuerURL:    userAuthOIDCIssuerURL.String(),
			IssuerCA:     *fUserAuthOIDCCAFile,
			ClientID:     *fUserAuthOIDCClientID,
			ClientSecret: oidcClientSecret,
			RedirectURL:  proxy.SingleJoiningSlash(srv.BaseURL.String(), server.AuthLoginCallbackEndpoint),
			Scope:        scopes,

			// Use the k8s CA file for OpenShift OAuth metadata discovery.
			// This might be different than IssuerCA.
			K8sCA: caCertFilePath,

			ErrorURL:   authLoginErrorEndpoint,
			SuccessURL: authLoginSuccessEndpoint,

			CookiePath:    cookiePath,
			RefererPath:   refererPath,
			SecureCookies: secureCookies,
		}

		// NOTE: This won't work when using the OpenShift auth mode.
		if *fKubectlClientID != "" {
			srv.KubectlClientID = *fKubectlClientID

			// Assume kubectl is the client ID trusted by kubernetes, not bridge.
			// These additional flags causes Dex to issue an ID token valid for
			// both bridge and kubernetes.
			oidcClientConfig.Scope = append(
				oidcClientConfig.Scope,
				"audience:server:client_id:"+*fUserAuthOIDCClientID,
				"audience:server:client_id:"+*fKubectlClientID,
			)

		}

		if srv.Auther, err = auth.NewAuthenticator(context.Background(), oidcClientConfig); err != nil {
			log.Fatalf("Error initializing authenticator: %v", err)
		}
	case "disabled":
		log.Warningf("running with AUTHENTICATION DISABLED!")
	default:
		bridge.FlagFatalf("user-auth", "must be one of: oidc, disabled")
	}

	var resourceListerToken string
	switch *fK8sAuth {
	case "service-account":
		bridge.ValidateFlagIs("k8s-mode", *fK8sMode, "in-cluster")
		srv.StaticUser = &auth.User{
			Token: k8sAuthServiceAccountBearerToken,
		}
		resourceListerToken = k8sAuthServiceAccountBearerToken
	case "bearer-token":
		bridge.ValidateFlagNotEmpty("k8s-auth-bearer-token", *fK8sAuthBearerToken)
		srv.StaticUser = &auth.User{
			Token: *fK8sAuthBearerToken,
		}
		resourceListerToken = *fK8sAuthBearerToken
	case "oidc", "openshift":
		bridge.ValidateFlagIs("user-auth", *fUserAuth, "oidc", "openshift")
		resourceListerToken = k8sAuthServiceAccountBearerToken
	default:
		bridge.FlagFatalf("k8s-mode", "must be one of: service-account, bearer-token, oidc, openshift")
	}

	srv.MonitoringDashboardConfigMapLister = server.NewResourceLister(
		resourceListerToken,
		&url.URL{
			Scheme: k8sEndpoint.Scheme,
			Host:   k8sEndpoint.Host,
			Path:   "/api/v1/namespaces/openshift-config-managed/configmaps",
			RawQuery: url.Values{
				"labelSelector": {"console.openshift.io/dashboard=true"},
			}.Encode(),
		},
		&http.Client{
			Transport: &http.Transport{
				TLSClientConfig: srv.K8sProxyConfig.TLSClientConfig,
			},
		},
		nil,
	)

	srv.KnativeEventSourceCRDLister = server.NewResourceLister(
		resourceListerToken,
		&url.URL{
			Scheme: k8sEndpoint.Scheme,
			Host:   k8sEndpoint.Host,
			Path:   "/apis/apiextensions.k8s.io/v1/customresourcedefinitions",
			RawQuery: url.Values{
				"labelSelector": {"duck.knative.dev/source=true"},
			}.Encode(),
		},
		&http.Client{
			Transport: &http.Transport{
				TLSClientConfig: srv.K8sProxyConfig.TLSClientConfig,
			},
		},
		knative.EventSourceFilter,
	)

	listenURL := bridge.ValidateFlagIsURL("listen", *fListen)
	switch listenURL.Scheme {
	case "http":
	case "https":
		bridge.ValidateFlagNotEmpty("tls-cert-file", *fTlSCertFile)
		bridge.ValidateFlagNotEmpty("tls-key-file", *fTlSKeyFile)
	default:
		bridge.FlagFatalf("listen", "scheme must be one of: http, https")
	}

	helmConfig.Configure(srv)

	if *fRedirectPort != 0 {
		go func() {
			// Listen on passed port number to be redirected to the console
			redirectServer := http.NewServeMux()
			redirectServer.HandleFunc("/", func(res http.ResponseWriter, req *http.Request) {
				redirectURL := &url.URL{
					Scheme:   srv.BaseURL.Scheme,
					Host:     srv.BaseURL.Host,
					RawQuery: req.URL.RawQuery,
					Path:     req.URL.Path,
				}
				http.Redirect(res, req, redirectURL.String(), http.StatusMovedPermanently)
			})
			redirectPort := fmt.Sprintf(":%d", *fRedirectPort)
			log.Infof("Listening on %q for custom hostname redirect...", redirectPort)
			log.Fatal(http.ListenAndServe(redirectPort, redirectServer))
		}()
	}

	//TODO: Porxy Server Start
	srv.McMode = *fMcMode
	proxyServer, err := pServer.NewServer(srv, fTlSCertFile, fTlSKeyFile)
	if err != nil {
		log.Errorf("Failed to get proxyserver from pServer.NewServer() %v \n", err)
	}

	var pvd = new(file.Provider)
	pvd.Watch = true
	if *fMcModeFile != "configs/dynamic-config.yaml" {
		filename := *fMcModeFile
		if _, err := os.Stat(filename); os.IsNotExist(err) {
			log.Infof("does not exist file : %s", filename)
			log.Infof("Create file : %s ", filename)
			var pwd, err = os.Create(filename)
			if err != nil {
				log.Fatalf("filed to create config filed : %v", err)
				return
			}
			defer pwd.Close()
		}
		pvd.Filename = filename
	} else {
		// log.Infof("Using default config directory : %s", *fMcModeFile)
		filename := *fMcModeFile
		if _, err := os.Stat(filename); os.IsNotExist(err) {
			log.Infof("does not exist file : %s", filename)
			log.Infof("Create file : %s ", filename)
			var pwd, err = os.Create(filename)
			if err != nil {
				log.Fatalf("filed to create config filed : %v", err)
				return
			}
			defer pwd.Close()
		}
		pvd.Filename = filename
	}
	srv.McModeFile = pvd.Filename

	routinesPool := safe.NewPool(context.Background())
	watcher := pServer.NewWatcher(pvd, routinesPool)
	watcher.AddListener(switchRouter(srv, proxyServer))
	watcher.Start()

	if *fMcMode {
		log.Info("Start Multi Cluster Console")
		log.Infof("Address : %s \n", srv.BaseURL.String())
	} else {
		log.Info("Start Single Cluster Console")
		log.Infof("Address: %s \n", srv.BaseURL.String())
	}
	proxyServer.Start(context.Background())
	// Proxy Server End

	srv.McModeOperator = *fMcModeOperator
	if *fMcModeOperator {
		go func() {
			cmd := exec.Command("./tool/crd-operator")
			log.Info("Running crd watcher operator")
			cmd.Stdout = os.Stdout
			cmd.Stderr = os.Stderr

			err = cmd.Start()
			if err != nil {
				log.Fatal("Error when running cmd")
			}
		}()
	}

	end := make(chan bool)
	<-end
}

// Create Router when changing proxy config
func switchRouter(hyperCloudSrv *server.Server, proxySrv *pServer.HttpServer) func(config dynamic.Configuration) {
	return func(config dynamic.Configuration) {
		log.Info("===Starting SwitchRouter====")
		// config := config.DeepCopy()

		routerTemp, err := router.NewRouter()
		if err != nil {
			log.Info("Failed to create router ", err)
			// return nil, err
		}
		log.Infof("buildHandler : %v  \n", config.Routers)
		for name, value := range config.Routers {
			log.Infof("Creating proxy backend based on %v : %v  \n", name, value)
			proxyBackend, err := backend.NewBackend(name, value.Server)
			if err != nil {
				log.Error("Failed to parse url of server")
				// return nil, err
			}
			proxyBackend.Rule = value.Rule
			proxyBackend.ServerURL = value.Server
			if value.Path != "" {
				handlerConfig := &pConfig.StripPrefix{
					Prefixes: []string{value.Path},
				}
				prefixHandler, err := stripprefix.New(context.TODO(), proxyBackend.Handler, *handlerConfig, "stripPrefix")
				if err != nil {
					log.Error("Failed to create stripPrefix handler", err)
					// return nil, err
				}
				err = routerTemp.AddRoute(proxyBackend.Rule, 0, prefixHandler)
				if err != nil {
					log.Error("failed to put proxy handler into Router", err)
					// return nil, err
				}
			}
			err = routerTemp.AddRoute(proxyBackend.Rule, 0, proxyBackend.Handler)
			if err != nil {
				log.Error("failed to put proxy handler into Router ", err)
				// return nil, err
			}
		}

		err = routerTemp.AddRoute("PathPrefix(`/api/k8sAll`)", 0, http.HandlerFunc(
			func(rw http.ResponseWriter, r *http.Request) {
				rw.Header().Set("Content-Type", "application/json")
				err := json.NewEncoder(rw).Encode(config)
				if err != nil {
					http.NotFound(rw, r)
					return
				}
			},
		))
		if err != nil {
			log.Error("/api/k8sAll/ has a problem", err)
		}

		routerTemp.AddRoute("PathPrefix(`/`)", 0, hyperCloudSrv.HTTPHandler())
		log.Info("===End SwitchRouter ===")
		log.Info("Call updateHandler --> routerTemp.Router")
		// olderSrv:=proxySrv.Handler.Switcher.GetHandler()

		if proxySrv.Switcher.GetHandler() == nil {
			proxySrv.Switcher.UpdateHandler(http.NotFoundHandler())
		}

		proxySrv.Switcher.UpdateHandler(routerTemp)

	}
}
