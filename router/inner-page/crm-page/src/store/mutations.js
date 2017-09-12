export default {
    updateUserInfo: (state, payload) => {
        console.log("payload:" + JSON.stringify(payload));
        state.userInfo = payload.userInfo;
        console.log("state.userInfo:" + JSON.stringify(state.userInfo));
    }
};