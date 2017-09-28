<template>
    <nav class="navbar navbar-default" role="navigation">
        <div class="container-fluid">
            <div class="navbar-header">
                <a class="navbar-brand" href="http://www.cootek.com/index.html">
                    <img src="http://www.cootek.com/images/logo.png" height="100%">
                </a>
            </div>
            <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                <ul class="nav navbar-nav navbar-right">
                    <li v-if="logged" @click="quit()">
                        <a href="#">退出登陆</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav> 
</template>

<script>
export default {
    props: ["logged"],
}
</script>

<style>
</style>
