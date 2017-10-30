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
        margin-left: -178px;
        position: absolute;
        text-align: left;
        top: 98px;
        width: 356px;
    }

    .tips {
        background: rgba(55, 55, 55, 0.6);
        border-radius: 3px;
        color: white;
        font-size: 0.08rem;
        height: 0.26rem;
        left: 0;
        padding: 0.02rem;
        position: absolute;
        width: 0.14rem;
        -webkit-transform: scale(0.96);
    }

    .openning-img {
        height: 540px;
        left: 0;
        position: absolute;
        top: 0;
        width: 100%;
    }

    .openning-bg {
        bottom: 0;
        left: 0;
        position: absolute;
        width: 100%;
    }

    .openning-tips {
        left: 0;
        top: 75%;
    }

    .calling-img {
        bottom: 37%;
        position: absolute;
        width: 100%;
    }
    .calling-bg {
        bottom: 0;
        position: absolute;
        width: 100%;
    }
    .calling-tips {
        left: 0;
        top: 38%;
        -webkit-transform: scale(0.6);
    }
    .calling-close {
        right: 0.1rem;
        top: 38%;
        position: absolute;
        width: 0.2rem;
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
        left: 0;
        top: 85%;
    }

    .banner-img {
        left: 5%;
        position: absolute;
        top: 33%;
        width: 90%;
    }
    .banner-tips {
        left: 5%;
        top: 38%;
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
                    <img :class="adInfo.pos + '-img' + ' layer-middle' " :src="adInfo.img" />
                    <img v-if="adInfo.bg" :class="adInfo.pos + '-bg' + ' layer-bottom' " :src="adInfo.bg"/>
                    <img v-if="adInfo.mask" :class="adInfo.pos + '-mask' + ' layer-middle' " :src="adInfo.mask"/>
                    <img v-if="adInfo.close" :class="adInfo.pos + '-close' + ' layer-middle' " :src="adInfo.close"/>
                    <div :class="adInfo.pos + '-tips' + ' tips layer-top' ">广告</div>
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
