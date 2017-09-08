module.exports = {
    imap: {
        user: "plan@cootek.cn",
        password: "XwK-HPT-8bb-GJX",
        host: "partner.outlook.cn",
        port: 993,
        tls: true,
        savePath: "static/mail/",
        visitPath: "static/mail/",
        // autotls: "required"
    },
    smtp: {
        host: "smtp.partner.outlook.cn",
        port: 587,
        requireTLS: true,
        auth: {
            user: "plan@cootek.cn",
            pass: "XwK-HPT-8bb-GJX",
        }
    }
};