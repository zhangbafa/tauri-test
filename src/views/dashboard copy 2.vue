<template>
  <div>
    <!-- {{ category_id }} - {{ category_name }} -->
    <a-row>
      <a-col :span="24">
        <a-card title="">
          <div style="display: flex; justify-content: space-between">
            <a-space>
                <div class="baoshi-box">
                <a-space>
                    <a-switch v-model="enableAnchor" @change="handleKaiqi" /> 主播AI{{
                enableAnchor ? "开启" : "关闭"
              }}
              <a-switch v-model="enableAnchor" @change="handleKaiqi" /> 助播AI{{
                enableAnchor ? "开启" : "关闭"
              }}
                </a-space>
              </div>
              <div class="baoshi-box">
                <a-space>
                  <a-switch @change="handleAutoStart" /> 自动报时
                  <icon-right />
                  <a-switch @change="handleBell" /> 开启铃铛
                </a-space>
              </div>
              <div class="ws-box">
                <a-space>
                  <a-switch @change="handleConnentDanMu" /> 连接弹幕服务
                  <icon-right />
                  直播间人数
                  <a-link>{{ currentCount }}</a-link
                  >
                </a-space>
              </div>
            </a-space>
            <a-space>
              <!-- <selectanchor v-model="selectedModels" />
              <icon-right /> -->
              <managementmodel/>
              <speechservice />
            </a-space>
          </div>
          <a-divider />
          <a-space>
            <a-button type="primary" @click="handleSetAnchor" status="primary"
              >配置主播话术</a-button
            >
            <a-button type="primary" @click="handleSetAnchor" status="primary"
              >配置助播话术</a-button
            >
            <a-button type="primary" @click="handleSetAnchor" status="primary"
              >配置衔接话术</a-button
            >
            <a-button type="primary" @click="handleSetSYS" status="primary"
              >系统设置</a-button
            >
          </a-space>
        </a-card>
      </a-col>
      <a-col :span="24">
        <ManualBroadcast v-model="selectedModels" />
        <comment v-model="selectedModels" :commentList="hudongList" />
      </a-col>
      <a-col :span="24" style="margin-top: 20px; position: relative">
        <a-button
          type="primary"
          style="position: absolute; left: 500px; top: -2px; z-index: 10"
          size="small"
          @click="handleRefresh"
          >刷新主播话术</a-button
        >
        <a-tabs default-active-key="1" type="card-gutter">
          <a-tab-pane key="1" title="主播话术">
            <template #title>🔴 主播话术</template>
            <anchor />
          </a-tab-pane>
          <a-tab-pane key="2">
            <template #title>🟩 助播话术</template>
            <assistant />
          </a-tab-pane>
          <a-tab-pane key="3" title="🔶 衔接话术">
            <interrupt />
          </a-tab-pane>
          <a-tab-pane key="4" title="1️⃣ 设置">
            <bellsetting @update-time-range="handleTimeRangeUpdate" />
            <a-divider />
            <timespeakersetting
              @update-timespeaker-range="handleTimeSpeakerRangeUpdate"
            />
            <a-divider />
            <bgm />
          </a-tab-pane>
        </a-tabs>
      </a-col>
      <a-col :span="20"> </a-col>
    </a-row>
    <a-modal title-align="start" :footer="false"  width="100%" v-model:visible="visible" @ok="handleOK" @cancel="handleCancel">
        <template #title>
            模型管理
        </template>
        <anchor />
    </a-modal>
  </div>
</template>

<script setup>
import {
  ref,
  reactive,
  onUnmounted,
  onMounted,
  defineAsyncComponent,
} from "vue";
import { Message } from "@arco-design/web-vue";
import { useSocket } from "@/compositions/useSocket.js";
import { useForWithDelay } from "@/compositions/useForWithDelay.js";
import { useInterval } from "@/compositions/useInterval.js";
import { useAudioPlayer } from "@/compositions/useAudioPlayer.js";
import { replayText, shortText } from "@/data/shortText.js";
import speechservice from "@/components/speechservice/index.vue";
import managementmodel from "@/components/speechservice/managementmodel.vue";
import selectanchor from "@/components/speechservice/selectanchor.vue";
import ManualBroadcast from "@/components/broadcast/ManualBroadcast.vue";
import comment from "@/components/livecomment/comment.vue";
import anchor from "@/components/script/anchor.vue";
// import assistant from '@/components/script/assistant.vue'
import interrupt from "@/components/script/interrupt.vue";
import bellsetting from "@/components/setting/bellsetting.vue";
import timespeakersetting from "@/components/setting/timespeakersetting.vue";
import wav01 from "@/assets/wav/01.wav";
import wav02 from "@/assets/wav/02.wav";
import wav03 from "@/assets/wav/03.wav";
import LoopAudio from "@/compositions/loopAudio";
import { useRandomPicker } from "@/compositions/useRandomPicker";
import AudioPlaylist from "@/compositions/playlist";
import bgm from "../components/setting/bgm.vue";
import dbManager from "@/db/index.js";
const assistant = defineAsyncComponent(() =>
  import("@/components/script/assistant.vue")
);
import { useRoute } from 'vue-router'
const visible = ref(false)
const handleSetAnchor = (e) => {
  console.log(e);
  visible.value = true
};
const params = useRoute()
const {category_id,category_name} = params.query
document.title = category_name
const timeRange = ref([70, 90]);
const selectedModels = ref({});
const {
  connectWebSocket,
  disconnectWebSocket,
  msgList,
  giftList,
  hudongList,
  currentCount,
} = useSocket();
const { fetchSpeech, setTimeParseTime, processUsername } = useForWithDelay();
const { startPeriodicExecution, stopPeriodicExecution } =
  useInterval(timeRange);
