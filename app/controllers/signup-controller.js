const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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
        // user._id = userDto.username;
        user.username = userDto.username;
        user.firstName = userDto.firstName != null ? userDto.firstName : '';
        user.lastName = userDto.lastName != null ? userDto.lastName : '';
        user.hash = hash;

        await user.save();
    } catch (err) {
        if (err.code === 11000) {
            ctx.throw(400, 'Username already taken');
        }
        ctx.throw(400, err);
    }

    const token = jwt.sign({ username: user.username }, process.env.SECRET);
    ctx.body = { token };
}

module.exports = {
    signUp,
};
