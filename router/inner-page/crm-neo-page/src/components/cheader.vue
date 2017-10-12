<style>
    .navbar-default {
        background-color: #f8f8f8;
        border-color: #e7e7e7;
        color: #777;
        font-size: 0.1rem;
    }
    .navbar {
        position: relative;
        min-height: 50px;
        margin-bottom: 20px;
        border: 1px solid transparent;
    }
    .navbar-brand {
        float: left;
        height: 50px;
        padding: 15px 15px;
        line-height: 20px;
    }
</style>

<template>
    <nav role="navigation" class="navbar navbar-default">    
        <Row>
            <Col span="4">
                <a class="navbar-brand" href="http://www.cootek.com/index.html">
                    <img src="http://www.cootek.com/images/logo.png" height="100%">
                </a>
            </Col>
            <Col span="4" offset="16" v-if="logged" style="text-align:right" >
                <div class="navbar-brand">
                    <Dropdown>
                        <a href="javascript:void(0)">
                            {{ userInfo.u_name }}
                            <Icon type="arrow-down-b"></Icon>
                        </a>
                        <DropdownMenu slot="list">
                            <DropdownItem @click.native="quit">退出登陆</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </div>
            </Col>
        </Row>
    </nav>        
</template>

<script>
export default {
    props: ["logged"],
    computed: {
        userInfo() {
            return this.$store.state.userInfo;
        },
    },
    methods: {
        quit: function() {
            this.$store.dispatch("asyncQuit");
            setTimeout(() => {
                this.$router.push("/login");
            }, 500);
        }
    },
}
</script>
