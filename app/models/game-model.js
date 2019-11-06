// Special model: Not persisted in database

const TAP_GAME = 'tap-game';
const HIDE_AND_SEEK = 'hide-and-seek';
const DEMO = 'demo';
const GAME_KEYS = [TAP_GAME, HIDE_AND_SEEK, DEMO];

const GAMES = [
    {
        key: TAP_GAME,
        title: 'Tap Game',
        description: 'Description of the game «Tap Game»',
        icon: 'game'
    },
    {
        key: HIDE_AND_SEEK,
        title: 'Hide and seek',
        description: 'Description of the game «Hide and seek»',
        icon: 'game'
    },
    {
        key: DEMO,
        title: 'Demo 1',
        description: 'This is a demo for Sprint 1',
        icon: 'game'
    },
];

module.exports = {
    TAP_GAME, HIDE_AND_SEEK, DEMO, GAME_KEYS, GAMES
};