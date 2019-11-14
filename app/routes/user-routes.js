const Router = require('koa-router');

const router = new Router();

const Ctrl = require('../controllers/user-controller');

router.get('/', Ctrl.findAll)
    .get('/:username', Ctrl.findOne)
    .put('/:username',Ctrl.change)
    .put('/:username/password', Ctrl.changePassword);

module.exports = router.routes();
