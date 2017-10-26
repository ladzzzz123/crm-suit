const Imap = require("imap"),
    MailParser = require("mailparser").MailParser,
    simpleParser = require("mailparser").simpleParser,
    inspect = require("util").inspect,
    fs = require("fs"),
    logger = require("node-process-bearer").logger.getLogger();
const cheerio = require("cheerio");

class ImapManager {
    constructor(imap_conf) {
        logger.info("[ImapMangaer] imap_conf:" + JSON.stringify(imap_conf));
        this.imap = new Imap(imap_conf);
        this.connected = false;
        this.fileSavePath = imap_conf.savePath || "./";
        this.visitPath = imap_conf.visitPath || "./";
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

    async saveAttach(attachments, callback) {
        try {
            if (Array.isArray(attachments)) {
                let files_urls = [];
                for (let index = 0; index < attachments.length; index++) {
                    let attach = attachments[index];
                    await fs.writeFileSync(`${this.fileSavePath}${attach.filename}`, attach.content);
                    files_urls.push(`${this.visitPath}${attach.filename}`);
                }
                callback(files_urls);
            } else {
                callback([]);
            }
        } catch (e) {
            logger.error(`saveAttach Error:${JSON.stringify(e)}`);
            callback([]);
        }
    };

    fetch(results, body, callback) {
        let imap = this.imap;
        let _self = this;
        if (results.length < 1) {
            logger.debug("[fetch] fetch result empty");
            callback(null);
            return;
        }
        let f = this.imap.fetch(results, { bodies: "" });
        logger.warn(`[mail] results length: ${results.length}`);
        let msgArr = [];
        let fetchSet = new Set();
        let canSetReaded = false;
        f.on("message", function(msg, seqno) {
            logger.info("[ImapManager] fetch Message #%d  message:%s", seqno, JSON.stringify(msg));
            fetchSet.add(seqno);
            msg.on("body", async function(stream, info) {
                try {
                    let mail = await simpleParser(stream);
                    logger.warn(`[ImapManager] mail keys:${JSON.stringify(Object.keys(mail))}`);

                    let title = mail.subject || "";
                    let m_from = mail.from.value[0].address;
                    let m_cc = "";
                    if (mail.cc && mail.cc.value && Array.isArray(mail.cc.value)) {
                        m_cc = mail.cc.value.map(cc => {
                            return cc.address;
                        });
                    }
                    let m_to = mail.to.value[0].address || "";
                    let m_date = new Date(mail.date) || new Date();
                    let $ = cheerio.load(mail.html);
                    let m_content = $("div").text() || "";
                    logger.warn(`[ImapManager] mail m_content:${m_content}`);

                    let neoMail = {
                        title: title,
                        m_from: m_from,
                        m_to: m_to,
                        m_cc: m_cc.toString(),
                        m_date: m_date,
                        m_content: mail.html,
                    };
                    neoMail.m_attachments = "";
                    if (mail.attachments) {
                        _self.saveAttach(mail.attachments, m_attachments => {
                            neoMail.m_attachments = m_attachments.toString();
                            fetchSet.delete(seqno);
                            msgArr.push(neoMail);
                            if (fetchSet.size < 1) {
                                callback(msgArr);
                            }
                        });
                    } else {
                        msgArr.push(neoMail);
                        if (fetchSet.size < 1) {
                            callback(msgArr);
                        }
                    }
                } catch (err) {
                    logger.error("simpleParse Error:%s", JSON.stringify(err));
                    callback([]);
                }
            });

            msg.on("attributes", (attrs) => {
                imap.setFlags(attrs.uid, ["SEEN"], err => {
                    if (err) {
                        logger.error(`[ImapManager] Mail setFlag error seqno:${seqno}, error:${JSON.stringify(err)}`);
                    } else {
                        logger.warn(`[ImapManager] Mail attributes keys: ${JSON.stringify(Object.keys(attrs))}`);
                        logger.warn(`[ImapManager] Mail attributes values: ${JSON.stringify(Object.values(attrs))}`);
                    }
                });
            });
            msg.on("end", () => {
                logger.info(`[ImapManager] Mail fetch End seqno:${seqno}`);
            });
        });
    }

    fetchNewMail() {
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