const Router = require('koa-router');

const router = new Router();

const Ctrl = require('../controllers/highscore-controller');

router.get('/', Ctrl.findBest);

module.exports = router.routes();
