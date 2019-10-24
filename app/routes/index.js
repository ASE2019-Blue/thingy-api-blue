module.exports = (router) => {
    router.redirect('/', '/games');
    router.use('/auth', require('./auth-routes'));
    router.use('/games', require('./game-routes'));
    router.use('/sign-up', require('./signup-routes'));
    router.use('/thingys', require('./thingy-routes'));
    router.use('/users', require('./user-routes'));
};
