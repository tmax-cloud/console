include .env
SHELL=/bin/bash
export

BUILD_ID ?= console
REGISTRY ?= docker.io
CONSOLE_VERSION ?= 5.0.40.0
CONSOLE_IMG ?= $(REGISTRY)/tmax-cloud/hypercloud-console:$(CONSOLE_VERSION)
DOCKER_ID ?= test
DOCKER_PW ?= test

.PHONY: build
build:
	@make build-backend
	@make build-frontend

.PHONY: build-backend
build-backend:
	@./scripts/build-backend.sh
#
.PHONY: build-frontend
build-frontend:
	@. ${NVM_DIR}/nvm.sh && nvm install v14.16.0 --default && nvm use v14.16.0 && ./scripts/build-frontend.sh

.PHONY: run-console
run-console:
	@./scripts/run-console.sh

run-traefik-mac:
	@./traefik-darwin --configfile ./configs/traefik-static.yaml
run-traefik-linux:
	@./traefik-linux --configfile ./configs/traefik-static.yaml


docker-build:
	@docker build --rm=true --build-arg=BUILD_ID=$(BUILD_ID) -t $(REGISTRY)/$(DOCKER_IMAGE) -f ./Dockerfile .
	@yes | docker image prune --filter label=stage=builder --filter label=build=$(BUILD_ID)

docker-push:
	@docker login -u $(DOCKER_ID) -p $(DOCKER_PW)
	@docker push $(REGISTRY)/$(DOCKER_IMAGE)



