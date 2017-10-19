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

server.listen(DEFAULT_CHAT_PORT);

io.on("connection", function(socket) {
    // socket.emit("message", { msg: "hello world!", u_name: "service" });
    socket.on("message", msg => {
        logger.info(JSON.stringify(msg));
        io.emit("message", msg);
    });
});


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