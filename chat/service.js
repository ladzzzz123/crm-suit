const server = require("http").createServer();
const io = require("socket.io")(server);
const logger = require("node-process-bearer").logger.getLogger();
const Courier = require("node-process-bearer").Courier;
const RedisClient = require("../utils/RedisClient");
const REDIS_CONFIG = require("../config/chat.json");
const DEFAULT_CHAT_PORT = 3006;

const CHAT_LOG = "chat_log";
// server.listen(REDIS_CONFIG.PORT || DEFAULT_CHAT_PORT);
let redisClient = {};
let export_func = {
    name: "chat"
};
let courier = new Courier(export_func);

init();

function init() {
    logger.info("[chat] redis config: %s", JSON.stringify(REDIS_CONFIG.redis_config));
    redisClient = new RedisClient(REDIS_CONFIG.redis_config);
    let chat = io.listen(REDIS_CONFIG.PORT || DEFAULT_CHAT_PORT);
    chat.of("/crm-chat")
        .on("connection", function(socket) {
            socket.on("message", async(msg) => {
                logger.info(JSON.stringify(msg));
                if (!msg["token"]) return;
                let token = msg.token;
                let verify = await courier.sendAsyncCall("account", "asyncVerify", "",
                    token, "account", "opter");
                if (verify) {
                    io.emit("message", msg);
                    let today = new Date();
                    redisClient.hset(`${CHAT_LOG}_${today.toLocaleDateString()}`,
                            today.getTime(),
                            `${today.toLocaleTimeString()}: ${JSON.stringify(msg)}`)
                        .then(ret => {
                            resolve("success");
                        })
                        .catch(err => {
                            reject(err);
                        });
                }
            });
        });
}

// const io = require("socket.io");
// const http = require("http");


// const chat = io.listen(DEFAULT_CHAT_PORT);

// chat
//     .of("/crm-chat")
//     .on("connection", socket => {
//         logger.warn("[socket] socket connection!");
//         socket.on("message", msg => {
//             //向所有客户端广播发布的消息
//             logger.warn("socket msg: %s", JSON.stringify(msg));
//             chat.emit("message", msg);
//             // console.log(msg.u_name + '说：' + msg.msg);
//         });
//     });