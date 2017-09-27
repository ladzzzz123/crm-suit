<template>
    <ul class="nav nav-pills nav-stacked list-group">
        <li role="presentation" v-for="info in routerInfos" :key="info.path" @click="setCurrentRouter(info.path)"
            v-show="!info.hide" :class="info.path === curRouter ? 'active' : '' ">
            <router-link v-bind:to="info.path" class="left-pad-item">
                {{ info.content }}
            </router-link>
        </li>
    </ul>
</template>

<script>
export default {
    props: ["routerInfos"],
    data: function() {
        return {
            curRouter: ""
        }
    },
    methods: {
        setCurrentRouter: function(curRouter) {
            this.curRouter = curRouter;
        }

    }
}
</script>

<style>

</style>
