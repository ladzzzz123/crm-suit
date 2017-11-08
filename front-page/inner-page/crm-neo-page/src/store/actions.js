export default {
    asyncUpdateUserInfo: function({ commit, state }, payload) {
        console.log("userInfo:" + JSON.stringify(payload.userInfo));
        commit({ type: "updateUserInfo", userInfo: payload.userInfo });
    },

    asyncUpdateRouterInfo: function({ commit, state }, payload) {
        console.log("routerInfos:" + JSON.stringify(payload.routerInfos));
        commit({ type: "updateRouterInfo", routerInfos: payload.routerInfos });
    },
    asyncUpdateRoleInfo: function({ commit, state }, payload) {
        console.log("roleInfo:" + JSON.stringify(payload.roleInfo));
        commit({ type: "updateRoleInfo", roleInfo: payload.roleInfo });
    },

    asyncUpdateBadge: function({ commit, state }, payload) {
        commit({ type: "updateBadge", badgeInfo: payload.badgeInfo });
    },

    asyncShowTips: function({ commit, state }, payload) {
        commit({ type: "displayTips", tipsInfo: payload.tipsInfo });
    },
    asyncShowDialog: function({ commit, state }, payload) {
        commit({ type: "displayDialog", dialogInfo: payload.dialogInfo });
    },


    noticeFlag: function({ commit, state }, payload) {
        commit({ type: "noticeFlag", noticeFlag: payload.noticeFlag });
    },

    asyncQuit: function({ commit, state }) {
        commit("quit");
    }
};