module.exports = (router) => {
    router.redirect('/', '/games');
    router.use('/games', require('./game-routes'));
    router.use('/matches', require('./match-routes'));
};
