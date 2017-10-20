<template>
    <Row style="background:#eee;padding:20px;z-index:999;position:fixed;right:0;
        bottom:0;min-width:2rem;height:95%">
        <div class="chat-list">
            <Icon type="close" class="chat-close" @click="hideChat"></Icon>
            <Card style="max-width:80%;" v-for="msg in msgs" v-bind:key="msg.msg"
                :bordered="false" dis-hover>
                <div style="text-align:right" v-if="msg.u_name === userInfo.u_name">
                    <Card>
                        {{ msg.msg }}
                    </Card>
                    <Avatar style="background:#f56a00" size="large">{{ msg.u_name }}</Avatar>
                </div>
                <div style="text-align:left" v-else>
                    <Avatar style="background:#7265e6" size="large">{{ msg.u_name }}</Avatar>
                    <Card>
                        {{ msg.msg }}
                    </Card>
                </div>
            </Card>
        </div>
        <Input v-model="curMsg" class="chat-input">
            <Button slot="append" icon="ios-paperplane" @click="sendMsg">发送</Button>
        </Input>
    </Row>
</template>

<script>
import func from "../main";
let socket = {};

export default {
    data: function() {
        return {
            msgs: [],
            curMsg: ""
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
    },
    
    mounted: function() {
        socket = io.connect();
        socket.on("message", msg => {
            this.msgs.push(msg);
        });
    },

    methods: {
        sendMsg: function() {
            if(this.curMsg) {
                socket.emit("message", { 
                    msg: this.curMsg, 
                    u_name: this.userInfo.u_name, 
                    token: this.token 
                });
                this.curMsg = "";
            } else {
                func.showTips("alert-danger", "发送内容不能为空！");
            }
        },
        hideChat:function() {
            this.$emit("hideChat");
        }
    }
}
</script>

<style>
    .chat-list {
        overflow-y: scroll;
    }
    .chat-input {
        position: absolute;
        top: 94%;
    }
    .chat-close {
        left: 0.05rem;
        position: absolute;
        top: 0.05rem;
    }
</style>
