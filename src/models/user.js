const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema(
    {
        email: {
            type: String, required: true, trim: true
        },
        password: {
            type: String, required: true, trim: true
        },
        phone: {
            type: String, required: true, trim: true
        },
        name: {
            type: String, required: true, trim: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const User = mongoose.model('User', schema);

class UserDTO {
    _id;
    email;
    name;
    phone;
    createdAt;
    updatedAt;

    constructor (user){
        this._id = user._id;
        this.email = user.email;
        this.name = user.name;
        this.phone = user.phone;
        this.createdAt = user.createdAt;
        this.updatedAt = user.updatedAt;
    };
}

module.exports = {User, UserDTO};