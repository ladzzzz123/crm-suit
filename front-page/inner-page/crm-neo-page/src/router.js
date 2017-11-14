import cmptLogin from "./pages/login.vue";
import cmptManager from "./pages/manager.vue";
import cmptPlan from "./pages/plan.vue";
import cmptDistAnaly from "./pages/distAnaly.vue";
import cmptCensor from "./pages/censor.vue";
import cmptEnterance from "./pages/enterance.vue";
import cmptAdPreview from "./pages/ad-preview.vue";
import cmptEarnings from "./pages/earnings.vue";
import cmptLeadsdata from "./pages/leads-data.vue";
import cmptChangeLog from "./pages/changelog.vue";



export default [
    // { path: "/", component: cmptLogin, content: "根" },
    { path: "/login", component: cmptLogin, content: "登录", icon: "", hide: true, based: true },
    { path: "/enterance", component: cmptEnterance, content: "主页", icon: "", hide: true, based: true },
    { path: "/profile", component: cmptManager, content: "个人信息", icon: "", hide: true, based: true },
    { path: "/changelog", component: cmptChangeLog, content: "更新日志", icon: "", hide: true, based: true },
    { path: "/plan-order", component: cmptPlan, content: "策划任务工具", icon: "ios-paper" },
    { path: "/earnings", component: cmptEarnings, content: "PAD收入数据", icon: "cash" },
    { path: "/leads-data", component: cmptLeadsdata, content: "leads数据", icon: "person-stalker" },
    { path: "/dist-analy", component: cmptDistAnaly, content: "用户分析工具", icon: "stats-bars", based: true },
    { path: "/censor", component: cmptCensor, content: "PAD素材管理", icon: "ios-checkmark" },
    { path: "/ad-preview", component: cmptAdPreview, content: "AD素材投放预览", icon: "eye" },
];