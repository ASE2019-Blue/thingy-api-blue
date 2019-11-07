const Router = require('koa-router');
const router = new Router();

const Ctrl = require('../controllers/game-controller');

router.get('/', Ctrl.findAll)
    .post('/:gameKey/matches', Ctrl.addMatch);

module.exports = router.routes();
