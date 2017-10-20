<template>
    <Row class="chat-container layer-middle">
        <div class="chat-list">
            <Icon type="close" class="chat-close" @click.native="hideChat"></Icon>
            <Card style="max-width:3rem;background:none" v-for="msg in msgs" v-bind:key="msg.msg"
                :bordered="false" dis-hover>
                <Row v-if="msg.u_name === userInfo.u_name">
                    <Col span="18">
                        <Card class="chat-msg" shadow>
                            {{ msg.msg }}
                        </Card>
                    </Col>
                    <Col span="6" style="text-align:center">
                        <Avatar style="background:#7265e6" size="large">{{ msg.nick_name }}</Avatar>
                    </Col>
                </Row>
                <Row v-else>
                    <Col span="6" style="text-align:center">
                        <Avatar style="background:#f56a00" size="large">{{ msg.nick_name }}</Avatar>
                    </Col>
                    <Col span="18">
                        <Card class="chat-msg" shadow>
                            {{ msg.msg }}
                        </Card>
                    </Col>
                </Row>
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
                    nick_name: this.userInfo.nick_name || this.userInfo.u_name,
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
    .chat-container {
        background:#eee;
        padding:20px;
        position:absolute;
        right:0;
        bottom:0;
        min-width:2.4rem;
        height:5.25rem;
    }
    .chat-list {
        height: 4.5rem;
        overflow-y: scroll;
    }
    .chat-msg {
        max-width: 2.8rem;
        word-break:break-all;
    }
    .chat-input {
        left: 5%;
        position: absolute;
        top: 4.8rem;
        width: 90%;
    }
    .chat-close {
        left: 0.05rem;
        position: absolute;
        top: 0.05rem;
    }
</style>
