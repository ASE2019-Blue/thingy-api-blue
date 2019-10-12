const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
        game: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Game',
            required: true
        },
    }, {
        timestamps: true
});

module.exports = mongoose.model('Match', MatchSchema);
