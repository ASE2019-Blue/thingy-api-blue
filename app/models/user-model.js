const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
    {
        // _id: {
        //     type: String,
        // },
        username: {
            type: String,
            unique: true,
            required: true,
        },
        hash: {
            type: String,
            required: true,
        },
        firstName: {
            type: String,
        },
        lastName: {
            type: String,
        },
        favoriteThingy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Thingy',
        },
    }, {
        timestamps: true,
    },
);

module.exports = mongoose.model('User', UserSchema);
