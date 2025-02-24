<template>
  <a-form :model="form" :style="{ width: '800px' }">
    <a-form-item field="videoPath" label="视频文件" label-col-flex="100px">
      <a-input v-model="form.videoPath" placeholder="" />
      <a-button type="primary" @click="handleSelectVideo" style="margin-left: 10px">选择文件</a-button>
    </a-form-item>
    <a-form-item field="deduplicated" label="去重策略" label-col-flex="100px">
      <a-radio-group @change="handleChangededuplicated" v-model="form.deduplicated">
        <a-radio value="randomText">随机文字</a-radio>
        <a-radio value="randomGraphics">随机图形</a-radio>
        <a-radio value="randomTextAndGraphics">随机文字和图形</a-radio>
        <a-radio value="rain">雨滴</a-radio>
      </a-radio-group>
      <template #extra>
        <div>一秒绘制60次文字或者图形。随机大小、随机颜色</div>
        <div style="margin-top: 10px;" v-if="form.deduplicated=='rain'">
        <a-space>
          <a-input type="text" v-model="rainnum" placeholder="请输入雨滴数量"  allow-clear size="mini"/>
          <a-button type="primary" @click="handleSetRainNumber" size="mini">确定</a-button>
        </a-space>
      </div>
      </template>
      
    </a-form-item>
    <a-form-item field="" label="调整透明度" label-col-flex="100px">
      <a-slider :show-ticks="true" v-model="form.alpha" :min="0" :max="1" :step="0.01" @change="handleChangeAlpha" />
      <template #extra>
        <div>调整文字或图像的透明度，以达到最佳的显示效果</div>
      </template>
    </a-form-item>
  </a-form>
  <a-form-item field="" label="预览视频" label-col-flex="100px">
    <a-space>
      <a-button @click="handleCreateWindow">打开预览窗口</a-button>
      <a-button type="primary" @click="handleStartLive">重新播放</a-button>
      <!-- <a-button type="primary" status="danger" @click="handleStop">暂停播放</a-button> -->
    </a-space>
    <div class="canvas-box"></div>
  </a-form-item>

</template>
<script setup>
import { reactive,ref } from "vue";
import { emit } from "@tauri-apps/api/event";
import { open } from "@tauri-apps/plugin-dialog";
import { useWindow } from '@/compositions/useWindow';
import { Message } from '@arco-design/web-vue'
import { convertFileSrc } from '@tauri-apps/api/core'
const { createNewWindow } = useWindow();

const form = reactive({
  videoPath: "",
  deduplicated: "randomTextAndGraphics",
  alpha: 1
})
const rainnum = ref(500)
const handleSetRainNumber= ()=>{
  if(!rainnum.value) rainnum.value= 500
  if(rainnum.value>10000){
    Message.error('雨滴数量不能超过10000个')
    return false
  }
  emit('smartscene', { action: 'setRainNumber', num:rainnum.value })
  
}
const handleCreateWindow = () => {
  if (!form.videoPath) {
    Message.error('没有一个视频文件')
    return false
  }
  createNewWindow('#/video', '畅语智景')
  const a = convertFileSrc(form.videoPath)

  setTimeout(() => {
    emit('smartscene', { action: 'openwindow', src: a, alpha: form.alpha, deduplicated: form.deduplicated })
  }, 2000)
  emit('addLog', { time: new Date().toLocaleString(), role: '用户', 'logtext': '打开了畅语智景窗口' })
}
const handleStartLive = () => {
  if (!form.videoPath) {
    Message.error('没有一个视频文件')
    return false
  }
  emit('smartscene', { action: 'resetplay' })

}
const handleSelectVideo = async () => {
  try {
    const localPath = await open({
      multiple: false,
      directory: false,
      filters: [
        {
          name: "视频文件",
          extensions: ["mp4", "mov", "mkv", 'ts'],
        },
      ],
    });
    form.videoPath = localPath;

  } catch (error) {
    alert("选择文件出错");
  }
};
const handleChangededuplicated = (e) => {
  emit('smartscene', { action: 'setDeDuplicate', type: e })
}
const handleChangeAlpha = (e) => {
  emit('smartscene', { action: 'setAlpha', alpha: e })
}

const handleShowMark = () => {
  emit('show-marks')
}

const handleStop = ()=>{
  emit('smartscene', { action: 'pause'})
}
</script>

<style>
video {
  width: calc(1080px / 4);
  height: calc(1920px /4);
  border-radius: 10px;
}

.canvas-box {
  padding: 2px;
  background-color: antiquewhite;
  margin-left: 100px
}

.canvas {
  width: calc(1080px / 4);
  height: calc(1920px /4);
  border-radius: 10px;

}
</style>