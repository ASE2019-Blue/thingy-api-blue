const Router = require('koa-router');
const router = new Router();

const Ctrl = require('../controllers/user-controller');

router.post('/sign-up', Ctrl.signUp);

module.exports = router.routes();
