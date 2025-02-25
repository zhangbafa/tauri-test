<template>
    <div class="baoshi-box">
        <a-space>
            <a-switch v-model="enableAssistant" @change="handleEnable" checked-color="#F53F3F" />
            助播AI{{ enableAssistant ? "开启" : "关闭" }}
        </a-space>
    </div>
</template>
<script setup>
import { ref, defineModel, onBeforeUnmount } from 'vue'
import { emit as tauriEmit, listen } from '@tauri-apps/api/event'
import { useForWithDelay } from "@/compositions/useForWithDelay.js"
import { useAudioPlayer } from "@/compositions/useAudioPlayer.js"
import { processTemplate, processUsername, setTimeParseTime } from '@/utils/index.js'
import dbManager from "@/db/index.js";

const { fetchSpeech } = useForWithDelay();
const { playBlob, setVolume } = useAudioPlayer();

const enableAssistant = ref(false)
const keywordList = ref([])
const audioSrc = ref('')
const audioPlayer = ref(new Audio())

const props = defineProps({
  liveid: {
    type: String,
    default: 0
  }
})
const fetchData = async () => {
    keywordList.value = await dbManager.query(`select * from assistant_script where category_id=${props.liveid}`);
    console.log(keywordList.value)
};
fetchData();
// 测试关键词-回复列表
const keywordList_ = [
    {
        keyword: '无人 录播 录像',
        content: '{刚才有人说无人，你多看一会|我们是真人啊},现在时间{time},我们是真实的在和直播间的{宝宝|姐妹|姐姐}们互动,大家有什么问题都可以打在公屏上，我们看到都会尽量给大家解答的'
    },
    {
        keyword: '加急 拍了 已拍',
        content: '好的，{刚才有人说无人，你多看一会|我们是真人啊}，我看到你了，{给你安排了|给你加急了|已经安排好了|下播后就给你发货}，现在库存不多了，后台看到有{10|15|19|5}个姐妹拍下没有付款，一会我们就要清理库存了，姐妹们一定要秒拍秒付款，不要占用库存哦'
    }
]

function checkKeywordsInSentence(sentence) {
    const matchedItem = keywordList.value.find(item => {
        const keywords = item.keyword.split(' ');
        return keywords.some(keyword => sentence.includes(keyword));
    });
    return matchedItem ? matchedItem.content : null;
}
const handleEnable = (e) => {
    // 开启、关闭助播回复
    // tauriEmit('smartscene', { action: 'setvolume', volume: 0 })
    // setTimeout(()=>{
    //     tauriEmit('smartscene', { action: 'setvolume', volume: 1 })
    // },4000)

    //test
    const testSentence = '有人说这是录播';
    const result = checkKeywordsInSentence(testSentence);
    if (result) {
        console.log('匹配到内容:', result);
        console.log(processTemplate(result))
    } else {
        console.log('未匹配到内容');
    }
}
let unlisten;
const emit = defineEmits(['update-bell-volume', 'update-baoshi-volume']);
listen('assistantInteraction', async (event) => {
    // 未开启播放，则不播放
    if (!enableAssistant.value) return false
    // 提问的内容
    const askContent = event.payload.content
    // console.log(askContent)
    if (askContent && askList.value.length <= 0) {
        // 判断是否在设置的问题范围内
        console.log(askContent)
        askList.value.push(askContent)
        const audioBlob = await fetchSpeech(askContent, 0)
        if (audioSrc.value) {
            URL.revokeObjectURL(audioSrc.value)
        }
        audioSrc.value = URL.createObjectURL(audioBlob)
        audioPlayer.value.src = audioSrc.value

        await audioPlayer.value.play()
    }


})

const handlePlay = () => {
    // 设置主播音量 = 0
    // emit('setAnchorVolume', { action: 'setvolume', volume: 0 })
    // 设置插播音量 = 0
    emit('update-baoshi-volume', 0);
    // 设置铃声的音量 = 0
    emit('update-bell-volume', 0);
    // 设置智景音量 = 0 
    tauriEmit('smartscene', { action: 'setvolume', volume: 0 })
}
const handlePlayEnd = () => {
    // 清理资源，如果有
    if (audioSrc.value) { URL.revokeObjectURL(audioSrc.value) }
    // 清空提问列表 askList
    askList.value = []
    // 设置主播音量 = 0
    // emit('setAnchorVolume', { action: 'setvolume', volume: 1 })
    // 恢复插播音量 = 1
    emit('update-baoshi-volume', 1);
    // 恢复铃声的音量 = 1
    emit('update-bell-volume', 1);
    // 恢复智景音量 = 1
    tauriEmit('smartscene', { action: 'setvolume', volume: 1 })

}
audioPlayer.value.addEventListener('ended', handlePlayEnd);
audioPlayer.value.addEventListener('play', handlePlay);

onBeforeUnmount(() => {
    if (unlisten) unlisten()
    audioPlayer.value.removeEventListener('ended', handlePlayEnd);
    audioPlayer.value.removeEventListener('play', handlePlay);
})
</script>