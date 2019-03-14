FROM node:8.14.0-alpine
WORKDIR /opt/dojot-snoop
RUN apk add git python make bash gcc g++ zlib-dev tini --no-cache
COPY . .
RUN rm -fr ./node_modules/node-rdkafka
RUN npm install
RUN npm run-script build
ENTRYPOINT ["/sbin/tini", "--"]
CMD [ "npm", "start" ]

