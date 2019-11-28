const mongoose = require('mongoose');

const ThingySchema = new mongoose.Schema({
    macAddress: {
        type: String,
        required: true,
    },
    lockedForUser: {
        type: String,
        ref: 'User',
    },
    available: {
        type: Boolean,
        required: true,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Thingy', ThingySchema);
