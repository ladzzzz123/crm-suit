import Vue from "vue";
export default Vue.component("manager", {
    // props: ["userInfo"],
    // data: () => {
    //     return {};
    // },
    computed: {
        userInfo() {
            return this.$store.state.userInfo;
        },
        logged() {
            return this.$store.state.logged;
        },
    },

    template: `
    <div class="container" v-if="logged">
        <form onsubmit="return false">
            {{ userInfo.user_name }}您好,
            <br/> 
            您的个人信息：
            <br/>
            昵称: {{ userInfo.nick_name || "以前还叫人家小甜甜" }}
            <br/>
            性别: {{ userInfo.sex || "安能辨我是雌雄" }}
            <br/>
            联系电话: {{ userInfo.phone || "尚不明确" }}
            <br/>
            邮件地址: {{ userInfo.mail || userInfo.user_name || "404没找到" }}
            <br/>
            当前状态: {{ userInfo.u_status || "另一位面"}}
        </form>
    </div>
    <div class="container" v-else>
        您尚未登录，请点击<a @click="gotoLogin">此处</a>登录
    </div>
    `,
    methods: {
        gotoLogin: function() {
            this.$router.push("/login");
        }
    }

});