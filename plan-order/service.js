const Courier = require("node-process-bearer").Courier;
const logger = require("node-process-bearer").logger.getLogger();

let export_func = {
    name: "plan-order",
};

let courier = new Courier(export_func);
courier.listening();