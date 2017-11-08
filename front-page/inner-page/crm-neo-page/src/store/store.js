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
    tipsInfo: {
        showFlag: false,
        msg: "",
        type: "",
    },
    dialogInfo: {
        content: "",
        dialogType: "",
        showFlag: false,
        confirmCB: ""
    },
    roleInfo: {},
    badgeInfo: {},
    routerInfos: {},
    logged: false
};

const store = new Vuex.Store({
    state: DEFAULT_STORE,
    mutations: mutations,
    actions: actions,
});

let state_value = window.localStorage.getItem(localStorageKey) || JSON.stringify(DEFAULT_STORE);
let stateVal = JSON.parse(state_value);
if (VERIFY_KEY.every(key => {
        return Object.keys(stateVal).includes(key);
    })) {
    store.replaceState(stateVal);
}
export default store;