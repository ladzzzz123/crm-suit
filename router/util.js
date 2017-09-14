module.exports = {
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