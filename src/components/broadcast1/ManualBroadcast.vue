<template>
  <a-card style="margin-top: 10px">
    <a-input type="text" v-model="inputText" placeholder="请输入播报内容 回车发送" @press-enter="handleBroadcast" allow-clear />
  </a-card>
</template>

<script setup>
import { ref, defineModel } from 'vue'
import { useForWithDelay } from '@/compositions/useForWithDelay.js'
import { useAudioPlayer } from '@/compositions/useAudioPlayer.js'
import {emit as emits } from '@tauri-apps/api/event'


const inputText = ref('')
const emit = defineEmits(['broadcast'])
const { fetchSpeech } = useForWithDelay()
const { playBlob, close, playing } = useAudioPlayer()
const selectedModels = defineModel()
const handleBroadcast = async () => {
  const model_id = selectedModels.value?.assistant_model ?? 0
  const audioBlob = await fetchSpeech(inputText.value, model_id)
  emits('addLog',{
    time: new Date().toLocaleString(),
    role:'手动插播',
    logtext: inputText.value
  })
  await playBlob(audioBlob)
  setTimeout(() => {
    inputText.value = ''
  }, 1000)
}
</script>