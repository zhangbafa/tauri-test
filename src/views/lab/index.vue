<template>
    <a-row :gutter="15">
        <a-col :span="6" style="overflow-y: auto;padding: 10px;height: 98vh;background: var(--color-fill-2);
">
            <a-card hoverable v-for="(item, index) in list" :key="index" style="margin-bottom: 15px;" @click="handleNav(item, index)">
                {{ item }}
            </a-card>
        </a-col>
        <a-col :span="18">
            <a-card>
                <router-view></router-view>
            </a-card>
        </a-col>
    </a-row>
</template>

<script setup>
const list = [
    '文本转语音网络接口',
    '电商ROI',
    '直播间人数、礼物统计',
    '财神直播间',
    '礼佛直播间',
    '视频去重:雨滴特效',
    '视频去重:烟雾特效',
    '音视频极速剪辑',
    '文本转语音',
    '语音转文本',
    '获取直播间商品，然后可查询，每次1元',
    '文本转语音网络接口',
    '电商ROI',
    '直播间人数、礼物统计',
    '财神直播间',
    '礼佛直播间',
    '视频去重:雨滴特效',
    '视频去重:烟雾特效',
    '音视频极速剪辑',
    '文本转语音',
    '语音转文本',
    '获取直播间商品，然后可查询，每次1元'
]
import { useRouter } from 'vue-router';

const router = useRouter();
const handleNav = (item, index) => {
    if (index === 10) { // 获取直播间商品
        router.push('/lab/douyin-products');
    }
}
</script>