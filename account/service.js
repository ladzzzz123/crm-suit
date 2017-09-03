const Courier = require("node-process-bearer").Courier;
const logger = require("node-process-bearer").logger.getLogger();

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

    },

    asyncAddUser: (user_info) => {

    }
};

let courier = new Courier(export_func);
courier.listening();

module.exports = export_func;