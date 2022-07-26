const express = require('express');
require('dotenv').config();

if (process.env.NEXT_PUBLIC_HTTP_PORT && process.env.NEXT_PUBLIC_SIGNALING_HOST && process.env.NEXT_PUBLIC_SIGNALING_WS_PORT) {
    const app = express();
    //config
    //app.set(".",path.join(__dirname,"."));

    app.use(express.static('public'));

    console.log(`NEXT_PUBLIC_HTTP_PORT,NEXT_PUBLIC_SIGNALING_HOST and NEXT_PUBLIC_SIGNALING_WS_PORT environment variable are set to ${process.env.NEXT_PUBLIC_HTTP_PORT},${process.env.NEXT_PUBLIC_SIGNALING_HOST},${process.env.NEXT_PUBLIC_SIGNALING_WS_PORT}`);
    app.get('/', (req, res) => {
        res.sendFile(__dirname+"/index.html");
    });
    app.get('/canvas.html', (req, res) => {
        res.sendFile(__dirname+"/canvas.html");
    })
    app.listen(process.env.NEXT_PUBLIC_HTTP_PORT, () => console.log('Server is ready'));

    process.on('SIGTERM', () => {
        app.close(() => {
            console.log('Process is terminated...')
        });
    });
} else {
    console.log("either NEXT_PUBLIC_HTTP_PORT,NEXT_PUBLIC_SIGNALING_HOST or NEXT_PUBLIC_SIGNALING_WS_PORT environment variable are not defined\nBye...");
    process.exit(0);
}




