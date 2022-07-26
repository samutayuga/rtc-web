FROM artifactory.thalesdigital.io/docker-external/library/alpine:3.8 as build-env
#FROM node:18 AS build-env
RUN apk add --no-cache nodejs-npm
RUN mkdir -p /app
WORKDIR /app
COPY ./public public
COPY ./package.json package.json
COPY ./server.js server.js
COPY ./package-lock.json package-lock.json
COPY ./.env .env

RUN npm install
#RUN npm ci --omit=dev

FROM gcr.io/distroless/nodejs:18
COPY --from=build-env /app /app
EXPOSE 8090
ENV NEXT_PUBLIC_SIGNALING_WS_PORT=9090
ENV NEXT_PUBLIC_SIGNALING_HOST=127.0.0.1
ENV NEXT_PUBLIC_HTTP_PORT=8090
WORKDIR /app
CMD ["server.js"]


