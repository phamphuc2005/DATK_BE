require('dotenv').config();

module.exports = {
    HOST: process.env.MQTT_HOST,
    PORT: process.env.MQTT_PORT,
    CLIENT_ID: process.env.MQTT_CLIENT_ID,
    DATA_TOPIC: process.env.MQTT_DATA_TOPIC,
    COMMAND_TOPIC: process.env.MQTT_COMMAND_TOPIC,
    STATE_TOPIC: process.env.MQTT_STATE_TOPIC,
}