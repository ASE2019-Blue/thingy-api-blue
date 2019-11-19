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
        if (message.includes('matchId')) {
            try {
                const msg = JSON.parse(message);
                const { matchId } = msg;
                console.log(`Client moved to match ${matchId}`);
                ctx.websocket._id = matchId;
                ctx.websocket.send(`You have been moved to match: ${ctx.websocket._id}`);
            } catch (error) {
                ctx.websocket.send('Error : The message is not json typed.');
            }
        // Test what id the client have
        } else if (message.includes('testId')) {
            try {
                ctx.websocket.send(`Client id: ${ctx.websocket._id}`);
            } catch (error) {
                ctx.websocket.send('Error : problem with id.');
            }
        } else {
            ctx.websocket.send('Error : message not recognized');
        }
    });
});

module.exports = websocketApp;
