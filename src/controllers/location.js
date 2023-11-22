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
                    const devices = await System.find({locationID: location._id});
                    devices.map( async(device)=>{
                        const param = await Param.deleteMany({systemID: device._id})
                        if (!param) {
                            return res.json({message: 'Thất bại!'});
                        } else {
                            await device.delete();
                        }
                    })
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

    changeLocationName = async(req, res) => {
        try {
            const [id, name, userID] = [req.body._id, req.body.name, req.body.userID];
            // const userID = req.user._id;

            const user = await UserLocation.findOne({locationID: id, userID: userID});
            if(!user) 
                return res.json({message: 'Bạn không có thẩm quyền!'});

            if(!name)
                return res.json({message: 'Thiếu dữ liệu!'});
            
            const checkName = await Location.findOne({name: name})
            if (checkName) {
                if ((checkName._id).toString() !== id) {
                    const checkUser = await UserLocation.findOne({locationID: checkName._id, userID: userID})
                    if (checkUser) {
                        return res.json({message: 'Tên khu vực đã tồn tại!'});
                    } else {
                        const location = await Location.findOne({_id: id});
                        if (!location) {
                            return res.json({message: 'Không tìm thấy khu vực!'});
                        } else {
                            location.name = name;
                            await location.save();
                            return res.json({data: location});
                        }
                    }

                } else {
                    const location = await Location.findOne({_id: id});
                    if (!location) {
                        return res.json({message: 'Không tìm thấy khu vực!'});
                    } else {
                        location.name = name;
                        await location.save();
                        return res.json({data: location});
                    }
                }
            }
            
            const location = await Location.findOne({_id: id});
            if (!location) {
                return res.json({message: 'Không tìm thấy khu vực!'});
            } else {
                location.name = name;
                await location.save();
                return res.json({data: location});
            }

        }catch(err) {
            console.log(err);
            return res.json({error: err.message});
        }
    }

    getLocationDevices = async(req, res) =>{
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

}

module.exports = new LocationController;