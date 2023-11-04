const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema(
    {
        userID: {
            type: Schema.Types.ObjectId, required: true, trim: true, ref: 'User'
        },
        deviceID: {
            type: String, required: true, trim: true
        },
        trash: {
            type: Number, required: true, trim: true, default: 0
        },
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const Usersystem = mongoose.model('Usersystem', schema);

module.exports = Usersystem;