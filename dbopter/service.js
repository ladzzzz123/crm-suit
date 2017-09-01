const Courier = require("node-process-bearer").Courier;
const logger = require("node-process-bearer").logger.getLogger();
const mysql = require("mysql");
const DBer = require("./Db");

let dbMap = new Map();


function execOpt(target, sql_opt, params) {
    return new Promise((resolve, reject) => {
        logger.info("[dbopt] execOpt target: %s", target);
        let opt = dbMap.get(target);
        if (opt) {
            logger.info("[dbopt] execOpt opt exist: %s query type: %s", opt.dbName, typeof(opt.query));
            opt.query(sql_opt, params, (err, result) => {
                if (err) {
                    logger.error("[dbopt] execOpt error: %s", err);
                    reject(err);
                } else {
                    logger.info("[dbopt] execOpt result: %s", result);
                    resolve(result);
                }
            });
        } else {
            logger.error("[dbopt] execOpt error: %s", err);
            reject(`opt ${target} not exist`);
        }
    });
}

// function queryOpt(target, sql_opt) {
//     logger.info("[dbopt] execOpt target: %s", target);
//     let opt = dbMap.get(target);
//     if (opt) {
//         logger.info("[dbopt] execOpt opt exist: %s query type: %s", opt.dbName, typeof(opt.query));
//         opt.query(sql_opt)
//             .on("error", err => {
//                 logger.error("[dbopt] execOpt error: %s", err);

//             })
//             .on("fields", fields => {
//                 // 查询行字段包信息
//                 logger.error("[dbopt] execOpt error: %s", err);

//             })
//             .on("result", row => {
//                 // 暂停你正在使用进程的I/O操作
//                 connection.pause();

//                 processRow(row, function() {
//                     connection.resume();
//                 });
//             })
//             .on("end", function() {
//                 // 所有行查询完成或发生错误后触发
//             });
//     } else {
//         logger.error("[dbopt] execOpt error: %s", err);
//         reject(`opt ${target} not exist`);
//     }
// }

let export_func = {
    name: "dbopter",

    asyncQuery: (target, sql_opt) => {
        logger.info(`[dbopter] asyncQuery called: ${target}, ${sql_opt}`);
        return execOpt(target, sql_opt, "");
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
        logger.info(`[dbopter] asyncUpdate called: ${target}, ${table}, ${params}, ${conditions}`);
        return execOpt(target, SQL_UPDATE, params);
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
        }
    });
}

init();
connect();