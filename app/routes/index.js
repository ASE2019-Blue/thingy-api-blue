module.exports = (router) => {
    router.redirect('/', '/games');
    router.use('/auth', require('./auth-routes'));
    router.use('/games', require('./game-routes'));
    router.use('/matches', require('./match-routes'));
    router.use('/users', require('./user-routes'));
};
