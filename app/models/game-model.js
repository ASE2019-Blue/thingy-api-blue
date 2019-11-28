// Special model: Not persisted in database

const TAP_GAME = 'tap-game';
const HIDE_AND_SEEK = 'hide-and-seek';
const DEMO = 'demo';
const GAME_KEYS = [TAP_GAME, HIDE_AND_SEEK, DEMO];

const GAMES = [
    {
        key: TAP_GAME,
        title: 'Tap Game',
        description: 'This is an interactive game to test your reaction time and for having fun with your '
        + 'friends. The goal is to tap the THINGY as fast as possible once it is your turn.\n\nFor this purpose, '
        + 'a colour is assigned to each player. The players then sit or stand (or lay) around the THINGY and as '
        + 'soon as a colour appears, the respective player must hurry and tap the THINGY. The faster he is, the '
        + 'more points he receives.',
        icon: 'game',
    },
    {
        key: HIDE_AND_SEEK,
        title: 'Hide and seek',
        description: 'This is the ultimate team hide and seek. The players are grouped into two teams, a '
        + '"Hiders" and a "Seakers". As the name states, the goal for the "Hiders" is to find the "Seakers" '
        + 'and the "Seakers" try to avoid this.\n\nThe "Hiders" receive an advance of 5min to hide. Once this '
        + 'is done, the "Seakers" receive the location of the "Hiders". This location is updated in an '
        + 'increasing frequency (from once all 5min to all 30s). Once the "Seakers" found the "Hiders" and '
        + 'managed to double-tap on their THINGY, they win. On the other hand, if the game limit of 30min is '
        + 'exceeded, the "Hiders" win.',
        icon: 'game',
    },
    {
        key: DEMO,
        title: 'Demo',
        description: 'This is a demo for for the first version of the Thingy project.',
        icon: 'game',
    },
];

module.exports = {
    TAP_GAME, HIDE_AND_SEEK, DEMO, GAME_KEYS, GAMES,
};
