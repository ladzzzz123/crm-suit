/* jshint esversion: 6 */

const http = require("http");
const https = require("https");
const Koa = require("koa");
const app = new Koa();

const Courier = require("node-process-bearer").Courier;
const logger = require("node-process-bearer").logger.getLogger();

let export_func = {
    name: "router"
};
let courier = new Courier(export_func);

// x-response-time
app.use(function*(next) {
    var start = new Date();
    yield next;
    var ms = new Date() - start;
    this.set("X-Response-Time", ms + "ms");
});

// logger
app.use(function*(next) {
    var start = new Date();
    yield next;
    var ms = new Date() - start;
    logger.info("%s %s - %s", this.method, this.url, ms);
});

// response
app.use(function*(next) {
    logger.info("[http] path:" + this.request.path);
    let path = this.request.path;
    this.path = path;
    yield next;
});

app.use(function*(next) {
    logger.info("[router] next" + this.path);
    let path = this.path;
    let _self = this;
    switch (true) {
        case path.includes("verify"):
            courier.sendCall("account", "verify", JSON.stringify({ username: "aaa", passwd: "bbb" }), ret => {
                logger.info("[router] call account:" + JSON.stringify(ret));
                _self.body = ret;
            });
            break;
        case path.includes("imap-call"):
            courier.sendCall("imap", "connect", "", ret => {
                logger.info("[router] call imap:" + JSON.stringify(ret));
                _self.body = ret;
            });
            break;
        default:
            break;
    }
});

app.listen(3000);