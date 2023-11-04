const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema(
    {
        fire: {
            type: Number, required: true
        },
        temp: {
            type: Number, required: true
        },
        humid: {
            type: Number, required: true
        },
        gas: {
            type: Number, required: true
        },
        systemID: {
            type: Schema.Types.ObjectId, required: true, trim: true, ref: 'System'
        },
        warning: {
            type: Boolean, required: true, default: false
        },
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const Param = mongoose.model('Param', schema);

module.exports = Param;