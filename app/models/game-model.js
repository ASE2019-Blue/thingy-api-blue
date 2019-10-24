// Special model: Not persisted in database

const TAP_GAME = 'tap-game';
const HIDE_AND_SEEK = 'hide-and-seek';
const GAME_KEYS = [TAP_GAME, HIDE_AND_SEEK];

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
];

module.exports = {
    TAP_GAME, HIDE_AND_SEEK, GAME_KEYS, GAMES
};