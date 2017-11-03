<style>
    .collapse-title{
        text-align: left;
    }

    table {
        border-width: 2px;
        border-style: solid;
    }
    td {
        border-width:2px;
        border-style: solid;
        width: 0.8rem;
        overflow-x: auto;
        overflow-y: hidden;
        padding: 0.02rem;
    }
    th {
        border-width:2px;
        border-style: solid;
    }
    tr {
        padding: 0.02rem;
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
                                    <th>收入(若ecpm为定值<br/>请勿修改此项,改了也没用,呵呵)</th>
                                    <th>ecpm</th>
                                    <th v-if="isAdmin" style="width:1rem;">操作</th>
                                </thead>
                                <tbody>
                                    <tr v-for="dailyData in dailyDataArr.filter(data => data.channel === sumInfo.channel)"
                                        v-bind:key="dailyData.ad_place">
                                        <td>{{ dailyData.ad_place }}</td>
                                        <td>{{ m_date.toLocaleDateString() }}</td>
                                        <td>{{ parseInt(dailyData.settlement) === 1 ?
                                            dailyData.e_exposure : parseInt(dailyData.settlement) === 2 ?
                                            dailyData.e_click : dailyData.e_exposure }}</td>
                                        <td>
                                            <span v-if="dailyData.editting">
                                                <input v-model="dailyData.e_count" type="number" style="width:0.3rem;"/>
                                            </span>
                                            <span v-else>{{ dailyData.e_count }}</span>
                                        </td>
                                        <td>
                                            <span v-if="dailyData.e_count <= 0">0</span>
                                            <span v-else-if="parseInt(dailyData.settlement) === 1">
                                                {{ (dailyData.e_exposure - dailyData.e_count) / dailyData.e_exposure }}
                                            </span>
                                            <span v-else-if="parseInt(dailyData.settlement) === 2">
                                                {{ (dailyData.e_click - dailyData.e_count) / dailyData.e_click }}
                                            </span>
                                            <span v-else>0</span>
                                        </td>
                                        <td>
                                            <span v-if="dailyData.editting && dailyData.ecpm < 0">
                                                <input v-model="dailyData.net_income" type="number" step="0.01" style="width:0.3rem;"/>
                                            </span>
                                            <span v-else>
                                                {{ dailyData.ecpm < 0 ? dailyData.net_income : dailyData.e_count * dailyData.ecpm / 1000 }}
                                            </span>
                                        </td>
                                        <td>{{ dailyData.ecpm < 0 ? (dailyData.e_earn / dailyData.e_count) * 1000 : dailyData.ecpm }}</td>
                                        <td v-if="isAdmin" style="text-align: center">
                                            <!-- <i-switch v-model="dailyData.editting"></i-switch> -->
                                            <ButtonGroup v-if="dailyData.editting">
                                                <Button type="success" @click="submitDaily(dailyData)">提交</Button>
                                                <Button @click="cancelEdit(dailyData)">取消</Button>
                                            </ButtonGroup>
                                            <Button v-else type="primary" @click="switchEdit(dailyData, 'daily')">编辑</Button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </p>
                    </Panel>
                </Collapse>
            </Col>

            <Modal
                v-model="dlgShowFlags.channel"
                title="当前渠道设定"
                @on-cancel="hideDialog"
                width="800">
                <table>
                    <thead>
                        <th>渠道</th>
                        <th>位置</th>
                        <th>结算方式(曝光/点击)</th>
                        <th>ecpm<br/>(-1表示按收入动态结算)</th>
                        <th>返点(如无返点则填1)</th>
                        <th style="width:1rem;">操作</th>
                    </thead>
                    <tbody>
                        <tr v-for="channelData in channelDataArr"
                            v-bind:key="channelData.channel + '_' + channelData.ad_place">
                            <td>{{ channelData.channel }}</td>
                            <td>{{ channelData.ad_place }}</td>
                            <td>
                                <span v-if="channelData.editting">
                                    <select v-model="channelData.settlement" type="number" 
                                        maxlength="1" style="width:0.6rem;">
                                        <option value="1">按曝光结算</option>
                                        <option value="2">按点击结算</option>
                                    </select>
                                </span>
                                <span v-else>{{ parseInt(channelData.settlement) === 1 ?
                                        '按曝光结算' : parseInt(channelData.settlement) === 2 ? '按点击结算' : '未知'}}</span>
                            </td>
                            <td>
                                <span v-if="channelData.editting">
                                    <input v-model="channelData.ecpm" type="number" step="0.01" style="width:0.3rem;"/>
                                </span>
                                <span v-else>{{ channelData.ecpm }}</span>
                            </td>
                            <td>
                                <span v-if="channelData.editting">
                                    <input v-model="channelData.rebate" type="number" step="0.01" style="width:0.3rem;"/>
                                </span>
                                <span v-else>{{ channelData.rebate }}</span>
                            </td>
                            <td v-if="isAdmin" style="text-align: center">
                                <ButtonGroup v-if="channelData.editting">
                                    <Button type="success" @click="submitChannel(channelData)">提交</Button>
                                    <Button @click="cancelEdit(channelData)">取消</Button>
                                </ButtonGroup>
                                <ButtonGroup v-else>
                                    <Button type="primary" @click="switchEdit(channelData)">编辑</Button>
                                    <Button type="error" @click="deleteChannel(channelData)">删除</Button>
                                </ButtonGroup>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </Modal>


            <ButtonGroup v-if="isAdmin" style="position: fixed; bottom:0.2rem;left:50%;">
                <Button type="success">新增渠道设定</Button>
                <Button type="primary" @click="showChannels">查看渠道设定</Button>
            </ButtonGroup>
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

const PATH_OPT = "/crm-inner/earnings/opt";
const PATH_ADMIN = "/crm-inner/earnings/admin-opt";

export default {
    data: () => {
        return {
            verified: false,
            m_date: "",
            earnSumArr: [],
            dailyDataArr: [],
            channelDataArr: [],
            dlgShowFlags: {
                channel: false,
            },
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

        hideDialog: function() {
            Object.keys(this.dlgShowFlags).forEach(key => this.dlgShowFlags[key] = false);
        },

        processArr: function(orgArr) {

        },

        setCurPage: function(index) {
            this.curIndex = index;
        },

        fetchEarns: function() {
            if (this.m_date) {
                queryDataByDate(PATH_OPT, 
                    { token: this.token, m_date: this.m_date }, "query-sum")
                    .then(ret => {
                        this.earnSumArr = ret;
                        return queryDataByDate(PATH_OPT, 
                            { token: this.token, m_date: this.m_date }, "query-journal")
                    })
                    .then(ret => {
                        console.log(JSON.stringify(ret));
                        ret.map(item => item.editting = false);
                        this.dailyDataArr = Object.assign(ret);
                    })
                    .catch(e => {

                    });
            }
        },

        showChannels: function() {
            this.dlgShowFlags.channel = true
            queryDataByDate(PATH_ADMIN, 
                { token: this.token }, "query-channel")
                .then(ret => {
                    console.log(JSON.stringify(ret));
                    ret.map(item => item.editting = false);
                    this.channelDataArr = Object.assign(ret);
                })
                .catch(e => {

                });
        },

        submitChannel: function(channelData) {
            let params = {
                token: this.token,
                action: "update-channel",
                params: {
                    channel: channelData.channel,
                    ad_place: channelData.ad_place,
                    settlement: channelData.settlement,
                    ecpm: channelData.ecpm,
                    rebate: channelData.rebate
                }
            };
            requester.send(PATH_ADMIN, 
                params,
                result => {
                    if (result.status === RESULT_CODE.SUCCESS) {
                        func.showTips("alert-success", "修改成功！");
                    }
                    this.switchEdit(channelData);
                    this.fetchEarns();
                }, (status, msg) => {
                    func.showTips("alert-error", "修改失败！");
                    // this.cancelEdit(dailyData);
                });
        },

        deleteChannel: function(channelData) {
            let params = {
                token: this.token,
                action: "delete-channel",
                params: {
                    channel: channelData.channel,
                    ad_place: channelData.ad_place,
                }
            };
            requester.send(PATH_ADMIN, 
                params,
                result => {
                    if (result.status === RESULT_CODE.SUCCESS) {
                        func.showTips("alert-success", "删除成功！");
                    }
                    this.fetchEarns();
                }, (status, msg) => {
                    func.showTips("alert-error", "删除失败！");
                    // this.cancelEdit(dailyData);
                });
        },

        submitDaily: function(dailyData) {
            dailyData.e_date = new Date(dailyData.e_date).toLocaleDateString();
            dailyData.e_earn = dailyData.ecpm < 0 ? dailyData.net_income : (dailyData.e_count * dailyData.ecpm) / 1000;
            console.log(JSON.stringify(dailyData));
            let params = {
                token: this.token,
                action: "update-journal",
                params: dailyData
            };
            requester.send(PATH_ADMIN, 
                params,
                result => {
                    if (result.status === RESULT_CODE.SUCCESS) {
                        func.showTips("alert-success", "修改成功！");
                    }
                    dailyData.e_version++;
                    this.fetchEarns();
                    this.switchEdit(dailyData);
                }, (status, msg) => {
                    func.showTips("alert-error", "修改失败！");
                    // this.cancelEdit(dailyData);
                });
        },

        reportRet: function() {

        },
        switchEdit: function(editData) {
            console.log("editData:%s", JSON.stringify(editData));
            if (editData) {
                if (!editData.editting) {
                    this.backupDataBeforeEdit(editData);
                }
                editData.editting = !editData.editting;
            }
        },
        backupDataBeforeEdit: function(data) {
            if (data.e_count && data.net_income) {
                data.backup =  {
                    e_count: data.e_count,
                    net_income: data.net_income
                };
            } else if (data.settlement && data.ecpm != 0 && data.rebate != 0) {
                data.backup = {
                    settlement: data.settlement,
                    ecpm: data.ecpm,
                    rebate: data.rebate
                };
            }
        },
        cancelEdit: function(editData, targetDataArr) {
            console.log("cancel edit editData:%s", JSON.stringify(editData));
            // let data = this.targetDataArr.find(item => 
            //     item.channel === editData.channel && item.ad_place === editData.ad_place);
            if (editData.backup) {
                Object.assign(editData, editData.backup);
            }
            editData.editting = false;
        }
    }
}


function queryDataByDate(path, params, action) {
    return new Promise((resolve, reject) => {
        requester.send(path, 
            { 
                token: params.token, 
                m_date: params.m_date ? params.m_date.toLocaleDateString() : "",
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

</script>
