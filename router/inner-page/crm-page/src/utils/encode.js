import crypto from "crypto";

function e(passwd) {
    let neo = crypto.createCipher("md5");
    neo.update(passwd);
    return neo.digest("hex");
}

export default {
    encode: e
};