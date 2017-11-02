<style>
    .collapse-title{
        text-align: left;
    }

    table {
        border-width:2px;
        border-style: solid;
    }
    td {
        border-width:2px;
        border-style: solid;
    }
    th {
        border-width:2px;
        border-style: solid;
    }
    tr {
        padding: 2px;
    }
</style>

<template>
    <div class="container" v-if="logged">
        <Spin size="large" fix v-if="loading"></Spin>
        <div class="data-list" v-if="verified">
            <DatePicker type="date" placeholder="选择日期和时间" 
                v-model="m_date" @on-ok="fetchEarns"
                confirm style="width: 2rem">
            </DatePicker>
            <br/>
            <br/>
        <Col span="20" offset="2">
            <Collapse class="collapse-title">
                <Panel v-for="sumInfo in earnSumArr" 
                    v-bind:key="sumInfo.channel"
                    @on-change="pannelOpen(sumInfo.channel)">
                    {{ sumInfo.channel }}: &nbsp;&nbsp; {{ m_date.toLocaleDateString() }} &nbsp;&nbsp;收入：￥{{ sumInfo.earns }}
                    <p slot="content">
                        <table>
                            <thead>
                                <th>位置</th>
                                <th>日期</th>
                                <th>触宝曝光量</th>
                                <th>渠道曝光量</th>
                                <th>Gap</th>
                                <th>收入</th>
                                <th>ecpm</th>
                                <th v-if="isAdmin">操作</th>
                            </thead>
                            <tbody>
                                <tr v-for="dailyData in dailyDataArr.filter(data => data.channel === sumInfo.channel)"
                                    v-bind:key="dailyData.ad_place">
                                    <td>{{ dailyData.ad_place }}</td>
                                    <td>{{ m_date.toLocaleDateString() }}</td>
                                    <td>{{ dailyData.e_exposure }}</td>
                                    <td>
                                        <span v-if="dailyData.editting">
                                            <input v-model="dailyData.e_count"/>
                                        </span>
                                        <span v-else>{{ dailyData.e_count }}</span>
                                    </td>
                                    <td>{{ dailyData.gap }}</td>
                                    <td>{{ dailyData.net_income }}</td>
                                    <td>{{ dailyData.ecpm }}</td>
                                    <td v-if="isAdmin">
                                        <i-switch v-model="dailyData.editting" @on-change="switchEdit(dailyData)"></i-switch>
                                        <!-- <Button v-if="dailyData.editting" @click="switchEdit(dailyData)">提交</Button>
                                        <Button v-else @click="switchEdit(dailyData)">编辑</Button> -->
                                        {{ dailyData.editting }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </p>
                </Panel>
            </Collapse>
        </Col>
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
            earnSumArr: [],
            dailyDataArr: [],
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
        isAdmin() {
            let roleArr = this.$store.state.roleInfo;
            if (!Array.isArray(roleArr)) {
                roleArr = Object.values(roleArr);
            }
            let role = roleArr.find(item => {
                return item.module == "earnings" && item.role_name === "admin";
            });
            return role;
        },
    },

    watch: {
        dailyDataArr: function() {
            console.log("dailyDataArr changed");
        }
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
                queryDataByDate("/crm-inner/earnings/opt", 
                    { token: this.token, m_date: this.m_date }, "query-sum")
                    .then(ret => {
                        this.earnSumArr = ret;
                        return queryDataByDate("/crm-inner/earnings/opt", 
                            { token: this.token, m_date: this.m_date }, "query-journal")
                    })
                    .then(ret => {
                        console.log(JSON.stringify(ret));
                        this.dailyDataArr = ret;
                        this.dailyDataArr.map(item => item.editting = true);
                    })
                    .catch(e => {

                    });
            }
        },

        reportRet: function() {

        },
        switchEdit: function(dailyData) {
            console.log("dailyData:%s", JSON.stringify(dailyData));
            let data = this.dailyDataArr.find(item => JSON.stringify(item) === JSON.stringify(dailyData));
            data.editting = !data.editting;
        },
    }
}


function queryDataByDate(path, params, action) {
    return new Promise((resolve, reject) => {
        requester.send("/crm-inner/earnings/opt", 
            { 
                token: params.token, 
                m_date: params.m_date.toLocaleDateString(),
                action: action
            },
            result => {
                if (result.status === RESULT_CODE.SUCCESS) {
                    // this.processArr(result.content);
                    if (Array.isArray(result.content)) {
                        resolve(result.content);
                        // this.earnSumArr = ;
                    }
                }
            }, (status, msg) => {
                reject(status);
                // processFailed(status);
            });
    });
}


function submitChannel(channel, ad_place, newVal) {

}

</script>
