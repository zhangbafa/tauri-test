<template>
  <div style="margin-left: 25px;margin-bottom: 20px;margin-top: 20px">
    <a-space>
      <div>
        <a-button @click="selectMusicFile" type="primary">选择背景音乐</a-button>
      </div>
      <div style="margin: 20px;display: none;">
        <a-switch v-model="enableLoop" @change="handleLoopChange" :disabled="playlist.length > 1" />
        <span style="margin: 0 10px;">循环{{ enableLoop ? '开启' : '关闭' }}</span>
      </div><a-divider direction="vertical" />
      <a-space>
        <a-button @click="handlePlay" type="primary" style="margin-right: 10px;">          
          播放
        </a-button>
        <a-button @click="handlePause" type="primary" status="danger" style="margin-right: 10px;">
          暂停
        </a-button>
      </a-space><a-divider direction="vertical" />
      <div v-if="audioDevices.length > 0" style="margin-right: auto">
        <a-select v-model="selectedDevice" style="width: 200px" @change="handleDeviceChange">
          <a-option v-for="device in audioDevices" :key="device.deviceId" :value="device.deviceId">
            {{ device.label }}
          </a-option>
        </a-select>
      </div>
    </a-space>
    <div v-if="playlist.length > 0" style="margin: 20px 10px 10px 0;">
      <div class="playlist">
        <div v-for="(file, index) in playlist" :key="index" class="playlist-item">
          <span>{{ file.name }}</span>
          <div>
            <span v-if="currentFileIndex === index">(正在播放)</span>
            <a-button type="text" status="danger" @click="removeFile(index)">
              <icon-delete />
            </a-button>
          </div>
        </div>
      </div>
    </div>
    <div v-else style="margin-top: 50px;display: flex;justify-content: flex-start">
      <a-card style="width: 90%;">
        <a-empty description="选择背景音乐"/>
      </a-card>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { open } from '@tauri-apps/plugin-dialog'
import { readFile } from '@tauri-apps/plugin-fs'
import { Message } from '@arco-design/web-vue'
import { emit, listen } from '@tauri-apps/api/event'
import { IconDelete } from '@arco-design/web-vue/es/icon'

const audioSrc = ref('')
const audioPlayer = ref(new Audio())
const enableLoop = ref(true)
const playlist = ref([])
const currentFileIndex = ref(0)
const audioDevices = ref([])
const selectedDevice = ref('')

audioPlayer.value.loop = enableLoop.value

const isPlaying = ref(false)

const handlePlay = async () => {
  try {
    await audioPlayer.value.play()
    isPlaying.value = !isPlaying.value
  } catch (error) {
    console.error('播放控制失败:', error)
    Message.error('播放控制失败：' + error.message)
  }
}

const handlePause = async () => {
  try {
    await audioPlayer.value.pause()
    isPlaying.value = !isPlaying.value
  } catch (error) {
    console.error('播放控制失败:', error)
    Message.error('播放控制失败：' + error.message)
  }
}

const handleAudioPlay = () => {
  isPlaying.value = true
  emit('custom-event', { action: 'volume', volume: 0.2 })
}

const handleAudioPause = () => {
  isPlaying.value = false
  emit('custom-event', { action: 'volume', volume: 1.0 })
}

const handleAudioEnded = async () => {
  if (playlist.value.length > 1) {
    currentFileIndex.value = (currentFileIndex.value + 1) % playlist.value.length
    await loadAndPlayFile(playlist.value[currentFileIndex.value])
  }
}

const loadAndPlayFile = async (file) => {
  try {
    const fileData = await readFile(file.path)
    const blob = new Blob([fileData], { type: file.type })
    if (audioSrc.value) {
      URL.revokeObjectURL(audioSrc.value)
    }
    audioSrc.value = URL.createObjectURL(blob)
    audioPlayer.value.src = audioSrc.value
    await audioPlayer.value.play()
  } catch (error) {
    console.error('加载音频文件失败:', error)
    Message.error('加载音频文件失败：' + error.message)
  }
}

const removeFile = async (index) => {
  if (currentFileIndex.value === index) {
    audioPlayer.value.pause()
    if (audioSrc.value) {
      URL.revokeObjectURL(audioSrc.value)
      audioSrc.value = ''
    }
    if (playlist.value.length > 1) {
      currentFileIndex.value = 0
      await loadAndPlayFile(playlist.value[0])
    } else {
      currentFileIndex.value = 0
    }
  } else if (currentFileIndex.value > index) {
    currentFileIndex.value--
  }
  playlist.value.splice(index, 1)
  if (playlist.value.length === 1) {
    enableLoop.value = true
    audioPlayer.value.loop = true
  }
}

const selectMusicFile = async () => {
  try {
    const selected = await open({
      multiple: true,
      directory: false,
      filters: [{
        name: '音频文件',
        extensions: ['mp3', 'wav']
      }]
    })

    if (selected) {
      const files = Array.isArray(selected) ? selected : [selected]
      playlist.value = files.map(path => ({
        path,
        name: path.split(/[\\/]/).pop(),
        type: path.toLowerCase().endsWith('.mp3') ? 'audio/mpeg' : 'audio/wav'
      }))

      currentFileIndex.value = 0
      enableLoop.value = playlist.value.length === 1
      audioPlayer.value.loop = enableLoop.value

      await loadAndPlayFile(playlist.value[0])
      Message.success('音频文件加载成功')
    }
  } catch (error) {
    console.error('选择音乐文件时出错:', error)
    Message.error('加载音频文件失败：' + error.message)
  }
}

const handleLoopChange = (checked) => {
  enableLoop.value = checked
  audioPlayer.value.loop = checked
}

const loadAudioDevices = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    audioDevices.value = devices.filter(device => device.kind === 'audiooutput')
    if (audioDevices.value.length > 0) {
      selectedDevice.value = audioDevices.value[0].deviceId
      await handleDeviceChange(selectedDevice.value)
    }
  } catch (error) {
    console.error('获取音频设备列表失败:', error)
    Message.error('获取音频设备列表失败：' + error.message)
  }
}

const handleDeviceChange = async (deviceId) => {
  try {
    await audioPlayer.value.setSinkId(deviceId)
    Message.success('音频输出设备切换成功')
  } catch (error) {
    console.error('切换音频输出设备失败:', error)
    Message.error('切换音频输出设备失败：' + error.message)
  }
}

let unlisten;
(async () => {
  unlisten = await listen('setSinkId', (event) => {
    const deviceId = event.payload.sinkid
    audioPlayer.value.setSinkId(deviceId)
  })
})();

onMounted(() => {
  audioPlayer.value.addEventListener('play', handleAudioPlay)
  audioPlayer.value.addEventListener('pause', handleAudioPause)
  audioPlayer.value.addEventListener('ended', handleAudioEnded)
  loadAudioDevices()
})

onBeforeUnmount(() => {
  audioPlayer.value.removeEventListener('play', handleAudioPlay)
  audioPlayer.value.removeEventListener('pause', handleAudioPause)
  audioPlayer.value.removeEventListener('ended', handleAudioEnded)
  audioPlayer.value.pause()
  if (audioSrc.value) {
    URL.revokeObjectURL(audioSrc.value)
  }
  unlisten()
})
</script>

<style scoped>
.a-switch {
  margin-left: 10px;
}

.playlist {
  margin-top: 10px;
}

.playlist-item {
  margin: 5px 0;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--color-text-1);
  font-size: 14px;
  background-color: var(--color-fill-2);
  border: 1px solid var(--color-fill-3);
  border-radius: var(--border-radius-small);
}

.playlist-item span {
  margin-left: 10px;
}
</style>
