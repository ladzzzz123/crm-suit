module.exports = {
    deletePlan: (courier, plan_id, opter) => {
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
    }


};