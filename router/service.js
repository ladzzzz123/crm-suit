/* eslint-env node, mocha */

const http = require("http");
const https = require("https");

const Koa = require("koa");
const app = new Koa();

const Router = require("koa-router");
const router = Router();

const DEFAULT_PORT = 3002;
const Courier = require("node-process-bearer").Courier;
const logger = require("node-process-bearer").logger.getLogger({
    logLevel: 0, // see detail @LOG_LEVEL
    showLineNumber: false, // value @[true, false], show line number or not
});
const config = require("../config/service");

let export_func = {
    name: "router"
};
let courier = new Courier(export_func);

function init() {
    logger.info("[router] imapConfig:" + JSON.stringify(config.imap));
    courier.sendCall("imap", "connect", ret => {
        logger.info("============================================");
        logger.info("[router] connect imap:" + JSON.stringify(ret));
    }, config.imap);
}
init();


router
    .get("/", (ctx, next) => {
        logger.info("[router] path: /");
        ctx.body = "Hello World!";
        ctx.status = 200;
    })
    .get("/account", (ctx, next) => {
        logger.info("[router] path: /account");
        courier.sendCall("account", "verify", ret => {
            logger.info("[router] call account:" + JSON.stringify(ret));
            ctx.body = ret;
            next(ret);
        }, { username: "aaa", passwd: "bbb" });
    })
    .get("/account/login", (ctx, next) => {
        logger.info("[router] path: /account/login");
    })
    .post("/account/register", (ctx, next) => {
        logger.info("[router] path: /account/register");
    });

router.get("/imap-call", (ctx, next) => {
    courier.sendCall("imap", "getNewMail", ret => {
        logger.info("[router] get New Mail:" + JSON.stringify(ret));
    });
});

app
    .use(router.routes())
    .use(router.allowedMethods());

http.createServer(app.callback()).listen(DEFAULT_PORT);