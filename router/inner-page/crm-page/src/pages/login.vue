<template>
    <form class="login-from" onsubmit="return false">
        <div class="input-group">
            <input type="text" class="form-control" placeholder="用户名(邮箱)" 
                name="u_name" v-model="formData.u_name" required>
        </div>
        <br/>
        <div class="input-group">
            <input type="password" class="form-control" placeholder="密码" 
                name="passwd" v-model="formData.passwd" required>
        </div>
        <br/>
        <button class="btn btn-success" type="submit" @click="login">登录</button>
    </form>
</template>

<script>
import encode from "../utils/encode";
import requester from "../utils/request";
export default {
    data: () => {
        return {
            formData: {
                u_name: "",
                passwd: ""
            },
            el_form: {}
        };
    },
    mounted: function() {
        this.el_form = document.querySelector(".login-from");
    },

    methods: {
        login: function() {
            if (!this.el_form.checkValidity()) {
                return false;
            }
            
            let params = {
                u_name: this.formData.u_name,
                passwd: encode.e(this.formData.passwd)
            };
            requester.send("/crm-inner/account/login/", params, (ret) => {
                let userInfo = ret;
                this.$store.dispatch({
                    type: "asyncUpdateUserInfo",
                    userInfo: userInfo
                });
                this.$router.push("/manager");
            });
            return false;
        }
    }

};
</script>

<style>

</style>

