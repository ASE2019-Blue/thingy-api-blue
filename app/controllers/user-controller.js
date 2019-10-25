const bcrypt = require('bcrypt');
const User = require('../models/user-model');
const Utilities = require('../services/utility-service');

const USER_FIELDS_PROFILE_SHORT = 'username createdAt -_id';
const USER_FIELDS_PROFILE_FULL = '-_id -hash';

/**
 * Find short profile of all users.
 *
 * @param ctx
 * @param next
 * @returns {Promise<void>}
 */
async function findAll(ctx, next) {
    // Add some latency for better async testing
    // TODO Remove after development
    await Utilities.sleep(800);
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

    // Add some latency for better async testing
    // TODO Remove after development
    await Utilities.sleep(800);

    ctx.body = user;
}

/**
 * Change the password of the currently logged in user.
 *
 * @param ctx
 * @param next
 * @returns {Promise<void>}
 */
async function changePassword(ctx, next) {
    const username = ctx.params.username;
    const usernameOfLoggedInUser = ctx.state.user.username;
    const newPasswordDto = ctx.request.body;

    if (username !== usernameOfLoggedInUser) {
        ctx.throw(400, 'You can not change the password of someone else');
    }

    const user = await User.findOne({username: username});
    if (!user) {
        ctx.throw(404, 'User not found');
    }

    if (typeof newPasswordDto.currentPassword === "undefined" || typeof newPasswordDto.newPassword === "undefined") {
        ctx.throw(400, 'You need to provide the current and the new password');
    }

    const match = await bcrypt.compare(newPasswordDto.currentPassword, user.hash);
    if (!match) {
        ctx.throw(400, 'The provided password does not match the current password');
    }

    user.hash = await bcrypt.hash(newPasswordDto.newPassword, 12);
    await user.save();

    ctx.status = 200;
}

module.exports = {
    findAll,
    findOne,
    changePassword
};
