const express = require("express");
require("dotenv").config();
const route = require("./src/routes");
const db = require("./database");
const morgan = require("morgan");
const mqtt = require('./mqtt');
const Param = require('./src/models/param')
const cron = require('node-cron');

const app = express();
const PORT = process.env.PORT || 9999;

app.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Authorization,Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    next();
})

// connect db mongo
db.connect();

// connect mqtt
mqtt.use();

// Đặt lịch xóa dữ liệu ngày hôm trước vào đúng 0h sáng mỗi ngày
const task = cron.schedule('0-59 * * * *', async () =>  {
    await Param.deleteMany({}, (err)=>{
        if(!err) console.log('Delete Success!!!!!!!!!!!!!!!!!!');
        else console.log('delete failed!!!!!!!!!!!!!!!!!!!!!');
    });

  }, {
    scheduled: false,
  });
  
// task.start()

app.use(express.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded
app.use(express.json());  // for parsing application/json

// app.use(morgan('combined'));
route(app);

app.listen(PORT, ()=>{
    console.log(`Listening on port ${PORT}!`);
})