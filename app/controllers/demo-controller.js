const Mqtt = require('../mqtt');

/**
 * Change Thingy LED to random color.
 *
 * @param ctx
 * @param next
 * @returns {Promise<void>}
 */
async function demo(ctx, next) {
    const colors = [
        '1,255,0,0',
        '1,0,255,0',
        '1,0,0,255',
        '1,255,125,0'
    ];
    var colorIndex = Math.floor(Math.random()*colors.length);
    var color = colors[colorIndex];
    Mqtt.client.publish(
        'e3:af:9b:f4:a1:c7/Thingy User Interface Service/Thingy LED Characteristic/Set',
        color);
    ctx.body = color;
}

module.exports = {
    demo
};
