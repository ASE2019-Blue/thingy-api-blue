const bcrypt = require('bcrypt');
const User = require('../models/user-model');

/**
 * Sign up a new user.
 *
 * @param ctx
 * @param next
 * @returns {Promise<void>}
 */
async function signUp(ctx, next) {
    const userDto = ctx.request.body;
    const user = new User();

    try {
        // TODO Validate user input
        const hash = await bcrypt.hash(userDto.password, 12);

        user.username = userDto.username;
        user.firstName = userDto.firstName;
        user.lastName = userDto.lastName;
        user.hash = hash;

        await user.save();
    } catch (err) {
        if (err.code === 11000) {
            ctx.throw(400, 'Username already taken');
        }
        ctx.throw(400, err);
    }

    ctx.body = await User.find({username: user.username});
}

module.exports = {
    signUp
};
