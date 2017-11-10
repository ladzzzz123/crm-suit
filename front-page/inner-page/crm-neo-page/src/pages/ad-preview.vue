<style scaffold>
    .container {
        position: relative;
    }
    .bg {
        height: 4.18rem;
        width: 2.04rem;
    }
    .content {
        background: #808080;
        font-size: 0;
        height: 3.2rem;
        left: 50%;
        margin-left: -0.89rem;
        overflow: hidden;
        position: absolute;
        text-align: left;
        top: 0.49rem;
        width: 1.78rem;
    }

    .tips {
        background: rgba(55, 55, 55, 0.6);
        border-radius: 2px;
        color: white;
        font-size: 0.10rem;
        left: -1.8%;
        padding: 0.01rem;
        position: absolute;
        width: 0.12rem;
        transform: scale(0.5);
        -ms-transform: scale(0.5);
        -moz-transform: scale(0.5);
        -webkit-transform: scale(0.5);
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
        height: 2.7rem;
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
        margin-bottom: 1.2rem;
    }
    .calling-img {
        position: relative;
        width: 100%;
    }
    .calling-tips {
        display: inline-block;
        margin-top: -0.06rem;
        position: relative;
    }
    .calling-close {
        display: inline-block;
        margin-left: 1.5rem;
        margin-top: 0.05rem;
        width: .12rem;
        vertical-align: top;
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
        top: 83.5%;
    }


    .banner-bg {
        height: 100%;
        left: 0;
        position: absolute;
        top: 0;
        width: 100%;
    }

    .banner-container{
        left: 5%;
        position: absolute;
        top: 33%;
        width: 90%;
    }
    .banner-img {
        border-radius: 5px;
        width: 100%;
    }
    .banner-tips {
        left: -2%;
        top: 50%;
        transform: scale(0.4);
        -ms-transform: scale(0.4);
        -moz-transform: scale(0.4);
        -webkit-transform: scale(0.4);
    }

    .ios-time {
        font-weight: bold;
        font-size: .1rem;
        color: #000;
        transform: scale(0.4);
        -ms-transform: scale(0.4);
        -moz-transform: scale(0.4);
        -webkit-transform: scale(0.4);
    }

    .android-time {
        font-weight: bold;
        font-size: .1rem;
        margin-left: -0.05rem;
        margin-right: 0.05rem;
        color: #5f5f5f;
        vertical-align: top;
        transform: scale(0.5);
        -ms-transform: scale(0.5);
        -moz-transform: scale(0.5);
        -webkit-transform: scale(0.5);
    }

    .notice-item {
        display: inline-block;
        height: 100%;
    }

    .notice-bar{ 
        height: 0.085rem;
        line-height: 0.1rem;
        position: absolute;
        width: 100%;
        top: 0;
    }

    .android {
        background: #e0e0e0;
    }

    .ios {
        background: #808080;
    }

    .notice-status {
        height: 100%;
        position: absolute;
        right: -0.05rem;
    }

    .left {
        left: 0.05rem;
        position: absolute;
    }
    .center {
        margin-left: -0.1rem;
        left: 50%;
        position: absolute;
        top: -0.01rem;
    }
    .right {
        right: 0.05rem;
        position: absolute;
    }

