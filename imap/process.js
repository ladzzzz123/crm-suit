/* jshint esversion:6 */
const Imap = require("imap"),
    inspect = require("util").inspect,
    fs = require("fs"),
    logger = require("node-process-bearer").logger.getLogger(),
    imap_conf = require("../config/service").imap;

let imap = new Imap(imap_conf);


imap.on("ready", function(arg) {
    imap.getBoxes("", (err, ret) => {
        logger.info("[imap] ready boxes: %s", Object.keys(ret));
    });

    // imap.delBox("test", err => {
    //     console.log("del box err:%s", JSON.stringify(err));
    // });

    // openInbox(function(err, box) {
    //     if (err) throw err;
    //     imap.search(["UNSEEN", ["*"]], function(err, results) {
    //         if (err) throw err;
    //         var f = imap.fetch(results, { bodies: "" });
    //         f.on("message", function(msg, seqno) {
    //             console.log("Message #%d  message:%s", seqno, JSON.stringify(msg));
    //             var prefix = "(#" + seqno + ") ";
    //             msg.on("body", function(stream, info) {
    //                 console.log(prefix + "Body  info:" + JSON.stringify(info));
    //                 var buffer = "";
    //                 stream.on("data", function(chunk) {
    //                     buffer += chunk.toString("utf8");
    //                 });
    //                 stream.on("end", function() {
    //                     var mailData = Imap.parseHeader(buffer);
    //                     // console.log(prefix + "Parsed header: %s", inspect(mailData));
    //                     console.log(prefix + "Mail Data: %s", mailData.from + "  " + mailData.subject);
    //                 });

    //                 stream.pipe(fs.createWriteStream("msg-" + seqno + "-body.txt"));
    //                 // imap.delFlags(seqno, ["UNSEEN"], e => {
    //                 //     console.log("Message delFlags:%s, ret:%s", seqno, JSON.stringify(e));
    //                 // });
    //             });
    //             msg.once("attributes", function(attrs) {
    //                 console.log(prefix + "Attributes: %s", inspect(attrs, false, 8));
    //                 imap.setFlags(attrs.uid, ["SEEN"], e => {
    //                     console.log("Message setFlag:%s, ret:%s", seqno, JSON.stringify(e));
    //                 });
    //             });
    //             msg.once("end", function() {
    //                 // imap.setFlags(seqno, ["SEEN"], e => {
    //                 //     console.log("Message setFlag:%s, ret:%s", seqno, JSON.stringify(e));
    //                 // });
    //                 console.log(prefix + "Finished");
    //             });
    //         });
    //         f.once("error", function(err) {
    //             console.log("Fetch error: " + err);
    //         });
    //         f.once("end", function() {
    //             console.log("Done fetching all messages!");
    //             imap.end();
    //         });
    //     });
    // });


    // openInbox(function(err, box) {
    //     if (err) throw err;
    //     var f = imap.seq.fetch("*", {
    //         bodies: "HEADER.FIELDS (FROM TO SUBJECT DATE)",
    //         struct: true
    //     });
    //     console.log("box:" + JSON.stringify(box.messages));
    //     // var f = imap.seq.fetch(box.messages.total + ":*", { bodies: ["HEADER.FIELDS (FROM)", "TEXT"] });
    //     f.on("message", function(msg, seqno) {
    //         console.log("Message #%d", seqno);
    //         var prefix = "(#" + seqno + ") ";
    //         msg.on("body", function(stream, info) {
    //             var buffer = "";
    //             stream.on("data", function(chunk) {
    //                 buffer += chunk.toString("utf8");
    //             });
    //             stream.on("end", function() {
    //                 console.log(prefix + "Parsed header: %s", inspect(Imap.parseHeader(buffer)));
    //             });
    //         });
    //         msg.on("attributes", function(attrs) {
    //             console.log(prefix + "Attributes: %s", inspect(attrs, false, 8));
    //         });
    //         msg.on("end", function() {
    //             console.log(prefix + "Finished");
    //         });
    //     });
    //     f.on("error", function(err) {
    //         console.log("Fetch error: " + err);
    //     });
    //     f.on("end", function() {
    //         console.log("Done fetching all messages!");
    //         // imap.end();
    //     });
    // });
});

imap.on("error", function(err) {
    console.log(err);
});

imap.on("end", function() {
    console.log("Connection ended");
});

// imap.connect();
module.exports = imap;