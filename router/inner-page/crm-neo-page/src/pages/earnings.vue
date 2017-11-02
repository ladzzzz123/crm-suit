<style>

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

        <Collapse>
            <Panel v-for="sumInfo in earnSumArr" 
                v-bind:key="sumInfo.channel"
                @on-change="pannelOpen(sumInfo.channel)">
                <Row>
                    <Col span="8">
                        {{ sumInfo.channel }}
                    </Col>
                    <Col span="8" offset="8">
                        {{ sumInfo.earns }}
                    </Col>
                </Row>
                <p slot="content">
                    <Table width="550" border 
                        :columns="dailyDataColumnArr" 
                        :data="dailyDataArr.filter(data => data.channel === sumInfo.channel)">
                    </Table>
                </p>
            </Panel>
        </Collapse>

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
            dailyDataColumnArr:[
                {
                    title:"位置",
                    key: "ad_place"
                },
                {
                    title:"触宝曝光量",
                    key: "e_exposure"
                },
                {
                    title:"渠道曝光量",
                    key: "e_count"
                },
                {
                    title:"Gap",
                    key: "gap"
                },
                {
                    title:"收入",
                    key: "net_income"
                },
                {
                    title:"ecpm",
                    key: "ecpm"
                },
                 {
                    title: '操作',
                    key: 'action',
                    width: 150,
                    align: 'center',
                    render: (h, params) => {
                        return h('div', [
                            h('Button', {
                                props: {
                                    type: 'primary',
                                    size: 'small'
                                },
                                style: {
                                    marginRight: '5px'
                                },
                                on: {
                                    click: () => {
                                        // this.show(params.index)
                                    }
                                }
                            }, '编辑')
                        ]);
                    }
                }
            ],
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
                            // this.processArr(result.content);
                            if (Array.isArray(result.content)) {
                                this.earnSumArr = result.content;
                            }
                        }
                    }, (status, msg) => {
                        processFailed(status);
                    });
                requester.send("/crm-inner/earnings/opt", 
                    { 
                        token: this.token, 
                        m_date: this.m_date.toLocaleDateString(),
                        action:"query-journal"
                    },
                    result => {
                        if (result.status === RESULT_CODE.SUCCESS) {
                            // this.processArr(result.content);
                            if (Array.isArray(result.content)) {
                                this.dailyDataArr = result.content;
                            }
                        }
                    }, (status, msg) => {
                        processFailed(status);
                    });

            }
        },
        reportRet: function() {

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