</style>
<template>
    <Row v-if="logged">
        <Row>
            <Col span="6" offset="2">
                <Select v-model="curBg" placeholder="请选择背景图" @on-change="updateBgType">
                    <Option v-for="bgItem in bgArr" :key="bgItem.name" :value="bgItem.bg">
                        <Icon v-if="bgItem.bgType === 'android'" type="social-android"></Icon>
                        <Icon v-else-if="bgItem.bgType === 'iOS'" type="social-apple"></Icon>
                        {{ bgItem.name }}
                    </Option>
                </Select>
            </Col>
            <Col span="6" offset="10">
                <TimePicker type="time" placeholder="选择时间" format="HH:mm" @on-change="changeTime"></TimePicker>
            </Col>
        </Row>
        <Col span="12" v-for="adInfo in adImgs" v-bind:key="adInfo.pos">
            <Card class="container">
                <p slot="title">
                    {{ adInfo.title }}
                </p>
                <Row>
                    <img class="bg" :src="curBg" />
                    <div class="content">
                        <template v-if="adInfo.displayStatus">
                            <div class="notice-bar android layer-top" v-if="curBgItem.bgType === 'android'">
                                <div class="notice-status">
                                    <img class="notice-item" src="img/android-notice-bar.png"/>
                                    <div class="android-time notice-item">{{ timeStr }}</div>
                                </div>
                            </div>
                            <div class="notice-bar ios layer-top" v-else-if="curBgItem.bgType === 'iOS'">
                                <img class="notice-item left" src="img/ios-signal.png"/>
                                <div class="ios-time center">{{ timeStr }}</div>
                                <img class="notice-item right" src="img/ios-power.png"/>
                            </div>
                        </template>

                        <img v-if="adInfo.bg" :class="adInfo.pos + '-bg' + ' layer-bottom' " :src="adInfo.bg"/>
                        <div :class="adInfo.pos + '-container img-container layer-middle' ">
                            <div style="height: 0.19rem">
                                <div :class="adInfo.pos + '-tips' + ' tips layer-top' ">广告</div>
                                <img v-if="adInfo.close" :class="adInfo.pos + '-close' + ' layer-middle' " :src="adInfo.close"/>
                            </div>
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
        </Col>
    </Row>
    <div class="container" v-else>
        您尚未登录，请点击<a @click="gotoLogin">此处</a>登录
    </div>
</template>

<script>
import requester from "../utils/request";
import RESULT_CODE from "../../../../../router/codemap.json";
import func from "../main";

export default {
    // props: ["userInfo"],
    data: () => {
        return { 
            adImgs: [
               { pos: "openning", title: "开屏",img: "", bg: "img/openning-bg.jpg", displayStatus: false },
               { pos: "calling", title: "拨号前", img: "", bg: "img/calling-bg.jpg", close: "http://121.52.235.231:40718/upload_img/static/img/close.png", displayStatus: true },
               { pos: "hangup", title: "挂机",img: "", mask:"img/preview-mask.png", displayStatus: false },
               { pos: "banner", title: "Banner",img: "", bg: "img/banner-bg-new.jpg", displayStatus: true }
            ],
            curBg: "img/preview-iphone-new.jpg",
            curBgItem: { name: "iPhone6Plus", bg : "img/preview-iphone-new.jpg", bgType: "iOS" },
            bgArr: [
                { name: "iPhone6Plus", bg : "img/preview-iphone-new.jpg", bgType: "iOS"},
                { name: "GooglePixel", bg : "img/preview-pixel-new.jpg", bgType: "android"},
            ],
            timeStr: "",
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
            item.img = `/crm-inner/static/ad/${this.userInfo.u_name}_${item.pos}.jpg`;
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
        changeTime: function(timeStr) {
            this.timeStr = timeStr;
        },
        onUploadError(error, file, fileList) {
            console.log(JSON.stringify(error));
        },
        updateBgType(bg) {
            this.curBgItem = this.bgArr.find(item => {
                return item.bg === bg;
            });
        },
        handleUploadSuccess(res, file, fileList) {
            console.log(JSON.stringify(res));
            console.log(JSON.stringify(file));
            if(res.status === 2000) {
                func.showTips("alert-success", "文件上传成功！！");
                this.adImgs.forEach(item => {
                    item.img = `/crm-inner/static/ad/${this.userInfo.u_name}_${item.pos}.jpg?v=${parseInt(Math.random() * 1000)}`;
                });
            } else {
                func.showTips("alert-danger", "文件上传失败！！");
            }
        }
    }

};
</script>
