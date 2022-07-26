const uuid = new Date().getTime().toString();
//var video = document.querySelector('video');
var connection = new WebSocket(`ws://127.0.0.1:9090`);

connection.onopen = (anEvent) => {
    console.log("Connected to the server" + anEvent);
}
connection.addEventListener('close', (e) => {
    console.log('Websocket close', e);
});


if (!navigator.getDisplayMedia && !navigator.mediaDevices.getDisplayMedia) {
    var error = 'Your browser does NOT support the getDisplayMedia API.';
    document.querySelector('h3').innerHTML = error;

    document.querySelector('video').style.display = 'none';
    document.getElementById('btn-start-recording').style.display = 'none';
    document.getElementById('btn-stop-recording').style.display = 'none';
    throw new Error(error);
}
//success is a callback function(mediaStream){}, mediaStream is a variable to capture the
//user media stream
//
function invokeUserMedia(success) {
    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({audio: true, video: false}).then(success);
    }
}

function invokeGetDisplayMedia(success, error) {
    // var displaymediastreamconstraints = {
    //     video: {
    //         displaySurface: 'browser', // monitor, window, application, browser
    //         logicalSurface: true,
    //         cursor: 'always' // never, always, motion
    //     },
    //     audio: {
    //         echoCancellation: true,
    //         noiseSuppression: true,
    //         sampleRate: 44100,
    //     }
    // };

    // above constraints are NOT supported YET
    // that's why overridnig them
    displaymediastreamconstraints = {
        video: true,
        audio: false
    };


    if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices.getDisplayMedia(displaymediastreamconstraints).then(success).catch(error);

    } else {
        navigator.getDisplayMedia(displaymediastreamconstraints).then(success).catch(error);
    }
}

function captureDisplay(callback) {
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

function captureAudioWithVideo(callback) {
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
    // video.src = video.srcObject = null;
    // video.src = URL.createObjectURL(recorder.getBlob());
    connection.close(3000, 'I am done. Bye...');

    //recorder.screen.stop();
    recorder.destroy();
    recorder = null;


    document.getElementById('btn-start-recording').disabled = false;
}

var recorder; // globally accessible
var mediaRecorder;
var h3 = document.querySelector('h3');
var blobs = [];

document.getElementById('btn-start-recording').onclick = function () {
    this.disabled = true;
    connection.send(uuid);
    //capture the screen
    //captureScreen(consume);
    //captureDisplay(function (screen) {
    //invokeUserMedia(function (anAudio) {
    navigator.mediaDevices.getDisplayMedia({video: true, audio: false}).then(function (display) {
        navigator.mediaDevices.getUserMedia({video: false, audio: true}).then(function (audio) {
            // recorder = RecordRTC([display, audio], {
            //     type: 'video',
            //     mimeType: 'video/webm;codecs=h264',
            //     timeSlice: 1000,
            //     ondataavailable: function (blob) {
            //         blobs.push(blob);
            //         connection.send(blob);
            //         var size = 0;
            //         blobs.forEach(function (b) {
            //             size += b.size;
            //         });
            //         h3.innerHTML = 'Total blobs: ' + blobs.length + ' (Total size: ' + bytesToSize(size) + ')';
            //     }
            // });
            // recorder.startRecording();
            //1. initialise the MediaStream
            let finalStream = new MediaStream();

            //2. handle the canvas capturing with 30 frame per second
            //let cvStream = document.querySelector('canvas').captureStream(30);//30 fps
            //3. get the audio tracks and include into the stream
            audio.getTracks().forEach(function (track) {
                finalStream.addTrack(track);
            });
            //4. get the video tracks and include into the stream
            display.getTracks().forEach(function (track) {
                finalStream.addTrack(track);
            });
            //5. Initialize the MediaRecorder with the MediaStream, mimeType and 3MB per seconds of video
            mediaRecorder = new MediaRecorder(finalStream, {
                mimeType: 'video/webm;codecs=h264',
                videoBitsPerSecond: 3 * 1024 * 1024
            });
            //6. Declare the dataavailable callback function and what to do upon dataavailable triggered.
            mediaRecorder.addEventListener('dataavailable', (e) => {
                //7. publish the media stream through websocket
                connection.send(e.data);
            })
            //6. Declare the stop callback function
            mediaRecorder.addEventListener('stop', connection.close.bind(connection));
            mediaRecorder.start(1000);//start recording and dump data every second
        });

    });
    //video.srcObject = screen;
    //audio.srcObject = anAudio;

    //recorder.screen = screen;
    //recorder.audio = anAudio;
    document.getElementById('btn-stop-recording').disabled = false;
    //  });
    // });
    //capture the audio
    //captureAudio(consumeAudio);


};
// document.getElementById('btn-start-recording').onclick = function () {
//     this.disabled = true;
//     connection.send(uuid);
//     //capture the screen
//     //captureScreen(consume);
//     captureAudioWithVideo(function (screen) {
//         invokeUserMedia(function (anAudio) {
//             video.srcObject = screen;
//             //audio.srcObject = anAudio;
//             recorder = RecordRTC([screen, anAudio], {
//                 type: 'video',
//                 mimeType: 'video/webm;codecs=h264',
//                 timeSlice: 1000,
//                 ondataavailable: function (blob) {
//                     blobs.push(blob);
//                     connection.send(blob);
//                     var size = 0;
//                     blobs.forEach(function (b) {
//                         size += b.size;
//                     });
//                     h3.innerHTML = 'Total blobs: ' + blobs.length + ' (Total size: ' + bytesToSize(size) + ')';
//                 }
//             });
//             recorder.startRecording();
//             recorder.screen = screen;
//             recorder.audio = anAudio;
//             document.getElementById('btn-stop-recording').disabled = false;
//         });
//     });
//     //capture the audio
//     //captureAudio(consumeAudio);
//
//
// };

document.getElementById('btn-stop-recording').onclick = function () {
    this.disabled = true;
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