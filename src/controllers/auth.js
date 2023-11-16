const {User, UserDTO} = require('../models/user');
const bcrypt = require('bcrypt')
const Util = require('../utils')
const forgetPasswordMail = require('../../mailer/forgetPasswordMail');
const { Accuracy } = require('../models/accuracy');

let buildRandomNumber = () => {
    let result = `${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}`;
    return result;
}
class AuthController {

    login = async(req, res) =>{
        try {
            const body = req.body;

            if(body.email == '' || !body.email)
                return res.json({message: 'invalid input'});

            const user = await User.findOne({email: body.email});
            if(!user) return res.json({message: 'email doesnot exist'});

            const validPwd = await bcrypt.compare(body.password, user.password);
            if(!validPwd) return res.json({message: 'wrong password'});

            const accessToken = Util.generateAccessToken(user);

            return res.json({user: new UserDTO(user), accessToken});

        }catch(err) {
            console.log(err);
            return res.json({error: err.message});
        } 
    }

    register = async(req, res) =>{
        try{
            const body = req.body;
            
            if(body.email == '' || !body.email)
            return res.json({message: 'invalid input'});

            const emailCheck = await User.findOne({email: body.email});
            if(emailCheck)
                return res.json({message: 'email existed'});

            const hashedPwd = await Util.hashPwd(body.password);
            
            const user = await User.create({
                password: hashedPwd,
                email: body.email,
                name: body.name,
                phone: body.phone
            });

            if(!user) return res.json({message: 'cannot create user'});

            return res.json(new UserDTO(user));
        }catch(err){
            console.log(err);
            return res.json({error: err.message});
        }
    }

    logout = (req, res) => {
        console.log('logout')
        
        return res.json({message: 'logout'})
    }

    changePassword = async(req, res) => {
        try{
            const [oPw, nPw] = [req.body.oldPassword, req.body.newPassword];
            const userID = req.user._id;

            const user = await User.findById(userID);
            if(!user)
                return res.json({message: 'user does not exist'});

            const validPwd = await bcrypt.compare(oPw, user.password);
            if(!nPw || !validPwd) return res.json({message: 'wrong password'});
            
            const hashedNewPw = await Util.hashPwd(nPw); 

            let nUser = await User.findOneAndUpdate({_id: userID}, {password: hashedNewPw});
            if(!nUser) return res.json({message: 'update password failed'})

            nUser = await User.findById(userID);
            return res.json(new UserDTO(nUser));

        }catch(err){
            console.log(err);
            return res.json({error: err.message});
        }
    }

    forgetPassword = async(req, res) => {
        try{
            const [newPassword, email] = [req.body.newPassword, req.body.email];

            const user = await User.findOne({email: email});
            if(!user) {
                return res.json({message: 'Email không tồn tại'});
            } else {
                let random_number = buildRandomNumber();
                const code = await Accuracy.create({
                    email: email,
                    code: random_number
                })
                if(!code) {
                    return res.json({message: 'Thất bại'});
                } else {
                    await forgetPasswordMail.sendForgetMail(email, random_number);
                    return res.json({email, newPassword})
                }
            }

        }catch(err){
            console.log(err);
            return res.json({error: err.message});
        }
    }

    confirmCode = async(req, res) => {
        try{
            const [code, newPassword, email] = [req.body.code, req.body.newPassword, req.body.email];

            const confirmCode = await Accuracy.find({email: email, code: code}).sort({ createdAt: -1 }).limit(1);
            if (confirmCode && confirmCode.length > 0) {
                const hashedNewPw = await Util.hashPwd(newPassword); 

                let nUser = await User.findOneAndUpdate({email: email}, {password: hashedNewPw});
                if(!nUser) return res.json({message: 'Thất bại'})
    
                nUser = await User.findOne({email: email});
                return res.json(new UserDTO(nUser));
            } else {
                return res.json({message: 'Mã xác nhận không chính xác!'});
            }

        }catch(err){
            console.log(err);
            return res.json({error: err.message});
        }
    }
}

module.exports = new AuthController;