import app from "./app";

document.addEventListener("DOMContentLoaded", () => {

});


function goToLogin() {
    app.$store.dispatch("asyncQuit");
    app.$router.push("/login");
    window.location.reload();
}

function showTips(type, msg) {
    app.$store.dispatch({
        type: "asyncShowTips",
        tipsInfo: {
            msg: msg,
            tipsType: type,
            showFlag: true
        }
    });
}


const func = {
    goToLogin: goToLogin,
    showTips: showTips

};

export default func;