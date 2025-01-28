<template>
  <div style="margin-left: 25px;margin-bottom: 20px;">
    <h3 >背景音乐</h3>
    <a-space>
      <div>
      <a-button @click="selectMusicFile" type="primary">选择背景音乐</a-button>
    </div>
    <div style="margin: 20px"  v-if="audioSrc">      
      <a-switch v-model="enableLoop" @change="handleLoopChange"/>
      <span style="margin: 0 10px;">循环{{ enableLoop ? '开启' : '关闭' }}</span>
    </div>
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
    </a-space>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { open } from '@tauri-apps/plugin-dialog'
import { readFile } from '@tauri-apps/plugin-fs'
import { Message } from '@arco-design/web-vue'
import { emit } from '@tauri-apps/api/event'

const audioSrc = ref('http://music.163.com/song/media/outer/url?id=1303019637.mp3')
const audioPlayer = ref(null)
const enableLoop = ref(true)

const handleAudioPlay = () => {
  // 发送事件降低视频音量
  emit('custom-event', { action: 'volume', volume: 0.2 })
  console.log('播放中')
}

const handleAudioPause = () => {
  // 发送事件恢复视频音量
  console.log('暂停中')
  emit('custom-event', { action: 'volume', volume: 1.0 })
}

const selectMusicFile = async () => {
  try {
    const selected = await open({
      multiple: false,
      directory: false,
      filters: [{
        name: '音频文件',
        extensions: ['mp3', 'wav', 'ogg', 'flac', 'm4a']
      }]
    })

    if (selected) {
      // 读取文件并创建 Blob URL
      const fileData = await readFile(selected)
      const blob = new Blob([fileData], { type: 'audio/mp3' })
      audioSrc.value = URL.createObjectURL(blob)

      // 自动播放
      if (audioPlayer.value) {
        audioPlayer.value.play()
      }

      // 提示
      Message.success('音频文件加载成功')
    }
  } catch (error) {
    console.error('选择音乐文件时出错:', error)
    Message.error('加载音频文件失败：' + error.message)
  }
}

const handleLoopChange = (checked) => {
  enableLoop.value = checked
  
  if (audioPlayer.value) {
    audioPlayer.value.loop = checked
    
    // 如果不循环且正在播放，播放完当前音频后停止
    if (!checked) {
      audioPlayer.value.addEventListener('ended', () => {
        audioPlayer.value.pause()
      }, { once: true })
    }
  }
}

const handleAudioEnd = () => {
  // 如果不是循环模式，可以在这里添加额外的处理逻辑
  if (!enableLoop.value) {
    console.log('音频播放结束')
    emit('custom-event', { action: 'volume', volume: 1.0 })
  }
}

// 监听音频源变化
watch(audioSrc, (newSrc) => {
  if (newSrc && audioPlayer.value) {
    audioPlayer.value.src = newSrc
    audioPlayer.value.play()
  }
})
</script>

<style scoped>
.a-switch {
  margin-left: 10px;
}
</style>