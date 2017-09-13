import Vue from "vue";
import requester from "../utils/request";
export default Vue.component("login", {
    data: () => {
        return {
            formData: {
                user_name: "",
                passwd: ""
            },
            el_form: {}
        };
    },
    template: `
        <form class="login-from" onsubmit="return false">
            用户名(邮箱) <input type="text" name="user_name" v-model="formData.user_name" required/>
            <br/> 密码 <input type="password" name="passwd" v-model="formData.passwd" required/>
            <button type="submit" @click="login">登录</button>
        </form>
    `,
    mounted: function() {
        this.el_form = document.querySelector(".login-from");
    },

    methods: {
        login: function() {
            if (!this.el_form.checkValidity()) {
                return false;
            }
            let params = {
                user_name: this.formData.user_name,
                passwd: this.formData.passwd
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

});