const { playBlob, close, playing, setVolume, setPlaybackRate } =
  useAudioPlayer();
const text = ref("");
const loading = ref(false);

const { getRandomElement, shuffleArray, createCyclicPicker } =
  useRandomPicker();

const isTotalUserCount = ref(0);
import { listen } from "@tauri-apps/api/event";

listen("custom-event", (event) => {
  //volume
  console.log(event.payload);
  if (event.payload.action === "volume") {
    document.querySelector("video").volume = event.payload.volume;
  }
});
/**
 * 自动报时 和 铃铛
 */
// 停止报时
const handleStop = () => {};
// 开始报时
const handleAutoStart = async (e) => {
  loading.value = true;
  if (e) {
    startPeriodicExecution("", currentCount.value, async (item) => {
      const temp = getRandomElement(shortText);
      console.log(typeof isTotalUserCount.value, isTotalUserCount.value);
      console.log(typeof currentCount.value, currentCount.value);
      // todo 添加报直播间人数
      let totalUserCount = "";
      if (
        currentCount.value >= isTotalUserCount.value &&
        isTotalUserCount.value > 0
      ) {
        totalUserCount = `直播间有${currentCount.value}位家人,`;
      }
      const text = `${setTimeParseTime()},${totalUserCount}${temp.text}`;
      const audioBlob = await fetchSpeech(text, selectedModels.value.report_model??0);
      await playBlob(audioBlob);
    });
  } else {
    stopPeriodicExecution();
    loading.value = false;
  }
};

// 铃铛
const bellAudio = new LoopAudio(wav01, [40, 50]);
const handleBell = (e) => {
  if (e) {
    // console.log('开启铃铛')
    bellAudio.start();
  } else {
    // console.log('关闭铃铛')
    bellAudio.stop();
  }
};
// 更新铃铛时间范围
const handleTimeRangeUpdate = (range, volume, playbackRate) => {
  bellAudio.updateTimeRange(range, volume, playbackRate);
};
// 更新报时语速
const handleTimeSpeakerRangeUpdate = (
  range,
  volume,
  playbackRate,
  totalUserCount
) => {
  // console.log(range)
  timeRange.value = range;
  setVolume(volume);
  setPlaybackRate(playbackRate);
  isTotalUserCount.value = Number(totalUserCount);
};

// 链接WS
const handleConnentDanMu = (e) => {
  if(e){
    connectWebSocket();
  }else{
    disconnectWebSocket(false);
  }
  
};


onUnmounted(() => {
  bellAudio.destroy();
  disconnectWebSocket(false);
  currentCount.value = 0;
});

/**
 * 主播
 */
const audioList = ref(null); // 音频列表引用
const isAudioLoading = ref(false); // 加载状态
const audioError = ref(null); // 错误追踪
const enableAnchor = ref(false);
const initializeAudioPlaylist = async () => {
  try {
    // 开始加载
    isAudioLoading.value = true;

    // 从数据库获取脚本
    const a = await dbManager.query(
      "select * from anchor_script where category_id = 1"
    );

    // 智能提取文本内容
    const textContent = a
      .map((item) =>
        typeof item === "object" ? item.text || item.content || "" : item
      )
      .filter((text) => text.trim() !== "");
    // console.log(textContent)
    // 创建播放列表
    audioList.value = new AudioPlaylist(textContent);

    // 加载完成
    isAudioLoading.value = false;
  } catch (error) {
    // 错误处理
    console.error("初始化音频播放列表失败:", error);
    audioError.value = error;
    isAudioLoading.value = false;
  }
};
const handleRefresh = () => {
  initializeAudioPlaylist();
  Message.success("刷新成功");
};
const handleKaiqi = () => {
  // 安全播放
  if (enableAnchor.value) {
    if (audioList.value) {
      audioList.value.play(selectedModels.value.anchor_model??0);
    } else {
      console.warn("音频播放列表未初始化");
    }
  } else {
    audioList.value.stop();
  }
};

// 组件挂载时自动初始化
onMounted(initializeAudioPlaylist);
</script>

<style>
/* 在线链接服务仅供平台体验和调试使用，平台不承诺服务的稳定性，企业客户需下载字体包自行发布使用并做好备份。 */
@font-face {
  font-family: "alimamashuheiti";
  font-weight: 700;
  src: url("//at.alicdn.com/wf/webfont/jgGjJ3ckKOwU/qs5jF7pijLq6.woff2")
      format("woff2"),
    url("//at.alicdn.com/wf/webfont/jgGjJ3ckKOwU/yiZ8TgvmFleE.woff")
      format("woff");
  font-display: swap;
}

.ws-box {
  background-color: var(--color-fill-1);
  border: 1px solid var(--color-fill-3);
  padding: 10px;
  border-radius: 5px;
}

.baoshi-box {
  background-color: var(--color-fill-1);
  border: 1px solid var(--color-fill-3);
  padding: 10px;
  border-radius: 5px;
}
</style>
