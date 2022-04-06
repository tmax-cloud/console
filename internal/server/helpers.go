package server

import (
	"compress/gzip"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"strings"
)

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
