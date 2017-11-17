<style>
    .collapse-title{
        text-align: left;
    }

    .data-list {
        margin-bottom:  0.4rem;
    }

    table {
        border-width: 2px;
        border-style: solid;
    }
    td {
        /* border-width:2px;
        border-style: solid;
        width: 0.8rem;
        overflow-x: auto;
        overflow-y: hidden;
        padding: 0.02rem; */
        height: 48px;
        box-sizing: border-box;
        text-align: left;
        text-overflow: ellipsis;
        overflow-x: auto;
        overflow-y: hidden;
        vertical-align: middle;
        border-bottom: 1px solid #888888;
        border-right: 1px solid #888888;
        min-width: 0.3rem;
        padding-left: 10px;
        padding-right: 10px;
        text-overflow: ellipsis;
        white-space: normal;
        word-break: break-all;
        box-sizing: border-box;
    }
    th {
        /* border-width:2px;
        border-style: solid; */
        min-width: 0;
        /* height: 48px; */
        height: 40px;
        white-space: nowrap;
        overflow: hidden;
        background-color: #f8f8f9;
        box-sizing: border-box;
        text-align: left;
        text-overflow: ellipsis;
        padding-left: 10px;
        padding-right: 10px;
        vertical-align: middle;
        border-bottom: 1px solid #888888;
        border-right: 1px solid #888888;
        min-width: 0.3rem;
    }
    tr {
        padding: 0.02rem;
    }
    .demo-carousel {
        line-height: 0.18rem;
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
            <Row>
                <Col span="6" offset="1">
                    <Card v-if="Array.isArray(earnSumArr) && earnSumArr.length > 0">
                        <p slot="title">截至{{ m_date.toLocaleDateString() }} 当日</p>
                        <p>收入总和:</p>
                        <p>
                            ￥{{
                                earnSumArr.reduce((sum, item) => {
                                    return sum + parseFloat(item.earns);
                                }, 0).toFixed(2)
                            }}
                        </p>
                    </Card>
                </Col>
                <Col span="6" offset="1">
                    <Card v-if="earnSumMonthlyArr.length > 0">
                        <p slot="title">截至{{ m_date.toLocaleDateString() }} 当月</p>
                        <p>收入总和：</p>
                        <p>￥{{ earnSumMonthlyArr[0].earns.toFixed(2) }}</p>
                    </Card>
                </Col>
                <Col span="6" offset="1">
                    <Card v-if="earnSumYearlyArr.length > 0">
                        <p slot="title">截至{{ m_date.toLocaleDateString() }}止，该年</p>
                        <p>收入总和：</p>
                        <p>￥{{ earnSumYearlyArr[0].earns.toFixed(2) }}</p>
                    </Card>
                </Col>
            </Row>

            <Col span="20" offset="2" style="margin-bottom: 0.6rem;margin-top: 0.2rem;">
                <Collapse class="collapse-title" v-if="earnSumArr.length > 0" :v-model="'0'">
                    <Panel v-for="(sumInfo, index) in earnSumArr" 
                        v-bind:key="sumInfo.channel"
                        @on-change="pannelOpen(sumInfo.channel)"
                        :name="index">
                        {{ sumInfo.channel }}: &nbsp;&nbsp; {{ m_date.toLocaleDateString() }} &nbsp;&nbsp;收入：￥{{ sumInfo.earns }}
                        <p slot="content" style="overflow: auto;"
                            v-if="dailyDataArr.filter(data => data.channel === sumInfo.channel).length > 0">
                            <table>
                                <thead>
                                    <th>位置</th>
                                    <th>日期</th>
                                    <th>触宝曝光/点击量</th>
                                    <th>客户曝光/点击量</th>
                                    <th>Gap</th>
                                    <th>收入</th>
                                    <th>收入(返点后)</th>
                                    <th>ecpm/ecpc</th>
                                    <th v-if="isAdmin" style="width:1rem;">操作</th>
                                </thead>
                                <tbody>
                                    <tr v-for="dailyData in dailyDataArr.filter(data => data.channel === sumInfo.channel)"
                                        v-bind:key="dailyData.ad_place">
                                        <td>{{ dailyData.ad_place }}</td><!-- 位置 -->
                                        <td>{{ m_date.toLocaleDateString() }}</td><!-- 日期 -->
                                        <td>{{ parseInt(dailyData.settlement) === 1 ?
                                            dailyData.e_exposure : parseInt(dailyData.settlement) === 2 ?
                                            dailyData.e_click : dailyData.e_exposure }}</td><!-- 触宝曝光/点击量 -->
                                        <td><!-- 客户曝光/点击量 -->
                                            <span v-if="sumInfo.editting">
                                                <input v-model="dailyData.e_count" type="number" style="width:0.5rem;"/>
                                            </span>
                                            <span v-else>{{ dailyData.e_count }}</span>
                                        </td>
                                        <td><!-- Gap -->
                                            <span v-if="dailyData.e_count <= 0">0</span>
                                            <span v-else-if="parseInt(dailyData.settlement) === 1">
                                                {{ ((((dailyData.e_exposure - dailyData.e_count) / dailyData.e_exposure) || 0) * 100).toFixed(2) }}%
                                            </span>
                                            <span v-else-if="parseInt(dailyData.settlement) === 2">
                                                {{ ((((dailyData.e_click - dailyData.e_count) / dailyData.e_click) || 0) * 100).toFixed(2) }}%
                                            </span>
                                            <span v-else>0</span>
                                        </td>
                                        <td><!-- 收入 -->
                                            <template v-if="sumInfo.editting && dailyData.ecpm < 0">
                                                <span>
                                                    <input v-model="dailyData.e_earn" type="number" step="0.01" style="width:0.5rem;"/>
                                                </span>
                                            </template>
                                            <template v-else>
                                                <span v-if="dailyData.settlement === 1">
                                                    {{ ((dailyData.ecpm < 0 ? 
                                                        dailyData.e_earn : dailyData.e_count * dailyData.ecpm / 1000) || 0).toFixed(2) }}
                                                </span>
                                                <span v-if="dailyData.settlement === 2">
                                                    {{ ((dailyData.ecpm < 0 ? 
                                                        dailyData.e_earn : dailyData.e_count * dailyData.ecpm) || 0).toFixed(2) }}
                                                </span>
                                            </template>
                                        </td>
                                        <td><!-- 收入(返点后) -->
                                            {{ (dailyData.e_earn * dailyData.rebate || 0).toFixed(2) }}
                                        </td>
                                        <td><!-- ecpm/ecpc -->
                                            <span v-if="dailyData.settlement === 1">
                                            {{ 
                                                ((dailyData.ecpm < 0 ? (dailyData.e_earn / dailyData.e_count) * 1000 : dailyData.ecpm)
                                                || 0).toFixed(2) }}
                                            </span>
                                            <span v-else-if="dailyData.settlement === 2">
                                            {{ 
                                                ((dailyData.ecpm < 0 ? 
                                                (dailyData.e_earn / dailyData.e_count) : dailyData.ecpm)
                                                || 0).toFixed(2) }}
                                            </span>
                                            <span v-else>dailyData.ecpm</span>
                                        </td>
                                        <td v-if="isAdmin" style="text-align: center">
                                            <ButtonGroup v-if="sumInfo.editting">
                                                <Button type="success" @click="submitDailyGroup(sumInfo)">提交</Button>
                                                <Button @click="cancelEdit(sumInfo, 'daily')">取消</Button>
                                            </ButtonGroup>
                                            <Button v-else type="primary" @click="switchEdit(sumInfo, 'daily')">编辑</Button>
                                        </td>
                                        <!-- <td v-if="isAdmin" style="text-align: center">
                                            <ButtonGroup v-if="dailyData.editting">
                                                <Button type="success" @click="submitDaily(dailyData)">提交</Button>
                                                <Button @click="cancelEdit(dailyData)">取消</Button>
                                            </ButtonGroup>
                                            <Button v-else type="primary" @click="switchEdit(dailyData, 'daily')">编辑</Button>
                                        </td> -->
                                    </tr>
                                </tbody>
                            </table>
                        </p>
                        <p slot="content" v-else>目前没有数据或未设定客户信息</p>
                    </Panel>
                </Collapse>
                <Collapse v-else>
                    目前没有数据
                </Collapse>
            </Col>

            <Modal
                v-model="dlgShowFlags.channel"
                title="当前客户设定"
                @on-cancel="hideDialog"
                width="800"
                style="overflow:auto">
                <table>
                    <thead>
                        <th>客户名称</th>
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
                                    <input v-model="channelData.ecpm" type="number" step="0.01" style="width:0.5rem;"/>
                                </span>
                                <span v-else>{{ channelData.ecpm }}</span>
                            </td>
                            <td>
                                <span v-if="channelData.editting">
                                    <input v-model="channelData.rebate" type="number" step="0.01" style="width:0.5rem;"/>
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

            <Modal
                v-model="dlgShowFlags.insertChannel"
                title="新增客户设定"
                @on-ok="submitInsertChannel"
                :ok-text="'提交'"
                :closable="false"
                :mask-closable="false"
                :loading="formChannelLoading"
                width="800">
                <Form ref="formChannel" :model="formChannel" :rules="channelValidate" :label-width="80">
                    <FormItem label="客户名称" prop="channel">
                        <Input v-model="formChannel.channel" placeholder="请输入客户名称" />
                    </FormItem>
                    <FormItem label="广告位置" prop="ad_place">
                        <Input v-model="formChannel.ad_place" placeholder="请输入广告位置" />
                    </FormItem>
                    <FormItem label="结算方式" prop="settlement">
                        <Select v-model="formChannel.settlement" placeholder="请选择结算方式">
                            <Option value="1">按曝光结算</Option>
                            <Option value="2">按点击结算</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="ecpm" prop="ecpm">
                        <Input v-model="formChannel.ecpm" placeholder="请输入ecpm,若动态结算则填写-1" type="text" />
                    </FormItem>
                    <FormItem label="返点" prop="rebate">
                        <Input v-model="formChannel.rebate" placeholder="返点值,若无返点则填写1" type="text" />
                    </FormItem>
                </Form>
            </Modal>

            <Table :columns="columns" :data="dailyDataArr" size="small" ref="table" style="display:none"></Table>

            <ButtonGroup style="position: fixed; bottom:0.2rem;left:50%;">
                <Button v-if="isAdmin" type="success" @click="showDialog('insertChannel')"><Icon type="android-add"></Icon>  新增客户设定</Button>
                <Button v-if="isAdmin" type="primary" @click="showDialog('channel')"><Icon type="ios-list-outline"></Icon>  查看客户设定</Button>
                <Button type="info" @click="exportReport()" v-if="dailyDataArr.length > 0"><Icon type="ios-download-outline"></Icon>  导出当日结果</Button>
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
import RESULT_CODE from "../../../../../router/codemap.json";
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
            earnSumMonthlyArr: [],
            earnSumYearlyArr: [],
            dailyDataArr: [],
            channelDataArr: [],
            dlgShowFlags: {
                channel: false,
                insertChannel: false
            },
            formChannel: {
                channel: "",
                ad_place: "",
                settlement: 1,
                ecpm: -1,
                rebate: 1.0,
            },
            formChannelLoading: true,
            channelValidate: {
                channel: { required: true, message: "请输入客户名称", trigger: "blur" },
                ad_place: { required: true, message: "请输入广告位置", trigger: "blur" },
                settlement: { required: true, message: "请输入结算方式", trigger: "blur" },
                // ecpm: { required: true, message: "ecpm必须为数字", trigger: 'blur' },
                // rebate: { required: true, message: "返点值必须为数字", trigger: "blur" }
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
            qrList: {},
            columns: [
                {
                    title: "客户",
                    key: "channel"
                },
                {
                    title: "日期",
                    key: "e_date"
                },
                {
                    title: "广告位置",
                    key: "ad_place"
                },
                {
                    title: "曝光",
                    key: "e_exposure"
                },
                {
                    title: "点击",
                    key: "e_click"
                },
                {
                    title: "客户曝光/点击",
                    key: "e_count"
                },
                {
                    title: "收入",
                    key: "e_earn"
                },
                {
                    title: "收入(返点后)",
                    key: "earn_rebate"
                },
                {
                    title: "ecpm/ecpc",
                    key: "ecpm"
                },
            ],
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
            this.formChannelLoading = true;
        },

        processArr: function(orgArr) {

        },

        setCurPage: function(index) {
            this.curIndex = index;
        },

        exportReport: function() {
            this.dailyDataArr.forEach(item => {
                item.earn_rebate = item.e_earn * item.rebate;
            });
            this.$refs.table.exportCsv({
                filename: "report_" + this.m_date
            });
        },

        fetchEarns: function() {
            this.earnSumArr.length = 0;
            this.dailyDataArr.length = 0;
            if (this.m_date) {
                queryDataByDate(PATH_OPT, 
                    { 
                        token: this.token, 
                        m_date: this.m_date
                    },
                    "query-channel-sum")
                    .then(ret => {
                        this.earnSumArr = ret.map(item =>  {
                                item.editting = false;
                                item.e_date = new Date(this.m_date).toLocaleDateString();
                                return item;
                            });
                        this.earnSumArr.sort((a, b) => {
                            return a.e_earn - b.e_earn;
                        });
                        return queryDataByDate(PATH_OPT, 
                            { 
                                token: this.token, 
                                m_date:this.m_date
                            },
                            "query-journal");
                    })
                    .then(ret => {
                        console.log("fetchEarns: %s", JSON.stringify(ret));
                        setTimeout(() => {
                            this.dailyDataArr = ret.map(item =>  {
                                item.editting = false;
                                item.e_date = new Date(this.m_date).toLocaleDateString();
                                return item;
                            });
                        }, 1000);
                        setTimeout(this.fetchSum, 2000);
                    })
                    .catch(e => {
                        console.log("request err: %s", JSON.stringify(e));
                    });
            }
        },
        fetchSum: function() {
            queryDataByDate(PATH_OPT,
                {
                    token: this.token,
                    m_date: [ `${this.m_date.getFullYear()}/${this.m_date.getMonth() + 1}/01`,
                        `${this.m_date.getFullYear()}/${this.m_date.getMonth() + 1}/${this.m_date.getDate()}` ]
                }, "query-sum")
                .then(ret => {
                    console.log("monthly: %s", JSON.stringify(ret));
                    this.earnSumMonthlyArr = ret;
                    return queryDataByDate(PATH_OPT,
                        {
                            token: this.token,
                            m_date: [ `${this.m_date.getFullYear()}/01/01`, 
                                `${this.m_date.getFullYear()}/${this.m_date.getMonth() + 1}/${this.m_date.getDate()}` ]
                        }, "query-sum");
                })
                .then(ret => {
                    console.log("yearly: %s", JSON.stringify(ret));
                    this.earnSumYearlyArr = ret;
                })
                .catch(e => {
                    console.log("request err: %s", JSON.stringify(e));
                });
        },

        showDialog: function(type) {
            this.dlgShowFlags[type] = true;
            switch (type) {
                case "channel":
                    queryDataByDate(PATH_ADMIN, 
                        { token: this.token }, "query-channel")
                        .then(ret => {
                            console.log("query-channel: %s", JSON.stringify(ret));
                            ret.map(item => item.editting = false);
                            this.channelDataArr = Object.assign(ret);
                        })
                        .catch(e => {
                            console.log("query-channel err: %s", JSON.stringify(e));
                        });
                    break;
                case "insertChannel":
                default:
                    break;
            }
        },

        submitInsertChannel: function() {
            this.$refs["formChannel"].validate((valid) => {
                if (valid) {
                    if (Number.isNaN(parseFloat(this.formChannel.ecpm)) ||
                        Number.isNaN(parseFloat(this.formChannel.rebate))) {
                        func.showTips("alert-error","ecpm与返点值必须是数字!");
                        setTimeout(() => {
                            this.formChannelLoading = false;
                        }, 2000);
                        setTimeout(() => {
                            this.formChannelLoading = true;
                        }, 2100);
                        return;
                    }
                let params = {
                    token: this.token,
                    action: "insert-channel",
                    params: this.formChannel
                };
                requester.send(PATH_ADMIN, 
                    params,
                    result => {
                        if (result.status === RESULT_CODE.SUCCESS) {
                            func.showTips("alert-success", "添加成功！");
                        }
                        this.hideDialog();
                        setTimeout(this.fetchEarns, 500);
                        // this.fetchEarns();
                    }, (status, msg) => {
                        func.showTips("alert-error", "添加失败！");
                    });
                } else {
                    func.showTips("alert-error","表单验证失败!");
                    setTimeout(() => {
                        this.formChannelLoading = false;
                    }, 2000);
                    setTimeout(() => {
                        this.formChannelLoading = true;
                    }, 2100);
                }
            })
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
                    setTimeout(this.fetchEarns, 500);
                    // this.fetchEarns();
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
                    let deletedChannelPos = this.channelDataArr.findIndex(item => {
                        return item.channel === channelData.channel && item.ad_place === channelData.ad_place;
                    });
                    this.channelDataArr.splice(deletedChannelPos, 1);
                    setTimeout(this.fetchEarns, 500);
                    // this.fetchEarns();
                }, (status, msg) => {
                    func.showTips("alert-error", "删除失败！");
                    // this.cancelEdit(dailyData);
                });
        },

        submitDaily: function(dailyData) {
            dailyData.e_date = new Date(dailyData.e_date).toLocaleDateString();
            dailyData.e_earn = dailyData.ecpm < 0 ?
                dailyData.e_earn : 
                dailyData.settlement === 1 ? 
                    (dailyData.e_count * dailyData.ecpm) / 1000 : dailyData.e_count * dailyData.ecpm;
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
                    setTimeout(this.fetchEarns, 500);
                    this.switchEdit(dailyData);
                }, (status, msg) => {
                    func.showTips("alert-error", "修改失败！");
                });
        },

        submitDailyGroup: function(sumData) {
            let tempArr = this.dailyDataArr.filter(item => {
                return (item.channel === sumData.channel 
                    && item.e_date === sumData.e_date);
            });
            tempArr.forEach(item => {
                item.e_date = new Date(item.e_date).toLocaleDateString();
                item.e_earn = item.ecpm < 0 ?
                    item.e_earn : 
                    item.settlement === 1 ? 
                        (item.e_count * item.ecpm) / 1000 : item.e_count * item.ecpm;
            });
            
            let params = {
                token: this.token,
                action: "update-journal-group",
                params: tempArr
            };
            requester.send(PATH_ADMIN, 
                params,
                result => {
                    if (result.status === RESULT_CODE.SUCCESS) {
                        func.showTips("alert-success", "修改成功！");
                    }
                    tempArr.forEach(item => item.e_version++);
                    setTimeout(this.fetchEarns, 500);
                    this.switchEdit(sumData, "daily");
                }, (status, msg) => {
                    func.showTips("alert-error", "修改失败！");
                });
        },
        switchEdit: function(editData, type) {
            if (editData) {
                if (!editData.editting) {
                    this.backupDataBeforeEdit(editData);
                }
                editData.editting = !editData.editting;
            }
            if (type === "daily") {
                let tempArr = this.dailyDataArr.filter(item => {
                    return (item.channel === editData.channel 
                        && item.e_date === editData.e_date);
                });
                tempArr.forEach(item => this.switchEdit(item));
            }
        },
        backupDataBeforeEdit: function(data) {
            if (data.hasOwnProperty("e_count") && data.hasOwnProperty("e_earn")) {
                data.backup =  {
                    e_count: data.e_count,
                    e_earn: data.e_earn
                };
            } else if (data.hasOwnProperty("settlement") && data.ecpm != 0 && data.rebate != 0) {
                data.backup = {
                    settlement: data.settlement,
                    ecpm: data.ecpm,
                    rebate: data.rebate
                };
            }
        },
        cancelEdit: function(editData, type) {
            if (editData.backup) {
                Object.assign(editData, editData.backup);
            }
            editData.editting = false;
            if (type === "daily") {
                let tempArr = this.dailyDataArr.filter(item => {
                    return (item.channel === editData.channel 
                        && item.e_date === editData.e_date);
                });
                tempArr.forEach(item => this.cancelEdit(item));
            }
        }
    }
}


function queryDataByDate(path, params, action) {
    return new Promise((resolve, reject) => {
        let date = params.m_date || "";
        if (date && !Array.isArray(date)) {
            date = date.toLocaleDateString();
        }
        let req_params = { 
            token: params.token, 
            action: action
        };
        req_params.m_date = date;
        requester.send(path, 
            req_params,
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
