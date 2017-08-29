/* jshint esversion: 6 */
const Courier = require("node-process-bearer").Courier;
const logger = require("node-process-bearer").logger.getLogger();
const imap = require("./process");

let export_func = {
    name: "imap",
    connect: () => {
        imap.connect();
        return "connected";
    },
    sendVerify: (...args) => {
        logger.info(`[imap] args: ${JSON.stringify(args)}`);
        courier.sendCall("account", "verify", JSON.stringify({ username: "aaa", passwd: "aaa" }), ret => {
            logger.info("[testModule2] callModule1:" + JSON.stringify(ret));
        });
    }
};

let courier = new Courier(export_func);
courier.listen();