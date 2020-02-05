FROM openshift/origin-base
RUN mkdir -p /opt/bridge/bin
COPY ./bin/bridge /opt/bridge/bin
COPY ./frontend/public/dist /opt/bridge/static

WORKDIR /

CMD [ "/opt/bridge/bin/bridge", "--public-dir=/opt/bridge/static" ]