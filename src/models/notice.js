const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema(
    {
        userID: {
            type: Schema.Types.ObjectId, required: true, trim: true, ref: 'User'
        },
        deviceID: {
            type: Schema.Types.ObjectId, required: true, trim: true, ref: 'System'
        },
        content: {
            type: String, required: true, trim: true
        },
        state: {
            type: Number, required: true, trim: true, default: 0
        },
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const Notice = mongoose.model('Notice', schema);

module.exports = Notice;