const Match = require('../models/match-model');
const Utilities = require('../services/utility-service');

/**
 * Start a match.
 *
 * @param Instance of Match
 * @returns {Promise<void>}
 */
async function start(match){
	//TODO : Game logic implementation
	console.log(match);

	//thingys
	//let thingy = match.thingys[0];

	//array of selected colors by the client
	//let colors = match.config.colors;
	//array of players
	//number of turns

	//Game logic :
	//The thingy wait 5 seconds and choose a random color and display it on the led
		//To choose the color:
			//create a fair array of color with the ones given in the config
			//multiply each color by the number of turn
			//shuffle the array
			//when the color is randomly selected, remove it from the array

	//A timer begins as soon as the color is displayed (this timer could be seen on the client?)
	//We then wait someone to push the button on the thingy
		//we create points related with the timer and add it to the user who push the button

	//Check if the array still have colors inside it
		//If it still have some : Wait 5 seconds (random colors appearing on the led during these 5 seconds ?), then change the color with a random one from the array
		//If it does not have color, end the game

}


module.exports = {
    start
};
