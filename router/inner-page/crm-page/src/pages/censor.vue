<template>
    <div class="container" v-if="logged">
        <div class="data-list" v-if="verified">
            <form onsubmit="return false">
                <input type="date" class="censor-date" v-model="m_date" required/>
                <br/>
                <button class="btn btn-success" @click="fetchMate">获取素材列表</button>
            </form>
            <ul class="list-group">
                <li v-for="(item, pos) in curArray" class="list-group-item" v-bind:key="'dsp_' + pos">
                    <h4>{{ item[0] }}</h4>
                    <ul class="list-group">
                        <li v-for="material in item[1]" class="list-group-item" v-bind:key="'material_' + material._id">
                            <div class="row">
                                <div class="col-md-7">
                                    <div>DSP名称：{{ material.dsp }}</div>
                                    <div>广告位置：{{ material.tu }}</div>
                                    <img :src="material.material" width="30%" :alt="material.material" />
                                    <br/>
                                    <a :href="material.ldp">落地页链接</a>
                                </div>
                                <div class="col-md-3">
                                    <div v-if="material.m_status === 'NEW' " class="btn-group" role="group" aria-label="edit">
                                        <button class="btn btn-success" @click="pass('material_' + material._id, material.ldp)">通过</button>
                                        <button class="btn btn-info" @click="denied('material_' + material._id, material.ldp)">拒绝</button>
                                        <button class="btn btn-warning" @click="delay('material_' + material._id, material.ldp)">再议</button>
                                    </div>
                                </div>
                                <div class="col-md-2">
                                    当前状态：
                                    <p> 
                                        <span class="label label-info" v-if="material.m_status === 'NEW' ">待审核</span>
                                        <span class="label label-success" v-else-if="material.m_status === 'PASS' ">已通过</span>
                                        <span class="label label-danger" v-else-if="material.m_status === 'REJECT' ">已拒绝，原因：{{ material.reason || "未填写" }}</span>
                                        <span class="label label-warning" v-else-if="material.m_status === 'TBD' ">再议，原因：{{ material.reason || "未填写" }}</span>
                                        <span class="label label-default" v-else>未知状态</span>
                                    </p>
                                </div>
                            </div>
                        </li>
                    </ul>
                    <div v-show="item[1].length > 1 && item[1].every(item => item.m_status === 'NEW') " class="btn-group" role="group" aria-label="edit">
                        <button class="btn btn-primary" @click="passAll('dsp_' + pos)">该组全部通过</button>
                        <button class="btn btn-info" @click="deniedAll('dsp_' + pos)">该组全部拒绝</button>
                        <button class="btn btn-warning" @click="delayAll('dsp_' + pos)">该组全部再议</button>
                    </div>
                </li>
                <pageNav :indexInfo="indexInfo" v-on:setCurPage="setCurPage"/>
            </ul>
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

