// var io = require('socket.io').listen(3006);

// io.sockets.on('connection', function(socket) {
//     socket.on('set nickname', function(name) {
//         socket.set('nickname', name, function() {
//             socket.emit('ready');
//         });
//     });

//     socket.on('message', function(msg) {
//         socket.emit("message", msg);
//         socket.get('nickname', function(err, name) {
//             console.log('Chat message by ', name);
//         });
//     });
// });


const server = require("http").createServer();
const io = require("socket.io")(server);
const logger = require("node-process-bearer").logger.getLogger();
const DEFAULT_CHAT_PORT = 3006;
const Courier = require("node-process-bearer").Courier;

server.listen(DEFAULT_CHAT_PORT);

io.on("connection", function(socket) {
    socket.on("message", async(msg) => {
        logger.info(JSON.stringify(msg));
        if (!msg["token"]) return;
        let token = msg.token;
        let verify = await courier.sendAsyncCall("account", "asyncVerify", () => {},
            token, "account", "opter");
        if (verify) {
            io.emit("message", msg);
        }
    });
});

let export_func = {
    name: "chat"
};
let courier = new Courier(export_func);


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