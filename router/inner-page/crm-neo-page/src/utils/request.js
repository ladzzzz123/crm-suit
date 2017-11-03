import RESULT_CODE from "../../../../codemap.json";
import func from "../main";
let requesting = false;
let uploading = false;
// const DEBUG_URL = "http://121.52.235.231:40716";
const DEBUG_URL = "";
const UPLOAD_URL = DEBUG_URL + "/crm-inner/plan-order/upload";
// let DEBUG_URL = "http://127.0.0.1:3002";
const requester = {
    UPLOAD_URL: UPLOAD_URL,
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
        try {
            req.timeout = 5000;
        } catch (e) {
            console.warn("set timeout error: %s", JSON.stringify(e));
        }
        req.onload = ret => {
            requesting = false;
            let result = {};

            if (typeof req.response === "string") {
                result = JSON.parse(req.response);
            } else {
                result = req.response;
            }

            let _ret = processResult(result.status);
            if (_ret.status === RESULT_CODE.SUCCESS) {
                callback(result);
            } else {
                (failedCb) && (failedCb instanceof Function) && (failedCb(_ret));
            }
        };
        req.onerror = err => {
            requesting = false;
            func.showTips("alert-danger", "请求出错:" + JSON.stringify(err));

        };
        req.ontimeout = err => {
            requesting = false;
            func.showTips("alert-danger", "请求超时，请稍后重试");
        };
    },

    upload: function(path, el_form, callback, failedCb) {
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
                let _ret = processResult(result.status);
                if (_ret.status === RESULT_CODE.SUCCESS) {
                    callback(result);
                } else {
                    (failedCb) && (failedCb instanceof Function) && (failedCb(_ret));
                }
            };
            req.send(formData);
        } catch (e) {
            func.showTips("alert-danger", "上传失败，请稍后尝试，错误码：" + JSON.stringify(e));
            uploading = false;
        }
    }
};

function processResult(status) {
    let ret = {};
    let msg = "";
    switch (status) {
        case RESULT_CODE.SUCCESS:
            ret = { status: RESULT_CODE.SUCCESS };
            break;
        case RESULT_CODE.FAILED:
            msg = "操作失败！请检查您的参数/网络状态是否正常！";
            ret = { status: RESULT_CODE.FAILED, msg: msg, type: "alert-warning" };
            break;
        case RESULT_CODE.LOGIN_FAILED:
            msg = "登录失败！请检查您的用户名/密码！";
            ret = { status: RESULT_CODE.LOGIN_FAILED, msg: msg, type: "alert-danger" };
            break;
        case RESULT_CODE.VERIFY_FAILED:
            msg = "你没有该操作权限，请确认已经登录并拥有该操作权限！";
            ret = { status: RESULT_CODE.VERIFY_FAILED, msg: msg, type: "alert-warning" };
            break;
        case RESULT_CODE.LOGIN_EXPIRE:
            msg = "您的登录已经过期，请重新登录！";
            ret = { status: RESULT_CODE.LOGIN_EXPIRE, msg: msg, type: "alert-warning" };
            func.goToLogin();
            break;
        default:
            msg = `请求失败，错误码:${status}, 请稍后尝试`;
            ret = { status: RESULT_CODE.REQ_ERROR, msg: msg, type: "alert-danger" };
            break;
    }
    if (msg) func.showTips(ret.type, ret.msg);
    return ret;
}

export default requester;