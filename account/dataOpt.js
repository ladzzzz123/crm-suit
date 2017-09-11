const mysql = require("mysql");
const selfConfig = require("./config/db");
const RedisClient = require("../utils/RedisClient");

const dbConfig = selfConfig.account;
const redConfig = selfConfig.token;

const logger = require("node-process-bearer").logger.getLogger();

let db_self = {};
db_self.isConnected = false;

let redisClient = {};
const USER_TOKEN_MAP = "USER_TOKEN_MAP";


module.exports = {
    connect: () => {
        let _self = this;
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
            db.self.isConnected = false;
            _self.connect();
        });
        redisClient = new RedisClient(redConfig);
    },
    verifyToken: (token) => {
        return redisClient.hgetall(token);
    },
    updateToken: (token, info) => {
        return new Promise((resolve, reject) => {
            logger.info("[Db] updateToken before info: %s", JSON.stringify(info));
            let name = info.name;
            redisClient.hget(USER_TOKEN_MAP, name)
                .then(old_token => {
                    if (old_token) {
                        return redisClient.del(old_token);
                    } else {
                        return Promise.resolve("");
                    }
                })
                .then(del_ret => {
                    return redisClient.hmset(token, info);
                })
                .then(ret_info => {
                    if (ret_info) {
                        ret_info.token = token;
                        logger.info("[Db] updateToken success ret_info: %s", JSON.stringify(ret_info));
                        return redisClient.expire(token);
                    } else {
                        return Promise.resolve(null);
                    }
                })
                .then(() => {
                    return redisClient.hset(USER_TOKEN_MAP, u_name, token);
                })
                .catch(err => {
                    return Promise.reject("err");
                });
        });
    },
    renewToken: (token) => {
        redisClient.expire(token);
    },

    queryUserInfo: (...params) => {
        let SQL_QUERY_USER_INFO = "SELECT * FROM account WHERE ?? = ? AND ?? = ?";
        return new Promise((resolve, reject) => {
            logger.warn("[account] dataOpt queryUserInfo called: %s", JSON.stringify([...params]));
            if (db_self.isConnected) {
                db_self.query(SQL_QUERY_USER_INFO, [...params], (err, ret) => {
                    if (err) {
                        logger.warn("[account] dataOpt error: %s", JSON.stringify(err));
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