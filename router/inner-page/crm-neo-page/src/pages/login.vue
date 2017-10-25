<style scoped>
    .login {
        height: 100%;
        left: 0;
        position: fixed;
        top: 0;
        width: 100%;
    }

    .bg {
        background: url(/img/bg.jpg) no-repeat center center;
        background-size: 100% 100%;
    }

    .input-area {
        box-sizing: border-box;
        background: #f8f8f8;
        position: absolute;
        right: 20%;
        top: 45%;
    }
</style>

<template>
    <Row class="login bg">
        <Card type="flex" justify="center" class="input-area">
            <Form ref="formData" :model="formData" :rules="ruleData">
                <FormItem prop="u_name">
                    <Input type="text" v-model="formData.u_name" placeholder="用户名(邮箱)">
                        <Icon type="ios-person-outline" slot="prepend"></Icon>
                    </Input>
                </FormItem>
                <FormItem prop="passwd">
                    <Input type="password" v-model="formData.passwd" placeholder="密码">
                        <Icon type="ios-locked-outline" slot="prepend"></Icon>
                    </Input>
                </FormItem>
                <FormItem>
                    <Button type="primary" @click="login('formData')">登录</Button>
                </FormItem>
            </Form>
        </Card>
    </Row>
</template>

<script>
import encode from "../utils/encode";
import requester from "../utils/request";
import routerInfos from "../router";

export default {
    data: () => {
        return {
            formData: {
                u_name: "",
                passwd: ""
            },
            ruleData: {
                u_name: [
                    { required: true, message: "请填写用户名", trigger: "blur" }
                ],
                passwd: [
                    { required: true, message: "请填写密码", trigger: "blur" },
                    { type: "string", min: 6, message: "密码长度不能小于6位", trigger: "blur" }
                ]
            },
        };
    },
    mounted: function() {

    },

    methods: {
        login: function(name) {
             this.$refs[name].validate((valid) => {
                    if (valid) {
                        let params = {
                            u_name: this.formData.u_name,
                            passwd: encode.hex_md5(this.formData.passwd)
                        };
                        requester.send("/crm-inner/account/login/", params, (ret) => {
                            let userInfo = ret;
                            this.$store.dispatch({
                                type: "asyncUpdateUserInfo",
                                userInfo: userInfo
                            });
                            let neoRouterInfos = [];
                            let remoteRole = [];
                            if (userInfo.roleInfo) {
                                remoteRole = userInfo.roleInfo;
                                if(!Array.isArray(remoteRole)) {
                                    remoteRole = [];
                                }
                                this.$store.dispatch({
                                    type: "asyncUpdateRoleInfo",
                                    roleInfo: userInfo.roleInfo
                                });
                            }
                            routerInfos.forEach(item => {
                                let exist = remoteRole.find(info => {
                                    return item.path.indexOf(info.module) > -1;
                                });
                                if (exist || item.based) {
                                    if (!neoRouterInfos.find(neoItem => {
                                        return neoItem.path === item.path;
                                    })) {
                                        neoRouterInfos.push(item);
                                    }
                                }
                            });
                            
                            
                            this.$store.dispatch({
                                    type: "asyncUpdateRouterInfo",
                                    routerInfos: neoRouterInfos
                                });
                            this.$router.push("/enterance");
                        });
                    } else {
                        this.$Message.error("输入信息有误!!");
                    }
                })
            
        }
    }

};
</script>

