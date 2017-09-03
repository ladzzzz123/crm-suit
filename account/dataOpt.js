const mysql = require("mysql");
const redis = require("redis");
const selfConfig = require("./config/db");

const dbConfig = selfConfig.account;
const redConfig = selfConfig.token;

let db_self = {};
db_self.isConnected = false;

let redisClient = redis.createClient(redConfig);

module.exports = {
    connect: () => {
        db_self = mysql.createConnection(dbConfig);
        db_self.connect(err => {
            if (err) {
                logger.error("[Db] connect error: %s", JSON.stringify(err));
            } else {
                logger.info("[Db] connected: %s", JSON.stringify(dbConfig));
                db_self.isConnected = true;
            }
        });
    },
    verifyToken: (token, user_name) => {
        return redisClient.hgetallAsync(token, user_name);
    },
    updateToken: (token, info) => {
        return redisClient.HMSET(token, info);
    },

    queryUserInfo: (...params) => {
        let SQL_QUERY_USER_INFO = "SELECT * FROM account WHERE ?? = ? ";
        return new Promise((resolve, reject) => {
            db_self.query(SQL_QUERY_USER_INFO, [...params], (err, ret) => {
                if (err) {
                    reject(err);
                } else if (ret) {
                    resolve(ret);
                } else {
                    resolve(null);
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


};