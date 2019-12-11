const Koa = require('koa');
const Router = require('koa-router');
const Cors = require('@koa/cors');
const BodyParser = require('koa-bodyparser');
const Helmet = require('koa-helmet');
require('dotenv').config();

require('../app/db');
require('../app/mqtt');
const ThingyService = require('../app/services/thingy-service');

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

require('../app/routes')(router);

app.use(router.routes());
app.use(router.allowedMethods());

ThingyService.recordThingyConnectionStatus();

const port = process.env.PORT || 3000;

module.exports = app.listen(port, () => console.log(`API server started on ${port}`));