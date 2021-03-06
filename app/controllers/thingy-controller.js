const Thingy = require('../models/thingy-model');

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
    const { available } = ctx.request.query;
    if (available !== undefined && available === '1') ctx.body = await Thingy.find({ available: true });
    else ctx.body = await Thingy.find({});
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
    const { thingyId } = ctx.params;
    const { username } = ctx.state.user;

    const thingy = await Thingy.findOneAndUpdate({ _id: thingyId, lockedForUser: null }, { lockedForUser: username });

    if (thingy === null) {
        ctx.throw(400, 'Invalid request');
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
    const { thingyId } = ctx.params;
    const { username } = ctx.state.user;

    const thingy = await Thingy.findOneAndUpdate({ _id: thingyId, lockedForUser: username }, { lockedForUser: null });

    if (thingy === null) {
        ctx.throw(400, 'Invalid request');
    }
    ctx.status = 200;
}

module.exports = {
    findAll,
    lock,
    unlock,
};
