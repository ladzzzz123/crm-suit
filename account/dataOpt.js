const mysql = require("mysql");
const redis = require("redis");
const selfConfig = require("./config/db");

const dbConfig = selfConfig.account;
const redConfig = selfConfig.token;

const logger = require("node-process-bearer").logger.getLogger();

let db_self = {};
db_self.isConnected = false;

let redisClient = {};

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
        redisClient = redis.createClient(redConfig);
        redisClient.on("error", function(err) {
            logger.error("[Db] Error " + err);
        });
    },
    verifyToken: (token) => {
        return new Promise((resolve, reject) => {
            redisClient.hgetall(token, (err, info) => {
                if (err) {
                    logger.error("[Db] verifyToken error: %s", JSON.stringify(err));
                    reject(err);
                } else {
                    logger.debug("[Db] verifyToken info: %s", JSON.stringify(info));
                    if (info) {
                        resolve(info);
                    } else {
                        reject(null);
                    }
                }
            });

        });

    },
    updateToken: (token, info) => {
        return new Promise((resolve, reject) => {
            logger.info("[Db] updateToken before info: %s", JSON.stringify(info));
            redisClient.hmset(token, info, (err, res) => {
                if (err) {
                    logger.error("[Db] updateToken error: %s", JSON.stringify(err));
                    reject(err);
                } else {
                    logger.info("[Db] updateToken success info: %s", JSON.stringify(info));
                    info.token = token;
                    redisClient.expire(token, redConfig.expire);
                    resolve(info);
                }
            });
        });
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