const Mqtt = require('../mqtt');

/**
 * Listens to the connection status of the Thingies. When true, the Thingy just connected,
 * when false, it disconnected.
 */
function recordThingyConnectionStatus() {
    Mqtt.client.subscribe('+/Connected');
    Mqtt.client.on('message', async function (topic, message) {
        if (topic.endsWith('/Connected')) {
            // get MAC of thingy that threw the message
            var thingyMAC = topic.replace('/Connected', '');
            // get Thingy if available
            var thingy = await Thingy.findOne({ macAddress: thingyMAC });
            // if no exists, add to DB
            if (thingy == null) {
                thingy = new Thingy();
                thingy.macAddress = thingyMAC;
            }
            // process a connected Thingy
            if (message == 'true') {
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
    recordThingyConnectionStatus
};