const mysql = require("mysql");
const selfConfig = require("../config/account");
const RedisClient = require("../utils/RedisClient");

const dbConfig = selfConfig.account;
const redConfig = selfConfig.token;

const logger = require("node-process-bearer").logger.getLogger();

let db_self = {};
db_self.isConnected = false;

let redisClient = {};
const USER_TOKEN_MAP = "USER_TOKEN_MAP";

function connect() {
    db_self = mysql.createConnection(dbConfig);
    db_self.connect(err => {
        if (err) {
            logger.error("[Db] connect error: %s", JSON.stringify(err));
        } else {
            logger.info("[Db] connected: %s", JSON.stringify(dbConfig));
            db_self.isConnected = true;
        }
    });
    db_self.on("error", err => {
        logger.error("[Db] on error: %s", JSON.stringify(err));
        db_self.isConnected = false;
        connect();
    });
    redisClient = new RedisClient(redConfig);
    setInterval(() => {
        db_self.query("SELECT 1");
    }, 1800 * 1000);
}

module.exports = {
    connect: connect,
    verifyToken: (token) => {
        return redisClient.hgetall(token);
    },
    updateToken: (token, info) => {
        return new Promise((resolve, reject) => {
            logger.info("[Db] updateToken before info: %s", JSON.stringify(info));
            let name = info.u_name;
            redisClient.hget(USER_TOKEN_MAP, name)
                .then(old_token => {
                    if (old_token) {
                        redisClient.del(old_token);
                    }
                    return redisClient.hmset(token, info);
                })
                .then(ret_info => {
                    if (ret_info) {
                        ret_info.token = token;
                        logger.info("[Db] updateToken success ret_info: %s", JSON.stringify(ret_info));
                        redisClient.expire(ret_info.token);
                        redisClient.hset(USER_TOKEN_MAP, ret_info.u_name, ret_info.token);
                        return Promise.resolve(ret_info);
                    } else {
                        reject();
                    }
                })
                .then(ret_info => {
                    let SQL_QUERY_ROLE = " SELECT role_pos, module, role_name FROM role_map WHERE CONV(role_pos, 2, 10) & CONV(?, 2, 10) = CONV(role_pos, 2, 10) ";
                    if (db_self.isConnected) {
                        db_self.query(SQL_QUERY_ROLE, [ret_info.role_pos], (err, ret) => {
                            if (err) {
                                logger.warn("[account] SQL_QUERY_ROLE error: %s", JSON.stringify(err));
                                connect();
                                reject(err);
                            } else if (ret && ret.length > 0) {
                                logger.debug("[account] SQL_QUERY_ROLE ret: %s", JSON.stringify(ret));
                                ret_info.roleInfo = ret;
                                resolve(ret_info);
                            } else {
                                logger.debug("[account] SQL_QUERY_ROLE null");
                                resolve(ret_info);
                            }
                        });
                    } else {
                        reject(ret_info);
                    }
                })
                .catch(err => {
                    if (err && err.msg) {
                        logger.warn("[Db] updateToken err: %s", err.msg);
                    }
                    reject(err);
                });
        });
    },
    renewToken: (token) => {
        redisClient.expire(token);
    },

    queryUserInfo: (...params) => {
        let _self = this;
        let SQL_QUERY_USER_INFO = "SELECT * FROM account WHERE ?? = ? AND ?? = ?";
        return new Promise((resolve, reject) => {
            logger.warn("[account] dataOpt queryUserInfo called: %s", JSON.stringify([...params]));
            if (db_self.isConnected) {
                db_self.query(SQL_QUERY_USER_INFO, [...params], (err, ret) => {
                    if (err) {
                        logger.warn("[account] dataOpt error: %s", JSON.stringify(err));
                        connect();
                        reject(err);
                    } else if (ret && ret.length > 0) {
                        logger.debug("[account] dataOpt ret: %s", JSON.stringify(ret));
                        resolve(ret);
                    } else {
                        logger.debug("[account] dataOpt null");
                        resolve(null);
                    }
                });
            } else {
                logger.warn("[Db] connect failed");
                reject("connected failed");
            }
        });
    },

    updateUserInfo: (u_name, info) => {
        let SQL_UPDATE_USER_INFO = " UPDATE account SET ? WHERE u_name = ? ";
        return new Promise((resolve, reject) => {
            db_self.query(SQL_UPDATE_USER_INFO, [info, u_name], (err, ret) => {
                if (err) {
                    reject(err);
                } else if (ret.affectedRows) {
                    resolve(ret);
                } else {
                    reject(null);
                }
            });
        });
    },

    updatePasswd: (u_name, old_passwd, neo_passwd) => {
        let SQL_UPDATE_USER_INFO = " UPDATE account SET passwd = ? WHERE u_name = ? AND passwd = ?";
        return new Promise((resolve, reject) => {
            db_self.query(SQL_UPDATE_USER_INFO, [neo_passwd, u_name, old_passwd], (err, ret) => {
                if (err) {
                    reject(err);
                } else if (ret.affectedRows) {
                    resolve(ret);
                } else {
                    reject(null);
                }
            });
        });
    },

    addUserInfo: (values) => {
        let SQL_INSERT_USER_INFO = " INSERT INTO account SET ? ";
        return new Promise((resolve, reject) => {
            db_self.query(SQL_INSERT_USER_INFO, [values], (err, ret) => {
                if (err) {
                    reject(err);
                } else if (ret.affectedRows) {
                    resolve(ret);
                } else {
                    reject(null);
                }
            });
        });
    },

    fetchModuleRoleMap: (m_name, except_role) => {
        let SQL_FETCH_MODULE_ROLEMAP = " SELECT role_pos FROM role_map WHERE module = ? AND role_name = ?";
        return new Promise((resolve, reject) => {
            db_self.query(SQL_FETCH_MODULE_ROLEMAP, [m_name, except_role], (err, ret) => {
                if (err) {
                    reject(err);
                } else if (ret.length > 0) {
                    logger.debug("[account] dataOpt fetchModuleRoleMap ret: %s", JSON.stringify(ret));
                    resolve(ret[0].role_pos);
                } else {
                    resolve(null);
                }
            });
        });
    }


};