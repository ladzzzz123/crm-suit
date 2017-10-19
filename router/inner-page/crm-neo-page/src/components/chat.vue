<template>
    <Row style="background:#eee;padding:20px;z-index:999;position:fixed;right:0;">
        <Row>
            <Card style="width:100px" v-for="msg in msgs" v-bind:key="msg.msg">
                <div style="text-align:center">
                    {{ msg.u_name }}:{{ msg.msg }}
                </div>
            </Card>
        </Row>
        <Input v-model="curMsg">
            <Button slot="send" icon="ios-paperplane" @click="sendMsg">发送</Button>
        </Input>
    </Row>
</template>

<script>
const io = require("socket.io");
const socket = io.connect("http://121.52.235.231:40718/crm-inner/");
export default {
    data: function() {
        return {
            msgs: msgs,
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
        // socket.emit('login', {userid:this.userid, username:this.username});
        // socket.emit("message", {});
        socket.on("message", msg => {
            this.msgs.push(msg);
        });
    },
    methods: {
        sendMsg: function() {
            socket.emit("message", {msg: curMsg, u_name: this.userInfo.u_name});
        }
    }
}
</script>

<style>

</style>
