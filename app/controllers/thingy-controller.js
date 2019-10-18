const Thingy = require('../models/thingy-model');

const LOCK_STATE_OK = 'Ok';
const LOCK_STATE_ALREADY_LOCKED = 'Thingy already locked';
const LOCK_STATE_INVALID = 'Invalid request';

/**
 * Find all thingys.
 *
 * @param ctx
 * @param next
 * @returns {Promise<void>}
 */
async function findAll(ctx, next) {
    // For testing purpose, create thingy first by uncommenting these lines
    // const thingy = new Thingy();
    // thingy.macAddress = '11-22-33-44-55-66';
    // thingy.lockedForUser = null;
    // await thingy.save();

    ctx.body = await Thingy.find({});
}

/**
 * Lock thingy to current user.
 *
 * @param ctx
 * @param next
 * @returns {Promise<void>}
 */
async function lock(ctx, next) {
    // TODO Validate user input
    const thingyId = ctx.params.thingyId;
    const username = ctx.state.user.username;
    let state = LOCK_STATE_INVALID;

    await Thingy.findOneAndUpdate(
        { _id: thingyId, lockedForUser: null },
        { lockedForUser: username },
        {},
        function(error, results) {
            console.log({error: error, results: results});
            if (results === null) {
                state = LOCK_STATE_ALREADY_LOCKED;
            } else if (error !== null) {
                state = LOCK_STATE_INVALID;
            } else {
                state = LOCK_STATE_OK;
            }
        });

    if (state !== LOCK_STATE_OK) {
        ctx.throw(400, state);
    }
    ctx.status = 200;
}

/**
 * Remove lock of thingy for current user.
 *
 * @param ctx
 * @param next
 * @returns {Promise<void>}
 */
async function unlock(ctx, next) {
    // TODO Validate user input
    const thingyId = ctx.params.thingyId;
    const username = ctx.state.user.username;

    try {
        await Thingy.findOneAndUpdate({ _id: thingyId, lockedForUser: username }, { lockedForUser: null });
    } catch (e) {
        // TODO Add better exception handling: Thingy not found, thingy already locked
        ctx.throw(400, 'Invalid request');
    }
    ctx.status = 200;
}

module.exports = {
    findAll,
    lock,
    unlock,
};
