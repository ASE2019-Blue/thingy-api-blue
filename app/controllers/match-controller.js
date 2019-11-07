const Game = require('../models/game-model');
const Match = require('../models/match-model');
const Utilities = require('../services/utility-service');
const Tapgame = require('../games/tapgame');

const MATCH_FIELDS_WITHOUT_THINGY = '-_thingys';

/**
 * Find all matches.
 *
 * @param ctx
 * @param next
 * @returns {Promise<void>}
 */
async function findAll(ctx, next) {
    // Add some latency for better async testing
    // TODO Remove after development
    await Utilities.sleep(800);
    const matches = Match.find({}).select(MATCH_FIELDS_WITHOUT_THINGY);
    ctx.body = matches;
}

/**
 * Start a match.
 *
 * @param ctx
 * @param next
 * @returns {Promise<void>}
 */
async function startMatch(ctx, next) {
    const matchId = ctx.params['matchId'];
    let match = await Match.findOne({ _id: matchId});

    if(null === match){
        ctx.throw(404, {'error': 'Match not found'});
    }

    gameKey = match.gameKey;
    if (!Game.GAME_KEYS.includes(gameKey)) {
        ctx.throw(404, {'error': 'Game not found'});
    }

    let updatedMatch = await Match.findOneAndUpdate({ _id: matchId, state: Match.STATE_CREATED}, { state: Match.STATE_RUNNING });
    
    //For each game add a test on gameKey and launch the corresponding one
    //Maybe here, we could make a promise and wait for the game to end and recolt results here and send it back to the user
    if(gameKey === Game.TAP_GAME){
        Tapgame.start(match)
    }
    if(gameKey === Game.HIDE_AND_SEEK){
    	//Hideandseek.start(match)
    }
    
    
    ctx.body = updatedMatch;
}

module.exports = {
	findAll,
    startMatch
};