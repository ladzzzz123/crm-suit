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

let export_func = {
    name: "router"
};
let courier = new Courier(export_func);

router
    .get("/", async(ctx, next) => {
        logger.info("[router] path: /");
        ctx.body = "Hello World!";
        ctx.status = 200;
    })
    .get("/account", async(ctx, next) => {
        logger.info("[router] path: /account");
        courier.sendCall("account", "verify", ret => {
            logger.info("[router] call account:" + JSON.stringify(ret));
            ctx.body = ret;
            next(ret);
        }, { username: "aaa", passwd: "bbb" });
    })
    .get("/account/login", async(ctx, next) => {
        logger.info("[router] path: /account/login");
    })
    .post("/account/register", async(ctx, next) => {
        logger.info("[router] path: /account/register");
    });


router
    .get("/plan-order", async(ctx, next) => {

    })
    .get("/plan-order/list", async(ctx, next) => {
        let _ret = "";
        await courier.sendAsyncCall("plan-order", "asyncFetchPlan", ret => {
            logger.info("[router] plan-order job list:" + JSON.stringify(ret));
            _ret = ret;
        });
        ctx.body = _ret;
    })
    .post("/plan-order/accept", async(ctx, next) => {
        let postData = await parsePostData(ctx);
        postData = JSON.parse(postData[0]);
        let _ret = "";
        logger.info("[router] postData: %s", JSON.stringify(postData));
        await courier.sendAsyncCall("plan-order", "asyncAcceptPlan", ret => {
            logger.info("[router] get New Mail:" + JSON.stringify(ret));
            _ret = ret;
        }, postData.plan_id, postData.opter);
        ctx.body = _ret;
    });


router.get("/imap-call", async(ctx, next) => {
    let _ret = {};
    await courier.sendAsyncCall("mail", "asyncGetNewMail", ret => {
        logger.info("[router] get New Mail:" + JSON.stringify(ret));
        _ret = ret;
    });
    ctx.body = _ret;
});

router.get("/send-mail-test", async(ctx, next) => {
    let _ret = {};
    await courier.sendAsyncCall("mail", "asyncSendMail", ret => {
        logger.info("[router] get New Mail:" + JSON.stringify(ret));
        _ret = ret;
    }, "songshan.xu@cootek.cn", "test", "content is testing");
    ctx.body = _ret;
});

app
    .use(router.routes())
    .use(router.allowedMethods());

http.createServer(app.callback()).listen(DEFAULT_PORT);


// 解析上下文里node原生请求的POST参数
function parsePostData(ctx) {
    return new Promise((resolve, reject) => {
        try {
            let postdata = "";
            ctx.req.addListener("data", (data) => {
                postdata += data;
            });
            ctx.req.addListener("end", function() {
                let parseData = parseQueryStr(postdata);
                resolve(parseData);
            });
        } catch (err) {
            reject(err);
        }
    });
}

// 将POST请求参数字符串解析成JSON
function parseQueryStr(queryStr) {
    let queryData = {};
    let queryStrList = queryStr.split('&');
    console.log(queryStrList);
    for (let [index, queryStr] of queryStrList.entries()) {
        let itemList = queryStr.split('=');
        queryData[itemList[0]] = decodeURIComponent(itemList[1]);
    }
    return queryData;
}