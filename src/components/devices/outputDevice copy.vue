<template>
  <div class="baoshi-box" style="margin-top: 20px; margin-bottom: 10px">
  <a-form ref="formRef" size="large" :model="form" >
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
    <a-form-item field="audioInput" label="音频输入">
      <a-button @click="handleTestMic">测试麦克风</a-button>
    </a-form-item>
  </a-form>
</div>
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
  emit('setSinkId',{sinkid:e})
}

// 测试麦克风
const handleTestMic = () => {
  const audioContext = new AudioContext();
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const draw = () => {
         analyser.getByteFrequencyData(dataArray);
         const max = Math.max(...dataArray);
         console.log(max)
         if (max > 100) {
            console.log('麦克风有声音');
         } else {
            console.log('麦克风静音');
         }
         requestAnimationFrame(draw);
      };
      draw();
    })
   .catch(error => {
      console.error("获取麦克风权限失败:", error);
    });
} 
</script>