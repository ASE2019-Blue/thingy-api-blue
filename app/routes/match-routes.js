const Router = require('koa-router');
const router = new Router();

const Ctrl = require('../controllers/match-controller');

router.get('/', Ctrl.findAll)
    .patch('/:matchId/start', Ctrl.startMatch);

module.exports = router.routes();