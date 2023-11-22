const System = require('../models/system');
const UserSystem = require('../models/user_system');
const Param = require('../models/param');
const {User, UserDTO} = require('../models/user');
const mqtt = require('../../mqtt');
const brokerInfo = require('../../configs/mqtt.config');
const UserLocation = require('../models/user_location');
const Location = require('../models/location');

class MemberController {

    getMemberLocation = async(req, res) => {
        try {
            const _id = req.params.id;
            const userID = req.user._id;
            const location = await Location.findOne({_id: _id});
            const user = await UserLocation.findOne({locationID: _id, userID: userID});

            if(!location || !user) 
                return res.json({message: 'Bạn không có quyền truy cập hoặc không có khu vực!'});

            const users = await UserLocation.find({locationID: _id, role:{$ne: 'Candidate'}}).populate('userID');
            const members = users.map(member => ({
                user_id: member.userID._id,
                name: member.userID.name,
                email: member.userID.email,
                phone: member.userID.phone,
                role: member.role,
                member_id:member._id
            }));

            return res.json(members);

        }catch(err) {
            console.log(err);
            return res.json({error: err.message});
        }
    }

    getRequestLocation = async(req, res) => {
        try {
            const _id = req.params.id;
            const userID = req.user._id;
            const location = await Location.findOne({_id: _id});
            const user = await UserLocation.findOne({locationID: _id, userID: userID});

            if(!location || !user || user.role !== 'Admin') 
                return res.json({message: 'Bạn không có quyền truy cập hoặc không có khu vực!'});

            const users = await UserLocation.find({locationID: _id, role:'Candidate'}).populate('userID');
            const members = users.map(member => ({
                request_id: member._id,
                user_id: member.userID._id,
                name: member.userID.name,
                email: member.userID.email,
                phone: member.userID.phone,
                role: member.role
            }));

            return res.json(members);

        }catch(err) {
            console.log(err);
            return res.json({error: err.message});
        }
    }
    
    acceptRequest = async(req, res) => {
        try {
            const body = req.body;
            
            if(body._id == '' || !body._id || body.userID == '' || !body.userID)
                return res.json({message: 'Thiếu dữ liệu!'});

            const request = await UserLocation.findOne({_id: body._id})
            if (!request) {
                return res.json({message: 'Yêu cầu không tồn tại!'});
            } else {
                const role = await UserLocation.findOne({userID: body.userID, locationID:request.locationID})
                if (role.role !== 'Admin') {
                    return res.json({message: 'Bạn không có thẩm quyền!'});
                } else {
                    request.role = 'Member'
                    await request.save()
                    return res.json({data: 'OK'});
                }
            }

        }catch(err) {
            console.log(err);
            return res.json({error: err.message});
        }
    }

    denyRequest = async(req, res) => {
        try {
            const body = req.body;
            
            if(body._id == '' || !body._id || body.userID == '' || !body.userID)
                return res.json({message: 'Thiếu dữ liệu!'});

            const request = await UserLocation.findOne({_id: body._id})
            if (!request) {
                return res.json({message: 'Yêu cầu không tồn tại!'});
            } else {
                const role = await UserLocation.findOne({userID: body.userID, locationID:request.locationID})
                if (role.role !== 'Admin') {
                    return res.json({message: 'Bạn không có thẩm quyền!'});
                } else {
                    await request.delete()
                    return res.json({data: 'OK'});
                }
            }

        }catch(err) {
            console.log(err);
            return res.json({error: err.message});
        }
    }

    deleteMember = async(req, res) => {
        try {
            const body = req.body;
            
            if(body._id == '' || !body._id || body.userID == '' || !body.userID)
                return res.json({message: 'Thiếu dữ liệu!'});

            const member = await UserLocation.findOne({_id: body._id})
            if (!member) {
                return res.json({message: 'Thành viên không tồn tại!'});
            } else {
                const role = await UserLocation.findOne({userID: body.userID, locationID:member.locationID})
                if (role.role !== 'Admin') {
                    return res.json({message: 'Bạn không có thẩm quyền!'});
                } else {
                    await member.delete()
                    return res.json({data: 'OK'});
                }
            }

        }catch(err) {
            console.log(err);
            return res.json({error: err.message});
        }
    }

    getRequests = async(req, res) =>{
        try {
            const userID = req.user._id;
            const userLocations = await UserLocation.find({ userID: userID, role:'Candidate'}).populate('locationID');
            const locations = userLocations.map(userLocation => ({
                _id: userLocation.locationID._id,
                locationID: userLocation.locationID.locationID,
                name: userLocation.locationID.name,
                role: userLocation.role
            }));
            return res.json(locations);

        }catch(err) {
            console.log(err);
            return res.json({error: err.message});
        } 
    }

    cancelRequest = async(req, res) =>{
        try{
            const body = req.body;
            
            if(body.locationID == '' || !body.locationID || body.userID == '' || !body.userID)
            return res.json({message: 'Thiếu dữ liệu!'});

            const requestCheck = await UserLocation.findOneAndDelete({userID: body.userID, locationID: body.locationID, role:'Candidate'});
            if (!requestCheck) {
                return res.json({message: 'Thất bại!'}); 
            } else {
                return res.json({data: 'OK'});
            }
        }catch(err){
            console.log(err);
            return res.json({error: err.message});
        }
    }

}

module.exports = new MemberController;