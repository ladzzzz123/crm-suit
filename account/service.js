const Courier = require("node-process-bearer").Courier;
const logger = require("node-process-bearer").logger.getLogger();

const dbOpter = require("./dataOpt");

let export_func = {
    name: "account",
    init: () => {
        dbOpter.connect();
    },
    asyncRegister: (user_name, code) => {

    },
    asyncLogin: (user_name, passwd) => {
        return dbOpter.queryUserInfo("u_name", user_name, "passwd", passwd)
            .then(ret => {
                let info = {};
                if (ret.length > 0) {
                    info = ret[0];
                    logger.info("[login] asyncLogin info:" + JSON.stringify(info));
                } else {
                    return Promise.reject("failed");
                }
                let token = Math.random().toString(36).slice(2);
                logger.info("[login] token:" + token);
                return dbOpter.updateToken(token, {
                        name: info.u_name,
                        id: info._id,
                        role_pos: info.role_pos,
                        status: info.u_status
                    })
                    .then(info => {
                        return Promise.resolve({ status: 2000, info: info, msg: "login success" });
                    });
            })
            .catch(err => {
                logger.info("[login] err:" + JSON.stringify(err));
                return Promise.resolve({ status: 4003, msg: "login failed" });
            });
    },
    asyncUpdateInfo: (token) => {

    },
    asyncVerify: (token, m_name, excpet_role) => {
        return new Promise((resolve, reject) => {
            let info = {};
            dbOpter.verifyToken(token)
                .then(ret => {
                    if (ret) {
                        info = ret;
                        return dbOpter.fetchModuleRoleMap(m_name, excpet_role);
                    } else {
                        resolve({ pass: false, info: null });
                    }
                })
                .then(role_val => {
                    if (role_val) {
                        let c = parseInt(info.role_pos, 2),
                            e = parseInt(role_val, 2);
                        logger.info("[login] asyncVerify role_pos:%s, role_val:%s,ret:%s", c, e, (c & e) === e);
                        resolve({ pass: (c & e) === e, info: info });
                    } else {
                        resolve({ pass: false, info: null });
                    }
                })
                .catch(err => {
                    resolve({ pass: false, info: null });
                });
        });
    },

    asyncAddUser: (user_info) => {
        return new Promise((resolve, reject) => {
            dbOpter.addUserInfo(user_info)
                .then(ret => {
                    if (ret) {
                        resolve({ status: "success", ret: user_info });
                    } else {
                        resolve({ status: "failed", ret: ret });

                    }
                })
                .catch(err => {
                    resolve({ status: "error", err: err });
                });
        });
    }
};

let courier = new Courier(export_func);
courier.listening();

export_func.init();
module.exports = export_func;