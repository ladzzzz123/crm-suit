import Vue from "vue";
import VueRoter from "vue-router";
Vue.use(VueRoter);

import iView from "iview";
Vue.use(iView);

import routerInfos from "./router";
import store from "./store/store";

import cheader from "./components/cheader.vue";
import tips from "./components/tips.vue";
import idialog from "./components/idialog.vue";
import crouter from "./components/crouter.vue";

const app = new Vue({
    el: "#app",
    data: {
        token: "",
        routerInfos: routerInfos,
    },
    store,
    computed: {
        logged() {
            return this.$store.state.logged;
        }
    },
    router: new VueRoter({ routes: routerInfos }),
    template: `
    <div class="index">
        <idialog />
        <cheader :logged="logged" />
        <div class="container">
            <tips />
            <div class="panel-left">
                <crouter :routerInfos="routerInfos"/>
            </div>
            <div class="panel-right">
                <router-view></router-view>
            </div>
        </div>
    </div>
    `,

    methods: {
        quit: function() {
            this.$store.dispatch("asyncQuit");
            setTimeout(() => {
                this.$router.push("/login");
            }, 2 * 1000);
        }
    },
    components: {
        tips,
        idialog,
        crouter,
        cheader
    }

});


export default app;