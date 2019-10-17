const mongoose = require('mongoose');

const ThingySchema = new mongoose.Schema({
        macAddress: {
            type: String,
            required: true
        },
    }, {
        timestamps: true
});

module.exports = mongoose.model('Thingy', ThingySchema);
