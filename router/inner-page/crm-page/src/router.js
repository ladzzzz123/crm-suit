import cmptLogin from "./pages/login";
import cmptManager from "./pages/manager";
import cmptPlan from "./pages/plan";
export default [
    // { path: "/", component: cmptLogin, content: "根" },
    { path: "/login", component: cmptLogin, content: "登录", hide: true },
    { path: "/manager", component: cmptManager, content: "个人信息" },
    { path: "/plan", component: cmptPlan, content: "策划任务" },
];