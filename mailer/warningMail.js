require('dotenv').config();
const mailer = require('./index');
const System = require('../src/models/system');
const UserSystem = require('../src/models/user_system');
const {User} = require('../src/models/user');
const nodemailer = require("nodemailer");

// module.exports = async function sendWarningMail(sysID) {
//     try {
//         const sys = await System.findById(sysID, 'userID');
//         const user = await User.findById(sys.userID, 'email');
//         const content = 'Chúng tôi phát hiện thấy thông số bất thường trong nhà bạn. Vui lòng kiểm tra!';
//         mailer.sendEmail(user.email, 'FIRE WARNING', content, (err, info)=>{
//             if(err) throw err
//             console.log('Send mail: ', info.response);
//         })
//     } catch (error) {
//         console.log(error)
//     }

// }

let sendWarningMail = async (sysID) => {
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
        user: process.env.MAIL_NAME, // generated ethereal user
        pass: process.env.MAIL_PASSWORD, // generated ethereal password
        },
    });

    const device = await System.findOne({deviceID: sysID});
    const users = await UserSystem.find({deviceID: sysID});
    const userids = users.map (users => users.userID);
    const user = await User.find({_id: userids})

    user.forEach(async (user) => {
        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: '"FIRE ALARM SYSTEM" <minhpham2001bk@gmail.com>', // sender address
            to: user.email, // list of receivers
            subject: "Cảnh báo nguy hiểm!", // Subject line
            html: getBodyHTMLMail(device, user)
        });
    })
}

let getBodyHTMLMail = (device, user) => {
    let result = `
            <div>Xin chào,<b> ${user.name}!</b></div>
            <div>Chúng tôi phát hiện thấy thông số bất thường trong nhà bạn!</div>
            <div>Xuất hiện thông tin cảnh báo tại:</div>
            <li>Mã thiết bị:<b> ${device.deviceID}</b></li>
            <li>Tên thiết bị:<b> ${device.name}</b></li>
            <div> Vui lòng kiểm tra!</div>
            <div>Xin chân thành cảm ơn!</div>
        `
    return result; 
}

module.exports = {
    sendWarningMail,
    getBodyHTMLMail
}