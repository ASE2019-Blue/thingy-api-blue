const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
        title: {
            type: String,
            required: true
        },
    }, {
        timestamps: true
});

module.exports = mongoose.model('Game', GameSchema);
