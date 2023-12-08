const System = require('../models/system');
const Param = require('../models/param');
const {User, UserDTO} = require('../models/user');
const mqtt = require('../../mqtt');
const brokerInfo = require('../../configs/mqtt.config');
const UserSystem = require('../models/user_system');
const Userlocation = require('../models/user_location');

class UserController {

    getParams = async(req, res) => {
        try {
            const id = req.params.deviceID;
            const userID = req.user._id;
            const system = await System.findOne({deviceID: id});

            if(!system) 
                return res.json({message: 'Không có thiết bị!'});
            else if(!system || system?.state == false)
                return res.json({message: 'Thiết bị đã tắt!'});
            
            const params = await Param.find({systemID: system._id}).sort({ createdAt: -1 }).limit(1);
            if (params.length > 0) {
                let lastParam = (new Date(params[0].createdAt)).getTime();
                let now = (new Date()).getTime();
                if(now - lastParam > 60000) {
                    return res.json({message: 'disconnect'});
                } else {
                    return res.json(params[0]);
                }
            } else {
                return res.json({message: 'disconnect'});
            }

        }catch(err) {
            console.log(err);
            return res.json({error: err.message});
        }
    }

    controlState = async(req, res) => {
        try {
            const id = req.params.deviceID;
            const state = req.query.state;
            const userID = req.user._id;
            const system = await System.findOne({deviceID: id});

            if(!system) 
                return res.json({message: 'Không có thiết bị!'});

            // if(!state) state = system.state;
            console.log(state,'--------------------', system.state)
            if(state && state != system.state){
                const client = mqtt.getMQTTClient();
                const message = {
                    type: 'control',
                    deviceid: system.deviceID,
                    state: state,
                }
                client.publish(brokerInfo.COMMAND_TOPIC, JSON.stringify(message) ,{qos: 0, retain: false}, (err) => {
                    if(err) console.error(err)
                    
                    console.log(message);
                })

                // Update vào db
                const sys = await System.findOneAndUpdate({deviceID: id}, {state: state});
                if(!sys) console.log("Update system state failed!");
            }

           
            
            return res.json('Đã thay đổi trạng thái!');
           

        }catch(err) {
            console.log(err);
            return res.json({error: err.message});
        }
    }

    changeSystemName = async(req, res) => {
        try {
            const [id, name] = [req.params._id, req.query.name];
            const userID = req.user._id;
            const system = await System.findOne({_id: id});
            const location = await Userlocation.findOne({locationID: system.locationID, userID: userID});

            if(!system || !location) 
                return res.json({message: 'Bạn không có quyền truy cập!'});

            if(!name)
                return res.json({message: 'Thiếu dữ liệu!'});
            
            let nSystem = await System.findOneAndUpdate({_id: id}, {name: name});

            if(!nSystem)
                return res.json({message:'Thất bại!'});
            
            nSystem = await System.findOne({_id: id});
            return res.json(nSystem);

        }catch(err) {
            console.log(err);
            return res.json({error: err.message});
        }
    }

    getProfile = async(req, res) => {
        try {
            const userID = req.user._id;

            const user = new UserDTO(await User.findById(userID));
            if(!user)
                return res.json({message: 'Người dùng không tồn tại!'});

            return res.json(user);

        }catch(err) {
            console.log(err);
            return res.json({error: err.message});
        }
    }

    updateProfile = async(req, res) => {
        try {
            const userID = req.user._id;
            const body = req.body;
            delete body.password, body._id;

            const user = new UserDTO(await User.findById(userID));
            if(!user)
                return res.json({message: 'Người dùng không tồn tại!'});

            let nUser = await User.findOneAndUpdate({_id: userID}, body)
            if(!nUser) return res.json({message: 'Thất bại!'});

            nUser = await User.findById(userID);
            return res.json(new UserDTO(nUser));

        }catch(err) {
            console.log(err);
            return res.json({error: err.message});
        }
    }
}

module.exports = new UserController;