export default {
    asyncUpdateUserInfo: function({ commit, state }, payload) {
        console.log("userInfo:" + JSON.stringify(payload.userInfo));
        commit({ type: "updateUserInfo", userInfo: payload.userInfo });
    },

    asyncShowTips: function({ commit, state }, payload) {
        commit({ type: "displayTips", tipsInfo: payload.tipsInfo });
    },
    asyncShowDialog: function({ commit, state }, payload) {
        commit({ type: "displayDialog", dialogInfo: payload.dialogInfo });
    },

    asyncQuit: function({ commit, state }) {
        commit("quit");
    }
};