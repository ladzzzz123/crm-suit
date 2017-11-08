<template>
    <Page :total="parseInt(indexInfo.indexs.length)" 
        :page-size="parseInt(1)" @on-change="setCurPage">
    </Page>
</template>

<script>
export default {
    props: ["indexInfo"],
    methods: {
        setCurPage: function(index) {
            console.log("[pageIndex] index:%s", index);
            this.indexInfo.curIndex = index;
            this.$emit("setCurPage", index - 1);
        }
    }
}
</script>

<style>
</style>
