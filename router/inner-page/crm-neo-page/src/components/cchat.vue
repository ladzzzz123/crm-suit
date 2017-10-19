<template>
    <Row style="background:#eee;padding:20px;position:fixed;right:0;bottom:0;">
        <Row>
            <Card style="width:100px" v-for="msg in msgs" v-bind:key="msg.msg">
                <div style="text-align:center">
                    {{ msg.u_name }}:{{ msg.msg }}
                </div>
            </Card>
        </Row>
        <Input v-model="curMsg">
            <Button slot="append" icon="ios-paperplane" @click="sendMsg">发送</Button>
        </Input>
    </Row>
</template>

<script>
// const io = require("socket.io-client/dist/socket.io.js");
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
            socket.emit("message", { msg: this.curMsg, u_name: this.userInfo.u_name });
        }
    }
}
</script>

<style>
</style>
