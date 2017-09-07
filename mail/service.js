const Courier = require("node-process-bearer").Courier;
const logger = require("node-process-bearer").logger.getLogger();
const ImapManager = require("./ImapManager");
const nodemailer = require("nodemailer");
const SMTPConnection = require("nodemailer/lib/smtp-connection");
const MAIL_MODULE = require("./mail_module");

const mysql = require("mysql");


let imapManager = {},
    smtpManager = {};

function promiseConnect(manager) {
    return new Promise((resolve, reject) => {
        logger.info("[mail] promiseConnect called: %s", manager.name);
        manager.connect(ret => {
            ret ? resolve(ret) : reject(ret);
        });
    });
}

let export_func = {
    name: "mail",
    imapConnect: (imap_conf) => {
        logger.info("[imap] imap_conf:" + JSON.stringify(imap_conf));
        imapManager = new ImapManager(imap_conf);
        imapManager.name = "imap";
        imapManager.connect();
        return "connected";
    },

    smtpConnect: (conf) => {
        smtpManager = nodemailer.createTransport(conf);
        smtpManager.name = "smtp";
        smtpManager.verify(function(error, success) {
            if (error) {
                logger.error("[smtp] verify error:" + JSON.stringify(error));
                if (error.code === "ETIMEDOUT") {
                    this.smtpConnect(mailConfig.smtp);
                }
            } else {
                logger.info("[smtp] Server is ready to take our messages");
                smtpManager.connected = true;
            }
        });
    },

    asyncImapConnect: () => {
        return promiseConnect(imapManager);
    },

    asyncGetNewMail: () => {
        if (!imapManager.connected) {
            return promiseConnect(imapManager)
                .then(ret => {
                    logger.info(`[imap] promiseImapConnect then: ${ret}`);
                    return imapManager.getUnseenMail();
                })
                .catch(err => {
                    logger.warn("[imap] asyncGetNewMail connect err %s", err);
                    return Promise.resolve(err);
                });
        } else {
            logger.info(`[imap] promiseImapConnect connected before getUnseenMail`);
            return imapManager.getUnseenMail();
        }
    },

    asyncSendMail: (to, subject, content, cc, attachments) => {
        let option = {
            from: mailConfig.smtp.auth.user,
            to: to,
            // bcc: "songshan.xu@cootek.cn", //bcc
            subject: subject,
            text: content
        };
        option.cc = cc || "";
        option.attachments = attachments || "";
        if (smtpManager.connected) {
            return new Promise((resolve, reject) => {
                logger.info(`[mail] before sendMail ${option.subject}`);
                try {
                    smtpManager.sendMail(option, (err, msg) => {
                        if (err) {
                            logger.info(`[mail] sendMail err: ${JSON.stringify(err)}`);
                            reject(err);
                        } else {
                            logger.info(`[mail] sendMail ret: ${JSON.stringify(msg)}`);
                            resolve(msg);
                        }
                    });
                } catch (e) {
                    logger.info(`[mail] sendMail err: ${JSON.stringify(e)}`);
                    reject(e);
                }
            });
        } else {
            promiseConnect(smtpManager)
                .then(ret => {
                    logger.info(`[mail] before sendMail ${option.subject}`);
                    return new Promise((resolve, reject) => {
                        smtpManager.sendMail(options, function(err, msg) {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(msg);
                            }
                        });
                    });
                })
                .catch(err => {
                    return Promise().reject(err);
                });
        }
    },

    openInbox: () => {

    },

};

let courier = new Courier(export_func);
let insertMail = async function() {
    try {
        let mail = await export_func.asyncGetNewMail();
        let ret = await asyncMail(mail);
        if (ret) {
            logger.info("[mail] listening asyncGetNewMail ret: %s", JSON.stringify(ret));
        }
    } catch (e) {
        logger.warn("[mail] listening asyncGetNewMail err: %s", JSON.stringify(err));
    }
};


courier.listening(() => {
    insertMail();
}, 10 * 1000);

const REG_FETCH_SYM = /(\n|\t|\\.|\ )/gi;
const REG_MATCH_MAIL = /<.*?>/gi;
const REG_RM_MAIL_SYM = /(<|>)/gi;

function formatMail(arr) {
    let formated = arr;
    if (Array.isArray(arr)) {
        formated = (arr.toString()).replace(REG_FETCH_SYM, "");
    } else {
        formated = String.prototype.replace.call(arr, REG_RM_MAIL_SYM, "");
    }
    REG_MATCH_MAIL.test(formated) && (formated = formated.match(REG_MATCH_MAIL)) && (formated.toString());
    try {
        formated = String.prototype.replace.call(formated, REG_RM_MAIL_SYM, "");
    } catch (e) {
        logger.warn("[mail] formatMail e:%s", e);
    }
    return formated;
}

const REG_FETCH_MAIL_MODULE = /((\[|\【).*?(\]|\】))/gi;

function asyncMail(mail) {
    // logger.info("[mail] mailArr.length:%s", mailArr.length);
    // let insertArr = Array.prototype.map.call(mailArr, mail => {
    // logger.info("[mail] neo mail m_from:%s", JSON.stringify(mail.from));
    // logger.info("[mail] neo mail cc:%s", JSON.stringify(mail.cc));
    // let neoMail = {
    //     title: mail.subject,
    //     m_from: formatMail(mail.from),
    //     m_to: formatMail(mail.to),
    //     m_cc: formatMail(mail["cc"] || "none"),
    //     m_date: m_date,
    //     m_content: mail.content
    // };

    // return neoMail;
    // });
    // if (insertArr.length > 0) {
    if (mail) {
        logger.info("[mail] neo mail prop:%s", JSON.stringify(Object.keys(mail)));
        let neoMail = Object.assign(mail);
        delete neoMail.uid;
        neoMail.m_module = MAIL_MODULE[neoMail.title.match(REG_FETCH_MAIL_MODULE)[0]] || "all";
        logger.info("[mail] neo mail:%s", JSON.stringify(neoMail));
        return new Promise((resolve, reject) => {
            courier.sendAsyncCall("dbopter", "asyncInsert", () => {}, "market_db", "mail_info", [neoMail])
                .then(ret => {
                    logger.info("[mail] db insert ret:" + JSON.stringify(ret));
                    resolve(ret);
                })
                .catch(err => {
                    logger.warn("[mail] db insert err:" + JSON.stringify(err));
                    reject(err);
                });
            setTimeout(reject, 5000);
        });
    } else {
        return Promise.resolve("nothing to insert");
    }
}


const mailConfig = require("../config/mail");

function init() {
    logger.info("[mail] init:" + JSON.stringify(mailConfig.imap));
    export_func.imapConnect(mailConfig.imap);
    export_func.smtpConnect(mailConfig.smtp);
}
init();