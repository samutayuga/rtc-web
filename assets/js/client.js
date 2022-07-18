const connection = new WebSocket('ws://localhost:9090');

//video manipulation

var aVideo=document.querySelector('video');
if(!navigator.getDisplayMedia && !navigator.mediaDevices.getDisplayMedia()){
    var error='Your browser does NOT support the getDisplayMedia API.';
    document.querySelector('h1').innerHTML=error;

    document.querySelector('video').style.display='none';
    document.getElementById('btn-start-recording').style.display='none';
    document.getElementById('btn-stop-recording').style.display='none';
    throw new Error(error);

}

function invokeGetDisplayMedia(success,error){
    var displaymediastreamconstraints={
        video: {
            displaySurface: 'monitor', //monitor, window, application, browser
            logicalSurface: true,
            cursor: 'always' //never,always,motion
        }
    };

    displaymediastreamconstraints={
        video: true
    }
    if(navigator.mediaDevices.getDisplayMedia){
        navigator.mediaDevices.getDisplayMedia(displaymediastreamconstraints).then(success).catch(error);
    }else {
        navigator.getDisplayMedia(displaymediastreamconstraints).then(success).catch(error);
    }
}

function captureScreen(callback){
    invokeGetDisplayMedia(function (screen){
        addStreamStopListener(screen,function (){
           document.getElementById('btn-stop-recording').click();
        });
        callback(screen);
    },function (error){
        console.error(error);
        alert('Unable to capture your screen. Please check console logs. \n'+error);
    });
}
function stopRecordingCallback() {
    aVideo.src = aVideo.srcObject = null;
    aVideo.src = URL.createObjectURL(recorder.getBlob());

    recorder.screen.stop();
    recorder.destroy();
    recorder = null;

    document.getElementById('btn-start-recording').disabled = false;
}
var recorder;

document.getElementById('btn-start-recording').onclick=function (){
    this.disabled=true;
    captureScreen(function (screen){
        aVideo.srcObject=screen;
        recorder=RecordRTC(screen,{
            type: 'video'
        });
        recorder.startRecording();

        recorder.screen=screen;
        document.getElementById('btn-stop-recording').disabled=false;

    });
};
document.getElementById('btn-stop-recording').onclick = function() {
    this.disabled = true;
    recorder.stopRecording(stopRecordingCallback);
};
function addStreamStopListener(stream, callback) {
    stream.addEventListener('ended', function() {
        callback();
        callback = function() {};
    }, false);
    stream.addEventListener('inactive', function() {
        callback();
        callback = function() {};
    }, false);
    stream.getTracks().forEach(function(track) {
        track.addEventListener('ended', function() {
            callback();
            callback = function() {};
        }, false);
        track.addEventListener('inactive', function() {
            callback();
            callback = function() {};
        }, false);
    });
}

connection.onopen = function () {
    console.log("Connected to the server");
}
connection.onmessage = function (msg) {
    //alert('msg='+msg.data);

    //var data = JSON.parse(msg.data);
}


