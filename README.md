# WebRTC for Screen Recording
## What
I would like to have a way to record the webpage and send the recording  file into a server, so that the server can
make it available for further use, such as replay or live-streaming.
## Media Devices API
Some alternative to be used,


| API             | Comment                                                                                                  | Device Input   |
|-----------------|----------------------------------------------------------------------------------------------------------|----------------|
| getUserMedia    | Not suitable, since it expects the camera, web cam as the media input                                    | Web Camera     |
| getMediaDisplay | Suitable as it is capture the screen, however the it is slow during the streaming                        | Screen Sharing |
| html element    | Suitable as it is capture canvas. However it requires the <br/>boundary covering the area to be recorded | Canvas         |

## Implementation Challenge
The fact the input device and api does not exactly behave as what use case is expected.
Audio and video are two separate device input, and it comes with two separate stream.
So, to have a recording with both video and sound needs two media streams.
Regardless, it uses the `getUserMedia`, `displayMedia` or `html element`.
The user media, is recording from webcam, so it is not so suitable with the use case.
`displayMedia` and `html element with canvas` seems more suitable.
So it needs two controls for audio and video. 

`displayMedia with userMedia`
 

```html
...
<video controls="" autoplay="" playsinline="" style="width: 40%;"></video>
```
Corresponding javascript codes to handle the stream,

`displayMedia` api will capture the input from shared screen.

```javascript
// above constraints are NOT supported YET
// that's why overridnig them
displaymediastreamconstraints = {
    video: true
};

if(navigator.mediaDevices.getDisplayMedia) {
    navigator.mediaDevices.getDisplayMedia(displaymediastreamconstraints).then(successcallback).catch(error);
}
...

```
Where `successcallback` is a function to handle the `Media Stream`.

`userMedia` api will capture the input from audio.

```javascript
navigator.mediaDevices.getUserMedia({audio: true, video: false}).then(cb);
```

Where `cb` is a callback to capture the audio stream.

The objective is to produce a single stream that include `audio` and `video` media stream.
This can with a single method that accept the two callback, something like,

```javascript
captureAudioWithVideo(function (screen) {
    invokeUserMedia(function (anAudio) {
        video.srcObject = screen;
        //RecordRTC has a stream with audio and video
        recorder = RecordRTC([screen, anAudio], {
            type: 'video',
            mimeType: 'video/webm',
            timeSlice: 1000,
            ondataavailable: function (blob) {
                blobs.push(blob);
                connection.send(blob);
                var size = 0;
                blobs.forEach(function (b) {
                    size += b.size;
                });
                h3.innerHTML = 'Total blobs: ' + blobs.length + ' (Total size: ' + bytesToSize(size) + ')';
            }
        });
        recorder.startRecording();
        recorder.screen = screen;
        recorder.audio = anAudio;
        document.getElementById('btn-stop-recording').disabled = false;
    });
});
```
The drawback with this approach is that user needs to choose which screen he/she needs to share.

`canvas with userMedia`

It is possible to start the recording as soon as the page is opened. This gives impression that the recording is done
automatically which is aligned with existing legacy behavior
```javascript
//2. get the audio stream through anonymous callback function
//3. once the callback is executed the
//4. merge audio into canvas
function startRecording() {
    // vid = document.createElement('video');
    // vid.src = 'https://dl.dropboxusercontent.com/s/bch2j17v6ny4ako/movie720p.mp4';
    // //document.querySelector('video')
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
```

## How
* Develop a webapp which is capable of recording. Use the existing framework, 
thanks to [Record RTC](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC)
on top of `getUserMedia()` API.
* Use the Record RTC api to deal with the blob of stream chunk and send it to the websocket
* Websocket server which acts as a `Signaling` server, will call `ffmeg` to push the stream to RTMP server. 
It should be able to invoke the equivalent command,
```shell
./ffmpeg -re -i bbb_sunflower_1080p_30fps_normal.mp4 -vcodec copy -loop -1 -c:a aac -b:a 160k -ar 44100 -f flv rtmp://localhost:1935/live/bbb
```




## Testing


