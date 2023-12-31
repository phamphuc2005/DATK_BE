const System = require('../models/system');
const UserSystem = require('../models/user_system');
const Param = require('../models/param');
const {User, UserDTO} = require('../models/user');
const mqtt = require('../../mqtt');
const brokerInfo = require('../../configs/mqtt.config');
const Userlocation = require('../models/user_location');
const moment = require('moment-timezone');

class DeviceController {
    
    getDevices = async(req, res) =>{
        try {
            const _id = req.params.id;
            const userID = req.user._id;
            if (_id === 'All') {
                let devices = []
                const locations = await Userlocation.find({userID: userID, role:{$ne: 'Candidate'}})
                await Promise.all(
                    locations.map(async(location)=>{
                        const device = await System.find({locationID: location.locationID, trash: 0}).populate('locationID');
                        devices = devices.concat(device)
                    })
                )
                return res.json(devices);
            } else {
                const user = await Userlocation.findOne({locationID: _id, userID: userID, role:{$ne: 'Candidate'}});
                if (!user) {
                    return res.json({message: 'Bạn không có quyền truy cập!'});
                } else {
                    const devices = await System.find({locationID: _id, trash: 0}).populate('locationID');
                    return res.json(devices);
                }
            }

        }catch(err) {
            console.log(err);
            return res.json({error: err.message});
        } 
    }

    getDevice = async(req, res) => {
        try {
            const id = req.params.deviceID;
            const userID = req.user._id;
            const system = await System.findOne({deviceID: id}).populate('locationID');
            const user = await Userlocation.findOne({locationID: system.locationID, userID: userID});

            if(!system || !user) 
                return res.json({message: 'Bạn không có quyền truy cập hoặc không có thiết bị!'});

            return res.json(system);

        }catch(err) {
            console.log(err);
            return res.json({error: err.message});
        }
    }

    addDevice = async(req, res) =>{
        try{
            const body = req.body;
            
            if(body.deviceID == '' || !body.deviceID || body.name == '' || !body.name)
                return res.json({message: 'Thiếu dữ liệu!'});

            const user = await Userlocation.findOne({userID: body.userID, locationID: body.locationID})
            if(!user || user.role !== 'Admin')
                return res.json({message: 'Bạn không có quyền truy cập!'});

            const checkDevice = await System.findOne({deviceID: body.deviceID})
            if (checkDevice) {
                return res.json({message: 'Mã thiết bị đã tồn tại!'});
            } else {
                const location = await System.findOne({locationID: body.locationID, name:body.name})
                if (location) {
                    return res.json({message: 'Tên thiết bị đã tồn tại!'});
                } else {
                    const device = System.create({
                        deviceID: body.deviceID,
                        name: body.name,
                        locationID: body.locationID,
                    })
                    if (!device) {
                        return res.json({message: 'Thất bại!'});
                    } else {
                        return res.json(device);
                    }
                }
            }
            
        }catch(err){
            console.log(err);
            return res.json({error: err.message});
        }
    }

    removeDevice = async(req, res) =>{
        try{
            const body = req.body;
            
            if(body._id == '' || !body._id || body.userID == '' || !body.userID)
                return res.json({message: 'Thiếu dữ liệu!'});

            const device = await System.findOne({_id: body._id})
            if (device) {
                const user = await Userlocation.findOne({userID: body.userID, locationID:device.locationID})
                if (!user || user.role !== 'Admin') {
                    return res.json({message: 'Bạn không có quyền truy cập!'});
                } else {
                    device.trash = 1;
                    await device.save();
                    return res.json({device: device});
                }
            } else {
                return res.json({message: 'Không có thiết bị!'});
            }

            
        }catch(err){
            console.log(err);
            return res.json({error: err.message});
        }
    }

    getTrash = async(req, res) =>{
        try {
            const _id = req.params.id;
            const userID = req.user._id;
            const user = await Userlocation.findOne({locationID: _id, userID: userID});
            if (!user) {
                return res.json({message: 'Bạn không có quyền truy cập!'});
            } else {
                const devices = await System.find({locationID: _id, trash: 1})
                return res.json(devices);
            }


        }catch(err) {
            console.log(err);
            return res.json({error: err.message});
        } 
    }

