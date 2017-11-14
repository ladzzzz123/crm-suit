CREATE TABLE account (
    _id         INT(10) PRIMARY KEY AUTO_INCREMENT,
    u_name      VARCHAR(128) UNIQUE KEY NOT NULL COMMENT "用户名，默认应与用户邮箱相同", 
    passwd      VARCHAR(255) NOT NULL COMMENT "用户密码", 
    role_pos    VARCHAR(128) NOT NULL COMMENT "用户角色，一个用户可以有多个角色，详见role_map表", 
    mail        VARCHAR(128) UNIQUE NOT NULL COMMENT "用户邮箱", 
    nick_name   VARCHAR(128) COMMENT "昵称", 
    sex         VARCHAR(2) COMMENT "性别", 
    phone       VARCHAR(16) COMMENT "联系电话", 
    u_status    VARCHAR(32) NOT NULL DEFAULT "NEW" COMMENT "用户状态，包括[NEW, ACTIVE, BAN]", 
    KEY(u_name, role_pos, u_status)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT "用户信息表";


CREATE TABLE role_map (
    _id         INT(10) PRIMARY KEY AUTO_INCREMENT,
    role_pos    VARCHAR(128) NOT NULL COMMENT "用户角色值，以二进制表示，每一位对应一种角色", 
    role_name   VARCHAR(128) NOT NULL COMMENT "用户角色描述说明，包括[opter, admin, manager...]", 
    module      VARCHAR(64) NOT NULL DEFAULT "ALL" COMMENT "用户角色值对应的模块，用于是否可使用模块功能的验证", 
    KEY(module, role_name, role_pos)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT "角色信息表";


INSERT INTO role_map (role_pos, role_name, module) VALUES 
("000001", "admin", "account"),
("000010", "opter", "account"),
("000100", "admin", "plan-order"),
("001000", "opter", "plan-order"),
("010000", "admin", "mail"),
("100000", "opter", "mail"),
("01000000", "admin", "censor"),
("10000000", "opter", "censor");

INSERT INTO role_map (role_pos, role_name, module) VALUES 
("0100000000", "admin", "earnings"),
("1000000000", "opter", "earnings");

INSERT INTO role_map (role_pos, role_name, module) VALUES 
("010000000000", "admin", "ad-preview"),
("100000000000", "opter", "ad-preview");

-- 20171104 
INSERT INTO role_map (role_pos, role_name, module) VALUES 
("01000000000000", "admin", "leads-data"),
("10000000000000", "opter", "leads-data");


-- 20171104 modify role
ALTER TABLE role_map MODIFY COLUMN role_pos BIGINT;

INSERT INTO role_map SET role_pos = (SELECT MAX(role_pos) FROM role_map temp_role) * 2, role_name = "admin", module = "leads-data"; 
INSERT INTO role_map SET role_pos = (SELECT MAX(role_pos) FROM role_map temp_role) * 2, role_name = "opter", module = "leads-data"; 

 UPDATE account SET role_pos = (role_pos | (SELECT role_pos FROM role_map WHERE module = "leads-data" AND role_name = "admin")) WHERE u_name = "admin";
 UPDATE account SET role_pos = (role_pos | (SELECT role_pos FROM role_map WHERE module = "leads-data" AND role_name = "opter")) WHERE u_name = "admin";

ALTER TABLE account ADD nick_name VARCHAR(128) COMMENT "昵称";
ALTER TABLE account ADD sex VARCHAR(2) COMMENT "性别";
ALTER TABLE account ADD phone VARCHAR(16) COMMENT "联系电话";