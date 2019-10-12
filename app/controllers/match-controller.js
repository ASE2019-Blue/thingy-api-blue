const Match = require('../models/match-model');

/**
 * Find all matches.
 *
 * @param ctx
 * @param next
 * @returns {Promise<void>}
 */
async function findAll(ctx, next) {
    ctx.body = await Match.find({}).populate('game');
}

module.exports = {
    findAll,
};
