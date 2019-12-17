const Game = require('../models/game-model');
const Match = require('../models/match-model');
const User = require('../models/user-model');
const Utilities = require('../services/utility-service');
const Tapgame = require('../games/tapgame');
const Hideandseek = require('../games/hide-and-seek');
const Wss = require('../websocket');
const ThingyService = require('../services/thingy-service');

const MATCH_FIELDS_WITHOUT_THINGY = '-_thingys';

/**
 * Find all matches.
 *
 * @param ctx
 * @param next
 * @returns {Promise<void>}
 */
async function findAll(ctx, next) {
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
    const { matchId } = ctx.params;
    const match = await Match.MODEL.findOne({ _id: matchId });
    if (match === null || match === undefined) ctx.throw(404, { error: 'Match not found' });
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
    if (match === null || match === undefined) ctx.throw(404, { error: 'Match not found' });
    if (match.state === Match.STATE_FINISHED) ctx.throw(404, { error: 'Cannot change state of a finished match' });
    if (match.state === Match.STATE_CANCELED) ctx.throw(404, { error: 'Cannot change state of a canceled match' });

    const { gameKey } = match;
    const { code } = match;

    try {
        switch (state) {
        case Match.STATE_CANCELLED:
            // send cancelled message to everyone in the match
            Wss.cancelBroadcast(code);
            // For each game add a test on gameKey and launch the corresponding one
            if (gameKey === Game.TAP_GAME) {
                await Match.MODEL.findOneAndUpdate({ _id: matchId, state: Match.STATE_CREATED }, { state: Match.STATE_CANCELLED });
            } else if (gameKey === Game.HIDE_AND_SEEK) {
                // Hideandseek
            }
            await ThingyService.unlock(match.thingys[0]._id, match.owner);
            break;
        case Match.STATE_RUNNING:
            if (gameKey === Game.HIDE_AND_SEEK) {
                // TODO: remove (only for debug)
                // await Hideandseek.createTeamsDebug(match,ctx.state.user.username);
                const couldCreateTeams = await Hideandseek.createTeams(match);
                if (!couldCreateTeams) {
                    ctx.throw(400, 'Need at least two users');
                }
            }
            // send start message to everyone in the match
            Wss.startBroadcast(code);
            // For each game add a test on gameKey and launch the corresponding one
            if (gameKey === Game.TAP_GAME) {
                Tapgame.start(match);
            } else if (gameKey === Game.HIDE_AND_SEEK) {
                Hideandseek.start(match);
            }
            break;
        case Match.STATE_FINISHED:
            // send stop message to everyone in the match
            Wss.stopBroadcast(code);
            // For each game add a test on gameKey and launch the corresponding one
            if (gameKey === Game.TAP_GAME) {
                Tapgame.stop(match);
            } else if (gameKey === Game.HIDE_AND_SEEK) {
                Hideandseek.stop(match);
            }
            await ThingyService.unlock(match.thingys[0]._id, match.owner);
            break;
        case Match.STATE_CANCELED:
            await Match.MODEL.findOneAndUpdate(
                { _id: match._id, state: { $in: [Match.STATE_CREATED, Match.STATE_RUNNING] } },
                { state: Match.STATE_CANCELED },
            );
            await ThingyService.unlock(match.thingys[0]._id, match.owner);
            break;
        default:
        }
    } catch (err) {
        ctx.throw(500, err);
    }
    ctx.status = 200;
}

async function subscribe(ctx, next) {
    const { code } = ctx.params;
    const { username } = ctx.state.user;
    const user = await User.findOne({ username });
    const match = await Match.MODEL.findOne({ code });
    if (match === null || match === undefined) { ctx.throw(400, { error: 'Not a valid code!' }); }
    if (match.players.findIndex((p) => p.name === user.username) !== -1) { ctx.throw(400, { error: 'User already subscribed!' }); }

    if (match.gameKey === Game.TAP_GAME) {
        // select an available color and remove it from the array of colors still available
        const { colors } = match;
        const choosenColor = colors.pop();
        match.colors = colors;

        // send join message to everyone in the match and move the joining player to the match on the websocket server
        Wss.addPlayerToTGMatch(user.username, code, choosenColor);

        match.players.push({
            name: user.username, user: user.username, color: choosenColor, score: '0',
        });
    } else if (match.gameKey === Game.HIDE_AND_SEEK) {
        Wss.addPlayerToHASMatch(user.username, code);
        match.players.push({ name: user.username, score: '0' });
    }

    await match.save();
    ctx.body = match; // returns a match
    ctx.status = 200;
}

async function unsubscribe(ctx, next) {
    const { code } = ctx.params;
    const { username } = ctx.state.user;
    const user = await User.findOne({ username });
    const match = await Match.MODEL.findOne({ code });
    if (match === null || match === undefined) { ctx.throw(400, { error: 'Not a valid code' }); }

    // send quit message to everyone in the match and remove the joining player from the match on the websocket server
    Wss.removePlayerFromMatch(user.username, code);

    const playerIndex = match.players.findIndex((p) => p.name === user.username);
    if (playerIndex === -1) { ctx.throw(400, { error: 'Player not found!' }); }
    if (match.gameKey === Game.TAP_GAME) {
        const colorAvailableAgain = match.players[playerIndex].color;
        match.colors.push(colorAvailableAgain);
    }
    match.players.splice(playerIndex, 1);
    await match.save();
    ctx.status = 200;
}

async function changeHiderStatus(ctx, next) {
    const { code } = ctx.params;
    const { catched } = ctx.request.body;

    const match = await Match.MODEL.findOne({ code });
    if (match === null || match === undefined) { ctx.throw(400, { error: 'Not a valid code' }); }
    if (match.gameKey !== Game.HIDE_AND_SEEK) { ctx.throw(400, { error: 'Not a valid Hide and Seek code' }); }

    match.config.catched = catched;
    match.markModified('config'); // so that save recognizes the inner change
    await match.save();
    ctx.status = 200;
}

async function changeHiderLocation(ctx, next) {
    const { code } = ctx.params;
    const { latitude, longitude, requestId } = ctx.request.body;

    const match = await Match.MODEL.findOne({ code });
    if (match === null || match === undefined) { ctx.throw(400, { error: 'Not a valid code' }); }
    if (match.gameKey !== Game.HIDE_AND_SEEK) { ctx.throw(400, { error: 'Not a valid Hide and Seek code' }); }

    if (Hideandseek.isValidLocationRequestResponse(code, requestId)) {
        Wss.hideAndSeekUpdateLocation(code, latitude, longitude);
        ctx.status = 200;
    } else {
        ctx.throw(208, { error: 'Request already processed' });
    }
}

module.exports = {
    findAll,
    find,
    changeStatus,
    subscribe,
    unsubscribe,
    changeHiderStatus,
    changeHiderLocation,
};
