const Game = require('../models/game-model');
const Match = require('../models/match-model');
const Utilities = require('../services/utility-service');
/**
 * Find all games.
 *
 * @param ctx
 * @param next
 * @returns {Promise<void>}
 */
async function findAll(ctx, next) {
    // Add some latency for better async testing
    // TODO Remove after development
    await Utilities.sleep(800);
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
    const gameKey = ctx.params['gameKey'];

    if (!Game.GAME_KEYS.includes(gameKey)) {
        ctx.throw(404, {'error': 'Game not found'});
    }

    // TODO Validate input (thingys, config, only one match per user at the same time)
    const matchDto = ctx.request.body;

    if (typeof matchDto.config == "undefined") {
        ctx.throw(400, {'error': 'You need to provide a config for the match'});
    }

    if (typeof matchDto.thingys == "undefined") {
        ctx.throw(400, {'error': 'You need to provide a list of thingys to use for the match'});
    }

    const username = ctx.state.user.username;
    const match = new Match();
    match.gameKey = gameKey;
    match.owner = username;
    match.config = matchDto.config;
    match.thingys = matchDto.thingys;

    await match.save();
    ctx.body = match;
}


module.exports = {
    findAll,
    addMatch
};
