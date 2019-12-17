const bcrypt = require('bcrypt');
const User = require('../models/user-model');
const Thingy = require('../models/thingy-model');
const Game = require('../models/game-model');
const HighScore = require('../models/highscore-model');

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
    const { username } = ctx.params;

    // TODO Validate user input
    const user = await User.findOne({ username }).select(USER_FIELDS_PROFILE_FULL);
    if (!user) {
        ctx.throw(404, 'User not found');
    }

    ctx.body = user;
}

/**
 * Change the information of the currently logged in user.
 * Username cannot be changed for now.
 *
 * @param ctx
 * @param next
 * @returns {Promise<void>}
 */
async function change(ctx, next) {
    const { username } = ctx.params;
    const usernameOfLoggedInUser = ctx.state.user.username;
    const newUserDto = ctx.request.body;

    if (username !== usernameOfLoggedInUser) {
        ctx.throw(400, 'You can not change the information of someone else');
    }

    const user = await User.findOne({ username });
    if (!user) {
        ctx.throw(404, 'User not found');
    }

    try {
        // TODO Validate user input
        user.firstName = newUserDto.firstName != null ? newUserDto.firstName : '';
        user.lastName = newUserDto.lastName != null ? newUserDto.lastName : '';

        await user.save();
    } catch (err) {
        ctx.throw(400, err);
    }

    ctx.status = 200;
}

/**
 * Change the password of the currently logged in user.
 *
 * @param ctx
 * @param next
 * @returns {Promise<void>}
 */
async function changePassword(ctx, next) {
    const { username } = ctx.params;
    const usernameOfLoggedInUser = ctx.state.user.username;
    const newPasswordDto = ctx.request.body;

    if (username !== usernameOfLoggedInUser) {
        ctx.throw(400, 'You can not change the password of someone else');
    }

    const user = await User.findOne({ username });
    if (!user) {
        ctx.throw(404, 'User not found');
    }

    if (typeof newPasswordDto.currentPassword === 'undefined' || typeof newPasswordDto.newPassword === 'undefined') {
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

async function changeFavoriteThingy(ctx, next) {
    const { username } = ctx.params;
    const usernameOfLoggedInUser = ctx.state.user.username;
    const { thingy } = ctx.request.body;

    if (username !== usernameOfLoggedInUser) {
        ctx.throw(400, 'You can not change values of someone else');
    }

    const user = await User.findOne({ username: usernameOfLoggedInUser });

    if (typeof thingy === 'undefined') {
        user.favoriteThingy = null;
    } else {
        const thingyObj = await Thingy.findById(thingy);
        if (thingyObj === null) ctx.throw(404, 'Thingy not found');
        user.favoriteThingy = thingy;
    }
    await user.save();

    ctx.status = 200;
}

/**
 * Find the best results of a user for each game.
 *
 * @param ctx
 * @param next
 * @returns {Promise<void>}
 */
async function findHighscores(ctx, next) {
    const { username } = ctx.params;

    const user = await User.findOne({ username });
    if (!user) {
        ctx.throw(404, 'User not found');
    }

    const highScores = {};

    highScores[Game.TAP_GAME] = {
        name: Game.TAP_GAME_TITLE,
        gameKey: Game.TAP_GAME,
        highScores: await HighScore.find({ gameKey: Game.TAP_GAME, user: username }).sort({ score: -1 }).limit(5),
    };
    highScores[Game.HIDE_AND_SEEK] = {
        name: Game.HIDE_AND_SEEK_TITLE,
        gameKey: Game.HIDE_AND_SEEK,
        highScores: await HighScore.find({ gameKey: Game.HIDE_AND_SEEK, user: username }).sort({ score: -1 }).limit(5),
    };

    ctx.body = highScores;
}

module.exports = {
    findAll,
    findOne,
    findHighscores,
    change,
    changePassword,
    changeFavoriteThingy,
};
