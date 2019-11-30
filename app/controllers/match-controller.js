const Game = require('../models/game-model');
const Match = require('../models/match-model');
const User = require('../models/user-model');
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
    const matches = await Match.MODEL.find({}).select(MATCH_FIELDS_WITHOUT_THINGY);
    ctx.body = matches;
}

/**
 * Find one match by id.
 *
 * @param ctx
 * @param next
 * @returns {Promise<void>}
 */
async function find(ctx, next) {
    // Add some latency for better async testing
    // TODO Remove after development
    const { matchId } = ctx.params;
    await Utilities.sleep(800);
    const match = await Match.MODEL.findOne({ _id: matchId });
    if (match === null || match === undefined) ctx.throw(404, { error: 'Match not found' });
    ctx.body = match;
}


/**
 * Find one match by id.
 *
 * @param ctx
 * @param next
 * @returns {Promise<void>}
 */
async function updatePlayers(ctx, next) {
    const { matchId } = ctx.params;
    const { playersArray } = ctx.request.body;
    const match = await Match.MODEL.findOne({ _id: matchId });
    if (match === null || match === undefined) ctx.throw(404, { error: 'Match not found' });

    console.log(playersArray);

    match.players = playersArray;
    match.save();

    ctx.status = 200;
    ctx.body = match;
}

/**
 * Change the state of a match.
 *
 * @param ctx
 * @param next
 * @returns {Promise<void>}
 */
async function changeStatus(ctx, next) {
    const { matchId } = ctx.params;
    const { state } = ctx.request.body;
    if (!Match.MATCH_STATES.includes(state)) ctx.throw(400, 'Invalid state');
    if (state === Match.STATE_CREATED) ctx.throw(400, 'Cannot change to created state');

    const match = await Match.MODEL.findOne({ _id: matchId }).populate('thingys');
    if (match === null) ctx.throw(404, { error: 'Match not found' });

    const { gameKey } = match;

    try {
        switch (state) {
        case Match.STATE_RUNNING:
            // For each game add a test on gameKey and launch the corresponding one
            // Maybe here, we could make a promise and wait for the game to end and recolt results here and send it back to the user
            if (gameKey === Game.TAP_GAME) {
                await Tapgame.start(match);
            } else if (gameKey === Game.HIDE_AND_SEEK) {
                // Hideandseek.start(match)
            }
            break;
        case Match.STATE_FINISHED:
            // For each game add a test on gameKey and launch the corresponding one
            // Maybe here, we could make a promise and wait for the game to end and recolt results here and send it back to the user
            if (gameKey === Game.TAP_GAME) {
                await Tapgame.stop(match);
            } else if (gameKey === Game.HIDE_AND_SEEK) {
                // Hideandseek.stop(match)
            }
            break;
        case Match.STATE_CANCELED:
            await Match.MODEL.findOneAndUpdate(
                { _id: match._id, state: { $in: [Match.STATE_CREATED, Match.STATE_RUNNING] } },
                { state: Match.STATE_CANCELED },
            );
            break;
        default:
        }
    } catch (err) {
        ctx.throw(500, err);
    }
    ctx.status = 200;
}

async function subscribe(ctx, next) {
    // push to the websocket ?
    const { code } = ctx.params;
    const { username } = ctx.state.user;
    const user = await User.findOne({ username });
    const match = await Match.MODEL.findOne({ code });
    if (match == null) { ctx.throw(400, { error: 'Not a valid code!' }); }
    if (match.players.findIndex((p) => p.name === user.username) !== -1) { ctx.throw(400, { error: 'User already subscribed!' }); }

    match.players.push({ name: user.username, color: '125, 125, 0', score: '0' });// todo check disponibolity of the colors
    match.save();
    ctx.body = match; // returns a match
    ctx.status = 200;
}

async function unsubscribe(ctx, next) {
    const { code } = ctx.params;
    const { username } = ctx.state.user;
    const user = await User.findOne({ username });
    const match = await Match.MODEL.findOne({ code });
    if (match == null) { ctx.throw(400, { error: 'Not a valid code' }); }

    const playerIndex = match.players.findIndex((p) => p.name === user.username);
    if (playerIndex === -1) { ctx.throw(400, { error: 'Player not found!' }); }

    match.players.splice(playerIndex, 1);
    match.save();
    ctx.status = 200;
}

module.exports = {
    findAll,
    find,
    updatePlayers,
    changeStatus,
    subscribe,
    unsubscribe,
};
