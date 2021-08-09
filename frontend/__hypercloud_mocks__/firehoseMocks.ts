export const DeploymentsTestData = {
  data: [
    {
      metadata: {
        annotations: {
          'deployment.kubernetes.io/revision': '1',
          'kubectl.kubernetes.io/last-applied-configuration':
            '{"apiVersion":"apps/v1","kind":"Deployment","metadata":{"annotations":{},"labels":{"app":"catalog-catalog","chart":"catalog-0.3.0","heritage":"Tiller","release":"catalog"},"name":"catalog-catalog-controller-manager","namespace":"catalog"},"spec":{"minReadySeconds":1,"replicas":1,"selector":{"matchLabels":{"app":"catalog-catalog-controller-manager"}},"strategy":{"type":"RollingUpdate"},"template":{"metadata":{"annotations":{"prometheus.io/scrape":"false"},"labels":{"app":"catalog-catalog-controller-manager","chart":"catalog-0.3.0","heritage":"Tiller","release":"catalog"}},"spec":{"containers":[{"args":["controller-manager","--secure-port","8444","--cluster-id-configmap-namespace=catalog","--leader-elect=false","--profiling=false","-v","10","--resync-interval","5m","--broker-relist-interval","24h","--operation-polling-maximum-backoff-duration","20m","--osb-api-request-timeout","60s","--feature-gates","OriginatingIdentity=true","--feature-gates","ServicePlanDefaults=false"],"env":[{"name":"K8S_NAMESPACE","valueFrom":{"fieldRef":{"fieldPath":"metadata.namespace"}}}],"image":"quay.io/kubernetes-service-catalog/service-catalog:v0.3.0","imagePullPolicy":"Always","livenessProbe":{"failureThreshold":3,"httpGet":{"path":"/healthz","port":8444,"scheme":"HTTPS"},"initialDelaySeconds":40,"periodSeconds":10,"successThreshold":1,"timeoutSeconds":5},"name":"controller-manager","ports":[{"containerPort":8444}],"readinessProbe":{"failureThreshold":1,"httpGet":{"path":"/healthz/ready","port":8444,"scheme":"HTTPS"},"initialDelaySeconds":20,"periodSeconds":10,"successThreshold":1,"timeoutSeconds":5},"resources":{"limits":{"cpu":"50m","memory":"30Mi"},"requests":{"cpu":"30m","memory":"20Mi"}},"volumeMounts":[{"mountPath":"/var/run","name":"run"}]}],"serviceAccountName":"service-catalog-controller-manager","volumes":[{"emptyDir":{},"name":"run"}]}}}}\n',
        },
        selfLink: '/apis/apps/v1/namespaces/catalog/deployments/catalog-catalog-controller-manager',
        resourceVersion: '88752592',
        name: 'catalog-catalog-controller-manager',
        uid: '8b12e367-e9e3-4596-9a5c-b4884887923d',
        creationTimestamp: '2021-05-22T08:10:37Z',
        generation: 1,
        managedFields: [
          {
            manager: 'kubectl-client-side-apply',
            operation: 'Update',
            apiVersion: 'apps/v1',
            time: '2021-05-22T08:10:37Z',
            fieldsType: 'FieldsV1',
            fieldsV1: {
              'f:metadata': {
                'f:annotations': {
                  '.': {},
                  'f:kubectl.kubernetes.io/last-applied-configuration': {},
                },
                'f:labels': {
                  '.': {},
                  'f:app': {},
                  'f:chart': {},
                  'f:heritage': {},
                  'f:release': {},
                },
              },
              'f:spec': {
                'f:minReadySeconds': {},
                'f:progressDeadlineSeconds': {},
                'f:replicas': {},
                'f:revisionHistoryLimit': {},
                'f:selector': {
                  'f:matchLabels': {
                    '.': {},
                    'f:app': {},
                  },
                },
                'f:strategy': {
                  'f:rollingUpdate': {
                    '.': {},
                    'f:maxSurge': {},
                    'f:maxUnavailable': {},
                  },
                  'f:type': {},
                },
                'f:template': {
                  'f:metadata': {
                    'f:annotations': {
                      '.': {},
                      'f:prometheus.io/scrape': {},
                    },
                    'f:labels': {
                      '.': {},
                      'f:app': {},
                      'f:chart': {},
                      'f:heritage': {},
                      'f:release': {},
                    },
                  },
                  'f:spec': {
                    'f:volumes': {
                      '.': {},
                      'k:{"name":"run"}': {
                        '.': {},
                        'f:emptyDir': {},
                        'f:name': {},
                      },
                    },
                    'f:containers': {
                      'k:{"name":"controller-manager"}': {
                        'f:image': {},
                        'f:volumeMounts': {
                          '.': {},
                          'k:{"mountPath":"/var/run"}': {
                            '.': {},
                            'f:mountPath': {},
                            'f:name': {},
                          },
                        },
                        'f:terminationMessagePolicy': {},
                        '.': {},
                        'f:resources': {
                          '.': {},
                          'f:limits': {
                            '.': {},
                            'f:cpu': {},
                            'f:memory': {},
                          },
                          'f:requests': {
                            '.': {},
                            'f:cpu': {},
                            'f:memory': {},
                          },
                        },
                        'f:args': {},
                        'f:livenessProbe': {
                          '.': {},
                          'f:failureThreshold': {},
                          'f:httpGet': {
                            '.': {},
                            'f:path': {},
                            'f:port': {},
                            'f:scheme': {},
                          },
                          'f:initialDelaySeconds': {},
                          'f:periodSeconds': {},
                          'f:successThreshold': {},
                          'f:timeoutSeconds': {},
                        },
                        'f:env': {
                          '.': {},
                          'k:{"name":"K8S_NAMESPACE"}': {
                            '.': {},
                            'f:name': {},
                            'f:valueFrom': {
                              '.': {},
                              'f:fieldRef': {
                                '.': {},
                                'f:apiVersion': {},
                                'f:fieldPath': {},
                              },
                            },
                          },
                        },
                        'f:readinessProbe': {
                          '.': {},
                          'f:failureThreshold': {},
                          'f:httpGet': {
                            '.': {},
                            'f:path': {},
                            'f:port': {},
                            'f:scheme': {},
                          },
                          'f:initialDelaySeconds': {},
                          'f:periodSeconds': {},
                          'f:successThreshold': {},
                          'f:timeoutSeconds': {},
                        },
                        'f:terminationMessagePath': {},
                        'f:imagePullPolicy': {},
                        'f:ports': {
                          '.': {},
                          'k:{"containerPort":8444,"protocol":"TCP"}': {
                            '.': {},
                            'f:containerPort': {},
                            'f:protocol': {},
                          },
                        },
                        'f:name': {},
                      },
                    },
                    'f:dnsPolicy': {},
                    'f:serviceAccount': {},
                    'f:restartPolicy': {},
                    'f:schedulerName': {},
                    'f:terminationGracePeriodSeconds': {},
                    'f:serviceAccountName': {},
                    'f:securityContext': {},
                  },
                },
              },
            },
          },
          {
            manager: 'kube-controller-manager',
            operation: 'Update',
            apiVersion: 'apps/v1',
            time: '2021-07-31T20:49:44Z',
            fieldsType: 'FieldsV1',
            fieldsV1: {
              'f:metadata': {
                'f:annotations': {
                  'f:deployment.kubernetes.io/revision': {},
                },
              },
              'f:status': {
                'f:availableReplicas': {},
                'f:conditions': {
                  '.': {},
                  'k:{"type":"Available"}': {
                    '.': {},
                    'f:lastTransitionTime': {},
                    'f:lastUpdateTime': {},
                    'f:message': {},
                    'f:reason': {},
                    'f:status': {},
                    'f:type': {},
                  },
                  'k:{"type":"Progressing"}': {
                    '.': {},
                    'f:lastTransitionTime': {},
                    'f:lastUpdateTime': {},
                    'f:message': {},
                    'f:reason': {},
                    'f:status': {},
                    'f:type': {},
                  },
                },
                'f:observedGeneration': {},
                'f:readyReplicas': {},
                'f:replicas': {},
                'f:updatedReplicas': {},
              },
            },
          },
        ],
        namespace: 'catalog',
        labels: {
          app: 'catalog-catalog',
          chart: 'catalog-0.3.0',
          heritage: 'Tiller',
          release: 'catalog',
        },
      },
      spec: {
        replicas: 1,
        selector: {
          matchLabels: {
            app: 'catalog-catalog-controller-manager',
          },
        },
        template: {
          metadata: {
            creationTimestamp: null,
            labels: {
              app: 'catalog-catalog-controller-manager',
              chart: 'catalog-0.3.0',
              heritage: 'Tiller',
              release: 'catalog',
            },
            annotations: {
              'prometheus.io/scrape': 'false',
            },
          },
          spec: {
            restartPolicy: 'Always',
            serviceAccountName: 'service-catalog-controller-manager',
            schedulerName: 'default-scheduler',
            terminationGracePeriodSeconds: 30,
            securityContext: {},
            containers: [
              {
                resources: {
                  limits: {
                    cpu: '50m',
                    memory: '30Mi',
                  },
                  requests: {
                    cpu: '30m',
                    memory: '20Mi',
                  },
                },
                readinessProbe: {
                  httpGet: {
                    path: '/healthz/ready',
                    port: 8444,
                    scheme: 'HTTPS',
                  },
                  initialDelaySeconds: 20,
                  timeoutSeconds: 5,
                  periodSeconds: 10,
                  successThreshold: 1,
                  failureThreshold: 1,
                },
                terminationMessagePath: '/dev/termination-log',
                name: 'controller-manager',
                livenessProbe: {
                  httpGet: {
                    path: '/healthz',
                    port: 8444,
                    scheme: 'HTTPS',
                  },
                  initialDelaySeconds: 40,
                  timeoutSeconds: 5,
                  periodSeconds: 10,
                  successThreshold: 1,
                  failureThreshold: 3,
                },
                env: [
                  {
                    name: 'K8S_NAMESPACE',
                    valueFrom: {
                      fieldRef: {
                        apiVersion: 'v1',
                        fieldPath: 'metadata.namespace',
                      },
                    },
                  },
                ],
                ports: [
                  {
                    containerPort: 8444,
                    protocol: 'TCP',
                  },
                ],
                imagePullPolicy: 'Always',
                volumeMounts: [
                  {
                    name: 'run',
                    mountPath: '/var/run',
                  },
                ],
                terminationMessagePolicy: 'File',
                image: 'quay.io/kubernetes-service-catalog/service-catalog:v0.3.0',
                args: ['controller-manager', '--secure-port', '8444', '--cluster-id-configmap-namespace=catalog', '--leader-elect=false', '--profiling=false', '-v', '10', '--resync-interval', '5m', '--broker-relist-interval', '24h', '--operation-polling-maximum-backoff-duration', '20m', '--osb-api-request-timeout', '60s', '--feature-gates', 'OriginatingIdentity=true', '--feature-gates', 'ServicePlanDefaults=false'],
              },
            ],
            serviceAccount: 'service-catalog-controller-manager',
            volumes: [
              {
                name: 'run',
                emptyDir: {},
              },
            ],
            dnsPolicy: 'ClusterFirst',
          },
        },
        strategy: {
          type: 'RollingUpdate',
          rollingUpdate: {
            maxUnavailable: '25%',
            maxSurge: '25%',
          },
        },
        minReadySeconds: 1,
        revisionHistoryLimit: 10,
        progressDeadlineSeconds: 600,
      },
      status: {
        observedGeneration: 1,
        replicas: 1,
        updatedReplicas: 1,
        readyReplicas: 1,
        availableReplicas: 1,
        conditions: [
          {
            type: 'Progressing',
            status: 'True',
            lastUpdateTime: '2021-05-22T08:11:23Z',
            lastTransitionTime: '2021-05-22T08:10:37Z',
            reason: 'NewReplicaSetAvailable',
            message: 'ReplicaSet "catalog-catalog-controller-manager-6c75799676" has successfully progressed.',
          },
          {
            type: 'Available',
            status: 'True',
            lastUpdateTime: '2021-07-31T20:49:44Z',
            lastTransitionTime: '2021-07-31T20:49:44Z',
            reason: 'MinimumReplicasAvailable',
            message: 'Deployment has minimum availability.',
          },
        ],
      },
      kind: 'Deployment',
    },
    {
      metadata: {
        annotations: {
          'deployment.kubernetes.io/revision': '1',
          'kubectl.kubernetes.io/last-applied-configuration':
            '{"apiVersion":"apps/v1","kind":"Deployment","metadata":{"annotations":{},"labels":{"app":"catalog-catalog-webhook","chart":"catalog-0.3.0","heritage":"Tiller","release":"catalog"},"name":"catalog-catalog-webhook","namespace":"catalog"},"spec":{"minReadySeconds":1,"replicas":1,"selector":{"matchLabels":{"app":"catalog-catalog-webhook"}},"strategy":{"type":"RollingUpdate"},"template":{"metadata":{"labels":{"app":"catalog-catalog-webhook","chart":"catalog-0.3.0","heritage":"Tiller","release":"catalog","releaseRevision":"1"}},"spec":{"containers":[{"args":["webhook","--secure-port","8443","--healthz-server-bind-port","8081","-v","10","--feature-gates","OriginatingIdentity=true","--feature-gates","ServicePlanDefaults=false"],"image":"quay.io/kubernetes-service-catalog/service-catalog:v0.3.0","imagePullPolicy":"Always","livenessProbe":{"failureThreshold":3,"httpGet":{"path":"/healthz","port":8081,"scheme":"HTTP"},"initialDelaySeconds":10,"periodSeconds":10,"successThreshold":1,"timeoutSeconds":5},"name":"svr","ports":[{"containerPort":8443}],"readinessProbe":{"failureThreshold":1,"httpGet":{"path":"/healthz/ready","port":8081,"scheme":"HTTP"},"initialDelaySeconds":10,"periodSeconds":10,"successThreshold":1,"timeoutSeconds":5},"resources":{"limits":{"cpu":"50m","memory":"30Mi"},"requests":{"cpu":"30m","memory":"20Mi"}},"volumeMounts":[{"mountPath":"/var/run/service-catalog-webhook","name":"service-catalog-webhook-cert","readOnly":true}]}],"imagePullSecrets":[],"serviceAccountName":"service-catalog-webhook","volumes":[{"name":"service-catalog-webhook-cert","secret":{"items":[{"key":"tls.crt","path":"tls.crt"},{"key":"tls.key","path":"tls.key"}],"secretName":"catalog-catalog-webhook-cert"}}]}}}}\n',
        },
        selfLink: '/apis/apps/v1/namespaces/catalog/deployments/catalog-catalog-webhook',
        resourceVersion: '62259714',
        name: 'catalog-catalog-webhook',
        uid: '27ddeff5-6f90-41db-8572-ddfe39face39',
        creationTimestamp: '2021-05-22T08:10:38Z',
        generation: 1,
        managedFields: [
          {
            manager: 'kubectl-client-side-apply',
            operation: 'Update',
            apiVersion: 'apps/v1',
            time: '2021-05-22T08:10:38Z',
            fieldsType: 'FieldsV1',
            fieldsV1: {
              'f:metadata': {
                'f:annotations': {
                  '.': {},
                  'f:kubectl.kubernetes.io/last-applied-configuration': {},
                },
                'f:labels': {
                  '.': {},
                  'f:app': {},
                  'f:chart': {},
                  'f:heritage': {},
                  'f:release': {},
                },
              },
              'f:spec': {
                'f:minReadySeconds': {},
                'f:progressDeadlineSeconds': {},
                'f:replicas': {},
                'f:revisionHistoryLimit': {},
                'f:selector': {
                  'f:matchLabels': {
                    '.': {},
                    'f:app': {},
                  },
                },
                'f:strategy': {
                  'f:rollingUpdate': {
                    '.': {},
                    'f:maxSurge': {},
                    'f:maxUnavailable': {},
                  },
                  'f:type': {},
                },
                'f:template': {
                  'f:metadata': {
                    'f:labels': {
                      '.': {},
                      'f:app': {},
                      'f:chart': {},
                      'f:heritage': {},
                      'f:release': {},
                      'f:releaseRevision': {},
                    },
                  },
                  'f:spec': {
                    'f:volumes': {
                      '.': {},
                      'k:{"name":"service-catalog-webhook-cert"}': {
                        '.': {},
                        'f:name': {},
                        'f:secret': {
                          '.': {},
                          'f:defaultMode': {},
                          'f:items': {},
                          'f:secretName': {},
                        },
                      },
                    },
                    'f:containers': {
                      'k:{"name":"svr"}': {
                        'f:image': {},
                        'f:volumeMounts': {
                          '.': {},
                          'k:{"mountPath":"/var/run/service-catalog-webhook"}': {
                            '.': {},
                            'f:mountPath': {},
                            'f:name': {},
                            'f:readOnly': {},
                          },
                        },
                        'f:terminationMessagePolicy': {},
                        '.': {},
                        'f:resources': {
                          '.': {},
                          'f:limits': {
                            '.': {},
                            'f:cpu': {},
                            'f:memory': {},
                          },
                          'f:requests': {
                            '.': {},
                            'f:cpu': {},
                            'f:memory': {},
                          },
                        },
                        'f:args': {},
                        'f:livenessProbe': {
                          '.': {},
                          'f:failureThreshold': {},
                          'f:httpGet': {
                            '.': {},
                            'f:path': {},
                            'f:port': {},
                            'f:scheme': {},
                          },
                          'f:initialDelaySeconds': {},
                          'f:periodSeconds': {},
                          'f:successThreshold': {},
                          'f:timeoutSeconds': {},
                        },
                        'f:readinessProbe': {
                          '.': {},
                          'f:failureThreshold': {},
                          'f:httpGet': {
                            '.': {},
                            'f:path': {},
                            'f:port': {},
                            'f:scheme': {},
                          },
                          'f:initialDelaySeconds': {},
                          'f:periodSeconds': {},
                          'f:successThreshold': {},
                          'f:timeoutSeconds': {},
                        },
                        'f:terminationMessagePath': {},
                        'f:imagePullPolicy': {},
                        'f:ports': {
                          '.': {},
                          'k:{"containerPort":8443,"protocol":"TCP"}': {
                            '.': {},
                            'f:containerPort': {},
                            'f:protocol': {},
                          },
                        },
                        'f:name': {},
                      },
                    },
                    'f:dnsPolicy': {},
                    'f:serviceAccount': {},
                    'f:restartPolicy': {},
                    'f:schedulerName': {},
                    'f:terminationGracePeriodSeconds': {},
                    'f:serviceAccountName': {},
                    'f:securityContext': {},
                  },
                },
              },
            },
          },
          {
            manager: 'kube-controller-manager',
            operation: 'Update',
            apiVersion: 'apps/v1',
            time: '2021-07-15T08:41:08Z',
            fieldsType: 'FieldsV1',
            fieldsV1: {
              'f:metadata': {
                'f:annotations': {
                  'f:deployment.kubernetes.io/revision': {},
                },
              },
              'f:status': {
                'f:availableReplicas': {},
                'f:conditions': {
                  '.': {},
                  'k:{"type":"Available"}': {
                    '.': {},
                    'f:lastTransitionTime': {},
                    'f:lastUpdateTime': {},
                    'f:message': {},
                    'f:reason': {},
                    'f:status': {},
                    'f:type': {},
                  },
                  'k:{"type":"Progressing"}': {
                    '.': {},
                    'f:lastTransitionTime': {},
                    'f:lastUpdateTime': {},
                    'f:message': {},
                    'f:reason': {},
                    'f:status': {},
                    'f:type': {},
                  },
                },
                'f:observedGeneration': {},
                'f:readyReplicas': {},
                'f:replicas': {},
                'f:updatedReplicas': {},
              },
            },
          },
        ],
        namespace: 'catalog',
        labels: {
          app: 'catalog-catalog-webhook',
          chart: 'catalog-0.3.0',
          heritage: 'Tiller',
          release: 'catalog',
        },
      },
      spec: {
        replicas: 1,
        selector: {
          matchLabels: {
            app: 'catalog-catalog-webhook',
          },
        },
        template: {
          metadata: {
            creationTimestamp: null,
            labels: {
              app: 'catalog-catalog-webhook',
              chart: 'catalog-0.3.0',
              heritage: 'Tiller',
              release: 'catalog',
              releaseRevision: '1',
            },
          },
          spec: {
            restartPolicy: 'Always',
            serviceAccountName: 'service-catalog-webhook',
            schedulerName: 'default-scheduler',
            terminationGracePeriodSeconds: 30,
            securityContext: {},
            containers: [
              {
                resources: {
                  limits: {
                    cpu: '50m',
                    memory: '30Mi',
                  },
                  requests: {
                    cpu: '30m',
                    memory: '20Mi',
                  },
                },
                readinessProbe: {
                  httpGet: {
                    path: '/healthz/ready',
                    port: 8081,
                    scheme: 'HTTP',
                  },
                  initialDelaySeconds: 10,
                  timeoutSeconds: 5,
                  periodSeconds: 10,
                  successThreshold: 1,
                  failureThreshold: 1,
                },
                terminationMessagePath: '/dev/termination-log',
                name: 'svr',
                livenessProbe: {
                  httpGet: {
                    path: '/healthz',
                    port: 8081,
                    scheme: 'HTTP',
                  },
                  initialDelaySeconds: 10,
                  timeoutSeconds: 5,
                  periodSeconds: 10,
                  successThreshold: 1,
                  failureThreshold: 3,
                },
                ports: [
                  {
                    containerPort: 8443,
                    protocol: 'TCP',
                  },
                ],
                imagePullPolicy: 'Always',
                volumeMounts: [
                  {
                    name: 'service-catalog-webhook-cert',
                    readOnly: true,
                    mountPath: '/var/run/service-catalog-webhook',
                  },
                ],
                terminationMessagePolicy: 'File',
                image: 'quay.io/kubernetes-service-catalog/service-catalog:v0.3.0',
                args: ['webhook', '--secure-port', '8443', '--healthz-server-bind-port', '8081', '-v', '10', '--feature-gates', 'OriginatingIdentity=true', '--feature-gates', 'ServicePlanDefaults=false'],
              },
            ],
            serviceAccount: 'service-catalog-webhook',
            volumes: [
              {
                name: 'service-catalog-webhook-cert',
                secret: {
                  secretName: 'catalog-catalog-webhook-cert',
                  items: [
                    {
                      key: 'tls.crt',
                      path: 'tls.crt',
                    },
                    {
                      key: 'tls.key',
                      path: 'tls.key',
                    },
                  ],
                  defaultMode: 420,
                },
              },
            ],
            dnsPolicy: 'ClusterFirst',
          },
        },
        strategy: {
          type: 'RollingUpdate',
          rollingUpdate: {
            maxUnavailable: '25%',
            maxSurge: '25%',
          },
        },
        minReadySeconds: 1,
        revisionHistoryLimit: 10,
        progressDeadlineSeconds: 600,
      },
      status: {
        observedGeneration: 1,
        replicas: 1,
        updatedReplicas: 1,
        readyReplicas: 1,
        availableReplicas: 1,
        conditions: [
          {
            type: 'Progressing',
            status: 'True',
            lastUpdateTime: '2021-05-22T08:11:16Z',
            lastTransitionTime: '2021-05-22T08:10:38Z',
            reason: 'NewReplicaSetAvailable',
            message: 'ReplicaSet "catalog-catalog-webhook-7476fd4d5f" has successfully progressed.',
          },
          {
            type: 'Available',
            status: 'True',
            lastUpdateTime: '2021-07-15T08:41:08Z',
            lastTransitionTime: '2021-07-15T08:41:08Z',
            reason: 'MinimumReplicasAvailable',
            message: 'Deployment has minimum availability.',
          },
        ],
      },
      kind: 'Deployment',
    },
  ],
  filters: {},
  kind: 'Deployment',
  loadError: '',
  loaded: true,
  selected: null,
};
