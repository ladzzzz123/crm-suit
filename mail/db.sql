CREATE TABLE mail_info (
    _id       INT(10) PRIMARY KEY AUTO_INCREMENT,
    title     VARCHAR(255) NOT NULL COMMENT "邮件标题", 
    m_from    VARCHAR(128) NOT NULL COMMENT "发件人", 
    m_to      VARCHAR(128) NOT NULL COMMENT "收件人", 
    m_cc      VARCHAR(255) COMMENT "抄送", 
    m_content TEXT COMMENT "邮件正文",
    m_date    DATETIME,
    m_module  VARCHAR(32) COMMENT "处理模块名称",
    m_opter   VARCHAR(128) COMMENT "当前处理人", 
    m_attachments VARCHAR(255) COMMENT "附件",
    m_status  VARCHAR(32) NOT NULL DEFAULT "NEW" COMMENT "邮件处理状态[NEW, ACCEPT, RESOLVE, REJECT, UNKNOW]",
    last_edit TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY(title, m_from, m_to, m_status)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT "邮件状态表";


ALTER TABLE mail_info ADD m_attachments VARCHAR(255) COMMENT "附件";
ALTER TABLE mail_info ADD m_content TEXT COMMENT "邮件正文";