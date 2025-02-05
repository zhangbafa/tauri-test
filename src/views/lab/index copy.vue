<template>
    <a-row :gutter="15">
        <a-col :span="8" v-for="(item,index) in list">
            <a-card hoverable style="margin-bottom: 15px;" @click="handleGetProduct">
                {{ item }}
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
    '获取直播间商品，然后可查询，每次1元'
]
import {getDouyinLiveProducts} from '@/compositions/useHttpLab.js'
// (async ()=>{
//    
// })()
const handleGetProduct=async ()=>{
    const result = await getDouyinLiveProducts({roomid:'380952896968',author_id:'26639637029'})
    console.log(result)
}
</script>