CREATE TABLE account (
    _id         INT(10) PRIMARY KEY AUTO_INCREMENT,
    u_name      VARCHAR(128) UNIQUE KEY NOT NULL COMMENT "用户名，默认应与用户邮箱相同", 
    passwd      VARCHAR(255) NOT NULL COMMENT "用户密码", 
    role_pos    BIT(32) NOT NULL COMMENT "用户角色，一个用户可以有多个角色，详见role_map表", 
    mail        VARCHAR(128) UNIQUE NOT NULL COMMENT "用户邮箱", 
    u_status    VARCHAR(32) NOT NULL DEFAULT "NEW" COMMENT "用户状态，包括[NEW, ACTIVE, BAN]", 
    KEY(u_name, role_pos, u_status)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT "用户信息表";

CREATE TABLE role_map (
    _id         INT(10) PRIMARY KEY AUTO_INCREMENT,
    role_pos    BIT(32) NOT NULL COMMENT "用户角色值，以二进制表示，每一位对应一种角色", 
    module      VARCHAR(64) NOT NULL DEFAULT "ALL" COMMENT "用户角色值对应的模块，用于是否可使用模块功能的验证", 
    descr       VARCHAR(128) COMMENT "用户角色描述，便于维护理解",
    KEY(module, role_pos)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT "角色信息表";
