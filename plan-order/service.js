const Courier = require("node-process-bearer").Courier;
const logger = require("node-process-bearer").logger.getLogger();
const mysql = require("mysql");

let export_func = {
    name: "plan-order",
    asyncFetchPlan: () => {
        return new Promise((resolve, reject) => {
            let params = ["mail_info", "m_module", export_func.name];
            let sql_opt = "SELECT * FROM ?? WHERE ?? = ?";
            sql_opt = mysql.format(sql_opt, params);
            courier.sendAsyncCall("dbopter", "asyncQuery", () => {}, "market_db", sql_opt)
                .then(ret => {
                    resolve(ret);
                })
                .catch(err => {
                    logger.warn("[plan-order] db select err:" + JSON.stringify(err));
                    reject(err);
                });
        });
    },

    asyncAcceptPlan: (plan_id, opter) => {
        return new Promise((resolve, reject) => {
            let params = {
                m_status: "ACCEPT",
                m_opter: opter
            };
            let conditions = `_id = ${plan_id} AND (m_opter IS NULL OR m_opter = "${opter}") `;
            courier.sendAsyncCall("dbopter", "asyncUpdate", () => {}, "market_db", "mail_info", params, conditions)
                .then(ret => {
                    if (ret.status === "success") {
                        let info = {};
                        if (Array.isArray(ret.ret) && ret.ret.length > 0) {
                            info = ret.ret[0];
                        }
                        courier.sendAsyncCall("mail", "asyncSendMail", ret => {
                            logger.info("[router] get New Mail:" + JSON.stringify(ret));
                            _ret = ret;
                        }, info.m_from, `${opter} accept the plan ${info.title}`, `${opter} accept the plan!`, "simon.song@cootek.cn");
                        resolve({ status: "success", msg: "接单成功" });
                    } else {
                        resolve({ status: "failed", msg: "接单失败" });
                    }

                })
                .catch(err => {
                    logger.warn("[plan-order] db select err:" + JSON.stringify(err));
                    reject(err);
                });
        });
    }

};

let courier = new Courier(export_func);
courier.listening(() => {
    // const params = ["mail_info", "m_module", export_func.name, "m_status", "NEW"];
    // const params = ["mail_info", "m_module", export_func.name];
    // let sql_opt = "SELECT * FROM ?? WHERE ?? = ?";
    // sql_opt = mysql.format(sql_opt, params);
    // courier.sendAsyncCall("dbopter", "asyncQuery", () => {}, "market_db", sql_opt)
    //     .then(ret => {
    //         Array.prototype.forEach.call(ret, mail => {
    //             logger.info("[plan-order] db select mail:" + JSON.stringify(mail));
    //         });
    //     })
    //     .catch(err => {
    //         logger.warn("[plan-order] db select err:" + JSON.stringify(err));
    //     });
}, 20000);