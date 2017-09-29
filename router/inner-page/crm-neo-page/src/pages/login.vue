<template>
    <Row type="flex" justify="center">
        <Form ref="formData" :model="formData" :rules="ruleData" span="6">
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
                                let remoteRole = userInfo.roleInfo;
                                if(!Array.is(remoteRole)) {
                                    remoteRole = [];
                                }
                            }
                            routerInfos.forEach(item => {
                                let exist = remoteRole.find(info => {
                                    return item.path.indexOf(info.module) > -1;
                                });
                                if (exist || item.based) {
                                    neoRouterInfos.push(item);
                                }
                            });
                            
                            this.$store.dispatch({
                                    type: "asyncUpdateRouterInfo",
                                    routerInfos: neoRouterInfos
                                });
                            this.$router.push("/manager");
                        });
                    } else {
                        this.$Message.error("输入信息有误!!");
                    }
                })
            
        }
    }

};
</script>

<style>

</style>

