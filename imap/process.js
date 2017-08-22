/* jshint esversion:6 */
var Imap = require('imap'),
    inspect = require('util').inspect,
    fs = require("fs");

const imap_conf = require("../config/service").imap;
// var imap = new Imap({
//     user: 'm15618953382@163.com',
//     password: 'wangyi851022',
//     host: 'imap.163.com',
//     port: 993,
//     tls: true
// });

var imap = new Imap(imap_conf);



function openInbox(cb) {
    // imap.openBox("INBOX", true, cb);

    // setInterval(() => {
    //     imap.openBox('INBOX', true, cb);
    // }, 10000);
}

imap.on('ready', function(arg) {
    console.log("imap ready");
    imap.getBoxes("", (err, ret) => {
        console.log("boxes: %s", Object.keys(ret));
    });

    // imap.delBox("test", err => {
    //     console.log("del box err:%s", JSON.stringify(err));
    // });

    imap.openBox("INBOX", false, (err, box) => {
        if (err) {
            console.log("open err: %s", JSON.stringify(err));
        } else {
            console.log("open box: %s", JSON.stringify(box));
            imap.search(['UNSEEN', "1:*"], function(err, results) {
                if (err) throw err;
                var f = imap.fetch(results, { bodies: '' });
                f.on('message', function(msg, seqno) {
                    console.log('Message #%d  message:%s', seqno, JSON.stringify(msg));
                    var prefix = '(#' + seqno + ') ';
                    msg.on('body', function(stream, info) {
                        console.log(prefix + 'Body  info:' + JSON.stringify(info));
                        var buffer = '';
                        stream.on('data', function(chunk) {
                            buffer += chunk.toString('utf8');
                        });
                        stream.on('end', function() {
                            var mailData = Imap.parseHeader(buffer);
                            // console.log(prefix + 'Parsed header: %s', inspect(mailData));
                            console.log(prefix + 'Mail Data: %s', mailData.from + "  " + mailData.subject);
                        });

                        stream.pipe(fs.createWriteStream('msg-' + seqno + '-body.txt'));
                    });
                    msg.once('attributes', function(attrs) {
                        console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
                        imap.setFlags(attrs.uid, ["SEEN"], e => {
                            console.log("Message setFlag:%s, ret:%s", seqno, JSON.stringify(e));
                        });
                    });
                    msg.once('end', function() {
                        // imap.setFlags(seqno, ["SEEN"], e => {
                        //     console.log("Message setFlag:%s, ret:%s", seqno, JSON.stringify(e));
                        // });
                        console.log(prefix + 'Finished');
                    });
                });
                f.once('error', function(err) {
                    console.log('Fetch error: ' + err);
                });
                f.once('end', function() {
                    console.log('Done fetching all messages!');
                    imap.end();
                });
            });
        }

    });

    // openInbox(function(err, box) {
    //     if (err) throw err;
    //     imap.search(['UNSEEN', ["*"]], function(err, results) {
    //         if (err) throw err;
    //         var f = imap.fetch(results, { bodies: '' });
    //         f.on('message', function(msg, seqno) {
    //             console.log('Message #%d  message:%s', seqno, JSON.stringify(msg));
    //             var prefix = '(#' + seqno + ') ';
    //             msg.on('body', function(stream, info) {
    //                 console.log(prefix + 'Body  info:' + JSON.stringify(info));
    //                 var buffer = '';
    //                 stream.on('data', function(chunk) {
    //                     buffer += chunk.toString('utf8');
    //                 });
    //                 stream.on('end', function() {
    //                     var mailData = Imap.parseHeader(buffer);
    //                     // console.log(prefix + 'Parsed header: %s', inspect(mailData));
    //                     console.log(prefix + 'Mail Data: %s', mailData.from + "  " + mailData.subject);
    //                 });

    //                 stream.pipe(fs.createWriteStream('msg-' + seqno + '-body.txt'));
    //                 // imap.delFlags(seqno, ["UNSEEN"], e => {
    //                 //     console.log("Message delFlags:%s, ret:%s", seqno, JSON.stringify(e));
    //                 // });
    //             });
    //             msg.once('attributes', function(attrs) {
    //                 console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
    //                 imap.setFlags(attrs.uid, ["SEEN"], e => {
    //                     console.log("Message setFlag:%s, ret:%s", seqno, JSON.stringify(e));
    //                 });
    //             });
    //             msg.once('end', function() {
    //                 // imap.setFlags(seqno, ["SEEN"], e => {
    //                 //     console.log("Message setFlag:%s, ret:%s", seqno, JSON.stringify(e));
    //                 // });
    //                 console.log(prefix + 'Finished');
    //             });
    //         });
    //         f.once('error', function(err) {
    //             console.log('Fetch error: ' + err);
    //         });
    //         f.once('end', function() {
    //             console.log('Done fetching all messages!');
    //             imap.end();
    //         });
    //     });
    // });


    // openInbox(function(err, box) {
    //     if (err) throw err;
    //     var f = imap.seq.fetch('*', {
    //         bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE)',
    //         struct: true
    //     });
    //     console.log("box:" + JSON.stringify(box.messages));
    //     // var f = imap.seq.fetch(box.messages.total + ':*', { bodies: ['HEADER.FIELDS (FROM)', 'TEXT'] });
    //     f.on('message', function(msg, seqno) {
    //         console.log('Message #%d', seqno);
    //         var prefix = '(#' + seqno + ') ';
    //         msg.on('body', function(stream, info) {
    //             var buffer = '';
    //             stream.on('data', function(chunk) {
    //                 buffer += chunk.toString('utf8');
    //             });
    //             stream.on('end', function() {
    //                 console.log(prefix + 'Parsed header: %s', inspect(Imap.parseHeader(buffer)));
    //             });
    //         });
    //         msg.on('attributes', function(attrs) {
    //             console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
    //         });
    //         msg.on('end', function() {
    //             console.log(prefix + 'Finished');
    //         });
    //     });
    //     f.on('error', function(err) {
    //         console.log('Fetch error: ' + err);
    //     });
    //     f.on('end', function() {
    //         console.log('Done fetching all messages!');
    //         // imap.end();
    //     });
    // });
});

imap.on('error', function(err) {
    console.log(err);
});

imap.on('end', function() {
    console.log('Connection ended');
});

// imap.connect();
module.exports = imap;