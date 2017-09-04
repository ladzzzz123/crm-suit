const requester = require("./request");

function login() {
    let u_name = document.querySelector("input[name='u_name']").value;
    let u_passwd = document.querySelector("input[name='u_passwd']").value;
    let params = {
        user_name: u_name,
        passwd: u_passwd
    };
    console.log(JSON.stringify(params));
    requester.send("/account/login/", params, (ret) => {
        let userInfo = ret.content;
        window.history.pushState(userInfo, "welcome", "/account/main");
        window.history.go(1);
    });

    return false;

}