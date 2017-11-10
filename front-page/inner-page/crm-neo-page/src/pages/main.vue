<style scoped>
    .container {
        border: solid 0.1px transparent;
        height: 100%;
        width: 100%;
        padding: 0;
    }

    .panel-left {
        height: 100%;
        left: 0;
        overflow-y: auto;
        position: fixed;
        width: 20%;
    }

    .left-pad-item {
        display: block;
        width: 100%;
    }

    .panel-right {
        height: 100%;
        right: 0;
        overflow-y: auto;
        position: absolute;
        text-align: center;
        width: 80%;
    }
</style>

<template>

    <div class="layout container">
        <cheader :logged="logged"
            height="0.4rem" 
            v-on:showChat="showChat"
            v-on:hideChat="hideChat" />
        <cchat v-if="flagChat"
            cstyle="padding-top:0.4rem"
            v-show="chatShowFlag"
            v-on:hideChat="hideChat"/>
        <!-- <tips /> -->
        <!-- <idialog /> -->
        <Row type="flex" style="margin-top:0.4rem;">
            <Col :span="spanLeft" class="layout-menu-left panel-left">
                <crouter v-if="logged" />
            </Col>
            <Col :span="spanRight" class="panel-right">
               <router-view></router-view>
            </Col>
        </Row>
    </div>

</template>

<script>
import cheader from "../components/cheader.vue";
import cchat from "../components/cchat.vue";
// import tips from "../components/tips.vue";
// import idialog from "../components/idialog.vue";
import crouter from "../components/crouter.vue";

export default {
    data: function() {
        return {
            spanLeft: 5,
            spanRight: 19,
            flagChat: false,
            chatShowFlag: false
        };
    },
    computed: {
        logged() {
            return this.$store.state.logged;
        },
        iconSize () {
            return this.spanLeft === 5 ? 14 : 24;
        }
    },
    mounted: function(){
        if(!this.logged) {
            this.$router.push("/login");
        }
    },
    methods: {
        showChat: function() {
            if (!this.flagChat) {
                this.flagChat = !this.flagChat;
            }
            this.chatShowFlag = true;
        },
        hideChat: function() {
            this.chatShowFlag = false;
        }
    },
    components: {
        // tips,
        // idialog,
        cchat,
        crouter,
        cheader
    }
}
</script>

