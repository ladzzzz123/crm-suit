const Courier = require("node-process-bearer").Courier;
const logger = require("node-process-bearer").logger.getLogger();
const mysql = require("mysql");
let request = require("request");
const fs = require("fs");

const CONFIG = require("../config/earnings.json");

let export_func = {
    name: "earnings",
    asyncOpt: (action, ...dates) => {
        switch (action) {
            case "query-journal":
                return queryJournalData(...dates);
            default:
                break;
        }
        return Promise.resolve("unknown opt");
    },

    asyncAdminOpt: (action, params) => {
        switch (action) {
            case "query-channel":
                return queryChannelData();
            case "sync":
                return insertEarningsDataIntoDB(params.e_date);
            case "insert-channel":
                return insertChannelData(params);
            case "update-journal":
                return updateJournalData(params);
            case "update-channel":
                return updateChannelData(params);
            default:
                break;
        }
        return Promise.resolve("unknown opt");
    },
};


function queryJournalData(...dates) {
    return new Promise((resolve, reject) => {
        let params_date = [dates[0], dates[1] || dates[0]];
        const SQL_QUERY = "SELECT d.e_date, d.ad_place, d.e_exposure, d.e_count, ((d.e_exposure - d.e_count) / d.e_exposure) as gap, d.e_earn, (d.e_earn * i.rebate) AS net_income, i.ecpm, (d.e_earn / d.e_count) * 1000 AS dym_ecpm FROM earn_daily_journal d JOIN earn_channel_info i ON d.channel = i.channel WHERE d.e_date >= ? AND d.e_date <= ?";
        const SQL_QUERY_FORMAT = mysql.format(SQL_QUERY, params_date);
        courier.sendAsyncCall("dbopter", "asyncQuery", "", "earn_data", SQL_QUERY_FORMAT)
            .then(ret => {
                let orgArr = ret.ret;
                resolve(orgArr);
            })
            .catch(e => {
                reject(e);
            });
    });
}

function updateJournalData(params) {
    return new Promise((resolve, reject) => {
        let dy_ecpm = parseFloat(params.e_earn * 1000 / params.e_count);
        const SQL_UPDATE = `UPDATE earn_daily_journal d, earn_channel_info i 
            SET d.e_count = ?, d.ecpm = IF(i.ecpm > 0, i.ecpm, ?),
            d.e_earn = IF(i.ecpm > 0, d.e_count / i.ecpm * 1000, ?) 
            WHERE d.channel = i.channel AND d.ad_place = i.ad_place 
            AND d.channel = ? AND d.ad_place = ? AND d.e_date = ?`;
        let sql_params = [
            params.e_count, dy_ecpm, params.e_earn,
            params.channel, params.ad_place, params.e_date
        ];
        const SQL_QUERY_FORMAT = mysql.format(SQL_UPDATE, sql_params);
        courier.sendAsyncCall("dbopter", "asyncQuery", "", "earn_data", SQL_QUERY_FORMAT)
            .then(ret => {
                let orgArr = ret.ret;
                resolve(orgArr);
            })
            .catch(e => {
                reject(e);
            });
    });
}

function insertChannelData(params) {
    return new Promise((resolve, reject) => {
        const SQL_INSERT = `INSERT INTO earn_channel_info SET ? `;
        let sql_params = [params];
        const SQL_INSERT_FORMAT = mysql.format(SQL_INSERT, sql_params);
        courier.sendAsyncCall("dbopter", "asyncQuery", "", "earn_data", SQL_INSERT_FORMAT)
            .then(ret => {
                let orgArr = ret.ret;
                resolve(orgArr);
            })
            .catch(e => {
                reject(e);
            });
    });
}

function queryChannelData() {
    return new Promise((resolve, reject) => {
        const SQL_QUERY = "SELECT channel, ad_place, settlement, ecpm, rebate FROM earn_channel_info";
        courier.sendAsyncCall("dbopter", "asyncQuery", "", "earn_data", SQL_QUERY)
            .then(ret => {
                let orgArr = ret.ret;
                resolve(orgArr);
            })
            .catch(e => {
                reject(e);
            });
    });
}


function updateChannelData(params) {
    return new Promise((resolve, reject) => {
        const SQL_UPDATE = `UPDATE earn_channel_info SET ? WHERE channel = ? AND ad_place = ?`;
        let sql_params = [params, params.channel, params.ad_place];
        const SQL_QUERY_FORMAT = mysql.format(SQL_UPDATE, sql_params);
        courier.sendAsyncCall("dbopter", "asyncQuery", "", "earn_data", SQL_QUERY_FORMAT)
            .then(ret => {
                let orgArr = ret.ret;
                resolve(orgArr);
            })
            .catch(e => {
                reject(e);
            });
    });
}

const MIN_CONTENT_LENGTH = 5;

function insertEarningsDataIntoDB(dateS) {
    return new Promise((resolve, reject) => {
        let dateStr = [dateS.replace(/(\/|\-)/gi, "")];
        const SQL_QUERY_DATA_FROM_MAIL = `SELECT m_content FROM mail_info WHERE m_module = "${export_func.name}" AND m_date = ?`;
        const SQL_QUERY_FORMAT = mysql.format(SQL_QUERY_DATA_FROM_MAIL, dateStr);
        courier.sendAsyncCall("dbopter", "asyncQuery", "", "market_db", SQL_QUERY_FORMAT)
            .then(ret => {
                logger.info("[earnings] ret: %s", JSON.stringify(ret));
                let orgDataArr = ret.ret;
                logger.info("[earnings] orgDataArr: %s", JSON.stringify(orgDataArr));
                let insertArr = [];
                if (orgDataArr.length < 1) {
                    resolve("sync success but no data");
                } else {
                    logger.info("[earnings] Array.isArray(orgDataArr): %s", Array.isArray(orgDataArr));
                    orgDataArr.forEach((content) => {
                        logger.info("[earnings] content: %s", JSON.stringify(content));
                        let neo_content =
                            content.m_content.replace(/(\n)+/gi, ";")
                            .replace(/\ /gi, ",")
                            .replace(/(\,\;|\;\,)/gi, ",");
                        logger.info("[earnings] neo_content: %s", neo_content);
                        neo_content.split(";").forEach(sub => {
                            logger.info("[earnings] sub: %s", sub);
                            if (sub.length > MIN_CONTENT_LENGTH) {
                                // channel, ad_place, e_date, e_exposure, e_click
                                let items = sub.split(",");
                                insertArr.push(items);
                            }
                        });
                        logger.info("[earnings] insertArr: %s", JSON.stringify(insertArr));
                        const SQL_INSERT_DATA = "INSERT INTO earn_daily_journal (channel, ad_place, e_date, e_exposure, e_click) VALUES ?";
                        courier.sendAsyncCall("dbopter", "asyncQueryInsert", "", "earn_data", SQL_INSERT_DATA, [insertArr])
                            .then(ret => {
                                logger.info("[earnings] insert succeed: %s", JSON.stringify(ret));
                                resolve("sync success: %s", JSON.stringify(ret));
                            })
                            .catch(e => {
                                logger.info("[earnings] insert error: %s", JSON.stringify(e));
                                resolve(e);
                            });
                    });
                }
            })
            .catch(e => {
                reject(e);
            });
    });
}

let courier = new Courier(export_func);
courier.listening(() => {
    let today = new Date().toLocaleDateString();
    insertEarningsDataIntoDB(today);
}, 86400 * 1000);