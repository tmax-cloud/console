package main

import (
	"console/internal/console"
	"console/internal/server"
	"context"
	"crypto/tls"
	"fmt"
	kitlog "github.com/go-kit/log"
	oscrypto "github.com/openshift/library-go/pkg/crypto"
	"github.com/spf13/cobra"
	"github.com/spf13/pflag"
	"github.com/spf13/viper"
	"net/http"
	"net/url"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"
)

const (
	defaultConfigFileName = "config"
	defaultConfigFilePath = "./configs"
	envPrefix             = "CONSOLE"
)

type ServingInfo struct {
	Listen       string `yaml:"listen"`
	BaseAddress  string `yaml:"baseAddress"`
	CertFile     string `yaml:"cert,omitempty"`
	KeyFile      string `yaml:"key,omitempty"`
	RedirectPort int    `yaml:"redirectPort,omitempty"`
}

func main() {
	cmd := NewConsoleCommand()
	cobra.CheckErr(cmd.Execute())
}

var (
	servingInfo = &ServingInfo{}
	app         = server.NewAppConfig()

	rootCmd = &cobra.Command{
		Use:   "console",
		Short: "web console for supercloud & hypercloud",
		Long: `The console has three major features, 
First, we provide a react app for supercloud UI. 
Second, we provide the index.html for react app operation. 
Finally, we provide a proxy function for querying the kubernetes resource API`,
		PersistentPreRunE: func(cmd *cobra.Command, args []string) error {
			return initializeConfig(cmd)
		},
		Run: func(cmd *cobra.Command, args []string) {
			fs := cmd.Flags()

			// backward compatibility
			if fBaseAddress, _ := fs.GetString("base-address"); fBaseAddress != "" {
				servingInfo.BaseAddress = fBaseAddress
			}
			if fListen, _ := fs.GetString("listen"); fListen != "" {
				servingInfo.Listen = fListen
			}
			if fKeycloakRealm, _ := fs.GetString("keycloak-realm"); fKeycloakRealm != "" {
				app.KeycloakRealm = fKeycloakRealm
			}
			if fKeycloakAuthURL, _ := fs.GetString("keycloak-auth-url"); fKeycloakAuthURL != "" {
				app.KeycloakAuthURL = fKeycloakAuthURL
			}
			if fKeycloakClientId, _ := fs.GetString("keycloak-client-id"); fKeycloakClientId != "" {
				app.KeycloakClientId = fKeycloakClientId
			}
			if fPublicDir, _ := fs.GetString("public-dir"); fPublicDir != "" {
				app.PublicDir = fPublicDir
			}
			if fMcMode, _ := fs.GetBool("mc-mode"); fMcMode == true {
				app.McMode = fMcMode
			}
			if fCustomProductName, _ := fs.GetString("custom-product-name"); fCustomProductName != "" {
				app.CustomProductName = fCustomProductName
			}

			var (
				k8sApi, _ = fs.GetString("clusterInfo.kubeAPIServerURL")
				token, _  = fs.GetString("clusterInfo.kubeToken")
			)
			k8sHandler := server.NewK8sHandlerConfig(k8sApi, token)

			var logger kitlog.Logger
			logger = kitlog.NewLogfmtLogger(kitlog.NewSyncWriter(os.Stderr))
			logger = kitlog.With(logger, "ts", kitlog.DefaultTimestampUTC)

			app.AddLogger(kitlog.With(logger, "component", "App"))
			k8sHandler.AddLogger(kitlog.With(logger, "component", "k8sHandler"))

			httpHandler := server.NewServer(app, k8sHandler)

			listenURL := console.ValidateFlagIsURL("listen", servingInfo.Listen)
			baseURL := console.ValidateFlagIsURL("baseAddress", servingInfo.BaseAddress)
			switch listenURL.Scheme {
			case "http":
			case "https":
				console.ValidateFlagNotEmpty("tls-cert-file", servingInfo.CertFile)
				console.ValidateFlagNotEmpty("tls-key-file", servingInfo.KeyFile)
			default:
				console.FlagFatalf("listen", "scheme must be one of: http, https")
			}
			httpsrv := &http.Server{
				Addr:    listenURL.Host,
				Handler: httpHandler,
				// Disable HTTP/2, which breaks WebSockets.
				TLSNextProto: make(map[string]func(*http.Server, *tls.Conn, http.Handler)),
				TLSConfig:    oscrypto.SecureTLSConfig(&tls.Config{}),
			}
			//Run the server
			go func() {
				if listenURL.Scheme == "https" {
					err := httpsrv.ListenAndServeTLS(servingInfo.CertFile, servingInfo.KeyFile)
					if err != nil && err != http.ErrServerClosed {
						logger.Log("Error", err)
						os.Exit(1)
					}
				} else {
					err := httpsrv.ListenAndServe()
					if err != nil && err != http.ErrServerClosed {
						logger.Log("Error", err)
						os.Exit(1)
					}
				}
			}()

			redirectServer := &http.Server{}
			if servingInfo.RedirectPort != 0 {
				mux := http.NewServeMux()
				mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
					redirectURL := &url.URL{
						Scheme:   baseURL.Scheme,
						Host:     baseURL.Host,
						RawQuery: r.URL.RawQuery,
						Path:     r.URL.Path,
					}
					http.Redirect(w, r, redirectURL.String(), http.StatusMovedPermanently)
				})
				redirectPort := fmt.Sprintf(":%d", servingInfo.RedirectPort)
				redirectServer = &http.Server{
					Addr:    redirectPort,
					Handler: mux,
				}
				go func() {
					err := redirectServer.ListenAndServe()
					if err != nil && err != http.ErrServerClosed {
						logger.Log("Error", err)
						os.Exit(1)
					}
				}()
			}

			serverCtx, serverStopCtx := context.WithCancel(context.Background())
			sig := make(chan os.Signal, 1)
			signal.Notify(sig, syscall.SIGHUP, syscall.SIGINT, syscall.SIGTERM, syscall.SIGQUIT)
			go func() {
				<-sig

				logger.Log("msg", "Shutdown signal received")
				// Shutdown signal with grace period of 30 seconds
				shutdownCtx, _ := context.WithTimeout(serverCtx, 30*time.Second)

				go func() {
					<-shutdownCtx.Done()
					if shutdownCtx.Err() == context.DeadlineExceeded {
						logger.Log("Error", "graceful shutdown timed out.. forcing exit.")
						os.Exit(1)
					}
				}()

				// Trigger graceful shutdown
				logger.Log("msg", "graceful Shutdown httpsrv")
				err := httpsrv.Shutdown(shutdownCtx)
				if err != nil {
					logger.Log("Error", err)
					os.Exit(1)
				}
				logger.Log("msg", "graceful Shutdown redirectServer")
				if servingInfo.RedirectPort != 0 {
					err := redirectServer.Shutdown(shutdownCtx)
					if err != nil {
						logger.Log("Error", err)
						os.Exit(1)
					}
				}
				serverStopCtx()
			}()

			<-serverCtx.Done()
		},
	}
)

