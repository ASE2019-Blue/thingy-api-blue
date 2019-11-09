const Router = require('koa-router');

const router = new Router();

const Ctrl = require('../controllers/auth-controller');

router.post('/token', Ctrl.createToken);

module.exports = router.routes();
