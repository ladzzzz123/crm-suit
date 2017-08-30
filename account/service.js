/* jshint esversion: 6 */
const Courier = require("node-process-bearer").Courier;
const logger = require("node-process-bearer").logger.getLogger();

let export_func = {
    name: "account",
    verify: (...args) => {
        logger.info(`[account] args: ${[...args]}`);
        return false;
    }
};

let courier = new Courier(export_func);
courier.listen();