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
        float: left;
        height: 0.5rem;
        padding: 0.15rem 0.15rem;
        line-height: 0.2rem;
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
                <a class="navbar-brand" href="http://www.cootek.com/index.html">
                    <img src="http://www.cootek.com/images/logo.png" height="100%">
                </a>
                <p class="navbar-subtitle">Commercial Operation System</p>
            </Col>
            <Col span="4" offset="8" v-if="logged" style="text-align:right" >
                <div class="navbar-brand">
                    <Dropdown>
                        <a href="javascript:void(0)">
                            {{ userInfo.u_name }}
                            <Icon type="arrow-down-b"></Icon>
                        </a>
                        <DropdownMenu slot="list">
                            <DropdownItem @click.native="showChat">
                                <Icon type="chatbox"></Icon>
                                <span style="margin-left:0.02rem">聊天室(测试)</span>
                            </DropdownItem>
                            <DropdownItem @click.native="quit">
                                <Icon type="ios-trash-outline"></Icon>
                                <span style="margin-left:0.02rem">清除缓存</span>
                            </DropdownItem>
                            <DropdownItem @click.native="quit" divided>
                                <Icon type="android-exit"></Icon>
                                <span style="margin-left:0.02rem">退出登陆</span>
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
                this.$router.push("/login");
            }, 500);
        },
        showChat: function() {
            this.$emit("showChat");
        }
    },
}
</script>
