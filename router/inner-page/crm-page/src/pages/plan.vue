<template>
  <div class="container" v-if="logged">
        <ul class="list-group">
            <li v-for="item in list" class="list-group-item" :id="'msg_' + item._id" v-bind:key="'msg_' + item._id">
                <div class="row">
                    <div class="col-md-6">
                        <h4 class="list-group-item-heading" :title="item.title">{{ item.title }}</h4>
                        <p class="list-group-item-text">发起人: {{ item.m_from }}</p>
                        <p class="list-group-item-text" :title="item.m_cc">抄送: {{ item.m_cc }}</p>
                        <p class="list-group-item-text">发送日期: {{ new Date(item.m_date).toLocaleString() }}</p>
                        <p class="list-group-item-text">谁在处理: <span class="label label-success">{{ item.m_opter }}</span> </p>
                        <p class="list-group-item-text">最后编辑日期: {{ new Date(item.last_edit).toLocaleString() }}</p>
                        
                        <br/>
                        <br/>
                        
                        <button type="button" v-if="item.m_status === 'NEW'" class="btn btn-success" @click="acceptPlan(item._id)">接受</button>
                        <button type="button" class="btn btn-disable" v-else>已接受</button>
                        
                        <template v-if="item.m_opter === userInfo.u_name">
                            <template v-if="item.m_status === 'ACCEPT'">
                                <button type="button" class="btn btn-primary" @click="finishPlan(item._id)">我完成啦</button>
                                <form :id="'upload_' + item._id" enctype="multipart/form-data" onsubmit="return false">
                                    <input class="hidden" type="text" name="plan_id" :value="item._id" />
                                    <input class="hidden" type="text" name="token" :value="token" />
                                    <input class="btn btn-error" type="file" name="file" multiple required />
                                    <input class="btn btn-warning" type="submit" value="上传" @click="uploadReply(item._id)"/>
                                </form>
                            </template>
                            <button type="button" v-else-if="item.m_status === 'RESOLVE'" class="btn btn-disable">该任务已经完成</button>
                        </template>

                        <br/>
                        <br/>
                    </div>
                    <div class="col-md-5 btn-group-vertical">
                        <p class="list-group-item-text">邮件正文:
                            <button type="button" class="btn btn-info btn-xs" @click="showHtml(item._id)">获取</button>
                            <br/>
                            <iframe class="embed-responsive-item">
                            </iframe>
                        </p>
                        <template v-if="item.m_attachments">
                            <a v-for="(attach, index) in item.m_attachments.split(',')" 
                                class="list-group-item-text" :href="attach" target="_blank" v-bind:key="index">
                                附件{{ index + 1}}
                            </a>
                        </template>
                    </div>
                    
                    <div class="progress">
                        <div class="progress-bar progress-bar-warning" role="progressbar" 
                            v-if="item.m_status === 'NEW'"
                            aria-valuenow="20" aria-valuemin="0" 
                            aria-valuemax="100"
                            style="width: 20%;">
                            等待处理
                        </div>

                        <div class="progress-bar progress-bar-info" role="progressbar" 
                            v-else-if="item.m_status === 'ACCEPT'"
                            aria-valuenow="50" aria-valuemin="0" 
                            aria-valuemax="100"
                            style="width: 50%;">
                            正在处理
                        </div>                        

                        <div class="progress-bar progress-bar-success" role="progressbar" 
                            v-else-if="item.m_status === 'RESOLVE'"
                            aria-valuenow="100" aria-valuemin="0" 
                            aria-valuemax="100"
                            style="width: 100%;">
                            完成！
                        </div>

                        <div class="progress-bar" role="progressbar" 
                            v-else
                            aria-valuenow="0" aria-valuemin="0" 
                            aria-valuemax="100"
                            style="width: 0%;">
                            未知
                        </div>
                    </div>

                </div>
            </li>
        </ul>
        <button class="btn btn-info queryPlan" @click="query">查询当前任务</button>
    </div>
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
        return { list: [] };
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

    mounted: function() {
        if (this.token) {
            this.query();
        }
    },

    methods: {
        gotoLogin: function() {
            this.$router.push("/login");
        },
        query: function() {
            requester.send("/crm-inner/plan-order/list", { token: this.token },
                result => {
                    let arr = result.content.ret;
                    if (Array.isArray(arr)) {
                        this.list = arr;
                    }
                }, (status, msg) => {
                    if (status === RESULT_CODE.LOGIN_EXPIRE) {
                        this.$store.dispatch("asyncQuit");
                        this.gotoLogin();
                    }
                });
        },

        showHtml: function(id) {
            let el_li = document.querySelector(`#msg_${id}`);
            let mailMsg = this.list.find(item => item._id === id);
            el_li.querySelector("iframe").contentDocument.open();
            el_li.querySelector("iframe").contentDocument.write(mailMsg.m_content);
            el_li.querySelector("iframe").contentDocument.close();
        },

        acceptPlan: function(plan_id) {
            let mailMsg = this.list.find(item => item._id === plan_id);
            mailMsg.m_status = "ACCEPT";

            requester.send("/crm-inner/plan-order/accept", {
                plan_id: plan_id,
                token: this.token
            }, content => {
                func.showTips("alert-success", "接受任务成功！");
                this.query();
            });
        },
        finishPlan: function(plan_id) {
            let mailMsg = this.list.find(item => item._id === plan_id);
            mailMsg.m_status = "RESOLVE";

            requester.send("/crm-inner/plan-order/finish", {
                plan_id: plan_id,
                token: this.token
            }, content => {
                func.showTips("alert-success", "已完成任务！");
                this.query();
            });
        },
        uploadReply: function(plan_id) {
            let el_upload = document.querySelector(`#upload_${plan_id}`);
            if (!el_upload.checkValidity()) {
                func.showTips("alert-danger", "上传文件不能为空！");
                return;
            }
            requester.upload("/crm-inner/plan-order/upload", el_upload, content => {
                func.showTips("alert-success", "上传成功");
            });
        }
    }

};
</script>

<style>
    .list-group-item {
        width:90%;
        overflow:hidden;
        white-space:nowrap;
        text-overflow:ellipsis;
        -o-text-overflow:ellipsis;
    }
</style>


