<template>
  <div style="margin-left: 25px;margin-bottom: 20px;">
    <a-space>
      <div>
        <a-button @click="selectMusicFile" type="primary">选择背景音乐</a-button>
      </div>
      <div style="margin: 20px"  v-if="audioSrc">      
        <a-switch v-model="enableLoop" @change="handleLoopChange"/>
        <span style="margin: 0 10px;">循环{{ enableLoop ? '开启' : '关闭' }}</span>
      </div>
    </a-space>
    <div v-if="audioSrc" style="margin-top: 10px;">
      <audio 
        ref="audioPlayer" 
        :src="audioSrc" 
        controls 
        @ended="handleAudioEnd"
        @play="handleAudioPlay"
        @pause="handleAudioPause"
        style="width: 600px;height: 35px;"
      ></audio>
    </div>
  </div>
</template>

<script setup>
import { onUnmounted, ref, watch } from 'vue'
import { open } from '@tauri-apps/plugin-dialog'
import { readFile } from '@tauri-apps/plugin-fs'
import { Message } from '@arco-design/web-vue'
import { emit,listen } from '@tauri-apps/api/event'
import { convertFileSrc } from '@tauri-apps/api/core'

const audioSrc = ref('')
const audioPlayer = ref(null)
const enableLoop = ref(true)
const audioContext = ref(new (window.AudioContext || window.webkitAudioContext)())
const source = ref(null)
const deviceId = ref('default')
const handleAudioPlay = () => {
  // 发送事件降低视频音量
  emit('custom-event', { action: 'volume', volume: 0.2 })
}

const handleAudioPause = () => {
  // 发送事件恢复视频音量
  emit('custom-event', { action: 'volume', volume: 1.0 })
  if (source.value) {
    source.value.stop()
  }
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
      const fileData = await readFile(selected)
      audioContext.value.decodeAudioData(new Uint8Array(fileData).buffer, (buffer) => {
        playAudio(buffer)
        // 提示
        Message.success('音频文件加载成功')
      }, (error) => {
        console.error('解码音频文件时出错:', error)
        Message.error('解码音频文件失败：' + error.message)
      })
    }
  } catch (error) {
    console.error('选择音乐文件时出错:', error)
    Message.error('加载音频文件失败：' + error.message)
  }
}


const playAudio = (buffer) => {
  if (source.value) {
    source.value.stop()
  }
  audioContext.value.setSinkId(deviceId.value)
  source.value = audioContext.value.createBufferSource()
  source.value.buffer = buffer
  source.value.loop = enableLoop.value
 
  source.value.connect(audioContext.value.destination)
  source.value.start()
}

const handleLoopChange = (checked) => {
  enableLoop.value = checked
  if (source.value) {
    source.value.loop = checked
  }
}

const handleAudioEnd = () => {
  // 如果不是循环模式，可以在这里添加额外的处理逻辑
  if (!enableLoop.value) {
    console.log('音频播放结束')
    emit('custom-event', { action: 'volume', volume: 1.0 })
  }
}

watch(audioSrc, (newSrc) => {
  if (newSrc && audioPlayer.value) {
    audioPlayer.value.src = newSrc
    audioPlayer.value.setSinkId('default')
  }
})


let unsetSinkId
(async ()=>{
  unsetSinkId= await listen('setSinkId',async (event)=>{
    deviceId.value = event.payload.sinkid
  })
})()
onUnmounted(()=>{
  unsetSinkId()
})
</script>

<style scoped>
.a-switch {
  margin-left: 10px;
}
</style>