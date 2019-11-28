const WebSocket = require('ws');
const Jwt = require('koa-jwt');

const wsOptions = {
    port: process.env.WEBSOCKET_PORT || 3001,
    verifyClient({ req }, cb) {
        // for development only
        // req.user = { username: 'test' };
        // cb(true);
        // comment the two lines above and uncomment the following to use the token
        const { token } = req.headers;
        if (!token) cb(false, 401, 'Unauthorized');
        else {
            Jwt.verify(token, process.env.SECRET, (err, decoded) => {
                if (err) {
                    cb(false, 401, 'Unauthorized');
                } else {
                    req.user = decoded;
                    cb(true);
                }
            });
        }
    },
};
const wss = new WebSocket.Server(wsOptions);

wss.on('connection', (ws, req) => {
    const { username } = req.user;
    ws._id = username;
    ws.send(`Welcome ${ws._id}`);
});

module.exports = {
    wss,
};
