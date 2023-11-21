const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema(
    {
        locationID: {
            type: String, required: true, trim: true
        },
        name: {
            type: String, required: true, trim: true
        },
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const Location = mongoose.model('Location', schema);

module.exports = Location;