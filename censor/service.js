const Courier = require("node-process-bearer").Courier;
const logger = require("node-process-bearer").logger.getLogger();
const mysql = require("mysql");
let request = require("request");
const fs = require("fs");

const CONFIG = require("./config.json");

let export_func = {
    name: "censor",
    asyncFetchMaterialFromDB: (...dates) => {
        return new Promise((resolve, reject) => {
            let params = ["material", dates[0], dates[1] || dates[0]];
            logger.info("[censor] params: %s", JSON.stringify(params));
            let sql_opt = "SELECT * FROM ?? WHERE m_date >= ? AND m_date <= ?";
            sql_opt = mysql.format(sql_opt, params);
            courier.sendAsyncCall("dbopter", "asyncQuery", () => {}, "market_db", sql_opt)
                .then(ret => {
                    resolve(ret);
                })
                .catch(err => {
                    logger.warn("[censor] db select err:" + JSON.stringify(err));
                    reject(err);
                });
        });
    },

    insertMaterialIntoDB: (dateS) => {
        let dateStr = dateS.replace(/(\/|\-)/gi, "");
        request(`${CONFIG.materialUrl}?date=${dateStr}`, (error, response, body) => {
            if (error) {
                logger.error(`[censor] request material err: ${JSON.stringify(err)}`);
            } else if (response.statusCode === 200 && body) {
                let params = JSON.parse(body);
                if (params.code === 200) {
                    let datas = params.data;
                    let neo_datas = datas.map(item => {
                        return [item.tu, item.dsp, dateStr, item.ldp, item.material, item.pv];
                    });
                    let sql_opt = "REPLACE INSERT INTO material (tu, dsp, m_date,ldp, material, pv) VALUES ?";
                    sql_opt = mysql.format(sql_opt, [neo_datas]);
                    courier.sendAsyncCall("dbopter", "asyncQuery", () => {}, "market_db", sql_opt)
                        .then(ret => {
                            logger.info("[censor] insert material succeed");
                        })
                        .catch(err => {
                            logger.warn("[censor] db select err:" + JSON.stringify(err));
                        });
                } else {
                    logger.info(`[censor] request material msg: ${params.msg}`);
                }
            } else {
                logger.warn("[censor] fetch material failed statusCode%s", response.statusCode);
            }
        });
        return "";
    },

    asyncUpdateStatus: (ids, action, reason, opter) => {
        return new Promise((resolve, reject) => {
            let status = "";
            switch (action) {
                case "pass":
                    status = "PASS";
                    break;
                case "denied":
                    status = "REJECT";
                    break;
                case "tbd":
                    status = "TBD";
                    break;
                default:
                    break;
            }

            let params = {
                m_status: status,
                opter: opter
            };
            if (reason) params.reason = reason;
            if (!Array.isArray(ids)) {
                resolve({ status: "failed", msg: "参数类型错误！" });
                return;
            }
            let conditions = `_id IN (${ids.toString()}) `;
            courier.sendAsyncCall("dbopter", "asyncUpdate", () => {}, "market_db", "material", params, conditions)
                .then(ret => {
                    if (ret.status === "success") {
                        // let info = {};
                        // if (Array.isArray(ret.ret) && ret.ret.length > 0) {
                        //     info = ret.ret[0];
                        // }
                        // courier.sendAsyncCall("mail", "asyncSendMail", ret => {
                        //         _ret = ret;
                        //     }, info.m_from,
                        //     `${opter} ${msg.accept_title} ${info.title}`,
                        //     `${opter} ${msg.accept_content} ${info.title}!`,
                        //     info.m_cc
                        // );
                        resolve({ status: "success", msg: "更新成功" });
                    } else {
                        resolve({ status: "failed", msg: "更新失败" });
                    }

                })
                .catch(err => {
                    logger.warn("[plan-order] db select err:" + JSON.stringify(err));
                    reject(err);
                });
        });
    },

    asyncNotice: (dateStr, to, opter) => {
        return new Promise((resolve, reject) => {
            let sql_query_count = " SELECT m_status, COUNT(*) AS count FROM material WHERE m_date = ? GROUP BY m_status ";
            sql_query_count = mysql.format(sql_query_count, [dateStr]);

            let sql_opt = "SELECT tu, dsp, ldp, material, pv, opter FROM material WHERE m_date = ? AND (m_status = 'REJECT' OR m_status = 'TBD') ";
            sql_opt = mysql.format(sql_opt, [dateStr]);
            let fileName = `censor_${dateStr}.csv`;
            let tempCountContent = "";
            courier.sendAsyncCall("dbopter", "asyncQuery", () => {}, "market_db", sql_query_count)
                .then(query_count_ret => {
                    query_count_ret.forEach(item => {
                        let statusStr = "";
                        switch (item.m_status) {
                            case "NEW":
                                statusStr = "未审核";
                                break;
                            case "PASS":
                                statusStr = "已通过";
                                break;
                            case "REJECT":
                                statusStr = "未通过";
                                break;
                            case "TBD":
                                statusStr = "再议";
                                break;
                            default:
                                break;
                        }
                        tempCountContent += `${statusStr}: ${item.count} \n`;
                    });
                    return Promise.resolve(tempCountContent);
                })
                .then(ret => {
                    return courier.sendAsyncCall("dbopter", "asyncQuery", () => {}, "market_db", sql_opt);
                })
                .then(query_ret => {
                    let query_content = "广告位,dsp,落地页,素材链接,pv,操作者\n";
                    query_ret.forEach(item => {
                        query_content += `${item.tu},${item.dsp},${item.ldp},${item.material},${item.pv},${item.opter}\n`;
                    });
                    fs.writeFile(`${CONFIG.savePath}/${fileName}`, query_content, "utf8", writeRet => {
                        return Promise.resolve(writeRet);
                    });
                })
                .then(ret => {
                    courier.sendAsyncCall("mail", "asyncSendMail", () => {}, to,
                        `${dateStr}素材审核结果`,
                        `审核情况：${tempCountContent} \n
                         发送者：${opter} \n
                         拒绝及再议列表详见${CONFIG.visitePath}/${fileName}`,
                        ""
                    );
                    resolve({ status: "success", msg: "邮件已经发送！" });
                })
                .catch(err => {
                    logger.warn("[censor] notice err:" + JSON.stringify(err));
                    reject(err);
                });
        });
    }

};

let courier = new Courier(export_func);
courier.listening(() => {
    let today = new Date().toLocaleDateString();
    export_func.insertMaterialIntoDB(today);
}, 86400 * 1000);