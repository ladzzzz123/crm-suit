/* eslint-env node, mocha */
const http = require("http");
const https = require("https");
const Koa = require("koa");
const app = new Koa();
const Router = require("koa-router");
const router = Router();
const koaBody = require("koa-body");

const RESULT = require("./codemap");
const MSG = require("../config/mail").msg;
const DEFAULT_PORT = 3002;
const Courier = require("node-process-bearer").Courier;
const logger_conf = require("../conf.json").log_conf || "";
const logger = require("node-process-bearer").logger.getLogger();
const _util = require("./util");

app
    .use(koaBody({ multipart: true, formLimit: 1024 * 1024 * 10 }))
    .use(router.routes())
    .use(router.allowedMethods());

let export_func = {
    name: "router"
};
let courier = new Courier(export_func);

async function verifyToken(ctx, module_name, role) {
    let _ret = "",
        verify = {};
    let postData = ctx.request.body;
    logger.warn("verifyToken postData: %s", JSON.stringify(postData));

    let verifyData = postData["fields"] || postData;
    if (!_util.verifyParams(verifyData, "token")) {
        ctx.body = { status: RESULT.PARAMS_MISSING, msg: "missing token!" };
        return false;
    }
    logger.warn("before verify");
    verify = await courier.sendAsyncCall("account", "asyncVerify", "",
        verifyData.token, module_name, role);
    logger.warn("after verify");
    logger.warn("verify:%s", JSON.stringify(verify));
    return verify;
}

// account module start
router
    .get("/crm-inner", async(ctx, next) => {
        logger.info("[router] path: /");
        ctx.redirect("/crm-inner/pages/index.html");
    })
    .post("/crm-inner/account/login", async(ctx, next) => {
        logger.info("[router] path: /account/login");
        let _ret = "";
        let postData = ctx.request.body;
        try {
            _ret = await courier.sendAsyncCall("account", "asyncLogin", "", postData.u_name, postData.passwd);
        } catch (e) {
            logger.warn("[router] call account asyncLogin err:%s", JSON.stringify(ret));
        }
        if (_ret.status === RESULT.SUCCESS) {
            let info = _ret.info;
            ctx.body = {
                status: RESULT.SUCCESS,
                u_name: info.u_name,
                nick_name: info.nick_name || "",
                sex: info.sex || "",
                phone: info.phone || "",
                mail: info.mail || "",
                u_status: info.u_status || "",
                token: info.token,
                roleInfo: info.roleInfo || []
            };
        } else {
            ctx.body = { status: RESULT.LOGIN_FAILED, msg: "login failed" };
        }
    })
    .get("/crm-inner/account/active", async(ctx, next) => {
        logger.info("[router] path: /account/active");
    })
    .post("/crm-inner/account/register", async(ctx, next) => {
        logger.info("[router] path: /account/register");
    })
    .post("/crm-inner/account/edit", async(ctx, next) => {
        logger.info("[router] path: /account/edit");
        let _ret = "",
            verify = {};
        let postData = ctx.request.body;
        if (!_util.verifyParams(postData, ["token", "info"])) {
            ctx.body = { status: RESULT.PARAMS_MISSING, msg: "missing params" };
            return;
        }
        if (_util.verifyParams(postData.info, ["nick_name", "sex", "phone"])) {
            // update user info
        } else if (_util.verifyParams(postData.info, ["old_passwd", "passwd"])) {
            // update passwd
        } else {
            ctx.body = { status: RESULT.PARAMS_MISSING, msg: "missing params" };
            return;
        }

        verify = await courier.sendAsyncCall("account", "asyncVerify", "",
            postData.token, "account", "opter");
        if (verify.pass) {
            let opter = verify.info.u_name;
            postData.info.old_passwd = postData.info.old_passwd;
            postData.info.passwd = postData.info.passwd;
            await courier.sendAsyncCall("account", "asyncUpdateInfo", "", opter, postData.info)
                .then(ret => {
                    _ret = { status: RESULT.SUCCESS, msg: "update info success" };
                })
                .catch(err => {
                    _ret = { status: RESULT.REQ_ERROR, msg: "unknown error" };
                });
        } else {
            _ret = _util.verifyTokenResult(verify);
        }
        ctx.body = _ret;

    });
// account module end


