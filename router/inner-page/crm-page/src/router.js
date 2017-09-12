import cmptLogin from "./pages/login";
import cmptPlan from "./pages/plan";
export default [
    { path: "/", component: cmptLogin, content: "根" },
    { path: "/login", component: cmptLogin, content: "登录" },
    { path: "/plan", component: cmptPlan, content: "策划任务" },
    // { path: "/manager", component: "Manager" }
];