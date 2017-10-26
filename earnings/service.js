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

let courier = new Courier(export_func);
courier.listening(() => {
    // let today = new Date().toLocaleDateString();
    // export_func.insertMaterialIntoDB(today);
}, 86400 * 1000);