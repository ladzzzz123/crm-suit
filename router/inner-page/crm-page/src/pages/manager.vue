
<template>
  <div class="container" v-if="logged">
        <div class="row">
            <div class="col-lg-6">
                <div class="page-header">
                    <h1>
                        {{ userInfo.u_name }} 
                        <small>,您好</small>
                        <br/>
                        <small>您的个人信息如下：</small>
                    </h1>
                </div>
                <form class="info-form" onsubmit="return false">
                    <div class="input-group">
                        <span class="input-group-addon" id="basic-addon1">昵称</span>
                        <input type="text" class="form-control" 
                        v-model="userInfo.nick_name"
                        :placeholder="userInfo.nick_name || '以前还叫人家小甜甜' "
                        aria-describedby="basic-addon1"
                        required
                        readonly>
                            <span class="input-group-btn">
                                <button class="btn btn-default"
                                    type="button" @click="unlock">修改</button>
                            </span>
                        </input> 
                    </div>
                    <br/>
                    <div class="input-group">
                        <span class="input-group-addon" id="basic-addon1">性别</span>
                        <input type="text" class="form-control" 
                        v-model="userInfo.sex"
                        :placeholder="userInfo.sex || '安能辨我是雌雄' "
                        aria-describedby="basic-addon1"
                        required
                        readonly>
                            <span class="input-group-btn">
                                <button class="btn btn-default"
                                    type="button" @click="unlock">修改</button>
                            </span>
                        </input> 
                    </div>
                    <br/>
                    <div class="input-group">
                        <span class="input-group-addon" id="basic-addon1">联系电话</span>
                        <input type="text" class="form-control" 
                        v-model="userInfo.phone"
                        :placeholder="userInfo.phone || '尚不明确' "
                        aria-describedby="basic-addon1"
                        required
                        readonly>
                            <span class="input-group-btn">
                                <button class="btn btn-default"
                                    type="button" @click="unlock">修改</button>
                            </span>
                        </input>                     
                    </div>
                    <br/>
                    <div class="input-group">
                        <span class="input-group-addon" id="basic-addon1">邮件地址</span>
                        <input type="text" class="form-control" 
                        :value="userInfo.mail || userInfo.u_name || '404没找到' "
                        aria-describedby="basic-addon1"
                        disabled>
                        </input>
                    </div>
                    <br/>
                    <div class="input-group">
                        <span class="input-group-addon" id="basic-addon1">当前状态</span>
                        <input type="text" class="form-control" 
                        :placeholder="userInfo.u_status || '另一位面' "
                        aria-describedby="basic-addon1"
                        disabled>
                        </input>                     
                    </div>
                    <br/>
                    <button v-if="infoChanged" class="btn btn-info" type="submit" @click="submit">提交</button>
                    <button v-else class="btn btn-disable" type="submit">提交</button>
                </form>
                <div class="page-header">
                    <h1>修改密码</h1>
                </div>
                <form class="passwd-form" onsubmit="return false">
                    <div class="input-group">
                        <span class="input-group-addon" id="basic-addon1">原密码</span>
                        <input type="password" class="form-control" 
                        v-model="passwdInfo.old_passwd" aria-describedby="basic-addon1"
                        required  v-if="passwdChanged" >
                        <input type="password" class="form-control" 
                        v-model="passwdInfo.old_passwd" aria-describedby="basic-addon1"
                        required readonly v-else>
                            <span class="input-group-btn">
                                <button class="btn btn-default"
                                    type="button" @click="unlockPasswd">修改</button>
                            </span>
                        </input> 
                    </div>
                    <br/>
                    <div class="input-group">
                        <span class="input-group-addon" id="basic-addon1">新密码</span>
                        <input type="password" class="form-control" 
                        v-model="passwdInfo.passwd" aria-describedby="basic-addon1"
                        required v-if="passwdChanged"/>
                        <input type="password" class="form-control" 
                        v-model="passwdInfo.passwd" aria-describedby="basic-addon1"
                        required readonly v-else/>
                    </div>
                    <br/>
                    <button v-if="passwdChanged" class="btn btn-info" type="submit" @click="submitPasswd">提交</button>
                    <button v-else class="btn btn-disable" type="">提交</button>
                </form>
            </div>
        </div>
    </div>
    <div class="container" v-else>
        您尚未登录，请点击<a @click="gotoLogin">此处</a>登录
    </div>
</template>

<script>
import requester from "../utils/request";
import main from "../main";
import encode from "../utils/encode";

export default {
    // props: ["userInfo"],
    data: () => {
        return {
            infoChanged: false,
            passwdInfo: {},
            passwdChanged: false
        };
    },
    computed: {
        userInfo() {
            return this.$store.state.userInfo;
        },
        logged() {
            return this.$store.state.logged;
        },
        token() {
            return this.$store.state.userInfo.token;
        },
    },

    mounted: function() {
        this.el_form = document.querySelector(".info-form");
        this.passwd_form = document.querySelector(".passwd-form");
    },

    methods: {
        gotoLogin: function() {
            this.$router.push("/login");
        },

        unlock: function(e) {
            let el = e.target.parentNode.parentNode.querySelector("input");
            el.readOnly = false;
            this.infoChanged = true;
        },
        unlockPasswd: function() {
            this.passwdChanged = true;
        },
        submit: function() {
            if (!this.el_form.checkValidity()) {
                return false;
            }
            let params = {
                info: {
                    nick_name: this.userInfo.nick_name,
                    sex: this.userInfo.sex,
                    phone: this.userInfo.phone,
                },
                token: this.token
            };
            requester.send("/crm-inner/account/edit/", params, (ret) => {
                this.$store.dispatch({
                    type: "asyncUpdateUserInfo",
                    userInfo: this.userInfo
                });
                alert("更新成功！！");
                this.$router.push("/manager");
            });
            return false;
        },

        submitPasswd: function() {
            if (!this.passwd_form.checkValidity()) {
                return false;
            }
            let params = {
                info: {
                    old_passwd: encode.hex_md5(this.passwdInfo.old_passwd),
                    passwd: encode.hex_md5(this.passwdInfo.passwd),
                },
                token: this.token
            };
            requester.send("/crm-inner/account/edit/", params, (ret) => {
                alert("更新成功！！");
                main.goToLogin();
            });
            return false;
        }
    }
};
</script>

<style>

</style>


