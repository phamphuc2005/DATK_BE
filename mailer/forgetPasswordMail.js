require('dotenv').config();
const disconnectMail = require('./index');
const System = require('../src/models/system');
const UserSystem = require('../src/models/user_system');
const {User} = require('../src/models/user');
const nodemailer = require("nodemailer");

let sendForgetMail = async (email, code) => {
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
        user: process.env.MAIL_NAME,
        pass: process.env.MAIL_PASSWORD,
        },
    });

    let info = await transporter.sendMail({
        from: '"FIRE ALARM SYSTEM" <minhpham2001bk@gmail.com>',
        to: email,
        subject: "Lấy lại mật khẩu!",
        html: getBodyHTMLMail(code)
    });
}

let getBodyHTMLMail = (code) => {
    let result = `
            <div>Xin chào bạn!</b></div>
            <div>Bạn nhận được email này khi yêu cầu cấp lại mật khẩu tài khoản!</div>
            <div>Mã xác nhận của bạn là:</div>
            <li><b>${code}</b></li>
            <div>Xin chân thành cảm ơn!</div>
        `
    return result; 
}

module.exports = {
    sendForgetMail,
    getBodyHTMLMail
}