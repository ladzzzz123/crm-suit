const Courier = require("node-process-bearer").Courier;
const logger = require("node-process-bearer").logger.getLogger();

const dbOpter = require("./dataOpt");

let export_func = {
    name: "account",
    init: () => {

    },
    asyncRegister: (user_name, code) => {

    },
    asyncLogin: (user_name, passwd) => {

    },
    asyncUpdateInfo: (token) => {

    },
    asyncVerify: (token, module) => {
        return new Promise((resolve, reject) => {
            dbOpter.queryUserInfo("u_name", user_name, "passwd", passwd)
                .then(ret => {
                    resolve({});
                })
                .catch(err => {
                    reject();
                });
        });
    },

    asyncAddUser: (user_info) => {

    }
};

let courier = new Courier(export_func);
courier.listening();

module.exports = export_func;