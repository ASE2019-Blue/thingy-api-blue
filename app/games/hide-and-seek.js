const Wss = require('../websocket');

async function createTeams(match) {
    match.config.hiders = match.players.slice(0, Math.floor(match.players.length / 2));
    match.config.seekers = match.players.slice(Math.floor(match.players.length / 2));
    match.markModified('config'); // so that save recognizes the inner change
    await match.save();
}

async function createTeamsDebug(match, ownerUsername) {
    const hiders = [];
    const seekers = [];
    match.players.forEach((user) => {
        if (user.name !== ownerUsername) { hiders.push(user); } else { seekers.push(user); }
    });
    match.config.hiders = hiders;
    match.config.seekers = seekers;
    match.markModified('config'); // so that save recognizes the inner change
    await match.save();
}

const requestedUpdateIndex = {};
const intervals = {};
async function start(match) {
    const { gameTime } = match.config;
    let requestTime = gameTime / 6;
    let nextRequest = requestTime;
    let timer = 0;
    let nextRequestId = 0;
    requestedUpdateIndex[match.code] = nextRequestId;
    setTimeout(() => {
        Wss.hideAndSeekStartTimer(match.code, gameTime);
        const interval = setInterval(async () => {
            timer += 1;
            if (timer >= gameTime) {
                clearInterval(intervals[match.code]);
                delete intervals[match.code];
                endMatch(match, false);
            } else if (timer >= nextRequest) {
                requestTime *= 0.85;
                if (requestTime < 1) requestTime = 1;
                nextRequest += requestTime;
                Wss.hideAndSeekRequestLocation(match.code, nextRequestId);
                nextRequestId += 1;
            }
        }, 1 * 1000);
        intervals[match.code] = interval;
    }, 5 * 1000);
}

function isValidLocationRequestResponse(matchCode, requestId) {
    if (requestedUpdateIndex[matchCode] <= requestId) {
        requestedUpdateIndex[matchCode] += 1;
        return true;
    }
    return false;
}

async function endMatch(match, catched) {
    // TODO: add statistics
    Wss.stopBroadcast(match.code);
}

async function stop(match) {
    clearInterval(intervals[match.code]);
    delete intervals[match.code];
    Wss.stopBroadcast(match.code);
}

module.exports = {
    start, stop, createTeams, createTeamsDebug, isValidLocationRequestResponse,
};
