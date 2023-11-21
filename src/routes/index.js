const authController = require('../controllers/auth');
const userController = require('../controllers/user');
const deviceController = require('../controllers/device');
const locationController = require('../controllers/location');
const Authz = require('../middlewares/authz');

module.exports = function route(app){

    app.post('/login', authController.login);

    app.post('/register', authController.register);

    app.post('/confirm-register', authController.confirmRegister);

    app.post('/forget-password', authController.forgetPassword);

    app.post('/confirm-code', authController.confirmCode);

    app.get('/logout', Authz.verifyToken, authController.logout);

    app.post('/change-password', Authz.verifyToken, authController.changePassword);

    app.get('/user', Authz.verifyToken, userController.getProfile);

    app.post('/update-profile', Authz.verifyToken, userController.updateProfile)

    app.get('/system/:deviceID', Authz.verifyToken, userController.getSystem);

    app.get('/systems', Authz.verifyToken, userController.getAllSystems);
    // app.post('/create', userController.create);
    
    
    app.get('/system-params/:deviceID', Authz.verifyToken, userController.getParams);

    app.get('/system-state/:deviceID', Authz.verifyToken, userController.controlState);

    app.get('/system-name/:_id', Authz.verifyToken, userController.changeSystemName);


    app.post('/add-location', Authz.verifyToken, locationController.addLocation);

    app.get('/list-location', Authz.verifyToken, locationController.getLocations);

    app.post('/join-location', Authz.verifyToken, locationController.joinLocation);

    app.get('/list-request', Authz.verifyToken, locationController.getRequests);

    app.post('/cancel-request', Authz.verifyToken, locationController.cancelRequest);

    app.get('/location/:id', Authz.verifyToken, locationController.getLocation);

    app.get('/member_location/:id', Authz.verifyToken, locationController.getMemberLocation);

    app.get('/request_location/:id', Authz.verifyToken, locationController.getRequestLocation);

    app.post('/accept-request', Authz.verifyToken, locationController.acceptRequest);

    app.post('/deny-request', Authz.verifyToken, locationController.denyRequest);

    app.post('/delete-member', Authz.verifyToken, locationController.deleteMember);

    app.post('/out-location', Authz.verifyToken, locationController.outLocation);

    app.post('/delete-location', Authz.verifyToken, locationController.deleteLocation);

    app.get('/get-devices/:id', Authz.verifyToken, locationController.getDevices);


    app.post('/add-device', Authz.verifyToken, deviceController.addDevice);

    app.post('/remove-device', Authz.verifyToken, deviceController.removeDevice);

    app.get('/get-trash', Authz.verifyToken, deviceController.getTrash);

    app.post('/restore-device', Authz.verifyToken, deviceController.restoreDevice);

    app.post('/delete-device', Authz.verifyToken, deviceController.deleteDevice);

    app.post('/statistic/:deviceID', Authz.verifyToken, deviceController.getStatistic);





}

