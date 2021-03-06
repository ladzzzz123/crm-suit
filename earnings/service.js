const Courier = require("node-process-bearer").Courier;
const logger = require("node-process-bearer").logger.getLogger();
const mysql = require("mysql");
let request = require("request");
const fs = require("fs");
const moment = require("moment");

const CONFIG = require("../config/earnings.json");

let export_func = {
    name: "earnings",
    asyncOpt: (action, ...dates) => {
        switch (action) {
            case "query-journal":
                return queryJournalData(...dates);
            case "query-channel-sum":
                return queryChannelSum(...dates);
            case "query-sum":
                return querySum(...dates);
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
            case "update-journal-group":
                return updateJournalGroupData(params);
            case "update-channel":
                return updateChannelData(params);
            case "delete-channel":
                return deleteChannelData(params);
            default:
                break;
        }
        return Promise.resolve("unknown opt");
    },
};

function queryChannelSum(...dates) {
    return new Promise((resolve, reject) => {
        let params_date = [dates[0], dates[1] || dates[0]];
        logger.info("[earnings] queryChannelSum params_date: %s", JSON.stringify(params_date));
        let dateArr = params_date.map(item => {
            let date = new Date(item);
            logger.info("[earnings] date: %s", date);
            return moment(date.toISOString()).format("YYYYMMDD");
        });
        logger.info("[earnings] queryChannelSum dateArr: %s", JSON.stringify(dateArr));

        const SQL_QUERY = `SELECT SUM(d.e_earn) as earns, d.channel as channel
            FROM earn_daily_journal d
            JOIN earn_channel_info i 
            ON d.channel = i.channel
            AND d.ad_place = i.ad_place
            WHERE d.e_date >= ? AND d.e_date <= ? GROUP BY d.channel`;
        const SQL_QUERY_FORMAT = mysql.format(SQL_QUERY, dateArr);
        courier.sendAsyncCall("dbopter", "asyncQuery", "", "earn_data", SQL_QUERY_FORMAT)
            .then(ret => {
                let retArr = ret.ret;
                if (Array.isArray(retArr)) {
                    resolve(retArr);
                } else {
                    resolve([]);
                }
            })
            .catch(e => {
                reject(e);
            });
    });
}

function querySum(...dates) {
    return new Promise((resolve, reject) => {
        let params_date = [dates[0], dates[1] || dates[0]];
        logger.info("[earnings] querySum params_date: %s", JSON.stringify(params_date));
        let dateArr = params_date.map(item => {
            let date = new Date(item);
            logger.info("[earnings] date: %s", date);
            return moment(date.toISOString()).format("YYYYMMDD");
        });
        logger.info("[earnings] querySum dateArr: %s", JSON.stringify(dateArr));

        const SQL_QUERY = `SELECT SUM(e_earn) as earns FROM earn_daily_journal WHERE e_date >= ? AND e_date <= ?`;
        const SQL_QUERY_FORMAT = mysql.format(SQL_QUERY, dateArr);
        courier.sendAsyncCall("dbopter", "asyncQuery", "", "earn_data", SQL_QUERY_FORMAT)
            .then(ret => {
                let retArr = ret.ret;
                if (Array.isArray(retArr)) {
                    resolve(retArr);
                } else {
                    resolve([]);
                }
            })
            .catch(e => {
                reject(e);
            });
    });
}

function queryJournalData(...dates) {
    return new Promise((resolve, reject) => {
        let params_date = [dates[0], dates[1] || dates[0]];
        let dateArr = params_date.map(item => {
            let date = new Date(item);
            logger.info("[earnings] date: %s", date);
            return moment(date.toISOString()).format("YYYYMMDD");
        });
        logger.info("[earnings] queryJournalData dateArr: %s", JSON.stringify(dateArr));

        const SQL_QUERY = `SELECT d.channel, d.e_date, d.ad_place, d.e_exposure, d.e_click,
            i.settlement, d.e_count, d.e_earn, i.rebate, i.ecpm
            FROM earn_daily_journal d 
            JOIN earn_channel_info i 
            ON d.channel = i.channel
            AND d.ad_place = i.ad_place
            WHERE d.e_date >= ? AND d.e_date <= ?`;
        const SQL_QUERY_FORMAT = mysql.format(SQL_QUERY, dateArr);
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
        dy_ecpm = isNaN(dy_ecpm) ? 0 : dy_ecpm;
        const SQL_UPDATE = `UPDATE earn_daily_journal d, earn_channel_info i 
            SET d.e_count = ?, d.ecpm = IF(i.ecpm > 0, i.ecpm, ?),
            d.e_earn = ? 
            WHERE d.channel = i.channel AND d.ad_place = i.ad_place 
            AND d.channel = ? AND d.ad_place = ? AND d.e_date = ?`;
        let sql_params = [
            params.e_count, dy_ecpm, params.e_earn,
            params.channel, params.ad_place, params.e_date
        ];
        const SQL_QUERY_FORMAT = mysql.format(SQL_UPDATE, sql_params);
        courier.sendAsyncCall("dbopter", "asyncQuery", "", "earn_data", SQL_QUERY_FORMAT)
            .then(ret => {
                let update_ret = ret.ret;
                if (update_ret.affectedRows > 0) {
                    resolve({ result: "success" });
                }
                resolve(orgArr);
            })
            .catch(e => {
                reject(e);
            });
    });
}

