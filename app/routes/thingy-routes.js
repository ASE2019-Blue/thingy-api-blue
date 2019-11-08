const Router = require('koa-router');
const router = new Router();

const Ctrl = require('../controllers/thingy-controller');

router.get('/', Ctrl.findAll)
    .get('/available', Ctrl.findAllAvailable)
    .post('/:thingyId/lock', Ctrl.lock)
    .delete('/:thingyId/lock', Ctrl.unlock);

module.exports = router.routes();
