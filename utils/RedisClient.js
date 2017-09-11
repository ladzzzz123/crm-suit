const redis = require("redis");

class RedisClient {
    constructor(redConfig) {
        this.client = redis.createClient(redConfig);
        this.config = {};
        Object.assign(this.config, redConfig);
        this.client.on("error", function(err) {
            logger.error("[Db] Error " + err);
        });
    }

    hget(key, hash) {
        return new Promise((resolve, reject) => {
            this.client.hget(key, hash, (err, value) => {
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

    hset(key, hash, value) {
        return new Promise((resolve, reject) => {
            this.client.hset(key, hash, (err, value) => {
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

    hmset(key, info) {
        return new Promise((resolve, reject) => {
            this.client.hmset(key, info, (err, res) => {
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
                if (err) { reject(err); } else { resolve(ret || "") };
            });
        });
    }
}

module.exports = RedisClient;