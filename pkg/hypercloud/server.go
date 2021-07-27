package hypercloud

import (
	"context"
	"crypto/tls"
	"fmt"
	"net/http"
	"net/url"
	"strings"

	v1 "console/pkg/api/v1"
	"console/pkg/hypercloud/safe"

	"github.com/openshift/library-go/pkg/crypto"
	// "github.com/openshift/library-go/pkg/crypto"

	"github.com/sirupsen/logrus"
)

var (
	log = logrus.New().WithField("MODULE", "HYPERCLOUD")
)

type stoppableServer interface {
	Shutdown(ctx context.Context) error
	Close() error
	ListenAndServe() error
}
type HttpServer struct {
	Server        stoppableServer
	Switcher      *HTTPHandlerSwitcher
	DefaultConfig *v1.ConsoleInfo
}

func New(config *v1.ConsoleInfo) (*HttpServer, error) {
	log.Infoln("New Server")
	cfg := config.DeepCopy()
	err := validateConfig(cfg)
	if err != nil {
		log.WithField("FILE", "server.go").Errorf("Failed to validateConfig %v \n", err)
		return nil, err
	}
	httpSwitcher := NewHandlerSwitcher(http.NotFoundHandler())
	handler := httpSwitcher
	listenURL, err := url.Parse(config.Listen)
	if err != nil {
		log.Errorf("Failed to parse consoleInfo.listen %v \n", err)
	}

	serverHTTP := &http.Server{
		Addr:         listenURL.Host,
		Handler:      handler,
		TLSNextProto: make(map[string]func(*http.Server, *tls.Conn, http.Handler)),
		TLSConfig:    crypto.SecureTLSConfig(&tls.Config{}),
	}

	return &HttpServer{
		Server:        serverHTTP,
		Switcher:      httpSwitcher,
		DefaultConfig: cfg,
	}, nil
}

func (s *HttpServer) Start(ctx context.Context) {
	log.WithField("FILE", "server.go").Info("Start Server")
	serverHTTP := s.Server.(*http.Server)
	listenURL, err := url.Parse(s.DefaultConfig.Listen)
	if err != nil {
		log.WithField("FILE", "server.go").Println("failt to parsing URL")
	}
	log.WithField("FILE", "server.go").Info("Run Server using go routine")
	csr := s.DefaultConfig.CertFile
	key := s.DefaultConfig.KeyFile

	if s.DefaultConfig.RedirectPort != 0 {
		go func() {
			// Listen on passed port number to be redirected to the console
			redirectServer := http.NewServeMux()
			redirectServer.HandleFunc("/", func(res http.ResponseWriter, req *http.Request) {
				reqIp := strings.Split(req.Host, ":")[0]
				redirectPort := strings.Split(listenURL.Host, ":")[1]
				host := reqIp + ":" + redirectPort
				redirectURL := &url.URL{
					Scheme:   listenURL.Scheme,
					Host:     host,
					RawQuery: req.URL.RawQuery,
					Path:     req.URL.Path,
				}
				http.Redirect(res, req, redirectURL.String(), http.StatusFound)
			})
			redirectPort := fmt.Sprintf(":%d", s.DefaultConfig.RedirectPort)
			log.WithField("FILE", "server.go").Infof("Listening on %q for custom hostname redirect...", redirectPort)
			log.WithField("FILE", "server.go").Fatal(http.ListenAndServe(redirectPort, redirectServer))
		}()
	}

	go func() {
		log.WithField("FILE", "server.go").Infof("Binding to %s...", serverHTTP.Addr)
		if listenURL.Scheme == "https" {
			log.WithField("FILE", "server.go").Info("using TLS")
			log.WithField("FILE", "server.go").Fatal(serverHTTP.ListenAndServeTLS(csr, key))
		} else {
			log.WithField("FILE", "server.go").Info("not using TLS")
			log.WithField("FILE", "server.go").Fatal(serverHTTP.ListenAndServe())
		}
	}()
}

type HTTPHandlerSwitcher struct {
	handler *safe.Safe
}

// NewHandlerSwitcher builds a new instance of HTTPHandlerSwitcher.
func NewHandlerSwitcher(newHandler http.Handler) (hs *HTTPHandlerSwitcher) {
	return &HTTPHandlerSwitcher{
		handler: safe.New(newHandler),
	}
}

func (h *HTTPHandlerSwitcher) ServeHTTP(rw http.ResponseWriter, req *http.Request) {
	handlerBackup := h.handler.Get().(http.Handler)
	handlerBackup.ServeHTTP(rw, req)
}

// GetHandler returns the current http.ServeMux.
func (h *HTTPHandlerSwitcher) GetHandler() (newHandler http.Handler) {
	handler := h.handler.Get().(http.Handler)
	return handler
}

// UpdateHandler safely updates the current http.ServeMux with a new one.
func (h *HTTPHandlerSwitcher) UpdateHandler(newHandler http.Handler) {
	h.handler.Set(newHandler)
}

func validateConfig(config *v1.ConsoleInfo) (err error) {

	return nil
}
