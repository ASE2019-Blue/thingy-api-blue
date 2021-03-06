const Koa = require('koa');
const Jwt = require('koa-jwt');
const Router = require('koa-router');
const Cors = require('@koa/cors');
const BodyParser = require('koa-bodyparser');
const Helmet = require('koa-helmet');

require('./db');
require('./mqtt');
const ThingyService = require('./services/thingy-service');

const app = new Koa();
const router = new Router();

app.use(Helmet());
app.use(Cors());
app.use(BodyParser({
    enableTypes: ['json'],
    strict: true,
    onerror(err, ctx) {
        ctx.throw('Request body could not be parsed', 422);
    },
}));
app.use(Jwt({ secret: process.env.SECRET }).unless({
    path: [
        // Whitelist routes that don't require authentication
        /^\/auth/,
        /^\/sign-up/,
    ],
}));

require('./routes')(router);

app.use(router.routes());
app.use(router.allowedMethods());

ThingyService.recordThingyConnectionStatus();

module.exports = app;
