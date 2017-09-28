import { localStorageKey, DEFAULT_STORE } from "./store";
export default {
    updateUserInfo: (state, payload) => {
        state.userInfo = payload.userInfo;
        state.logged = true;
        console.log("localStorageKey:%s,  state.userInfo:%s", localStorageKey, JSON.stringify(state.userInfo));
        window.localStorage.setItem(localStorageKey, JSON.stringify(state));
    },
    updateRouterInfo: (state, payload) => {
        state.routerInfos = payload.routerInfos;
        console.log("localStorageKey:%s,  state.routerInfos:%s", localStorageKey, JSON.stringify(state.routerInfos));
        window.localStorage.setItem(localStorageKey, JSON.stringify(state));
    },
    updateBadge: (state, payload) => {
        Object.assign(state.badgeInfo, payload.badgeInfo);
    },

    displayTips: (state, payload) => {
        state.tipsInfo = payload.tipsInfo;
    },
    displayDialog: (state, payload) => {
        state.dialogInfo = payload.dialogInfo;
    },
    quit: (state) => {
        state.userInfo = DEFAULT_STORE;
        window.localStorage.clear();
    }
};