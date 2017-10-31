import cmptLogin from "./pages/login.vue";
import cmptManager from "./pages/manager.vue";
import cmptPlan from "./pages/plan.vue";
import cmptDistAnaly from "./pages/distAnaly.vue";
import cmptCensor from "./pages/censor.vue";
import cmptEnterance from "./pages/enterance.vue";
import cmptAdPreview from "./pages/ad-preview.vue";

export default [
    // { path: "/", component: cmptLogin, content: "根" },
    { path: "/login", component: cmptLogin, content: "登录", hide: true, based: true },
    { path: "/enterance", component: cmptEnterance, content: "主页", hide: true, based: true },
    { path: "/profile", component: cmptManager, content: "个人信息", hide: true, based: true },
    { path: "/plan-order", component: cmptPlan, content: "策划任务工具" },
    { path: "/dist-analy", component: cmptDistAnaly, content: "用户分析工具", based: true },
    { path: "/censor", component: cmptCensor, content: "PAD素材管理" },
    { path: "/ad-preview", component: cmptAdPreview, content: "AD素材投放预览" },
];