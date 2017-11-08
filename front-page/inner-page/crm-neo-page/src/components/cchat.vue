<template>
    <Row :class="(chatShowing ? 'chat-show' : 'chat-hide') + ' chat-container layer-middle' " :style="cstyle">
        <Col span="2" class="chat-close" @click.native="switchChat">
            <Icon type="arrow-right-b" size="large" v-if="chatShowing"></Icon>
            <Icon type="arrow-left-b" size="large" v-else></Icon>
        </Col>
        <Col span="22">
            <div class="chat-list">
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
            <div class="chat-input-area" v-show="chatShowing">
                <Input v-model="curMsg" class="chat-input">
                    <Button slot="append" icon="ios-paperplane" @click="sendMsg">发送</Button>
                </Input>
            </div>
        </Col>
    </Row>
</template>

<script>
import func from "../main";
let socket = {};

export default {
    props:["cstyle"],
    data: function() {
        return {
            msgs: [],
            curMsg: "",
            chatShowing: false,
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
        socket = io.connect("/crm-chat");
        socket.on("message", msg => {
            this.msgs.push(msg);
        });
        this.chatShowing = true;
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
        switchChat: function() {
            this.chatShowing = !this.chatShowing;
        }
    }
}
</script>

<style>
    .chat-container {
        background:#eee;
        position: fixed;
        right:0;
        bottom:0;
        min-width:2.4rem;
        height:100%;
    }
    .chat-list {
        height: 80%;
        overflow-y: auto;
    }
    .chat-msg {
        max-width: 2.8rem;
        word-break:break-all;
    }
    .chat-input-area {
        background: grey;
        height: .5rem;
        padding: .1rem;
        position: fixed;
        width: 2.2rem;
        bottom: 0.02rem;
    }
    .chat-input {
        margin: 0 auto;
        width: 90%;
    }
    .chat-close {
        background: #ddd;
        height: 100%;
        padding:100% 0.05rem;
    }

    .chat-hide {
        right: -2.26rem;
    }
    .chat-show {
        right: 0;
    }
</style>
