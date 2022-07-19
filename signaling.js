const WebSocketServer = require('ws').Server;
var wsServer = new WebSocketServer({
    //server:httpServer
    port: 9090
});
var users = {};
wsServer.on('connection', function (conn) {
    conn.on('message', function (message) {
        var data;
        try {
            data = JSON.parse(message);
        } catch (e) {
            console.log("Invalid JSON");
            data = {};
        }
        switch (data.type) {
            case "data":
                if (users[data.name]) {
                    sendToOtherUser(conn, {
                        type: "login",
                        success: false
                    })
                } else {
                    users[data.name] = conn;
                    conn.name = data.name;
                    sendToOtherUser(conn, {
                        type: "login",
                        success: true
                    })
                }
                break;
            case "offer":
                var connect = users[data.name];
                if (connect != null) {
                    conn.otherUser = data.name;
                    sendToOtherUser(conn, {
                        type: "offer",
                        offer: data.offer,
                        name: conn.name
                    })
                }
                break;
            case "answer":
                var connect = users[data.name];
                if (connect != null) {
                    conn.otherUser = data.name;
                    sendToOtherUser(connect, {
                        type: "answer",
                        answer: data.answer
                    })
                }
                break;
            case "candidate":
                var connect = users[data.name];
                if (connect != null) {
                    sendToOtherUser(conn, {
                        type: "candidate",
                        candidate: data.candidate
                    })
                }
                break;

        }
    })
    conn.on('close', function () {
        console.log('Connection closed');
    })
    conn.send("Hello World");
})

function sendToOtherUser(connection, message) {
    connection.send(JSON.stringify(message));
}

