<template>
  <div>
    <a-space>
      <a-checkbox v-model="scheduled" @change="handlescheduledRotation">报时主播定时轮换</a-checkbox>
      <a-input v-model="intervalTime" type="text" style="width: 60px;"></a-input> 分钟
    </a-space>
  </div>
</template>

<script setup>
import { ref,defineModel,onBeforeUnmount, toRaw } from 'vue'
import { emit } from '@tauri-apps/api/event'
import { useRandomPicker } from "@/compositions/useRandomPicker";
const { getRandomElement } = useRandomPicker();

const modelValue = defineModel()
const loadedModelsObj = { ...toRaw(modelValue.value) }; // 复制一份原始数据
let scheduledTimer;
const scheduled = ref(false)
const intervalTime = ref(60)

const handlescheduledRotation = (e) => {
  clearScheduledTimer()
  if(e){
    scheduledTimer = setInterval(() => {
      const loadedModelsArr = Object.values(loadedModelsObj)
      modelValue.value.report_model = getRandomElement(loadedModelsArr)
      console.log(modelValue.value.report_model)
    }, intervalTime.value * 1000 * 60 )
    emit('addLog', { time: new Date().toLocaleString(), role: '系统', logtext: '开启：报时主播定时轮换' })
  }else{
    clearScheduledTimer()
    emit('addLog', { time: new Date().toLocaleString(), role: '系统', logtext: '关闭：报时主播定时轮换' })
  }
}

const clearScheduledTimer = () =>{
  if(scheduledTimer) clearInterval(scheduledTimer)
}

onBeforeUnmount(()=>{
  clearScheduledTimer()
})
</script>