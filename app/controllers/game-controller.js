const Game = require('../models/game-model');
const GameRating = require('../models/game-rating-model');
const Match = require('../models/match-model');
const User = require('../models/user-model');
const Utilities = require('../services/utility-service');
const CodeGenerator = require('../services/invitation-service');
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
    const { gameKey } = ctx.params;

    if (!Game.GAME_KEYS.includes(gameKey)) {
        ctx.throw(404, { error: 'Game not found' });
    }

    // TODO Validate input (thingys, config, only one match per user at the same time)
    const matchDto = ctx.request.body;

    if (typeof matchDto.config === 'undefined') {
        ctx.throw(400, { error: 'You need to provide a config for the match' });
    }

    if (typeof matchDto.thingys === 'undefined') {
        ctx.throw(400, { error: 'You need to provide a list of thingys to use for the match' });
    }

    const { username } = ctx.state.user;
    const match = new Match.MODEL();
    match.gameKey = gameKey;
    match.owner = username;
    match.config = matchDto.config;
    match.thingys = matchDto.thingys;
    const user = await User.findOne({ username });
    match.players.push(user.username);
    match.code = CodeGenerator.makeCode(5);

    await match.save();
    ctx.body = match;
}

async function addRating(ctx, next) {
    const { username } = ctx.state.user;
    const { gameKey } = ctx.params;
    const { rating } = ctx.request.body;

    if (!Game.GAME_KEYS.includes(gameKey)) {
        ctx.throw(404, { error: 'Game not found' });
    }

    let ratingEntry = await GameRating.findOne({ username, gameKey });
    if (typeof ratingEntry === 'undefined' || ratingEntry == null) { ratingEntry = new GameRating(); }

    ratingEntry.username = username;
    ratingEntry.gameKey = gameKey;
    ratingEntry.rating = rating;

    await ratingEntry.save();
    ctx.status = 200;
}

async function getRating(ctx, next) {
    const { username } = ctx.state.user;
    const { gameKey } = ctx.params;

    if (!Game.GAME_KEYS.includes(gameKey)) {
        ctx.throw(404, { error: 'Game not found' });
    }

    const ratingEntries = await GameRating.find({ username, gameKey });

    let numberOfRatings = 0;
    let totalValue = 0;

    ratingEntries.forEach((value) => {
        numberOfRatings += 1;
        totalValue += value.rating;
    });

    ctx.body = totalValue / numberOfRatings;
}


module.exports = {
    findAll,
    addMatch,
    addRating,
    getRating,
};
