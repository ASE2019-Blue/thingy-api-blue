const Koa = require('koa');
const Jwt = require('koa-jwt');
const Cors = require('@koa/cors');
const BodyParser = require('koa-bodyparser');
const Helmet = require('koa-helmet');
const websockify = require('koa-websocket');

const websocketApp = websockify(new Koa());

websocketApp.use(Helmet());
websocketApp.use(Cors());
websocketApp.use(BodyParser({
    enableTypes: ['json'],
    strict: true,
    onerror(err, ctx) {
        ctx.throw('Request body could not be parsed', 422);
    },
}));
websocketApp.use(Jwt({ secret: process.env.SECRET }));

// client management
websocketApp.ws.use((ctx) => {
    // websocket is available as `ctx.websocket`.
    ctx.websocket.on('message', (message) => {
        console.log(message);
        // Move a client to a match
        if (message.includes('matchCode')) {
            try {
                const msg = JSON.parse(message);
                const { matchCode } = msg;
                const { playerName } = msg;
                console.log(`${playerName} moved to match ${matchCode}`);
                ctx.websocket._id = matchCode;
                ctx.websocket.playerName = playerName;
                ctx.websocket.send(`You have been moved to match: ${ctx.websocket._id}`);
                const joinMsg = { msg: 'join', player: playerName };
                websocketApp.ws.server.clients.forEach((user) => {
                    if (user._id === matchCode) {
                        user.send(JSON.stringify(joinMsg));
                    }
                });
            } catch (error) {
                ctx.websocket.send('Error will parsing the client configuration sent');
            }
        // Test what id the client have
        } else if (message.includes('testId')) {
            try {
                ctx.websocket.send(`Client id: ${ctx.websocket._id}, Name : ${ctx.websocket.playerName}`);
            } catch (error) {
                ctx.websocket.send('Error : problem with socket informations');
            }
        } else {
            ctx.websocket.send('Error : message not recognized');
        }
    });
});

module.exports = websocketApp;
