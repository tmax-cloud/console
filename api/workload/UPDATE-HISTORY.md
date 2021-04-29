## UPDATE HISTORY for json-schema generated files

- [Pod] deprecated된 serviceAccount 필드 제거 - IMS #256034
- [HPA] 기존 v2beta1에서 v2beta2로 변경
- [Pod] "io.k8s.api.core.v1.Container" definition에서 image 필드를 required에 추가
- [Pod] "io.k8s.api.core.v1.ResourceRequirements" 에 cpu, memory를 properties로 추가 (테스트 필요)
- [Definitions] ObjectMeta field의 read only 항목 제거 - IMS #256034-action 1586164 - commit 7e8217c
- [Definitions] delete cluster field of ObjectMeta field - IMS #256034-action 1589321 - commit 2aff73e
- [Definitions] update descriptions outdated url links - IMS #259686 - commit ea843d3d
    <details>
    <summary>변경사항 Detail</summary>
    
    - update PodSpec.readinessGates description url
        - from : https://git.k8s.io/enhancements/keps/sig-network/0007-pod-ready%2B%2B.md
        - to : https://github.com/kubernetes/enhancements/blob/master/keps/sig-network/580-pod-readiness-gates/README.md

    - update PodSpec.runtimeClassName description url
        - from : https://git.k8s.io/enhancements/keps/sig-node/runtime-class.md
        - to : https://github.com/kubernetes/enhancements/blob/master/keps/sig-node/585-runtime-class/README.md

    - update "io.k8s.api.node.v1beta1.RuntimeClass", "io.k8s.api.node.v1alpha1.RuntimeClass" description url
        - from : https://git.k8s.io/enhancements/keps/sig-node/runtime-class.md 
        - to : https://github.com/kubernetes/enhancements/blob/master/keps/sig-node/585-runtime-class/README.md

    - update PodSpec.overhead description url
        - from : https://git.k8s.io/enhancements/keps/sig-node/20190226-pod-overhead.md
        - to : https://github.com/kubernetes/enhancements/blob/master/keps/sig-node/688-pod-overhead/README.md

    - update io.k8s.api.node.v1alpha1.RuntimeClassSpec.overhead, io.k8s.api.node.v1beta1.RuntimeClass.overhead description url
        - from : https://git.k8s.io/enhancements/keps/sig-node/20190226-pod-overhead.md 
        - to : https://github.com/kubernetes/enhancements/blob/master/keps/sig-node/688-pod-overhead/README.md
    </details>
- [Definitions] PSP required 필드 추가 및 rule enum 추가  - IMS #255646
    <details>
    <summary>변경사항 Detail</summary>

    - "io.k8s.api.policy.v1beta1.PodSecurityPolicySpec".seLinux : "#/definitions/io.k8s.api.policy.v1beta1.SELinuxStrategyOptions" 
        - add rule enums
    
    - "io.k8s.api.policy.v1beta1.PodSecurityPolicySpec".fsGroup : "#/definitions/io.k8s.api.policy.v1beta1.FSGroupStrategyOptions"
        - add required - 'rule' field

    - "io.k8s.api.policy.v1beta1.PodSecurityPolicySpec".supplementalGroups : "#/definitions/io.k8s.api.policy.v1beta1.SupplementalGroupsStrategyOptions"
        - add required - 'rule' field
        - add rule enums

    - "io.k8s.api.policy.v1beta1.PodSecurityPolicySpec".runAsGroup : "#/definitions/io.k8s.api.policy.v1beta1.RunAsGroupStrategyOptions"
        - add rule enums

    - "io.k8s.api.policy.v1beta1.PodSecurityPolicySpec".runAsUser : "#/definitions/io.k8s.api.policy.v1beta1.RunAsUserStrategyOptions"
        - add rule enums

    - "io.k8s.api.policy.v1beta1.PodSecurityPolicySpec".fsGroup : "#/definitions/io.k8s.api.policy.v1beta1.FSGroupStrategyOptions"
        - add rule enums
    </details>