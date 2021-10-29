package console

import (
	"console/pkg/auth"
	"fmt"
	"net/http"
	"strings"
)

func (c *Console) JwtHandler(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// c.KeycloakAuthURL
		// c.KeycloakRealm
		realmsPath := "realms/" + c.KeycloakRealm
		authIssuer := singleJoiningSlash(c.KeycloakAuthURL, realmsPath)             // "https://hyperauth.org/auth/realms/tmax"
		authJwks := singleJoiningSlash(authIssuer, "protocol/openid-connect/certs") // "https://hyperauth.org/auth/realms/tmax/protocol/openid-connect/certs"
		jwt := auth.NewJWTMiddleware(authIssuer, authJwks)
		jwt.HandlerWithNext(w, r, next.ServeHTTP)
	})
}

func (c *Console) TokenHandler(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if c.ReleaseModeFlag {
			token := r.Header.Clone().Get("Authorization")
			temp := strings.Split(token, "Bearer ")
			if len(temp) > 1 {
				token = temp[1]
			} else {
				token = temp[0]
			}
			c.StaticUser.Token = token

			// NOTE: query에 token 정보가 있을 시 해당 token으로 설정
			queryToken := r.URL.Query().Get("token")
			if queryToken != "" && token == "" {
				r.URL.Query().Del("token")
				c.StaticUser.Token = queryToken
			}
		} else {
			log.Info("release-mode=false, so use console token")
		}
		next.ServeHTTP(w, r)
	})
}

func (c *Console) SecureHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Prevent MIME sniffing (https://en.wikipedia.org/wiki/Content_sniffing)
		w.Header().Set("X-Content-Type-Options", "nosniff")
		// Ancient weak protection against reflected XSS (equivalent to CSP no unsafe-inline)
		w.Header().Set("X-XSS-Protection", "1; mode=block")
		// Prevent clickjacking attacks involving iframes
		w.Header().Set("X-Frame-Options", "allowall")
		// Less information leakage about what domains we link to
		w.Header().Set("X-DNS-Prefetch-Control", "off")
		// Less information leakage about what domains we link to
		w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
		// allow cross origin referce error
		w.Header().Set("Access-Control-Allow-Origin", "*")
		next.ServeHTTP(w, r)
	})
}

func (c *Console) LogRequest(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Infof("%s - %s %s %s", r.RemoteAddr, r.Proto, r.Method, r.URL.RequestURI())
		next.ServeHTTP(w, r)
	})
}

func (c *Console) RecoverPanic(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				w.Header().Set("Connection", "close")
				c.serverError(w, fmt.Errorf("%s", err))
			}
		}()

		next.ServeHTTP(w, r)
	})
}

func securityHeadersMiddleware(hdlr http.Handler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Prevent MIME sniffing (https://en.wikipedia.org/wiki/Content_sniffing)
		w.Header().Set("X-Content-Type-Options", "nosniff")
		// Ancient weak protection against reflected XSS (equivalent to CSP no unsafe-inline)
		w.Header().Set("X-XSS-Protection", "1; mode=block")
		// Prevent clickjacking attacks involving iframes
		w.Header().Set("X-Frame-Options", "allowall")
		// Less information leakage about what domains we link to
		w.Header().Set("X-DNS-Prefetch-Control", "off")
		// Less information leakage about what domains we link to
		w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
		// allow cross origin referce error
		w.Header().Set("Access-Control-Allow-Origin", "*")
		hdlr.ServeHTTP(w, r)
	}
}
