const mongoose = require('mongoose');
const Game = require('../models/game-model');

const STATE_CREATED = 'created';
const STATE_RUNNING = 'running';
const STATE_FINISHED = 'finished';
const STATE_CANCELED = 'canceled';

const MATCH_STATES = [STATE_CREATED, STATE_RUNNING, STATE_FINISHED, STATE_CANCELED];

const MatchSchema = new mongoose.Schema({
    gameKey: {
        type: String,
        required: true,
        enum: Game.GAME_KEYS,
    },
    config: {
        type: Object,
        required: true,
    },
    players: [{
        name: { type: String },
        color: { type: String },
        score: { type: String },
    },
        // ref: 'User',
        // required: true,
    ],
    code: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
        enum: MATCH_STATES,
        default: STATE_CREATED,
    },
    thingys: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Thingy',
        required: true,
    }],
    owner: {
        type: String,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
});

const MODEL = mongoose.model('Match', MatchSchema);

module.exports = {
    MODEL, MATCH_STATES, STATE_CREATED, STATE_RUNNING, STATE_FINISHED, STATE_CANCELED,
};
