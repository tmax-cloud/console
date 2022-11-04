# SERVER Patch Note

### hypercloud-console 5.2.11.0 버전부터 console의 arg 값 변경 

변경내용: 
- command의 server 삭제 
- logInfo.logLevel -> log-level 로 변경 
- logInfo.logType -> log-type 으로 변경 
- app.chatbotEmbed -> chatbot-embed 로 변경 
- custom-product-name, svc-type 추가 
- k8s-public-endpoint 추가 (5.2.11.0 버전에만 적용 필요, 추후에 default 값으로 설정됨으로 별도로 기입 불필요)

기존 
```yaml
containers:
- name: console
  command:
    - /opt/bridge/bin/console
    - server
    - --public-dir=/opt/bridge/static
    - --listen=http://0.0.0.0:31303
    - --base-address=http://0.0.0.0:31303
    - --keycloak-realm={{ .hyperAuth.realm }}
    - --keycloak-auth-url=https://{{ .hyperAuth.address }}/auth
    - --keycloak-client-id={{ .hyperAuth.clientID }}
    - --mc-mode={{ .mcMode | default true }}
    - --app.chatbotEmbed={{ .chatbotEmbed | default true }}
    - --logInfo.logLevel={{ .logLevel | default "debug" }}
    - --logInfo.logType={{ .logType | default "pretty" }}
```

변경
```yaml
containers:
- name: console
  command:
    - /opt/bridge/bin/console
    - --public-dir=/opt/bridge/static
    - --listen=http://0.0.0.0:31303
    - --base-address=http://0.0.0.0:31303
    - --keycloak-realm={{ .hyperAuth.realm }}
    - --keycloak-auth-url=https://{{ .hyperAuth.address }}/auth
    - --keycloak-client-id={{ .hyperAuth.clientID }}
    - --mc-mode={{ .mcMode | default true }}
    - --chatbot-embed={{ .chatbotEmbed | default true }}
    - --custom-product-name={{ .customProductName | default "hypercloud" }}
    - --svc-type={{ .svcType | default "LoadBalancer" }}
    - --log-level={{ .logLevel | default "debug" }}
    - --log-type={{ .logType | default "pretty" }}
    - --k8s-public-endpoint=https://kubernetes.default.svc
```