function updateJournalGroupData(params) {
    return new Promise((resolve, reject) => {
        let promiseArr = [];
        if (Array.isArray(params)) {
            for (let data of params) {
                promiseArr.push(updateJournalData(data));
            }
        }
        Promise.all(promiseArr)
            .then(ret => {
                resolve({ result: "success" });
            }).catch(e => {
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

function deleteChannelData(params) {
    return new Promise((resolve, reject) => {
        const SQL_UPDATE = `DELETE FROM earn_channel_info WHERE channel = ? AND ad_place = ?`;
        let sql_params = [params.channel, params.ad_place];
        const SQL_QUERY_FORMAT = mysql.format(SQL_UPDATE, sql_params);
        courier.sendAsyncCall("dbopter", "asyncQuery", "", "earn_data", SQL_QUERY_FORMAT)
            .then(ret => {
                resolve(ret);
            })
            .catch(e => {
                reject(e);
            });
    });
}

const MIN_CONTENT_LENGTH = 0;

function insertEarningsDataIntoDB(dateS) {
    return new Promise((resolve, reject) => {
        logger.info("[earnings] dateS: %s", dateS);
        let dateStr = moment(new Date(dateS).toISOString()).format("YYYYMMDD");
        let ids = [];
        const SQL_QUERY_DATA_FROM_MAIL = `SELECT _id, m_content FROM mail_info WHERE 
            m_module = "${export_func.name}" AND m_date >= ? AND m_status = "NEW" `;
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
                    orgDataArr.forEach((item) => {
                        logger.info("[earnings] item: %s", JSON.stringify(item));
                        let neo_content = item.m_content.replace(/(\ )/gi, "");
                        logger.info("[earnings] neo_content: %s", neo_content);

                        let count = 0;
                        const DATA_FORMAT = ["channel", "ad_place", "e_date", "e_platform", "e_exposure", "e_click"];
                        const DATA_TITLE = ["第三方平台", "广告版位", "日期", "操作系统", "曝光量", "点击量"];
                        let temp_data = {};
                        neo_content.split("\n").forEach(sub => {
                            logger.info("[earnings] sub: %s, length: %s", sub, sub.length);
                            let neo_sub = sub.replace(/(\ |\ )/gi, "");
                            logger.info("[earnings] neo_sub: %s, length: %s", neo_sub, neo_sub.length);
                            if (neo_sub.length > MIN_CONTENT_LENGTH && !DATA_TITLE.includes(neo_sub)) {
                                logger.info("[earnings] count: %s", count);
                                temp_data[DATA_FORMAT[count++]] = neo_sub;
                                // channel, ad_place, e_date, e_exposure, e_click
                                if (count > 0 && (count % (DATA_FORMAT.length) === 0)) {
                                    logger.info("[earnings] temp_data: %s", JSON.stringify(temp_data));
                                    insertArr.push(temp_data);
                                    count = 0;
                                    temp_data = {};
                                }
                            }
                        });
                        ids.push(item._id);

                        logger.info("[earnings] insertArr: %s", JSON.stringify(insertArr));
                        let newObj = {};
                        insertArr.forEach(data => {
                            let temp = newObj[`${data.channel}${data.ad_place}${data.e_date}`] || "";
                            if (temp) {
                                temp.e_exposure = parseInt(temp.e_exposure) + parseInt(data.e_exposure);
                                temp.e_click = parseInt(temp.e_click) + parseInt(data.e_click);
                            } else {
                                newObj[`${data.channel}${data.ad_place}${data.e_date}`] = {};
                                Object.assign(newObj[`${data.channel}${data.ad_place}${data.e_date}`], data);
                            }
                        });
                        let newArr = Object.keys(newObj).map(key => {
                            let data = newObj[key];
                            return [data.channel, data.ad_place, data.e_date, data.e_exposure, data.e_click];
                        });
                        logger.info("[earnings] newArr: %s", JSON.stringify(newArr));

                        const SQL_INSERT_DATA = `INSERT IGNORE earn_daily_journal 
                            (channel, ad_place, e_date, e_exposure, e_click) VALUES ?`;
                        const SQL_UPDATE_STATUS = `UPDATE mail_info SET m_status = "RESOLVED" WHERE _id IN (${ids.toString()})`;
                        courier.sendAsyncCall("dbopter", "asyncQueryInsert", "", "earn_data", SQL_INSERT_DATA, [newArr])
                            .then(ret => {
                                logger.info("[earnings] insert succeed: %s", JSON.stringify(ret));
                                return courier.sendAsyncCall("dbopter", "asyncQuery", "", "market_db", SQL_UPDATE_STATUS);
                            })
                            .then(ret => {
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
                logger.error("insertEarningsDataIntoDB error:" + JSON.stringify(e));
                reject(e);
            });
    });
}

let courier = new Courier(export_func);
courier.listening(() => {
    let today = new Date();
    let yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    insertEarningsDataIntoDB(yesterday);
}, 300 * 1000);