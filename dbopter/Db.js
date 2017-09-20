const mysql = require("mysql");
const logger = require("node-process-bearer").logger.getLogger();

class Db {
    constructor(conf, name) {
        this.conf = conf;
        this.dbName = name;
        this.dbConnect = mysql.createConnection(conf);
        this.isConnected = false;
    }

    connect() {
        let _self = this;
        this.dbConnect.connect(err => {
            if (err) {
                logger.error("[Db] connect error: %s", JSON.stringify(err));
            } else {
                logger.info("[Db] connected: %s", this.conf.name);
                this.isConnected = true;
            }
        });
        setInterval(() => {
            _self.dbConnect.query("SELECT 1");
        }, 1800 * 1000);
    }

    query(sql_opt, params, callback) {
        logger.info("[Db] query: %s", sql_opt);
        this.dbConnect.query(sql_opt, params, (err, result) => {
            if (err) {
                logger.error("[Db] db error: %s, try reconnect", JSON.stringify(err));
                this.connect();
                callback(err, null);
            } else {
                callback(null, result);
            }
        });
    }

    error(callback) {
        this.dbConnect.on("error", callback);
    }

}

module.exports = Db;