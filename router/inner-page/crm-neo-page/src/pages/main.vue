<style scoped>
    .container {
        height: 100%;
        width: 100%;
        padding: 0;
    }

    .panel-left {
        height: 100%;
        left: 0;
        position: absolute;
        width: 20%;
    }

    .left-pad-item {
        display: block;
        width: 100%;
    }

    .panel-right {
        height: 100%;
        right: 0;
        overflow-y: scroll;
        position: absolute;
        text-align: center;
        width: 80%;
    }
</style>

<template>

    <div class="layout container">
        <cheader :logged="logged" />
        <tips />
        <idialog />
        <Row type="flex">
            <Col :span="spanLeft" class="layout-menu-left panel-left">
                <crouter :routerInfos="routerInfos" />
            </Col>
            <Col :span="spanRight" class="panel-right">
               <router-view></router-view>
            </Col>
        </Row>
    </div>


<!-- <div class="index">
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
    </div> -->


</template>

<script>
import cheader from "../components/cheader.vue";
import tips from "../components/tips.vue";
import idialog from "../components/idialog.vue";
import crouter from "../components/crouter.vue";

export default {
    data: function() {
        return {
            spanLeft: 5,
            spanRight: 19
        };
    },
    computed: {
        logged() {
            return this.$store.state.logged;
        },
        routerInfos() {
            return this.$store.state.routerInfos;
        },
        iconSize () {
            return this.spanLeft === 5 ? 14 : 24;
        }
    },
    components: {
        tips,
        idialog,
        crouter,
        cheader
    }
}
</script>

