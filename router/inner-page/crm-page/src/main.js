import app from "./app";

document.addEventListener("DOMContentLoaded", () => {

});


function goToLogin() {
    app.$store.dispatch("asyncQuit");
    app.$router.push("/login");
    window.location.reload();
}

function showTips(type, msg, sustained) {
    app.$store.dispatch({
        type: "asyncShowTips",
        tipsInfo: {
            msg: msg,
            tipsType: type,
            showFlag: true
        }
    });
    if (!sustained) {
        setTimeout(() => {
            app.$store.dispatch({
                type: "asyncShowTips",
                tipsInfo: {
                    msg: "",
                    tipsType: "",
                    showFlag: false
                }
            });
        }, 3000);
    }
}

function showDialog(type, content, confirmCB) {
    app.$store.dispatch({
        type: "asyncShowDialog",
        dialogInfo: {
            content: content,
            dialogType: type,
            showFlag: true,
            confirmCB: confirmCB
        }
    });
}

function hideDialog() {
    app.$store.dispatch({
        type: "asyncShowDialog",
        dialogInfo: {
            content: "",
            dialogType: "",
            showFlag: false,
            confirmCB: ""
        }
    });
}


export default {
    goToLogin: goToLogin,
    showTips: showTips,
    showDialog: showDialog
};