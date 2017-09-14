/* eslint-env node, mocha */

const http = require("http");
const https = require("https");
const Koa = require("koa");
const app = new Koa();
const Router = require("koa-router");
const router = Router();
const bodyParser = require("koa-bodyparser");
const koaBody = require("koa-body");
const staticServer = require("koa-static");

const RESULT = require("./codemap");
const MSG = require("../config/msg");
const DEFAULT_PORT = 3002;
const Courier = require("node-process-bearer").Courier;
const logger = require("node-process-bearer").logger.getLogger();

const _util = require("./util");

app
    .use(koaBody({ multipart: true }))
    // .use(bodyParser())
    .use(router.routes())
    .use(router.allowedMethods())
    .use(staticServer(__dirname + "/inner-page"));

let export_func = {
    name: "router"
};
let courier = new Courier(export_func);


router
    .get("/crm-inner", async(ctx, next) => {
        logger.info("[router] path: /");
        await ctx.render("login.njk", {});
        ctx.status = 200;
    })
    .post("/crm-inner/account/login", async(ctx, next) => {
        logger.info("[router] path: /account/login");
        let _ret = "";
        let postData = ctx.request.body;
        logger.info("[router] postData:%s", JSON.stringify(postData))
        try {
            await courier.sendAsyncCall("account", "asyncLogin", ret => {
                logger.info("[router] call account asyncLogin:%s", JSON.stringify(ret));
                _ret = ret;
            }, postData.user_name, postData.passwd);
        } catch (e) {
            logger.warn("[router] call account asyncLogin err:%s", JSON.stringify(ret));
        }

        if (_ret.status === RESULT.SUCCESS) {
            let info = _ret.info;
            ctx.body = { status: RESULT.SUCCESS, user_name: info.name, token: info.token };
        } else {
            ctx.body = { status: RESULT.FAILED, msg: "login failed" };
        }
    })
    .get("/crm-inner/account/active", async(ctx, next) => {
        logger.info("[router] path: /account/active");

    })
    .post("/crm-inner/account/register", async(ctx, next) => {
        logger.info("[router] path: /account/register");
    });

