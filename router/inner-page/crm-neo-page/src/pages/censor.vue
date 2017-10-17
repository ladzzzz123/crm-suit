<style>
    h4 {
        overflow:hidden;
        text-align: left;
        text-overflow:ellipsis;
        -o-text-overflow:ellipsis;
        white-space:nowrap;
        width:60%;
    }
    .card {
        width:96%;
        height:99%;
        margin-bottom:0.1rem;
    }
    .left {
        text-align: left;
    }
    .top{
        padding: 10px;
        background: rgba(0, 153, 229, .7);
        color: #fff;
        text-align: center;
        border-radius: 2px;
    }
</style>

<template>
    <div class="container" v-if="logged">
        <Spin size="large" fix v-if="loading"></Spin>
        <div class="data-list" v-if="verified">
            <DatePicker type="date" placeholder="选择日期和时间" v-model="m_date" 
            @on-ok="fetchMate"
            confirm style="width: 2rem"></DatePicker>
            <br/>
            <br/>
            <Button type="primary" @click="reportRet">发送审核结果</Button>
            <i-select v-if="orgArr.length > 0" class="dsp-select" v-model="dsp" style="width:1.5rem" placeholder="选择dsp">
                <i-option v-for="dsp in Object.keys(statusInfo.dspCount)"
                        :value="dsp"
                        v-bind:key="dsp"
                        @click.native="dspChanged(dsp)">
                    {{ dsp }}
                </i-option>
                <i-option value="全部" @click.native="dspChanged('全部')">全部</i-option>
            </i-select>
            <br/>
            <br/>
            <div class="list-group">
                <template v-if="orgArr.length < 1">
                    未检索到任何信息！
                </template>
                <template v-else>
                    <BackTop :height="50">
                        <div class="top">返回顶端</div>
                    </BackTop>
                    <Affix :offset-top="1">
                        <Row>
                            <Col span="10">
                                <Tag type="dot" v-for="(status, index) in Object.entries(statusInfo.statusCount)" 
                                    @click.native="typeChanged(status[0])"
                                    v-bind:key="status[0]" :color="colors[index]" style="width: 1.6rem" :title="status[1]">
                                    {{ status[0] }}: {{ status[1] }}
                                </Tag>
                            </Col>
                            <Col span="14">
                                <Tag type="dot" v-for="(status, index) in Object.entries(statusInfo.dspCount)" 
                                    @click.native="dspChanged(status[0])"
                                    :color="dsp === status[0] ? colors[1] : colors[4]"
                                    v-bind:key="status[0]" style="width: 1.6rem" :title="status[1]">
                                    {{ status[0] }}: {{ status[1] }}
                                </Tag>
                            </Col>
                        </Row>
                    </Affix>
                    <Card class="card" v-for="(item, pos) in curArray" v-bind:key="'dsp_' + pos">
                        <h4 :title="item[0]">{{ item[0] }}</h4>
                        <Row>
                            <Col span="8" v-for="material in item[1]" v-bind:key="'material_' + material._id">
                                <Card class="card">
                                    <div>DSP名称：{{ material.dsp }}</div>
                                    <div>广告位置：{{ material.tu }}</div>
                                    <a :href="material.material" target="_blank">
                                        <img :src="material.material" width="60%" alt="该图片加载失败" style="min-height:0.2rem;min-width:0.2rem" />
                                    </a>
                                    <br/>
                                    <a :href="material.ldp" target="_blank">落地页链接</a>
                                    <div>
                                        <Button @click="makeQrCode('qr_' + material._id, material.ldp)">点击生成二维码</Button>
                                        <div :id="'qr_' + material._id" style="margin:0 auto;margin-top:0.2rem;width:128px"></div>
                                    </div>
                                    
                                    <br/>
                                    当前状态：
                                    <p>
                                        <Tag color="blue" v-if="material.m_status === 'NEW' ">待审核</Tag>
                                        <Tag color="green" v-else-if="material.m_status === 'PASS' ">已通过</Tag>
                                        <Tag color="red" v-else-if="material.m_status === 'REJECT' " :title="material.reason || '未填写' ">
                                            已拒绝，原因：{{ material.reason || "未填写" }}
                                        </Tag>
                                        <Tag color="yellow" v-else-if="material.m_status === 'TBD' " :title="material.reason || '未填写' ">
                                            再议，原因：{{ material.reason || "未填写" }}
                                        </Tag>
                                        <Tag v-else>未知状态</Tag>
                                    </p>
                                    <br/>
                                    <p v-if="material.opter">
                                        最后编辑：
                                        <br/>
                                        <Tag color="default"> {{ material.opter }} </Tag>
                                    </p>
                                    <br/>
                                    <ButtonGroup class="btn-group" role="group" aria-label="edit">
                                        <Button v-if="material.m_status !== 'PASS' " type="success" @click="pass('material_' + material._id, material.ldp, material.m_version)">通过</Button>
                                        <Button type="warning" @click="delay('material_' + material._id, material.ldp, material.m_version)">再议</Button>
                                        <Button type="error" @click="denied('material_' + material._id, material.ldp, material.m_version)">拒绝</Button>
                                    </ButtonGroup>
                                </Card>
                            </Col>
                        </Row>
                        
                        <ButtonGroup v-show="item[1].length > 1 && item[1].every(item => item.m_status === 'NEW') " class="btn-group" role="group" aria-label="edit">
                            <Button type="success" @click="passAll('dsp_' + pos, item[1][0].m_version)">该组全部通过</button>
                            <Button type="warning" @click="delayAll('dsp_' + pos, item[1][0].m_version)">该组全部再议</button>
                            <Button type="error" @click="deniedAll('dsp_' + pos, item[1][0].m_version)">该组全部拒绝</button>
                        </ButtonGroup>
                    </Card>
                    <pageNav :indexInfo="indexInfo" v-on:setCurPage="setCurPage"/>
                </template>
            </div>
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
            LDP_PER_PAGE: 12,
            // curArray: [],
            dsp:"",
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
        indexInfo() {
            let length = parseInt((this.list.length - 1) / this.LDP_PER_PAGE) + 1;
            let indexs = new Array(length).fill(0).map((item, index) => index);
            return { indexs: indexs };
        },
       
        statusInfo() {
            let tempCountContent = {
                "未审核":0,
                "已通过":0,
                "未通过":0,
                "再议":0
            };
            let dspContent = {};
            this.orgArr.forEach(item => {
                (dspContent[item.dsp]) ? dspContent[item.dsp] += 1 : dspContent[item.dsp] = 1;
                switch (item.m_status) {
                    case "NEW":
                        tempCountContent["未审核"] += 1;
                        break;
                    case "PASS":
                        tempCountContent["已通过"] += 1;
                        break;
                    case "REJECT":
                        tempCountContent["未通过"] += 1;
                        break;
                    case "TBD":
                        tempCountContent["再议"] += 1;
                        break;
                    default:
                        break;
                }
            });
            return {
                statusCount: tempCountContent,
                dspCount: dspContent
            };
        }
    },

    watch: {
        localArr: function(_localArr) {
            this.loading = true;
            setTimeout(() => {
                let tempObj = {};
                this.list.length = 0;
                if (Array.isArray(_localArr)) {
                    _localArr.forEach(item => {
                        let ldpUrl = item.ldp.split("?")[0];
                        if (!Array.isArray(tempObj[ldpUrl])) {
                            tempObj[ldpUrl] = [];
                        }
                        tempObj[ldpUrl].push(item);
                    });
                }
                this.curIndex = 0;
                this.list = Object.entries(tempObj);
            }, 500);
        }
    },

    components: {
        pageNav
    },

    mounted: function() {
        if (this.logged) {
            requester.send("/crm-inner/censor", { token: this.token },
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

        processArr: function(orgArr) {
            this.orgArr.length = 0;
            this.localArr.length = 0;
            this.list.length = 0;
            if (Array.isArray(this.orgArr)) {
                this.orgArr = orgArr;
                Object.assign(this.localArr, orgArr);
                let tempObj = {};
                if (Array.isArray(orgArr)) {
                    orgArr.forEach(item => {
                        let ldpUrl = item.ldp.split("?")[0];
                        if (!Array.isArray(tempObj[ldpUrl])) {
                            tempObj[ldpUrl] = [];
                        }
                        tempObj[ldpUrl].push(item);
                    });
                }
                this.list = Object.entries(tempObj);
            }
        },

        setCurPage: function(index) {
            this.curIndex = index;
        },

        fetchMate: function() {
            if (this.m_date) {
                requester.send("/crm-inner/censor/fetch", 
                    { 
                        token: this.token, 
                        m_date: this.m_date.toLocaleDateString()
                    },
                    result => {
                        if (result.status === RESULT_CODE.SUCCESS) {
                            this.processArr(result.content.ret);
                        }
                    }, (status, msg) => {
                        processFailed(status);
                    });
            }
        },
        reportRet: function() {
            if (this.m_date) {
                func.showDialog("input", "请填写收件人", inputText => {
                    requester.send("/crm-inner/censor/report", 
                        {
                            token: this.token, 
                            m_date: this.m_date.toLocaleDateString(),
                            to: inputText
                        },
                        result => {
                            if (result.status === RESULT_CODE.SUCCESS) {
                                func.showTips("alert-success", "发送成功");
                            }
                            func.hideDialog();
                        }, (status, msg) => {
                            processFailed(status);
                        });
                }, "请填写收件人，多个收件人用半角逗号分隔");
            } else {
                func.showTips("alert-danger", "素材日期未选择!");
            }
        },

        dspChanged: function(dsp) {
            console.log(dsp);
            this.dsp = dsp;
            this.localArr.length = 0;
            let tempArr = [];
            if (dsp === "全部") {
                tempArr = Array.from(this.orgArr);
            } else {
                this.orgArr.forEach(item => {
                    if (item.dsp === dsp) {
                        tempArr.push(item);
                    }
                });
            }
            this.localArr = tempArr;
        },

        typeChanged: function(statusType) {
            switch (statusType) {
                case "未审核":
                    this.statusType = "NEW";
                    break;
                case "已通过":
                    this.statusType = "PASS";
                    break;
                case "未通过":
                    this.statusType = "REJECT";
                    break;
                case "再议":
                    this.statusType = "TBD";
                    break;
                default:
                    break;
            }
            this.localArr.length = 0;
            let tempArr = [];
            if (statusType === "全部") {
                tempArr = Array.from(this.orgArr);
            } else {
                this.orgArr.forEach(item => {
                    if (item.m_status === this.statusType) {
                        tempArr.push(item);
                    }
                });
            }
            this.localArr = tempArr;
        },

        pass: function(id, ldp, m_version) {
            console.log("pass:" + id);
            let _id = id.replace("material_", "");
            this.updateStatus(_id, ldp, "pass", inputText, m_version, "PASS");
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
                    (neoItem) && (neoItem.m_status = n_status) 
                        && (neoItem.reason = inputText)  
                        && (neoItem.m_version = parseInt(neoItem.m_version) + 1)
                        && (neoItem.opter = this.userInfo.mail);
                    func.hideDialog();
                }, (status, msg) => {
                    func.showTips("alert-error", "更新状态失败，该素材可能已被他人编辑，请刷新列表后再尝试！");
                    processFailed(status);
                });
        },

        passAll: function(id, m_version) {
            console.log("passAll:" + id);
            func.showDialog("confirm", "确认通过该组素材？", inputText => {
                this.updateGroupStatus(id, "pass", inputText, m_version, "PASS");
            });
        },
        deniedAll: function(id, m_version) {
            console.log("deniedAll:" + id);
            func.showDialog("input", "确认拒绝该组素材？", inputText => {
                this.updateGroupStatus(id, "denied", inputText, m_version, "REJECT");
            }, "请填写拒绝理由");
        },
        delayAll:function(id, m_version) {
            console.log("delayAll:" + id);
            func.showDialog("input", "该素材需要再议？", inputText => {
                this.updateGroupStatus(id, "tbd", inputText, m_version, "TBD");
            }, "请填写理由");
        },

        updateGroupStatus: function(id, action, inputText, m_version, m_status) {
            let _id = id.replace("dsp_", "");
            let ids = this.curArray[_id][1].map(item => {
                return item._id;
            });
            requester.send("/crm-inner/censor/update", 
                {
                    token: this.token, 
                    ids: ids,
                    action: action,
                    reason: inputText || "",
                    m_version: m_version
                },
                result => {
                    func.showTips("alert-success", "更新组状态成功");
                    this.curArray[_id][1].forEach(item => {
                        item.m_status = m_status;
                        item.reason = inputText || "";
                    });
                    func.hideDialog();
                }, (status, msg) => {
                    processFailed(status);
                });
        },
        makeQrCode: function(id, url) {
            if (this.qrList[id]) {
                return;
            }
            this.qrList[id] = true;
            console.log("id: %s, this.qrList.id: %s" , id, this.qrList[id]);
            let qrcode = new QRCode(document.getElementById(id), {
                text: url,
                width: 128,
                height: 128,
                colorDark : "#000000",
                colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.H
            });
        }
    }
}
</script>
