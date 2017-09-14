import RESULT_CODE from "../../../../codemap.json";
let requesting = false;
let uploading = false;
let DEBUG_URL = "http://121.52.235.231:40718";
const requester = {
    send: function(path, params, callback, failedCb) {
        if (requesting) {
            alert("请求发送中...请稍等");
            return;
        }
        requesting = true;
        let req = new XMLHttpRequest();
        try {
            req.open("POST", DEBUG_URL + path, true);
            req.setRequestHeader("Content-type", "application/json");
        } catch (e) {
            console.warn("req warn:" + JSON.stringify(e));
        }
        req.send(JSON.stringify(params));
        req.responseType = "json";
        req.onload = ret => {
            requesting = false;
            let result = {};

            if (typeof req.response === "string") {
                result = JSON.parse(req.response);
            } else {
                result = req.response;
            }
            let msg = "";
            switch (result.status) {
                case RESULT_CODE.SUCCESS:
                    callback(result);
                    break;
                case RESULT_CODE.VERIFY_FAILED:
                    msg = "你没有该操作权限，请确认已经登录并拥有该操作权限！";
                    (failedCb) && (failedCb({ status: RESULT_CODE.VERIFY_FAILED, msg: msg }));
                    break;
                case RESULT_CODE.LOGIN_EXPIRE:
                    msg = "您的登录已经过期，请重新登录！";
                    (failedCb) && (failedCb({ status: RESULT_CODE.LOGIN_EXPIRE, msg: msg }));
                    break;
                default:
                    msg = `请求失败，错误码:${result.code}, 请稍后尝试`;
                    (failedCb) && (failedCb({ status: RESULT_CODE.REQ_ERROR, msg: msg }));
                    break;
            }
            if (msg) alert(msg);
        };
        req.onerror = err => {
            requesting = false;
            alert("request err:" + JSON.stringify(err));
        };
    },

    upload: function(path, el_form, callback) {
        uploading = true;
        try {
            let formData = new FormData(el_form);
            let req = new XMLHttpRequest();
            req.open("POST", DEBUG_URL + path, true);
            req.onload = ret => {
                uploading = false;
                let result = {};
                if (typeof req.response === "string") {
                    result = JSON.parse(req.response);
                } else {
                    result = req.response;
                }
                //{"status":2000,"content":{"status":"success","msg":"上传附件成功"}}
                switch (result.status) {
                    case RESULT_CODE.SUCCESS:
                        callback(result);
                        break;
                    case RESULT_CODE.VERIFY_FAILED:
                        msg = "你没有该操作权限，请确认已经登录并拥有该操作权限！";
                        (failedCb) && (failedCb({ status: RESULT_CODE.VERIFY_FAILED, msg: msg }));
                        break;
                    case RESULT_CODE.LOGIN_EXPIRE:
                        msg = "您的登录已经过期，请重新登录！";
                        (failedCb) && (failedCb({ status: RESULT_CODE.LOGIN_EXPIRE, msg: msg }));
                        break;
                    default:
                        msg = `请求失败，错误码:${result.code}, 请稍后尝试`;
                        (failedCb) && (failedCb({ status: RESULT_CODE.REQ_ERROR, msg: msg }));
                        break;
                }
                if (msg) alert(msg);
                if (req.status === 200) {
                    let result = JSON.parse(this.responseText);
                    callback(result.result);
                } else {
                    alert("上传失败，请稍后尝试，错误码：" + this.status);
                }
            };
            req.onerror(err => {
                uploading = false;
            });
            req.send(formData);
        } catch (e) {
            alert("上传失败，请稍后尝试，错误码：" + JSON.stringify(e));
            uploading = false;
        }
    }
};
export default requester;