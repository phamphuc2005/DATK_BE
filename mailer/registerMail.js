require('dotenv').config();
const nodemailer = require("nodemailer");

let registerMail = async (email, code) => {
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
        subject: "Đăng ký tài khoản!",
        html: getBodyHTMLMail(code)
    });
}

let getBodyHTMLMail = (code) => {
    let result = `
            <div>Xin chào bạn!</b></div>
            <div>Bạn nhận được email này khi yêu cầu tạo tài khoản trên Fire Alarm System!</div>
            <div>Mã xác nhận của bạn là:</div>
            <li><b>${code}</b></li>
            <div>Xin chân thành cảm ơn!</div>
        `
    return result; 
}

module.exports = {
    registerMail,
    getBodyHTMLMail
}