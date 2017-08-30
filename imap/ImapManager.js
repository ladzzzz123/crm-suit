/* jshint esversion:6 */
const Imap = require("imap"),
    inspect = require("util").inspect,
    fs = require("fs"),
    logger = require("node-process-bearer").logger.getLogger();

class ImapManager {
    constructor(imap_conf) {
        logger.info("[ImapMangaer] imap_conf:" + JSON.stringify(imap_conf));
        this.imap = new Imap(imap_conf);
        this.connected = false;
    }

    connect() {
        let imap = this.imap;
        imap.connect();
        logger.info("[imap] after connect called");
        imap.on("ready", (arg) => {
            logger.info("[imap] ready");
            imap.getBoxes("*", (err, ret) => {
                err ?
                    logger.info("[imap] boxes ready: %s", JSON.stringify(ret)) :
                    logger.warn("[imap] boxes error: %s", JSON.stringify(err));
            });
            this.connected = true;
        });
        imap.on("error", err => {
            logger.info("[imap] error:" + JSON.stringify(err));
        });
    }

    disconnect() {
        this.imap.end();
        this.connected = false;
    }

    fetch(result, body, callback) {
        let f = this.imap.fetch(results, { bodies: "" });
        let msgArr = [];
        f.on("message", function(msg, seqno) {
            logger.info("[ImapManager] fetch Message #%d  message:%s", seqno, JSON.stringify(msg));
            let mail_data = {};
            msg.on("body", function(stream, info) {
                logger.info(`[ImapManager] fetch Body seqno:${seqno} info:${JSON.stringify(info)}`);
                let buffer = "";
                stream.on("data", function(chunk) {
                    buffer += chunk.toString("utf8");
                });
                stream.on("end", function() {
                    mail_data = Imap.parseHeader(buffer);
                    logger.info(`[ImapManager] Mail Data seqno:${seqno} from:${mail_data.from}, subject:${mail_data.subject}`);
                    msgArr.push(mail_data);
                });
                // stream.pipe(fs.createWriteStream("msg-" + seqno + "-body.txt"));
            });
            msg.once("attributes", function(attrs) {
                imap.setFlags(attrs.uid, ["SEEN"], err => {
                    logger.error(`[ImapManager] Mail setFlag error seqno:${seqno}, error:${JSON.stringify(err)}`);
                });
            });
            msg.once("end", function() {
                logger.info(`[ImapManager] Mail fetch End seqno:${seqno}`);
                callback(msgArr);
            });
        });
    }

    getUnseenMail() {
        let _self = this;
        return new Promise((resolve, reject) => {
            let imap = _self.imap;
            if (!_self.connected) {
                logger.warn("[ImapMangaer] fetchUnseen Failed: imap disconnected");
                reject("imap disconnected");
                return;
            }
            imap.openBox("INBOX", false, (err, box) => {
                if (err) {
                    logger.error("[ImapManager] open Inbox err:%s", JSON.stringify(err));
                    reject("open inbox error");
                } else {
                    logger.info("[ImapManager] open Inbox box:%s", JSON.stringify(box));
                    imap.search(["UNSEEN", "1:*"], function(err, results) {
                        if (err) {
                            logger.error("[ImapManager] err:%s", JSON.stringify(e));
                            reject("search error");
                        }
                        fetch(results, { bodies: "" }, mailArr => {
                            resolve(mailArr);
                        });

                        // f.once("error", function(err) {
                        //     console.log("Fetch error: " + err);
                        // });
                        // f.once("end", function() {
                        //     console.log("Done fetching all messages!");
                        //     imap.end();
                        // });
                    });
                }
            });
        });
    }

    delBox(boxName) {
        this.imap.delBox(boxName, err => {
            logger.error("[ImapManager] del box err:%s", JSON.stringify(err));
        });
    }

}



module.exports = ImapManager;