// plan-order module start
router
    .post("/crm-inner/plan-order/list", async(ctx, next) => {
        let _ret = "";
        let verify = await verifyToken(ctx, "plan-order", "opter");
        if (!verify) {
            return;
        } else if (verify.pass) {
            await courier.sendAsyncCall("plan-order", "asyncFetchPlan")
                .then(ret => {
                    _ret = { status: RESULT.SUCCESS, content: ret, msg: "fetch list end" };
                })
                .catch(err => {
                    _ret = { status: RESULT.REQ_ERROR, msg: "unknown error" };
                });
        } else {
            _ret = _util.verifyTokenResult(verify);
        }
        ctx.body = _ret;
    })
    .post("/crm-inner/plan-order/notice-add", async(ctx, next) => {
        let verify = await verifyToken(ctx, "plan-order", "opter");
        if (!verify) {
            return;
        } else if (verify.pass) {
            let _ret = await courier.sendAsyncCall("mail", "asyncAddToNoticeArray", "", verify.info.mail);
            logger.warn("[router] notice-add ret: %s", _ret);
            if (_ret) {
                ctx.body = { status: RESULT.SUCCESS, msg: "add success" };
            } else {
                ctx.body = { status: RESULT.REQ_ERROR, msg: "Internal Error" };
            }
        } else {
            ctx.body = _util.verifyTokenResult(verify);
        }
    })
    .post("/crm-inner/plan-order/notice-remove", async(ctx, next) => {
        let verify = await verifyToken(ctx, "plan-order", "opter");
        if (!verify) {
            return;
        } else if (verify.pass) {
            let _ret = await courier.sendAsyncCall("mail", "asyncRemoveFromNoticeArray", "", verify.info.mail)
            logger.warn("[router] notice-remove ret: %s", _ret);
            if (_ret) {
                ctx.body = { status: RESULT.SUCCESS, msg: "add success" };
            } else {
                ctx.body = { status: RESULT.REQ_ERROR, msg: "Internal Error" };
            }
        } else {
            ctx.body = _util.verifyTokenResult(verify);
        }
    })
    .post("/crm-inner/plan-order/manager", async(ctx, next) => {
        let verify = await verifyToken(ctx, "plan-order", "admin");
        if (!verify) {
            return;
        } else if (verify.pass) {
            let postData = ctx.request.body;
            if (!_util.verifyParams(postData, ["action", "plan_id"])) {
                ctx.body = { status: RESULT.PARAMS_MISSING, msg: "missing params" };
                return;
            }
            let opter = verify.info.u_name;
            try {
                let ret = await courier.sendAsyncCall("plan-order", "asyncManagerPlan", "",
                    postData.action, postData.plan_id, opter);
                if (ret) {
                    logger.info("[router] plan manager ret:%s", JSON.stringify(ret));
                } else {
                    logger.info("[router] plan manager ret is null");
                }
                if (ret && ret["url"]) {
                    ctx.body = { status: RESULT.SUCCESS, msg: "fetch success", url: ret.url };
                } else {
                    ctx.body = { status: RESULT.SUCCESS, msg: "opt success" };
                }
            } catch (e) {
                ctx.body = { status: RESULT.REQ_ERROR, msg: "Internal Error" };
            }
        } else {
            ctx.body = _util.verifyTokenResult(verify);
        }
    })
    .post("/crm-inner/plan-order/accept", async(ctx, next) => {
        let _ret = "",
            verify = {};
        let postData = ctx.request.body;
        if (!_util.verifyParams(postData, ["token", "plan_id"])) {
            ctx.body = { status: RESULT.PARAMS_MISSING, msg: "missing params" };
            return;
        }
        verify = await courier.sendAsyncCall("account", "asyncVerify", "", postData.token, "plan-order", "opter");
        if (verify.pass) {
            let opter = verify.info.u_name;
            let ret = await courier.sendAsyncCall("plan-order", "asyncAcceptPlan", "", postData.plan_id, opter);
            logger.info("[router] accept:" + JSON.stringify(ret));
            _ret = { status: RESULT.SUCCESS, content: ret };
        } else {
            _ret = _util.verifyTokenResult(verify);
        }
        ctx.body = _ret;
    })
    .post("/crm-inner/plan-order/finish", async(ctx, next) => {
        let _ret = "",
            verify = {};
        let postData = ctx.request.body;
        if (!_util.verifyParams(postData, ["token", "plan_id"])) {
            ctx.body = { status: RESULT.PARAMS_MISSING, msg: "missing params" };
            return;
        }
        verify = await courier.sendAsyncCall("account", "asyncVerify", "", postData.token, "plan-order", "opter");
        if (verify.pass) {
            let opter = verify.info.u_name;
            let ret = await courier.sendAsyncCall("plan-order", "asyncFinishPlan", "", postData.plan_id, opter);
            _ret = { status: RESULT.SUCCESS, content: ret };
        } else {
            _ret = _util.verifyTokenResult(verify);
        }
        ctx.body = _ret;
    })
    .post("/crm-inner/plan-order/upload", async(ctx, next) => {
        let _ret = "",
            verify = {};

        let postData = ctx.request.body;
        logger.info("[router] upload postData.keys(): %s", Object.keys(postData));
        if (!_util.verifyParams(postData.fields, ["token", "plan_id"])) {
            logger.info("[router] upload: missing params");
            ctx.body = { status: RESULT.PARAMS_MISSING, msg: "missing params" };
            return;
        }
        verify = await courier.sendAsyncCall("account", "asyncVerify", "",
            postData.fields.token, "plan-order", "opter");
        if (verify.pass) {
            let opter = verify.info.u_name;
            let plan_id = postData.fields.plan_id;
            let file = postData.files.file;
            let ret = await courier.sendAsyncCall("plan-order", "asyncUploadFile", "", file, plan_id, opter);
            logger.info("[router] upload ret:" + JSON.stringify(ret));
            _ret = { status: RESULT.SUCCESS, content: ret };
        } else {
            _ret = _util.verifyTokenResult(verify);
        }
        ctx.body = _ret;
    });
