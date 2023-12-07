const System = require('../models/system');
const Param = require('../models/param');
const {User, UserDTO} = require('../models/user');
const mqtt = require('../../mqtt');
const brokerInfo = require('../../configs/mqtt.config');
const UserSystem = require('../models/user_system');
const Userlocation = require('../models/user_location');
const Notice = require('../models/notice');

class NoticeController {

    getNotice = async(req, res) =>{
        try {
            const userID = req.user._id;
            const notices = await Notice.find({ userID: userID}).sort({ createdAt: 'desc' });
            return res.json(notices);

        }catch(err) {
            console.log(err);
            return res.json({error: err.message});
        } 
    }

    readNotice = async(req, res) =>{
        try{
            const body = req.body;
            
            if(body._id == '' || !body._id || body.userID == '' || !body.userID)
                return res.json({message: 'Thiếu dữ liệu!'});

            const notice = await Notice.findOne({_id: body._id})
            if (notice) {
                notice.state = 1;
                await notice.save();
                return res.json({notice: notice});
            } else {
                return res.json({message: 'Thông báo không tồn tại!'});
            }
        }catch(err){
            console.log(err);
            return res.json({error: err.message});
        }
    }

    deleteNotice = async(req, res) =>{
        try{
            const body = req.body;
            
            if(body._id == '' || !body._id || body.userID == '' || !body.userID)
                return res.json({message: 'Thiếu dữ liệu!'});

            const notice = await Notice.findOne({_id: body._id})
            if (notice) {
                await notice.delete();
                return res.json({data: 'OK'});
            } else {
                return res.json({message: 'Thông báo không tồn tại!'});
            }
        }catch(err){
            console.log(err);
            return res.json({error: err.message});
        }
    }
}

module.exports = new NoticeController;