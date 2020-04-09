#!/bin/bash

kubectl create secret tls console-https-secret --cert=tls/tls.crt --key=tls/tls.key -n console-system

