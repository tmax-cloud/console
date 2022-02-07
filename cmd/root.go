/*
Copyright © 2021 NAME HERE <EMAIL ADDRESS>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
package cmd

import (
	"context"
	"fmt"

	v1 "console/pkg/api/v1"
	"console/pkg/hypercloud"

	"github.com/sirupsen/logrus"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var (
	defaultServer = &hypercloud.HttpServer{}
)

// rootCmd represents the base command when called without any subcommands
var (
	cfgFile string
	cfg     *v1.Config

	log = logrus.New().WithField("MODULE", "CMD")

	rootCmd = &cobra.Command{
		Use:   "console",
		Short: "",
		Long:  ``,
		PersistentPreRun: func(cmd *cobra.Command, args []string) {
			log.WithField("FILE", "root.go").Println("CALL: root persistentPreRun")
			server, err := hypercloud.New(&cfg.ConsoleInfo)
			if err != nil {
				log.WithField("FILE", "root.go").Errorf("Error is occur while create default server %v \n", err)
			}
			log.WithField("FILE", "root.go").Printf("DEFAULT SERVER CONFIG: \n %v \n", server.DefaultConfig)
			server.Start(context.TODO())
			viper.Set("SERVER", server)
			fmt.Println("viper value")
			fmt.Println(viper.AllKeys())
		},

		Run: func(cmd *cobra.Command, args []string) {
			cmd.HelpFunc()(cmd, args)
		},
	}
)

// Execute adds all child commands to the root command and sets flags appropriately.
// This is called by main.main(). It only needs to happen once to the rootCmd.
func Execute() {
	cobra.CheckErr(rootCmd.Execute())
}

func init() {
	cfg = &v1.Config{}
	cobra.OnInitialize(initConfig)
	rootCmd.PersistentFlags().StringVar(&cfgFile, "config", "", "config file (default is $HOME/configs/console.yaml)")
	// consoleInfo
	rootCmd.PersistentFlags().StringVar(&cfg.Listen, "listen", "http://0.0.0.0:6443", "listen Address")
	rootCmd.PersistentFlags().StringVar(&cfg.BaseAddress, "base-address", "http://0.0.0.0:6443", "Format: <http | https>://domainOrIPAddress[:port]. Example: https://console.hypercloud.com.")
	rootCmd.PersistentFlags().StringVar(&cfg.BasePath, "basePath", "/", "")
	rootCmd.PersistentFlags().StringVar(&cfg.CertFile, "tls-cert-file", "./tls/tls.crt", "TLS certificate. If the certificate is signed by a certificate authority, the certFile should be the concatenation of the server's certificate followed by the CA's certificate.")
	rootCmd.PersistentFlags().StringVar(&cfg.KeyFile, "tls-key-file", "./tls/tls.key", "The TLS certificate key.")
	rootCmd.PersistentFlags().IntVar(&cfg.RedirectPort, "redirect-port", 0, "Port number under which the console should listen for custom hostname redirect.")
	// authInfo
	rootCmd.PersistentFlags().StringVar(&cfg.KeycloakRealm, "keycloak-realm", "", "Keycloak Realm Name")
	rootCmd.PersistentFlags().StringVar(&cfg.KeycloakClientId, "keycloak-client-id", "", "Keycloak Client Id")
	rootCmd.PersistentFlags().StringVar(&cfg.KeycloakAuthURL, "keycloak-auth-url", "", "URL of the Keycloak Auth server.")
	rootCmd.PersistentFlags().BoolVar(&cfg.KeycloakUseHiddenIframe, "keycloak-use-hidden-iframe", false, "Use keycloak Hidden Iframe")
	// clusterInfo
	rootCmd.PersistentFlags().StringVar(&cfg.K8sEndpoint, "k8s-endpoint", "", "when addr is empty, we consider console installed in k8s")
	rootCmd.PersistentFlags().StringVar(&cfg.BearerToken, "bearer-token", "", "when off-cluster, you should fill out bearer-token")
	rootCmd.PersistentFlags().StringVar(&cfg.HypercloudEndpoint, "hypercloud-endpoint", "", "URL of the Hypercloud Server API server")
	rootCmd.PersistentFlags().StringVar(&cfg.MultiHypercloudEndpoint, "multi-hypercloud-endpoint", "", "URL of the Multi Hypercloud Server API server")
	rootCmd.PersistentFlags().StringVar(&cfg.WebhookEndpoint, "webhook-endpoint", "", "URL of the hypercloud webhook endpoint")
	rootCmd.PersistentFlags().StringVar(&cfg.PrometheusEndpoint, "prometheus-endpoint", "", "URL of the prometheus endpoint")
	rootCmd.PersistentFlags().StringVar(&cfg.AlertmanagerEndpoint, "alertmanager-endpoint", "", "URL of the alertmanager endpoint")
	rootCmd.PersistentFlags().StringVar(&cfg.GrafanaEndpoint, "grafana-endpoint", "", "URL of the Grafana UI server.")
	rootCmd.PersistentFlags().StringVar(&cfg.KialiEndpoint, "kiali-endpoint", "", "URL of the KIALI Portal")
	rootCmd.PersistentFlags().StringVar(&cfg.KibanaEndpoint, "kibana-endpoint", "", "URL of the KIBANA Portal")
	rootCmd.PersistentFlags().StringVar(&cfg.KubeflowEndpoint, "kubeflow-endpoint", "", "URL of the Kubeflow server")
	rootCmd.PersistentFlags().StringVar(&cfg.GitlabURL, "managed-gitlab-url", "http://gitlab-test-deploy.ck1-2.192.168.6.151.nip.io/", "URL of gitlab server")
	// appInfo
	rootCmd.PersistentFlags().BoolVar(&cfg.McMode, "mc-mode", true, "Choose Cluster Mode (multi | single)")
	rootCmd.PersistentFlags().BoolVar(&cfg.ReleaseMode, "release-mode", true, "when true, use jwt token given by keycloak")
	rootCmd.PersistentFlags().StringVar(&cfg.PublicDir, "public-dir", "./frontend/public/dist", "listen Address")
	rootCmd.PersistentFlags().StringVar(&cfg.DynamicFile, "dynamic-file", "./configs/dynamic-config.yaml", "dynamic config file (default is ./configs/dynamic-config.yaml")
	rootCmd.PersistentFlags().StringVar(&cfg.CustomProductName, "custom-product-name", "hypercloud", "prduct name for console | default hypercloud")

	err := viper.BindPFlags(rootCmd.Flags())
	if err != nil {
		log.WithField("FILE", "root.go").Errorf("error: viper.BindPFlags, line: 88 %v \n", err)
	}

	rootCmd.AddCommand(serverCmd)
	rootCmd.AddCommand(proxyCmd)
}

// initConfig reads in config file and ENV variables if set.
func initConfig() {
	if cfgFile == "" {
		cfg.APIVersion = "console.hypercloud.io/v1beta1"
		cfg.Kind = "ConsoleConfig"
		rootCmd.MarkPersistentFlagRequired("keycloak-realm")
		rootCmd.MarkPersistentFlagRequired("keycloak-client-id")
		rootCmd.MarkPersistentFlagRequired("keycloak-auth-url")
		return
	}
	viper.SetConfigFile(cfgFile)
	viper.AutomaticEnv() // read in environment variables that match

	if err := viper.ReadInConfig(); err == nil {
		log.WithField("FILE", "root.go").Println("Using config file:", viper.ConfigFileUsed())
	}
	if err := viper.Unmarshal(&cfg); err != nil {
		log.WithField("FILE", "root.go").Errorf("Fail to unmarshal the config %v \n", err)
	}
	log.WithField("FILE", "root.go").Printf("config ==> \n %v \n", cfg)
}
