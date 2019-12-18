const Game = require('../models/game-model');
const HighScore = require('../models/highscore-model');

/**
 * Find the best players for each game.
 *
 * @param ctx
 * @param next
 * @returns {Promise<void>}
 */
async function findBest(ctx, next) {
    // // Create test data
    // const highScore = new HighScore();
    // highScore.gameKey = Game.TAP_GAME;
    // highScore.match = '5dd9813633803a55dd05d478';
    // highScore.user = 'tester';
    // highScore.score = 96;
    // await highScore.save();

    const highScores = {};

    highScores[Game.TAP_GAME] = {
        name: Game.TAP_GAME_TITLE,
        gameKey: Game.TAP_GAME,
        highScores: await HighScore.find({ gameKey: Game.TAP_GAME }).sort({ score: -1 }).limit(5),
    };
    highScores[Game.HIDE_AND_SEEK] = {
        name: Game.HIDE_AND_SEEK_TITLE,
        gameKey: Game.HIDE_AND_SEEK,
        highScores: await HighScore.find({ gameKey: Game.HIDE_AND_SEEK }).sort({ score: -1 }).limit(5),
    };

    ctx.body = highScores;
}

module.exports = {
    findBest,
};
