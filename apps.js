const WebSocketServer = require('ws').Server;
const path=require('path')
const express = require('express');
//const app=new express();
//var bodyParser=require('body-parser');
//app.use(bodyParser.urlencoded({extended: false}));

//app.use(express.static(path.join(__dirname,'')));


//const httpServer=app.listen(9090);
wsServer = new WebSocketServer({
    //server:httpServer
    port: 9090
});
var users={};
var otherUser;
wsServer.on('connection',function (conn){
    console.log("User connected");
    conn.on('message',function (message){
        var data;
        try {
            data = JSON.parse(message);
        }catch (e){
            console.log("Invalid JSON");
            data={};
        }
        switch (data.type){
            case "login":
                if(users[data.name]){
                    sendToOtherUser(conn,{
                        type: "login",
                        success: false
                    })
                }else{
                    users[data.name]=conn;
                    conn.name=data.name
                    sendToOtherUser(conn,{
                        type:"login",
                        success: true
                    })
                }
                break;
            case "offer":
                var connect=users[data.name];
                if(connect!=null){
                    conn.otherUSer=data.name;
                    sendToOtherUser(conn,{
                        type: "offer",
                        offer: data.offer,
                        name: conn.name
                    })
                }
                break;
            case "answer":
                var connect=users[data.name];
                if(connect!=null){
                    conn.otherUSer=data.name;
                    sendToOtherUser(connect,{
                        type: "answer",
                        answer: data.answer
                    })
                }
                break;
            case "candidate":
                var connect=users[data.name];
                if(connect!=null){
                    sendToOtherUser(conn,{
                        type:"candidate",
                        candidate: data.candidate
                    })
                }
                break;

        }
    })
    conn.on('close',function (){
        console.log('Connection closed');
    })
    conn.send("Hello World");
})

function sendToOtherUser(connection,message){
    connection.send(JSON.stringify(message));
}

