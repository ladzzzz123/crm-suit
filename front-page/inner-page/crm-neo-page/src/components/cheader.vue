<style>
    .navbar-default {
        background-color: #f8f8f8;
        border-color: #e7e7e7;
        color: #777;
        font-size: 0.1rem;
    }
    .navbar {
        position: fixed;
        margin-bottom: 0.2rem;
        border: 1px solid transparent;
        white-space: nowrap;
        width: 100%;
    }
    .navbar-brand {
        height: 0.5rem;
        padding: 0.15rem 0.15rem;
        line-height: 0.2rem;
    }
    .navbar-brand-left {
        float: left;
    }
    .navbar-brand-right {
        float: right;
    }
    .navbar-subtitle {
        display: inline-block;
        font-size: 0.12rem;
        height: 0.5rem;
        padding: 0.15rem;
        padding-left: 0;
        line-height: 0.2rem;
        /* -webkit-transform: scale(0.8); */
    }
</style>

<template>
    <nav role="navigation" class="navbar navbar-default layer-top" :style="'height:' + height">    
        <Row>
            <Col span="12">
                <a class="navbar-brand navbar-brand-left" href="http://www.cootek.com/index.html">
                    <img src="http://www.chubao.cn/logo_en.png" height="70%">
                </a>
                <p class="navbar-subtitle">Commercial Operation System</p>
            </Col>
            <Col span="4" offset="4">
                <a class="navbar-brand navbar-brand-right" @click="gotoChangeLog">
                    更新日志
                </a>
            </Col>
            <Col span="4" v-if="logged" style="text-align:right" >
                <div class="navbar-brand navbar-brand-right">
                    <Dropdown>
                        <a href="javascript:void(0)">
                            {{ userInfo.u_name }}
                            <Icon type="arrow-down-b"></Icon>
                        </a>
                        <DropdownMenu slot="list">
                            <DropdownItem @click.native="showProfile">
                                <span style="margin-left:0.02rem">个人信息</span>
                                <Icon type="person"></Icon>
                            </DropdownItem>
                            <DropdownItem @click.native="showChat">
                                <span style="margin-left:0.02rem">聊天室(测试)</span>
                                <Icon type="chatbox"></Icon>
                            </DropdownItem>
                            <DropdownItem @click.native="quit">
                                <span style="margin-left:0.02rem">清除缓存</span>
                                <Icon type="ios-trash-outline"></Icon>
                            </DropdownItem>
                            <DropdownItem @click.native="quit" divided>
                                <span style="margin-left:0.02rem">退出登陆</span>
                                <Icon type="android-exit"></Icon>
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </div>
            </Col>
        </Row>
    </nav>        
</template>

<script>
export default {
    props: ["logged", "height"],
    computed: {
        userInfo() {
            return this.$store.state.userInfo;
        },
    },
    methods: {
        quit: function() {
            this.$store.dispatch("asyncQuit");
            this.$emit("hideChat");
            setTimeout(() => {
                // this.$router.push("/login");
                window.location.href = "/crm-inner";
            }, 500);
        },
        gotoChangeLog: function() {
            this.$router.push("/changelog");
        },
        showChat: function() {
            this.$emit("showChat");
        },
        showProfile: function() {
            this.$router.push("/profile");
        }
    },
}
</script>
