<style>
    .container {
        position: relative;
    }
    .bg {
        height: 836px;
        width: 408px;
    }
    .content {
        font-size: 0;
        height: 640px;
        left: 50%;
        margin-left: -178px;
        position: absolute;
        text-align: left;
        top: 98px;
        width: 356px;
    }

    .tips {
        background: rgba(55, 55, 55, 0.6);
        border-radius: 2px;
        color: white;
        font-size: 0.10rem;
        left: -1.5%;
        padding: 0.02rem;
        position: absolute;
        width: 0.14rem;
        -webkit-transform: scale(0.6);
    }

    .img-container{
        position: absolute;
    }

    .openning-bg {
        bottom: 0;
        left: 0;
        position: absolute;
        width: 100%;
    }

    .openning-container {
        height: 540px;
        left: 0;
        position: absolute;
        top: 0;
        width: 100%;
    }
    .openning-img {
        height: 100%;
        left: 0;
        position: absolute;
        top: 0;
        width: 100%;
    }
    .openning-tips {
        bottom: 2%;
    }


    .calling-bg {
        bottom: 0;
        position: absolute;
        width: 100%;
    }

    .calling-container {
        position: absolute;
        width: 100%;
        bottom: 0;
        margin-bottom: 480px;
    }
    .calling-img {
        margin-top: 0.26rem;
        position: absolute;
        width: 100%;
    }
    .calling-tips {
        display: inline-block;
        position: absolute;
        top: 0;
    }
    .calling-close {
        display: inline-block;
        right: 0.05rem;
        position: absolute;
        top: 0;
        width: 0.12rem;
    }


    .hangup-container {
        height: 100%;
        left: 0;
        position: absolute;
        top: 0;
        width: 100%;
    }

    .hangup-img {
        height: 100%;
        left: 0;
        position: absolute;
        top: 0;
        width: 100%;
    }
    .hangup-mask {
        height: 100%;
        left: 0;
        position: absolute;
        top: 0;
        width: 100%;
    }
    .hangup-tips {
        top: 84%;
    }


    .banner-bg {
        height: 100%;
        left: 0;
        position: absolute;
        top: 0;
        width: 100%;
    }

    .banner-container{
        border-radius: 3px;
        left: 5%;
        position: absolute;
        top: 33%;
        width: 90%;
    }
    .banner-img {
        width: 100%;
    }
    .banner-tips {
        left: -2%;
        top: 50%;
        -webkit-transform: scale(.4);
    }



</style>
<template>
    <Row v-if="logged">
        <Card v-for="adInfo in adImgs" v-bind:key="adInfo.pos" class="container">
            <p slot="title">
                {{ adInfo.title }}
            </p>
            <Row>
                <img class="bg" src="img/preview-iphone.jpg" />
                <div class="content">
                    <img v-if="adInfo.bg" :class="adInfo.pos + '-bg' + ' layer-bottom' " :src="adInfo.bg"/>
                    <div :class="adInfo.pos + '-container img-container layer-middle' ">
                        <div :class="adInfo.pos + '-tips' + ' tips layer-top' ">广告</div>
                        <img v-if="adInfo.close" :class="adInfo.pos + '-close' + ' layer-middle' " :src="adInfo.close"/>
                        <img :class="adInfo.pos + '-img' + ' layer-middle' " :src="adInfo.img" />
                        <img v-if="adInfo.mask" :class="adInfo.pos + '-mask' + ' layer-middle' " :src="adInfo.mask"/>
                    </div>
                </div>
            </Row>
            <Upload
                :on-error="onUploadError"
                :on-success="handleUploadSuccess"
                :data="{ token: token, ad_pos: adInfo.pos }"
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
            adImgs: [
               { pos: "openning", title: "开屏",img: "", bg: "img/openning-bg.jpg" },
               { pos: "calling", title: "拨号前", img: "", bg: "img/calling-bg.jpg", close: "http://121.52.235.231:40718/upload_img/static/img/close.png" },
               { pos: "hangup", title: "挂机",img: "", mask:"img/preview-mask.png" },
               { pos: "banner", title: "Banner",img: "", bg: "img/banner-bg.jpg" }
            ],
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
        this.adImgs.forEach(item => {
            item.img = `/crm-inner/files/static/ad/${this.userInfo.u_name}_${item.pos}.jpg`;
        });
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
                this.adImgs.forEach(item => {
                    item.img = `/crm-inner/files/static/ad/${this.userInfo.u_name}_${item.pos}.jpg?v=${parseInt(Math.random() * 1000)}`;
                });
            } else {
                func.showTips("alert-danger", "文件上传失败！！");
            }
        }
    }

};
</script>
