CREATE DATABASE earn_data;
USE earn_data;

CREATE TABLE earn_channel_info (
    channel    VARCHAR(255) NOT NULL COMMENT "第三方渠道",
    ad_place   VARCHAR(255) NOT NULL COMMENT "广告展示位置",
    settlement INT(2) NOT NULL COMMENT "结算方式(曝光:1, 点击:2...)",
    ecpm       DECIMAL(5,2) NOT NULL COMMENT "ecpm 值为-1时代表动态结算",
    rebate     FLOAT NOT NULL DEFAULT 1.0 COMMENT "返点，如不返点则填1",
    PRIMARY KEY(channel, ad_place),
    KEY(settlement)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT "广告渠道信息表";

CREATE TABLE earn_daily_journal (
    channel     VARCHAR(255) NOT NULL COMMENT "第三方渠道",
    ad_place    VARCHAR(255) NOT NULL COMMENT "广告展示位置",
    e_date      DATETIME NOT NULL, 
    e_exposure  INT(10) NOT NULL DEFAULT -1 COMMENT "曝光量",
    e_click     INT(10) NOT NULL DEFAULT -1 COMMENT "点击量",
    e_count     INT(10) DEFAULT -1 COMMENT "渠道提供曝光/点击数量",
    e_earn     DECIMAL(10,2) DEFAULT -1 COMMENT "收益",
    ecpm       DECIMAL(5,2) NOT NULL COMMENT "ecpm 值为-1时代表动态结算",
    e_version  INT(10) NOT NULL DEFAULT 0 COMMENT "数据乐观锁",
    PRIMARY KEY(channel, ad_place, e_date)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT "每日展示信息表";



ALTER TABLE earn_daily_journal ADD ecpm DECIMAL(5,2) NOT NULL COMMENT "ecpm 值为-1时代表动态结算";


--INSERT channel setting info
INSERT INTO earn_channel_info (channel, ad_place, settlement, ecpm, rebate) VALUES 
("网行",	"信息流",	 1,	-1,	1.0);


--AUTO INSERT DAILY JOURNAL FROM MAIL 
INSERT INTO earn_daily_journal (channel, ad_place, e_date, e_exposure, e_click) VALUES 
("网行",	"信息流",	"20171022",	384748,	18988);


--QUERY DAILY JOURNAL FROM DB
SELECT d.channel, d.ad_place, d.e_date, IF (i.settlement = 1, d.e_exposure, d.e_click) AS e_effect FROM earn_daily_journal d JOIN earn_channel_info i ON d.channel = i.channel WHERE d.e_date = "20171022";


-- UPDATE e_count/e_earn FROM INPUT
UPDATE earn_daily_journal d, earn_channel_info i SET d.e_count = 352982, d.e_earn = IF(i.ecpm > 0, d.e_count / i.ecpm * 1000, 4235.78) 
WHERE d.channel = i.channel AND d.ad_place = i.ad_place AND d.channel = "网行" AND d.ad_place = "信息流" AND d.e_date = "20171022";


-- 日期 广告位 曝光量 网行曝光 Gap值 Gap 收入 ecpm
-- QUERY daily data
SELECT d.e_date, d.ad_place, d.e_exposure, d.e_count, 
    ((d.e_exposure - d.e_count) / d.e_exposure) as gap, 
    d.e_earn, (d.e_earn * i.rebate) AS net_income, i.ecpm, 
    (d.e_earn / d.e_count) * 1000 AS dym_ecpm 
    FROM earn_daily_journal d 
    JOIN earn_channel_info i 
    ON d.channel = i.channel
    WHERE d.e_date >= "20171001" AND d.e_date <= "20171101";


-- QUERY earn sum
SELECT channel, COUNT(e_earn) as earns  FROM earn_daily_journal
WHERE e_date >= ? AND e_date =< ?
GROUP BY channel;
