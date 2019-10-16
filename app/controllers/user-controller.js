const bcrypt = require('bcrypt');
const User = require('../models/user-model');

const USER_FIELDS_PROFILE_SHORT = 'username createdAt -_id';
const USER_FIELDS_PROFILE_FULL = '-_id -hash';

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

/**
 * Find short profile of all users.
 *
 * @param ctx
 * @param next
 * @returns {Promise<void>}
 */
async function findAll(ctx, next) {
    ctx.body = await User.find({}).select(USER_FIELDS_PROFILE_SHORT);
}

/**
 * Find full profile of one users by username.
 *
 * @param ctx
 * @param next
 * @returns {Promise<void>}
 */
async function findOne(ctx, next) {
    const username = ctx.params.username;

    // TODO Validate user input
    const user = await User.findOne({username: username}).select(USER_FIELDS_PROFILE_FULL);
    if (!user) {
        ctx.throw(404, 'User not found');
    }

    ctx.body = user;
}

module.exports = {
    findAll,
    findOne,
    signUp,
};
