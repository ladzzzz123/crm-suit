CREATE TABLE account (
    _id         INT(10) PRIMARY KEY AUTO_INCREMENT,
    u_name      VARCHAR(128) UNIQUE KEY NOT NULL,
    passwd      VARCHAR(255) NOT NULL,
    role_pos    BIT(32) NOT NULL,
    mail        VARCHAR(128) UNIQUE NOT NULL
);

CREATE TABLE role_map (
    _id         INT(10) PRIMARY KEY AUTO_INCREMENTS,
    role_pos    BIT(32) NOT NULL,
    module      VARCHAR(64) NOT NULL DEFAULT "ALL",
    descr       VARCHAR(128)
)