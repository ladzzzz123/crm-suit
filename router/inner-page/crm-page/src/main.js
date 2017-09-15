import app from "./app";

document.addEventListener("DOMContentLoaded", () => {

});


function goToLogin() {
    app.$store.dispatch("asyncQuit");
    app.$router.push("/login");
    window.location.reload();
}


const func = {
    goToLogin: goToLogin,

};

export default func;