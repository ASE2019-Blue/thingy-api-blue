const Game = require('../models/game-model');
const GameRating = require('../models/game-rating-model');
const Match = require('../models/match-model');
const Utilities = require('../services/utility-service');
const CodeGenerator = require('../services/invitation-service');
const ConfigThingy = require('../config-thingy');
const Wss = require('../websocket');

async function calculateRating(gameKey) {
    const ratingEntries = await GameRating.find({ gameKey });

    let numberOfRatings = 0;
    let totalValue = 0;

    ratingEntries.forEach((value) => {
        numberOfRatings += 1;
        totalValue += value.rating;
    });
    const average = totalValue / numberOfRatings;
    return average;
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
    const games = Game.GAMES;
    for (let i = 0; i < games.length; i++) {
        const average = await calculateRating(games[i].key);
        games[i].rating = average;
    }
    ctx.body = games;
}

/**
 * Find colors for players which work on the thingy.
 *
 * @param ctx
 * @param next
 * @returns {Promise<void>}
 */
async function getColors(ctx, next) {
    // Add some latency for better async testing
    // TODO Remove after development
    await Utilities.sleep(800);
    const { colors } = ConfigThingy;
    const colorsArray = Object.values(colors);
    ctx.body = colorsArray;
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

    if (gameKey === Game.TAP_GAME) {
        if (typeof matchDto.colors === 'undefined') {
            ctx.throw(400, { error: 'You need to provide a table with the colors available and not available anymore.' });
        }
    }

    const { username } = ctx.state.user;
    const match = new Match.MODEL();
    match.gameKey = gameKey;
    match.owner = username;
    if (gameKey === Game.TAP_GAME) {
        match.config = { numberOfRounds: matchDto.config.numberOfRounds };
    } else if (gameKey === Game.HIDE_AND_SEEK) {
        match.config = { gameTime: matchDto.config.gameTime };
    }
    match.thingys = matchDto.thingys;
    // const user = await User.findOne({ username });
    match.players = matchDto.config.players;
    // match.players.push({
    //     name: user.username,
    //     user: user.username,
    //     color: '255,0,0',
    //     score: 0,
    // });
    match.code = CodeGenerator.makeCode(5);
    if (gameKey === Game.TAP_GAME) {
        match.colors = matchDto.colors;
    }
    await match.save();

    // Add the owner to the match on the websocket server
    Wss.addOwnerToMatch(username, match.code);

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

    ctx.body = await calculateRating(gameKey);
}


module.exports = {
    findAll,
    getColors,
    addMatch,
    addRating,
    getRating,
};
