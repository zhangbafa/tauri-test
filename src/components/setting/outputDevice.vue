<template>
  <!-- {{ audioOutputDevice }} -->
  <a-form ref="formRef" size="large" :model="form" :style="{ width: '600px' }" @submit="handleSubmit">
    <a-form-item field="audioOutput" label="音频输出">
      <a-select v-model="form.audioOutput" placeholder="请选择" allow-clear @change="handleSetOutput">
        <a-option :value="item.deviceId" v-for="item in audioOutputDevice">{{ item.label }}</a-option>
      </a-select>
    </a-form-item>
    <a-form-item field="audioInput" label="音频输入">
      <a-select v-model="form.audioInput" placeholder="请选择" allow-clear>
        <a-option :value="item.deviceId" v-for="item in audioInputDevice">{{ item.label }}</a-option>
      </a-select>
    </a-form-item>
  </a-form>

</template>
<script setup>
import { ref, onMounted, reactive } from 'vue'
import { listen,emit} from '@tauri-apps/api/event'
const audioOutputDevice = ref()
const audioInputDevice = ref()
const form = reactive({
  audioOutput: '',
  audioInput: ''
})

onMounted(() => {
  navigator.mediaDevices.getUserMedia({ audio: true, video: true })
    .then(() => {
      // 在用户同意后，再列出设备
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          const audioOutputs = devices.filter(
            (device) => device.kind === "audiooutput"
          );
          const audioInputs = devices.filter(
            (device) => device.kind === "audioinput"
          );
          audioInputDevice.value = audioInputs;
          audioOutputDevice.value = audioOutputs;

        })
        .catch((error) => {
          console.error("获取音频设备失败:", error);
        });
    })
    .catch(error => {
      console.error("Permission denied or error occurred", error);
    });

});

const handleSetOutput=(e)=>{
  console.log(e)
  emit('setSinkId',{sinkid:e})
}
</script>