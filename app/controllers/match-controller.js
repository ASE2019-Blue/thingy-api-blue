const Game = require('../models/game-model');
const Match = require('../models/match-model');
const User = require('../models/user-model');
const Utilities = require('../services/utility-service');
const Tapgame = require('../games/tapgame');
const Wss = require('../websocket');

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
    if (Match.MATCH_STATES === Match.STATE_CREATED) ctx.throw(400, 'Canot change to created state');

    const match = await Match.MODEL.findOne({ _id: matchId }).populate('thingys');
    if (match === null || match === undefined) ctx.throw(404, { error: 'Match not found' });
    const { gameKey } = match;
    const { code } = match;
    try {
        switch (state) {
        case Match.STATE_RUNNING:
            // For each game add a test on gameKey and launch the corresponding one
            // Maybe here, we could make a promise and wait for the game to end and recolt results here and send it back to the user
            if (gameKey === Game.TAP_GAME) {
                // send start message to everyone in the match
                try {
                    const startMsg = { msg: 'start' };
                    Wss.clients.forEach((client) => {
                        if (client.matchCode === code) {
                            client.send(JSON.stringify(startMsg));
                        }
                    });
                } catch (err) {
                    console.log(err);
                }
                Tapgame.start(match);
            } else if (gameKey === Game.HIDE_AND_SEEK) {
                // Hideandseek.start(match)
            }
            break;
        case Match.STATE_FINISHED:
            // For each game add a test on gameKey and launch the corresponding one
            // Maybe here, we could make a promise and wait for the game to end and recolt results here and send it back to the user
            if (gameKey === Game.TAP_GAME) {
                // send stop message to everyone in the match
                try {
                    const stopMsg = { msg: 'stop' };
                    Wss.clients.forEach((client) => {
                        if (client.matchCode === code) {
                            client.send(JSON.stringify(stopMsg));
                        }
                    });
                } catch (err) {
                    console.log(err);
                }
                Tapgame.stop(match);
            } else if (gameKey === Game.HIDE_AND_SEEK) {
                // Hideandseek.stop(match)
            }
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
    if (match == null) { ctx.throw(400, { error: 'Not a valid code!' }); }
    if (match.players.findIndex((p) => p.name === user.username) !== -1) { ctx.throw(400, { error: 'User already subscribed!' }); }

    // select an available color and remove it from the array of colors still available
    const { colors } = match;
    const choosenColor = colors.pop();
    match.colors = colors;

    // send join message to everyone in the match and move the joining player to the match on the websocket server
    try {
        const joinMsg = { msg: 'join', player: user.username, color: choosenColor };
        Wss.clients.forEach((client) => {
            if (client._id === user.username) {
                client.matchCode = code;
            }
            if (client.matchCode === code) {
                client.send(JSON.stringify(joinMsg));
            }
        });
    } catch (err) {
        console.log(err);
    }

    match.players.push({ name: user.username, color: choosenColor, score: '0' });
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

    // send quit message to everyone in the match and remove the joining player from the match on the websocket server
    try {
        const quitMsg = { msg: 'quit', player: user.username };
        Wss.clients.forEach((client) => {
            if (client._id === user.username) {
                client.matchCode = 0;
            }
            if (client.matchCode === code) {
                client.send(JSON.stringify(quitMsg));
            }
        });
    } catch (err) {
        console.log(err);
    }

    const playerIndex = match.players.findIndex((p) => p.name === user.username);
    if (playerIndex === -1) { ctx.throw(400, { error: 'Player not found!' }); }
    const colorAvailableAgain = match.player[playerIndex].color;
    match.colors.push(colorAvailableAgain);
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
