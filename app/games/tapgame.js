const mqtt = require('../mqtt');
const Match = require('../models/match-model');
const HighScore = require('../models/highscore-model');
const Utilities = require('../services/utility-service');
const configThingy = require('../config-thingy');
const Wss = require('../websocket');

const NS_PER_SEC = 1e9;
const MS_PER_NS = 1e-6;

/**
 * Fisher-Yates shuffle algorithm
 * Shuffles array
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
    let j; let x; let i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

/**
 * Start a match.
 *
 * @param match Instance of Match
 * @returns {Promise<void>}
 */
async function start(match) {
    // -----------------CONFIG------------------------
    // NEEDED IN CONFIG OF MATCH :
    // array of choosen color in format RGB for thingy ex : '1.255.0.0'
    // array of thingy on which we can retrieve the thingyURI
    // map of players with their color so we can attribute points not to color but to player at the end
    // number of turn

    const { client } = mqtt;

    const thingyURI = match.thingys[0].macAddress;
    const buttonSubscription = `${thingyURI}/${configThingy.config.services.userInterface}/${configThingy.config.characteristics.button}`;
    const ledPublish = `${thingyURI}/${configThingy.config.services.userInterface}/${configThingy.config.characteristics.led}/Set`;


    // array of players
    const { players } = match;
    // array of selected colors by the client
    const colors = new Array(players.length);
    for (let i = players.length - 1; i >= 0; i--) {
        colors[i] = `1,${players[i].color}`;
        players[i].color = colors[i];
    }

    const pointsPlayer = new Map();
    for (let i = players.length - 1; i >= 0; i--) {
        pointsPlayer.set(players[i].name, 0);
    }

    const playerColor = new Map();
    for (let i = players.length - 1; i >= 0; i--) {
        playerColor.set(players[i].color, players[i].name);
    }

    // number of turns
    const nbTurns = match.config.numberOfRounds;

    // create a fair array of color with the ones given in the config
    // multiply each color by the number of turn
    const randomColors = [];
    for (let i = nbTurns - 1; i >= 0; i--) {
        randomColors.push(...colors);
    }
    // shuffle the array
    shuffle(randomColors);

    await Match.MODEL.findOneAndUpdate({ _id: match._id, state: Match.STATE_CREATED }, { state: Match.STATE_RUNNING });
    // -----------------END OF CONFIG------------------------


    // -----------------GAME START HERE----------------------
    client.publish(ledPublish, `1,${configThingy.systemColors.none}`);
    // Wait 5 seconds to let people get ready
    await Utilities.sleep(5000);

    let _waiting = false;
    let choosenColor = randomColors.pop();
    let _time = process.hrtime();
    client.subscribe(buttonSubscription);

    // We then wait someone to push the button on the thingy
    client.on('message', async (topic, message) => {
        if (topic === buttonSubscription && message.toString() === 'true' && _waiting) {
            _waiting = false;
            // we create points related with the timer and add it to the user who push the button
            // calcul for points : 100000 divided by time taken to push the button in milliseconds
            const diff = process.hrtime(_time);
            const timeInMilliseconds = (diff[0] * NS_PER_SEC + diff[1]) * MS_PER_NS;
            const playerName = playerColor.get(choosenColor);
            // set the points
            pointsPlayer.set(playerName, pointsPlayer.get(playerName) + Math.round(100000 / timeInMilliseconds));
            match.players.forEach((player) => {
                if (player.name === playerName) {
                    player.score = pointsPlayer.get(playerName);
                }
            });
            await Match.MODEL.findOneAndUpdate({ _id: match._id }, { players: match.players });

            // Notify the points to the clients
            Wss.tapGamePointsNotification(playerName, pointsPlayer.get(playerName), match.code);

            // END
            if (randomColors.length === 0) {
                client.unsubscribe(buttonSubscription);
                console.log(pointsPlayer);
                // change state of the match
                await Match.MODEL.findOneAndUpdate({ _id: match._id, state: Match.STATE_RUNNING }, { state: Match.STATE_FINISHED });
                Wss.stopBroadcast(match.code);
                client.publish(ledPublish, `1,${configThingy.systemColors.idle}`);
                // -----------------GAME ENDS HERE----------------------
            } else {
                client.publish(ledPublish, `1,${configThingy.systemColors.none}`);
                await Utilities.sleep(2000);
                // when the color is randomly selected, remove it from the array
                choosenColor = randomColors.pop();
                client.publish(ledPublish, `1,${choosenColor}`);
                _time = process.hrtime();
                _waiting = true;
            }
        }
    });

    // when the color is randomly selected, remove it from the array
    client.publish(ledPublish, `1,${choosenColor}`);
    _waiting = true;
    _time = process.hrtime();
}

async function stop(match) {
    const thingyURI = match.thingys[0].macAddress;
    const buttonSubscription = `${thingyURI}/${configThingy.config.services.userInterface}/${configThingy.config.characteristics.button}`;
    const ledPublish = `${thingyURI}/${configThingy.config.services.userInterface}/${configThingy.config.characteristics.led}/Set`;
    const { client } = mqtt;
    client.unsubscribe(buttonSubscription);
    await Match.MODEL.findOneAndUpdate(
        { _id: match._id, state: { $in: [Match.STATE_CREATED, Match.STATE_RUNNING] } },
        { state: Match.STATE_FINISHED },
    );

    const highScoreRecords = [];
    match.players.forEach((player) => {
        // Store highscore only for players with user account
        if (player.user === null || player.user === undefined) {
            return;
        }

        const highScoreRecord = new HighScore();
        highScoreRecord.gameKey = match.gameKey;
        highScoreRecord.match = match;
        highScoreRecord.user = player.user;
        highScoreRecord.score = parseInt(player.score, 10);
        highScoreRecords.push(highScoreRecord);
    });
    await HighScore.insertMany(highScoreRecords);

    // To be sure to publish after last change of change colour
    await Utilities.sleep(2000);
    client.publish(ledPublish, `1,${configThingy.systemColors.idle}`);
}

module.exports = {
    start, stop,
};
