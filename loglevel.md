로그레벨 설정 예시 
```yaml
      containers:
        - command:
            - /opt/bridge/bin/console
            - server
            - --public-dir=/opt/bridge/static
            - --listen=http://0.0.0.0:31303
            - --base-address=http://0.0.0.0:31303
            - --keycloak-realm={{ .auth.realm }}
            - --keycloak-auth-url=https://{{ .auth.hyperauth }}/auth
            - --keycloak-client-id={{ .auth.clientid }}
            - --mc-mode={{ .mcMode }}
            - --logInfo.logLevel=debug # logLevel : trace | debug | info | warn | crit , 주로 debug 혹은 info
            - --logInfo.logType=pretty # logType : pretty | json , 주로 pretty 사용
```

