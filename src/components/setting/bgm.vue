<template>
  <div class="container">
    <div class="controls">
      <!-- <input  /> -->
      <a-upload type="primary" @click="handleFileSelect"/>
      <a-select v-model:value="selectedDevice" style="width: 200px" @change="handleDeviceChange" placeholder="选择音频输出设备">
        <a-option v-for="device in audioDevices" :key="device.deviceId" :value="device.deviceId">
          {{ device.label }}
        </a-option>
      </a-select>
      <a-button @click="handlePlay">播放</a-button>
    </div>
    <div class="file-list">
      <div v-for="(file, index) in fileList" :key="index" class="file-item">
        <span>{{ file.name }}</span>
        <a-button type="primary" shape="circle" status="danger" size="mini">
          <icon-close />
        </a-button>
        <!-- <icon-close-circle /> -->
        <!-- <a-button type="primary" @click="handleDeleteFile(index)" danger>删除</a-button> -->
       
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { open } from '@tauri-apps/plugin-dialog'
import { readFile } from '@tauri-apps/plugin-fs'
const audioContext = new (window.AudioContext || window.webkitAudioContext)()
const audioDevices = ref([])
const selectedDevice = ref('')
const fileList = ref([])
const audioBuffers = ref([])
let currentAudioSource = null
let currentIndex = 0
let isPlaying = false

// 获取音频设备列表
const getAudioDevices = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    audioDevices.value = devices.filter(device => device.kind === 'audiooutput')
    if (audioDevices.value.length > 0) {
      selectedDevice.value = audioDevices.value[0].deviceId
    }
  } catch (error) {
    console.error('获取音频设备失败:', error)
  }
}
const selectMusicFile = async () => {
  try {
    const files = await open({
      multiple: true,
      directory: false,
      filters: [{
        name: '音频文件',
        extensions: ['mp3', 'wav', 'ogg', 'flac', 'aac']
      }]
    })
    if (files) {
      for (const file of files) {
          const audioBuffer = await loadAudioFile(file)
          if (audioBuffer) {
            fileList.value.push({ name: file.name })
            audioBuffers.value.push(audioBuffer)
          }
      }
    }
  } catch (error) {
    console.error('选择音乐文件时出错:', error)
    Message.error('加载音频文件失败：' + error.message)
  }
}

// 加载音频文件
const loadAudioFile = async (file) => {
  try {
    const arrayBuffer = await readFile(file)
    // const arrayBuffer = await file.arrayBuffer()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    return audioBuffer
  } catch (error) {
    console.error('加载音频文件失败:', error)
    return null
  }
}

// 处理文件选择
const handleFileSelect = async (fileList,fileItem) => {
  // const files = Array.from(event.target.files)
  console.log(fileList)
  for (const file of fileList) {
    const audioBuffer = await loadAudioFile(file)
    if (audioBuffer) {
      fileList.value.push({ name: file.name })
      audioBuffers.value.push(audioBuffer)
    }
  }
}

// 处理文件删除
const handleDeleteFile = (index) => {
  if (isPlaying && index === currentIndex) {
    stopPlayback()
  }
  
  fileList.value.splice(index, 1)
  audioBuffers.value.splice(index, 1)
  
  if (index < currentIndex) {
    currentIndex--
  }
}

// 停止当前播放
const stopPlayback = () => {
  if (currentAudioSource) {
    currentAudioSource.stop()
    currentAudioSource.disconnect()
    currentAudioSource = null
  }
  isPlaying = false
}

// 播放指定索引的音频
const playAudio = (index) => {
  if (!audioBuffers.value[index]) return
  
  stopPlayback()
  
  const source = audioContext.createBufferSource()
  source.buffer = audioBuffers.value[index]
  source.connect(audioContext.destination)
  
  source.onended = () => {
    if (audioBuffers.value.length > 1) {
      currentIndex = (currentIndex + 1) % audioBuffers.value.length
      playAudio(currentIndex)
    } else if (audioBuffers.value.length === 1) {
      // 单文件循环播放
      playAudio(0)
    }
  }
  
  currentAudioSource = source
  source.start(0)
  isPlaying = true
  
  // 设置音频输出设备
  if (selectedDevice.value && audioContext.setSinkId) {
    audioContext.setSinkId(selectedDevice.value)
      .catch(error => console.error('设置音频输出设备失败:', error))
  }
}

// 处理播放按钮点击
const handlePlay = () => {
  if (isPlaying || audioBuffers.value.length === 0) return
  playAudio(currentIndex)
}

// 处理设备切换
const handleDeviceChange = (deviceId) => {
  selectedDevice.value = deviceId
  if (isPlaying && audioContext.setSinkId) {
    audioContext.setSinkId(deviceId)
      .catch(error => console.error('设置音频输出设备失败:', error))
  }
}

onMounted(() => {
  getAudioDevices()
})

onUnmounted(() => {
  stopPlayback()
  if (audioContext) {
    audioContext.close()
  }
})
</script>

<style scoped>
.container {
  padding: 20px;
}
.controls {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 20px;
}
.file-list {
  margin-top: 20px;
}
.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid #eee;
}
.file-item:hover {
  background-color: #f5f5f5;
}
</style>