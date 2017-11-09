<template>
    <Row>
        <Col span="8" offset="2">
            <Timeline>
                <TimelineItem v-for="log in changelog" :key="log[2]">
                    <p class="time">{{ log[0] }}</p>
                    <p class="content">{{ log[2] }}</p>
                </TimelineItem>
            </Timeline>
        </Col>
    </Row>
</template>

<script>
import CHANGELOG_DATA from "../data/changelog.json";

export default {
    data: () => {
        return {
            changelog: CHANGELOG_DATA
        }
    }
}
</script>

<style>
    .time{
        font-size: 14px;
        font-weight: bold;
        text-align: left;
    }
    .content{
        padding-left: 5px;
    }
</style>
