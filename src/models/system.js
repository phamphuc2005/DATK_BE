const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema(
    {
        deviceID: {
            type: String, required: true, trim: true
        },
        name: {
            type: String, required: true, trim: true
        },
        state: {
            type: Number, required: true, trim: true, default: 0
        },
        lastMail: {
            type: Number, required: true, trim: true, default: 0
        },
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const System = mongoose.model('System', schema);

module.exports = System;