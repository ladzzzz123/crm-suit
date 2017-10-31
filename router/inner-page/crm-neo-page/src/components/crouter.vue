<style>

</style>

<template>
    <Menu theme="light" width="auto">
        <div class="layout-logo-left"></div>
        <MenuItem v-for="(info, index) in routerInfos" :name="index" :key="info.path" 
            v-show="info && !info.hide">
            <router-link v-if="info" v-bind:to="info.path">
                <Icon :type=" info.icon || 'ios-navigate' " />
                <span class="layout-text">{{ info.content }}</span>
            </router-link>
        </MenuItem>
    </Menu>
</template>

<script>
export default {
    data: function() {
        return {
            curRouter: ""
        }
    },
    computed: {
        routerInfos()  {
            return this.$store.state.routerInfos || [];
        },
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

