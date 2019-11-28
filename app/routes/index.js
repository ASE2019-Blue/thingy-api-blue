const authRoutes = require('./auth-routes');
const gameRoutes = require('./game-routes');
const thingyRoutes = require('./thingy-routes');
const userRoutes = require('./user-routes');
const matchRoutes = require('./match-routes');
const demoRoutes = require('./demo-routes');
const signupRoutes = require('./signup-routes');

module.exports = (router) => {
    router.redirect('/', '/games');
    router.use('/auth', authRoutes);
    router.use('/demo', demoRoutes);
    router.use('/games', gameRoutes);
    router.use('/matches', matchRoutes);
    router.use('/sign-up', signupRoutes);
    router.use('/thingys', thingyRoutes);
    router.use('/users', userRoutes);
};
