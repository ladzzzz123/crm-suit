const Courier = require("node-process-bearer").Courier;
const logger = require("node-process-bearer").logger.getLogger();
const mysql = require("mysql");
const DBer = require("./Db");

let dbMap = new Map();


function execOpt(target, sql_opt, params) {
    return new Promise((resolve, reject) => {
        logger.info("[dbopt] execOpt target: %s, params: %s", target, JSON.stringify(params));
        let opt = dbMap.get(target);
        if (opt) {
            opt.query(sql_opt, params, (err, result) => {
                if (err) {
                    logger.error("[dbopt] execOpt error: %s", err);
                    reject({ status: "error", ret: err });
                } else {
                    resolve({ status: "success", ret: result });
                }
            });
        } else {
            logger.error("[dbopt] execOpt not exist: %s", target);
            reject({ status: "error", ret: `opt ${target} not exist` });
        }
    });
}


let export_func = {
    name: "dbopter",

    asyncQuery: (target, sql_opt) => {
        logger.info(`[dbopter] asyncQuery called: ${target}, ${sql_opt}`);
        return execOpt(target, sql_opt, "");
    },

    asyncQueryInsert: (target, sql_opt, params) => {
        logger.info(`[dbopter] asyncQuery called: ${target}, ${sql_opt}`);
        return execOpt(target, sql_opt, params);
    },

    asyncSelect: (target, table, columns, params) => {
        logger.info(`[dbopter] asyncSelect called: ${target}, ${table}, ${columns}, ${params}`);
        let _params = [table, params];
        let SQL_SELECT = `SELECT ${columns} FROM ?? WHERE ?? = ?`;
        let sql_set = mysql.format(SQL_SELECT, _params);
        return execOpt(target, sql_set, _params);
    },

    asyncInsert: (target, table, params) => {
        let SQL_INSERT = `INSERT INTO ${table} SET ?`;
        logger.info(`[dbopter] asyncInsert called: ${target}, ${table}, ${params}`);
        return execOpt(target, SQL_INSERT, params);
    },

    asyncUpdate: (target, table, params, conditions) => {
        let SQL_UPDATE = `UPDATE ${table} SET ? WHERE ${conditions}`;
        let SQL_SELECT = `SELECT * FROM ${table} WHERE ${conditions}`;
        logger.info(`[dbopter] asyncUpdate called: ${target}, ${table}, ${params}, ${conditions}`);
        return execOpt(target, SQL_UPDATE, params)
            .then(ret => {
                if (ret.status === "success" && ret.ret.affectedRows && ret.ret.affectedRows > 0) {
                    return execOpt(target, SQL_SELECT, []);
                } else {
                    return Promise.resolve({ status: "failed", ret: ret });
                }
            });
    },

    asyncDelete: (target, table, conditions) => {
        let SQL_DELETE = `DELETE FROM ${table} WHERE ${conditions}`;
        logger.info(`[dbopter] asyncDelete called: ${target}, ${table}, ${conditions}`);
        return execOpt(target, SQL_DELETE)
            .then(ret => {
                if (ret.status === "success" && ret.ret.affectedRows && ret.ret.affectedRows > 0) {
                    return Promise.resolve({ status: "success", ret: ret });
                } else {
                    return Promise.resolve({ status: "failed", ret: ret });
                }
            });
    },

    asyncArchived: (target, table, conditions) => {
        let SQL_ARCHIVED = `INSERT INTO ${table}_archived 
            SELECT * FROM ${table} WHERE ${conditions}`;
        let SQL_DELETE = `DELETE FROM ${table} WHERE ${conditions}`;
        logger.info(`[dbopter] asyncArchived called: ${target}, ${table}, ${conditions}`);
        return execOpt(target, SQL_ARCHIVED)
            .then(ret => {
                if (ret.status === "success" && ret.ret.affectedRows && ret.ret.affectedRows > 0) {
                    return execOpt(target, SQL_DELETE);
                } else {
                    return Promise.resolve({ status: "failed", ret: ret });
                }
            })
            .catch(err => {
                return Promise.resolve({ status: "error", ret: err });
            });
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
        let dber = new DBer(connect, connect.name);
        dbMap.set(connect.name, dber);
    });
}

function connect() {
    dbMap.forEach(db => {
        if (!db.isConnected) {
            db.connect();
            db.error(err => {
                db.connect();
            });
        }
    });
}

init();
connect();