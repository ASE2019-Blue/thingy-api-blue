const Game = require('../models/game-model');
const GameRating = require('../models/game-rating-model');
const Match = require('../models/match-model');
const User = require('../models/user-model');
const Utilities = require('../services/utility-service');
const CodeGenerator = require('../services/invitation-service');

async function calculateRating(gameKey){
    const ratingEntries = await GameRating.find({ gameKey });

    let numberOfRatings = 0;
    let totalValue = 0;

    ratingEntries.forEach((value) => {
        numberOfRatings += 1;
        totalValue += value.rating;
    });
    let average = totalValue / numberOfRatings;
    return average
}

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
    let games = Game.GAMES;
    for(let i = 0 ; i < games.length ; i++) {
        average = await calculateRating(games[i].key);
        // if(average !== NaN)
            games[i]['rating'] = average;
    }
    ctx.body = games;
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
    match.config = {numberOfRounds: matchDto.config.numberOfRounds};
    match.thingys = matchDto.thingys;
    const user = await User.findOne({ username });
    match.players = matchDto.config.players;
    match.players.push({name : user.username, color: "255,0,0", score: "0"});
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
    const { gameKey } = ctx.params;

    if (!Game.GAME_KEYS.includes(gameKey)) {
        ctx.throw(404, { error: 'Game not found' });
    }

    ctx.body = calculateRating(gameKey);
}


module.exports = {
    findAll,
    addMatch,
    addRating,
    getRating,
};
