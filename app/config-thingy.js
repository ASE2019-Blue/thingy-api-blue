const config = {
    services: {
        userInterface: 'Thingy User Interface Service',
    },

    characteristics: {
        led: 'Thingy LED Characteristic',
        button: 'Thingy Button Characteristic',
    },
};

const colors = {
    favorite: '1,5,2,0',
    none: '1,0,0,0',
    red: '1,255,0,0',
    blue: '1,0,0,255',
    green: '1,0,255,0',
    purple: '1,255,0,125',
    yellow: '1,255,125,0',
};

module.exports = {
    config,
    colors,
};
