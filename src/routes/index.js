const authController = require('../controllers/auth');
const userController = require('../controllers/user');
const deviceController = require('../controllers/device');
const Authz = require('../middlewares/authz');

module.exports = function route(app){

    app.post('/login', authController.login);

    app.post('/register', authController.register);

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

    app.get('/system-name/:deviceID', Authz.verifyToken, userController.changeSystemName);

    app.post('/add-device', Authz.verifyToken, deviceController.addDevice);

    app.post('/remove-device', Authz.verifyToken, deviceController.removeDevice);

    app.get('/get-trash', Authz.verifyToken, deviceController.getTrash);

    app.post('/restore-device', Authz.verifyToken, deviceController.restoreDevice);

    app.post('/delete-device', Authz.verifyToken, deviceController.deleteDevice);

    app.post('/statistic/:deviceID', Authz.verifyToken, deviceController.getStatistic);





}

