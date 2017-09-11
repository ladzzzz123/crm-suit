const redis = require("redis");
const logger = require("node-process-bearer").logger.getLogger();

class RedisClient {
    constructor(redConfig) {
        this.client = redis.createClient(redConfig);
        this.config = {};
        Object.assign(this.config, redConfig);
        this.client.on("error", function(err) {
            logger.error("[Db] Error " + err);
        });
    }

    hget(key, field) {
        return new Promise((resolve, reject) => {
            this.client.hget(key, field, (err, value) => {
                logger.info("[RedisClient] hget key:%s, field: %s,  err: %s,  value: %s", key, field, err || "", value || "");
                if (err) {
                    reject(err);
                } else if (value) {
                    resolve(value);
                } else {
                    resolve(null);
                }
            })
        });
    }

    hgetall(key) {
        return new Promise((resolve, reject) => {
            this.client.hgetall(key, (err, value) => {
                logger.info("[RedisClient] hgetall key:%s, err: %s,  value: %s", key, field, err || "", value || "");

                if (err) {
                    reject(err);
                } else if (value) {
                    resolve(value);
                } else {
                    resolve(null);
                }
            })
        });
    }

    hset(key, field, value) {
        return new Promise((resolve, reject) => {
            this.client.hset(key, field, (err, ret) => {
                logger.info("[RedisClient] hset key:%s, field: %s,  err: %s,  ret: %s", key, field, err || "", ret || "");
                if (err) {
                    reject(err);
                } else if (ret) {
                    resolve(ret);
                } else {
                    resolve(null);
                }
            })
        });
    }

    hmset(key, info) {
        return new Promise((resolve, reject) => {
            this.client.hmset(key, info, (err, ret) => {
                logger.info("[RedisClient] hmset key:%s, err: %s,  ret: %s", key, err || "", ret || "");
                if (err) {
                    reject(err);
                } else {
                    resolve(info);
                }
            });
        })
    }

    del(key) {
        return new Promise((resolve, reject) => {
            this.client.del(key, (err, ret) => {
                logger.info("[RedisClient] del key:%s, err: %s,  ret: %s", key, err || "", ret || "");
                if (err) {
                    reject(err);
                } else {
                    resolve(ret || "");
                }
            })
        });
    }

    expire(key, duration) {
        return new Promise((resolve, reject) => {
            let _duration = 0;
            if (typeof duration === "number" && duration > 0) {
                _duration = duration;
            } else {
                _duration = this.config.expire || 0;
            }
            this.client.expire(key, _duration, (err, ret) => {
                logger.info("[RedisClient] expire key:%s, _duration: %s, err: %s,  ret: %s", key, _duration || 0, err || "", ret || "");
                if (err) { resolve(""); } else { resolve(ret || "") };
            });
        });
    }
}

module.exports = RedisClient;