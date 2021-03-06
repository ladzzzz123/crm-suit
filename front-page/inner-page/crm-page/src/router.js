import cmptLogin from "./pages/login.vue";
import cmptManager from "./pages/manager.vue";
import cmptPlan from "./pages/plan.vue";
import cmptDistAnaly from "./pages/distAnaly.vue";
import cmptCensor from "./pages/censor.vue";
export default [
    // { path: "/", component: cmptLogin, content: "根" },
    { path: "/login", component: cmptLogin, content: "登录", hide: true },
    { path: "/manager", component: cmptManager, content: "个人信息" },
    { path: "/plan", component: cmptPlan, content: "策划任务" },
    { path: "/dist-analy", component: cmptDistAnaly, content: "用户分布分析" },
    { path: "/censor", component: cmptCensor, content: "素材审核" },
];