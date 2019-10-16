const Router = require('koa-router');
const router = new Router();

const Ctrl = require('../controllers/signup-controller');

router.post('/', Ctrl.signUp);

module.exports = router.routes();
