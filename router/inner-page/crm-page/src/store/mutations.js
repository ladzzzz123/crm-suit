import { localStorageKey } from "./store";
export default {
    updateUserInfo: (state, payload) => {
        console.log("payload:" + JSON.stringify(payload));
        state.userInfo = payload.userInfo;
        state.logged = true;
        console.log("localStorageKey:%s,  state.userInfo:%s", localStorageKey, JSON.stringify(state.userInfo));
        window.localStorage.setItem(localStorageKey, state);
    }
};