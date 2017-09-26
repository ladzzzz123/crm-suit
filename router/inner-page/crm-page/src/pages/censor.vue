<template>
    <div class="container" v-if="logged">
        <div class="data-list" v-if="verified">
            yeah!
        </div>
        <div class="data-list" v-else>
            <p>您没有该功能的使用权限，请点击<a @click="gotoLogin">此处</a>重新登录，</p>
            <p>或者联系您的系统管理员</p>
        </div>
    </div>
    <div class="container" v-else>
        您尚未登录，请点击<a @click="gotoLogin">此处</a>登录
    </div>
</template>

<script>
import requester from "../utils/request";
import RESULT_CODE from "../../../../codemap.json";


export default {
    data: () => {
        return {
            verified: false
        }
    },
    computed: {
        userInfo() {
            return this.$store.state.userInfo;
        },
        token() {
            return this.$store.state.userInfo.token;
        },
        logged() {
            return this.$store.state.logged;
        },
    },

    mounted: function() {
        if (this.logged) {
            requester.send("/crm-inner/censor", { token: this.token },
                result => {
                    if (result.status === RESULT_CODE.SUCCESS) {
                        this.verified = true;
                    }
                }, (status, msg) => {
                    if (status === RESULT_CODE.LOGIN_EXPIRE) {
                        this.$store.dispatch("asyncQuit");
                        setTimeout(() => {
                            this.gotoLogin();
                        }, 3000);
                    }
                });
        }
    },
    
    methods: {
        gotoLogin: function() {
            this.$router.push("/login");
        }
    }
}
</script>

<style>

</style>