func NewConsoleCommand() *cobra.Command {
	rootCmd.PersistentFlags().StringVar(&servingInfo.Listen, "servingInfo.listen", "http://0.0.0.0:9000", "listen Address")
	rootCmd.PersistentFlags().StringVar(&servingInfo.BaseAddress, "servingInfo.baseAddress", "http://0.0.0.0:9000", "Format: <http | https>://domainOrIPAddress[:port]. Example: https://console.hypercloud.com.")
	rootCmd.PersistentFlags().StringVar(&servingInfo.CertFile, "servingInfo.certFile", "./tls/tls.crt", "TLS certificate. If the certificate is signed by a certificate authority, the certFile should be the concatenation of the server's certificate followed by the CA's certificate.")
	rootCmd.PersistentFlags().StringVar(&servingInfo.KeyFile, "servingInfo.keyFile", "./tls/tls.key", "The TLS certificate key.")
	rootCmd.PersistentFlags().IntVar(&servingInfo.RedirectPort, "servingInfo.redirectPort", 0, "Port number under which the console should listen for custom hostname redirect.")

	rootCmd.PersistentFlags().StringVar(&app.KeycloakRealm, "app.keycloakRealm", "tmax", "Keycloak Realm Name")
	//rootCmd.MarkPersistentFlagRequired("app.keycloakRealm")
	rootCmd.PersistentFlags().StringVar(&app.KeycloakClientId, "app.keycloakClientId", "hypercloud5", "Keycloak Client Id")
	//rootCmd.MarkPersistentFlagRequired("app.keycloakClientId")
	rootCmd.PersistentFlags().StringVar(&app.KeycloakAuthURL, "app.keycloakAuthUrl", "https://hyperauth.tmaxcloud.org/auth", "URL of the Keycloak Auth server.")
	//rootCmd.MarkPersistentFlagRequired("app.keycloakAuthUrl")
	rootCmd.PersistentFlags().BoolVar(&app.KeycloakUseHiddenIframe, "app.keycloakUseHiddenIframe", false, "Use keycloak Hidden Iframe")

	rootCmd.PersistentFlags().StringVar(&app.BasePath, "app.basePath", "/", "basePath")
	rootCmd.PersistentFlags().StringVar(&app.PublicDir, "app.publicDir", "./frontend/public/dist", "listen Address")
	rootCmd.PersistentFlags().BoolVar(&app.McMode, "app.mcMode", true, "Choose Cluster Mode (multi | single)")
	rootCmd.PersistentFlags().BoolVar(&app.ReleaseMode, "app.releaseMode", true, "when true, use jwt token given by keycloak")
	rootCmd.PersistentFlags().StringVar(&app.CustomProductName, "app.customProductName", "hypercloud", "prduct name for console | default hypercloud")

	//rootCmd.PersistentFlags().StringVar(&k8sHandler.KubeAPIServerURL, "k8sHandler.kubeAPIServerURL", "kubernetes.default.svc", "kube api server hostname")
	rootCmd.PersistentFlags().String("clusterInfo.kubeAPIServerURL", "https://kubernetes.default.svc", "kube api server hostname")
	rootCmd.PersistentFlags().String("clusterInfo.kubeToken", "", "kubernetes token for API")

	rootCmd.PersistentFlags().String("base-address", "", "backward compatibility for servingInfo.baseAddress")
	rootCmd.PersistentFlags().String("listen", "", "backward compatibility for servingInfo.listen")
	rootCmd.PersistentFlags().String("keycloak-realm", "", "backward compatibility for app.keycloakRealm")
	rootCmd.PersistentFlags().String("keycloak-auth-url", "", "backward compatibility for app.keycloakAuthUrl")
	rootCmd.PersistentFlags().String("keycloak-client-id", "", "backward compatibility for app.keycloakClientId")
	rootCmd.PersistentFlags().Bool("mc-mode", false, "backward compatibility for app.mcMode")
	rootCmd.PersistentFlags().String("public-dir", "", "backward compatibility for app.publicDir")
	rootCmd.PersistentFlags().String("custom-product-name", "", "backward compatibility for app.customProductName")

	return rootCmd
}