// plan-order module end

// censor module start
router
    .post("/crm-inner/censor", async(ctx, next) => {
        let verify = await verifyToken(ctx, "censor", "opter");
        if (!verify) {
            return;
        } else if (verify.pass) {
            ctx.body = { status: RESULT.SUCCESS, msg: "verify pass" };
        } else {
            ctx.body = _util.verifyTokenResult(verify);
        }
    })
    .post("/crm-inner/censor/query-update", async(ctx, next) => {
        let verify = await verifyToken(ctx, "censor", "opter");
        if (!verify) {
            return;
        } else if (verify.pass) {
            let postData = ctx.request.body;
            let _ret = {};
            await courier.sendCall("censor", "insertMaterialIntoDB", "", postData.date)
                .then(ret => {
                    _ret = { status: RESULT.SUCCESS, msg: "update query success" };
                })
                .catch(err => {
                    _ret = { status: RESULT.REQ_ERROR, msg: "Internal Error" };
                });
            ctx.body = _ret;
        } else {
            ctx.body = _util.verifyTokenResult(verify);
        }
    })
    .post("/crm-inner/censor/fetch", async(ctx, next) => {
        let verify = await verifyToken(ctx, "censor", "opter");
        if (!verify) {
            return;
        } else if (verify.pass) {
            let postData = ctx.request.body;
            if (!_util.verifyParams(postData, "m_date")) {
                ctx.body = { status: RESULT.PARAMS_MISSING, msg: "missing params" };
            }
            try {
                let ret = await courier.sendAsyncCall("censor", "asyncFetchMaterialFromDB", "", postData.m_date);
                ctx.body = { status: RESULT.SUCCESS, content: ret, msg: "fetch list end" };
            } catch (e) {
                ctx.body = { status: RESULT.SUCCESS, content: [], msg: JSON.stringify(e) };
            }
        } else {
            ctx.body = _util.verifyTokenResult(verify);
        }
    })
    .post("/crm-inner/censor/update", async(ctx, next) => {
        let verify = await verifyToken(ctx, "censor", "opter");
        if (!verify) {
            return;
        } else if (verify.pass) {
            let opter = verify.info.u_name;
            let postData = ctx.request.body;
            if (!_util.verifyParams(postData, ["ids", "action", "m_version"])) {
                ctx.body = { status: RESULT.PARAMS_MISSING, msg: "missing params" };
            }
            let reason = postData.reason || "";
            await courier.sendAsyncCall("censor", "asyncUpdateStatus", "",
                    postData.ids, postData.action, reason, postData.m_version, opter)
                .then(ret => {
                    if (ret.status === "success") {
                        ctx.body = { status: RESULT.SUCCESS, msg: ret.msg };
                    } else {
                        ctx.body = { status: RESULT.FAILED, msg: ret.msg };
                    }
                })
                .catch(e => {
                    ctx.body = { status: RESULT.REQ_ERROR, msg: "Internal Error" };
                });
        } else {
            ctx.body = _util.verifyTokenResult(verify);
        }
    })
    .post("/crm-inner/censor/report", async(ctx, next) => {
        let verify = await verifyToken(ctx, "censor", "opter");
        if (!verify) {
            return;
        } else if (verify.pass) {
            let opter = verify.info.u_name;
            let postData = ctx.request.body;
            if (!_util.verifyParams(postData, ["to", "m_date"])) {
                ctx.body = { status: RESULT.PARAMS_MISSING, msg: "missing params" };
            }
            let ret = await courier.sendAsyncCall("censor", "asyncReport", "", postData.m_date, postData.to, opter);
            if (ret.status === "success") {
                ctx.body = { status: RESULT.SUCCESS, msg: ret.msg };
            } else {
                ctx.body = { status: RESULT.REQ_ERROR, msg: "内部错误" };
            }
        } else {
            ctx.body = _util.verifyTokenResult(verify);
        }
    })
    .post("/crm-inner/censor-data", async(ctx, next) => {
        let postData = ctx.request.body;
        logger.info("[router] censor data: %s", JSON.stringify(postData));
        if (!_util.verifyParams(postData, ["date", "data"])) {
            ctx.body = { status: RESULT.PARAMS_MISSING, msg: "missing params" };
        }
        await courier.sendAsyncCall("censor", "asyncInsertData", "", postData.date, postData.data)
            .then(ret => {
                if (ret.status === "success") {
                    ctx.body = { status: RESULT.SUCCESS, msg: ret.msg };
                } else {
                    ctx.body = { status: RESULT.FAILED, msg: ret.msg };
                }
            })
            .catch(e => {
                ctx.body = { status: RESULT.REQ_ERROR, msg: "Internal Error" };
            });
    });
