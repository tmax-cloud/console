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
    [referenceForModel(k8sModels.VirtualMachineModel), 'virtualmachine-sample'],
    `
apiVersion: kubevirt.io/v1alpha3
kind: VirtualMachine
metadata:
  name: windows-vm
  namespace: demo-ns
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
              macAddress: 'de:aa:00:00:be:aa'
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
            image: '{registry_endpoint}/win7:latest'
          name: rootdisk
        - name: cloudinitdisk
          cloudInitConfigDrive:
            userData: |
              #ps1_sysnative
              NET USER tmax "Password12345" /ADD
              NET LOCALGROUP "Administrators" "tmax" /add
        - name: additionaldisk
          persistentVolumeClaim:
            claimName: empty-pvc
  `,
  )
  .setIn(
    [referenceForModel(k8sModels.VirtualMachineModel), 'virtualmachine-sample2'],
    `
apiVersion: kubevirt.io/v1alpha3
kind: VirtualMachine
metadata:
  name: linux
  namespace: demo-ns
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
              macAddress: 'de:ad:00:00:be:aa'
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
            image: '{registry_endpoint}/ubuntu:18.04'
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
    [referenceForModel(k8sModels.VirtualMachineModel), 'virtualmachine-sample3'],
    `
    apiVersion: kubevirt.io/v1alpha3
    kind: VirtualMachine
    metadata:
      name: centos6
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
              type: pc-q35-2.5
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
                  macAddress: 'de:ad:00:00:be:aa'
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
                image: '172.21.7.20:5000/ubuntu:18.04'
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
    [referenceForModel(k8sModels.UserGroupModel), 'default'],
    `
    apiVersion: tmax.io/v1
    kind: Usergroup
    metadata: 
      name: example
    userGroupInfo:
      name: example
      department: Cloud
      position: developer
      description: For Example
    status: active

`,
  )
  .setIn(
    [referenceForModel(k8sModels.UserGroupModel), 'usergroup-sample'],
    `
apiVersion: tmax.io/v1
kind: Usergroup
metadata:
  name: examplegroup
userGroupInfo:
  name: examplegroup
  department: Cloud
  position: developer
  description: For Example
status: active

`,
  )
  .setIn(
    [referenceForModel(k8sModels.ServiceBrokerModel), 'default'],
    `
    apiVersion: servicecatalog.k8s.io/v1beta1
    kind: ServiceBroker
    metadata:
      name: hyperbroker4
    spec:
      url: 'http://0.0.0.0:28677'
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
    [referenceForModel(k8sModels.ClusterServiceBrokerModel), 'clusterservicebrocker-sample'],
    `
apiVersion: servicecatalog.k8s.io/v1beta1
kind: ClusterServiceBroker
metadata:
  name: hyperbroker4
spec:
  url: 'http://0.0.0.0:28677'
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
    [referenceForModel(k8sModels.DataVolumeModel), 'datavolume-sample'],
    `
    apiVersion: cdi.kubevirt.io/v1alpha1
    kind: DataVolume
    metadata:
      name: sample-datavolume
      namespace: default
    spec:
      source:
        http:
          url: 'https://download.cirros-cloud.net/contrib/0.3.0/cirros-0.3.0-i386-disk.img'
      pvc:
        accessModes:
          - ReadWriteOnce
        resources:
          requests:
            storage: 1Gi
        storageClassName: "hdd-ceph-fs" 
`,
  )
  .setIn(
    [referenceForModel(k8sModels.DataVolumeModel), 'datavolume-sample2'],
    `
    apiVersion: cdi.kubevirt.io/v1alpha1
    kind: DataVolume
    metadata:
      name: sample-datavolume
      namespace: default
    spec:
      pvc:
        accessModes:
          - ReadWriteMany
        resources:
          requests:
            storage: 1Gi
        storageClassName: hdd-ceph-block
        volumeMode: Block
      source:
        s3:
          contentType: kubevirt
          secretRef: ''
          url: 'http://mybucket/virtual-disk-img' 
`,
  )
  .setIn(
    [referenceForModel(k8sModels.DataVolumeModel), 'datavolume-sample3'],
    `
    apiVersion: cdi.kubevirt.io/v1alpha1
    kind: DataVolume
    metadata:
      name: sample-datavolume
      namespace: default
    spec:
      source:
        registry:
          url: "xxx.xxx.xxx.xxx:xx"
          secretRef: ""
          certConfigMap: ""
          contentType: "archive"
      pvc:
        accessModes:
          - ReadWriteOnce
        resources:
          requests:
            storage: 1Gi
        storageClassName: "hdd-ceph-fs"
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
    [referenceForModel(k8sModels.ServiceInstanceModel), 'serviceinstance-sample'],
    `
apiVersion: servicecatalog.k8s.io/v1beta1
kind: ServiceInstance
metadata:
  name: nginx-instance
  namespace: demo-ns
spec:
  clusterServiceClassName: nginx-template
  clusterServicePlanName: example-plan1
  parameters:
    NAME: nginx
    IMAGE: 'nginx:1'
`,
  )
  .setIn(
    [referenceForModel(k8sModels.ServiceInstanceModel), 'serviceinstance-sample2'],
    `
apiVersion: servicecatalog.k8s.io/v1beta1
kind: ServiceInstance
metadata:
  name: roh-test
  namespace: demo-ns
spec:
  clusterServiceClassName: apache-cicd-template
  clusterServiceClassRef:
    name: apache-cicd-template
  clusterServicePlanName: apache-plan1
  clusterServicePlanRef:
    name: apache-plan1
  parameters:
    APP_NAME: apache-sample-app-roh
    GIT_REV: master
    GIT_URL: 'https://github.com/microsoft/project-html-website'
    IMAGE_URL: '192.168.6.110:5000/apache-sample:latest'
    NAMESPACE: demo-ns
    SERVICE_ACCOUNT_NAME: tutorial-service
    SERVICE_TYPE: LoadBalancer
    WAS_PORT: '8080'
`,
  )
  .setIn(
    [referenceForModel(k8sModels.ServiceInstanceModel), 'serviceinstance-sample3'],
    `
apiVersion: servicecatalog.k8s.io/v1beta1
kind: ServiceInstance
metadata:
  name: roh-test-mysql
  namespace: demo-ns 
spec:
  clusterServiceClassName: mysql-template
  clusterServiceClassRef:
    name: mysql-template
  clusterServicePlanName: mysql-plan1
  clusterServicePlanRef:
    name: mysql-plan1
  parameters:
    APP_NAME: mysql-sample-app-roh
    DB_STORAGE: 10Gi
    MYSQL_DATABASE: mysqldb
    MYSQL_PASSWORD: mysqlpassword
    MYSQL_USER: mysqluser
    NAMESPACE: demo-ns
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
    [referenceForModel(k8sModels.ServiceBindingModel), 'servicebinding-sample'],
    `
    apiVersion: servicecatalog.k8s.io/v1beta1
    kind: ServiceBinding
    metadata:
      name: example-binding
      namespace: demo-ns
    spec:
      instanceRef:
        name: example-instance
`,
  )
  .setIn(
    [referenceForModel(k8sModels.ServiceBindingModel), 'servicebinding-sample2'],
    `
    apiVersion: servicecatalog.k8s.io/v1beta1
    kind: ServiceBinding
    metadata:
      name: sample-binding
      namespace: demo-ns
    spec:
      instanceRef:
        name: sample-instance
      parameters:
        securityLevel: confidential
      secretName: sample-secret
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
    [referenceForModel(k8sModels.NamespaceModel), 'default'],
    `
    apiVersion: v1
    kind: Namespace
    metadata:
      name: example-namespace
`,
  )
  .setIn(
    [referenceForModel(k8sModels.UserModel), 'user-sample'],
    `
    apiVersion: tmax.io/v1
    kind: User
    metadata:
      name: exampleuser
      labels:
        encrypted: f
    userInfo:
      name: exampleuser
      password: exampleuser
      email: exampleuser@tmax.co.kr
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
      labels: 
        handled: f
        #trial: t
        #owner: example-tmax.co.kr
      annotations:
        #usage: for test
        #company: tmax
        #companyAddress: bundang
        #companyNumber: 02-1234-5678
        #clientPosition: CEO
        #clientName: kim
        #clientNumber: 010-0000-0000
        #request: thanks
    resourceName: example-namespace
    spec:
      hard:
        limits.cpu: "1"
        limits.memory: "1Gi"
`,
  )
  .setIn(
    [referenceForModel(k8sModels.NamespaceClaimModel), 'namespaceclaim-sample'],
    `
    apiVersion: tmax.io/v1
    kind: NamespaceClaim
    metadata:
      name: example-namespaceclaims
      labels:
        handled: f
    resourceName: namespace
    spec:
      hard:
        limits.cpu: '2'
        limits.memory: 2Gi
    
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
    [referenceForModel(k8sModels.LimitRangeModel), 'limitrange-sample'],
    `
apiVersion: "v1"
kind: "LimitRange"
metadata:
  name: "core-resource-limits" 
spec:
  limits:
    - type: "Pod or Container"
      max:
        cpu: "2" 
        memory: "1Gi" 
      min:
        cpu: "200m" 
        memory: "6Mi" 
      default:
        cpu: "300m" 
        memory: "200Mi" 
      defaultRequest:
        cpu: "200m" 
        memory: "100Mi" 
      maxLimitRequestRatio:
        cpu: "10"
`,
  )
  .setIn(
    [referenceForModel(k8sModels.LimitRangeModel), 'limitrange-sample2'],
    `
apiVersion: "v1"
kind: "LimitRange"
metadata:
  name: "tmax-resource-limits"
spec:
  limits:
    - type: tmax.io/Image
      max:
        storage: 1Gi 
    - type: tmax.io/ImageStream
      max:
        tmax.io/image-tags: 20 
        tmax.io/images: 30
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
      labels:
        handled: f
    resourceName: example-claim
    spec:
      hard:
        limits.cpu: "1"
        limits.memory: "1Gi"
`,
  )
  .setIn(
    [referenceForModel(k8sModels.ResourceQuotaClaimModel), 'resourcequotaclaim-sample'],
    `
    apiVersion: tmax.io/v1
    kind: ResourceQuotaClaim
    metadata:
      name: example-resourcequotaclaim
      namespace: default
      labels:
        handled: f
    resourceName: example-resourceclaim
    spec:
      hard:
        requests.cpu: '1'
        requests.memory: 1Gi
        limits.cpu: '2'
        limits.memory: 2Gi
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
      labels:
        handled: f
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
    apiVersion: tekton.dev/v1beta1
    kind: Task
    metadata:
      name: example-task
      namespace: default
    spec:
      resources:
        inputs:
          - name: git-source
            type: git
        outputs:
          - name: output-image
            type: image
      params:
      - name: example-string
        type: string
        description: a sample string
        default: default-string-value
      steps:
        - name: example-job
          image: example-image-name:latest
          env:
            - name: "SAMPLE_ENV"
              value: "hello/world/"
          command:
            - /bin/sh
          args:
            - -c
            - "echo helloworld"
          volumeMounts:
            - name: example-volume
              mountPath: /example/path
      volumes:
        - name: example-volume
          emptyDir: {}
`,
  )
  .setIn(
    [referenceForModel(k8sModels.TaskModel), 'task-sample'],
    `
    apiVersion: tekton.dev/v1beta1
    kind: Task
    metadata:
      name: example-task
      namespace: example-namespace
    spec:
      resources:
        inputs:
          - name: git-source
            type: git
        outputs:
          - name: output-image
            type: image
      params:
      - name: example-string
        type: string
        description: a sample string
        default: default-string-value
      steps:
        - name: example-job
          image: example-image-name:latest
          env:
            - name: "SAMPLE_ENV"
              value: "hello/world/"
          command:
            - /bin/sh
          args:
            - -c
            - "echo helloworld"
          volumeMounts:
            - name: example-volume
              mountPath: /example/path
      volumes:
        - name: example-volume
          emptyDir: {}
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
    [referenceForModel(k8sModels.TaskRunModel), 'taskrun-sample'],
    `
apiVersion: tekton.dev/v1beta1
kind: TaskRun
metadata:
  name: example-taskrun
  namespace: default
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
    [referenceForModel(k8sModels.PipelineResourceModel), 'pipelineresource-sample'],
    `
    apiVersion: tekton.dev/v1alpha1
    kind: PipelineResource
    metadata:
      name: example-pipeline-resource-git
      namespace: default
    spec:
      type: git
      params:
        - name: revision
          value: master
        - name: url
          value: https://github.com/wizzbangcorp/wizzbang.git
`,
  )
  .setIn(
    [referenceForModel(k8sModels.PipelineResourceModel), 'pipelineresource-sample2'],
    `
    apiVersion: tekton.dev/v1alpha1
    kind: PipelineResource
    metadata:
      name: example-pipeline-resource-git
      namespace: default
    spec:
      type: git
      params:
        - name: revision
          value: sample_revision
        - name: httpsProxy
          value: "my-sample.proxy.com"
`,
  )
  .setIn(
    [referenceForModel(k8sModels.PipelineResourceModel), 'pipelineresource-sample3'],
    `
    apiVersion: tekton.dev/v1alpha1
    kind: PipelineResource
    metadata:
      name: example-pipeline-resources-image
      namespace: default
    spec:
      type: image
      params:
        - name: url
          value: gcr.io/staging-images/kritis
`,
  )
  .setIn(
    [referenceForModel(k8sModels.PipelineResourceModel), 'pipelineresource-sample4'],
    `
    apiVersion: tekton.dev/v1alpha1
    kind: PipelineResource
    metadata:
      name: example-pipeline-resource-git-description
      namespace: default
    spec:
      type: git
      description: description of the resource.
      params:
        - name: revision
          value: master
        - name: url     
          value: https://github.com/wizzbangcorp/wizzbang.git
`,
  )
  .setIn(
    [referenceForModel(k8sModels.PipelineModel), 'default'],
    `
apiVersion: tekton.dev/v1beta1
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
    [referenceForModel(k8sModels.PipelineModel), 'pipeline-sample'],
    `
apiVersion: tekton.dev/v1beta1
kind: Pipeline
metadata:
  name: example-pipeline
  namespace: default
spec:
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
apiVersion: tekton.dev/v1beta1
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
    [referenceForModel(k8sModels.PipelineRunModel), 'pipelinerun-sample'],
    `
apiVersion: tekton.dev/v1beta1
kind: PipelineRun
metadata:
  name: example-pipeline-run
  namespace: default
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
  namespace: example # (required) [string] registry's namespace
spec:
  image: registry:2.6.2 # (required)
  #description: example # (optional) [string] a brief description of the registry.
  loginId: example # (required) [string] username for registry login
  loginPassword: example # (required) [string] password for registry login
  #replicaSet:
    #labels:
      #mylabel1: v1
      #mylabel2: v2
    #selector:
      #matchExpressions:
      #- {key: mylabel2, operator: In, values: [v2]}
      #matchLabels:
        #mylabel1: v1
    #nodeSelector:
      #kubernetes.io/hostname: example
    #tolerations:
    #- effect: NoExecute
      #key: node.kubernetes.io/not-ready
      #tolerationSeconds: 10
    #- effect: NoExecute
      #key: node.kubernetes.io/unreachable
      #tolerationSeconds: 10
  service:
    #ingress:
      #domainName: 192.168.6.110.nip.io
      #port: 443 # (optional) [integer] external port (default: 443)
    loadBalancer:
      port: 443 # (optional) [integer] external port (default: 443)
  persistentVolumeClaim:
    create:
      accessModes: [ReadWriteOnce] # (required) [array] (ex: [ReadWriteOnce, ReadWriteMany])
      storageSize: 10Gi # (required) [string] desired storage size (ex: 10Gi)
      storageClassName: example # (required) [string] Filesystem storage class name available (ex: csi-cephfs-sc)
      volumeMode: Filesystem
      deleteWithPvc: false
`,
  )
  .setIn(
    [referenceForModel(k8sModels.RegistryModel), 'registry-sample'],
    `
    apiVersion: tmax.io/v1
    kind: Registry
    metadata:
      name: sample-registry
      namespace: default
    spec:
      image: <image registry>/registry:2.6.2
      description: default image registry
      loginId: tmax
      loginPassword: tmax123
      service:
        loadBalancer:
          port: 443
      persistentVolumeClaim:
        create: 
          accessModes:
            - ReadWriteMany
          storageSize: 10Gi
          storageClassName: csi-cephfs-sc
          volumeMode: Filesystem    
          deleteWithPvc: false
`,
  )
  .setIn(
    [referenceForModel(k8sModels.RegistryModel), 'registry-sample2'],
    `
    apiVersion: tmax.io/v1
    kind: Registry
    metadata:
      name: sample-registry
      namespace: default
    spec:
      image: <image registry>/registry:2.6.2
      description: default image registry
      loginId: tmax
      loginPassword: tmax123
      replicaSet:
        nodeSelector:
          kubernetes.io/hostname: worker01
      service:
        loadBalancer:     
          port: 443
      persistentVolumeClaim:
        create:
          accessModes:
            - ReadWriteMany
          storageSize: 10Gi
          storageClassName: csi-cephfs-sc
          volumeMode: Filesystem
          deleteWithPvc: false
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
    imageUrl: example.com/example.gif
    provider: tmax
    recommend: true
    objects:
    - apiVersion: apps/v1
      kind: Deployment
      metadata:
        name: \${NAME}
        labels:
          app: \${NAME}
      spec:
        selector:
          matchLabels:
            app: \${NAME}
        template:
          metadata:
            labels:
              app: \${NAME}
          spec:
            containers:
            - name: \${NAME}
              image: example/image:version
              ports:
              - name: example
                containerPort: 80
    plans:
    - name: example-plan
      metadata:
        bullets:
        - feat 1
        - feat 2
        costs:
          amount: 100
          unit: $
        bindable: true
        schemas:
          service_instance:
            create:
              parameters:
                EXAMPLE_PARAM: value
    parameters:
    - name: NAME
      description: Application name
      valueType: string
      value: example

`,
  )
  .setIn(
    [referenceForModel(k8sModels.TemplateModel), 'template-sample'],
    `
    apiVersion: tmax.io/v1
    kind: Template
    metadata:
      name: example-template
      namespace: default
    imageUrl: example.com/example.gif
    provider: tmax
    recommend: true
    objects:
    - apiVersion: apps/v1
      kind: Deployment
      metadata:
        name: \${NAME}
        labels:
          app: \${NAME}
      spec:
        selector:
          matchLabels:
            app: \${NAME}
        template:
          metadata:
            labels:
              app: \${NAME}
          spec:
            containers:
            - name: \${NAME}
              image: example/image:version
              ports:
              - name: example
                containerPort: 80
    plans:
    - name: example-plan
      metadata:
        bullets:
        - feat 1
        - feat 2
        costs:
          amount: 100
          unit: $
        bindable: true
        schemas:
          service_instance:
            create:
              parameters:
                EXAMPLE_PARAM: value
    parameters:
    - name: NAME
      description: Application name
      valueType: string
      value: example
`,
  )
  .setIn(
    [referenceForModel(k8sModels.TemplateModel), 'template-sample2'],
    `
    apiVersion: tmax.io/v1
    kind: Template
    metadata:
      name: apache-cicd-template
      namespace: default
    imageUrl: https://upload.wikimedia.org/wikipedia/commons/4/45/Apache_HTTP_server_logo_%282016%29.png
    provider: tmax
    recommend: false
    shortDescription: Apache CI/CD Template
    longDescription: Apache CI/CD Template
    tags:
    - was
    - apache
    plans:
    - bindable: false
      description: apache
      name: apache-plan1
    parameters:
    - name: APP_NAME
      displayName: AppName
      description: Application name
      required: true
    - name: NAMESPACE
      displayName: Namespace
      description: Application namespace
      required: true
    - name: GIT_URL
      displayName: GitURL
      description: Git Repo. URL
      required: true
    - name: GIT_REV
      displayName: GitRev
      description: Git Revision
      required: true
    - name: IMAGE_URL
      displayName: ImageURL
      description: Output Image URL
      required: true
    - name: SERVICE_ACCOUNT_NAME
      displayName: serviceAccountName
      description: Service Account Name
      required: true
    - name: WAS_PORT
      displayName: wasPort
      description: WAS Port
      valueType: number
      required: true
    - name: SERVICE_TYPE
      displayName: ServiceType
      description: Service Type (ClsuterIP/NodePort/LoadBalancer)
      required: true
    - name: PACKAGE_SERVER_URL
      displayName: PackageServerUrl
      description: URL (including protocol, ip, port, and path) of private package server
        (e.g., devpi, pypi, verdaccio, ...)
      required: false
    objects:
    - apiVersion: v1
      kind: Service
      metadata:
        name: \${APP_NAME}-service
        namespace: \${NAMESPACE}
        labels:
          app: \${APP_NAME}
      spec:
        type: \${SERVICE_TYPE}
        ports:
        - port: \${WAS_PORT}
        selector:
          app: \${APP_NAME}
          tier: was
    - apiVersion: v1
      kind: ConfigMap
      metadata:
        name: \${APP_NAME}-deploy-cfg
        namespace: \${NAMESPACE}
      data:
        deploy-spec.yaml: |
          spec:
            selector:
              matchLabels:
                app: \${APP_NAME}
                tier: was
            template:
              metadata:
                labels:
                  app: \${APP_NAME}
                  tier: was
              spec:
                containers:
                - ports:
                  - containerPort: \${WAS_PORT}
    - apiVersion: tekton.dev/v1alpha1
      kind: PipelineResource
      metadata:
        name: \${APP_NAME}-input-git
        namespace: \${NAMESPACE}
      spec:
        type: git
        params:
        - name: revision
          value: \${GIT_REV}
        - name: url
          value: \${GIT_URL}
    - apiVersion: tekton.dev/v1alpha1
      kind: PipelineResource
      metadata:
        name: \${APP_NAME}-output-image
        namespace: \${NAMESPACE}
      spec:
        type: image
        params:
        - name: url
          value: \${IMAGE_URL}
    - apiVersion: tekton.dev/v1beta1
      kind: Pipeline
      metadata:
        name: \${APP_NAME}-pipeline
        namespace: \${NAMESPACE}
      spec:
        resources:
        - name: source-repo
          type: git
        - name: image
          type: image
        params:
        - name: app-name
          type: string
          description: Application name
        - name: replica
          type: string
          description: Number of replica
          default: "1"
        - name: port
          type: string
          description: Application port
          default: "8080"
        - name: deploy-cfg-name
          description: Configmap name for description
        tasks:
        - name: build-source
          taskRef:
            name: s2i
            kind: ClusterTask
          params:
          - name: BUILDER_IMAGE
            value: \${DOCKER_REGISTRY_URL:PORT}/{IMAGE_NAME:TAG}
          - name: PACKAGE_SERVER_URL
            value: \${PACKAGE_SERVER_URL}
          resources:
            inputs:
            - name: source
              resource: source-repo
            outputs:
            - name: image
              resource: image
            - name: scan-and-sign-image
              taskRef:
                name: analyze-image-vulnerabilities
                kind: ClusterTask
              resources:
                inputs:
                - name: scanned-image
                  resource: image
                  from:
                  - build-source
              params:
              - name: image-url
                value: $(tasks.build-source.results.image-url)
            - name: deploy
              taskRef:
                name: generate-and-deploy-using-kubectl
                kind: ClusterTask
              runAfter:
              - scan-and-sign-image
              resources:
                inputs:
                - name: image
                  resource: image
              params:
              - name: app-name
                value: $(params.app-name)
              - name: replica
                value: $(params.replica)
              - name: port
                value: $(params.port)
              - name: image-url
                value: $(tasks.build-source.results.image-url)
              - name: deploy-cfg-name
                value: $(params.deploy-cfg-name)
    - apiVersion: tekton.dev/v1beta1
      kind: PipelineRun
      metadata:
        generateName: \${APP_NAME}-pipeline-run-
        namespace: \${NAMESPACE}
      spec:
        serviceAccountName: \${SERVICE_ACCOUNT_NAME}
        pipelineRef:
          name: \${APP_NAME}-pipeline
        resources:
        - name: source-repo
          resourceRef:
            name: \${APP_NAME}-input-git
        - name: image
          resourceRef:
            name: \${APP_NAME}-output-image
        params:
        - name: app-name
          value: \${APP_NAME}
        - name: deploy-cfg-name
          value: \${APP_NAME}-deploy-cfg
`,
  )
  .setIn(
    [referenceForModel(k8sModels.TemplateModel), 'template-sample3'],
    `
    apiVersion: tmax.io/v1
    kind: Template
    metadata:
      name: mysql-template
      namespace: default
    shortDescription: MySQL Deployment
    longDescription: MySQL Deployment
    imageUrl: https://upload.wikimedia.org/wikipedia/en/6/62/MySQL.svg
    provider: tmax
    tags:
    - db
    - mysql
    objects:
    - apiVersion: v1
      kind: Service
      metadata:
        name: \${APP_NAME}-service
        namespace: \${NAMESPACE}
        labels:
          app: \${APP_NAME}
      spec:
        type: \${SERVICE_TYPE}
        ports:
        - port: 3306
        selector:
          app: \${APP_NAME}
          tier: mysql
    - apiVersion: v1
      kind: PersistentVolumeClaim
      metadata:
        name: \${APP_NAME}-pvc
        namespace: \${NAMESPACE}
        labels:
          app: \${APP_NAME}
      spec:
        storageClassName: csi-cephfs-sc
        accessModes:
        - ReadWriteOnce
        resources:
          requests:
            storage: \${DB_STORAGE}
    - apiVersion: v1
      kind: Secret
      metadata:
        name: \${APP_NAME}-secret
        namespace: \${NAMESPACE}
      type: Opaque
      stringData:
        user: \${MYSQL_USER}
        password: \${MYSQL_PASSWORD}
        database: \${MYSQL_DATABASE}
    - apiVersion: apps/v1
      kind: Deployment
      metadata:
        name: \${APP_NAME}-mysql
        namespace: \${NAMESPACE}
        labels:
          app: \${APP_NAME}
      spec:
        selector:
          matchLabels:
            app: \${APP_NAME}
            tier: mysql
        strategy:
          type: Recreate
        template:
          metadata:
            labels:
              app: \${APP_NAME}
              tier: mysql
          spec:
            containers:
            - image: 192.168.6.110:5000/centos/mysql:5.7
              name: mysql
              env:
              - name: MYSQL_USER
                valueFrom:
                  secretKeyRef:
                    name: \${APP_NAME}-secret
                    key: user
              - name: MYSQL_PASSWORD
                valueFrom:
                  secretKeyRef:
                    name: \${APP_NAME}-secret
                    key: password
              - name: MYSQL_DATABASE
                valueFrom:
                  secretKeyRef:
                    name: \${APP_NAME}-secret
                    key: database
              ports:
              - containerPort: 3306
                name: mysql
              volumeMounts:
              - name: mysql-persistent-storage
                mountPath: /var/lib/mysql/data
            volumes:
            - name: mysql-persistent-storage
              persistentVolumeClaim:
                claimName: \${APP_NAME}-pvc
    parameters:
    - name: APP_NAME
      displayName: AppName
      description: Application name
      required: true
    - name: NAMESPACE
      displayName: Namespace
      required: true
      description: Application namespace
    - name: DB_STORAGE
      displayName: DBStorage
      description: Storage size for DB
      required: true
    - name: SERVICE_TYPE
      displayName: ServiceType
      description: Service Type (ClsuterIP/NodePort/LoadBalancer)
      required: true
    - name: MYSQL_USER
      displayName: MysqlUser
      description: MysqlUser
      required: true
    - name: MYSQL_PASSWORD
      displayName: MysqlPassword
      description: MysqlPassword
      required: true
    - name: MYSQL_DATABASE
      displayName: MysqlDatabase
      description: MysqlDatabase
      required: true
    plans:
    - name: mysql-plan1
      description: mysql
      metadata:
        bullets:
        - 'Storage Capacity: 5Gi'
        costs:
          amount: 100
          unit: $
      free: false
      bindable: true
      plan_updateable: false
      schemas:
        service_instance:
          create:
            parameters:
              NAMESPACE: default
              DB_STORAGE: 5Gi
              APP_NAME: mysql-deploy
              MYSQL_USER: $USERID
              MYSQL_PASSWORD: $PASSWORD
              MYSQL_DATABASE: $DATABASENAME
    - name: mysql-plan2
      description: mysql
      metadata:
        bullets:
        - 'Storage Capacity: 30Gi'
        costs:
          amount: 500
          unit: $
      free: false
      bindable: true
      plan_updateable: false
      schemas:
        service_instance:
          create:
            parameters:
              NAMESPACE: default
              DB_STORAGE: 30Gi
              APP_NAME: mysql-deploy
              MYSQL_USER: root1
              MYSQL_PASSWORD: tmax@23
              MYSQL_DATABASE: root1
`,
  )
  .setIn(
    [referenceForModel(k8sModels.TemplateModel), 'template-sample4'],
    `
apiVersion: tmax.io/v1
kind: Template
metadata:
  name: nodejs-mysql-template
  namespace: default
imageUrl: https://i.imgur.com/ImDhuQF.png
provider: tmax
recommend: false
shortDescription: NodeJS & MySQL Template
longDescription: NodeJS & MySQL Template
tags:
- was
- nodejs
- db
- mysql
plans:
- bindable: false
  description: nodejs-mysql
  name: nodejs-mysql-plan1
  schemas:
    service_instance:
      create:
        parameters:
          NAMESPACE: default
          DB_STORAGE: 5Gi
          APP_NAME: mysql-deploy
          MYSQL_USER: root1
          MYSQL_PASSWORD: tmax@23
          MYSQL_DATABASE: root1
parameters:
- name: APP_NAME
  displayName: PipelineName
  description: Pipeline name
  required: true
- name: NAMESPACE
  displayName: Namespace
  description: Application namespace
  required: true
- name: DB_STORAGE
  displayName: DBStorage
  description: Storage size for DB
  required: true
- name: MYSQL_USER
  displayName: MysqlUser
  description: MysqlUser
  required: true
- name: MYSQL_PASSWORD
  displayName: MysqlPassword
  description: MysqlPassword
  required: true
- name: MYSQL_DATABASE
  displayName: MysqlDatabase
  description: MysqlDatabase
  required: true
- name: GIT_URL
  displayName: GitURL
  description: Git Repo. URL
  required: true
- name: GIT_REV
  displayName: GitRev
  description: GitRevision
  required: true
- name: IMAGE_URL
  displayName: ImageURL
  description: Output Image URL
  required: true
- name: REGISTRY_SECRET
  displayName: RegistrySecret
  description: Secret for accessing image registry
  required: false
  value: ''
- name: REGISTRY_ID
  displayName: RegistryId
  description: ID for accessing image registry
  required: false
  value: ''
- name: REGISTRY_PW
  displayName: RegistryPw
  description: PW for accessing image registry
  required: false
  value: ''
- name: SERVICE_ACCOUNT_NAME
  displayName: serviceAccountName
  description: Service Account Name
  required: true
- name: WAS_PORT
  displayName: wasPort
  description: WAS Port
  valueType: number
  required: true
- name: DB_SERVICE_TYPE
  displayName: DbServiceType
  description: DB Service Type (ClsuterIP/NodePort/LoadBalancer)
  required: true
- name: WAS_SERVICE_TYPE
  displayName: WasServiceType
  description: WAS Service Type (ClsuterIP/NodePort/LoadBalancer)
  required: true
- name: PACKAGE_SERVER_URL
  displayName: PackageServerUrl
  description: URL (including protocol, ip, port, and path) of private package server
    (e.g., devpi, pypi, verdaccio, ...)
  required: false
objects:
- apiVersion: v1
  kind: Service
  metadata:
    name: \${APP_NAME}-service
    namespace: \${NAMESPACE}
    labels:
      app: \${APP_NAME}
  spec:
    type: \${WAS_SERVICE_TYPE}
    ports:
    - port: \${WAS_PORT}
    selector:
      app: \${APP_NAME}
      tier: nodejs
- apiVersion: v1
  kind: Service
  metadata:
    name: \${APP_NAME}-db-service
    namespace: \${NAMESPACE}
    labels:
      app: \${APP_NAME}
  spec:
    type: \${DB_SERVICE_TYPE}
    ports:
    - port: 3306
    selector:
      app: \${APP_NAME}
      tier: mysql
- apiVersion: v1
  kind: PersistentVolumeClaim
  metadata:
    name: \${APP_NAME}-db-pvc
    namespace: \${NAMESPACE}
    labels:
      app: \${APP_NAME}
  spec:
    storageClassName: csi-cephfs-sc
    accessModes:
    - ReadWriteOnce
    resources:
      requests:
        storage: \${DB_STORAGE}
- apiVersion: v1
  kind: Secret
  metadata:
    name: \${APP_NAME}-secret
    namespace: \${NAMESPACE}
  type: Opaque
  stringData:
    user: \${MYSQL_USER}
    password: \${MYSQL_PASSWORD}
    database: \${MYSQL_DATABASE}
- apiVersion: apps/v1
  kind: Deployment
  metadata:
    name: \${APP_NAME}-mysql
    namespace: \${NAMESPACE}
    labels:
      app: \${APP_NAME}
  spec:
    selector:
      matchLabels:
        app: \${APP_NAME}
        tier: mysql
    strategy:
      type: Recreate
    template:
      metadata:
        labels:
          app: \${APP_NAME}
          tier: mysql
      spec:
        initContainers:
        - name: init-privilege-\${MYSQL_USER}
          image: busybox
          command:
          - sh
          - -c
          - echo 'mysql $mysql_flags -e "grant all privileges on *.* to \${MYSQL_USER}@'\''%'\''; flush privileges;"' >> /opt/app-root/src/mysql-init/privilege.sh
          volumeMounts:
          - name: mysql-init-cfg
            mountPath: /opt/app-root/src/mysql-init
        containers:
        - image: 192.168.6.110:5000/centos/mysql:5.7
          name: mysql
          env:
          - name: MYSQL_USER
            valueFrom:
              secretKeyRef:
                name: \${APP_NAME}-secret
                key: user
          - name: MYSQL_PASSWORD
            valueFrom:
              secretKeyRef:
                name: \${APP_NAME}-secret
                key: password
          - name: MYSQL_DATABASE
            valueFrom:
              secretKeyRef:
                name: \${APP_NAME}-secret
                key: database
          ports:
          - containerPort: 3306
            name: mysql
          volumeMounts:
          - name: mysql-persistent-storage
            mountPath: /var/lib/mysql/data
          - name: mysql-init-cfg
            mountPath: /opt/app-root/src/mysql-init
          readinessProbe:
            initialDelaySeconds: 5
            periodSeconds: 10
            exec:
              command:
              - /bin/bash
              - -c
              - MYSQL_PWD="$MYSQL_PASSWORD" mysql -h 127.0.0.1 -u $MYSQL_USER -D $MYSQL_DATABASE
                -e 'SELECT 1'
        volumes:
        - name: mysql-persistent-storage
          persistentVolumeClaim:
            claimName: \${APP_NAME}-db-pvc
        - name: mysql-init-cfg
          emptyDir: {}
- apiVersion: v1
  kind: ConfigMap
  metadata:
    name: \${APP_NAME}-deploy-cfg
    namespace: \${NAMESPACE}
  data:
    deploy-spec.yaml: |
      spec:
        selector:
          matchLabels:
            app: \${APP_NAME}
            tier: nodejs
        template:
          metadata:
            labels:
              app: \${APP_NAME}
              tier: nodejs
          spec:
            imagePullSecrets:
            - name: \${REGISTRY_SECRET}
            containers:
            - env:
              - name: DB_HOST
                value: \${APP_NAME}-db-service
              - name: DB_PORT
                value: "3306"
              - name: DB_USER
                valueFrom:
                  secretKeyRef:
                    name: \${APP_NAME}-secret
                    key: user
              - name: DB_PW
                valueFrom:
                  secretKeyRef:
                    name: \${APP_NAME}-secret
                    key: password
              - name: DB_NAME
                valueFrom:
                  secretKeyRef:
                    name: \${APP_NAME}-secret
                    key: database
              ports:
              - containerPort: \${WAS_PORT}
- apiVersion: tekton.dev/v1alpha1
  kind: PipelineResource
  metadata:
    name:\${APP_NAME}-input-git
    namespace:\${NAMESPACE}
  spec:
    type: git
    params:
    - name: revision
      value: \${GIT_REV}
    - name: url
      value: \${GIT_URL}
- apiVersion: tekton.dev/v1alpha1
  kind: PipelineResource
  metadata:
    name: \${APP_NAME}-output-image
    namespace: \${NAMESPACE}
  spec:
    type: image
    params:
    - name: url
      value: \${IMAGE_URL}
- apiVersion: tekton.dev/v1beta1
  kind: Pipeline
  metadata:
    name: \${APP_NAME}-pipeline
    namespace: \${NAMESPACE}
  spec:
    resources:
    - name: source-repo
      type: git
    - name: image
      type: image
    params:
    - name: app-name
      type: string
      description: Application name
    - name: replica
      type: string
      description: Number of replica
      default: "1"
    - name: port
      type: string
      description: Application port
      default: "8080"
    - name: deploy-cfg-name
      description: Configmap name for description
    tasks:
    - name: build-source
      taskRef:
        name: s2i
        kind: ClusterTask
      params:
      - name: BUILDER_IMAGE
        value: 192.168.6.110:5000/s2i-nodejs:12
      - name: PACKAGE_SERVER_URL
        value: \${PACKAGE_SERVER_URL}
      - name: REGISTRY_ID
        value: \${REGISTRY_ID}
      - name: REGISTRY_PW
        value: \${REGISTRY_PW}
      resources:
        inputs:
        - name: source
          resource: source-repo
        outputs:
        - name: image
          resource: image
    - name: scan-and-sign-image
      taskRef:
        name: analyze-image-vulnerabilities
        kind: ClusterTask
      resources:
        inputs:
        - name: scanned-image
          resource: image
          from:
          - build-source
      params:
      - name: image-url
        value: $(tasks.build-source.results.image-url)
    - name: deploy
      taskRef:
        name: generate-and-deploy-using-kubectl
        kind: ClusterTask
      runAfter:
      - scan-and-sign-image
      resources:
        inputs:
        - name: image
          resource: image
      params:
      - name: app-name
        value: $(params.app-name)
      - name: replica
        value: $(params.replica)
      - name: port
        value: $(params.port)
      - name: image-url
        value: $(tasks.build-source.results.image-url)
      - name: deploy-cfg-name
        value: $(params.deploy-cfg-name)
- apiVersion: tekton.dev/v1beta1
  kind: PipelineRun
  metadata:
    generateName: \${APP_NAME}-run-
    namespace: \${NAMESPACE}
  spec:
    serviceAccountName: \${SERVICE_ACCOUNT_NAME}
    pipelineRef:
      name: \${APP_NAME}-pipeline
    resources:
    - name: source-repo
      resourceRef:
        name: \${APP_NAME}-input-git
    - name: image
      resourceRef:
        name: \${APP_NAME}-output-image
    params:
    - name: app-name
      value: \${APP_NAME}
    - name: replica
      value: "1"
    - name: deploy-cfg-name
      value: \${APP_NAME}-deploy-cfg
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
    [referenceForModel(k8sModels.TemplateInstanceModel), 'templateinstance-sample'],
    `
    apiVersion: tmax.io/v1
    kind: TemplateInstance
    metadata:    
      name: gitlab-template-instance
      namespace: default
    spec:
      template:
        metadata:
          name: gitlab-template
        parameters:
        - name: APP_NAME
          value: gitlab-test-deploy
        - name: NAMESPACE
          value: default
        - name: STORAGE 
          value: 30Gi 
        - name: SERVICE_TYPE 
          value: LoadBalancer
`,
  )
  .setIn(
    [referenceForModel(k8sModels.TemplateInstanceModel), 'templateinstance-sample2'],
    `
apiVersion: tmax.io/v1
kind: TemplateInstance
metadata:
  name: apache-cicd-template-instance
  namespace: default
spec:
  template:
    metadata:
      name: apache-cicd-template
    parameters:
    - name: APP_NAME
      value: apache-sample-app
    - name: NAMESPACE
      value: default
    - name: SERVICE_ACCOUNT_NAME
      value: tutorial-service
    - name: GIT_URL
      value: https://github.com/microsoft/project-html-website
    - name: GIT_REV
      value: master
    - name: IMAGE_URL
      value: xxx.xxx.xxx.xxx:5000/apache-sample:latest
    - name: REGISTRY_SECRET
      value: ''
    - name: REGISTRY_ID
      value: ''
    - name: REGISTRY_PW
      value: ''
    - name: WAS_PORT
      value: 8080
    - name: SERVICE_TYPE
      value: LoadBalancer
    - name: PACKAGE_SERVER_URL
      value: ''
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
    [referenceForModel(k8sModels.DeploymentModel), 'deployment-sample'],
    `
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: example-deployment
      namespace: default
      labels:
        app: nginx
    spec:
      selector:
        matchLabels:
          app: nginx
      template:
        metadata:
          labels:
            app: nginx
        spec:
          containers:
          - name: nginx
            image: nginx:1.14.2
            ports:
            - containerPort: 80
`,
  )
  .setIn(
    [referenceForModel(k8sModels.DeploymentModel), 'deployment-sample2'],
    `
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: example-deployment
      namespace: default
      labels:
        app: nginx
    spec:
      selector:
        matchLabels:
          app: nginx
      replicas: 3
      minReadySeconds: 10
      template:
        metadata:
          labels:
            app: nginx
        spec:
          containers:
          - name: nginx
            image: nginx:1.14.2
            ports:
            - containerPort: 80
`,
  )
  .setIn(
    [referenceForModel(k8sModels.DeploymentModel), 'deployment-sample3'],
    `
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: example-deployment
      namespace: default
      labels:
        app: nginx
    spec:
      selector:
        matchLabels:
          app: nginx
      replicas: 3
      strategy:
        rollingUpdate:
          maxSurge: 30%
          maxUnavailable: 30%
        type: RollingUpdate
      template:
        metadata:
          labels:
            app: nginx
        spec:
          containers:
          - name: nginx
            image: nginx:1.14.2
            ports:
            - containerPort: 80
`,
  )
  .setIn(
    [referenceForModel(k8sModels.DeploymentModel), 'deployment-sample4'],
    `
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: example-deployment
      namespace: default
      labels:
        app: nginx
    spec:
      selector:
        matchLabels:
          app: nginx
      template:
        metadata:
          labels:
            app: nginx
        spec:
          containers:
          - name: nginx
            image: nginx:1.14.2
            ports:
            - containerPort: 80
            volumeMounts:
            - mountPath: /example_data
              name: example-volume
          volumes:
          - name: example-volume
            hostPath:
              path: /example
              type: Directory
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
    [referenceForModel(k8sModels.ConfigMapModel), 'configmap-sample'],
    `
apiVersion: v1
kind: ConfigMap
metadata:
  name: example
  namespace: default
data:
  os: hello
  version: world
`,
  )
  .setIn(
    [referenceForModel(k8sModels.ConfigMapModel), 'configmap-sample2'],
    `
apiVersion: v1
kind: ConfigMap
metadata:
  name: example
  namespace: default
data:
  sample-configmap.properties: |
    os=prolinux
    version=7.5
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
            - date; echo 'Hello from the Kubernetes cluster'
          restartPolicy: OnFailure
`,
  )
  .setIn(
    [referenceForModel(k8sModels.CronJobModel), 'cronjob-sample'],
    `
apiVersion: batch/v1beta1
kind: CronJob
metadata:
  name: example
  namespace: default
spec:
  schedule: '*/10 * * * *'
  jobTemplate:
    spec:
      template:
        spec:
          containers:
            - name: hello
              image: busybox
              args:
                - /bin/sh
                - '-c'
                - date; echo 'Hello from the Kubernetes cluster'
          restartPolicy: OnFailure
`,
  )
  .setIn(
    [referenceForModel(k8sModels.CronJobModel), 'cronjob-sample2'],
    `
apiVersion: batch/v1beta1
kind: CronJob
metadata:
  name: example
  namespace: default
spec:
  schedule: '@daily'
  jobTemplate:
    spec:
      template:
        spec:
          containers:
            - name: hello
              image: busybox
              args:
                - /bin/sh
                - '-c'
                - date; echo 'Hello from the Kubernetes cluster'
          restartPolicy: OnFailure
`,
  )
  .setIn(
    [referenceForModel(k8sModels.CronJobModel), 'cronjob-sample3'],
    `
apiVersion: batch/v1beta1
kind: CronJob
metadata:
  name: example
  namespace: default
spec:
  schedule: '5 4-5 * * *'
  jobTemplate:
    spec:
      template:
        spec:
          containers:
            - name: hello
              image: busybox
              args:
                - /bin/sh
                - '-c'
                - date; echo 'Hello from the Kubernetes cluster'
          restartPolicy: OnFailure
`,
  )
  .setIn(
    [referenceForModel(k8sModels.CronJobModel), 'cronjob-sample4'],
    `
apiVersion: batch/v1beta1
kind: CronJob
metadata:
  name: example
  namespace: default
spec:
  schedule: '*/10 * * * *'
  ConcurrencyPolicy: Forbid
  jobTemplate:
    spec:
      template:
        spec:
          containers:
            - name: hello
              image: busybox
              args:
                - /bin/sh
                - '-c'
                - date; echo 'Hello from the Kubernetes cluster'
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
    [referenceForModel(k8sModels.CustomResourceDefinitionModel), 'customresourcedefinition-sample'],
    `
    apiVersion: apiextensions.k8s.io/v1beta1
    kind: CustomResourceDefinition
    metadata:
      name: crontabs.stable.example.com
    spec:
      conversion:
        strategy: None
      group: stable.example.com
      versions:
        - name: v1
          served: true
          storage: true
      scope: Namespaced
      names:
        plural: crontabs
        singular: crontab
        kind: CronTab
        shortNames:
        - ct
      preserveUnknownFields: false
      validation:
        openAPIV3Schema:
          type: object
          properties:
            spec:
              type: object
              properties:
                cronSpec:
                  type: string
                image:
                  type: string
                replicas:
                  type: integer
`,
  )
  .setIn(
    [referenceForModel(k8sModels.CustomResourceDefinitionModel), 'customresourcedefinition-sample2'],
    `
    apiVersion: apiextensions.k8s.io/v1beta1
    kind: CustomResourceDefinition
    metadata:
      name: crontabs.stable.example.com
    spec:
      conversion:
        strategy: None
      additionalPrinterColumns:
      - name: CronSpec
        type: string
        JSONPath: .spec.cronSpec
      - name: Age
        type: date
        JSONPath: .metadata.creationTimestamp
      group: stable.example.com
      versions:
        - name: v1
          served: true
          storage: true
      scope: Namespaced
      names:
        plural: crontabs
        singular: crontab
        kind: CronTab
        shortNames:
        - ct
      preserveUnknownFields: false
      validation:
        openAPIV3Schema:
          type: object
          properties:
            spec:
              type: object
              properties:
                cronSpec:
                  type: string
                image:
                  type: string
                replicas:
                  type: integer
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
    [referenceForModel(k8sModels.PersistentVolumeModel), 'persistentvolume-sample'],
    `
    apiVersion: v1
    kind: PersistentVolume
    metadata:
      name: example-PersistentVolume
    spec:
      capacity:
        storage: 1Gi
      accessModes:
        - ReadWriteOnce
      persistentVolumeReclaimPolicy: Delete
      storageClassName: \${STORAGECLASSNAME}
      hostPath:
        path: "/tmp"
`,
  )
  .setIn(
    [referenceForModel(k8sModels.PersistentVolumeModel), 'persistentvolume-sample2'],
    `
    apiVersion: v1
    kind: PersistentVolume
    metadata:
      name: example-PersistentVolume
    spec:
      capacity:
        storage: 1Gi
      accessModes:
        - ReadOnlyMany
      persistentVolumeReclaimPolicy: Retain
      storageClassName: \${STORAGECLASSNAME}
      hostPath:
        path: "/tmp"
`,
  )
  .setIn(
    [referenceForModel(k8sModels.PersistentVolumeModel), 'persistentvolume-sample3'],
    `
    apiVersion: v1
    kind: PersistentVolume
    metadata:
      name: example-PersistentVolume
    spec:
      capacity:
        storage: 1Gi
      accessModes:
        - ReadWriteMany
      persistentVolumeReclaimPolicy: Delete
      storageClassName: \${STORAGECLASSNAME}
      volumeMode: Block
      hostPath:
        path: "/tmp"
`,
  )
  .setIn(
    [referenceForModel(k8sModels.PersistentVolumeModel), 'persistentvolume-sample4'],
    `
    apiVersion: v1
    kind: PersistentVolume
    metadata:
      name: example-PersistentVolume
    spec:
      capacity:
        storage: 1Gi
      accessModes:
        - ReadWriteOnce
      persistentVolumeReclaimPolicy: Recycle
      storageClassName: \${STORAGECLASSNAME}
      mountOptions:
        - hard
        - nfsvers=4.1
      nfs:
        path: /tmp
        server: xxx.xxx.xxx.xxx
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
  storageClassName: \${STORAGECLASSNAME}
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
    [referenceForModel(k8sModels.HorizontalPodAutoscalerModel), 'hpa-sample'],
    `
    apiVersion: autoscaling/v2beta1
    kind: HorizontalPodAutoscaler
    metadata:
      name: example-hpa
      namespace: default
    spec:
      scaleTargetRef:
        apiVersion: apps/v1
        kind: Deployment
        name: example-deployment
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
    [referenceForModel(k8sModels.HorizontalPodAutoscalerModel), 'hpa-sample2'],
    `
    apiVersion: autoscaling/v2beta1
    kind: HorizontalPodAutoscaler
    metadata:
      name: example-hpa
      namespace: default
    spec:
      scaleTargetRef:
        apiVersion: apps/v1
        kind: Deployment
        name: example-deployment
      minReplicas: 1
      maxReplicas: 5
      metrics:              
      - type: Resource
        resource:
          name: memory
          targetAverageValue: 100Mi
`,
  )
  .setIn(
    [referenceForModel(k8sModels.PodModel), 'default'],
    `
apiVersion: v1
kind: Pod
metadata:
  name: example
  namespace: default
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
  // TODO
  //service binding
  //template
  //template instance
  .setIn(
    [referenceForModel(k8sModels.PodModel), 'pod-sample'],
    `
apiVersion: v1
kind: Pod
metadata:
  name: example
  namespace: default
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
    [referenceForModel(k8sModels.PodModel), 'pod-sample2'],
    `
apiVersion: v1
kind: Pod
metadata:
  name: example2
  namespace: default
  labels:
    app: hello-hypercloud
spec:
  containers:
  - name: hello-hypercloud
    image: hypercloud/hello-hypercloud
    resources:  
      requests:
        cpu: 0.1
        memory: 200M
      limits:
        cpu: 0.5
        memory: 1G
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
    [referenceForModel(k8sModels.IngressModel), 'ingress-sample'],
    `
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: example
  namespace: sample1-name
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
    [referenceForModel(k8sModels.IngressModel), 'ingress-sample2'],
    `
apiVersion: networking.k8s.io/v1beta1
kind: Ingress
metadata:
  name: test-ingress
  namespace: sample1-name
spec:
  backend:
    serviceName: testsvc
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
  namespace: default
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
    [referenceForModel(k8sModels.JobModel), 'job-sample'],
    `
    apiVersion: batch/v1
    kind: Job
    metadata:
      name: example-job
      namespace: default
    spec:
      template:
        spec:
          containers:
          - name: pi
            image: perl
            command: ["perl",  "-Mbignum=bpi", "-wle", "print bpi(2000)"]
          restartPolicy: Never
`,
  )
  .setIn(
    [referenceForModel(k8sModels.JobModel), 'job-sample2'],
    `
    apiVersion: batch/v1
    kind: Job
    metadata:
      name: example-job
      namespace: default
    spec:
      template:
        spec:
          containers:
          - name: pi
            image: perl
            command: ["perl",  "-Mbignum=bpi", "-wle", "print bpi(2000)"]
          restartPolicy: Never
      backoffLimit: 4
`,
  )
  .setIn(
    [referenceForModel(k8sModels.JobModel), 'job-sample3'],
    `
    apiVersion: batch/v1
    kind: Job
    metadata:
      name: example-job
      namespace: default
    spec:
      template:
        spec:
          containers:
          - name: pi
            image: perl
            command: ["perl",  "-Mbignum=bpi", "-wle", "print bpi(2000)"]
          restartPolicy: Never
      activeDeadlineSeconds:: 10
`,
  )
  .setIn(
    [referenceForModel(k8sModels.JobModel), 'job-sample4'],
    `
    apiVersion: batch/v1
    kind: Job
    metadata:
      name: example-job
      namespace: default
    spec:
      completions: 3
      parallelism: 3
      template:
        spec:
          containers:
          - name: pi1
            image: perl:latest
            command: ["perl",  "-Mbignum=bpi", "-wle", "print bpi(100)"]
          - name: pi2
            image: perl:latest
            command: ["perl",  "-Mbignum=bpi", "-wle", "print bpi(200)"]
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
    [referenceForModel(k8sModels.ServiceModel), 'service-sample'],
    `
apiVersion: v1
kind: Service
metadata:
  name: example
  namespace: sample1-name
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
    [referenceForModel(k8sModels.ServiceModel), 'service-sample2'],
    `
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  selector:
    app: MyApp
  ports:
    - name: http
      protocol: TCP
      port: 80
      targetPort: 9376
    - name: https
      protocol: TCP
      port: 443
      targetPort: 9377
`,
  )
  .setIn(
    [referenceForModel(k8sModels.ServiceModel), 'service-sample3'],
    `
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  selector:
    app: MyApp
  ports:
    - name: http
      protocol: TCP
      port: 80
      targetPort: 9376
  externalIPs:
        - 80.11.12.10
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
    [referenceForModel(k8sModels.DaemonSetModel), 'daemonset-sample'],
    `
    apiVersion: apps/v1
    kind: DaemonSet
    metadata:
      name: example-daemonset
      namespace: default
    spec:
      selector:
        matchLabels:
          app: example-daemonset
      template:
        metadata:
          labels:
            app: example-daemonset
        spec:
          containers:
            - name: example-daemonset-apache
              image: httpd:latest
              resources:
                limits:
                  cpu: 100m
                  memory: 200Mi
                requests:
                  cpu: 100m
                  memory: 200Mi
              ports:
                - containerPort: 80
`,
  )
  .setIn(
    [referenceForModel(k8sModels.DaemonSetModel), 'daemonset-sample2'],
    `
    apiVersion: apps/v1
    kind: DaemonSet
    metadata:
      name: example-daemonset
      namespace: default
    spec:
      selector:
        matchLabels:
          app: example-daemonset
      template:
        metadata:
          labels:
            app: example-daemonset
        spec:
          tolerations:
          # this toleration is to have the daemonset runnable on master nodes
          # remove it if your masters can't run pods
          - key: node-role.kubernetes.io/master
            effect: NoSchedule
          containers:
            - name: example-daemonset-apache
              image: httpd:latest
              resources:
                limits:
                  cpu: 100m
                  memory: 200Mi
                requests:
                  cpu: 100m
                  memory: 200Mi
              ports:
                - containerPort: 80
`,
  )
  .setIn(
    [referenceForModel(k8sModels.DaemonSetModel), 'daemonset-sample3'],
    `
    apiVersion: apps/v1
    kind: DaemonSet
    metadata:
      name: example-daemonset
      namespace: default
    spec:
      selector:
        matchLabels:
          app: example-daemonset
      updateStrategy:
        type: RollingUpdate
      minReadySeconds: 3
      revisionHistoryLimit: 100
      template:
        metadata:
          labels:
            app: example-daemonset
        spec:
          containers:
            - name: example-daemonset-apache
              image: httpd:latest
              ports:
                - containerPort: 80
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
  storageClassName: \${STORAGECLASSNAME}
  selector:
    matchLabels:
      release: "stable"
    matchExpressions:
      - {key: environment, operator: In, values: [dev]}
`,
  )
  .setIn(
    [referenceForModel(k8sModels.PersistentVolumeClaimModel), 'persistentvolumeclaim-sample'],
    `
    kind: PersistentVolumeClaim
    apiVersion: v1
    metadata:
      name: sample
      namespace: default
    spec:
      accessModes:
        - ReadWriteMany
      resources:
        requests:
          storage: 1Gi
      storageClassName: \${STORAGECLASSNAME}
`,
  )
  .setIn(
    [referenceForModel(k8sModels.PersistentVolumeClaimModel), 'persistentvolumeclaim-sample2'],
    `
    kind: PersistentVolumeClaim
    apiVersion: v1
    metadata:
      name: sample
      namespace: default
    spec:
      accessModes:
        - ReadOnlyMany
      resources:
        requests:
          storage: 1Gi
      storageClassName: \${STORAGECLASSNAME}
      volumeMode: Block
`,
  )
  .setIn(
    [referenceForModel(k8sModels.PersistentVolumeClaimModel), 'persistentvolumeclaim-sample3'],
    `
    kind: PersistentVolumeClaim
    apiVersion: v1
    metadata:
      name: sample
      namespace: default
    spec:
      accessModes:
        - ReadWriteMany
      resources:
        requests:
          storage: 1Gi
      volumeName: sample-pv
      storageClassName: \${STORAGECLASSNAME}
      volumeMode: Filesystem
`,
  )
  .setIn(
    [referenceForModel(k8sModels.PersistentVolumeClaimModel), 'persistentvolumeclaim-sample4'],
    `
    kind: PersistentVolumeClaim
    apiVersion: v1
    metadata:
      name: sample
      namespace: default
    spec:
      accessModes:
        - ReadWriteMany
      resources:
        requests:
          storage: 1Gi
      matchExpressions:
        - key: localstorage
          operator: In
          values:
            - hdd
      storageClassName: \${STORAGECLASSNAME}
      volumeMode: Filesystem
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
    [referenceForModel(k8sModels.ResourceQuotaModel), 'resourcequota-sample'],
    `
apiVersion: v1
kind: ResourceQuota
metadata:
  name: example
  namespace: default
spec:
  hard:
    requests.cpu: '1'
    requests.memory: 1Gi
    limits.cpu: '2'
    limits.memory: 2Gi
`,
  )
  .setIn(
    [referenceForModel(k8sModels.ResourceQuotaModel), 'resourcequota-sample2'],
    `
apiVersion: v1
kind: ResourceQuota
metadata:
  name: example
  namespace: default
spec:
  hard:
    configmaps: '10'
    persistentvolumeclaims: '4'
    replicationcontrollers: '20'
    secrets: '10'
    services: '10'
    services.loadbalancers: '2'
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
    [referenceForModel(k8sModels.StatefulSetModel), 'statefulset-sample'],
    `
    apiVersion: apps/v1
    kind: StatefulSet
    metadata:
      name: example-statefulset
      namespace: default
    spec:
      serviceName: example-statefulset
      replicas: 3
      selector:
        matchLabels:
          app: example-statefulset
      template:
        metadata:
          labels:
            app: example-statefulset
        spec:
          terminationGracePeriodSeconds: 10
          containers:
            - name: nginx
              image: 'httpd:latest'
              ports:
                - containerPort: 80
                  name: web
              volumeMounts:
                - name: www
                  mountPath: /usr/share/httpd/html
      volumeClaimTemplates:
        - metadata:
            name: www
          spec:
            accessModes:
              - ReadWriteOnce
            storageClassName: csi-cephfs-sc
            resources:
              requests:
                storage: 1Gi
`,
  )
  .setIn(
    [referenceForModel(k8sModels.StatefulSetModel), 'statefulset-sample2'],
    `
    apiVersion: apps/v1
    kind: StatefulSet
    metadata:
      name: example-statefulset
      namespace: default
    spec:
      serviceName: example-statefulset
      podManagementPolicy: Parallel
      replicas: 3
      selector:
        matchLabels:
          app: example-statefulset
      template:
        metadata:
          labels:
            app: example-statefulset
        spec:
          terminationGracePeriodSeconds: 10
          containers:
            - name: example-statefulset
              image: 'httpd:latest'
              ports:
                - containerPort: 80
                  name: web
              volumeMounts:
                - name: www
                  mountPath: /usr/share/httpd/html
      volumeClaimTemplates:
        - metadata:
            name: www
          spec:
            accessModes:
              - ReadWriteOnce
            storageClassName: csi-cephfs-sc
            resources:
              requests:
                storage: 1Gi
`,
  )
  .setIn(
    [referenceForModel(k8sModels.StatefulSetModel), 'statefulset-sample3'],
    `
    apiVersion: apps/v1
    kind: StatefulSet
    metadata:
      name: example-statefulset
      namespace: default
    spec:
      serviceName: example-statefulset
      replicas: 3
      revisionHistoryLimit: 15
      selector:
        matchLabels:
          app: example-statefulset
      template:
        metadata:
          labels:
            app: example-statefulset
        spec:
          terminationGracePeriodSeconds: 10
          containers:
            - name: example-statefulset
              image: 'httpd:latest'
              ports:
                - containerPort: 80
                  name: web
              volumeMounts:
                - name: www
                  mountPath: /usr/share/httpd/html
      volumeClaimTemplates:
        - metadata:
            name: www
          spec:
            accessModes:
              - ReadWriteOnce
            storageClassName: csi-cephfs-sc
            resources:
              requests:
                storage: 1Gi
`,
  )
  .setIn(
    [referenceForModel(k8sModels.StatefulSetModel), 'statefulset-sample4'],
    `
    apiVersion: apps/v1
    kind: StatefulSet
    metadata:
      name: example-statefulset
      namespace: default
    spec:
      serviceName: example-statefulset
      replicas: 3
      updateStrategy:
        type: RollingUpdate
      selector:
        matchLabels:
          app: example-statefulset
      template:
        metadata:
          labels:
            app: example-statefulset
        spec:
          terminationGracePeriodSeconds: 10
          containers:
            - name: example-statefulset
              image: 'httpd:latest'
              ports:
                - containerPort: 80
                  name: web
              volumeMounts:
                - name: www
                  mountPath: /usr/share/httpd/html
      volumeClaimTemplates:
        - metadata:
            name: www
          spec:
            accessModes:
              - ReadWriteOnce
            storageClassName: csi-cephfs-sc
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
    [referenceForModel(k8sModels.ServiceAccountModel), 'serviceaccount-sample'],
    `
    kind: ServiceAccount
    apiVersion: v1
    metadata:
      name: example-serviceaccount
      namespace: default
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
    [referenceForModel(k8sModels.SecretModel), 'secret-sample'],
    `
apiVersion: v1
kind: Secret
metadata:
  name: example
  namespace: default
type: kubernetes.io/basic-auth
stringData:
  username: YWRtaW4=
  password: YWRtaW4=
`,
  )
  .setIn(
    [referenceForModel(k8sModels.SecretModel), 'secret-sample2'],
    `
apiVersion: v1
kind: Secret
metadata:
  name: example
  namespace: default
type: Opaque
stringData:
  language: java
  version: "5"
`,
  )
  .setIn(
    [referenceForModel(k8sModels.ReplicaSetModel), 'default'],
    `
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: example
  namespace: default
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
    [referenceForModel(k8sModels.ReplicaSetModel), 'replicaset-sample'],
    `
    apiVersion: apps/v1
    kind: ReplicaSet
    metadata:
      name: example
      namespace: default
    spec:
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
    [referenceForModel(k8sModels.ReplicaSetModel), 'replicaset-sample2'],
    `
    apiVersion: apps/v1
    kind: ReplicaSet
    metadata:
      name: example
      namespace: default
    spec:
      replicas: 3
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
    [referenceForModel(k8sModels.ReplicaSetModel), 'replicaset-sample3'],
    `
    apiVersion: apps/v1
    kind: ReplicaSet
    metadata:
      name: example
      namespace: default
    spec:
      replicas: 3
      minReadySeconds: 10
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
    [referenceForModel(k8sModels.ReplicaSetModel), 'replicaset-sample4'],
    `
    apiVersion: apps/v1
    kind: ReplicaSet
    metadata:
      name: example
      namespace: default
    spec:
      replicas: 2
      selector:
        matchExpressions:
          - {key: tier, operator: In, values: [example1]}
      template:
        metadata:
          labels:
            tier: example1
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
  )
  .setIn(
    [referenceForModel(k8sModels.ConditionModel), 'default'],
    `
    apiVersion: tekton.dev/v1alpha1
    kind: Condition
    metadata:
     name: sample-condition
     namespace: default
    spec:
     params:
       - name: "path"
     resources:
       - name: sample-resource
         type: git
         optional: true
     check:
       image: alpine
       script: 'test ! -f $(resources.sample-resource.path)/$(params.path)'    
`,
  )
  .setIn(
    [referenceForModel(k8sModels.VirtualServiceModel), 'default'],
    `
    apiVersion: networking.istio.io/v1alpha3
    kind: VirtualService
    metadata:
      name: example-virtualservice
    spec:
      hosts:
      - example.com
      http:
      - match:
        - uri:
            prefix: /reviews
        route:
        - destination:
            host: reviews
            subset: v2
      - route:
        - destination:
            host: reviews
            subset: v3
      
`,
  )
  .setIn(
    [referenceForModel(k8sModels.DestinationRuleModel), 'default'],
    `
    apiVersion: networking.istio.io/v1alpha3
    kind: DestinationRule
    metadata:
      name: my-destination-rule
    spec:
      host: my-svc
      trafficPolicy:
        loadBalancer:
          simple: RANDOM
      subsets:
      - name: v1
        labels:
          version: v1
      - name: v2
        labels:
          version: v2
        trafficPolicy:
          loadBalancer:
            simple: ROUND_ROBIN
      - name: v3
        labels:
          version: v3      
`,
  )
  .setIn(
    [referenceForModel(k8sModels.EnvoyFilterModel), 'default'],
    `
    apiVersion: networking.istio.io/v1alpha3
    kind: EnvoyFilter
    metadata:
      name: custom-protocol
    spec:
      workloadSelector:
        labels:
          app: hello
      configPatches:
      - applyTo: NETWORK_FILTER
        match:
          context: SIDECAR_OUTBOUND
          listener:
            portNumber: 9307
            filterChain:
              filter:
                name: "envoy.tcp_proxy"
        patch:
          operation: INSERT_BEFORE
          value:
            name: "envoy.config.filter.network.custom_protocol"    
`,
  )
  .setIn(
    [referenceForModel(k8sModels.GatewayModel), 'default'],
    `
    apiVersion: networking.istio.io/v1alpha3
    kind: Gateway
    metadata:
      name: ext-host-gwy
    spec:
      selector:
        app: my-gateway-controller
      servers:
      - port:
          number: 443
          name: https
          protocol: HTTPS
        hosts:
        - ext-host.example.com
        tls:
          mode: SIMPLE
          serverCertificate: /tmp/tls.crt
          privateKey: /tmp/tls.key    
`,
  )
  .setIn(
    [referenceForModel(k8sModels.SidecarModel), 'default'],
    `
    apiVersion: networking.istio.io/v1alpha3
    kind: Sidecar 
    metadata: 
      name: my-sidecar 
    spec: 
      workloadSelector: 
        labels: 
          app: hello
      egress: 
      - hosts: 
        - "./*" 
        - "istio-system/*"   
`,
  )
  .setIn(
    [referenceForModel(k8sModels.ServiceEntryModel), 'default'],
    `
    apiVersion: networking.istio.io/v1alpha3 
    kind: ServiceEntry 
    metadata: 
      name: svc-entry 
    spec: 
      hosts: 
      - ext-svc.example.com 
      ports: 
      - number: 443 
        name: https 
        protocol: HTTPS 
      location: MESH_EXTERNAL 
      resolution: DNS  
`,
  )
  .setIn(
    [referenceForModel(k8sModels.RequestAuthenticationModel), 'default'],
    `
    apiVersion: security.istio.io/v1beta1
    kind: RequestAuthentication
    metadata:
      name: jwt-example
    spec:
      selector:
        matchLabels:
          app: hello
      jwtRules:
      - issuer: "testing@secure.istio.io"
        jwksUri: "https://raw.githubusercontent.com/istio/istio/release-1.6/security/tools/jwt/samples/jwks.json"   
`,
  )
  .setIn(
    [referenceForModel(k8sModels.PeerAuthenticationModel), 'default'],
    `
    apiVersion: security.istio.io/v1beta1
    kind: PeerAuthentication
    metadata:
      name: example-peer-policy
    spec:
      selector:
        matchLabels:
          app: hello
      mtls:
        mode: STRICT  
`,
  )
  .setIn(
    [referenceForModel(k8sModels.AuthorizationPolicyModel), 'default'],
    `
    apiVersion: security.istio.io/v1beta1
    kind: AuthorizationPolicy
    metadata:
      name: allow-read
    spec:
      selector:
        matchLabels:
          app: hello
      action: ALLOW
      rules:
      - to:
        - operation:
             methods: ["GET", "HEAD"]       
`,
  )
  .setIn(
    [referenceForModel(k8sModels.UserSecurityPolicyModel), 'default'],
    `
    apiVersion: tmax.io/v1
    kind: Usersecuritypolicy
    metadata:
      name: example-tmax.co.kr
    otpEnable: f
    otp: 123456
    ipRange: 
      - 192.168.0.0/16

`,
  )
  .setIn(
    [referenceForModel(k8sModels.ClusterMenuPolicyModel), 'default'],
    `
    apiVersion: ui.tmax.io/v1
    kind: ClusterMenuPolicy
    metadata:
      name: admin-tmax.co.kr
    menus: 
      - name: home
        menu:
        - name: status
          type: hreflink
          href: /status
          activePath: /status
        - name: search
          type: hreflink
          href: /search
        - name: audit
          type: resourcenslink
        - name: event
          type: resourcenslink
        - name: grafana
          type: hreflink
          href: /grafana
      - name: servicecatalog
        menu:
        - name: ServiceBroker
          type: resourcenslink
        - name: ServiceClass
          type: resourcenslink
        - name: ServicePlan
          type: resourcenslink
        - name: ClusterServiceBroker
          type: resourceclusterlink
        - name: ClusterServiceClass
          type: resourceclusterlink
        - name: ClusterServicePlan
          type: resourceclusterlink
        - name: ServiceInstance
          type: resourcenslink
        - name: ServiceBinding
          type: resourcenslink
        - name: CatalogServiceClaim
          type: resourcenslink
        - name: Template
          type: resourcenslink
        - name: TemplateInstance
          type: resourcenslink
      - name: workload
        menu:
        - name: Pod
          type: resourcenslink
        - name: Deployment
          type: resourcenslink
        - name: ReplicaSet
          type: resourcenslink
        - name: horizontalpodautoscaler
          type: resourcenslink
        - name: DaemonSet
          type: resourcenslink
        - name: StatefulSet
          type: resourcenslink
        - name: VirtualMachine
          type: resourcenslink
        - name: VirtualMachineInstance
          type: resourcenslink
        - name: ConfigMap
          type: resourcenslink
        - name: Secret
          type: resourcenslink
        - name: Job
          type: resourcenslink
        - name: CronJob
          type: resourcenslink
      - name: servicemesh
        menu:
        - name: VirtualService
          type: resourcenslink
        - name: DestinationRule
          type: resourcenslink
        - name: EnvoyFilter
          type: resourcenslink
        - name: Gateway
          type: resourcenslink
        - name: Sidecar
          type: resourcenslink
        - name: ServiceEntry
          type: resourcenslink
        - name: RequestAuthentication
          type: resourcenslink
        - name: PeerAuthentication
          type: resourcenslink
        - name: AuthorizationPolicy
          type: resourcenslink
        - name: kiali
          type: hreflink
          href: /kiali
      - name: network
        menu:
        - name: Ingress
          type: resourcenslink
        - name: Service
          type: resourcenslink
      - name: storage
        menu:
        - name: StorageClass
          type: resourceclusterlink
        - name: DataVolume
          type: resourcenslink
        - name: PersistentVolumeClaim
          type: resourcenslink
        - name: PersistentVolume
          type: resourceclusterlink
      - name: cicd
        menu:
        - name: Task
          type: resourcenslink
        - name: TaskRun
          type: resourcenslink
        - name: Pipeline
          type: resourcenslink
        - name: PipelineRun
          type: resourcenslink
        - name: PipelineApproval
          type: resourcenslink
        - name: PipelineResource
          type: resourcenslink
        - name: Condition
          type: resourcenslink
      - name: aiops
        menu:
        - name: Notebook
          type: resourcenslink
        - name: Experiment
          type: resourcenslink
        - name: InferenceService
          type: resourcenslink
        - name: TrainingJob
          type: resourcenslink
        - name: WorkflowTemplate
          type: resourcenslink
        - name: Workflow
          type: resourcenslink
      - name: security
        menu:
        - name: PodSecurityPolicy
          type: resourceclusterlink
        - name: NetworkPolicy
          type: resourcenslink
      - name: image
        menu:
        - name: Registry
          type: resourcenslink
      - name: management
        menu:
        - name: Namespace
          type: resourceclusterlink
        - name: NamespaceClaim
          type: resourceclusterlink
        - name: LimitRange
          type: resourcenslink
        - name: ResourceQuota
          type: resourcenslink
        - name: ResourceQuotaClaim
          type: resourcenslink
        - name: CustomResourceDefinition
          type: resourceclusterlink
      - name: host
        menu:
        - name: Node
          type: resourceclusterlink
      - name: auth
        menu:
        - name: Role
          type: resourcenslink
        - name: RoleBinding
          type: resourcenslink
        - name: RoleBindingClaim
          type: resourcenslink
        - name: Usersecuritypolicy
          type: resourceclusterlink
        - name: ServiceAccount
          type: resourcenslink
`,
  )
  .setIn(
    [referenceForModel(k8sModels.CatalogServiceClaimModel), 'default'],
    `
apiVersion: tmax.io/v1
kind: CatalogServiceClaim
metadata:
  name: nginx-catalog-service-claim
  namespace: default
  labels: 
    handled: f
spec:
  apiVersion: tmax.io/v1
  kind: Template
  metadata:
    name: example-template
    namespace: default
  imageUrl: example.com/example.gif
  provider: tmax
  recommend: true
  objects:
  - apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: \${NAME}
      labels:
        app: \${NAME}
    spec:
      selector:
        matchLabels:
          app: \${NAME}
      template:
        metadata:
          labels:
            app: \${NAME}
        spec:
          containers:
          - name: \${NAME}
            image: example/image:version
            ports:
            - name: example
              containerPort: 80
  plans:
  - name: example-plan
    metadata:
      bullets:
      - feat 1
      - feat 2
      costs:
        amount: 100
        unit: $
      bindable: true
      schemas:
        service_instance:
          create:
            parameters:
              EXAMPLE_PARAM: value
  parameters:
  - name: NAME
    description: Application name
    valueType: string
    value: example

`,
  )
  .setIn(
    [referenceForModel(k8sModels.NotebookModel), 'default'],
    `
    apiVersion: kubeflow.org/v1
    kind: Notebook
    metadata:
      labels:
        app: my-notebook
      name: my-notebook
      namespace: my-namespace
    spec:
      template:
        spec:
          containers:
          - env: []
            image: gcr.io/kubeflow-images-public/tensorflow-2.1.0-notebook-cpu:1.0.0
            name: my-notebook
            resources:
              requests:
                cpu: "1"
                memory: "2"
            volumeMounts:
            - mountPath: /home/jovyan
              name: workspace-my-notebook
            - mountPath: /dev/shm
              name: dshm
          serviceAccountName: default-editor
          ttlSecondsAfterFinished: 300
          volumes:
          - name: workspace-my-notebook
            persistentVolumeClaim:
              claimName: workspace-my-notebook
          - emptyDir:
              medium: Memory
            name: dshm
    
`,
  )
  .setIn(
    [referenceForModel(k8sModels.ExperimentModel), 'default'],
    `
    apiVersion: "kubeflow.org/v1alpha3"
    kind: Experiment
    metadata:
      namespace: defualt
      name: defualt
    spec:
      parallelTrialCount: 1
      maxTrialCount: 12
      maxFailedTrialCount: 3
      objective:
        type: maximize
        goal: 0.99
        objectiveMetricName: Validation-accuracy
        additionalMetricNames:
          - accuracy
      algorithm:
        algorithmName: random
      parameters:
        - name: --learning_rate
          parameterType: double
          feasibleSpace:
            min: "0.01"
            max: "0.2"
        - name: --dropout
          parameterType: double
          feasibleSpace:
            min: "0.1"
            max: "0.5"
      trialTemplate:
        goTemplate:
            rawTemplate: |-
              apiVersion: batch/v1
              kind: Job
              metadata:
                name: {{.Trial}}
                namespace: {{.NameSpace}}
              spec:
                template:
                  spec:
                    containers:
                    - name: {{.Trial}}
                      image: katib-mnist-job:0.0.1
                      command:
                      - "python3"
                      - "/app/katib-mnist-random-job.py"
                      {{- with .HyperParameters}}
                      {{- range .}}
                      - "{{.Name}}={{.Value}}"
                      {{- end}}
                      {{- end}}
                    restartPolicy: Never
    
    
    
`,
  )
  .setIn(
    [referenceForModel(k8sModels.TrainingJobModel), 'default'],
    `
    apiVersion: kubeflow.org/v1
    kind: TFJob
    metadata:
      name: tf-smoke-gpu
      namespace: default
    spec:
      tfReplicaSpecs:
        PS:
          replicas: 1
          template:
            metadata:
              creationTimestamp: null
            spec:
              containers:
              - args:
                - python
                - tf_cnn_benchmarks.py
                - --batch_size=32
                - --model=resnet50
                - --variable_update=parameter_server
                - --flush_stdout=true
                - --num_gpus=1
                - --local_parameter_device=cpu
                - --device=cpu
                - --data_format=NHWC
                image: gcr.io/kubeflow/tf-benchmarks-cpu
                name: tensorflow
                ports:
                - containerPort: 2222
                  name: tfjob-port
                resources:
                  limits:
                    cpu: '1'
                workingDir: /opt/tf-benchmarks/scripts/tf_cnn_benchmarks
              restartPolicy: OnFailure
        Worker:
          replicas: 1
          template:
            metadata:
              creationTimestamp: null
            spec:
              containers:
              - args:
                - python
                - tf_cnn_benchmarks.py
                - --batch_size=32
                - --model=resnet50
                - --variable_update=parameter_server
                - --flush_stdout=true
                - --num_gpus=1
                - --local_parameter_device=cpu
                - --device=gpu
                - --data_format=NHWC
                image: gcr.io/kubeflow/tf-benchmarks-gpu
                name: tensorflow
                ports:
                - containerPort: 2222
                  name: tfjob-port
                resources:
                  limits:
                    nvidia.com/gpu: 1
                workingDir: /opt/tf-benchmarks/scripts/tf_cnn_benchmarks
              restartPolicy: OnFailure
`,
  )
  .setIn(
    [referenceForModel(k8sModels.TFJobModel), 'default'],
    `
    apiVersion: kubeflow.org/v1
    kind: TFJob
    metadata:
      name: tf-smoke-gpu
      namespace: default
    spec:
      tfReplicaSpecs:
        PS:
          replicas: 1
          template:
            metadata:
              creationTimestamp: null
            spec:
              containers:
              - args:
                - python
                - tf_cnn_benchmarks.py
                - --batch_size=32
                - --model=resnet50
                - --variable_update=parameter_server
                - --flush_stdout=true
                - --num_gpus=1
                - --local_parameter_device=cpu
                - --device=cpu
                - --data_format=NHWC
                image: gcr.io/kubeflow/tf-benchmarks-cpu
                name: tensorflow
                ports:
                - containerPort: 2222
                  name: tfjob-port
                resources:
                  limits:
                    cpu: '1'
                workingDir: /opt/tf-benchmarks/scripts/tf_cnn_benchmarks
              restartPolicy: OnFailure
        Worker:
          replicas: 1
          template:
            metadata:
              creationTimestamp: null
            spec:
              containers:
              - args:
                - python
                - tf_cnn_benchmarks.py
                - --batch_size=32
                - --model=resnet50
                - --variable_update=parameter_server
                - --flush_stdout=true
                - --num_gpus=1
                - --local_parameter_device=cpu
                - --device=gpu
                - --data_format=NHWC
                image: gcr.io/kubeflow/tf-benchmarks-gpu
                name: tensorflow
                ports:
                - containerPort: 2222
                  name: tfjob-port
                resources:
                  limits:
                    nvidia.com/gpu: 1
                workingDir: /opt/tf-benchmarks/scripts/tf_cnn_benchmarks
              restartPolicy: OnFailure
`,
  )
  .setIn(
    [referenceForModel(k8sModels.PyTorchJobModel), 'default'],
    `
    apiVersion: kubeflow.org/v1
    kind: PyTorchJob
    metadata:
      name: pytorch-tcp-dist-mnist
      namespace: default
    spec:
      pytorchReplicaSpecs:
        Master:
          replicas: 1
          restartPolicy: OnFailure
          template:
            spec:
              containers:
                - name: pytorch
                  image: gcr.io/kubeflow-ci/pytorch-dist-mnist_test:1.0
                  ports:
                  - name: pytorchjob-port
                    containerPort: 23456
                  resources:
                    limits:
                      nvidia.com/gpu: 1
        Worker:
          replicas: 1
          restartPolicy: OnFailure
          template:
            spec:
              containers:
                - name: pytorch
                  image: gcr.io/kubeflow-ci/pytorch-dist-mnist_test:1.0
                  ports:
                  - name: pytorchjob-port
                    containerPort: 23456
                  resources:
                    limits:
                      nvidia.com/gpu: 1
`,
  )
  .setIn(
    [referenceForModel(k8sModels.InferenceServiceModel), 'default'],
    `
    apiVersion: serving.kubeflow.org/v1alpha2
    kind: InferenceService
    metadata:
      name: tensorrt-simple-string
    spec:
      default:
        predictor:
          tensorrt:
            storageUri: gs://kfserving-samples/models/tensorrt
            resources:
              limits:
                cpu: 100m
                memory: 1Gi
              requests:
                cpu: 100m
                memory: 1Gi
      canaryTrafficPercent: 10
      canary:
        predictor:
          tensorflow:
            storageUri: pvc://kfserving-models-pvc/models/tensorflow/mnist/    
    
`,
  )
  .setIn(
    [referenceForModel(k8sModels.WorkflowTemplateModel), 'default'],
    `
    apiVersion: argoproj.io/v1alpha1
    kind: WorkflowTemplate
    metadata:
      name: workflow-template-whalesay-template
    spec:
      entrypoint: whalesay-template
      templates:
      - name: whalesay-template
        inputs:
          parameters:
          - name: message
        container:
          image: docker/whalesay
          command: [cowsay]
          args: ["{{inputs.parameters.message}}"]
`,
  )
  .setIn(
    [referenceForModel(k8sModels.WorkflowModel), 'default'],
    `
    apiVersion: argoproj.io/v1alpha1
    kind: Workflow
    metadata:
      generateName: workflow-template-hello-world-
    spec:
      entrypoint: whalesay
      templates:
      - name: whalesay
        steps:
          - name: call-whalesay-template
            templateRef:
              name: workflow-template-whalesay-template
              template: whalesay-template
            arguments:
              parameters:
              - name: message
                value: "hello world"
`,
  );
