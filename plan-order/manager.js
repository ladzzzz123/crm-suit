const logger = require("node-process-bearer").logger.getLogger();
const fs = require("fs");
const CONFIG = require("./config.json");

module.exports = {
    deletePlan: (courier, plan_id, opter) => {
        return new Promise((resolve, reject) => {
            let conditions = `_id = ${plan_id}`;
            courier.sendAsyncCall("dbopter", "asyncArchived", () => {}, "market_db", "mail_info", conditions)
                .then(ret => {
                    if (ret.status === "success") {
                        resolve({ status: "success", msg: "删除任务成功" });
                    } else {
                        resolve({ status: "failed", msg: "删除任务失败" });
                    }
                })
                .catch(err => {
                    logger.warn("[plan-order] db select err:" + JSON.stringify(err));
                    reject(err);
                });
        });
    },

    exportPlan: (courier) => {
        return new Promise((resolve, reject) => {
            let SQL_QUERY_PLAN = ` SELECT title,m_from,m_cc,m_date,m_opter,m_status FROM mail_info WHERE m_module = "plan-order" `;
            courier.sendAsyncCall("dbopter", "asyncQuery", () => {}, "market_db", SQL_QUERY_PLAN)
                .then(ret => {
                    if (ret.status === "success") {
                        logger.info("[exportPlan] fetch success ret.ret:%s", JSON.stringify(ret.ret));
                        let mailArr = ret.ret;
                        if (Array.isArray(mailArr)) {
                            let content = "任务名,发起者,抄送,日期,最后操作者,当前状态\n";
                            logger.info("[exportPlan] content:%s", content);
                            mailArr.forEach(item => {
                                content += `${item.title},${item.m_from},${item.m_cc},${item.m_date},${item.m_opter},${m_status}\n`;
                            });
                            const fileName = `report_new.csv`;
                            logger.info("[exportPlan] export fileName:%s", fileName);
                            fs.writeFile(`${CONFIG.reportPath}${fileName}`, content, "utf8", writeRet => {
                                return Promise.resolve(CONFIG.reportVisitPath + fileName);
                            });
                        } else {
                            logger.warn("[exportPlan] mailArr is not array!");
                            resolve({ status: "failed", msg: "获取任务列表失败" });
                        }
                    } else {
                        resolve({ status: "failed", msg: "获取任务列表失败" });
                    }
                })
                .then(visitUrl => {
                    resolve({ status: "success", url: visitUrl });
                })
                .catch(err => {
                    logger.warn("[plan-order] db select err:" + JSON.stringify(err));
                    reject(err);
                });
        });
    },
};