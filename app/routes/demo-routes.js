const Router = require('koa-router');
const router = new Router();

const Ctrl = require('../controllers/demo-controller');

router.post('/', Ctrl.demo);

module.exports = router.routes();
