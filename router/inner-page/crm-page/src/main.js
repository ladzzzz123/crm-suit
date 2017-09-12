import Vue from "vue";
import VueRoter from "vue-router";
Vue.use(VueRoter);

import routerInfos from "./router";
import store from "./store/store";
const app = new Vue({
    el: "#app",
    data: {
        token: "",
        routerInfos: routerInfos,
    },
    store,
    router: new VueRoter({ routes: routerInfos }),
    template: `
    <div class="index">
        <div class="panel-left list-group">
            <router-link v-for="info in routerInfos" 
                v-bind:to="info.path" :key="info.path"
                class="left-pad-item list-group-item">
                    {{ info.content }}
            </router-link>
        </div>
        <div class="panel-right">
            <router-view></router-view>
        </div>
    </div>
    `
});