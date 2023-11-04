require('dotenv').config();

module.exports = {
    service: 'gmail',
    type: 'OAuth2',
    CLIENT_ID: process.env.GOOGLE_MAILER_CLIENT_ID, 
    CLIENT_SECRET: process.env.GOOGLE_MAILER_CLIENT_SECRET,
    REDIRECT_URI: process.env.GOOGLE_MAILER_REDIRECT_URI,
    REFRESH_TOKEN: process.env.GOOGLE_MAILER_REFRESH_TOKEN,
    ADMIN_EMAIL_ADDRESS: process.env.GOOGLE_MAILER_ADMIN_EMAIL_ADDRESS
}