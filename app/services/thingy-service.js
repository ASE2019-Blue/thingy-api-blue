const Mqtt = require('../mqtt');
const Thingy = require('../models/thingy-model');
const configThingy = require('../config-thingy');

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

async function lock(thingyId, username) {
    const thingy = await Thingy.findOneAndUpdate({ _id: thingyId, lockedForUser: null }, { lockedForUser: username });
    if (thingy != null) {
        _unsubscribe(thingy);
        return true;
    }
    return false;
}

async function unlock(thingyId, username) {
    const thingy = await Thingy.findOneAndUpdate({ _id: thingyId, lockedForUser: username }, { lockedForUser: null });
    if (thingy != null) {
        _unsubscribe(thingy);
        return true;
    }
    return thingy != null;
}

function _unsubscribe(thingy) {
    const thingyURI = thingy.macAddress;
    const buttonSubscription = `${thingyURI}/${configThingy.config.services.userInterface}/${configThingy.config.characteristics.button}`;
    const { client } = Mqtt;
    client.unsubscribe(buttonSubscription);
}

function registerSound(match) {
    const { client } = Mqtt;

    const thingyURI = match.thingys[0].macAddress;
    const soundConfigSubscription = `${thingyURI}/${configThingy.config.services.soundService}/${configThingy.config.characteristics.soundConfiguration}`;
    const configSound = `${soundConfigSubscription}/Set`;
    client.publish(configSound, '3,2');
}

function playSound(match, soundId) {
    const { client } = Mqtt;

    const thingyURI = match.thingys[0].macAddress;
    const speakerSubscription = `${thingyURI}/${configThingy.config.services.soundService}/${configThingy.config.characteristics.speaker}`;
    const setSound = `${speakerSubscription}/Set`;
    client.publish(setSound, `${soundId}`);
}

module.exports = {
    recordThingyConnectionStatus,
    lock,
    unlock,
    registerSound,
    playSound,
};