// censor module end

// account admin start
router
    .post("/crm-inner/admin", async(ctx, next) => {
        let verify = await verifyToken(ctx, "account", "admin");
        if (!verify) {
            return;
        } else if (verify.pass) {
            ctx.body = { status: RESULT.SUCCESS, msg: "verify pass" };
        } else {
            ctx.body = _util.verifyTokenResult(verify);
        }
    })
    .post("/crm-inner/admin/update-role", async(ctx, next) => {
        let verify = await verifyToken(ctx, "account", "admin");
        if (!verify) {
            return;
        } else if (verify.pass) {
            let postData = ctx.request.body;
            if (!_util.verifyParams(postData, ["u_name", "module", "role_name"])) {
                ctx.body = { status: RESULT.PARAMS_MISSING, msg: "missing params" };
                return;
            }
            let update_ret = await courier.sendAsyncCall("account", "asyncUpdateRole",
                "", postData.u_name, postData.module, postData.role_name);
            if (update_ret.status === "success") {
                ctx.body = { status: RESULT.SUCCESS, msg: "update success" };
            } else {
                ctx.body = { status: RESULT.FAILED, msg: JSON.stringify(update_ret) };
            }
        } else {
            ctx.body = _util.verifyTokenResult(verify);
        }
    })
    .post("/crm-inner/admin/add-user", async(ctx, next) => {
        let _ret = "",
            verify = {};
        logger.info("[router] ctx.request: %s", JSON.stringify(ctx.request.body));
        let postData = ctx.request.body;
        if (!_util.verifyParams(postData, ["token", "userInfo"])) {
            ctx.body = { status: RESULT.PARAMS_MISSING, msg: "missing params" };
            return;
        }
        verify = await courier.sendAsyncCall("account", "asyncVerify", "", postData.token, "account", "admin");
        logger.info("[router] verify: %s", JSON.stringify(verify));
        if (verify.pass) {
            _ret = { status: RESULT.FAILED, msg: "add failed" };
            let insert_ret = await courier.sendAsyncCall("account", "asyncAddUser", "", postData.userInfo);
            logger.info("[router] add user insert_ret: %s", JSON.stringify(insert_ret));
            if (insert_ret.status === "success") {
                let info = insert_ret.ret;
                let ret = await courier.sendAsyncCall("mail", "asyncSendMail", "", info.mail,
                    "您的账号已经创建成功", `点击此处登录：${MSG["add-user-mail"]["address"]}  \n 用户名：${info.u_name} \n 密码：${info.passwd}`);
                logger.info("[router] get New Mail:" + JSON.stringify(ret));
                _ret = { status: RESULT.SUCCESS, msg: "create user success" };
            }
        } else {
            _ret = _util.verifyTokenResult(verify);
        }
        ctx.body = _ret;
    })
    .get("/crm-inner/admin/fetch-mail", async(ctx, next) => {
        let _ret = await courier.sendAsyncCall("mail", "asyncGetNewMail");
        ctx.body = _ret;
    });
// account admin end



