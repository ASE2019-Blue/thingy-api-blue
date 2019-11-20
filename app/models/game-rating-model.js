const mongoose = require('mongoose');
const Game = require('../models/game-model');

const GameRatingSchema = new mongoose.Schema({
    gameKey: {
        type: String,
        required: true,
        enum: Game.GAME_KEYS,
    },
    username: {
        type: String,
        ref: 'User',
        required: true,
    },
    rating: {
        type: Number,
        required: true,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Game-rating', GameRatingSchema);
