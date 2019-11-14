const mqtt = require('../mqtt');
const Match = require('../models/match-model');
const Utilities = require('../services/utility-service');
const configThingy = require('../config-thingy');
const IO = require('../index');

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

    // For development purpose only: hardcoded MAC
    const thingyURI = match.thingys[0].macAddress;
    const buttonSubscription = `${thingyURI}/${configThingy.config.services.userInterface}/${configThingy.config.characteristics.button}`;
    const ledPublish = `${thingyURI}/${configThingy.config.services.userInterface}/${configThingy.config.characteristics.led}/Set`;

    
    // array of players
    let players = match.players;
    // array of selected colors by the client
    const colors = new Array(players.length);
    for(let i = players.length - 1; i >= 0; i--){
        colors[i] = '1,'+players[i].color;
        players[i].color = colors[i];
    }

    const pointsPlayer = new Map();
    for (var i = players.length - 1; i >= 0; i--) {
        pointsPlayer.set(players[i].name, 0);
    }

    const playerColor = new Map();
    for (var i = players.length - 1; i >= 0; i--) {
        playerColor.set(players[i].color, players[i].name);
    }

    // number of turns
    let nbTurns = match.config.numberOfRounds;

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
    client.publish(ledPublish, configThingy.colors.none);
    // Wait 5 seconds to let people get ready
    await Utilities.sleep(5000);

    let _waiting = false;
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
            pointsPlayer.set(playerName, pointsPlayer.get(playerName) + Math.round(100000 / timeInMilliseconds));

            /*
            try{
                //websocket: notification to clients connected to the match with actual points of the player
                IO.to(match._id).emit('points', {player: playerName, points: pointsPlayer.get(playerName)});
            }catch(err){
                console.log(err);
            }
            */
            

            // END
            if (randomColors.length === 0) {
                client.unsubscribe(buttonSubscription);
                console.log(pointsPlayer);
                // change state of the match
                await Match.MODEL.findOneAndUpdate({ _id: match._id, state: Match.STATE_RUNNING }, { state: Match.STATE_FINISHED });
                client.publish(ledPublish, configThingy.colors.favorite);
                // -----------------GAME ENDS HERE----------------------
            } else {
                client.publish(ledPublish, configThingy.colors.none);
                await Utilities.sleep(2000);
                // when the color is randomly selected, remove it from the array
                choosenColor = randomColors.pop();
                client.publish(ledPublish, choosenColor);
                _time = process.hrtime();
                _waiting = true;
            }
        }
    });

    // when the color is randomly selected, remove it from the array
    let choosenColor = randomColors.pop();
    client.publish(ledPublish, choosenColor);
    _waiting = true;
    let _time = process.hrtime();
}

async function stop(match) {
    const thingyURI = match.thingys[0].macAddress;
    const buttonSubscription = `${thingyURI}/${configThingy.config.services.userInterface}/${configThingy.config.characteristics.button}`;
    const ledPublish = `${thingyURI}/${configThingy.config.services.userInterface}/${configThingy.config.characteristics.led}/Set`;
    const { client } = mqtt;
    client.unsubscribe(buttonSubscription);
    await Match.MODEL.findOneAndUpdate({ _id: match._id, state: Match.STATE_RUNNING }, { state: Match.STATE_FINISHED });
    // To be sure to publish after last change of change colour
    await Utilities.sleep(2000);
    client.publish(ledPublish, configThingy.colors.favorite);
}

module.exports = {
    start, stop,
};
