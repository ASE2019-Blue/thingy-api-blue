const Koa = require('koa');
const Jwt = require('koa-jwt');
const Router = require('koa-router');
const Cors = require('@koa/cors');
const BodyParser = require('koa-bodyparser');
const Helmet = require('koa-helmet');
const Database = require('./db');

const app = new Koa();
const router = new Router();

app.use(Helmet());
app.use(Cors());
app.use(BodyParser({
    enableTypes: ['json'],
    strict: true,
    onerror: function (err, ctx) {
        ctx.throw('Request body could not be parsed', 422)
    }
}));
app.use(Jwt({ secret: process.env.SECRET }).unless({ path: [
    // Whitelist routes that don't require authentication
    /^\/auth/,
    /^\/users\/sign-up/
    ]
}));

require('./routes')(router);
app.use(router.routes());
app.use(router.allowedMethods());

module.exports = app;
