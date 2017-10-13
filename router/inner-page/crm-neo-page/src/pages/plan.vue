<template>
    <Row v-if="logged" type="flex" justify="center">
        <Spin size="large" fix v-if="loading"></Spin>
        <Row type="flex" justify="start" align="middle" style="width:100%">
            <Col span="4">
                <Dropdown style="margin-left: 20px">
                    <Button type="primary">
                        排序方式
                        <Icon type="arrow-down-b"></Icon>
                    </Button>
                    <DropdownMenu slot="list">
                        <DropdownItem @click.native="sortArray('time')">按时间正序</DropdownItem>
                        <DropdownItem @click.native="sortArray('r_time')">按时间倒序</DropdownItem>
                        <!-- <DropdownItem @click.native="sortArray('status')">按状态正序</DropdownItem>
                        <DropdownItem @click.native="sortArray('r_status')">按状态倒序</DropdownItem>
                        <DropdownItem disabled>随机</DropdownItem> -->
                    </DropdownMenu>
                </Dropdown>
            </Col>
            <Col span="4" offset="16">
                <Tooltip content="开启邮件通知" placement="bottom">
                    <i-switch v-model="noticeFlag" @on-change="noticeFlagStatus" size="large">
                        <span slot="open">开启</span>
                        <span slot="close">关闭</span>
                    </i-switch>
                </Tooltip>
                
            </Col>
        </Row>
        <br/>
        <br/>
        <Card style="width:96%;height:99%;margin-bottom:0.1rem;" v-for="item in planList" :id="'msg_' + item._id" v-bind:key="'msg_' + item._id">
            <p slot="title" :title="item.title">{{ item.title }}</p>
            <Row>
                <Col span="10">
                    <p class="list-group-item-text">发起人: {{ item.m_from }}</p>
                    <p class="list-group-item-text" :title="item.m_cc">抄送: {{ item.m_cc }}</p>
                    <p class="list-group-item-text">发送日期: {{ new Date(item.m_date).toLocaleString() }}</p>
                    <p class="list-group-item-text">谁在处理: <span class="label label-success">{{ item.m_opter }}</span> </p>
                    <p class="list-group-item-text">最后编辑日期: {{ new Date(item.last_edit).toLocaleString() }}</p>
                    
                    <br/>
                    <br/>

                    <p class="list-group-item-text">
                        <Button v-if="item.m_status === 'NEW'" type="success" @click="acceptPlan(item._id)">接受</Button>
                        <Button disabled v-else>{{ item.m_opter === userInfo.u_name ? "已接受" : "已被他人接受" }} </Button>
                        <Button v-if="isAdmin && item.m_status !== 'RESOLVE'" type="error" @click="delPlan(item._id)">删除任务</Button>
                        <template v-if="item.m_opter === userInfo.u_name">
                            <template v-if="item.m_status === 'ACCEPT' ">
                                <Button type="primary" @click="finishPlan(item._id)">我完成啦</Button>
                                <Upload
                                    multiple
                                    :on-error="onUploadError"
                                    :on-success="handleUploadSuccess"
                                    :data="{ token: token, plan_id: item._id}"
                                    :action="UPLOAD_URL"
                                    type="drag">
                                    <div style="padding: 20px 0">
                                        <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
                                        <p>点击或将文件拖拽到这里上传</p>
                                    </div>
                                </Upload>
                            </template>
                            <Button disabled v-else-if="item.m_status === 'RESOLVE' ">该任务已经完成</Button>
                        </template>
                    </p>

                    <br/>
                    <br/>
                </Col>
                <Col span="14">
                    <Collapse v-model="mailContent['content_' + item._id]" @click.native="showHtml(item._id)">
                        <Panel :name="'content_' + item._id">
                            邮件正文
                            <p slot="content">
                                <iframe :id="'mail_' + item._id" class="embed-responsive-item">
                                </iframe>
                            </p>
                        </Panel>
                        <Panel :name="'attach_' + item._id" v-if="item.m_attachments">
                            附件
                            <p class="list-group-item-text" slot="content" >
                                <a v-for="(attach, index) in item.m_attachments.split(',')" 
                                    class="list-group-item-text" :href="attach" target="_blank" v-bind:key="index">
                                    附件{{ index + 1}}
                                </a>
                            </p>
                        </Panel>
                    </Collapse>
                    <br/>
                </Col>
            </Row>
            <Row>
                <Steps :current="item.m_status === 'NEW' ? 0 :  
                    item.m_status === 'ACCEPT' ? 1 : 
                    item.m_status === 'RESOLVE' ? 2 : 
                    0">
                    <Step title="等待处理" content="等待策划接受任务"></Step>
                    <Step title="正在处理" content="策划正在处理中"></Step>
                    <Step title="完成！" content="完成啦"></Step>
                </Steps>
            </Row>
        </Card>
        <Button type="info" icon="ios-loop-strong" @click="query">刷新任务列表</Button>
    </Row>
    <div class="container" v-else>
        您尚未登录，请点击<a @click="gotoLogin">此处</a>登录
    </div>
</template>

<script>
import requester from "../utils/request";
import RESULT_CODE from "../../../../codemap.json";
import func from "../main";

