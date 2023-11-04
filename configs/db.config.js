require('dotenv').config();

module.exports = {
    USER: process.env.DB_USER,
    PASSWORD: process.env.DB_PWD,
    NAME: process.env.DB_NAME,
}