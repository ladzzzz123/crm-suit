export default {
    asyncUpdateUserInfo: function({ commit, state }, payload) {
        console.log("userInfo:" + JSON.stringify(payload.userInfo));
        commit({ type: "updateUserInfo", userInfo: payload.userInfo });
    },

    asyncQuit: function({ commit, state }) {
        commit("quit");
    }
};