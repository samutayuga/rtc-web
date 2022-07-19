# WebRTC for Screen Recording
## What
I would like to have a way to record the webpage and send the recording  file into a server, so that the server can
make it available for further use, such as replay or live-streaming.

## How
* Develop a webapp which capable of recording. Use the existing framework, 
thanks to [Record RTC](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC)
on top of `getUserMedia()` API.
* Use the Record RTC api to deal with the blob of stream chunk and send it to the websocket
* Websocket server which acts as a `Signaling` server, will call `ffmeg` to push the stream to RTMP server. It should be able to
invoke the equivalent command,
```shell
./ffmpeg -re -i bbb_sunflower_1080p_30fps_normal.mp4 -vcodec copy -loop -1 -c:a aac -b:a 160k -ar 44100 -f flv rtmp://localhost:1935/live/bbb
```

## Testing


