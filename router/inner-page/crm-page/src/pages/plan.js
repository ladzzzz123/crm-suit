import Vue from "vue";
import requester from "../utils/request";
import RESULT_CODE from "../../../../codemap.json";

export default Vue.component("plan", {
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

    template: `
    <div class="container" v-if="logged">
        <ul class="list-group">
            <li v-for="item in list" class="list-group-item" :id="'msg_' + item._id">
                <div class="row">
                    <div class="col-md-6">
                        <h4 class="list-group-item-heading">{{ item.title }}</h4>
                        <p class="list-group-item-text">发起人: {{ item.m_from }}</p>
                        <p class="list-group-item-text">抄送: {{ item.m_cc }}</p>
                        <p class="list-group-item-text">发送日期: {{ new Date(item.m_date).toLocaleString() }}</p>
                        <p class="list-group-item-text">当前操作者: {{ item.m_opter }}</p>
                        <p class="list-group-item-text">最后编辑日期: {{ new Date(item.last_edit).toLocaleString() }}</p>
                        
                        <br/>
                        <br/>
                        
                        <button type="button" v-if="item.m_status === 'NEW'" class="btn btn-success" @click="acceptPlan(item._id)">接受</button>
                        <button type="button" class="btn btn-disable" v-else>已接受</button>
                        
                        <template v-if="item.m_opter === userInfo.user_name">
                            <template v-if="item.m_status === 'ACCEPT'">
                                <button type="button" class="btn btn-primary" @click="finishPlan(item._id)">我完成啦</button>
                                <form :id="'upload_' + item._id" enctype="multipart/form-data" onsubmit="return false">
                                    <input class="hidden" type="text" name="plan_id" :value="item._id" />
                                    <input class="hidden" type="text" name="token" :value="token" />
                                    <input class="btn btn-error" type="file" name="file" multiple required />
                                    <input class="btn btn-warning" type="submit" value="Upload" @click="uploadReply(item._id)"/>
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
                        <a v-for="(attach, index) in item.m_attachments.split(',')" class="list-group-item-text" :href="attach">附件{{ index + 1}}</a>
                    </div>
                </div>
            </li>
        </ul>
        <div class="queryPlan" @click="query">查询当前任务</div>
    </div>
    <div class="container" v-else>
        您尚未登录，请点击<a @click="gotoLogin">此处</a>登录
    </div>
    `,
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
                alert("接受任务成功！");
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
                alert("已完成任务！");
                this.query();
            });
        },
        uploadReply: function(plan_id) {
            let el_upload = document.querySelector(`#upload_${plan_id}`);
            if (!el_upload.checkValidity()) {
                alert("上传文件不能为空！");
                return;
            }
            requester.upload("/crm-inner/plan-order/upload", el_upload, content => {
                alert("上传成功");
            });
            // action="/crm-inner/plan-order/upload" method="post" 
        }
    }

});