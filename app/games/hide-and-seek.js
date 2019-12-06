const Wss = require('../websocket');

async function createTeams(match) {
    match.config['hiders'] = match.players.slice(0, Math.floor(match.players.length/2));
    match.config['seekers'] = match.players.slice(Math.floor(match.players.length/2));
    match.markModified('config'); // so that save recognizes the inner change
    await match.save();
}

async function start(match) {
    Wss.hideAndSeek
}

async function stop(match) {

}

module.exports = {
    start, stop, createTeams
};