const config = {
    services: {
        userInterface: 'Thingy User Interface Service',
        soundService: 'Thingy Sound Service',
    },

    characteristics: {
        led: 'Thingy LED Characteristic',
        button: 'Thingy Button Characteristic',
        speaker: 'Thingy Speaker Data Characteristic',
        soundConfiguration: 'Thingy Sound Configuration Characteristic',
    },
};

const systemColors = {
    idle: '5,2,0',
    none: '0,0,0',
};

const colors = {
    red: '255,0,0',
    blue: '0,0,255',
    green: '0,255,0',
    purple: '255,0,125',
    yellow: '255,125,0',
};

module.exports = {
    config,
    colors,
    systemColors,
};
