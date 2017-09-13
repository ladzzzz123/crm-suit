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
            <nav class="navbar navbar-default" role="navigation">
            <div class="container-fluid">
                <div class="navbar-header">
                    <a class="navbar-brand" href="http://www.cootek.com/index.html">
                        <img src="http://www.cootek.com/images/logo.png" height="100%">
                    </a>
                </div>
                <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                    <ul class="nav navbar-nav navbar-right">
                        <li class="dropdown">
                            <div class="dropdown-toggle" data-toggle="dropdown">咩都冇<span class="caret"></span></div>
                            <ul class="dropdown-menu" role="menu">
                                <li class="divider"></li>
                                <li><div @click="quit()">退出登陆</div></li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
        <div class="container">
            <div class="panel-left list-group">
                <router-link v-for="info in routerInfos" 
                    v-bind:to="info.path" :key="info.path" v-show="!info.hide"
                    class="left-pad-item list-group-item">
                        {{ info.content }}
                </router-link>
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
        }
    }

});