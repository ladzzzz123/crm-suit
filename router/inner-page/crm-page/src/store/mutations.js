import { localStorageKey, DEFAULT_STORE } from "./store";
export default {
    updateUserInfo: (state, payload) => {
        state.userInfo = payload.userInfo;
        state.logged = true;
        console.log("localStorageKey:%s,  state.userInfo:%s", localStorageKey, JSON.stringify(state.userInfo));
        window.localStorage.setItem(localStorageKey, JSON.stringify(state));
    },
    quit: (state) => {
        state.userInfo = DEFAULT_STORE;
        window.localStorage.setItem(localStorageKey, "");
    }
};