    restoreDevice = async(req, res) =>{
        try{
            const body = req.body;
            
            if(body._id == '' || !body._id || body.userID == '' || !body.userID)
                return res.json({message: 'Thiếu dữ liệu!'});

            const device = await System.findOne({_id: body._id})
            if (device) {
                const user = await Userlocation.findOne({userID: body.userID, locationID:device.locationID})
                if (!user || user.role !== 'Admin') {
                    return res.json({message: 'Bạn không có quyền truy cập!'});
                } else {
                    device.trash = 0;
                    await device.save();
                    return res.json({device: device});
                }
            } else {
                return res.json({message: 'Không có thiết bị!'});
            }
        }catch(err){
            console.log(err);
            return res.json({error: err.message});
        }
    }

    deleteDevice = async(req, res) =>{
        try{
            const body = req.body;
            
            if(body._id == '' || !body._id || body.userID == '' || !body.userID)
                return res.json({message: 'Thiếu dữ liệu!'});

            const device = await System.findOne({_id: body._id})
            if (device) {
                const user = await Userlocation.findOne({userID: body.userID, locationID:device.locationID})
                if (!user || user.role !== 'Admin') {
                    return res.json({message: 'Bạn không có quyền truy cập!'});
                } else {
                    await Param.deleteMany({systemID: device._id})
                    await device.delete();
                    return res.json({data: 'OK'});
                }
            } else {
                return res.json({message: 'Không có thiết bị!'});
            }
        }catch(err){
            console.log(err);
            return res.json({error: err.message});
        }
    }

    getStatistic = async(req, res) =>{
        try {
            const deviceID = req.params.deviceID;
            const device = await System.findOne({deviceID: deviceID})
            const time = req.body.time;
            const param = await Param.find({systemID: device._id})
            let datas = [];
            if(device && param) {
                for(let i = 0; i < time.length; i++) {
                    let sumTemp = 0;
                    let sumHumid = 0;
                    let sumGas = 0;
                    let sumFire = 0;
                    let number = 0;
                    let temp = 0;
                    let humid = 0;
                    let fire = 0;
                    let gas = 0;
                    let data = {}
                    // console.log(param);
                    param.forEach((param)=>{
                        if((new Date(param.createdAt)).toDateString() === time[i]){
                            sumTemp += param.temp;
                            sumHumid += param.humid;
                            sumGas += param.gas;
                            sumFire += param.fire;
                            number += 1;

                            temp = sumTemp / number;
                            humid = sumHumid / number;
                            fire = sumFire / number;
                            gas = sumGas / number;

                            data.day = time[i];
                            data.temp = temp.toFixed(2);
                            data.humid = humid.toFixed(2);
                            data.fire = fire.toFixed(2);
                            data.gas = gas.toFixed(2);
                        }
                    })
                    if(Object.keys(data).length === 0) {
                        data.day = time[i];
                        data.temp = 0;
                        data.humid = 0;
                        data.fire = 0;
                        data.gas = 0;
                    }
                    datas.push(data);

                    // console.log(data);
                }
                // console.log(datas);
                return res.json({data: datas});
            }

        }catch(err) {
            console.log(err);
            return res.json({error: err.message});
        } 
    }

