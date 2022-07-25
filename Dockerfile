FROM artifactory.thalesdigital.io/docker-external/library/alpine:3.8 as base
RUN apk add --no-cache nodejs-npm
RUN mkdir -p /app
EXPOSE 8090
ENV SIGNALING_WS_PORT=9090
ENV SIGNALING_HOST=127.0.0.1
ENV HTTP_PORT=8090
WORKDIR /app
COPY ./assets assets
COPY ./canvas.html canvas.html
COPY ./canvasanim.html canvasanim.html
COPY ./index.html index.html
RUN npm install
RUN npm install -g node-static
ENTRYPOINT static --port=$HTTP_PORT