// ad-preview module start
router
    .post("/crm-inner/ad-preview/upload", async(ctx, next) => {
        let verify = await verifyToken(ctx, "ad-preview", "opter");
        if (!verify) {
            return;
        } else if (verify.pass) {
            let postData = ctx.request.body;
            if (!_util.verifyParams(postData.fields, ["ad_pos"])) {
                logger.info("[router] upload: missing params");
                ctx.body = { status: RESULT.PARAMS_MISSING, msg: "missing params" };
                return;
            }
            let opter = verify.info.u_name;
            let ad_pos = postData.fields.ad_pos;
            let file = postData.files.file;

            let ret = await courier.sendAsyncCall("ad-preview", "asyncUploadFile", "", file, ad_pos, opter);
            logger.info("[router] upload ret:" + JSON.stringify(ret));
            ctx.body = { status: RESULT.SUCCESS, content: ret };
        } else {
            ctx.body = _util.verifyTokenResult(verify);
        }
    });
// ad-preview module end

// earnings module start
router
    .post("/crm-inner/earnings", async(ctx, next) => {
        let verify = await verifyToken(ctx, "earnings", "opter");
        if (!verify) {
            return;
        } else if (verify.pass) {
            ctx.body = { status: RESULT.SUCCESS, msg: "verify pass" };
        } else {
            ctx.body = _util.verifyTokenResult(verify);
        }
    })
    .post("/crm-inner/earnings/opt", async(ctx, next) => {
        let verify = await verifyToken(ctx, "earnings", "opter");
        if (!verify) {
            return;
        } else if (verify.pass) {
            let postData = ctx.request.body;
            if (!_util.verifyParams(postData, "m_date", "action")) {
                ctx.body = { status: RESULT.PARAMS_MISSING, msg: "missing params" };
            }
            let dateArr = [];
            if (Array.isArray(postData.m_date) && postData.m_date.length > 0) {
                if (postData.m_date.length > 1) {
                    dateArr.push(postData.m_date[0]);
                    dateArr.push(postData.m_date[1]);
                } else {
                    dateArr.push(postData.m_date[0], postData.m_date[0]);
                }
            } else {
                dateArr.push(postData.m_date, postData.m_date);
            }
            logger.info("[router] dateArr: %s", JSON.stringify(dateArr));
            try {
                let ret = await courier.sendAsyncCall("earnings", "asyncOpt", "", postData.action, dateArr[0], dateArr[1]);
                ctx.body = { status: RESULT.SUCCESS, content: ret, msg: "opt end" };
            } catch (e) {
                ctx.body = { status: RESULT.FAILED, content: [], msg: JSON.stringify(e) };
            }
        } else {
            ctx.body = _util.verifyTokenResult(verify);
        }
    })
    .post("/crm-inner/earnings/admin-opt", async(ctx, next) => {
        let verify = await verifyToken(ctx, "earnings", "admin");
        if (!verify) {
            return;
        } else if (verify.pass) {
            let postData = ctx.request.body;
            if (!_util.verifyParams(postData, "params", "action")) {
                ctx.body = { status: RESULT.PARAMS_MISSING, msg: "missing params" };
            }
            try {
                let ret = await courier.sendAsyncCall("earnings", "asyncAdminOpt", "",
                    postData.action, postData.params);
                ctx.body = { status: RESULT.SUCCESS, content: ret, msg: "admin opt end" };
            } catch (e) {
                ctx.body = { status: RESULT.FAILED, content: [], msg: JSON.stringify(e) };
            }
        } else {
            ctx.body = _util.verifyTokenResult(verify);
        }
    });
// earnings module end

// leads-data module start
router
    .post("/crm-inner/leads-data", async(ctx, next) => {
        let verify = await verifyToken(ctx, "leads-data", "opter");
        if (!verify) {
            return;
        } else if (verify.pass) {
            ctx.body = { status: RESULT.SUCCESS, msg: "verify pass" };
        } else {
            ctx.body = _util.verifyTokenResult(verify);
        }
    })
    .post("/crm-inner/leads-data/opt", async(ctx, next) => {
        let verify = await verifyToken(ctx, "leads-data", "opter");
        if (!verify) {
            return;
        } else if (verify.pass) {
            let postData = ctx.request.body;
            if (!_util.verifyParams(postData, ["tag", "action"])) {
                ctx.body = { status: RESULT.PARAMS_MISSING, msg: "missing params" };
            }
            try {
                let ret = await courier.sendAsyncCall("leads-data", "asyncOpt", "", postData.action, postData.tag);
                ctx.body = { status: RESULT.SUCCESS, content: ret, msg: "opt end" };
            } catch (e) {
                ctx.body = { status: RESULT.FAILED, content: [], msg: JSON.stringify(e) };
            }
        } else {
            ctx.body = _util.verifyTokenResult(verify);
        }
    });
// leads-data module end

http.createServer(app.callback()).listen(DEFAULT_PORT);