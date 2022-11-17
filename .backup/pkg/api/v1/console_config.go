package v1

import (
	"fmt"

	"github.com/sirupsen/logrus"
)

var (
	log = logrus.New().WithField("MODULE", "api/v1")
)

func ValidateConfig(config *Config) (err error) {
	if !(config.APIVersion == "console.hypercloud.io/v1beta1" || config.APIVersion == "console.hypercloud.io/v1") || config.Kind != "ConsoleConfig" {
		return fmt.Errorf("unsupported version (apiVersion: %s, kind: %s), only console.hypercloud.io/v1 ConsoleConfig is supported", config.APIVersion, config.Kind)
	}

	if config.AuthInfo.KeycloakAuthURL == "" || config.AuthInfo.KeycloakClientId == "" || config.AuthInfo.KeycloakRealm == "" {
		return fmt.Errorf("Need to Auth Info (keycloakAuthURL: %s, KeycloakClientId: %s, KeycloakRealm: %s", config.AuthInfo.KeycloakAuthURL, config.AuthInfo.KeycloakClientId, config.AuthInfo.KeycloakRealm)
	}

	return nil
}
