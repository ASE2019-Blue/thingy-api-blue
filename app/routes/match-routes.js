const Router = require('koa-router');

const router = new Router();

const Ctrl = require('../controllers/match-controller');

router.get('/', Ctrl.findAll)
    .get('/:matchId', Ctrl.find)
    .post('/invitations/:code', Ctrl.subscribe)
    .del('/invitations/:code', Ctrl.unsubscribe)
    .put('/:matchId/state', Ctrl.changeStatus);

module.exports = router.routes();
