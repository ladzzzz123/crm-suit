const Courier = require("node-process-bearer").Courier;
const logger = require("node-process-bearer").logger.getLogger();
const mysql = require("mysql");


let export_func = {
    name: "leads-data",
    asyncOpt: (action, tag) => {
        switch (action) {
            case "query":
                return queryData(tag);
            default:
                break;
        }
        return Promise.resolve("unknown opt");
    }
};

function queryData(tag) {
    return new Promise((resolve, reject) => {
        const SQL_QUERY = `SELECT phone, tag, occurrence, data FROM market_data WHERE tag = ? ORDER BY id`;
        const SQL_QUERY_FORMAT = mysql.format(SQL_QUERY, tag);
        courier.sendAsyncCall("dbopter", "asyncQuery", "", "market_data", SQL_QUERY_FORMAT)
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

let courier = new Courier(export_func);
courier.listening();