const mongoose = require('mongoose');

const HighScoreSchema = new mongoose.Schema({
    gameKey: {
        type: String,
        required: true,
    },
    match: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Match',
        required: true,
    },
    user: {
        type: String,
        ref: 'User',
        required: true,
    },
    score: {
        type: Number,
        required: true,
    },
});

module.exports = mongoose.model('HighScore', HighScoreSchema);
