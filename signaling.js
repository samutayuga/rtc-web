const child_process = require("child_process");
const WebSocketServer = require('ws').Server;
const ffmpeg = child_process.spawn("ffmpeg", [
    "-f",
    "lavfi",
    "-i",
    "anullsrc",
    "-i",
    "-",
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-tune",
    "zerolatency",
    "-c:a",
    "aac",
    "-f",
    "flv",
    "rtmp://127.0.0.1:1935/live/tes1"
])

var wsServer = new WebSocketServer({
    //server:httpServer
    port: 9090
});

wsServer.on('connection', function (conn) {
    conn.on('message', function (message) {
        ffmpeg.stdin.write(message)
    });

})

