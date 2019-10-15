const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user-model');

/**
 * Create authentication token for user.
 *
 * @param ctx
 * @param next
 * @returns {Promise<void>}
 */
async function createToken(ctx, next) {
    const userCredentialsDto = ctx.request.body;

    // TODO Validate user input
    const user = await User.findOne({username: userCredentialsDto.username});
    if (!user) {
        ctx.throw(400, 'Invalid request');
    }

    const match = await bcrypt.compare(userCredentialsDto.password, user.hash);
    if (!match) {
        ctx.throw(400, 'Invalid request');
    }

    const token = jwt.sign({ username: user.username, name: user.firstName + ' ' + user.lastName }, process.env.SECRET);

    ctx.body = { token: token }
}

module.exports = {
    createToken
};
