import Vue from "vue";
export default Vue.component("plan", {
    // props: ["userInfo"],
    data: () => {
        return {};
    },
    computed: {
        userInfo() {
            return this.$store.state.userInfo;
        },
    },

    template: `
    <div class="container">
        欢迎 {{ userInfo.name }}, 您可以使用以下功能：
        <div class="queryPlan" onclick="query()">查询当前任务</div>
        <ul class="list"></ul>
    </div>
    `,
    methods: {}

});