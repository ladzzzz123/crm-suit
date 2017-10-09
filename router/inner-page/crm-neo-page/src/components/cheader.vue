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
            <Col span="2" offset="18" v-if="logged" >
                <div class="navbar-brand">
                    <a class="navbar-default" href="javascript:void(0)" @click="quit()">
                        退出登陆
                    </a>
                </div>
            </Col>
        </Row>
    </nav>        
</template>

<script>
export default {
    props: ["logged"],
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
