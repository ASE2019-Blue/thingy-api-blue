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

    let thingy = await Thingy.findOneAndUpdate({ _id: thingyId, lockedForUser: null }, { lockedForUser: username });

    if (null === thingy) {
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
    const thingyId = ctx.params.thingyId;
    const username = ctx.state.user.username;

    let thingy = await Thingy.findOneAndUpdate({ _id: thingyId, lockedForUser: username }, { lockedForUser: null });

    if (null === thingy) {
        ctx.throw(400, 'Invalid request');
    }
    ctx.status = 200;
}

module.exports = {
    findAll,
    lock,
    unlock,
};
