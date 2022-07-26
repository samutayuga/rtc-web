//1. Declare the websocket client connection
const ws = new WebSocket(`ws://127.0.0.1:9090`);
let mediaRecorder
const uuid = new Date().getTime().toString();

//2. get the audio stream through anonymous callback function
//3. once the callback is executed the
//4. merge audio into canvas
function startRecording() {
    document.getElementById('btn-stop-recording').disabled = false;
    navigator.mediaDevices.getUserMedia({video: false, audio: true}).then(function (audioStream) {
        //1. initialise the MediaStream
        let finalStream = new MediaStream();

        //2. handle the canvas capturing with 30 frame per second
        let cvStream = document.querySelector('canvas').captureStream(30);//30 fps
        //3. get the audio tracks and include into the stream
        audioStream.getTracks().forEach(function (track) {
            finalStream.addTrack(track);
        });
        //4. get the video tracks and include into the stream
        cvStream.getTracks().forEach(function (track) {
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
            ws.send(e.data);
        })
        //6. Declare the stop callback function
        mediaRecorder.addEventListener('stop', ws.close.bind(ws));
        mediaRecorder.start(1000);//start recording and dump data every second

    });
}

//as soon as the connection to websocket server is established,
//the recording will start
ws.addEventListener('open', (e) => {
    ws.send(uuid);
    console.log('WebSocket Open', e);
    //canvasCapture();
    startRecording();
});
ws.addEventListener('close', (e) => {
    console.log('Websocket Close', e);
    if (mediaRecorder) {
        mediaRecorder.stop();
    }
    console.log('bye....')

})

document.getElementById('btn-stop-recording').onclick=function (){
    this.disabled = true;
    ws.close(3000, 'I am done. Bye...');

    //recorder.screen.stop();
    mediaRecorder.stop();
    mediaRecorder = null;
}








