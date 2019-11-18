require('dotenv').config();
const server = require('./server');
const websocket = require('./websocket');

const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`API server started on ${port}`));

const wsPort = process.env.WEBSOCKET_PORT || 3001;
websocket.listen(wsPort, () => console.log(`Websocket started on ${wsPort}`));

websocket.ws.use((ctx) => {
    // websocket is available as `ctx.websocket`.
    ctx.websocket.on('message', (message) => {
        console.log(message);
        ctx.websocket.send('Reply on ' + message);
    });
});
