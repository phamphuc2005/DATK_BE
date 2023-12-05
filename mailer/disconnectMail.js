require('dotenv').config();
const disconnectMail = require('./index');
const System = require('../src/models/system');
const UserLocation = require('../src/models/user_location');
const {User} = require('../src/models/user');
const nodemailer = require("nodemailer");

let sendMail = async (sysID) => {
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
        user: process.env.MAIL_NAME,
        pass: process.env.MAIL_PASSWORD,
        },
    });

    const device = await System.findOne({deviceID: sysID});
    const locations = await UserLocation.find({locationID: device.locationID});
    const userids = locations.map (location => location.userID);
    const user = await User.find({_id: userids})

    user.forEach(async (user) => {
        let info = await transporter.sendMail({
            from: '"FIRE ALARM SYSTEM" <minhpham2001bk@gmail.com>',
            to: user.email,
            subject: "Mất kết nối thiết bị!",
            html: getBodyHTMLMail(device, user)
        });
    })
}

let getBodyHTMLMail = (device, user) => {
    let result = `
            <div>Xin chào,<b> ${user.name}!</b></div>
            <div>Chúng tôi phát hiện thấy thiết bị sau ngắt kết nối quá lâu!</div>
            <li>Mã thiết bị:<b> ${device.deviceID}</b></li>
            <li>Tên thiết bị:<b> ${device.name}</b></li>
            <div> Vui lòng kiểm tra!</div>
            <div>Xin chân thành cảm ơn!</div>
        `
    return result; 
}

module.exports = {
    sendMail,
    getBodyHTMLMail
}