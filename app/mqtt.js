const mqtt = require('mqtt');

const client = mqtt.connect({
    host: process.env.MQTT_BROKER_HOST,
    port: process.env.MQTT_BROKER_PORT,
    username: process.env.MQTT_BROKER_USER,
    password: process.env.MQTT_BROKER_PASSWORD,
});

module.exports = {
    client,
};
