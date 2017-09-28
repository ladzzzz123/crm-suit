<style>

</style>

<template>
    <Menu theme="light" width="auto">
        <div class="layout-logo-left"></div>
        <MenuItem v-for="(info, index) in routerInfos" :name="index" :key="info.path" v-show="!info.hide">
            <router-link v-bind:to="info.path">
                <Icon type="ios-navigate" />
                <!-- <Icon type="ios-keypad"></Icon> -->
                <span class="layout-text">{{ info.content }}</span>
            </router-link>
        </MenuItem>
    </Menu>

    <!-- <ul class="nav nav-pills nav-stacked list-group">
        <li role="presentation" v-for="info in routerInfos" :key="info.path" @click="setCurrentRouter(info.path)"
            v-show="!info.hide" :class="info.path === curRouter ? 'active' : '' ">
            <router-link v-bind:to="info.path" class="left-pad-item">
                {{ info.content }}
                <span v-if="badgeInfo[info.path] > 0" class="badge">{{ badgeInfo[info.path] }}</span>
            </router-link>
        </li>
    </ul> -->
</template>

<script>
export default {
    props: ["routerInfos"],
    data: function() {
        return {
            curRouter: ""
        }
    },
    computed: {
        userInfo() {
            return this.$store.state.userInfo;
        },
        logged() {
            return this.$store.state.logged;
        },
        token() {
            return this.$store.state.userInfo.token;
        },
        badgeInfo() {
            return this.$store.state.badgeInfo;
        }
    },
    methods: {
        setCurrentRouter: function(curRouter) {
            this.curRouter = curRouter;
            // this.badgeInfo[curRouter] = 0;
        }
    }
}
</script>

