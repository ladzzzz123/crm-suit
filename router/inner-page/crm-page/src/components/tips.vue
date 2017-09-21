<template>
    <div v-show="showFlag"
        :class="'alert ' + tipsType +  ' alert-dismissible top-tips' "
        role="alert"> 
        <button type="button" class="close" data-dismiss="alert" aria-label="Close" @click="hideTips"> 
            <span aria-hidden="true">&times;</span> 
        </button> 
        {{ msg }}
    </div>
</template>

<script>
export default {
    computed: {
        showFlag() {
            return this.$store.state.tipsInfo.showFlag;
        },
        msg() {
            return this.$store.state.tipsInfo.msg;
        },
        tipsType() {
            return this.$store.state.tipsInfo.tipsType;
        }
    },
    methods: {
        hideTips: function() {
            this.$store.dispatch({
                    type: "asyncShowTips",
                    tipsInfo: {
                        msg: "",
                        tipsType: "",
                        showFlag: false
                    }
                });
        }
    }
}
</script>

<style>

</style>
