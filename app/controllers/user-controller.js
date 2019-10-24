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

module.exports = {
    findAll,
    findOne,
};