export default {
    // props: ["userInfo"],
    data: () => {
        return { 
            planList: [],
            uploadData:{},
            UPLOAD_URL: requester.UPLOAD_URL,
            mailContent: {},
            loading: false
        };
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
        isAdmin() {
            let roleArr = this.$store.state.roleInfo;
            if (!Array.isArray(roleArr)) {
                roleArr = Object.values(roleArr);
            }
            let role = roleArr.find(item => {
                return item.module == "plan-order" && item.role_name === "admin";
            });
            return role;
        },
        noticeFlag() {
            return this.$store.state.noticeFlag;
        }
    },

    mounted: function() {
        if (this.token) {
            this.query();
        }
    },
    
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
        query: function() {
            this.loading = true;
            requester.send("/crm-inner/plan-order/list", { token: this.token },
                result => {
                    let arr = result.content.ret;
                    if (Array.isArray(arr)) {
                        this.planList = arr;
                        let newCount = 0;
                        this.planList.forEach(item => {
                            newCount += (item.m_status === "NEW" ? 1 : 0);
                        });
                        this.$store.dispatch({
                            type: "asyncUpdateBadge",
                            badgeInfo: {
                                "/plan": newCount
                            }
                        });
                    }
                }, (status, msg) => {
                    if (status === RESULT_CODE.LOGIN_EXPIRE) {
                        this.gotoLogin();
                    }
                });
        },

        showHtml: function(id) {
            let el_li = document.querySelector(`#mail_${id}`);
            let mailMsg = this.planList.find(item => item._id === id);
            if (el_li) {
                el_li.contentDocument.open();
                el_li.contentDocument.write(mailMsg.m_content);
                el_li.contentDocument.close();
            }
        },

        acceptPlan: function(plan_id) {
            let mailMsg = this.planList.find(item => item._id === plan_id);
            mailMsg.m_status = "ACCEPT";

            requester.send("/crm-inner/plan-order/accept", {
                plan_id: plan_id,
                token: this.token
            }, content => {
                func.showTips("alert-success", "接受任务成功！");
                // this.query();
            });
        },
        finishPlan: function(plan_id) {
            func.showDialog("confirm", "确认已经完成？", () => {
            let mailMsg = this.planList.find(item => item._id === plan_id);
            mailMsg.m_status = "RESOLVE";
            requester.send("/crm-inner/plan-order/finish", {
                plan_id: plan_id,
                token: this.token
            }, content => {
                func.showTips("alert-success", "已完成任务！");
                // this.query();
            });
        });
        },
        delPlan: function(plan_id) {
            func.showDialog("confirm", "确认删除该任务？", () => {
                let mailMsg = this.planList.find(item => item._id === plan_id);
                requester.send("/crm-inner/plan-order/manager", {
                    action: "delete",
                    plan_id: plan_id,
                    token: this.token
                }, content => {
                    func.showTips("alert-success", "已删除任务！");
                    this.planList.remove(mailMsg);
                    // this.query();
                });
            });
        },

        sortArray: function(type) {
            console.log(type);
            switch(type) {
                case "time":
                    this.planList.sort((a,b) => {
                        if( a._id > b._id) {
                            return 1;
                        } else if (a._id < b._id){
                            return -1;
                        } else {
                            return 0;
                        }
                    });
                    break;
                case "r_time":
                    this.planList.sort((a,b) => {
                        return parseInt(b._id) - parseInt(a._id);
                    });
                    break;
                case "status":
                    this.planList.sort((a) => {
                        if (a.m_status === 'NEW') {
                            return 1;
                        } else {
                            return -1;
                        }
                    });
                    break;
                case "r_status":
                    this.planList.sort((a) => {
                        if (a.m_status !== 'NEW') {
                            return 1;
                        } else {
                            return -1;
                        }
                    });
                    break;
                default:
                    break;                                        
            }
        },

        noticeFlagStatus: function(status) {
            if (status) {
                requester.send("/crm-inner/plan-order/notice-add", { token: this.token, mail: this.userInfo.mail },
                    result => {
                        func.showTips("alert-success", "已开启邮件通知！", "您将在有新任务时收到邮件通知！");
                        this.$store.dispatch({
                            type: "noticeFlag",
                            noticeFlag: true
                        });
                    }, (status, msg) => {
                        if (status === RESULT_CODE.LOGIN_EXPIRE) {
                            this.gotoLogin();
                        }
                    });
            } else {
                requester.send("/crm-inner/plan-order/notice-remove", { token: this.token, mail: this.userInfo.mail },
                    result => {
                        func.showTips("alert-success", "已关闭邮件通知！","您不会再收到任何邮件通知！");
                        this.$store.dispatch({
                            type: "noticeFlag",
                            noticeFlag: false
                        });
                    }, (status, msg) => {
                        if (status === RESULT_CODE.LOGIN_EXPIRE) {
                            this.gotoLogin();
                        }
                    });
            }
        },


        onUploadError(error, file, fileList) {
            console.log(JSON.stringify(error));
        },
        handleUploadSuccess(res, file, fileList) {
            console.log(JSON.stringify(res));
            console.log(JSON.stringify(file));
            if(res.status === 2000) {
                func.showTips("alert-success", "文件上传成功！！");
            } else {
                func.showTips("alert-danger", "文件上传失败！！");
            }
        }
    }

};
</script>

<style>
    .list-group-item-text {
        text-align: left;
        width:90%;
        overflow:hidden;
        white-space:nowrap;
        text-overflow:ellipsis;
        -o-text-overflow:ellipsis;
    }
    iframe {
        border: none;
    }
</style>


