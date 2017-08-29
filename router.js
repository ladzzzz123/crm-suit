/* jshint esversion: 6 */

const http = require("http");
const https = require("https");
const Koa = require("koa");
const app = new Koa();

const imap = require("./imap/process");
const Courier = require("node-process-bearer").Courier;

console.log("http before create");
console.log("imap before connect");
// setInterval(() => {
imap.connect();
// }, 20 * 1000);
console.log("imap after connect");

http.createServer((req, res) => {
    // app.callback(arguments);
}).listen(3000);
// https.createServer(app.callback()).listen(3001);