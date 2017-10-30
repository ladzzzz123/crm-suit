<style>
    .container {
        position: relative;
    }
    .bg {
        height: 836px;
        width: 408px;
    }
    .content {
        height: 640px;
        left: 50%;
        margin-left: -180px;
        position: absolute;
        top: 98px;
        width: 360px;
    }
</style>
<template>
    <Row v-if="logged">
        <Card v-for="adPos in Object.keys(adImgs)" v-bind:key="adPos" class="container">
            <Row>
                <img class="bg" src="img/preview-iphone.jpg">
                <div class="content">
                    <img :src=" '/crm-inner/static/ad/' + userInfo.u_name + '_' + adPos + '.jpg' " height="100%" />
                    <img src="img/preview-mask.png" height="100%"/>
                </div>
            </Row>
            <Upload
                :on-error="onUploadError"
                :on-success="handleUploadSuccess"
                :data="{ token: token, ad_pos: adPos}"
                :action="UPLOAD_URL"
                type="drag">
                <div style="padding: 20px 0">
                    <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
                    <p>点击或将文件拖拽到这里上传</p>
                </div>
            </Upload>
        </Card>
    </Row>
    <div class="container" v-else>
        您尚未登录，请点击<a @click="gotoLogin">此处</a>登录
    </div>
</template>

<script>
import requester from "../utils/request";
import RESULT_CODE from "../../../../codemap.json";
import func from "../main";

export default {
    // props: ["userInfo"],
    data: () => {
        return { 
            adImgs: {
               openning:"",
               dial: "",
               hangup:"",
               banner:""
            },
            uploadData:{},
            UPLOAD_URL: "/crm-inner/ad-preview/upload",
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

    },
    
    updated: function() {
         this.$nextTick(function () {
             setTimeout(() => {
                 this.loading = false;
             }, 2000);
        });
    },

    methods: {
        gotoLogin: function() {
            this.$router.push("/login");
        },
        onUploadError(error, file, fileList) {
            console.log(JSON.stringify(error));
        },
        handleUploadSuccess(res, file, fileList) {
            console.log(JSON.stringify(res));
            console.log(JSON.stringify(file));
            if(res.status === 2000) {
                func.showTips("alert-success", "文件上传成功！！");
            } else {
                func.showTips("alert-danger", "文件上传失败！！");
            }
        }
    }

};
</script>
