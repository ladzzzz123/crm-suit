<style>

</style>

<template>
    <div class="container" v-if="logged">
        <Spin size="large" fix v-if="loading"></Spin>
        <div class="data-list" v-if="verified">
            <DatePicker type="date" placeholder="选择日期和时间" v-model="m_date" 
            @on-ok="fetchEarns"
            confirm style="width: 2rem"></DatePicker>
            <br/>
            <br/>
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
import pageNav from "../components/nav.vue";

import func from "../main";

function processFailed() {
    func.hideDialog();
    if (status === RESULT_CODE.LOGIN_EXPIRE) {
        this.$store.dispatch("asyncQuit");
        setTimeout(() => {
            this.gotoLogin();
        }, 3000);
    }
}

export default {
    data: () => {
        return {
            verified: false,
            m_date: "",
            orgArr:[],
            localArr:[],
            list: [],
            curIndex: 0,
            colors: [
                "blue",
                "green",
                "red",
                "yellow",
                "default"
            ],
            loading: false,
            qrList: {}
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
        curArray() {
            return this.list.slice(this.curIndex * this.LDP_PER_PAGE, (this.curIndex + 1) * this.LDP_PER_PAGE);
        },
    },

    watch: {
    },

    components: {
        pageNav
    },

    mounted: function() {
        if (this.logged) {
            requester.send("/crm-inner/earnings", { token: this.token },
                result => {
                    if (result.status === RESULT_CODE.SUCCESS) {
                        this.verified = true;
                    }
                }, (status, msg) => {
                    processFailed(status);
                });
        }
    },
    beforeUpdate: function() {},
    updated: function() {
         this.$nextTick(function () {
             setTimeout(() => {
                 this.loading = false;
             }, 2000);
        });
    },

    methods: {
        gotoLogin: function() {
            this.$router.push("/login");
        },

        back2Top: function() {
            if (document.querySelector(".panel-right").scrollTo) {
                document.querySelector(".panel-right").scrollTo(0, 0);
            }
        },

        processArr: function(orgArr) {

        },

        setCurPage: function(index) {
            this.curIndex = index;
        },

        fetchEarns: function() {
            if (this.m_date) {
                requester.send("/crm-inner/earnings/opt", 
                    { 
                        token: this.token, 
                        m_date: this.m_date.toLocaleDateString(),
                        action:"query-sum"
                    },
                    result => {
                        if (result.status === RESULT_CODE.SUCCESS) {
                            this.processArr(result.content);
                        }
                    }, (status, msg) => {
                        processFailed(status);
                    });
            }
        },
        reportRet: function() {

        },



        pass: function(id, ldp, m_version) {
            console.log("pass:" + id);
            let _id = id.replace("material_", "");
            this.updateStatus(_id, ldp, "pass", "", m_version, "PASS");
        },
        denied: function(id, ldp, m_version) {
            console.log("denied:" + id);
            func.showDialog("input", "确认拒绝该素材？", inputText => {
                let _id = id.replace("material_", "");
                this.updateStatus(_id, ldp, "denied", inputText, m_version, "REJECT");
            }, "请填写拒绝理由");
        },
        delay:function(id, ldp, m_version) {
            console.log("delay:" + id);
            func.showDialog("input", "该素材需要再议？", inputText => {
                let _id = id.replace("material_", "");
                this.updateStatus(_id, ldp, "tbd", inputText, m_version, "TBD");
            }, "请填写理由");
        },

        updateStatus: function(_id, ldp, action, inputText, m_version, n_status) {
            requester.send("/crm-inner/censor/update", 
                {
                    token: this.token, 
                    ids: [_id],
                    action: action,
                    reason: inputText || "",
                    m_version: m_version
                },
                result => {
                    func.showTips("alert-success", "操作成功");
                    let neoArr = this.curArray.find(item => {
                        return ldp.indexOf(item[0]) > -1;
                    });
                    neoArr = neoArr || ["", []];
                    let neoItem = neoArr[1].find(subItem => ("" + subItem._id) === _id);
                    if(neoItem) {
                        neoItem.m_status = n_status;
                        neoItem.m_version = parseInt(neoItem.m_version) + 1;
                        neoItem.reason = inputText;
                        neoItem.opter = this.userInfo.mail;
                    }
                    func.hideDialog();
                }, (status, msg) => {
                    setTimeout(() => {
                        func.showTips("alert-error", "更新状态失败，该素材可能已被他人编辑，请刷新列表后再尝试！");
                    }, 2000);
                    processFailed(status);
                });
        },
    }
}
</script>
