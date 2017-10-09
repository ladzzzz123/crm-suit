<style>
</style>

<template>
    <Card v-if="logged" style="width:5rem;margin:0.3rem;text-align:left;">
        <p style="font-size:0.2rem">欢迎 <span style="font-size:0.3rem">{{ userInfo.u_name }}，</span></p>
        <p style="font-size:0.2rem">请点击左侧导航选择需要使用的功能</p>
        <p>如遇到无法使用，或者点击无效，请点击右上角退出登录并再次尝试</p>
        <p>如有任何问题，请联系<a href="mailto:songshan.xu@cootek.cn">songshan.xu@cootek.cn</a></p>
    </Card>
    <Row type="flex" justify="center" v-else>
        您尚未登录，请点击<a @click="gotoLogin">此处</a>登录
    </Row>
</template>

<script>
import requester from "../utils/request";
import func from "../main";
import encode from "../utils/encode";


export default {
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
    },

    methods: {
        gotoLogin: function() {
            this.$router.push("/login");
        },
    }
};
</script>

