const Courier = require("node-process-bearer").Courier;
const logger = require("node-process-bearer").logger.getLogger();
const mysql = require("mysql");
let request = require("request");
const fs = require("fs");

const CONFIG = require("../config/censor.json");

const QUERY_LIMIT = CONFIG.QUERY_LIMIT;

let export_func = {
    name: "censor",
    asyncFetchMaterialFromDB: (...dates) => {
        return new Promise((resolve, reject) => {
            let params_date = ["material", dates[0], dates[1] || dates[0]];
            logger.info("[censor] params_date: %s", JSON.stringify(params_date));
            let SQL_QUERY_DSP_COUNT = "SELECT dsp, COUNT(dsp) as count FROM ?? WHERE m_date >= ? AND m_date <= ? GROUP BY dsp";
            SQL_QUERY_DSP_COUNT = mysql.format(SQL_QUERY_DSP_COUNT, params_date);
            courier.sendAsyncCall("dbopter", "asyncQuery", "", "market_db", SQL_QUERY_DSP_COUNT)
                .then(ret => {
                    let orgDspArr = ret.ret;
                    let dspArr = [];
                    orgDspArr.forEach(dsp => {
                        if (parseInt(dsp.count) < QUERY_LIMIT) {
                            dspArr.push("'" + dsp.dsp + "'");
                        };
                    });
                    logger.info("[dspArr] dspArr:%s", dspArr.toString());
                    if (dspArr.length < 1) {
                        return Promise.reject({ status: "error", msg: "data not exist" });
                        // resolve([]);
                    } else {
                        let sql_opt = `SELECT * FROM material WHERE m_date >= '${dates[0]}' AND m_date <= '${dates[1] || dates[0]}'
                        AND dsp IN (${dspArr.toString()})`;
                        return courier.sendAsyncCall("dbopter", "asyncQuery", "", "market_db", sql_opt);
                    }
                })
                .then(ret => {
                    resolve(ret);
                })
                .catch(err => {
                    logger.warn("[censor] db select err:" + JSON.stringify(err));
                    if (err) {
                        reject(err);
                    } else {
                        reject();
                    }
                });
        });
    },

    asyncInsertData: (dateS, data) => {
        let dateStr = dateS.replace(/(\/|\-)/gi, "");
        logger.info("[censor] insert data: %s", data);
        let neo_datas = JSON.parse(data).map(item => {
            return [item.tu, item.dsp, dateStr, item.ldp, item.material, item.pv];
        });
    },

    insertMaterialIntoDB: (dateS) => {
        let dateStr = dateS.replace(/(\/|\-)/gi, "");
        request(`${CONFIG.materialUrl}?date=${dateStr}`, (error, response, body) => {
            if (error) {
                logger.error(`[censor] request material err: ${JSON.stringify(error)}`);
            } else if (response.statusCode === 200 && body) {
                let params = JSON.parse(body);
                if (params.code === 200) {
                    let datas = params.data;
                    let neo_datas = datas.map(item => {
                        return [item.tu, item.dsp, dateStr, item.ldp, item.material, item.pv];
                    });
                    let sql_opt = "INSERT INTO material (tu, dsp, m_date, ldp, material, pv) VALUES ?";
                    sql_opt = mysql.format(sql_opt, [neo_datas]);
                    courier.sendAsyncCall("dbopter", "asyncQuery", "", "market_db", sql_opt)
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

    asyncUpdateStatus: (ids, action, reason, m_version, opter) => {
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
                m_version: parseInt(m_version) + 1,
                opter: opter
            };
            if (reason) params.reason = reason;
            if (!Array.isArray(ids)) {
                resolve({ status: "failed", msg: "参数类型错误！" });
                return;
            }
            let conditions = `_id IN (${ids.toString()}) AND m_version <= ${parseInt(m_version)}`;
            courier.sendAsyncCall("dbopter", "asyncUpdate", "", "market_db", "material", params, conditions)
                .then(ret => {
                    if (ret.status === "success") {
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

    asyncReport: (orgDateStr, to, opter) => {
        let dateStr = orgDateStr.replace(/(\/|\-)/gi, "");
        return new Promise((resolve, reject) => {
            let sql_query_count = " SELECT m_status, COUNT(*) AS count FROM material WHERE m_date = ? GROUP BY m_status ";
            sql_query_count = mysql.format(sql_query_count, [orgDateStr]);

            let sql_opt = "SELECT tu, dsp, ldp, material, pv, opter, m_status, reason FROM material WHERE m_date = ? AND (m_status = 'REJECT' OR m_status = 'TBD') ";
            sql_opt = mysql.format(sql_opt, [orgDateStr]);
            let fileName = `censor_${dateStr}.csv`;
            let tempCountContent = "";
            courier.sendAsyncCall("dbopter", "asyncQuery", "", "market_db", sql_query_count)
                .then(query_count_ret => {
                    logger.info("query_count_ret: %s", JSON.stringify(query_count_ret));
                    let ret_array = query_count_ret.ret;
                    if (Array.isArray(ret_array)) {
                        ret_array.forEach(item => {
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
                            tempCountContent += `${statusStr}: ${item.count}, `;
                        });
                    }
                    logger.info("tempCountContent: %s", tempCountContent);
                    return Promise.resolve(tempCountContent);
                })
                .then(ret => {
                    logger.info("before asyncQuery");
                    return courier.sendAsyncCall("dbopter", "asyncQuery", "", "market_db", sql_opt);
                })
                .then(query_ret => {
                    logger.info("before write file");
                    let query_content = "广告位,dsp,落地页,素材链接,pv,操作者,状态,原因\n";
                    let ret_array = query_ret.ret;
                    if (Array.isArray(ret_array)) {
                        ret_array.forEach(item => {
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
                            query_content += `${item.tu},${item.dsp},${item.ldp.replace(/\n/gi, "")},${item.material.replace(/\n/gi, "")},${item.pv},${item.opter},${statusStr},${item.reason || "未填写"}\n`;
                        });
                    }
                    fs.writeFile(`${CONFIG.savePath}${fileName}`, query_content, "utf8", writeRet => {
                        return Promise.resolve(writeRet);
                    });
                })
                .then(ret => {
                    logger.info("before send mail");
                    courier.sendAsyncCall("mail", "asyncSendMail", "", to,
                        `${dateStr}素材审核结果`,
                        `审核情况：\n
                         ${tempCountContent} \n
                         发送者：${opter} \n
                         拒绝及再议列表详见: \n
                         ${CONFIG.visitPath}${fileName}`,
                        ""
                    );
                    resolve({ status: "success", msg: "邮件已经发送！" });
                })
                .catch(err => {
                    logger.warn("[censor] report err:" + JSON.stringify(err));
                    reject(err);
                });
        });
    }

};

let courier = new Courier(export_func);
courier.listening(() => {
    // let today = new Date().toLocaleDateString();
    // export_func.insertMaterialIntoDB(today);
}, 86400 * 1000);