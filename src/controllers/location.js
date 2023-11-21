const System = require('../models/system');
const UserSystem = require('../models/user_system');
const Param = require('../models/param');
const {User, UserDTO} = require('../models/user');
const mqtt = require('../../mqtt');
const brokerInfo = require('../../configs/mqtt.config');
const UserLocation = require('../models/user_location');
const Location = require('../models/location');

let buildRandomNumber = () => {
    let result = `${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}`;
    return result;
}

class LocationController {

    addLocation = async(req, res) =>{
        try{
            const body = req.body;
            
            if(body.userID == '' || !body.userID || body.name == '' || !body.name)
            return res.json({message: 'Thiếu dữ liệu!'});

            const locationCheck = await Location.findOne({name: body.name});
            if(locationCheck) {
                const user = await UserLocation.findOne({userID: body.userID, locationID: locationCheck._id, role: 'Admin'});
                if (user) {
                    return res.json({message: 'Tên khu vực đã tồn tại!'});
                } else {
                    const location = await Location.create({
                        locationID: buildRandomNumber(),
                        name: body.name
                    });
    
                    if(!location) {
                        return res.json({message: 'Không thể tạo mới khu vực!'});
                    } else {
                        const user_location = await UserLocation.create({
                            userID: body.userID,
                            locationID: location._id,
                            role: 'Admin'
                        })
    
                        if (!user_location) {
                            return res.json({message: 'Không thể tạo mới khu vực!'});
                        } else {
                            return res.json({location: location});
                        }
                    }
                }
            } else {
                const location = await Location.create({
                    locationID: buildRandomNumber(),
                    name: body.name
                });

                if(!location) {
                    return res.json({message: 'Không thể tạo mới khu vực!'});
                } else {
                    const user_location = await UserLocation.create({
                        userID: body.userID,
                        locationID: location._id,
                        role: 'Admin'
                    })

                    if (!user_location) {
                        return res.json({message: 'Không thể tạo mới khu vực!'});
                    } else {
                        return res.json({location: location});
                    }
                }
            }
            
        }catch(err){
            console.log(err);
            return res.json({error: err.message});
        }
    }

    getLocations = async(req, res) =>{
        try {
            const userID = req.user._id;
            const userLocations = await UserLocation.find({ userID: userID, role:{$ne: 'Candidate'}}).populate('locationID');
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

    joinLocation = async(req, res) =>{
        try{
            const body = req.body;
            
            if(body.userID == '' || !body.userID || body.locationID == '' || !body.locationID)
            return res.json({message: 'Thiếu dữ liệu!'});

            const locationCheck = await Location.findOne({locationID: body.locationID});
            if(!locationCheck) {
                return res.json({message: 'Không tồn tại khu vực!'});
            } else {
                const user = await UserLocation.findOne({userID: body.userID, locationID: locationCheck._id});
                if (user) {
                    if (user.role !== 'Candidate') {
                        return res.json({message: 'Bạn đã thuộc khu vực này!'});   
                    } else {
                        return res.json({message: 'Bạn đã gửi yêu cầu vào khu vực này!'});   
                    }
                } else {
                    const user_location = await UserLocation.create({
                        userID: body.userID,
                        locationID: locationCheck._id,
                        role: 'Candidate'
                    })

                    if (!user_location) {
                        return res.json({message: 'Không thể xin vào khu vực!'});
                    } else {
                        return res.json({location: user_location});
                    }
                }
            }
            
        }catch(err){
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

    getLocation = async(req, res) => {
        try {
            const _id = req.params.id;
            const userID = req.user._id;
            const location = await Location.findOne({_id: _id});
            const user = await UserLocation.findOne({locationID: _id, userID: userID});

            if(!location || !user) 
                return res.json({message: 'Bạn không có quyền truy cập hoặc không có khu vực!'});

            let location_ = {}
            // location_ = location
            location_._id = location._id
            location_.name = location.name
            location_.locationID = location.locationID
            location_['role'] = user.role

            return res.json(location_);

        }catch(err) {
            console.log(err);
            return res.json({error: err.message});
        }
    }

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

    outLocation = async(req, res) => {
        try {
            const body = req.body;
            
            if(body._id == '' || !body._id || body.userID == '' || !body.userID)
                return res.json({message: 'Thiếu dữ liệu!'});

            const member = await UserLocation.findOne({locationID: body._id, userID: body.userID})
            if (!member) {
                return res.json({message: 'Thất bại!'});
            } else {
                await member.delete()
                return res.json({data: 'OK'});
            }

        }catch(err) {
            console.log(err);
            return res.json({error: err.message});
        }
    }

    deleteLocation = async(req, res) => {
        try {
            const body = req.body;
            
            if(body._id == '' || !body._id || body.userID == '' || !body.userID)
                return res.json({message: 'Thiếu dữ liệu!'});

            const location = await Location.findOne({_id: body._id})
            if (!location) {
                return res.json({message: 'Khu vực không tồn tại!'});
            } else {
                const member = await UserLocation.findOne({locationID: location._id, userID: body.userID});
                if (!member || member.role !== 'Admin') {
                    return res.json({message: 'Bạn không có thẩm quyền!'});
                } else {
                    const deleteLocation = await UserLocation.deleteMany({locationID: location._id});
                    if (!deleteLocation) {
                        return res.json({message: 'Thất bại!'});
                    } else {
                        await location.delete();
                        return res.json({data: 'OK'});
                    }
                }
            }
        }catch(err) {
            console.log(err);
            return res.json({error: err.message});
        }
    }

    getDevices = async(req, res) =>{
        try {
            const _id = req.params.id;
            const userID = req.user._id;
            const user = await UserLocation.findOne({locationID: _id, userID: userID});
            if (!user) {
                return res.json({message: 'Bạn không có quyền truy cập!'});
            } else {
                const devices = await System.find({locationID: _id, trash: 0})
                return res.json(devices);
            }


        }catch(err) {
            console.log(err);
            return res.json({error: err.message});
        } 
    }

    removeDevice = async(req, res) =>{
        try{
            const body = req.body;
            
            if(body.id == '' || !body.id)
            return res.json({message: 'Thiếu dữ liệu!'});

            const device = await UserSystem.findOneAndUpdate({deviceID: body.id, userID: body.userID}, {trash: 1});
            if(!device) console.log("Thất bại!");

            return res.json({device: device});
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

}

module.exports = new LocationController;