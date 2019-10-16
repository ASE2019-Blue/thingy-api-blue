const Router = require('koa-router');
const router = new Router();

const Ctrl = require('../controllers/user-controller');

router.get('/', Ctrl.findAll)
    .get('/:username', Ctrl.findOne);

module.exports = router.routes();
