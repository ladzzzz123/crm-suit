const Courier = require("node-process-bearer").Courier;
const logger = require("node-process-bearer").logger.getLogger();
const ImapManager = require("./ImapManager");
const nodemailer = require("nodemailer");
const SMTPConnection = require("nodemailer/lib/smtp-connection");
const MAIL_MODULE = require("../config/mail");
const MSG = MAIL_MODULE.msg;

const mysql = require("mysql");

const RedisClient = require("../utils/RedisClient");
const MAIL_NOTICE_KEY = "MAIL_NOTICE_KEY";

let imapManager = {},
    smtpManager = {},
    redisClient = {};

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
                    return imapManager.fetchNewMail();
                })
                .catch(err => {
                    logger.warn("[imap] asyncGetNewMail connect err %s", err);
                    return Promise.resolve(err);
                });
        } else {
            logger.info(`[imap] promiseImapConnect connected before fetchNewMail`);
            return imapManager.fetchNewMail();
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
        option.cc = option.cc.replace("plan@cootek.cn", "15618953382@163.com");
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

    asyncAddToNoticeArray: (mail) => {
        return new Promise((resolve, reject) => {
            redisClient.hset(MAIL_NOTICE_KEY, mail, mail)
                .then(ret => {
                    resolve({ status: "success", ret: ret });
                })
                .catch(e => {
                    reject({ status: "failed", ret: e });
                });
        });
    },

    asyncRemoveFromNoticeArray: (mail) => {
        return new Promise((resolve, reject) => {
            redisClient.hdel(MAIL_NOTICE_KEY, mail)
                .then(ret => {
                    resolve({ status: "success", ret: ret });
                })
                .catch(e => {
                    reject({ status: "failed", ret: e });
                });
        });
    }

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
}, MAIL_MODULE.fetchMailInternval * 1000);

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

function insertIntoDB(neoMail) {
    return new Promise((resolve, reject) => {
        courier.sendAsyncCall("dbopter", "asyncInsert", "", "market_db", "mail_info", [neoMail])
            .then(ret => {
                logger.info("[mail] db insert ret:" + JSON.stringify(ret));
                resolve(ret);
            })
            .catch(err => {
                logger.warn("[mail] db insert err:" + JSON.stringify(err));
                reject(err);
            });
    });
}

async function insertOpt(mailArr, callback) {
    try {
        if (mailArr && Array.isArray(mailArr)) {
            let ret = {};
            for (let index = 0; index < mailArr.length; index++) {
                let neoMail = Object.assign(mailArr[index]);
                delete neoMail.uid;
                neoMail.m_module = MAIL_MODULE[neoMail.title.match(REG_FETCH_MAIL_MODULE)[0]] || "all";
                logger.debug("[mail] neo mail:%s", JSON.stringify(neoMail));
                ret = await insertIntoDB(neoMail);
            }
            callback(ret);
        } else {
            callback(false);
        }
    } catch (e) {
        callback(false);
    }

}

function asyncMail(mailArr) {
    insertOpt(mailArr, ret => {
        if (ret) {
            redisClient.hgetall(MAIL_NOTICE_KEY)
                .then(arr => {
                    logger.info("[asyncMail] mail.arr:%s", JSON.stringify(arr));
                    let mails = "";
                    Object.keys(arr).forEach(mail => {
                        mails += `,${mail}`;
                    });
                    logger.info("[asyncMail] mail.to:%s", mails);
                    export_func.asyncSendMail(mails, "有新的策划任务，请注意查收！", `点击此处登录：\n${MSG["add-user-mail"]["address"]} 查看 `);
                })
                .catch(err => {

                });
            return Promise.resolve(ret);
        } else {
            return Promise.resolve("nothing to insert");
        }
    });
}


const mailConfig = MAIL_MODULE.connect;

function init() {
    logger.info("[mail] init:" + JSON.stringify(mailConfig.imap));
    export_func.imapConnect(mailConfig.imap);
    export_func.smtpConnect(mailConfig.smtp);
    redisClient = new RedisClient(mailConfig.redis_config);
}
init();