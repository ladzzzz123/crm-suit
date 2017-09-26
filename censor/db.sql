CREATE TABLE material (
    _id       INT(10) PRIMARY KEY AUTO_INCREMENT,
	tu        VARCHAR(255) NOT NULL COMMENT "广告位", 
	dsp       VARCHAR(255) NOT NULL COMMENT "DSP名称",
    m_date    DATETIME,
    ldp       VARCHAR(255) NOT NULL COMMENT "落地页",
	material  VARCHAR(255) NOT NULL COMMENT "素材地址",
	pv        BIGINT(10) NOT NULL COMMENT "展现量", 
    opter     VARCHAR(128) COMMENT "操作者",
    m_status  VARCHAR(32) NOT NULL DEFAULT "NEW" COMMENT "当前审核状态[NEW, PASS, REJECT, TBD, UNKNOW]",
    last_edit TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY (tu, dsp, m_date, material),
    KEY(material, tu, dsp, m_status)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT "素材审核状态表";