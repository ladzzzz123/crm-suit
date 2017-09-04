let requesting = false;
const requester = {
    send: function(path, params, callback) {
        if (requesting) {
            alert("请求发送中...请稍等");
            return;
        }
        requesting = true;
        let req = new XMLHttpRequest();
        req.responseType = "json";
        req.open("POST", path, true);
        req.setRequestHeader("Content-type", "application/json");
        req.send(JSON.stringify(params));
        req.onload = ret => {
            requesting = false;
            let result = {};
            if (typeof req.response === "string") {
                result = JSON.parse(req.response);
            } else {
                result = req.response;
            }
            switch (result.status) {
                case 2000:
                    callback(result.content);
                    break;
                case 4000:
                    alert(result.msg);
                    break;
                default:
                    alert("请求失败，错误码:" + result.code + ", 请稍后尝试");
                    break;
            }
        };
    }
};