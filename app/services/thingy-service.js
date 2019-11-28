const Mqtt = require('../mqtt');
const Thingy = require('../models/thingy-model');

/**
 * Listens to the connection status of the Thingies. When true, the Thingy just connected,
 * when false, it disconnected.
 */
function recordThingyConnectionStatus() {
    Mqtt.client.subscribe('+/Connected');
    Mqtt.client.on('message', async (topic, message) => {
        if (topic.endsWith('/Connected')) {
            // get MAC of thingy that threw the message
            const thingyMAC = topic.replace('/Connected', '');
            // get Thingy if available
            let thingy = await Thingy.findOne({ macAddress: thingyMAC });
            // if no exists, add to DB
            if (thingy == null) {
                thingy = new Thingy();
                thingy.macAddress = thingyMAC;
            }
            // process a connected Thingy
            if (message.toString() === 'true') {
                // Thingy is now available
                thingy.available = true;
                try {
                    await thingy.save();
                } catch (err) {
                    console.error(err);
                }
                // process a disconnected Thingy
            } else {
                try {
                    // Thingy is no more available
                    thingy.available = false;
                    await thingy.save();
                } catch (err) {
                    console.error(err);
                }
            }
        }
    });
}

module.exports = {
    recordThingyConnectionStatus,
};
