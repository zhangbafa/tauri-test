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
        <div>随机位置、大小、颜色</div>
        <div style="margin-top: 10px;" v-if="form.deduplicated == 'rain'">
          <a-space>
            <a-input type="text" v-model="rainnum" placeholder="请输入雨滴数量" allow-clear size="mini" />
            <a-button type="primary" @click="handleSetRainNumber" size="mini">确定</a-button>
          </a-space>
        </div>
      </template>

    </a-form-item>
    <a-form-item field="" label="调整透明度" label-col-flex="100px">
      <a-slider :show-ticks="true" v-model="form.alpha" :min="0" :max="1" :step="0.01" @change="handleChangeAlpha" />
      <template #extra>
        <div>拖动调整透明度，以达到最佳的显示效果</div>
      </template>
    </a-form-item>
  </a-form>
  <a-form-item field="" label="预览视频" label-col-flex="100px">
    <a-space>
      <a-button @click="handleCreateWindow" type="primary">打开预览窗口</a-button>
      <a-button type="primary" @click="handleStartLive" status="danger">重新播放</a-button>
      <!-- <a-button type="primary" status="danger" @click="handleStop">暂停播放</a-button> -->
    </a-space>

  </a-form-item>
  <a-divider />
  <a-button @click="handleShowMark">获取定时话术贴片</a-button>
  <div class="canvas-box">
    <div class="image-list">
      <div v-for="(item, idx) in paster" :key="idx" class="image-item">
        <div class="image-container" @click="handleShowPaster($event,item)">
          <img :src="item.paster_path" :alt="item.content" class="preview-image" loading="lazy"  v-if="item.paster_type=='image'"/>
          <video :src="item.paster_path" v-else  muted style="width: 100%;height: auto;"></video>          
        </div>
        <div style="text-align: center;font-size:12px;padding-top:10px;color:#666">
          {{ item.paster_type=="image"?'图片':'视频' }}
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { reactive, ref } from "vue";
import { emit } from "@tauri-apps/api/event";
import { open } from "@tauri-apps/plugin-dialog";
import { useWindow } from '@/compositions/useWindow';
import { Message } from '@arco-design/web-vue'
import { convertFileSrc } from '@tauri-apps/api/core'
import dbManager from "@/db/index.js";
const { createNewWindow } = useWindow();

const props = defineProps({
  liveid: {
    type: String,
    default: 0
  }
})
const form = reactive({
  videoPath: "",
  deduplicated: "randomTextAndGraphics",
  alpha: 1
})
const rainnum = ref(500)
const handleSetRainNumber = () => {
  if (!rainnum.value) rainnum.value = 500
  if (rainnum.value > 10000) {
    Message.error('雨滴数量不能超过10000个')
    return false
  }
  emit('smartscene', { action: 'setRainNumber', num: rainnum.value })

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

const paster = ref([])
const handleShowMark = async () => {
  try {
    const result = await dbManager.query(`select * from time_script where category_id=${props.liveid} AND (paster_path IS NOT NULL AND paster_path != '')`);
    console.log('原始数据:', result);

    paster.value = result.map(item => {
      if (!item.paster_path) return null;
      // 规范化路径
      const normalizedPath = item.paster_path.replace(/\\/g, '/');
      // 转换为 asset URL
      const assetUrl = convertFileSrc(normalizedPath);

      return {
        ...item,
        paster_path: assetUrl
      };
    }).filter(Boolean);

  } catch (error) {
    console.error('获取数据失败:', error);
    Message.error('获取数据失败');
  }
};


const handleShowPaster = (event,item) => {
  event.stopPropagation(); // 阻止事件冒泡
  emit('show-marks', { type: item.paster_type, path: item.paster_path })
}
const handleStop = () => {
  emit('smartscene', { action: 'pause' })
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
  background-color: rgba(250, 235, 215, 0.253);
  margin-top:15px;
  border-radius: 8px;

}

.canvas {
  width: calc(1080px / 4);
  height: calc(1920px /4);
  border-radius: 10px;

}

.image-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  padding: 16px;
}

.image-item {
  background: #fff;
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.image-container {
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-radius: 4px;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-info {
  margin-top: 8px;
}

</style>

<!-- 
"security": {
      "csp": {
        "default-src": ["'self'"],
        "img-src": ["'self'", "asset:", "https://asset.localhost"],
        "media-src": ["'self'", "asset:", "https://asset.localhost"]
      },
      "assetProtocol": {
        "enable": true,
        "scope": ["**"]
      }
    }
-->