func initializeConfig(cmd *cobra.Command) error {
	v := viper.New()

	v.SetConfigName(defaultConfigFileName)
	v.AddConfigPath(defaultConfigFilePath)

	if err := v.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); !ok {
			return err
		}
	}

	v.SetEnvPrefix(envPrefix)
	v.AutomaticEnv()

	bindFlags(cmd, v)

	return nil
}

// Bind each cobra flag to its associated viper configuration (config file and environment variable)
func bindFlags(cmd *cobra.Command, v *viper.Viper) {
	cmd.Flags().VisitAll(func(f *pflag.Flag) {
		// Environment variables can't have dashes in them, so bind them to their equivalent
		// keys with underscores, e.g. --favorite-color to STING_FAVORITE_COLOR
		if strings.Contains(f.Name, "-") || strings.Contains(f.Name, ".") {
			envVarSuffix := strings.ToUpper(strings.ReplaceAll(f.Name, "-", "_"))
			envVarSuffix = strings.ReplaceAll(envVarSuffix, ".", "_")
			v.BindEnv(f.Name, fmt.Sprintf("%s_%s", envPrefix, envVarSuffix))
		}

		// Apply the viper config value to the flag when the flag is not set and viper has a value
		if !f.Changed && v.IsSet(f.Name) {
			val := v.Get(f.Name)
			cmd.Flags().Set(f.Name, fmt.Sprintf("%v", val))
		}
	})
}
