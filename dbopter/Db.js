const mysql = require("mysql");
const logger = require("node-process-bearer").logger.getLogger();

class Db {
    constructor(conf) {
        this.conf = conf;
        this.dbConnect = mysql.createConnection(conf);
        this.isConnected = false;
    }

    connect() {
        this.dbConnect.connect(err => {
            if (err) logger.error("[Db] connect error: %s", JSON.stringify(err));
            logger.info("[Db] connected: %s", this.conf.name);
            this.isConnected = true;
        });
    }

}

module.exports = Db;