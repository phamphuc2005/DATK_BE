const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema(
    {
        email: {
            type: String, required: true, trim: true
        },
        code: {
            type: String, required: true, trim: true
        },
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const Accuracy = mongoose.model('Accuracy', schema);

module.exports = {Accuracy};