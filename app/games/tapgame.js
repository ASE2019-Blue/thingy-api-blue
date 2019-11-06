const mqtt = require('mqtt');
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


	const client  = mqtt.connect({
    	host: process.env.MQTT_BROKER_HOST,
    	port: process.env.MQTT_BROKER_PORT,
    	username: process.env.MQTT_BROKER_USER,
    	password: process.env.MQTT_BROKER_PASSWORD
	});
	console.log('connected to mqtt broker');

	//For development purpose only: take the thingy uri from the web bluetooth API
	let thingyURI = 'y1GdfbjQ0vc5TFjbI0mQAg';

	//As a test change led color to red
	client.publish(
		//topic
		thingyURI + '/' + configThingy.config.services.userInterface
		+ '/' + configThingy.config.characteristics.led.UUID + '/Set',
		//message
		configThingy.colors.red
	);


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
	console.log(randomColors);
	//shuffle the array
	shuffle(randomColors);
	console.log(randomColors);
	//when the color is randomly selected, remove it from the array
	//-----------------END OF CONFIG------------------------


	//-----------------GAME START HERE----------------------
	//Wait (3+2)=5 seconds to let people get ready
	await Utilities.sleep(3000);

	do{
		await Utilities.sleep(2000);
		//A timer begins as soon as the color is displayed (this timer could be seen on the client?)
		let choosenColor = randomColors.pop();
		client.publish(
			//topic
			thingyURI + '/' + configThingy.config.services.userInterface
			+ '/' + configThingy.config.characteristics.led.UUID + '/Set',
			//message
			choosenColor
		);
		const time = process.hrtime();

//HERE NEED REVIEW ON HOW WE CAN CODE TO WAIT FOR A BUTTON TO BE PUSHED BEFORE CONTINUING AND TO CHECK POINTS AND TIMER
		//We then wait someone to push the button on the thingy
		await client.on(configThingy.config.characteristics.button.UUID, async function(){
			//we create points related with the timer and add it to the user who push the button
			//calcul for points : 100000 divided by time taken to push the button in milliseconds
			const diff = process.hrtime(time);
			const timeInMilliseconds = (diff[0] * NS_PER_SEC + diff[1])  * MS_PER_NS;
			results.set(choosenColor, results.get(choosenColor) + (100000 / timeInMilliseconds ));
		})
	
	//Check if the array still have colors inside it
			//If it still have some : Wait 2 seconds (random colors appearing on the led during these 2 seconds ?), then change the color with a random one from the array
			//If it does not have color, end the game
	} while (randomColors.length > 0);
	
	//change state of the match
	await Match.findOneAndUpdate({ _id: match._id, state: Match.STATE_RUNNING}, { state: Match.STATE_FINISHED });

	//TODO : attribute each color points to the user who have it
	console.log(results)
	//-----------------GAME END HERE----------------------
}


module.exports = {
    start
};
