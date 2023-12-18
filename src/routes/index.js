const authController = require('../controllers/auth');
const userController = require('../controllers/user');
const deviceController = require('../controllers/device');
const locationController = require('../controllers/location');
const memberController = require('../controllers/member');
const noticeController = require('../controllers/notice');
const Authz = require('../middlewares/authz');

module.exports = function route(app){

    app.post('/login', authController.login);

    app.post('/register', authController.register);

    app.post('/confirm-register', authController.confirmRegister);

    app.post('/forget-password', authController.forgetPassword);

    app.post('/confirm-code', authController.confirmCode);

    app.get('/logout', Authz.verifyToken, authController.logout);

    app.post('/change-password', Authz.verifyToken, authController.changePassword);

    ///////////////////////////////////////////////////////////////////////////////////

    app.get('/user', Authz.verifyToken, userController.getProfile);

    app.post('/update-profile', Authz.verifyToken, userController.updateProfile)

    app.get('/system-params/:deviceID', Authz.verifyToken, userController.getParams);

    app.get('/system-state/:deviceID', Authz.verifyToken, userController.controlState);

    app.get('/system-name/:_id', Authz.verifyToken, userController.changeSystemName);
    
    /////////////////////////////////////////////////////////////////////////////////////

    app.post('/add-location', Authz.verifyToken, locationController.addLocation);

    app.get('/list-location/:role', Authz.verifyToken, locationController.getLocations);

    app.post('/join-location', Authz.verifyToken, locationController.joinLocation);

    app.post('/update-location', Authz.verifyToken, locationController.changeLocationName);

    app.get('/location/:id', Authz.verifyToken, locationController.getLocation);
    
    app.post('/out-location', Authz.verifyToken, locationController.outLocation);
    
    app.post('/delete-location', Authz.verifyToken, locationController.deleteLocation);
    
    app.get('/get-devices/:id', Authz.verifyToken, locationController.getLocationDevices);

    //////////////////////////////////////////////////////////////////////////////////////////
    
    app.get('/member_location/:id', Authz.verifyToken, memberController.getMemberLocation);

    app.get('/request_location/:id', Authz.verifyToken, memberController.getRequestLocation);

    app.post('/accept-request', Authz.verifyToken, memberController.acceptRequest);

    app.post('/deny-request', Authz.verifyToken, memberController.denyRequest);

    app.post('/add-member', Authz.verifyToken, memberController.addMember);

    app.post('/delete-member', Authz.verifyToken, memberController.deleteMember);

    app.get('/list-request', Authz.verifyToken, memberController.getRequests);

    app.post('/cancel-request', Authz.verifyToken, memberController.cancelRequest);

    ///////////////////////////////////////////////////////////////////////////////////////

    app.post('/add-device', Authz.verifyToken, deviceController.addDevice);

    app.post('/remove-device', Authz.verifyToken, deviceController.removeDevice);

    app.get('/get-trash/:id', Authz.verifyToken, deviceController.getTrash);

    app.post('/restore-device', Authz.verifyToken, deviceController.restoreDevice);

    app.post('/delete-device', Authz.verifyToken, deviceController.deleteDevice);
    
    app.get('/list-devices/:id', Authz.verifyToken, deviceController.getDevices);
    
    app.get('/system/:deviceID', Authz.verifyToken, deviceController.getDevice);
    
    app.post('/statistic/:deviceID', Authz.verifyToken, deviceController.getStatistic);

    app.post('/statistic_time/:deviceID', Authz.verifyToken, deviceController.getStatisticTime);

    ////////////////////////////////////////////////////////////////////////////////////////

    app.get('/list-notice', Authz.verifyToken, noticeController.getNotice);

    app.post('/read-notice', Authz.verifyToken, noticeController.readNotice);

    app.post('/delete-notice', Authz.verifyToken, noticeController.deleteNotice);
}

