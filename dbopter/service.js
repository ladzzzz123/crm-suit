const Courier = require("node-process-bearer").Courier;
const logger = require("node-process-bearer").logger.getLogger();
const DBer = require("./Db");

let dbMap = new Map();


function execOpt(target, sql_opt, params) {
    return new Promise((resolve, reject) => {
        let opt = dbMap.get(target);
        if (opt) {
            opt.query(sql_opt, params, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        } else {
            reject(`opt ${target} not exist`);
        }
    });
}

let export_func = {
    name: "dbopter",

    asyncSelect: (target, sql_opt, params) => {

    },

    asyncInsert: (target, sql_opt, params) => {
        logger.info(`[dbopter] asyncInsert called: ${target}, ${sql_opt}, ${params}`);
        return execOpt(target, sql_opt, params);
    },

    asyncUpdate: (target, params) => {

    },

    reConnect: () => {
        connect();
    },
};

let courier = new Courier(export_func);
courier.listening();

const dbConfig = require("../config/db");

function init() {
    logger.info("[dbOpter] init:" + JSON.stringify(dbConfig));
    dbConfig.forEach(connect => {
        let dber = new DBer(connect);
        dbMap.set(connect.name, dber);
    });
}

function connect() {
    dbMap.forEach(db => {
        if (!db.isConnected) {
            db.connect();
        }
    });
}

init();
connect();