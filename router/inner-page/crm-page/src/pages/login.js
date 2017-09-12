import Vue from "vue";
import requester from "../utils/request";
export default Vue.component("login", {
    data: () => {
        return {
            formData: {
                user_name: "",
                passwd: ""
            }
        };
    },
    template: `
        <div submit="return false">
            用户名(邮箱) <input type="text" name="user_name" v-model="formData.user_name" required/>
            <br/> 密码 <input type="password" name="passwd" v-model="formData.passwd" required/>
            <button type="submit" @click="login">登录</button>
        </div>
    `,

    methods: {
        login: function() {
            // let u_name = document.querySelector("input[name='u_name']").value;
            // let u_passwd = document.querySelector("input[name='u_passwd']").value;
            console.log("this.formData:" + JSON.stringify(this.formData));
            let params = {
                user_name: this.formData.user_name,
                passwd: this.formData.passwd
            };
            requester.send("/crm-inner/account/login/", params, (ret) => {
                let userInfo = ret;
                this.$store.dispatch({
                    type: "updateUserInfo",
                    userInfo: userInfo
                });
            });
        }
    }

});