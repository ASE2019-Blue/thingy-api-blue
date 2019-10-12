const Koa = require('koa');
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

require('./routes')(router);
app.use(router.routes());
app.use(router.allowedMethods());

module.exports = app;
