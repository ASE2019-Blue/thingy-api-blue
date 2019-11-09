const Router = require('koa-router');

const router = new Router();

const Ctrl = require('../controllers/demo-controller');

router.post('/', Ctrl.demo)
    .post('/end', Ctrl.stop);

module.exports = router.routes();
