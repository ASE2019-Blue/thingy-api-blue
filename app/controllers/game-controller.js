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
    ctx.body = await Game.find({});
}

/**
 * Add a new game.
 *
 * @param ctx
 * @param next
 * @returns {Promise<void>}
 */
async function add(ctx, next) {
    let game = new Game();

    // Validate input
    // TODO Replace with validation framework
    const gameDto = ctx.request.body;
    if (!gameDto.title) ctx.throw(400, {'error': '"title" is a required field'});

    game.title = gameDto.title;

    await game.save();

    ctx.body = game;
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
    add,
    addMatch
};
