
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
                    </p>
                </Panel>

                <Panel name="passwdInfo">修改密码
                    <p slot="content">
                        <Row>
                            <Col span="16">
                                <Form ref="passwdInfo" :model="passwdInfo" :rules="rulePasswd" :label-width="80">
                                    <FormItem label="原密码" prop="old_passwd">
                                        <Input type="password" v-model="passwdInfo.old_passwd"></Input>
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
    data: function() {
        const validateOldPass = (rule, value, callback) => {
            console.log("value:%s", value);
            if (!value) {
                callback(new Error("请输入密码"));
            } else {
                callback();
            }
        };
        const validatePass = (rule, value, callback) => {
            console.log("value:%s", value);
            if (!value) {
                callback(new Error("请输入密码"));
            } else {
                if (this.passwdInfo.passwdCheck && this.passwdInfo.passwdCheck !== "") {
                    this.$refs.passwdInfo.validateField("passwdCheck");
                }
                callback();
            }
        };
        const validatePassCheck = (rule, value, callback) => {
            if (!value) {
                callback(new Error("请再次输入密码"));
            } else if (value !== this.passwdInfo.passwd) {
                callback(new Error("两次输入密码不一致!"));
            } else {
                callback();
            }
        };
        return {
            defaultPanel: "userInfo",
            infoChanged: false,
            ruleUserInfo: {
                nick_name: { required: false, message: "姓名不能为空", trigger: "blur" },
                mail: { required: true, message: "邮箱不能为空", trigger: "blur" },
                phone: { required: false, message: "联系电话不能为空", trigger: "blur" },
            },
            rulePasswd: {
                old_passwd: [
                    { validator: validateOldPass, trigger: "blur" }
                ],
                passwd: [
                    { validator: validatePass, trigger: "blur" }
                ],
                passwdCheck: [
                    { validator: validatePassCheck, trigger: "blur" }
                ],
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


