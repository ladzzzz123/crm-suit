import Vue from "vue";
import Vuex from "vuex";
Vue.use(Vuex);

import mutations from "./mutations";
import actions from "./actions";

const VERIFY_KEY = [
    "userInfo", "logged"
];

export const localStorageKey = "saved_data";
export const DEFAULT_STORE = {
    userInfo: {
        name: "unknow"
    },
    logged: false
};

const store = new Vuex.Store({
    state: DEFAULT_STORE,
    mutations: mutations,
    actions: actions,
});

let state_value = window.localStorage.getItem(localStorageKey) || DEFAULT_STORE;
console.log("state_value:" + JSON.stringify(state_value));
if (VERIFY_KEY.every(key => {
        return Object.keys(state_value).includes(key);
    })) {
    store.replaceState(state_value);
}
export default store;