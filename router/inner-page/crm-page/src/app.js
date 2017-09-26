import Vue from "vue";
import VueRoter from "vue-router";
Vue.use(VueRoter);

import routerInfos from "./router";
import store from "./store/store";
import tips from "./components/tips.vue";
import idialog from "./components/idialog.vue";
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
        <nav class="navbar navbar-default" role="navigation">
            <div class="container-fluid">
                <div class="navbar-header">
                    <a class="navbar-brand" href="http://www.cootek.com/index.html">
                        <img src="http://www.cootek.com/images/logo.png" height="100%">
                    </a>
                </div>
                <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                    <ul class="nav navbar-nav navbar-right">
                        <li v-if="logged" @click="quit()">
                            <a href="#">退出登陆</a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
        <div class="container">
        <tips />
            <div class="panel-left">
                <ul class="nav nav-pills nav-stacked">
                    <li role="presentation" v-for="info in routerInfos" :key="info.path" v-show="!info.hide">
                        <router-link v-bind:to="info.path" class="left-pad-item">
                                {{ info.content }}
                        </router-link>
                    </li>
                </ul>
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
        idialog
    }

});


export default app;