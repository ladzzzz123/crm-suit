<template>
    <Row>
        <br/>
        <br/>
        <Input v-model="tag" style="width:2rem;margin: 0 auto" placeholder="请输入tag...">
            <Button slot="append" icon="ios-search" @click.native="fetchData"></Button>
        </Input>
        <br/>
        <br/>
        <Row style="padding: 0.2rem;">
            <Table :columns="leadsColumns" :data="leadsData" size="small" ref="table" width="90%"></Table>
            <br>
            <Button type="primary" size="large" @click="exportData">
                <Icon type="ios-download-outline"></Icon> 导出数据
            </Button>
        </Row>
    </Row>
</template>

<script>
import requester from "../utils/request";
import RESULT_CODE from "../../../../../router/codemap.json";
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
            tag: "",
            leadsColumns: [
                {
                    title: "手机号码",
                    key: "phone"
                },
                {
                    title: "Tag",
                    key: "tag"
                },
                {
                    title: "录入时间",
                    key: "occurrence"
                },
                {
                    title: "数据",
                    key: "data"
                },
                
            ],
            leadsData: []
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

    mounted: function() {
        if (this.logged) {
            requester.send("/crm-inner/leads-data", { token: this.token },
                result => {
                    if (result.status === RESULT_CODE.SUCCESS) {
                        this.verified = true;
                    }
                }, (status, msg) => {
                    processFailed(status);
                });
        }
    },

    methods: {
        gotoLogin: function() {
            this.$router.push("/login");
        },
        fetchData: function() {
            if (this.tag) {
                requester.send("/crm-inner/leads-data/opt", 
                    { 
                        token: this.token, 
                        tag: this.tag,
                        action: "query"
                    },
                    result => {
                        if (result.status === RESULT_CODE.SUCCESS) {
                            if (result.content) {
                                this.processArr(result.content);
                            } else {
                                func.showTips("alert-warning", "未检索到数据");
                            }
                        }
                    }, (status, msg) => {
                        processFailed(status);
                    });
            } else {
                func.showTips("alert-error", "tag不能为空");
            }
        },
        processArr: function(orgArr) {
            this.leadsData = orgArr.map(item => {
                item.occurrence = new Date(item.occurrence).toLocaleString();
                return item;
            });
        },
         exportData (type) {
            this.$refs.table.exportCsv({
                filename: `${this.tag}_${new Date().toLocaleDateString()}`
            });
        }
    }
}
</script>

<style>
</style>
