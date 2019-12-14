const Wss = require('../websocket');
const HighScore = require('../models/highscore-model');

async function createTeams(match) {
    const users = [];
    const players = [];
    const hiders = [];
    const seekers = [];

    // Divide players in players with user account and players without
    match.players.forEach((player) => {
        if (player.user === null) {
            players.push(player);
        } else {
            users.push(player);
        }
    });

    // Cannot play if not two real users
    if (users.length < 2) {
        return false;
    }

    let divider = 0;
    users.forEach((player) => {
        if (divider % 2) {
            hiders.push(player);
        } else {
            seekers.push(player);
        }
        divider += 1;
    });
    players.forEach((player) => {
        if (divider % 2) {
            hiders.push(player);
        } else {
            seekers.push(player);
        }
        divider += 1;
    });

    match.config.hiders = hiders;
    match.config.seekers = seekers;
    match.markModified('config'); // so that save recognizes the inner change
    await match.save();

    return true;
}

const requestedUpdateIndex = {};
const intervals = {};
async function start(match) {
    // Save start time
    match.config.startTime = Date.now();
    match.markModified('config'); // so that save recognizes the inner change
    match.save();

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
                await endMatch(match);
            } else if (timer >= nextRequest) {
                requestTime *= 0.85;
                if (requestTime < 1) requestTime = 1;
                nextRequest += requestTime;
                Wss.hideAndSeekRequestLocation(match.code, nextRequestId);
                nextRequestId += 1;
            }
        }, 1000);
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

async function endMatch(match) {
    await createHighscoreRecords(match);
    Wss.stopBroadcast(match.code);
}

async function stop(match) {
    clearInterval(intervals[match.code]);
    delete intervals[match.code];
    await createHighscoreRecords(match);
    Wss.stopBroadcast(match.code);
}

async function createHighscoreRecords(match) {
    const { startTime } = match.config;
    const endTime = Date.now();
    const timeDifference = Math.floor((endTime - startTime) / 1000);
    const percentageDifference = 1 - timeDifference / match.config.gameTime;
    const maxPoints = 200;

    let pointsForWinner = Math.floor(maxPoints * percentageDifference);
    pointsForWinner = pointsForWinner > maxPoints ? maxPoints : pointsForWinner;
    pointsForWinner = pointsForWinner < 0 ? 0 : pointsForWinner;

    const highScoreRecords = [];

    if (match.config.catched) {
        match.config.seekers.forEach((player) => {
            if (player.user === null || player.user === undefined) {
                return;
            }

            highScoreRecords.push(prepareHighscoreRecord(match, player, pointsForWinner));
        });
    } else {
        match.config.hiders.forEach((player) => {
            if (player.user === null || player.user === undefined) {
                return;
            }

            highScoreRecords.push(prepareHighscoreRecord(match, player, pointsForWinner));
        });
    }
    await HighScore.insertMany(highScoreRecords);
}

function prepareHighscoreRecord(match, player, score) {
    const highScoreRecord = new HighScore();
    highScoreRecord.gameKey = match.gameKey;
    highScoreRecord.match = match;
    highScoreRecord.user = player.user;
    highScoreRecord.score = parseInt(score, 10);
    return highScoreRecord;
}

module.exports = {
    start, stop, createTeams, isValidLocationRequestResponse,
};
