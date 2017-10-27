const Courier = require("node-process-bearer").Courier;
const logger = require("node-process-bearer").logger.getLogger();
const mysql = require("mysql");
let request = require("request");
const fs = require("fs");

const CONFIG = require("../config/earnings.json");

let export_func = {
    name: "earnings",
    asyncQuery: (action, ...dates) => {
        switch (action) {
            case "query-journal":
                return queryJournalData(...dates);
            case "sync":
                return insertEarningsDataIntoDB(...dates);
            default:
                break;
        }
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
                            if (sub.length > 5) {
                                // channel, ad_place, e_date, e_exposure, e_click
                                let items = sub.split(",");
                                insertArr.push({
                                    channel: items[0],
                                    ad_place: items[1],
                                    e_date: items[2],
                                    e_exposure: items[3],
                                    e_click: items[4]
                                });
                            }
                        });
                        logger.info("[earnings] insertArr: %s", JSON.stringify(insertArr));
                        const SQL_INSERT_DATA = `
                        INSERT INTO earn_daily_journal (channel, ad_place, e_date, e_exposure, e_click) VALUES ?`;
                        const SQL_QUERY_FORMAT_INSERT = mysql.format(SQL_INSERT_DATA, [insertAr]);
                        logger.info("[earnings] SQL_QUERY_FORMAT_INSERT: %s", SQL_QUERY_FORMAT_INSERT);

                        courier.sendAsyncCall("dbopter", "asyncQuery", "", "earn_data", SQL_QUERY_FORMAT_INSERT)
                            .then(ret => {
                                logger.info("[earnings] insert succeed");
                                resolve("sync success");
                            })
                            .catch(e => {
                                logger.info("[earnings] insert error");
                                resolve("sync error");
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