package server

import (
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

type Server struct {
	App *App
	*K8sHandler

	router chi.Router
}

func NewServer(app *App, k8sHandler *K8sHandler) *Server {
	s := &Server{
		App:        app,
		K8sHandler: k8sHandler,
	}

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
	r.Mount(s.App.BasePath, http.HandlerFunc(s.App.indexHandler))

	r.Mount("/api/hypercloud", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.Error(w, "501 StatusNotFound", http.StatusNotImplemented)
	}))

	fileServer(r, singleJoiningSlash(s.App.BasePath, "/static"), http.Dir(s.App.PublicDir))
	fileServer(r, singleJoiningSlash(s.App.BasePath, "/api/resource"), http.Dir("./api"))
	fileServer(r, singleJoiningSlash(s.App.BasePath, "/usermanual"), http.Dir(singleJoiningSlash(s.App.PublicDir, "/usermanual")))

	consoleProxyPath := singleJoiningSlash(s.App.BasePath, "/api/console")
	r.Route(consoleProxyPath, func(r chi.Router) {
		r.Method("GET", "/apis/networking.k8s.io/*",
			http.StripPrefix(consoleProxyPath, http.HandlerFunc(s.ConsoleProxyHandler)))
		r.Method("GET", "/api/v1/*",
			http.StripPrefix(consoleProxyPath, http.HandlerFunc(s.ConsoleProxyHandler)))
	})

	//proxyK8SPath := singleJoiningSlash(s.App.BasePath, "/api/kubernetes")
	//r.Handle(proxyK8SPath+"/*",http.StripPrefix(proxyK8SPath,http.HandlerFunc(s.K8sProxyHandler)))

	r.Method("GET", "/metrics", promhttp.Handler())

	s.router = r

	return s
}

func (s Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	s.router.ServeHTTP(w, r)
}

func fileServer(r chi.Router, path string, root http.FileSystem) {
	if strings.ContainsAny(path, "{}*") {
		panic("FileServer does not permit any URL parameters.")
	}

	if path != "/" && path[len(path)-1] != '/' {
		r.Get(path, http.RedirectHandler(path+"/", 301).ServeHTTP)
		path += "/"
	}
	path += "*"

	r.Get(path, func(w http.ResponseWriter, r *http.Request) {
		rctx := chi.RouteContext(r.Context())
		pathPrefix := strings.TrimSuffix(rctx.RoutePattern(), "/*")
		fs := http.StripPrefix(pathPrefix, gzipHandler(http.FileServer(root)))
		fs.ServeHTTP(w, r)
	})
}
