<template>
    <Row style="background:#eee;padding:20px;z-index:999;position:fixed;right:0;bottom:0;max-width:20%;max-height:90%">
        <div class="chat-list">
            <Card style="min-width:0.3rem;" v-for="msg in msgs" v-bind:key="msg.msg">
                <div style="text-align:right" v-if="msg.u_name === userInfo.u_name">
                    {{ msg.msg }}
                    <Avatar style="background:#f56a00" size="large">{{ msg.u_name }}</Avatar>
                </div>
                <div style="text-align:left" v-else>
                    <Avatar style="background:#7265e6" size="large">{{ msg.u_name }}</Avatar>
                    {{ msg.msg }}
                </div>
            </Card>
        </div>
        <Input v-model="curMsg">
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
                socket.emit("message", { msg: this.curMsg, u_name: this.userInfo.u_name });
                this.curMsg = "";
            } else {
                func.showTips("alert-danger", "发送内容不能为空！");
            }
            
        }
    }
}
</script>

<style>
    .chat-list {
        max-width: 8rem;
        overflow: scroll;
    }
</style>
