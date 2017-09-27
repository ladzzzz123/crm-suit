const RESULT = require("./codemap.json");
const md5 = require("../utils/md5");
const crypto = require("crypto");

function encode(passwd) {
    if (cypto) {
        let neo = crypto.createCipher("md5");
        neo.update(passwd);
        return neo.digest("hex");
    } else {
        return md5.hex_md5(passwd);
    }
}

module.exports = {
    encode: encode,
    verifyParams: function(params, types) {
        if (Array.isArray(types)) {
            return types.every(item => params.hasOwnProperty(item));
        } else {
            switch (types) {
                case "token":
                    return params.hasOwnProperty("token");
                default:
                    break;
            }
        }
        return false;
    },

    verifyTokenResult: function(result) {
        let ret = {};
        switch (result.info.status) {
            case RESULT.LOGIN_EXPIRE:
                ret = { status: RESULT.LOGIN_EXPIRE, msg: "login expire" };
                break;
            case RESULT.VERIFY_ERROR:
                ret = { status: RESULT.VERIFY_ERROR, msg: "login expire" };
                break;
            default:
                ret = { status: RESULT.VERIFY_FAILED, msg: "verify failed" };
                break;
        }
        return ret;
    },
};