export default {
    data: () => {
        return {
            verified: false,
            m_date: "",
            list:[],
            LDP_PER_PAGE: 12,
            curArray: [],
            curIndex: 0,
            indexInfo: {
                curIndex: 0,
                indexs: []
            },
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
                    if (status === RESULT_CODE.LOGIN_EXPIRE) {
                        this.$store.dispatch("asyncQuit");
                        setTimeout(() => {
                            this.gotoLogin();
                        }, 3000);
                    }
                });
        }
    },
    
    methods: {
        gotoLogin: function() {
            this.$router.push("/login");
        },

        processArr: function(orgArr) {
                // {
                //     "_id": 117,
                //     "tu": "挂机",
                //     "dsp": "网易有道",
                //     "m_date": "2017-09-10T16:00:00.000Z",
                //     "ldp": "http://win.jzhj66.com/new/20170905/\n",
                //     "material": "http://oimageb8.ydstatic.com/image?id=-7042301259022038969&product=adpublish&w=640&h=960",
                //     "pv": 131,
                //     "opter": null,
                //     "m_status": "NEW",
                //     "last_edit": "2017-09-25T01:34:32.000Z"
                // }

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
            let length = parseInt(this.list.length / this.LDP_PER_PAGE) + 1;
            this.indexInfo.indexs = new Array(length).fill(0).map((item, index) => index);
            this.curArray = this.list.slice(this.curIndex * this.LDP_PER_PAGE, (this.curIndex + 1) * this.LDP_PER_PAGE);
        },

        setCurPage: function(index) {
            this.curIndex = index;
            this.curArray = this.list.slice(this.curIndex * this.LDP_PER_PAGE, (this.curIndex + 1) * this.LDP_PER_PAGE);
        },

        fetchMate: function() {
            if (this.m_date) {
                console.log("this.m_date:" + JSON.stringify(this.m_date));
                requester.send("/crm-inner/censor/fetch", 
                    { 
                        token: this.token, 
                        m_date: this.m_date.replace(/(\/|\-)/gi, "")
                    },
                    result => {
                        if (result.status === RESULT_CODE.SUCCESS) {
                            this.processArr(result.content.ret);
                        }
                    }, (status, msg) => {
                        if (status === RESULT_CODE.LOGIN_EXPIRE) {
                            this.$store.dispatch("asyncQuit");
                            setTimeout(() => {
                                this.gotoLogin();
                            }, 3000);
                        }
                    });
            }
        },
        pass: function(id, ldp) {
            console.log("pass:" + id);
            let _id = id.replace("material_", "");
            requester.send("/crm-inner/censor/update", 
                    {
                        token: this.token, 
                        ids: [_id],
                        action: "pass"
                    },
                    result => {
                        func.showTips("alert-success", "更新成功！");
                        let neoArr = this.curArray.find(item => {
                            return ldp.indexOf(item[0]) > -1;
                        });
                        neoArr = neoArr || ["", []];
                        let neoItem = neoArr[1].find(subItem => ("" + subItem._id) === _id);
                        (neoItem) && (neoItem.m_status = "PASS");
                    }, (status, msg) => {
                        if (status === RESULT_CODE.LOGIN_EXPIRE) {
                            this.$store.dispatch("asyncQuit");
                            setTimeout(() => {
                                this.gotoLogin();
                            }, 3000);
                        }
                    });
        },
        denied: function(id, ldp) {
            console.log("denied:" + id);
            func.showDialog("input", "确认拒绝该素材？", inputText => {
                let _id = id.replace("material_", "");
                requester.send("/crm-inner/censor/update", 
                    {
                        token: this.token, 
                        ids: [_id],
                        action: "denied",
                        reason: inputText || ""
                    },
                    result => {
                        func.showTips("alert-success", "已拒绝该素材！");
                        let neoArr = this.curArray.find(item => {
                            return ldp.indexOf(item[0]) > -1;
                        });
                        neoArr = neoArr || ["", []];
                        let neoItem = neoArr[1].find(subItem => ("" + subItem._id) === _id);
                        (neoItem) && (neoItem.m_status = "REJECT") && (neoItem.reason = inputText);
                        func.hideDialog();
                    }, (status, msg) => {
                        func.hideDialog();
                        if (status === RESULT_CODE.LOGIN_EXPIRE) {
                            this.$store.dispatch("asyncQuit");
                            setTimeout(() => {
                                this.gotoLogin();
                            }, 3000);
                        }
                    });
            });
        },
        delay:function(id, ldp) {
            console.log("delay:" + id);
            func.showDialog("input", "该素材需要再议？", inputText => {
                let _id = id.replace("material_", "");
                requester.send("/crm-inner/censor/update", 
                    {
                        token: this.token, 
                        ids: [_id],
                        action: "tbd",
                        reason: inputText || ""
                    },
                    result => {
                        func.showTips("alert-success", "已确定再议该素材！");
                        let neoArr = this.curArray.find(item => {
                            return ldp.indexOf(item[0]) > -1;
                        });
                        neoArr = neoArr || ["", []];
                        let neoItem = neoArr[1].find(subItem => ("" + subItem._id) === _id);
                        (neoItem) && (neoItem.m_status = "TBD") && (neoItem.reason = inputText);
                        func.hideDialog();
                    }, (status, msg) => {
                        func.hideDialog();
                        if (status === RESULT_CODE.LOGIN_EXPIRE) {
                            this.$store.dispatch("asyncQuit");
                            setTimeout(() => {
                                this.gotoLogin();
                            }, 3000);
                        }
                    });
            });
        },
        passAll: function(id) {
            console.log("passAll:" + id);
            let _id = id.replace("dsp_", "");
            let ids = this.curArray[_id][1].map(item => {
                return item._id;
            });
            requester.send("/crm-inner/censor/update", 
                    { 
                        token: this.token, 
                        ids: ids,
                        action: "pass"
                    },
                    result => {
                        func.showTips("alert-success", "该组更新成功！");
                        this.curArray[_id][1].forEach(item => {
                            item.m_status = "PASS";
                        });
                    }, (status, msg) => {
                        if (status === RESULT_CODE.LOGIN_EXPIRE) {
                            this.$store.dispatch("asyncQuit");
                            setTimeout(() => {
                                this.gotoLogin();
                            }, 3000);
                        }
                    });

        },
        deniedAll: function(id) {
            console.log("deniedAll:" + id);
            func.showDialog("input", "确认拒绝该组素材？", inputText => {
                let _id = id.replace("dsp_", "");
                let ids = this.curArray[_id][1].map(item => {
                    return item._id;
                });
                requester.send("/crm-inner/censor/update", 
                    {
                        token: this.token, 
                        ids: ids,
                        action: "denied",
                        reason: inputText || ""
                    },
                    result => {
                        func.showTips("alert-success", "已拒绝该组素材！");
                        this.curArray[_id][1].forEach(item => {
                            item.m_status = "REJECT";
                            item.reason = inputText || "";
                        });
                        func.hideDialog();
                    }, (status, msg) => {
                        func.hideDialog();
                        if (status === RESULT_CODE.LOGIN_EXPIRE) {
                            this.$store.dispatch("asyncQuit");
                            setTimeout(() => {
                                this.gotoLogin();
                            }, 3000);
                        }
                    });
            });
        },
        delayAll:function(id) {
            console.log("delayAll:" + id);
            func.showDialog("input", "该素材需要再议？", inputText => {
                let _id = id.replace("dsp_", "");
                let ids = this.curArray[_id][1].map(item => {
                    return item._id;
                });
                requester.send("/crm-inner/censor/update", 
                    {
                        token: this.token, 
                        ids: ids,
                        action: "tbd",
                        reason: inputText || ""
                    },
                    result => {
                        func.showTips("alert-success", "已确定再议该素材！");
                        this.curArray[_id][1].forEach(item => {
                            item.m_status = "TBD";
                            item.reason = inputText || "";
                        });
                        func.hideDialog();
                    }, (status, msg) => {
                        func.hideDialog();
                        if (status === RESULT_CODE.LOGIN_EXPIRE) {
                            this.$store.dispatch("asyncQuit");
                            setTimeout(() => {
                                this.gotoLogin();
                            }, 3000);
                        }
                    });
            });
        },

    }
}
</script>

<style>

</style>
