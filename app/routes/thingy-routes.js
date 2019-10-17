const Router = require('koa-router');
const router = new Router();

const Ctrl = require('../controllers/thingy-controller');

router.get('/', Ctrl.findAll);

module.exports = router.routes();
