const System = require('../models/system');
const UserSystem = require('../models/user_system');
const Param = require('../models/param');
const {User, UserDTO} = require('../models/user');
const mqtt = require('../../mqtt');
const brokerInfo = require('../../configs/mqtt.config');
const Userlocation = require('../models/user_location');

class DeviceController {

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
            const userID = req.user._id;
            const systems = await UserSystem.find({userID: userID, trash: 1});
            const deviceids = systems.map (systems => systems.deviceID);
            const devices = await System.find({deviceID: deviceids})
            return res.json(devices);

        }catch(err) {
            console.log(err);
            return res.json({error: err.message});
        } 
    }

    restoreDevice = async(req, res) =>{
        try{
            const body = req.body;
            
            if(body.id == '' || !body.id)
            return res.json({message: 'Thiếu dữ liệu!'});

            const device = await UserSystem.findOneAndUpdate({deviceID: body.id, userID: body.userID}, {trash: 0});
            if(!device) console.log("Khôi phục thất bại!");

            return res.json({device: device});
        }catch(err){
            console.log(err);
            return res.json({error: err.message});
        }
    }

    deleteDevice = async(req, res) =>{
        try{
            const body = req.body;
            
            if(body.id == '' || !body.id || body.userID == '' || !body.userID)
            return res.json({message: 'Thiếu dữ liệu!'});

            const device = await UserSystem.findOneAndDelete({deviceID: body.id, userID: body.userID});
            if(!device) console.log("Thất bại!");

            const deviceExist = await UserSystem.findOne({deviceID: body.id})
            if (!deviceExist) {
                const system = await System.findOneAndDelete({deviceID: body.id});
                if(!system) console.log("Thất bại!");
            }

            return res.json({data: 'OK'});
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
}

module.exports = new DeviceController;