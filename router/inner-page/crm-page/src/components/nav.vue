<template>
    <nav aria-label="Page navigation">
        <ul class="pagination">
            <li v-for="index in indexInfo.indexs" @click="setCurPage(index)"
                v-bind:key="index" :class="index === indexInfo.curIndex ? 'active' : '' ">
                <a class="nav-index">{{ index + 1 }}</a>
            </li>
        </ul>
    </nav> 
</template>

<script>
export default {
    props: ["indexInfo"],
    methods: {
        setCurPage: function(index) {
            this.indexInfo.curIndex = index;
            this.$emit("setCurPage", index);
        }
    }
}
</script>

<style>
</style>
