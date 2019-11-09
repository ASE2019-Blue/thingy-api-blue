const mqtt = require('../mqtt');
const Match = require('../models/match-model');
const Utilities = require('../services/utility-service');
//const client = require('../mqtt');
const configThingy = require('../configThingy');


const NS_PER_SEC = 1e9;
const MS_PER_NS = 1e-6;

/**
 * Fisher-Yates shuffle algorithm
 * Shuffles array
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
    var j, x, i;
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
 * @param Instance of Match
 * @returns {Promise<void>}
 */
async function start(match){
	//-----------------CONFIG------------------------
	//NEEDED IN CONFIG OF MATCH : 
		//array of choosen color in format RGB for thingy ex : '1.255.0.0'
		//array of thingy on which we can retrieve the thingyURI
		//map of players with their color so we can attribute points not to color but to player at the end
		//number of turn

	const client = mqtt.client;

	//For development purpose only: hardcoded MAC
	// let thingyURI = match.config.thingys[0].macAddress;
	let thingyURI = 'e3:af:9b:f4:a1:c7';
	const buttonSubscription = thingyURI + '/' + configThingy.config.services.userInterface + '/' + configThingy.config.characteristics.button;
	const ledPublish = thingyURI + '/' + configThingy.config.services.userInterface + '/' + configThingy.config.characteristics.led + '/Set';

	//array of selected colors by the client
	//const colors = match.config.colors;
	const colors = [configThingy.colors.red, configThingy.colors.blue, configThingy.colors.green];
	let results = new Map();
	for (var i = colors.length - 1; i >= 0; i--) {
		results.set(colors[i], 0);
	}

	//array of players
	//let players = match.config.players;

	//number of turns
	//let nbTurns = match.config.turns;
	let nbTurns = 3;

	//create a fair array of color with the ones given in the config
	//multiply each color by the number of turn
	let randomColors = [];
	for (var i = nbTurns - 1; i >= 0; i--) {
		randomColors.push(...colors);
	}
	//shuffle the array
	shuffle(randomColors);

	await Match.findOneAndUpdate({ _id: match._id, state: Match.STATE_CREATED}, { state: Match.STATE_RUNNING });
	//-----------------END OF CONFIG------------------------


	//-----------------GAME START HERE----------------------
	client.publish(ledPublish, configThingy.colors.none);
	//Wait 5 seconds to let people get ready
	await Utilities.sleep(5000);

	var _waiting = false;
	client.subscribe(buttonSubscription)

	//We then wait someone to push the button on the thingy
	client.on('message', async function (topic, message) {

		if(topic==buttonSubscription && message == 'true' && _waiting){
			_waiting = false;
			//we create points related with the timer and add it to the user who push the button
			//calcul for points : 100000 divided by time taken to push the button in milliseconds
			const diff = process.hrtime(_time);
			const timeInMilliseconds = (diff[0] * NS_PER_SEC + diff[1])  * MS_PER_NS;
			results.set(choosenColor, results.get(choosenColor) + (100000 / timeInMilliseconds ));

			//END
			if(randomColors.length == 0) {
				client.unsubscribe(buttonSubscription);
				//TODO : attribute each color points to the user who have it
				console.log(results);
				//change state of the match
				await Match.findOneAndUpdate({ _id: match._id, state: Match.STATE_RUNNING}, { state: Match.STATE_FINISHED });
				client.publish(ledPublish, configThingy.colors.favorite);
				//-----------------GAME ENDS HERE----------------------
			} else {
				client.publish(ledPublish, configThingy.colors.none);
				await Utilities.sleep(2000);
				//when the color is randomly selected, remove it from the array
				choosenColor = randomColors.pop();
				client.publish(ledPublish, choosenColor);
				_time = process.hrtime();
				_waiting = true;
			}
		}
	});

	//when the color is randomly selected, remove it from the array
	let choosenColor = randomColors.pop();
	client.publish(ledPublish, choosenColor);
	_waiting = true;
	var _time = process.hrtime();
}

async function stop(match) {
	// let thingyURI = match.config.thingys[0].macAddress;
	let thingyURI = 'e3:af:9b:f4:a1:c7';
	const buttonSubscription = thingyURI + '/' + configThingy.config.services.userInterface + '/' + configThingy.config.characteristics.button;
	const ledPublish = thingyURI + '/' + configThingy.config.services.userInterface + '/' + configThingy.config.characteristics.led + '/Set';
	const client = mqtt.client;
	client.unsubscribe(buttonSubscription);
	await Match.findOneAndUpdate({ _id: match._id, state: Match.STATE_RUNNING}, { state: Match.STATE_FINISHED });
	// To be sure to publish after last change of change colour
	await Utilities.sleep(2000);
	client.publish(ledPublish, configThingy.colors.favorite);
}

module.exports = {
    start, stop
};
