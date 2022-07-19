var video = document.querySelector('video');

if (!navigator.getDisplayMedia && !navigator.mediaDevices.getDisplayMedia) {
    var error = 'Your browser does NOT support the getDisplayMedia API.';
    document.querySelector('h1').innerHTML = error;

    document.querySelector('video').style.display = 'none';
    document.getElementById('btn-start-recording').style.display = 'none';
    document.getElementById('btn-stop-recording').style.display = 'none';
    throw new Error(error);
}

function invokeGetDisplayMedia(success, error) {
    var displaymediastreamconstraints = {
        video: {
            displaySurface: 'monitor', // monitor, window, application, browser
            logicalSurface: true,
            cursor: 'always' // never, always, motion
        }
    };

    // above constraints are NOT supported YET
    // that's why overridnig them
    displaymediastreamconstraints = {
        video: true
    };

    if (navigator.mediaDevices.getDisplayMedia) {
        //var p = navigator.mediaDevices.getDisplayMedia(displaymediastreamconstraints).then(x => console.log(x.getTracks())).catch(error);
        // p.then(a => console.log(a.getTracks()));
        navigator.mediaDevices.getDisplayMedia(displaymediastreamconstraints).then(success).catch(error);

    } else {
        navigator.getDisplayMedia(displaymediastreamconstraints).then(success).catch(error);
    }
}

function captureScreen(callback) {
    invokeGetDisplayMedia(function (screen) {
        addStreamStopListener(screen, function () {
            document.getElementById('btn-stop-recording').click();
        });
        callback(screen);
    }, function (error) {
        console.error(error);
        alert('Unable to capture your screen. Please check console logs.\n' + error);
    });
}

function stopRecordingCallback() {
    video.src = video.srcObject = null;
    video.src = URL.createObjectURL(recorder.getBlob());

    recorder.screen.stop();
    recorder.destroy();
    recorder = null;

    document.getElementById('btn-start-recording').disabled = false;
}

var recorder; // globally accessible
function callbackForStream(screen) {
    video.srcObject = screen;

    recorder = RecordRTC(screen, {
        type: 'video'
    });

    recorder.startRecording();

    // release screen on stopRecording
    recorder.screen = screen;
    console.log(recorder);
    document.getElementById('btn-stop-recording').disabled = false;
}
var intervalKey;
function recordWithOther(screen) {
    var context=new window.AudioContext()
    var mediaStreamSource=context.createMediaStreamSource(screen)
    //recorder=new Recorder(mediaStreamSource);
    video.srcObject = screen;

    recorder = new Recorder(mediaStreamSource);

    recorder.record();

    intervalKey = setInterval(function() {
        recorder.exportWAV(function(blob) {
            recorder.clear();
            console.log(blob);
        });
    }, 1000);

    // release screen on stopRecording
    recorder.screen = screen;
    document.getElementById('btn-stop-recording').disabled = false;
}
document.getElementById('btn-start-recording').onclick = function () {
    this.disabled = true;
    captureScreen(callbackForStream);
};

document.getElementById('btn-stop-recording').onclick = function () {
    this.disabled = true;
    recorder.stopRecording();
    //clearInterval()
    recorder.stopRecording(stopRecordingCallback);
};

function addStreamStopListener(stream, callback) {
    stream.addEventListener('ended', function () {
        callback();
        callback = function () {
        };
    }, false);
    stream.addEventListener('inactive', function () {
        callback();
        callback = function () {
        };
    }, false);
    stream.getTracks().forEach(function (track) {
        track.addEventListener('ended', function () {
            callback();
            callback = function () {
            };
        }, false);
        track.addEventListener('inactive', function () {
            callback();
            callback = function () {
            };
        }, false);
    });
}