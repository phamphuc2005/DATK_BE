const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();
const BCRYPT_SALT = parseInt(process.env.BCRYPT_SALT);

const Util = {
    generateAccessToken: (data) => {
        return jwt.sign({
            _id: data._id,
            email: data.email,
        }, process.env.ACCESS_SECRET_KEY, { expiresIn: "100d" });
    },

    hashPwd : async (pwd) => {
        const salt = await bcrypt.genSalt(BCRYPT_SALT);
        return await bcrypt.hash(pwd, salt);
    }

}

module.exports = Util;