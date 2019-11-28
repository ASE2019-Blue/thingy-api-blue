const Router = require('koa-router');

const router = new Router();

const Ctrl = require('../controllers/game-controller');

router.get('/', Ctrl.findAll)
    .get('/colors', Ctrl.getColors)
    .post('/:gameKey/matches', Ctrl.addMatch)
    .get('/:gameKey/rating', Ctrl.getRating)
    .post('/:gameKey/rating', Ctrl.addRating);

module.exports = router.routes();
