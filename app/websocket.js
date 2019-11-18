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

module.exports = websocketApp;