router
    .post("/crm-inner/plan-order/list", async(ctx, next) => {
        let _ret = "",
            verify = {};
        let postData = ctx.request.body;
        logger.info("[router] ctx.request: %s", JSON.stringify(ctx.request.body));
        if (!_util.verifyParams(postData, "token")) {
            ctx.body = { status: RESULT.PARAMS_MISSING, msg: "missing params" };
            return;
        }
        verify = await courier.sendAsyncCall("account", "asyncVerify", () => {},
            postData.token, "plan-order", "opter");
        if (verify.pass) {
            await courier.sendAsyncCall("plan-order", "asyncFetchPlan", ret => {
                _ret = { status: RESULT.SUCCESS, content: ret, msg: "fetch list end" };
            });
        } else {
            _ret = _util.verifyTokenResult(verify);
        }
        ctx.body = _ret;
    })
    .post("/crm-inner/plan-order/accept", async(ctx, next) => {
        let _ret = "",
            verify = {};
        logger.info("[router] ctx.request: %s", JSON.stringify(ctx.request.body));
        let postData = ctx.request.body;
        if (!_util.verifyParams(postData, ["token", "plan_id"])) {
            ctx.body = { status: RESULT.PARAMS_MISSING, msg: "missing params" };
            return;
        }
        verify = await courier.sendAsyncCall("account", "asyncVerify", () => {}, postData.token, "plan-order", "opter");
        logger.debug("verify:" + JSON.stringify(verify));
        if (verify.pass) {
            let opter = verify.info.name;
            await courier.sendAsyncCall("plan-order", "asyncAcceptPlan", ret => {
                logger.info("[router] accept:" + JSON.stringify(ret));
                _ret = { status: RESULT.SUCCESS, content: ret };
            }, postData.plan_id, opter);
        } else {
            _ret = _util.verifyTokenResult(verify);
        }
        ctx.body = _ret;
    })
    .post("/crm-inner/plan-order/finish", async(ctx, next) => {
        let _ret = "",
            verify = {};
        logger.info("[router] ctx.request: %s", JSON.stringify(ctx.request.body));
        let postData = ctx.request.body;
        if (!_util.verifyParams(postData, ["token", "plan_id"])) {
            ctx.body = { status: RESULT.PARAMS_MISSING, msg: "missing params" };
            return;
        }
        verify = await courier.sendAsyncCall("account", "asyncVerify", () => {}, postData.token, "plan-order", "opter");
        logger.debug("verify:" + JSON.stringify(verify));
        if (verify.pass) {
            let opter = verify.info.name;
            await courier.sendAsyncCall("plan-order", "asyncFinishPlan", ret => {
                logger.info("[router] accept:" + JSON.stringify(ret));
                _ret = { status: RESULT.SUCCESS, content: ret };
            }, postData.plan_id, opter);
        } else {
            _ret = _util.verifyTokenResult(verify);
        }
        ctx.body = _ret;
    })
    .post("/crm-inner/plan-order/upload", async(ctx, next) => {
        let _ret = "",
            verify = {};

        logger.info("[router] ctx.request: %s", JSON.stringify(ctx.request.body));
        let postData = ctx.request.body;
        if (!_util.verifyParams(postData.fields, ["token", "plan_id"])) {
            ctx.body = { status: RESULT.PARAMS_MISSING, msg: "missing params" };
            return;
        }
        verify = await courier.sendAsyncCall("account", "asyncVerify", () => {},
            postData.fields.token, "plan-order", "opter");
        if (verify.pass) {
            let opter = verify.info.name;
            let plan_id = postData.fields.plan_id;
            let file = postData.files.file;
            await courier.sendAsyncCall("plan-order", "asyncUploadFile", ret => {
                logger.info("[router] accept:" + JSON.stringify(ret));
                _ret = { status: RESULT.SUCCESS, content: ret };
            }, file, plan_id, opter);
        } else {
            _ret = _util.verifyTokenResult(verify);
        }
        ctx.body = _ret;
    });

router
    .post("/crm-inner/manager/add-user", async(ctx, next) => {
        let _ret = "",
            verify = {};
        logger.info("[router] ctx.request: %s", JSON.stringify(ctx.request.body));
        let postData = ctx.request.body;
        if (!_util.verifyParams(postData, ["token", "userInfo"])) {
            ctx.body = { status: RESULT.PARAMS_MISSING, msg: "missing params" };
            return;
        }
        verify = await courier.sendAsyncCall("account", "asyncVerify", () => {}, postData.token, "account", "admin");
        if (verify.pass) {
            _ret = { status: RESULT.FAILED, msg: "add failed" };

            let insert_ret = await courier.sendAsyncCall("account", "asyncAddUser", ret => {
                logger.info("[router] accept:" + JSON.stringify(ret));
                _ret = { status: RESULT.SUCCESS, content: ret };
            }, postData.userInfo);

            if (insert_ret.status === "success") {
                let info = insert_ret.ret;
                await courier.sendAsyncCall("mail", "asyncSendMail", ret => {
                    logger.info("[router] get New Mail:" + JSON.stringify(ret));
                }, info.mail, "您的账号已经创建成功", `点击此处登录：${MSG["add-user-mail"]} \n 用户名：${info.u_name} \n 密码：${info.passwd}`);
                _ret = { status: RESULT.SUCCESS, msg: "create user success" };
            }
        } else {
            _ret = _util.verifyTokenResult(verify);
        }
        ctx.body = _ret;
    })
    .get("/crm-inner/fetch-mail", async(ctx, next) => {
        let _ret = {};
        await courier.sendAsyncCall("mail", "asyncGetNewMail", ret => {
            logger.info("[router] get New Mail:" + JSON.stringify(ret));
            _ret = ret;
        });
        ctx.body = _ret;
    });

http.createServer(app.callback()).listen(DEFAULT_PORT);