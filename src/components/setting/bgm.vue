<template>
  <div style="margin-left: 25px;margin-bottom: 20px;">
    <a-space>
      <div>
        <a-button @click="selectMusicFile" type="primary">选择背景音乐</a-button>
      </div>
      <div style="margin: 20px" v-if="audioSrc">
        <a-switch v-model="enableLoop" @change="handleLoopChange" />
        <span style="margin: 0 10px;">循环{{ enableLoop ? '开启' : '关闭' }}</span>
      </div>
    </a-space>
    <div v-if="audioSrc" style="margin-top: 10px;">
      <!-- 使用 Audio 对象播放音频，不再需要 <audio> 标签 -->
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { open } from '@tauri-apps/plugin-dialog'
import { readFile } from '@tauri-apps/plugin-fs'
import { Message } from '@arco-design/web-vue'
import { emit,listen } from '@tauri-apps/api/event'
import {convertFileSrc} from '@tauri-apps/api/core'

const audioSrc = ref('')
const audioPlayer = ref(new Audio())
const enableLoop = ref(true)
audioPlayer.value.loop = enableLoop.value
const handleAudioPlay = () => {
  // 发送事件降低视频音量
  emit('custom-event', { action: 'volume', volume: 0.2 })
}

const handleAudioPause = () => {
  // 发送事件恢复视频音量
  emit('custom-event', { action: 'volume', volume: 1.0 })
}

const selectMusicFile = async () => {
  try {
    const selected = await open({
      multiple: false,
      directory: false,
      filters: [{
        name: '音频文件',
        extensions: ['mp3', 'wav', 'ogg', 'flac', 'aac']
      }]
    })
    if (selected) {
      // 读取文件并创建 Blob URL
      const mimeTypes = {
          mp3: 'audio/mpeg',
          wav: 'audio/wav',
          ogg: 'audio/ogg',
          aac: 'audio/aac',
          flac: 'audio/flac',
      };
      const mime=mimeTypes[getFileExtension(selected)]
      const fileData = await readFile(selected)
      const blob = new Blob([fileData], { type: mime })
      audioSrc.value = URL.createObjectURL(blob)
      audioPlayer.value.src = audioSrc.value
      
      audioPlayer.value.play()
      // 提示
      Message.success('音频文件加载成功')
    }
  } catch (error) {
    console.error('选择音乐文件时出错:', error)
    Message.error('加载音频文件失败：' + error.message)
  }
}

function getFileExtension(filename) {
  const match = filename.match(/\.([a-zA-Z0-9]+)$/);
  return match ? match[1] : '';
}

const handleLoopChange = (checked) => {
  enableLoop.value = checked
  audioPlayer.value.loop = checked
}

let unlisten;
(async()=>{
  unlisten=await listen('setSinkId',(event)=>{
    const deviceId = event.payload.sinkid
    audioPlayer.value.setSinkId(deviceId)
  })
})()
onMounted(() => {
  audioPlayer.value.addEventListener('play', handleAudioPlay)
  audioPlayer.value.addEventListener('pause', handleAudioPause)
})

onBeforeUnmount(() => {
  audioPlayer.value.removeEventListener('play', handleAudioPlay)
  audioPlayer.value.removeEventListener('pause', handleAudioPause)
  audioPlayer.value.pause()
  URL.revokeObjectURL(audioSrc.value)
  unlisten()
})
</script>

<style scoped>
.a-switch {
  margin-left: 10px;
}
</style>
