import Vue from "vue";
import VueRoter from "vue-router";
import iView from "iview";

Vue.use(VueRoter);
Vue.use(iView);

import mainPage from "./pages/main.vue";
import routerInfos from "./router";
import store from "./store/store";


const app = new Vue({
    el: "#app",
    router: new VueRoter({ routes: routerInfos }),
    store,
    mounted: function() {
        // this.$store.dispatch({
        //     type: "asyncUpdateRouterInfo",
        //     routerInfos: routerInfos
        // });
    },
    render: h => h(mainPage)
});

function goToLogin() {
    app.$store.dispatch("asyncQuit");
    app.$router.push("/login");
    window.location.reload();
}

function showTips(tipsType, msg, sustained) {
    let duration = sustained ? 0 : 5;
    switch (tipsType) {
        case "alert-success":
            app.$Notice.success({
                title: msg,
                desc: msg,
                duration: duration
            });
            break;
        case "alert-info":
            app.$Notice.info({
                title: msg,
                desc: msg,
                duration: duration
            });
            break;
        case "alert-warning":
            app.$Notice.warning({
                title: msg,
                desc: msg,
                duration: duration
            });
            break;
        case "alert-danger":
            app.$Notice.error({
                title: msg,
                desc: msg,
                duration: duration
            });
            break;
        default:
            app.$Notice.info({
                title: msg,
                desc: msg,
                duration: duration
            });
            break;
    }
}

function showDialog(type, content, confirmCB, placeholder) {
    switch (type) {
        case "info":
            app.$Modal.info({
                title: content,
                content: content
            });
            break;
        case "confirm":
            app.$Modal.confirm({
                title: content,
                content: content,
                onOk: () => {
                    confirmCB();
                },
                onCancel: () => {
                    hideDialog();
                }
            });
            break;
        case "input":
            let inputText = "";
            app.$Modal.confirm({
                render: (h) => {
                    return h("div", {}, [
                        h("h4", content),
                        h("br", ""),
                        h("textarea", {
                            attrs: {
                                rows: "8",
                                cols: "50",
                                value: "",
                                autofocus: true,
                                placeholder: placeholder || "请填写内容"
                            },
                            on: {
                                input: (val) => {
                                    inputText = val.target.value;
                                }
                            }
                        })
                    ]);
                },
                onOk: () => {
                    confirmCB(inputText);
                },
                onCancel: () => {
                    hideDialog();
                }
            });
            break;
        default:
            break;
    }
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


document.addEventListener("DOMContentLoaded", () => {

});

export default {
    goToLogin: goToLogin,
    showTips: showTips,
    showDialog: showDialog,
    hideDialog: hideDialog
};