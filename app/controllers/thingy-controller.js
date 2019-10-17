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
    // await thingy.save();

    ctx.body = await Thingy.find({});
}

module.exports = {
    findAll,
};
