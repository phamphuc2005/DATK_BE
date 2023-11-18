const mqtt = require('mqtt');
const brokerInfo = require('../configs/mqtt.config')
const System = require('../src/models/system')
const Param = require('../src/models/param')
const mailer = require('../mailer/warningMail');
const disconnectMail = require('../mailer/disconnectMail');

let client;

function getMQTTClient(){
    if(!client){
        client = mqtt.connect(
            `mqtt://${brokerInfo.HOST}:${brokerInfo.PORT}`, {
            clientId: brokerInfo.CLIENT_ID,
            clean: true,
            connectTimeout: 4000,
            reconnectPeriod: 1000
        });
    }
    return client;
}

function use(){
    let isConnected = false;
    const client = getMQTTClient();
    // let warn = 0;
    const [DataTopic, StateTopic, CommandTopic] = [brokerInfo.DATA_TOPIC, brokerInfo.STATE_TOPIC, brokerInfo.COMMAND_TOPIC];
    console.log('Kết nối!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    client.on('connect', async () => {
        if(!isConnected) {
            console.log(`Connected to Broker ${brokerInfo.HOST} port ${brokerInfo.PORT}`)
            client.subscribe([DataTopic, StateTopic], () => {
              console.log(`Subscribed to topic ${DataTopic} and ${StateTopic}`);
            })
            isConnected = true;
        } else {
            console.log('Connecting...');
        }

        // setInterval(async ()=>{
        //     try {
        //         const devices = await System.find();
        //         devices.forEach(async (device) => {
        //             const params = await Param.find({systemID: device._id}).sort({ createdAt: -1 }).limit(1);
        
        //             let lastParam = (new Date(params[0].createdAt)).getTime();
        //             let now = (new Date()).getTime();
        //             if(now - lastParam > 60000) {
        //                 if (device && (( Date.now() - device.lastMail) > 300000)) {
        //                     device.lastMail = Date.now();
        //                     await device.save();
        //                     await disconnectMail.sendMail(device.deviceID);
        //                 }
        //             }
        //         })
        //     } catch (error) {
        //         console.log(error);
        //     }
        // }, 5000)

      })
      
    // Xử lý dữ liệu gửi tới
    client.on('message', async function(topic, payload){
        console.log(topic);
        try {
            // Nếu phần cứng gửi dữ liệu lên
            if(topic == DataTopic){
                // Lấy dữ liệu
                const data = JSON.parse(payload.toString())
                console.log(data)
                
                const chipId = data.chipId;
                const sysID = data.deviceid;
                const temp = (+ data.temperature).toFixed(2)
                const humid = (+ data.humidity).toFixed(2)
                const fire = + data.fire
                const gas = + data.gas
                const warning = data.warn
                console.log('------------------------------------')
                console.log(`Recieve data from ${sysID}: \n\t- Temp: \t${temp}\n\t- Humidity: \t${humid}\n\t- Fire: \t${fire}\n\t- Gas: \t\t${gas}\n`);
            
                // Đánh giá độ nguy hiểm theo độ ưu tiên fire > gas > temp and humi

                // Lưu dữ liệu vào db
                const device = await System.findOne({deviceID: sysID});
                if (device) {
                    const nData = {
                        fire: fire, temp: temp,
                        humid: humid, gas:gas, 
                        systemID: (device._id).toString(), warning: warning == 1 ? true : false
                    }
                    const param = await Param.create(nData);
                    if(!param) console.log('save data of params to database failed');
                    // Gửi lại dữ liệu vào kênh command
                    client.publish(CommandTopic, JSON.stringify(nData), {qos: 0, retain: false}, (error) => {
                    if(error){
                        console.error(error)
                    }
                
                    // console.log(`Send result to topic ${CommandTopic}\n\t- Has temp: \t${nData['hasTemp']}\n\t- Has humid: \t${nData['hasHumid']}\n\t- Has fire: \t${nData['hasFire']}\n\t- Has gas: \t${nData['hasGas']}\n\t- Danger: \t${nData['danger']}\n`);
                    })
                } else {
                    console.log('Không có thiết bị');
                }
                
                
                if(warning == 1){
                    if (device && (( Date.now() - device.lastMail) > 300000)) {
                        device.lastMail = Date.now();
                        await device.save();
                        await mailer.sendWarningMail(sysID);
                    }
                }
            
            }
            
            // Nếu phần cứng báo cáo thay đổi trạng thái
            if(topic == StateTopic){
                // Cập nhật trạng thái mới trên cơ sở dữ liệu
                const data = JSON.parse(payload.toString())
                console.log('data',data)
            
                // trạng thái mới của hệ thống
                const newState = data.state
                const sysID = data.deviceid
                console.log(sysID, ' ---+++++---',  newState);

                const device = await System.findOne({deviceID: sysID});
                if (device) {
                    // Update vào db
                    const sys = await System.findOneAndUpdate({_id: (device._id).toString()}, {state: newState});
                    if(!sys) console.log("Update system state failed!");
                } else {
                    console.log('Không có thiết bị');
                }
            }
        } catch (error) {
            console.log(error)
        }
 
    })
}

module.exports = {getMQTTClient, use};