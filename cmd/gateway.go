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
	v1 "console/pkg/api/v1"
	"console/pkg/config/dynamic"
	"console/pkg/console"

	// "github.com/openshift/library-go/pkg/crypto"
	"console/pkg/hypercloud"
	pServer "console/pkg/hypercloud"
	"console/pkg/hypercloud/provider/file"
	"console/pkg/hypercloud/proxy"
	"console/pkg/hypercloud/router"
	"console/pkg/hypercloud/safe"
	"context"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"os"

	oscrypto "github.com/openshift/library-go/pkg/crypto"

	"github.com/justinas/alice"
	"github.com/pkg/errors"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

// serverCmd represents the server command
var serverCmd = &cobra.Command{
	Use: "gateway ( -f CONFIGFILE | [])",

	Short: "Run as API gateway",

	Long: `hypercloud api gateway`,

	Run: func(cmd *cobra.Command, args []string) {
		log.Infof("On SERVER: %v \n", *cfg)
		log.Infoln("Use Gateway handler")
		// Create Static handler
		err := v1.ValidateConfig(cfg)
		if err != nil {
			log.WithField("FILE", "root.go").Errorf("Validate Error: v1.ValidateConfig, line: 56 %v \n", err)
			os.Exit(1)
		}
		staticServer, err := console.New(cfg)
		if err != nil {
			log.Errorf("error occure when create console.New(cfg) %v \n", err)
		}
		// staticHandler := staticServer.Gateway()

		// Get Default Server
		defaultServer = viper.Get("SERVER").(*hypercloud.HttpServer)

		// file
		if _, err := os.Stat(cfg.DynamicFile); os.IsNotExist(err) {
			log.Infof("Not Exist Proxy Config file : %s", cfg.DynamicFile)
			log.Infof("So create proxy config file : %s", cfg.DynamicFile)
			f, _ := os.Create(cfg.DynamicFile)
			err = f.Chmod(0777)
			if err != nil {
				log.Errorf("Error occur when change file permission %v \n", err)
			}
		}
		var pvd = new(file.Provider)
		pvd.Watch = true
		// dir, _ := os.Getwd()
		// pvd.Filename = dir + "/configs/dynamic-config.yaml"
		pvd.Filename = string(cfg.DynamicFile)

		routinesPool := safe.NewPool(context.Background())
		watcher := pServer.NewWatcher(pvd, routinesPool)
		// watcher.AddListener(switchRouter(staticServer, staticHandler, defaultServer))
		watcher.AddListener(switchRouter(staticServer, defaultServer))
		watcher.Start()
	},
}

func init() {
}

// Create Router when changing proxy config
// func switchRouter(staticServer *console.Console, defaultHandler http.Handler, proxySrv *pServer.HttpServer) func(config dynamic.Configuration) {
func switchRouter(staticServer *console.Console, defaultServer *pServer.HttpServer) func(config dynamic.Configuration) {
	return func(config dynamic.Configuration) {
		log.Info("===Starting SwitchRouter====")
		routerTemp, err := router.NewRouter()
		if err != nil {
			log.Info("Failed to create router ", err)
			// return nil, err
		}
		log.Infof("buildHandler : %v  \n", config.Routers)
		c := staticServer
		standardMiddleware := alice.New(c.RecoverPanic, c.LogRequest, c.SecureHeaders)
		tokenMiddleware := alice.New(c.TokenHandler) // select token depending on release-mode

		for name, value := range config.Routers {
			log.Infof("Create Hypercloud proxy based on %v: %v \n", name, value)
			backURL, err := url.Parse(value.Server)
			if err != nil {
				log.Error(errors.Wrapf(err, "URL Parsing failed for: %s", value.Server))
			}
			dhconfig := &proxy.Config{
				TLSClientConfig: oscrypto.SecureTLSConfig(&tls.Config{
					InsecureSkipVerify: true,
				}),
				HeaderBlacklist: []string{"X-CSRFToken"},
				Endpoint:        backURL,
			}
			dhproxy := proxy.NewProxy(dhconfig)

			err = routerTemp.AddRoute(value.Rule, 0, http.StripPrefix(value.Path, tokenMiddleware.ThenFunc(func(w http.ResponseWriter, r *http.Request) {
				r.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.StaticUser.Token))
				dhproxy.ServeHTTP(w, r)
			})))
			if err != nil {
				log.Error("failed to put proxy handler into Router", err)
			}
		}

		err = routerTemp.AddRoute("PathPrefix(`/api/console/dynamic`)", 0, http.HandlerFunc(
			func(rw http.ResponseWriter, r *http.Request) {
				rw.Header().Set("Content-Type", "application/json")
				err := json.NewEncoder(rw).Encode(config)
				if err != nil {
					log.Error("failed to encode config information")
					http.NotFound(rw, r)
					return
				}
			},
		))
		if err != nil {
			log.Error("/api/console/dynamic has a problem", err)
		}
		// routerTemp.AddRoute("PathPrefix(`/api/console/ingress`)", 0, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// 	c.IngressHandler(w, r)
		// }))

		err = routerTemp.AddRoute("PathPrefix(`/`)", 0, staticServer.Gateway())
		if err != nil {
			log.Error("failed to put hypercloud proxy", err)
			// return nil, err
		}

		log.Info("===End SwitchRouter ===")
		log.Info("Call updateHandler --> routerTemp.Router")
		// olderSrv:=proxySrv.Handler.Switcher.GetHandler()

		if defaultServer.Switcher.GetHandler() == nil {
			defaultServer.Switcher.UpdateHandler(http.NotFoundHandler())
		}
		defaultServer.Switcher.UpdateHandler(standardMiddleware.Then(routerTemp))
		// defaultServer.Switcher.UpdateHandler(routerTemp)

	}
}
