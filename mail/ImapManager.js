const Imap = require("imap"),
    MailParser = require("mailparser").MailParser,
    simpleParser = require("mailparser").simpleParser,
    inspect = require("util").inspect,
    fs = require("fs"),
    logger = require("node-process-bearer").logger.getLogger();

class ImapManager {
    constructor(imap_conf) {
        logger.info("[ImapMangaer] imap_conf:" + JSON.stringify(imap_conf));
        this.imap = new Imap(imap_conf);
        this.connected = false;
        this.fileSavePath = imap_conf.savePath || "";
    }

    connect(callback) {
        let imap = this.imap;
        imap.connect();
        logger.info("[imap] after connect called");
        imap.on("ready", (arg) => {
            logger.info("[imap] ready");
            imap.getBoxes("INBOX", (err, ret) => {
                err ?
                    logger.warn("[imap] boxes error: %s", JSON.stringify(err)) :
                    logger.info("[imap] boxes ready: %s", JSON.stringify(ret));
            });
            this.connected = true;
            (callback) && callback(true);
        });
        imap.on("error", err => {
            logger.info("[imap] error:" + JSON.stringify(err));
            this.connected = false;
            (callback) && callback(false);
        });
    }

    disconnect() {
        this.imap.end();
        this.connected = false;
    }

    fetch(results, body, callback) {
        let imap = this.imap;
        if (results.length < 1) {
            logger.debug("[fetch] fetch result empty");
            callback(null);
            return;
        }
        let f = this.imap.fetch(results, { bodies: "" });
        let msgArr = [];
        f.on("message", function(msg, seqno) {
            logger.info("[ImapManager] fetch Message #%d  message:%s", seqno, JSON.stringify(msg));
            let mail_data = {};
            msg.on("body", function(stream, info) {
                simpleParser(stream)
                    .then(mail => {
                        logger.warn(`[ImapManager] mail keys:${JSON.stringify(Object.keys(mail))}`);
                        logger.info("simpleParse mail.date:%s", JSON.stringify(mail.date));
                        logger.info("simpleParse mail.html:%s", JSON.stringify(mail.html));
                        // logger.info("simpleParse mail.text:%s", JSON.stringify(mail.text));
                        // logger.info("simpleParse mail.textAsHtml:%s", JSON.stringify(mail.textAsHtml));
                        // logger.info("simpleParse mail.attachments:%s", JSON.stringify(mail.attachments));
                        let m_from = mail.from.value[0].address;
                        let m_cc = mail.cc.value.map(cc => {
                            return cc.address;
                        });
                        let m_to = mail.to.value[0].address;
                        let m_date = new Date(mail.date);

                        let neoMail = {
                            title: mail.subject,
                            m_from: m_from,
                            m_to: m_to,
                            m_cc: JSON.stringify(m_cc),
                            m_date: m_date,
                            m_content: mail.html,
                            // m_attachments: mail.attachments
                        };

                        // let mail_data = {
                        //     subject: mail.subject,
                        //     from: m_from,
                        //     cc: m_cc,
                        //     date: mail.date,
                        //     content: mail.html,
                        //     attachments: mail.attachments
                        // };

                        // msgArr.push(mail_data);
                        callback(neoMail);
                    })
                    .catch(err => {
                        logger.error("simpleParse Error:%s", JSON.stringify(err));
                    });
            });
            msg.on("attributes", (attrs) => {
                mail_data.uid = attrs.uid;
                // imap.setFlags(attrs.uid, ["SEEN"], err => {
                //     if (err) {
                //         logger.error(`[ImapManager] Mail setFlag error seqno:${seqno}, error:${JSON.stringify(err)}`);
                //     } else {
                //         logger.warn(`[ImapManager] Mail attributes keys: ${JSON.stringify(Object.keys(attrs))}`);
                //         logger.warn(`[ImapManager] Mail attributes values: ${JSON.stringify(Object.values(attrs))}`);
                //     }
                // });
            });
            msg.on("end", () => {
                logger.info(`[ImapManager] Mail fetch End seqno:${seqno}`);
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
                    logger.warn("[ImapManager] open Inbox err:%s", JSON.stringify(err));
                    reject("open inbox error");
                } else {
                    imap.search(["UNSEEN", "1:*"], (err, results) => {
                        if (err) {
                            logger.warn("[ImapManager] search mail err:%s", JSON.stringify(err));
                            reject("search error");
                        } else if (results) {
                            _self.fetch(results, { bodies: "" }, mailArr => {
                                resolve(mailArr);
                            });
                        } else {
                            reject("unknon error");
                        }
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