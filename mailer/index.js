const nodemailer = require("nodemailer")
const OAuth = require('../configs/mailer.config');
const {OAuth2Client} = require('google-auth-library');

const oAuth2Client = new OAuth2Client(
    OAuth.CLIENT_ID,
    OAuth.CLIENT_SECRET,
    OAuth.REDIRECT_URI
)

oAuth2Client.setCredentials({
    refresh_token: OAuth.REFRESH_TOKEN
})

module.exports = {

    sendEmail: async function(destination, subject, content, callback){

        try {
            const accessTokenObject = await oAuth2Client.getAccessToken()
            const accessToken = accessTokenObject?.token
    
            const mailOptions = {
                to: destination,
                subject: subject, 
                text: content
            }
    
            const tranporter = nodemailer.createTransport({
                service: OAuth.service,
                auth: {
                    type: OAuth.type,
                    user: OAuth.ADMIN_EMAIL_ADDRESS,
                    clientId: OAuth.CLIENT_ID,
                    clientSecret: OAuth.CLIENT_SECRET,
                    refresh_token: OAuth.REFRESH_TOKEN,
                    accessToken: accessToken,
                }
            })
            console.log(mailOptions)
            tranporter.sendMail(mailOptions, callback)

        } catch (error) {
            
            console.log(error)
        }
    }
}
