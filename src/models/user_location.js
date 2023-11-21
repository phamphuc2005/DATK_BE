const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema(
    {
        userID: {
            type: Schema.Types.ObjectId, required: true, trim: true, ref: 'User'
        },
        locationID: {
            type: Schema.Types.ObjectId, required: true, trim: true, ref: 'Location'
        },
        role: {
            type: String, required: true, trim: true
        },
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const Userlocation = mongoose.model('Userlocation', schema);

module.exports = Userlocation;