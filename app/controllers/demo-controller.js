const Mqtt = require('../mqtt');
const Utilities = require('../services/utility-service');

/**
 * Starts the demo process
 *
 * @param ctx
 * @param next
 * @returns {Promise<void>}
 */
async function demo(ctx, next) {
    Mqtt.client.subscribe('e3:af:9b:f4:a1:c7/Thingy User Interface Service/Thingy Button Characteristic');
    Mqtt.client.on('message', async function (topic, message) {
        // console.log(message.toString());
        if(message=='true'){
            noColour();
            await Utilities.sleep(1500);
            changeColor();
        }
    });
    changeColor();
}

/**
 * Change Thingy LED to random color.
 *
 * @param ctx
 * @param next
 * @returns {Promise<void>}
 */
async function changeColor() {
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
}

/**
 * Sets the colour of the LED to (0,0,0) so OFF
 */
async function noColour() {
    Mqtt.client.publish(
        'e3:af:9b:f4:a1:c7/Thingy User Interface Service/Thingy LED Characteristic/Set',
        '1,0,0,0');
}

/**
 * Stops the demo (unsubsribes from button characteristics)
 *
 * @param ctx
 * @param next
 * @returns {Promise<void>}
 */
async function stop(ctx, next) {
    Mqtt.client.unsubscribe('e3:af:9b:f4:a1:c7/Thingy User Interface Service/Thingy Button Characteristic');
    Mqtt.client.publish(
        'e3:af:9b:f4:a1:c7/Thingy User Interface Service/Thingy LED Characteristic/Set',
        '1,3,1,0');
}

module.exports = {
    demo,
    stop
};
