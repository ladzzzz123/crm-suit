const Courier = require("node-process-bearer").Courier;
const logger = require("node-process-bearer").logger.getLogger();
const ImapManager = require("./ImapManager");
const nodemailer = require("nodemailer");
const SMTPConnection = require("nodemailer/lib/smtp-connection");

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
        // smtpManager = new SMTPConnection(conf);
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
            return promiseImapConnect(imapManager)
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

    asyncSendMail: (to, subject, content, attachments) => {
        let option = {
            from: mailConfig.smtp.auth.user,
            to: to,
            bcc: "songshan.xu@cootek.cn", //抄送
            subject: subject,
            text: content
        };
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

    sendVerify: (...args) => {
        logger.info(`[imap] args: ${JSON.stringify(args)}`);
        courier.sendCall("account", "verify", ret => {
            logger.info("[testModule2] callModule1:" + JSON.stringify(ret));
        }, { username: "aaa", passwd: "aaa" });
    }
};

let courier = new Courier(export_func);
courier.listening(() => {
    export_func.asyncGetNewMail()
        .then(mailArr => {
            asyncMail(mailArr);
        })
        .catch(err => {

        });
}, 30 * 1000);


function asyncMail(mailArr) {
    const INSERT_MAIL = "INSERT INTO mail_info (title, m_from, m_to, m_status) VALUES ?";
    let insertArr = Array.prototype.map.call(mailArr, mail => {
        return {
            title: mail.subject,
            m_from: mail.from,
            m_to: mail.to,
            m_cc: mail["cc"] || "",
            date: mail.date
        };
    });
    if (insertArr.length > 0) {
        return new Promise((resolve, reject) => {
            courier.sendCall("dbopter", "asyncInsert", ret => {
                logger.info("[mail] db insert ret:" + JSON.stringify(ret));
                resolve(ret);
            }, "market_db", INSERT_MAIL, insertArr);
        });
    } else {
        return Promise.reject();
    }
}


const mailConfig = require("../config/mail");

function init() {
    logger.info("[mail] init:" + JSON.stringify(mailConfig.imap));
    export_func.imapConnect(mailConfig.imap);
    export_func.smtpConnect(mailConfig.smtp);
}
init();