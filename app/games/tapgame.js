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
}


module.exports = {
    start
};
