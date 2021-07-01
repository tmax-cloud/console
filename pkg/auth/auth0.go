package auth

import (
	"context"
	"crypto/tls"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	jwtmiddleware "github.com/auth0/go-jwt-middleware"
	"github.com/form3tech-oss/jwt-go"
)

const (
	// AUTO0_API_IDENTIFIER = "https://domain/v1"
	AUTH0_ISSUER = "https://hyperauth.org/auth/realms/tmax"
	AUTH0_JWKS   = "https://hyperauth.org/auth/realms/tmax/protocol/openid-connect/certs"
	// AUTH0_DOMAIN         = "https://domain.eu.auth0.com"
)

// UserProperty is a name of the property in the request where the user information stored
const UserProperty = "user"

// GetAuthorizedUserID returns a user ID which generated from the auth server
func GetAuthorizedUserID(ctx context.Context) interface{} {
	if claims := ctx.Value(UserProperty); claims != nil {
		return claims.(*jwt.Token).Claims.(jwt.MapClaims)["sub"]
	}
	return nil
}

// NewJWTMiddleware returns a new jwtmiddleware.JWTMiddleware instance.
// This middleware uses to looking for the "access_token" in the request header and call to the auth server for validating it.
// func NewJWTMiddleware(audience, issuer, jwksURI string) *jwtmiddleware.JWTMiddleware {
func NewJWTMiddleware(issuer, jwksURI string) *jwtmiddleware.JWTMiddleware {
	return jwtmiddleware.New(jwtmiddleware.Options{
		ValidationKeyGetter: func(token *jwt.Token) (interface{}, error) {
			// if !token.Claims.(jwt.MapClaims).VerifyAudience(audience, false) {
			// 	return nil, errors.New("invalid audience")
			// }

			if !token.Claims.(jwt.MapClaims).VerifyIssuer(issuer, false) {
				return nil, errors.New("invalid issuer")
			}

			cert, err := getPEMCertificate(token, jwksURI)
			if err != nil {
				return nil, err
			}

			result, _ := jwt.ParseRSAPublicKeyFromPEM([]byte(cert))
			return result, nil
		},
		UserProperty:        UserProperty,
		CredentialsOptional: true,
		Extractor: jwtmiddleware.FromFirst(
			jwtmiddleware.FromAuthHeader,
			jwtmiddleware.FromParameter("token"),
		),
		SigningMethod: jwt.SigningMethodRS256,
		Debug:         false,
	})
}

func getPEMCertificate(token *jwt.Token, jwksURI string) (string, error) {
	// req, _ := http.NewRequest(http.MethodGet, jwksURI, nil)
	// c := &http.Client{
	// 	Transport: http.DefaultTransport,
	// }
	// res, err := c.Do(req)
	// res, err := http.Get("https://hyperauth.org/auth/realms/tmax/protocol/openid-connect/certs")
	c := http.Client{
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{
				InsecureSkipVerify: true,
			},
		},
	}
	req, _ := http.NewRequest(http.MethodGet, jwksURI, http.NoBody)
	res, err := c.Do(req)
	// res, err := http.Get(jwksURI)
	if err != nil {
		return "", err
	}
	defer res.Body.Close()

	var jwks struct {
		Keys []struct {
			Kty string   `json:"kty"`
			Kid string   `json:"kid"`
			Use string   `json:"use"`
			N   string   `json:"n"`
			E   string   `json:"e"`
			X5c []string `json:"x5c"`
		} `json:"keys"`
	}
	if err = json.NewDecoder(res.Body).Decode(&jwks); err != nil {
		return "", err
	}

	var cert string
	for k, _ := range jwks.Keys {
		if token.Header["kid"] == jwks.Keys[k].Kid {
			cert = fmt.Sprintf("-----BEGIN CERTIFICATE-----\n%s\n-----END CERTIFICATE-----", jwks.Keys[k].X5c[0])
		}
	}

	if cert == "" {
		return "", errors.New("unable to find appropriate key")
	}

	return cert, nil
}
