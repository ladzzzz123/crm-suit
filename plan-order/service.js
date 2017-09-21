const Courier = require("node-process-bearer").Courier;
const logger = require("node-process-bearer").logger.getLogger();
const mysql = require("mysql");
const fs = require("fs");

const CONFIG = require("./config.json");
const msg = require("./msg-template");

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
                                _ret = ret;
                            }, info.m_from,
                            `${opter} ${msg.accept_title} ${info.title}`,
                            `${opter} ${msg.accept_content} ${info.title}!`,
                            info.m_cc
                        );
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
    },

    asyncFinishPlan: (plan_id, opter) => {
        return new Promise((resolve, reject) => {
            let params = {
                m_status: "RESOLVE",
                m_opter: opter
            };
            let conditions = `_id = ${plan_id} AND m_opter = "${opter}" `;
            courier.sendAsyncCall("dbopter", "asyncUpdate", () => {}, "market_db", "mail_info", params, conditions)
                .then(ret => {
                    if (ret.status === "success") {
                        let info = {};
                        if (Array.isArray(ret.ret) && ret.ret.length > 0) {
                            info = ret.ret[0];
                        }
                        courier.sendAsyncCall("mail", "asyncSendMail", ret => {
                                _ret = ret;
                            }, info.m_from,
                            `${opter} ${msg.finish_title} ${info.title}`,
                            `${opter} ${msg.finish_content} ${info.title} \n
                             ${info.m_reply ? "附件如下: " + info.m_reply : ""}`,
                            info.m_cc
                        );
                        resolve({ status: "success", msg: "完成任务成功" });
                    } else {
                        resolve({ status: "failed", msg: "完成任务失败" });
                    }

                })
                .catch(err => {
                    logger.warn("[plan-order] db select err:" + JSON.stringify(err));
                    reject(err);
                });
        });
    },

    asyncUploadFile: (file, plan_id, opter) => {
        return new Promise((resolve, reject) => {
            let reader = fs.createReadStream(file.path);
            let stream = fs.createWriteStream(CONFIG.savePath + file.name);
            reader.pipe(stream);

            let params = {
                m_reply: CONFIG.visitPath + file.name,
                m_opter: opter
            };
            let conditions = `_id = ${plan_id} AND m_opter = "${opter}" `;
            courier.sendAsyncCall("dbopter", "asyncUpdate", () => {}, "market_db", "mail_info", params, conditions)
                .then(ret => {
                    if (ret.status === "success") {
                        let info = {};
                        if (Array.isArray(ret.ret) && ret.ret.length > 0) {
                            info = ret.ret[0];
                        }
                        resolve({ status: "success", msg: "上传附件成功" });
                    } else {
                        resolve({ status: "failed", msg: "上传附件失败" });
                    }

                })
                .catch(err => {
                    logger.warn("[plan-order] db select err:" + JSON.stringify(err));
                    reject(err);
                });
        });
    },

    asyncManagerPlan: (plan_id, action, params) => {
        return new Promise((resolve, reject) => {
            switch (action) {
                case "edit":

                    break;
                case "close":

                    break;
                case "reactive":

                    break;
                default:
                    break;

            }
        });

    }


};

let courier = new Courier(export_func);
courier.listening(() => {}, 20 * 1000);