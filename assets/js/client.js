const connection = new WebSocket('ws://localhost:9090');
const url_string = window.location.href;
const url = new URL(url_string);
var name;
var connectedUser;
const username = url.searchParams.get("username");
connection.onopen = function () {
    console.log("Connected to the server");
}
connection.onmessage = function (msg) {
    alert('msg='+msg.data);

    var data = JSON.parse(msg.data);

    switch (data.type) {

        case "login":
            loginProcess(data.success);
            break;
        case "offer":
            callStatus.innerHTML='<div class="calling-status-wrap card black white-text"> <img src="assets/images/me.jpg" class="caller-image circle" alt=""> </div> <div class="user-name">'+data.name+'</div> <div class="user-calling-status">Calling ....</div> <div class="calling-action"> <div class="call-accept"> <i class="material-icons green darken-2 white-text audio-icon"> call </i> </div> <div class="call-reject"> <i class="material-icons red darken-3 white-text close-icon"> close </i> </div> </div>';
            var call_received=document.querySelector('.call-accept');
            var call_rejected=document.querySelector('.call-reject');
            call_received.addEventListener("click",function (){
                offerProcess(data.offer, data.name);
                callStatus.innerHTML='';
            })
            call_rejected.addEventListener("click",function (){
                alert('Call is rejected')
            })


            break;
        case "answer":
            answerProcess(data.answer);
            break;
        case "candidate":
            console.log('msg '+data)
            candidateProcess(data.candidate);
            break;
    }
}
connection.onerror = function (error) {
    console.log(error);
}
setTimeout(function () {
    if (connection.readyState === 1) {
        if (username != null) {
            name = username;
            if (name.length > 0) {
                send({
                    type: "login",
                    name: name
                })
            }
        }
    } else {
        console.log("Connection has not established");
    }

}, 3000)

function send(message) {
    if (connectedUser) {
        message.name = connectedUser;
    }
    connection.send(JSON.stringify(message))
}

var myConn;
const local_video = document.querySelector("#local-video");
const call_btn = document.querySelector("#call-btn");
const callTo = document.querySelector("#username-input");
const callStatus = document.querySelector(".call-hang-status");
call_btn.addEventListener("click", function () {
    var callToUserName = callTo.value;
    callStatus.innerHTML='<div class="calling-status-wrap card black white-text"> <img src="assets/images/me.jpg" class="caller-image circle" alt=""> </div> <div class="user-name">'+callToUserName+'</div> <div class="user-calling-status">Calling ....</div> <div class="calling-action"> <div class="call-reject"> <i class="material-icons red darken-3 white-text close-icon"> close </i> </div> </div>';
    var call_rejected=document.querySelector('.call-reject');
    call_rejected.addEventListener("click",function (){
        alert('Call is rejected')
    })
    if (callToUserName.length > 0) {
        connectedUser = callToUserName;

        myConn.createOffer(function (offer) {
            send({
                type: "offer",
                offer: offer
            })
            myConn.setLocalDescription(offer)
        }, function (error) {
            alert("Offer has not created");
        })
    }
})
const constraints = window.constraints = {
    audio: true,
    video: true
};

function loginProcess(success) {
    if (success === false) {
        alert("Try different username");
    } else {
        navigator.mediaDevices.getUserMedia(constraints)
            .then(
                function (myStream) {
                    const vTrack = myStream.getVideoTracks();
                    console.log('Got stream with constraints: ', constraints);
                    console.log('Using video device: ' + vTrack[0].label);
                    myStream.onremovetrack = function () {
                        console.log('stream ended');
                    };
                    window.stream = myStream;
                    local_video.srcObject = stream;
                    var configuration = {
                        "iceServers": [{
                            "url": "stun:stun2.1.google.com:19302"
                        }]
                    }
                    myConn = new webkitRTCPeerConnection(configuration, {
                        optional: [{
                            RtpDataChannels: true
                        }]
                    });
                    myConn.addStream(myStream);
                    myConn.onicecandidate = function (event) {
                        if (event.candidate) {
                            send({
                                type: "candidate",
                                candidate: event.candidate
                            })
                        }
                    }
                }
            ).catch(
            function (error) {
                if (error.name === 'ConstraintNotSatisfiedError') {

                }
                console.log(error);
            });


    }
}

function offerProcess(offer, name) {
    connectedUser = name;
    myConn.setRemoteDescription(new RTCSessionDescription(offer));
    //create answer to an offer ot user A.
    //alert(name);

    myConn.createAnswer(function (answer) {
        myConn.setLocalDescription(answer);
        send({
            type: "answer",
            answer: answer
        })
    }, function (error) {
        console.log(error.message)
        alert("Answer has not created");
    })

}

function answerProcess(answer) {
    myConn.setRemoteDescription(new RTCSessionDescription(answer));
}

function candidateProcess(candidate) {
    myConn.addIceCandidate(new RTCIceCandidate(candidate));

}



