/*


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

package v1

// +k8s:deepcopy-gen=true
type Config struct {
	APIVersion  string `yaml:"apiVersion"`
	Kind        string `yaml:"kind"`
	ConsoleInfo `yaml:"consoleInfo"`
	ClusterInfo `yaml:"clusterInfo"`
	AuthInfo    `yaml:"authInfo"`
	AppInfo     `yaml:"appInfo"`
}

// +k8s:deepcopy-gen=true
type ConsoleInfo struct {
	Listen       string `yaml:"listen,omitempty"`
	BaseAddress  string `yaml:"baseAddress,omitempty"`
	BasePath     string `yaml:"basePath,omitempty"`
	CertFile     string `yaml:"certFile,omitempty"`
	KeyFile      string `yaml:"keyFile,omitempty"`
	RedirectPort int    `yaml:"redirectPort,omitempty"`
}

// +k8s:deepcopy-gen=true
// Auth holds configuration for authenticating with OpenShift. The auth method is assumed to be "openshift".
type AuthInfo struct {
	KeycloakRealm           string `yaml:"keycloakRealm,omitempty"`
	KeycloakAuthURL         string `yaml:"keycloakAuthURL,omitempty"`
	KeycloakClientId        string `yaml:"keycloakClientId,omitempty"`
	KeycloakUseHiddenIframe bool   `yaml:"keycloakUseHiddenIframe,omitempty"`
}

// +k8s:deepcopy-gen=true
// ClusterInfo holds information the about the cluster such as master public URL and console public URL.
type ClusterInfo struct {
	K8sEndpoint string `yaml:"masterPublicURL,omitempty"`
	BearerToken string `yaml:"bearerToken,omitempty"`
	// main app
	HypercloudEndpoint      string `yaml:"hypercloudEndpoint,omitempty"`
	MultiHypercloudEndpoint string `yaml:"multiHypercloudEndpoint,omitempty"`
	WebhookEndpoint         string `yaml:"WebhookEndpoint,omitempty"`
	// Monitoring app
	GrafanaEndpoint      string `yaml:"grafanaEndpoint,omitempty"`
	AlertmanagerEndpoint string `yaml:"alertmanagerEndpoint,omitempty"`
	PrometheusEndpoint   string `yaml:"prometheusEndpoint,omitempty"`
	// Third party app
	KialiEndpoint    string `yaml:"kialiEndpoint,omitempty"`
	KibanaEndpoint   string `yaml:"kibanaEndpoint,omitempty"`
	KubeflowEndpoint string `yaml:"kubeflowEndpoint,omitempty"`
	GitlabURL        string `yaml:"gitlabURL,omitempty"`
}

// +k8s:deepcopy-gen=true
type AppInfo struct {
	McMode      bool   `yaml:"mcMode,omitempty"`
	ReleaseMode bool   `yaml:"releaseMode,omitempty"`
	PublicDir   string `yaml:"publicDir,omitempty"`
	DynamicFile string `yaml:"dynamicFile,omitempty"`
}
