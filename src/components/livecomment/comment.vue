<template>
    <a-row :gutter="20" style="margin-top: 10px;">
        <a-col :span="16">

            <a-list :virtualListProps="{
                height: 573,
            }" :data="commentList">
                <template #item="{ item, index }">
                    <a-list-item :key="item.msgId">
                        <a-avatar shape="square">
                            <img alt="avatar" :src="item.avatar" :size="30" />
                        </a-avatar>
                        <a-link @click="handleOpenUrl(item.secUid)" :hoverable="false"
                            style="margin-left: 10px;margin-right:  10px;">{{ item.nickName }}</a-link>
                        <span v-show="item.type == 1" style="color: red;">
                            {{ item.content }}
                        </span>
                        <span v-show="item.type == 5">送出了 {{ item.giftName }}</span>
                        <span v-show="item.type == 3">进入直播间</span>
                        <template #actions>
                            <icon-play-circle-fill size="22" @click="handlePlayHudong(item)" />
                        </template>
                    </a-list-item>
                </template>
            </a-list>


        </a-col>
        <a-col :span="8" style="position: relative;">

            <a-list :data="assistant_reply" :virtualListProps="{
                height: 560,
            }" >
                <template #item="{ item, index }">
                    <a-list-item :key="item.id">
                        {{ item.reply_content }}
                        <template #actions>
                            <icon-play-circle-fill size="22" @click="handleKeywordReplay(item.reply_content)" />
                        </template>
                    </a-list-item>
                </template>
            </a-list>
            <div style="position: absolute;right: 10px;bottom: -30px;cursor: pointer;">
                <icon-sync :size="22" @click="handleRefresh" @hover="handleRefresh" />
            </div>
        </a-col>
    </a-row>

</template>
<script setup>
import { ref } from 'vue'
import { useForWithDelay } from '@/compositions/useForWithDelay.js'
import { useAudioPlayer } from '@/compositions/useAudioPlayer.js'
import dbManager from '@/db/index.js'
import { open } from '@tauri-apps/plugin-shell'
const props = defineProps({
    commentList: {
        type: Array,
        default: () => []
    }
})

const { playBlob, close, playing } = useAudioPlayer()
const { fetchSpeech, setTimeParseTime, processUsername } = useForWithDelay()

const selectedModels = defineModel()
const assistant_reply = ref([])
const fetchData = async () => {
    assistant_reply.value = await dbManager.query('select * from assistant_reply where type = 1')
}
fetchData()
const handleRefresh = () => {
    fetchData()
}
// 回复评论
const handleKeywordReplay = async (item) => {
    const model_id = selectedModels.value?.assistant_model ?? 0
    const audioBlob = await fetchSpeech(item, model_id)
    await playBlob(audioBlob)
}

//播报礼物\进入直播间
const handlePlayHudong = async (item) => {
    let text = ''
    const nickname = processUsername(item.nickName) //需要对名字进行过滤
    switch (item.type) {
        case 3:
            text = `欢迎${nickname}进入直播间`
            break
        case 5:
            text = `感谢${nickname}送的${item.giftName}`
            break
        default:
            text = item.content
            break
    }
    // console.log(text)
    const model_id = selectedModels.value?.assistant_model ?? 0
    const audioBlob = await fetchSpeech(text, model_id)
    await playBlob(audioBlob)
}

// 打开用户主页
const handleOpenUrl = (url) => {
    open(`https://www.douyin.com/user/${url}`)
}
</script>

<style>
/* Custom scrollbar styles */
::-webkit-scrollbar {
    width: 8px;
    margin: 10px 0px;
    /* Thin scrollbar */
}

::-webkit-scrollbar-track {
    background: #f1f1f1;
    /* Light background for the track */
    border-radius: 4px;
}

::-webkit-scrollbar-thumb {
    background: #ddd;
    /* Dark grey scrollbar thumb */
    border-radius: 4px;
    /* Rounded corners */
}

::-webkit-scrollbar-thumb:hover {
    background: #888;
    /* Darker on hover */
}
</style>