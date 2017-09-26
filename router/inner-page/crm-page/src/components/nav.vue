<template>
    <nav aria-label="Page navigation">
        <ul class="pagination">
            <li v-for="index in indexInfo.indexs" @click="setCurPage(index)" v-bind:key="index">
                <a v-if="index === indexInfo.curIndex" class="selected">{{ index + 1 }}</a>
                <a v-else >{{ index + 1 }}</a>
            </li>
        </ul>
    </nav> 
</template>

<script>
export default {
    props: ["indexInfo"],
    methods: {
        setCurPage: function(index) {
            this.$emit("setCurPage", index);
        }
    }
}
</script>

<style>

</style>
