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
        this.dbConnect.connect(err => {
            if (err) {
                logger.error("[Db] connect error: %s", JSON.stringify(err));
            } else {
                logger.info("[Db] connected: %s", this.conf.name);
                this.isConnected = true;
            }
        });
    }

    query(sql_opt, params, callback) {
        logger.info("[Db] query: %s", sql_opt);
        this.dbConnect.query(sql_opt, params, (err, result) => {
            callback(err, result);
        });
    }

    error(callback) {
        this.dbConnect.on("error", callback);
    }

}

module.exports = Db;