    getStatisticTime = async(req, res) =>{
        try {
            const deviceID = req.params.deviceID;
            const device = await System.findOne({deviceID: deviceID})
            const times = req.body.times;
            const type = req.body.type;

            if (times && type === 'date') {
                let datas = [];
                const utcMoment = moment.utc(times);
                const localMoment = utcMoment.tz("Asia/Bangkok");
                const startTime = localMoment.clone().startOf('day');
                const endTime = localMoment.clone().endOf('day');
    
                // const param = await Param.find({systemID: device._id, time: {$gte: startTime.valueOf(), $lte: endTime.valueOf()}})
                // console.log(param);
                // console.log(startTime.valueOf(), endTime.valueOf());
                for(let i = 0; i < 24; i++){
                    let start = startTime.valueOf() + i*60*60*1000;
                    let end = start + 60*60*1000;
                    const param = await Param.find({systemID: device._id, time: {$gte: start, $lte: end}})
                    // console.log(param);
                    if (param) {
                        let sumTemp = 0;
                        let sumHumid = 0;
                        let sumGas = 0;
                        let sumFire = 0;
                        let number = 0;
                        let temp = 0;
                        let humid = 0;
                        let fire = 0;
                        let gas = 0;
                        let data = {}
                        // console.log(param);
                        param.forEach((param)=>{
                            sumTemp += param.temp;
                            sumHumid += param.humid;
                            sumGas += param.gas;
                            sumFire += param.fire;
                            number += 1;

                            temp = sumTemp / number;
                            humid = sumHumid / number;
                            fire = sumFire / number;
                            gas = sumGas / number;

                            data.hour = start;
                            data.temp = temp.toFixed(2);
                            data.humid = humid.toFixed(2);
                            data.fire = fire.toFixed(2);
                            data.gas = gas.toFixed(2);
                        })
                        if(Object.keys(data).length === 0) {
                            data.hour = start;
                            data.temp = 0;
                            data.humid = 0;
                            data.fire = 0;
                            data.gas = 0;
                        }
                        datas.push(data);
                    }
                }
                return res.json({data: datas});
                
            } else if (times && type === 'year') {
                let datas = [];
                const utcMoment = moment.utc(times);
                const localMoment = utcMoment.tz("Asia/Bangkok");
                const startTime = localMoment.clone().startOf('year');
                const endTime = localMoment.clone().endOf('year');

                console.log(startTime.valueOf(), endTime.valueOf());

                const startOfYearMoment = moment(startTime.valueOf());
                const months = [];
                for (let month = 0; month < 12; month++) {
                    const startOfMonthMoment = startOfYearMoment.clone().month(month).startOf('month');
                    months.push(startOfMonthMoment.valueOf());
                }
                months.push(endTime.valueOf());
                console.log(months);

                for (let i = 0; i < 12; i++) {
                    const param = await Param.find({systemID: device._id, time: {$gte: months[i], $lte: months[i+1]}})
                    if (param) {
                        let sumTemp = 0;
                        let sumHumid = 0;
                        let sumGas = 0;
                        let sumFire = 0;
                        let number = 0;
                        let temp = 0;
                        let humid = 0;
                        let fire = 0;
                        let gas = 0;
                        let data = {}
                        // console.log(param);
                        param.forEach((param)=>{
                            sumTemp += param.temp;
                            sumHumid += param.humid;
                            sumGas += param.gas;
                            sumFire += param.fire;
                            number += 1;

                            temp = sumTemp / number;
                            humid = sumHumid / number;
                            fire = sumFire / number;
                            gas = sumGas / number;

                            data.month = months[i];
                            data.temp = temp.toFixed(2);
                            data.humid = humid.toFixed(2);
                            data.fire = fire.toFixed(2);
                            data.gas = gas.toFixed(2);
                        })
                        if(Object.keys(data).length === 0) {
                            data.month = months[i];
                            data.temp = 0;
                            data.humid = 0;
                            data.fire = 0;
                            data.gas = 0;
                        }
                        datas.push(data);
                    }
                }
                return res.json({data: datas});
            } else {
                let datas = [];
                const utcMoment = moment.utc(times);
                const localMoment = utcMoment.tz("Asia/Bangkok");
                const startTime = localMoment.clone().startOf('month');
                const endTime = localMoment.clone().endOf('month');

                console.log(startTime.valueOf(), endTime.valueOf());

                const startOfMonthMoment = moment(startTime.valueOf());
                const daysInMonth = startOfMonthMoment.daysInMonth();
                const days = [];
                for (let day = 0; day < daysInMonth; day++) {
                  const startOfDayMoment = startOfMonthMoment.clone().add(day, 'days').startOf('day');
                  days.push(startOfDayMoment.valueOf());
                }
                days.push(endTime.valueOf())
                console.log(days);

                for (let i = 0; i < days.length-1; i++) {
                    const param = await Param.find({systemID: device._id, time: {$gte: days[i], $lte: days[i+1]}})
                    if (param) {
                        let sumTemp = 0;
                        let sumHumid = 0;
                        let sumGas = 0;
                        let sumFire = 0;
                        let number = 0;
                        let temp = 0;
                        let humid = 0;
                        let fire = 0;
                        let gas = 0;
                        let data = {}
                        // console.log(param);
                        param.forEach((param)=>{
                            sumTemp += param.temp;
                            sumHumid += param.humid;
                            sumGas += param.gas;
                            sumFire += param.fire;
                            number += 1;

                            temp = sumTemp / number;
                            humid = sumHumid / number;
                            fire = sumFire / number;
                            gas = sumGas / number;

                            data.day = days[i];
                            data.temp = temp.toFixed(2);
                            data.humid = humid.toFixed(2);
                            data.fire = fire.toFixed(2);
                            data.gas = gas.toFixed(2);
                        })
                        if(Object.keys(data).length === 0) {
                            data.day = days[i];
                            data.temp = 0;
                            data.humid = 0;
                            data.fire = 0;
                            data.gas = 0;
                        }
                        datas.push(data);
                    }
                }
                // datas.push(daysInMonth)
                return res.json({data: datas, days: daysInMonth});
            }


        }catch(err) {
            console.log(err);
            return res.json({error: err.message});
        } 
    }
}

module.exports = new DeviceController;