const Game = require('../models/game-model');
const Match = require('../models/match-model');

/**
 * Find all games.
 *
 * @param ctx
 * @param next
 * @returns {Promise<void>}
 */
async function findAll(ctx, next) {
    ctx.body = Game.GAMES;
}

/**
 * Add a new match for a game.
 *
 * @param ctx
 * @param next
 * @returns {Promise<void>}
 */
async function addMatch(ctx, next) {
    const gameId = ctx.params['gameId'];

    const game = await Game.findById(gameId);
    if (!game) ctx.throw(404, {'error': 'Game not found'});

    const match = new Match();
    match.game = gameId;

    await match.save();
    ctx.body = await match.populate('game').execPopulate();
}

module.exports = {
    findAll,
    addMatch
};
