
<template>
    <Row type="flex" justify="center" v-if="logged">
        <Col span="20"> 
            <Collapse v-model="defaultPanel">
                <Panel name="userInfo">
                    您好，{{ userInfo.u_name }}， 您的个人信息如下：
                    <p slot="content">
                        <Row>
                            <Col span="16">
                                <Form ref="userInfo" :model="userInfo" :rules="ruleUserInfo" :label-width="80">
                                    <FormItem label="姓名" prop="nick_name">
                                        <Input v-model="userInfo.nick_name" :placeholder="userInfo.nick_name || '以前还叫人家小甜甜' "></Input>
                                    </FormItem>
                                    <FormItem label="邮箱" prop="mail">
                                        <Input v-model="userInfo.mail" :placeholder="请输入邮箱"></Input>
                                    </FormItem>
                                    <FormItem label="性别" prop="sex">
                                        <RadioGroup v-model="userInfo.sex">
                                            <Radio label="male">男</Radio>
                                            <Radio label="female">女</Radio>
                                        </RadioGroup>
                                    </FormItem>
                                    <FormItem label="联系电话" prop="phone">
                                        <Input v-model="userInfo.phone" :placeholder="userInfo.phone || '尚不明确' "></Input>
                                    </FormItem>
                                    <FormItem>
                                        <Button type="primary" @click="submit('userInfo')">提交</Button>
                                    </FormItem>
                                </Form>
                            </Col>
                        </Row>    







                        <!-- <form class="info-form" onsubmit="return false">
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
                        </form> -->
                    </p>
                </Panel>

                <Panel name="passwdInfo">修改密码
                    <p slot="content">
                        <Row>
                            <Col span="16">
                                <Form ref="passwdInfo" :model="passwdInfo" :rules="rulePasswd" :label-width="80">
                                    <FormItem label="原密码" prop="old_passwd">
                                        <Input type="password" v-model="passwdInfo.passwd"></Input>
                                    </FormItem>
                                    <FormItem label="新密码" prop="passwd">
                                        <Input type="password" v-model="passwdInfo.passwd"></Input>
                                    </FormItem>
                                    <FormItem label="确认新密码" prop="passwdCheck">
                                        <Input type="password" v-model="passwdInfo.passwdCheck"></Input>
                                    </FormItem>
                                    <FormItem>
                                        <Button type="primary" @click="submitPasswd('passwdInfo')">提交</Button>
                                        <Button type="ghost" @click="resetInput('passwdInfo')" style="margin-left: 8px">重置</Button>
                                    </FormItem>
                                </Form>
                            </Col>
                        </Row>    
                    </p>
                </Panel>
            </Collapse>
        </Col>

                <!-- <div class="page-header">
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
                </form> -->
    </Row>
    <Row type="flex" justify="center" v-else>
        您尚未登录，请点击<a @click="gotoLogin">此处</a>登录
    </Row>
</template>

<script>
import requester from "../utils/request";
import func from "../main";
import encode from "../utils/encode";

export default {
    // props: ["userInfo"],
    data: () => {
        return {
            defaultPanel: "userInfo",
            infoChanged: false,
            ruleUserInfo: {
                u_name: { required: true, message: "姓名不能为空", trigger: "blur" },
                mail: { required: true, message: "邮箱不能为空", trigger: "blur" },
                phone: { required: true, message: "联系电话不能为空", trigger: "blur" },
            },
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
        submit: function(name) {
            this.$refs[name].validate((valid) => {
                    if (valid) {
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
                            func.showTips("alert-success", "更新成功！！");
                            this.$router.push("/manager");
                        });
                    } else {
                        this.$Message.error("请确认信息填写是否正确！");
                    }
            });
        },

        submitPasswd: function(name) {
            this.$refs[name].validate((valid) => {
                    if (valid) {
                        let params = {
                            info: {
                                old_passwd: encode.hex_md5(this.passwdInfo.old_passwd),
                                passwd: encode.hex_md5(this.passwdInfo.passwd),
                            },
                            token: this.token
                        };
                        requester.send("/crm-inner/account/edit/", params, (ret) => {
                            func.showTips("alert-success", "更新成功！！");
                            setTimeout(() => {
                                func.goToLogin();
                            }, 3 * 1000);
                        });
                    } else {
                        this.$Message.error("请确认密码填写是否正确！ ");
                    }
            });
        },
        resetInput: function(name) {
            this.$refs[name].resetFields();
        }
    }
};
</script>

<style>

</style>


