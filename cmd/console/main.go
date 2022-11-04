package main

import (
	"console/internal/console"
	"console/internal/logger"
	"crypto/tls"
	"fmt"
	oscrypto "github.com/openshift/library-go/pkg/crypto"
	flag "github.com/spf13/pflag"
	"golang.org/x/net/context"
	"net/http"
	"net/url"
	"os"
	"os/signal"
	"syscall"
	"time"
)

func main() {
	fs := flag.NewFlagSet("console", flag.ExitOnError)
	listen := fs.String("listen", "https://0.0.0.0:9000", "listen URL")
	baseAddress := fs.String("base-address", "https://0.0.0.0:9000", "Base Address")
	certFile := fs.String("cert-file", "", "TLS cert")
	keyFile := fs.String("key-file", "", "TLS key")
	redirectPort := fs.Int("redirect-port", 0, "redirect port http to https")
	server := console.New(fs)
	zlog := logger.New(fs)
	fs.SortFlags = false
	if err := fs.Parse(os.Args[1:]); err != nil {
		panic(fmt.Errorf("Error parsing params %s, error: %v", os.Args[1:], err))
	}

	if err := server.ValidateConfig(); err != nil {
		panic(fmt.Errorf("Error validating config, error: %v", err))
	}

	log := zlog.GetLogger()
	server.AddLogger(log)
	router := server.CreateRouter()

	listenURL := console.ValidateFlagIsURL("listen", *listen)
	baseURL := console.ValidateFlagIsURL("baseAddress", *baseAddress)

	switch listenURL.Scheme {
	case "http":
	case "https":
		console.ValidateFlagNotEmpty("certFile", *certFile)
		console.ValidateFlagNotEmpty("keyFile", *keyFile)
	default:
		console.FlagFatalf("listen", "scheme must be one of: http, https")
	}
	httpsrv := &http.Server{
		Addr:    listenURL.Host,
		Handler: router,
		// Disable HTTP/2, which breaks WebSockets.
		TLSNextProto: make(map[string]func(*http.Server, *tls.Conn, http.Handler)),
		TLSConfig:    oscrypto.SecureTLSConfig(&tls.Config{}),
	}
	//Run the server
	go func() {
		if listenURL.Scheme == "https" {
			err := httpsrv.ListenAndServeTLS(*certFile, *keyFile)
			if err != nil && err != http.ErrServerClosed {
				log.Panic().Err(err)
			}
		} else {
			err := httpsrv.ListenAndServe()
			if err != nil && err != http.ErrServerClosed {
				log.Panic().Err(err)
			}
		}
	}()

	redirectServer := &http.Server{}
	if *redirectPort != 0 {
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
		redirectPort := fmt.Sprintf(":%d", *redirectPort)
		redirectServer = &http.Server{
			Addr:    redirectPort,
			Handler: mux,
		}
		go func() {
			err := redirectServer.ListenAndServe()
			if err != nil && err != http.ErrServerClosed {
				log.Error().Err(err)
				os.Exit(1)
			}
		}()
	}

	serverCtx, serverStopCtx := context.WithCancel(context.Background())
	sig := make(chan os.Signal, 1)
	signal.Notify(sig, syscall.SIGHUP, syscall.SIGINT, syscall.SIGTERM, syscall.SIGQUIT)
	go func() {
		<-sig
		log.Info().Msg("Shutdown signal received")
		// Shutdown signal with grace period of 30 seconds
		shutdownCtx, _ := context.WithTimeout(serverCtx, 30*time.Second)

		go func() {
			<-shutdownCtx.Done()
			if shutdownCtx.Err() == context.DeadlineExceeded {
				log.Error().Msg("graceful shutdown timed out.. forcing exit.")
				os.Exit(1)
			}
		}()

		// Trigger graceful shutdown
		log.Info().Msg("Shutdown signal received")
		err := httpsrv.Shutdown(shutdownCtx)
		if err != nil {
			log.Error().Err(err).Msg("graceful shutdown timed out.. forcing exit.")
			os.Exit(1)
		}
		log.Info().Msg("graceful Shutdown redirectServer")
		if *redirectPort != 0 {
			err := redirectServer.Shutdown(shutdownCtx)
			if err != nil {
				log.Error().Err(err)
				//logger.Log("Error", err)
				os.Exit(1)
			}
		}
		serverStopCtx()
	}()

	<-serverCtx.Done()
}
