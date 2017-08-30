const Courier = require("node-process-bearer").Courier;
const logger = require("node-process-bearer").logger.getLogger();
const ImapManager = require("./ImapManager");

let export_func = {
    name: "imap",
    connect: (imap_conf) => {
        logger.info("[imap] imap_conf:" + JSON.stringify(imap_conf));

        this.imapManager = new ImapManager(imap_conf);
        this.imapManager.connect();
        return "connected";
    },

    getNewMail: async() => {
        try {
            return await this.imapManager.getUnseenMail();
        } catch (e) {
            logger.error("[imap] getNewMail error:" + JSON.stringify(e));
            return e;
        }
    },

    openInbox: () => {

    },

    sendVerify: (...args) => {
        logger.info(`[imap] args: ${JSON.stringify(args)}`);
        courier.sendCall("account", "verify", ret => {
            logger.info("[testModule2] callModule1:" + JSON.stringify(ret));
        }, { username: "aaa", passwd: "aaa" });
    }
};

let courier = new Courier(export_func);
courier.listen();