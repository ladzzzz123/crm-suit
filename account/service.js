const Courier = require("node-process-bearer").Courier;
const logger = require("node-process-bearer").logger.getLogger();
const r_util = require("../router/util");
const dbOpter = require("./dataOpt");
const RESULT = require("../router/codemap");

let export_func = {
    name: "account",
    init: () => {
        dbOpter.connect();
    },
    asyncRegister: (u_name, code) => {

    },
    asyncLogin: (u_name, passwd) => {
        return dbOpter.queryUserInfo("u_name", u_name, "passwd", passwd)
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
                let retInfo = {};
                Object.assign(retInfo, info);
                delete retInfo.passwd;
                return dbOpter.updateToken(token, retInfo)
                    .then(info => {
                        logger.info("[login] updateToken ret:" + JSON.stringify(info));
                        return Promise.resolve({ status: RESULT.SUCCESS, info: info, msg: "login success" });
                    })
                    .catch(err => {
                        logger.info("[login] updateToken err:" + JSON.stringify(err));
                        return Promise.resolve({ status: RESULT.LOGIN_FAILED, msg: "login err" });
                    });
            })
            .catch(err => {
                logger.info("[login] err:" + JSON.stringify(err));
                return Promise.resolve({ status: RESULT.LOGIN_FAILED, msg: "login failed" });
            });
    },
    asyncUpdateInfo: (u_name, info) => {
        logger.info("[account] asyncUpdateInfo:" + JSON.stringify(info));

        if (Object.prototype.hasOwnProperty.call(info, "passwd")) {
            return dbOpter.updatePasswd(u_name, info.old_passwd, info.passwd)
                .then(ret => {
                    return Promise.resolve({ status: RESULT.SUCCESS, msg: "update success" });
                })
                .catch(err => {
                    return Promise.reject({ status: RESULT.FAILED, msg: "update failed" });
                });

        } else {
            return dbOpter.updateUserInfo(u_name, info)
                .then(ret => {
                    return Promise.resolve({ status: RESULT.SUCCESS, msg: "update success" });
                })
                .catch(err => {
                    return Promise.reject({ status: RESULT.FAILED, msg: "update failed" });
                });
        }
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
                        resolve({ pass: false, info: { status: RESULT.LOGIN_EXPIRE } });
                    }
                })
                .then(role_val => {
                    if (role_val) {
                        let c = parseInt(info.role_pos),
                            e = parseInt(role_val);
                        let pass = ((c & e) === e);
                        logger.info("[login] asyncVerify role_pos:%s, role_val:%s,ret:%s", c, e, pass);
                        if (pass) dbOpter.renewToken(token);
                        resolve({ pass: pass, info: info });
                    } else {
                        resolve({ pass: false, info: { status: RESULT.VERIFY_FAILED } });
                    }
                })
                .catch(err => {
                    resolve({ pass: false, info: { status: RESULT.VERIFY_ERROR } });
                });
        });
    },

    asyncAddUser: (user_info) => {
        return new Promise((resolve, reject) => {
            let _info = JSON.parse(JSON.stringify(user_info));
            logger.info("[account] _info:" + JSON.stringify(_info));
            _info.passwd = r_util.encode(_info.passwd);
            logger.info("[account] after encode _info:" + JSON.stringify(_info));
            dbOpter.addUserInfo(_info)
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
    },
    asyncUpdateRole: (u_name, mod_name, role_name) => {
        logger.info("[account] asyncUpdateRole: %s, %s, %s", u_name, mod_name, role_name);
        return new Promise((resolve, reject) => {
            dbOpter.updateUserRole(u_name, mod_name, role_name)
                .then(ret => {
                    if (ret) {
                        resolve({ status: "success", ret: ret });
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