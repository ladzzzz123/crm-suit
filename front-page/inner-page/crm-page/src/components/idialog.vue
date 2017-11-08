<template>
    <div v-if="showFlag" class="dialog layer-top">
        <img class="mask layer-bottom" />

        <div v-if="dialogType === 'info' " class="dialog-body layer-top">
            <h2 class="content">{{ content }}</h2>
            <button class="btn btn-primary" @click="close()">确定</button>
        </div>
        <div v-else-if="dialogType === 'confirm' " class="dialog-body layer-top">
            <h2 class="content">{{ content }}</h2>
            <div class="btn-group" role="group" aria-label="confirm">
                <button class="btn btn-success" @click="confirm()">确定</button>
                <button class="btn" @click="close()">取消</button>
            </div>
        </div>
        <div v-else-if="dialogType === 'input' " class="dialog-body layer-top">
            <h2 class="content">{{ content }}</h2>
            <textarea rows="8" cols="20" v-model="inputText" placeholder="请填写内容"/>
            <div class="btn-group" role="group" aria-label="input">
                <button class="btn btn-danger" @click="confirm()">确定</button>
                <button class="btn" @click="close()">取消</button>
            </div>
        </div>
        <div v-else>
            ???
        </div>
    </div>
</template>

<script>
export default {
    data: () => {
        return {
            inputText: "",
        };
    },
    computed: {
        showFlag() {
            return this.$store.state.dialogInfo.showFlag || false;
        },
        content() {
            return this.$store.state.dialogInfo.content || "";
        },
        dialogType() {
            return this.$store.state.dialogInfo.dialogType || "";
        },
        confirmCB() {
            return this.$store.state.dialogInfo.confirmCB || "";
        },
    },
    methods: {
        close: function() {
            this.$store.dispatch({
                    type: "asyncShowDialog",
                    dialogInfo: {
                        content: "",
                        dialogType: "",
                        showFlag: false,
                        confirmCB: ""
                    }
                });
        },
        confirm: function() {
            if (this.confirmCB) {
                this.confirmCB(this.inputText || "");
            }
        }
    }
}
</script>

<style>
    .dialog {
        height: 100%;
        position: fixed;
        text-align: center;
        width: 100%;
    }

    .dialog .mask {
        background: rgba(1,1,1,0.6);
        height: 100%;
        left: 0;
        position: absolute;
        top: 0;
        width: 100%;
    }
    .dialog .dialog-body {
        background: #fff;
        display: inline-block;
        min-height: 3rem;
        padding: 0.5rem;
        position: relative;
        max-width: 90%;
        margin: 0 auto;
        margin-top: 1rem;
    }
    .dialog .content {

    }
    .dialog input {
        display: block;
        margin: 0 auto;
    }
    .dialog .btn-group {
        margin-top: 1rem;
    }
    
    .dialog textarea {
        display: block;
        margin: 0 auto;
        width: 100%;
    }
</style>
