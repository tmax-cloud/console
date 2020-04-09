How to issue a tls certificate

step.1 create private key 
$ openssl genrsa -out tls.key 2048

step.2 create CSR(Certificate Signing Request)
$ openssl req -new -key tls.key -out tls.csr 

step.3 create Certification using key, csr 
$ openssl x509 -req -days 3650 -in tls.csr -signkey tls.key -out tls.crt 

step.4 create secret for console to subscribe on Kubernetes environment
$ kubectl create secret tls console-https-secret --cert=tls/tls.crt --key=tls/tls.key -n console-system