/* eslint-disable no-unused-vars */

import { Map as ImmutableMap } from 'immutable';

import { GroupVersionKind, referenceForModel } from '../module/k8s';
import * as k8sModels from '../models';

/**
 * Sample YAML manifests for some of the statically-defined Kubernetes models.
 */
export const yamlTemplates = ImmutableMap<GroupVersionKind, ImmutableMap<string, string>>()
  .setIn(
    ['DEFAULT', 'default'],
    `
  apiVersion: ''
  kind: ''
  metadata:
    name: example
`,
  )
  .setIn(
    [referenceForModel(k8sModels.VirtualMachineModel), 'default'],
    `
      apiVersion: kubevirt.io/v1alpha3
      kind: VirtualMachine
      metadata:
        name: windows-vm
        namespace: default
      spec:
        running: true
        template:
          spec:
            hostname: guestos-name
            affinity:
              nodeAffinity:
                requiredDuringSchedulingIgnoredDuringExecution:
                  nodeSelectorTerms:
                  - matchExpressions:
                    - key: kubernetes.io/hostname
                      operator: In
                      values:
                      - k8s-3-3
            domain:
              machine:
                type: q35
              devices:
                disks:
                - disk:
                    bus: virtio
                  name: rootdisk
                - cdrom:
                    bus: sata
                    readonly: true
                  name: cloudinitdisk
                - disk:
                    bus: virtio
                  name: additionaldisk
                interfaces:
                - name: default
                  model: virtio
                  bridge: {}
                  macAddress: de:ad:00:00:be:aa
              gpus:
                - deviceName: nvidia.com/GP102GL_Tesla_P40
                  name: gpu1
              cpu:
                cores: 2
              memory:
                guest: 2Gi
              resources:
                overcommitGuestOverhead: false
                requests:
                  cpu: 1500m
                  memory: 2Gi
                limits:
                  cpu: 2500m
                  memory: 3Gi
            terminationGracePeriodSeconds: 0
            networks:
            - name: default
              pod: {}
            volumes:
            - containerDisk:
                image: 172.21.7.20:5000/ubuntu:18.04
              name: rootdisk
            - name: cloudinitdisk
              cloudInitConfigDrive:
                userData: |
                  #ps1_sysnative
                  NET USER tmax "Qwer12345" /ADD
                  NET LOCALGROUP "Administrators" "tmax" /add
            - name: additionaldisk
              persistentVolumeClaim:
                claimName: empty-pvc
  `,
  )
  .setIn(
    [referenceForModel(k8sModels.VirtualMachineModel), 'read-virtualmachine-window'],
    `
    apiVersion: kubevirt.io/v1alpha3
    kind: VirtualMachine
    metadata:
      name: windows-vm
      namespace: default
    spec:
      running: true
      template:
        spec:
          hostname: guestos-name
          affinity:
            nodeAffinity:
              requiredDuringSchedulingIgnoredDuringExecution:
                nodeSelectorTerms:
                - matchExpressions:
                  - key: kubernetes.io/hostname
                    operator: In
                    values:
                    - k8s-3-3
          domain:
            machine:
              type: q35
            devices:
              disks:
              - disk:
                  bus: virtio
                name: rootdisk
              - cdrom:
                  bus: sata
                  readonly: true
                name: cloudinitdisk
              - disk:
                  bus: virtio
                name: additionaldisk
              interfaces:
              - name: default
                model: virtio
                bridge: {}
                macAddress: de:ad:00:00:be:aa
            gpus:
              - deviceName: nvidia.com/GP102GL_Tesla_P40
                name: gpu1
            cpu:
              cores: 2
            memory:
              guest: 2Gi
            resources:
              overcommitGuestOverhead: false
              requests:
                cpu: 1500m
                memory: 2Gi
              limits:
                cpu: 2500m
                memory: 3Gi
          terminationGracePeriodSeconds: 0
          networks:
          - name: default
            pod: {}
          volumes:
          - containerDisk:
              image: 172.21.7.20:5000/ubuntu:18.04
            name: rootdisk
          - name: cloudinitdisk
            cloudInitConfigDrive:
              userData: |
                #ps1_sysnative
                NET USER tmax "Qwer12345" /ADD
                NET LOCALGROUP "Administrators" "tmax" /add
          - name: additionaldisk
            persistentVolumeClaim:
              claimName: empty-pvc
`,
  )
  .setIn(
    [referenceForModel(k8sModels.VirtualMachineModel), 'read-virtualmachine-linux'],
    `
    apiVersion: kubevirt.io/v1alpha3
    kind: VirtualMachine
    metadata:
        name: linux
        namespace: default
    spec:
      running: true
      template:
        spec:
          hostname: guestos-name
          affinity:
            nodeAffinity:
              requiredDuringSchedulingIgnoredDuringExecution:
                nodeSelectorTerms:
                - matchExpressions:
                  - key: kubernetes.io/hostname
                    operator: In
                    values:
                    - k8s-3-3
          domain:
            machine:
              type: q35
            devices:
              disks:
              - disk:
                  bus: virtio
                name: rootdisk
              - cdrom:
                  bus: sata
                  readonly: true
                name: cloudinitdisk
              - disk:
                  bus: virtio
                name: additionaldisk
              interfaces:
              - name: default
                model: virtio
                bridge: {}
                macAddress: de:ad:00:00:be:aa
            cpu:
              cores: 2
            memory:
              guest: 2Gi
            resources:
              overcommitGuestOverhead: false
              requests:
                cpu: 1500m
                memory: 2Gi
              limits:
                cpu: 1500m
                memory: 2Gi
          terminationGracePeriodSeconds: 0
          networks:
          - name: default
            pod: {}
          volumes:
          - containerDisk:
              image: 172.21.7.20:5000/ubuntu:18.04
            name: rootdisk
          - name: cloudinitdisk
            cloudInitConfigDrive:
              userData: |
                #cloud-config
                disable_root: false
                ssh_pwauth: true
                lock_passwd: false
                users:
                  - name: tmax
                    sudo: ALL=(ALL) NOPASSWD:ALL
                    passwd: $6$bLLmCtnk51$21/Fq0vSHCwDODP2hXA.wo/0k91QIw/lUy6qWPOX1vx5z0CF9Acj9vGLFlQVbjSzmh.1r7wWd0kQS9RMm51HE.
                    shell: /bin/bash
                    lock_passwd: false
          - name: additionaldisk
            persistentVolumeClaim:
              claimName: empty-pvc
`,
  )
  .setIn(
    [referenceForModel(k8sModels.ClusterServiceBrokerModel), 'default'],
    `
  apiVersion: servicecatalog.k8s.io/v1beta1
  kind: ClusterServiceBroker
  metadata:
    name: hyperbroker4
  spec:
          url: http://0.0.0.0:28677
`,
  )
  .setIn(
    [referenceForModel(k8sModels.DataVolumeModel), 'default'],
    `
  apiVersion: cdi.kubevirt.io/v1alpha1
  kind: DataVolume
  metadata:
    name: example
  spec:
    source:
      registry:
        url: example
    pvc:
      accessModes:
        - example
      resources:
        requests:
          storage: example  
`,
  )
  .setIn(
    [referenceForModel(k8sModels.ServiceInstanceModel), 'default'],
    `
  apiVersion: servicecatalog.k8s.io/v1beta1
  kind: ServiceInstance
  metadata:
    name: nginx-instance
    namespace: hypercloud-system
  spec:
    clusterServiceClassName: nginx-template
    clusterServicePlanName: example-plan1
    parameters:
      NAME: nginx
      IMAGE: nginx:1
`,
  )
  .setIn(
    [referenceForModel(k8sModels.ServiceBindingModel), 'default'],
    `
  apiVersion: servicecatalog.k8s.io/v1beta1
  kind: ServiceBinding
  metadata:
    name: example-binding
    namespace: hypercloud4-system
  spec:
    instanceRef:
      name: example-instance
`,
  )
  .setIn(
    [referenceForModel(k8sModels.UserModel), 'default'],
    `
  apiVersion: tmax.io/v1
  kind: User
  metadata: 
    name: example-tmax.co.kr
    labels: 
      encrypted: f
  userInfo:
    name: example
    password: "example"
    email: example@tmax.co.kr
    department: Cloud
    position: developer
    phone: 010-0000-0000
    description: For Example
  status: active
`,
  )
  .setIn(
    [referenceForModel(k8sModels.NamespaceClaimModel), 'default'],
    `
    apiVersion: tmax.io/v1
    kind: NamespaceClaim
    metadata:
      name: example-claim
    resourceName: example-namespace
    spec:
      hard:
        limits.cpu: "1"
    
`,
  )
  .setIn(
    [referenceForModel(k8sModels.LimitRangeModel), 'default'],
    `
apiVersion: v1
kind: LimitRange
metadata:
  name: example-limit-range
spec:
  limits:
  - max:
      cpu: "800m"
      memory: "1Gi"
    min:
      cpu: "100m"
      memory: "99Mi"
    default:
      cpu: "700m"
      memory: "900Mi"
    defaultRequest:
      cpu: "110m"
      memory: "111Mi"
    type: Container

`,
  )
  .setIn(
    [referenceForModel(k8sModels.ResourceQuotaClaimModel), 'default'],
    `
    apiVersion: tmax.io/v1
    kind: ResourceQuotaClaim
    metadata:
      name: example-resource-quota
      namespace: example-namespace
    resourceName: example-claim
    spec:
      hard:
        limits.cpu: "2"
    
`,
  )
  .setIn(
    [referenceForModel(k8sModels.RoleBindingClaimModel), 'default'],
    `
    apiVersion: tmax.io/v1
    kind: RoleBindingClaim
    metadata:
      name: example-role-biniding
      namespace: example-namespace
    resourceName: example-claim
    subjects:
    - kind: User
      name: example-tmax.co.kr
    roleRef:
      kind: ClusterRole
      name: namespace-user
      apiGroup: rbac.authorization.k8s.io
    
`,
  )
  .setIn(
    [referenceForModel(k8sModels.TaskModel), 'default'],
    `
apiVersion: tekton.dev/v1alpha1
kind: Task
metadata:
    name: example-task
    namespace: example-namespace
spec:
    inputs:
        resources:
            - name: git-source
              type: git
        params:
            - name: example-string
              type: string
              description: a sample string
              default: default-string-value
    outputs:
        resources:
            - name: output-image
              type: image
    steps:
        - name: sample-job
          image: sample-image-name:latest
          env:
            - name: "SAMPLE_ENV"
              value: "hello/world/"
          command:
            - /bin/sh
          args:
            - -c
            - "echo helloworld"
`,
  )
  .setIn(
    [referenceForModel(k8sModels.TaskRunModel), 'default'],
    `
apiVersion: tekton.dev/v1beta1
kind: TaskRun
metadata:
    name: example-taskrun
    namespace: example-namespace
spec:
    serviceAccountName: example-san
    taskRef:
        name: example-task
    inputs:
        resources:
            - name: git-source
              resourceRef:
                name: example-pipeline-resource-git
        params:
            - name: example-string
              value: input-string
    outputs:
        resources:
            - name: output-image
              resourceRef:
                name: example-pipeline-resource-image
`,
  )
  .setIn(
    [referenceForModel(k8sModels.PipelineResourceModel), 'default'],
    `
apiVersion: tekton.dev/v1alpha1
kind: PipelineResource
metadata:
    name: example-pipeline-resource-git
    namespace: example-namespace
spec:
    type: git
    params:
        - name: revision
          value: master
        - name: url
          value: https://github.com/sample/git/url
`,
  )
  .setIn(
    [referenceForModel(k8sModels.PipelineModel), 'default'],
    `
apiVersion: tekton.dev/v1alpha1
kind: Pipeline
metadata:
  name: example-pipeline
  namespace: example-namespace
spec:
    resources:
        resources:
            - name: source-repo
              type: git
            - name: sample-image
              type: image
    tasks:
        - name: task1
          taskRef:
            name: example-task1
          params:
            - name: example-string
              value: sample-string1
          resources:
            inputs:
                - name: example-pipeline-resource-git
                  resource: source-repo
            outputs:
                - name: example-pipeline-resource-image
                  resource: sample-image
        - name: task2
          taskRef:
            name: example-task2
          resources:
            inputs:
                - name: example-input-image
                  resource: sample-image
                  from:
                    - task1
`,
  )
  .setIn(
    [referenceForModel(k8sModels.PipelineRunModel), 'default'],
    `
apiVersion: tekton.dev/v1alpha1
kind: PipelineRun
metadata:
    name: example-pipeline-run
    namespace: example-namespace
spec:
    serviceAccountName: example-san
    pipelineRef:
        name: example-pipeline
    resources:
        - name: source-repo
          resourceRef:
            name: example-pipeline-resource-git
        - name: sample-image
          resourceRef:
            name: example-pipeline-resource-image
`,
  )
  .setIn(
    [referenceForModel(k8sModels.RegistryModel), 'default'],
    `
# Note: To use the optional key, remove the '#' at the front of the key.
apiVersion: tmax.io/v1
kind: Registry
metadata:
  name: example # (required) [string] registry's name
  namespace: def # (required) [string] registry's namespace
spec:
  image: example/registry:b004 # (required) [string] registry:b004 image's repository (ex: 192.168.6.110:5000/registry:b004)
  #description: example # (optional) [string] a brief description of the registry.
  loginId: example # (required) [string] username for registry login
  loginPassword: example # (required) [string] password for registry login
  service:
     #port: example # (optional) [integer] external port (default: 443)
     #nodeIP: example # (optional) [string] if service type is NodePort, set NodeIP to assign to the registry
     #nodePort: example # (optional) [integer] if service type is NodePort, you can set 30000~32767
     type: example # (required) [ClusterIP, NodePort, LoadBalancer]
  persistentVolumeClaim:
     accessModes: [example] # (required) [array] (ex: [ReadWriteOnce, ReadWriteMany])
     storageSize: example # (required) [string] desired storage size (ex: 10Gi)
     storageClassName: example # (required) [string] storage class name available (ex: csi-cephfs-sc)
`,
  )
  .setIn(
    [referenceForModel(k8sModels.TemplateModel), 'default'],
    `
apiVersion: tmax.io/v1
kind: Template
metadata:
  name: example-template
  namespace: default
objects:
- apiVersion: apps/v1
  kind: Deployment
  metadata:
    name: example
    labels:
      app: example
  spec:
    selector:
      matchLabels:
        app: example
    template:
      metadata:
        labels:
          app: example
      spec:
        containers:
        - name: example
          image: example/image:version
          ports:
          - name: example
            containerPort: 80

`,
  )
  .setIn(
    [referenceForModel(k8sModels.TemplateInstanceModel), 'default'],
    `
apiVersion: tmax.io/v1
kind: TemplateInstance
metadata:
  name: example-instance
  namespace: default
spec:
  template:
    metadata:
      name: example-template
    parameters:
    - description: Example Name.
      displayName: Name
      name: NAME
      required: true
      value: example-instance
    - description: Example Image.
      displayName: Image
      name: IMAGE
      required: true
      value: example/image:version

`,
  )
  .setIn(
    [referenceForModel(k8sModels.NetworkPolicyModel), 'default'],
    `
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: example
  namespace: default
spec:
  podSelector:
    matchLabels:
      role: db
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          project: myproject
    - podSelector:
        matchLabels:
          role: somerole
    ports:
    - protocol: TCP
      port: 6379
`,
  )
  .setIn(
    [referenceForModel(k8sModels.NetworkPolicyModel), 'deny-other-namespaces'],
    `
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-other-namespaces
  namespace: target-ns
spec:
  podSelector:
  ingress:
  - from:
    - podSelector: {}
`,
  )
  .setIn(
    [referenceForModel(k8sModels.NetworkPolicyModel), 'db-or-api-allow-app'],
    `
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: db-or-api-allow-app
  namespace: target-ns
spec:
  podSelector:
    matchLabels:
      role: db
  ingress:
    - from:
      - podSelector:
          matchLabels:
            app: mail
`,
  )
  .setIn(
    [referenceForModel(k8sModels.NetworkPolicyModel), 'api-allow-http-and-https'],
    `
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-allow-http-and-https
  namespace: target-ns
spec:
  podSelector:
    matchLabels:
      app: api
  ingress:
  - from:
    - podSelector:
          matchLabels:
            role: monitoring
  - ports:
    - protocol: TCP
      port: 80
    - protocol: TCP
      port: 443
`,
  )
  .setIn(
    [referenceForModel(k8sModels.NetworkPolicyModel), 'default-deny-all'],
    `
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: target-ns
spec:
  podSelector:
`,
  )
  .setIn(
    [referenceForModel(k8sModels.NetworkPolicyModel), 'web-allow-external'],
    `
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: web-allow-external
  namespace: target-ns
spec:
  podSelector:
    matchLabels:
      app: web
  ingress:
  - {}
`,
  )
  .setIn(
    [referenceForModel(k8sModels.NetworkPolicyModel), 'web-db-allow-all-ns'],
    `
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: web-db-allow-all-ns
  namespace: target-ns
spec:
  podSelector:
    matchLabels:
      role: web-db
  ingress:
    - from:
      - namespaceSelector: {}
`,
  )
  .setIn(
    [referenceForModel(k8sModels.NetworkPolicyModel), 'web-allow-production'],
    `
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: web-allow-production
  namespace: target-ns
spec:
  podSelector:
    matchLabels:
      app: web
  ingress:
    - from:
      - namespaceSelector:
        matchLabels:
        env: production
`,
  )
  .setIn(
    [referenceForModel(k8sModels.BuildConfigModel), 'default'],
    `
apiVersion: build.openshift.io/v1
kind: BuildConfig
metadata:
  name: example
spec:
  output:
    to:
      kind: ImageStreamTag
      name: example:latest
  source:
    git:
      ref: master
      uri: https://github.com/openshift/ruby-ex.git
    type: Git
  strategy:
    type: Source
    sourceStrategy:
      from:
        kind: ImageStreamTag
        name: ruby:2.4
        namespace: openshift
      env: []
  triggers:
  - type: ImageChange
    imageChange: {}
  - type: ConfigChange
`,
  )
  .setIn(
    [referenceForModel(k8sModels.ChargebackReportModel), 'default'],
    `
apiVersion: chargeback.coreos.com/v1alpha1
kind: Report
metadata:
  name: namespace-memory-request
  namespace: default
spec:
  generationQuery: namespace-memory-request
  gracePeriod: 5m0s
  reportingStart: '2018-01-01T00:00:00Z'
  reportingEnd: '2018-12-30T23:59:59Z'
  runImmediately: true
`,
  )
  .setIn(
    [referenceForModel(k8sModels.DeploymentModel), 'default'],
    `
apiVersion: apps/v1
kind: Deployment
metadata:
  name: example
spec:
  selector:
    matchLabels:
      app: hello-hypercloud
  replicas: 3
  template:
    metadata:
      labels:
        app: hello-hypercloud
    spec:
      containers:
      - name: hello-hypercloud
        image: hypercloud/hello-hypercloud
        ports:
        - containerPort: 8080
`,
  )
  .setIn(
    [referenceForModel(k8sModels.ClusterModel), 'default'],
    `
apiVersion: multicluster.coreos.com/v1
kind: Cluster
metadata:
  name: example
  annotations:
    'multicluster.coreos.com/console-url': 'http://localhost:9000'
    'multicluster.coreos.com/directory': true
spec: {}
`,
  )
  .setIn(
    [referenceForModel(k8sModels.ConfigMapModel), 'default'],
    `
apiVersion: v1
kind: ConfigMap
metadata:
  name: example
  namespace: default
data:
  example.property.1: hello
  example.property.2: world
  example.property.file: |-
    property.1=value-1
    property.2=value-2
    property.3=value-3
`,
  )
  .setIn(
    [referenceForModel(k8sModels.CronJobModel), 'default'],
    `
apiVersion: batch/v1beta1
kind: CronJob
metadata:
  name: example
spec:
  schedule: "@daily"
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: hello
            image: busybox
            args:
            - /bin/sh
            - -c
            - date; echo Hello from the Kubernetes cluster
          restartPolicy: OnFailure
`,
  )
  .setIn(
    [referenceForModel(k8sModels.CustomResourceDefinitionModel), 'default'],
    `
apiVersion: apiextensions.k8s.io/v1beta1
kind: CustomResourceDefinition
metadata:
  # name must match the spec fields below, and be in the form: <plural>.<group>
  name: crontabs.stable.example.com
spec:
  # group name to use for REST API: /apis/<group>/<version>
  group: stable.example.com
  # version name to use for REST API: /apis/<group>/<version>
  version: v1
  # either Namespaced or Cluster
  scope: Namespaced
  names:
    # plural name to be used in the URL: /apis/<group>/<version>/<plural>
    plural: crontabs
    # singular name to be used as an alias on the CLI and for display
    singular: crontab
    # kind is normally the CamelCased singular type. Your resource manifests use this.
    kind: CronTab
    # shortNames allow shorter string to match your resource on the CLI
    shortNames:
    - ct
`,
  )
  .setIn(
    [referenceForModel(k8sModels.DeploymentConfigModel), 'default'],
    `
apiVersion: apps.openshift.io/v1
kind: DeploymentConfig
metadata:
  name: example
spec:
  selector:
    app: hello-hypercloud
  replicas: 3
  template:
    metadata:
      labels:
        app: hello-hypercloud
    spec:
      containers:
      - name: hello-hypercloud
        image: hypercloud/hello-hypercloud
        ports:
        - containerPort: 8080
`,
  )
  .setIn(
    [referenceForModel(k8sModels.PersistentVolumeModel), 'default'],
    `
apiVersion: v1
kind: PersistentVolume
metadata:
  name: example
spec:
  capacity:
    storage: 5Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Recycle
  storageClassName: slow
  nfs:
    path: /tmp
    server: 172.17.0.2
`,
  )
  .setIn(
    [referenceForModel(k8sModels.HorizontalPodAutoscalerModel), 'default'],
    `
apiVersion: autoscaling/v2beta1
kind: HorizontalPodAutoscaler
metadata:
  name: example
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: example
  minReplicas: 1
  maxReplicas: 3
  metrics:
  - type: Resource
    resource:
      name: cpu
      targetAverageUtilization: 50
`,
  )
  .setIn(
    [referenceForModel(k8sModels.PodModel), 'default'],
    `
apiVersion: v1
kind: Pod
metadata:
  name: example
  labels:
    app: hello-hypercloud
spec:
  containers:
    - name: hello-hypercloud
      image: hypercloud/hello-hypercloud
      ports:
        - containerPort: 8080
`,
  )
  .setIn(
    [referenceForModel(k8sModels.IngressModel), 'default'],
    `
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: example
spec:
  rules:
  - host: example.com
    http:
      paths:
      - path: /testpath
        backend:
          serviceName: test
          servicePort: 80
`,
  )
  .setIn(
    [referenceForModel(k8sModels.JobModel), 'default'],
    `
apiVersion: batch/v1
kind: Job
metadata:
  name: example
spec:
  selector: {}
  template:
    metadata:
      name: pi
    spec:
      containers:
      - name: pi
        image: perl
        command: ["perl",  "-Mbignum=bpi", "-wle", "print bpi(2000)"]
      restartPolicy: Never
`,
  )
  .setIn(
    [referenceForModel(k8sModels.ImageStreamModel), 'default'],
    `
apiVersion: image.openshift.io/v1
kind: ImageStream
metadata:
  name: example
`,
  )
  .setIn(
    [referenceForModel(k8sModels.RoleBindingModel), 'default'],
    `
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: example
subjects:
- kind: Group
  name: "my-sample-group"
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: ClusterRole
  name: view
  apiGroup: rbac.authorization.k8s.io
`,
  )
  .setIn(
    [referenceForModel(k8sModels.ClusterRoleModel), 'default'],
    `apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: example
rules:
- apiGroups: [""] # "" indicates the core API group
  resources: ["pods"]
  verbs: ["get", "watch", "list"]
`,
  )
  .setIn(
    [referenceForModel(k8sModels.RoleModel), 'default'],
    `apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: example
rules:
- apiGroups: [""] # "" indicates the core API group
  resources: ["pods"]
  verbs: ["get", "watch", "list"]
`,
  )
  .setIn(
    [referenceForModel(k8sModels.RoleModel), 'read-pods-within-ns'],
    `
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: read-pods-within-ns
  namespace: default
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list", "watch"]
`,
  )
  .setIn(
    [referenceForModel(k8sModels.RoleModel), 'read-write-deployment-in-ext-and-apps-apis'],
    `
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: read-write-deployment-in-ext-and-apps-apis
  namespace: default
rules:
- apiGroups: ["extensions", "apps"]
  resources: ["deployments"]
  verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
`,
  )
  .setIn(
    [referenceForModel(k8sModels.RoleModel), 'read-pods-and-read-write-jobs'],
    `apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: read-pods-and-read-write-jobs
  namespace: default
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["batch", "extensions"]
  resources: ["jobs"]
  verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
`,
  )
  .setIn(
    [referenceForModel(k8sModels.RoleModel), 'read-configmap-within-ns'],
    `
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: read-configmap-within-ns
  namespace: default
rules:
- apiGroups: [""]
  resources: ["configmaps"]
  resourceNames: ["my-config"]
  verbs: ["get"]
`,
  )
  .setIn(
    [referenceForModel(k8sModels.ClusterRoleModel), 'read-nodes'],
    `
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  # "namespace" omitted since ClusterRoles are not namespaced
  name: read-nodes
rules:
- apiGroups: [""]
  resources: ["nodes"]
  verbs: ["get", "list", "watch"]
`,
  )
  .setIn(
    [referenceForModel(k8sModels.ClusterRoleModel), 'get-and-post-to-non-resource-endpoints'],
    `
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  # "namespace" omitted since ClusterRoles are not namespaced
  name: get-and-post-to-non-resource-endpoints
rules:
- nonResourceURLs: ["/healthz", "/healthz/*"] # '*' in a nonResourceURL is a suffix glob match
  verbs: ["get", "post"]
`,
  )
  .setIn(
    [referenceForModel(k8sModels.ServiceModel), 'default'],
    `
apiVersion: v1
kind: Service
metadata:
  name: example
spec:
  selector:
    app: MyApp
  ports:
  - protocol: TCP
    port: 80
    targetPort: 9376
`,
  )
  .setIn(
    [referenceForModel(k8sModels.DaemonSetModel), 'default'],
    `
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: example
spec:
  selector:
    matchLabels:
      app: hello-hypercloud
  template:
    metadata:
      labels:
        app: hello-hypercloud
    spec:
      containers:
      - name: hello-hypercloud
        image: hypercloud/hello-hypercloud
        ports:
        - containerPort: 8080
`,
  )
  .setIn(
    [referenceForModel(k8sModels.PersistentVolumeClaimModel), 'default'],
    `
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: example
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 8Gi
  storageClassName: slow
  selector:
    matchLabels:
      release: "stable"
    matchExpressions:
      - {key: environment, operator: In, values: [dev]}
`,
  )
  .setIn(
    [referenceForModel(k8sModels.ResourceQuotaModel), 'default'],
    `
apiVersion: v1
kind: ResourceQuota
metadata:
  name: example
spec:
  hard:
    pods: "4"
    requests.cpu: "1"
    requests.memory: 1Gi
    limits.cpu: "2"
    limits.memory: 2Gi
`,
  )
  .setIn(
    [referenceForModel(k8sModels.StatefulSetModel), 'default'],
    `
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: example
spec:
  serviceName: "nginx"
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      terminationGracePeriodSeconds: 10
      containers:
      - name: nginx
        image: gcr.io/google_containers/nginx-slim:0.8
        ports:
        - containerPort: 80
          name: web
        volumeMounts:
        - name: www
          mountPath: /usr/share/nginx/html
  volumeClaimTemplates:
  - metadata:
      name: www
    spec:
      accessModes: [ "ReadWriteOnce" ]
      storageClassName: my-storage-class
      resources:
        requests:
          storage: 1Gi
`,
  )
  .setIn(
    [referenceForModel(k8sModels.StorageClassModel), 'default'],
    `
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: example
provisioner: my-provisioner
reclaimPolicy: Delete
`,
  )
  .setIn(
    [referenceForModel(k8sModels.ServiceAccountModel), 'default'],
    `
apiVersion: v1
kind: ServiceAccount
metadata:
  name: example
`,
  )
  .setIn(
    [referenceForModel(k8sModels.SecretModel), 'default'],
    `
apiVersion: v1
kind: Secret
metadata:
  name: example
type: Opaque
stringData:
  username: admin
  password: damin
`,
  )
  .setIn(
    [referenceForModel(k8sModels.ReplicaSetModel), 'default'],
    `
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: example
spec:
  replicas: 2
  selector:
    matchLabels:
      app: hello-hypercloud
  template:
    metadata:
      name: hello-hypercloud
      labels:
        app: hello-hypercloud
    spec:
      containers:
      - name: hello-hypercloud
        image: hypercloud/hello-hypercloud
        ports:
        - containerPort: 8080
`,
  )
  .setIn(
    [referenceForModel(k8sModels.RouteModel), 'default'],
    `
apiVersion: route.openshift.io/v1
kind: Route
metadata:
  name: example
spec:
  path: /
  to:
    kind: Service
    name: example
  port:
    targetPort: 80
`,
  )
  .setIn(
    [referenceForModel(k8sModels.ReplicationControllerModel), 'default'],
    `
apiVersion: v1
kind: ReplicationController
metadata:
  name: example
spec:
  replicas: 2
  selector:
    app: hello-hypercloud
  template:
    metadata:
      name: hello-hypercloud
      labels:
        app: hello-hypercloud
    spec:
      containers:
      - name: hello-hypercloud
        image: hypercloud/hello-hypercloud
        ports:
        - containerPort: 8080
`,
  )
  .setIn(
    [referenceForModel(k8sModels.BuildConfigModel), 'docker-build'],
    `
apiVersion: build.openshift.io/v1
kind: BuildConfig
metadata:
  name: docker-build
  namespace: default
  labels:
    name: docker-build
spec:
  triggers:
  - type: GitHub
    github:
      secret: secret101
  - type: ImageChange
    imageChange: {}
  - type: ConfigChange
  source:
    type: Git
    git:
      uri: https://github.com/openshift/ruby-hello-world.git
  strategy:
    type: Docker
    dockerStrategy:
      from:
        kind: ImageStreamTag
        name: ruby:latest
        namespace: openshift
      env:
      - name: EXAMPLE
        value: sample-app
  output:
    to:
      kind: ImageStreamTag
      name: origin-ruby-sample:latest
  postCommit:
    args:
    - bundle
    - exec
    - rake
    - test
`,
  )
  .setIn(
    [referenceForModel(k8sModels.BuildConfigModel), 's2i-build'],
    `apiVersion: build.openshift.io/v1
kind: BuildConfig
metadata:
  name: s2i-build
  namespace: default
spec:
  output:
    to:
      kind: ImageStreamTag
      name: s2i-build:latest
  source:
    git:
      ref: master
      uri: https://github.com/openshift/ruby-ex.git
    type: Git
  strategy:
    type: Source
    sourceStrategy:
      from:
        kind: ImageStreamTag
        name: ruby:2.4
        namespace: openshift
      env: []
  triggers:
  - type: ImageChange
    imageChange: {}
  - type: ConfigChange
`,
  )
  .setIn(
    [referenceForModel(k8sModels.BuildConfigModel), 'pipeline-build'],
    `
apiVersion: build.openshift.io/v1
kind: BuildConfig
metadata:
  labels:
    name: pipeline-build
  name: pipeline-build
  namespace: default
spec:
  strategy:
    jenkinsPipelineStrategy:
      jenkinsfile: |-
        node('nodejs') {
          stage('build') {
            sh 'npm --version'
          }
        }
    type: JenkinsPipeline
  triggers:
  - type: ConfigChange
`,
  );
