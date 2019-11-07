const mongoose = require('mongoose');

const ThingySchema = new mongoose.Schema({
        macAddress: {
            type: String,
            required: true
        },
        lockedForUser: {
            type: String,
            ref: 'User',
        },
    }, {
        timestamps: true
});

module.exports = mongoose.model('Thingy', ThingySchema);
