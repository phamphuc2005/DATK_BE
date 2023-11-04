const mongoose = require("mongoose");
const db = require('../configs/db.config')
require("dotenv").config();

const uri = `mongodb+srv://datkktmt:KSrc2hPkPBwzqTmY@cluster0.muhoblp.mongodb.net/datkktmt`;

async function connect(){

    try{
        mongoose.set('strictQuery', false);
        await mongoose.connect(uri);
        console.log('Connect successfully!');
    }catch(err){
        console.log(`Connect failed!. Error: ${err}`);
    }

}

module.exports = { connect };
