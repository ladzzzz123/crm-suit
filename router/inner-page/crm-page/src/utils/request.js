import RESULT_CODE from "../../../../codemap.json";
let requesting = false;
let DEBUG_URL = "http://121.52.235.231:40718";
const requester = {
    send: function(path, params, callback) {
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
            switch (result.status) {
                case RESULT_CODE.SUCCESS:
                    callback(result);
                    break;
                case RESULT_CODE.VERIFY_FAILED:
                    alert("你没有该操作权限，请确认已经登录并拥有该操作权限！");
                    // callback({ msg: req.msg });
                    break;
                default:
                    alert(`请求失败，错误码:${result.code}, 请稍后尝试`);
                    break;
            }
        };
        req.onerror = err => {
            requesting = false;
            alert("request err:" + JSON.stringify(err));
        };
    }
};
export default requester;