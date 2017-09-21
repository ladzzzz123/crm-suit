const crypto = require("crypto");

function encode(passwd) {
    let neo = crypto.createCipher("md5");
    neo.update(passwd);
    return neo.digest("hex");
}

module.exports = {
    encode: encode
};