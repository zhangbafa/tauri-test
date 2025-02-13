<template>
  <div>
    <a-tabs default-active-key="1" type="card-gutter">
      <a-tab-pane key="1">
        <template #title> <icon-home /> 主控台 </template>
        <a-space>
          <a-link :hoverable="false" style="margin-left: 10px;font-size: 10px;" href="/"><icon-left /> {{ category_name }}</a-link>
        </a-space>
       
        <div style="padding: 10px">
         
          <div style="display: flex; justify-content: space-between">
            <a-space>
              <div class="baoshi-box">
                <a-space>
                  <a-switch v-model="enableAnchor" @change="handleKaiqi" checked-color="#F53F3F"/>
                  主播AI{{ enableAnchor ? "开启" : "关闭" }}
                </a-space>
              </div>
              <div class="baoshi-box">
                <a-space>
                  <a-switch @change="handleAutoStart"  /> 自动报时
                  <icon-right />
                  <a-switch @change="handleBell"  /> 开启铃铛
                </a-space>
              </div>
              <div class="ws-box">
                <a-space>
                  <a-switch @change="handleConnentDanMu" checked-color="#00B42A"/> 连接弹幕服务
                  <icon-right />
                  直播间人数
                  <a-link :hoverable="false">{{ currentCount }}</a-link>
                </a-space>
              </div>
            </a-space>
            <a-space>
              <managementmodel v-model="selectedModels"/>
              <speechservice />
            </a-space>
          </div>
          <a-row>
            <a-col :span="24">
              <ManualBroadcast v-model="selectedModels" />
              <comment v-model="selectedModels" :commentList="hudongList" />
            </a-col>
            <a-col :span="24">
              <Log />
            </a-col>
          </a-row>
        </div>
      </a-tab-pane>
      <a-tab-pane key="2" title="主播设置">
        <Anchor :liveid="category_id"/>
      </a-tab-pane>
      <a-tab-pane key="3" title="助播设置">
        <Assistant :liveid="category_id"/>
      </a-tab-pane>
      <a-tab-pane key="4" title="衔接话术" disabled>
        <interrupt :liveid="category_id"/>
      </a-tab-pane>
      <a-tab-pane key="5" title="报时话术">
        <timeAnnouncement v-model="selectedModels" :liveid="category_id"/>
      </a-tab-pane>
      <a-tab-pane key="6" title="系统设置">
        <a-divider orientation="left">背景音乐</a-divider>
        <bgm />
        <a-divider orientation="left">铃声设置</a-divider>
        <bellsetting @update-bell-time-range="handleTimeRangeUpdate" />
        <a-divider orientation="left">报时设置</a-divider>
        <timespeakersetting
          @update-timespeaker-range="handleTimeSpeakerRangeUpdate"
        />
        <a-divider orientation="left">输出设置</a-divider>
        <outputDevice/>
      </a-tab-pane>
      <a-tab-pane key="7" title="智景">
        <div style="padding: 10px">
          <smartscene />
        </div>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup>
import {
  ref,
  reactive,
  onUnmounted,
  onMounted,
  defineAsyncComponent,
  markRaw,
} from "vue";
import { Message } from "@arco-design/web-vue";
import { useSocket } from "@/compositions/useSocket.js";
import { useForWithDelay } from "@/compositions/useForWithDelay.js";
import { useInterval } from "@/compositions/useInterval.js";
import { useAudioPlayer } from "@/compositions/useAudioPlayer.js";
import { replayText, shortText } from "@/data/shortText.js";
import outputDevice from '@/components/setting/outputDevice.vue'
// 异步加载组件
const speechservice = defineAsyncComponent(() =>
  import("@/components/speechservice/index.vue")
);
const managementmodel = defineAsyncComponent(() =>
  import("@/components/speechservice/managementmodel.vue")
);
const selectanchor = defineAsyncComponent(() =>
  import("@/components/speechservice/selectanchor.vue")
);
const ManualBroadcast = defineAsyncComponent(() =>
  import("@/components/broadcast/ManualBroadcast.vue")
);
const comment = defineAsyncComponent(() =>
  import("@/components/livecomment/comment.vue")
);
const Anchor = defineAsyncComponent(() =>
  import("@/components/script/anchor.vue")
);
const Assistant = defineAsyncComponent(() =>
  import("@/components/script/assistant.vue")
);
const interrupt = defineAsyncComponent(() =>
  import("@/components/script/interrupt.vue")
);
const timeAnnouncement = defineAsyncComponent(() =>
  import("@/components/script/timeAnnouncement.vue")
);

const bellsetting = defineAsyncComponent(() =>
  import("@/components/setting/bellsetting.vue")
);
const timespeakersetting = defineAsyncComponent(() =>
  import("@/components/setting/timespeakersetting.vue")
);
const bgm = defineAsyncComponent(() => import("@/components/setting/bgm.vue"));
const Log = defineAsyncComponent(() => import("@/components/logs/log.vue"));
const setting = defineAsyncComponent(() =>
  import("@/components/setting/bgm.vue")
);
const smartscene = defineAsyncComponent(() =>
  import("@/components/smartscene/index.vue")
);
import { useRandomPicker } from "@/compositions/useRandomPicker";
import AudioPlaylist from "@/compositions/playlist";
import dbManager from "@/db/index.js";
import LoopAudio from "@/compositions/loopAudio";
import wav01 from "@/assets/wav/01.wav";
import {setTimeParseTime} from '@/utils/index.js'
import { useRoute } from "vue-router";
import { listen,emit } from "@tauri-apps/api/event";
import { processTemplate } from '@/utils/index.js'
const params = useRoute();
const { category_id = 1, category_name = "默认直播间" } = params.query;
document.title = category_name;
const timeRange = ref([70, 90]);
const selectedModels = ref({});
const { connectWebSocket, disconnectWebSocket, hudongList, currentCount } =
  useSocket();
const { fetchSpeech } = useForWithDelay();
const { startPeriodicExecution, stopPeriodicExecution } =
  useInterval(timeRange);
const { playBlob, setVolume, setPlaybackRate,setDeviceId } = useAudioPlayer();
const text = ref("");
const loading = ref(false);

const { getRandomElement } = useRandomPicker();

const isTotalUserCount = ref(0);

const audioUrl = ref(null);  // 用于存储动态生成的音频 URL

/**
 * 自动报时 和 铃铛
 */
// 停止报时
const handleStop = () => {};
// 开始报时
const timeScript = ref([])
const handleAutoStart = async (e) => {
  if(!selectedModels.value?.report_model){
      Message.error('没有选择模型')
      return false
  }
  timeScript.value = await dbManager.query('select * from time_script')
  loading.value = true;
  if (e) {
    startPeriodicExecution("", currentCount.value, async (item) => {
      const temp = getRandomElement(timeScript.value);
      // console.log(temp)
      // todo 添加报直播间人数
      let totalUserCount = "";
      if (
        currentCount.value >= isTotalUserCount.value &&
        isTotalUserCount.value > 0
      ) {
        totalUserCount = `直播间有${currentCount.value}位家人,`;
      }
      const tempText = processTemplate(temp.content)
      const text = `${setTimeParseTime()},${totalUserCount}${tempText}`;
      //添加变量
      emit('addLog',{time:new Date().toLocaleString(),role:'系统',logtext:'报时：'+text})
     
      const audioBlob = await fetchSpeech(
        text,
        selectedModels.value.report_model
      );
      await playBlob(audioBlob);
    });
  } else {
    stopPeriodicExecution();
    emit('addLog',{time:new Date().toLocaleString(),role:'系统',logtext:'关闭定时报时'})
    loading.value = false;
  }
};

// 铃铛
const bellAudio = new LoopAudio(wav01, [40, 50]);
const handleBell = async (e) => {
  if (e) {
    // console.log('开启铃铛')
    bellAudio.start();
    emit('addLog',{time:new Date().toLocaleString(),role:'系统',logtext:'播放铃铛声音'})
  } else {
    // console.log('关闭铃铛')
    bellAudio.stop();
    emit('addLog',{time:new Date().toLocaleString(),role:'系统',logtext:'关闭铃铛'})
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
  if (e) {
    connectWebSocket();
    emit('addLog',{time:new Date().toLocaleString(),role:'系统',logtext:'成功连接弹幕服务'})
  } else {
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
  console.log('start')
  try {
    // 开始加载
    isAudioLoading.value = true;

    // 从数据库获取脚本
    const list = await fetchAnchorList()
    // 创建播放列表
    audioList.value = new AudioPlaylist(list);
    // 加载完成
    isAudioLoading.value = false;
  } catch (error) {
    // 错误处理
    console.error("初始化音频播放列表失败:", error);
    audioError.value = error;
    isAudioLoading.value = false;
  }
};

const handleKaiqi = () => {
  // 安全播放
  if (enableAnchor.value) {
    if (audioList.value) {
      audioList.value.play(selectedModels.value.anchor_model ?? 0);
    } else {
      console.warn("音频播放列表未初始化");
    }
  } else {
    console.log("主播停止");
    audioList.value.stop();
  }
};
const fetchAnchorList= async ()=>{
  const result = await dbManager.query(
    "select * from anchor_script where category_id = ?",
    [category_id]
  );

  // 智能提取文本内容
  const list = result
    .map((item) =>
      typeof item === "object" ? item.text || item.content || "" : item
    )
    .filter((text) => text.trim() !== "");
  return list
}
// 刷新主播话术


let unlisten;
let unrefreshTimeAnnouncementList;
let unanchorVolume;
let unsetSinkId
(async ()=>{
    unlisten = await listen("refreshAnchorList", async () => {
      const list = await fetchAnchorList()
      audioList.value.updateList(list);
      Message.success('主播刷术刷新成功')
    });
    unrefreshTimeAnnouncementList = await listen("refreshTimeAnnouncementList", async () => {
      timeScript.value = await dbManager.query('select * from time_script')
      Message.success('报时刷术刷新成功')
    });
    unanchorVolume=await listen('setAnchorVolume',async (event)=>{
      audioList.value.setVolume(event.payload.volume)
    })

    unsetSinkId=await listen('setSinkId',async (event)=>{
      const deviceId = event.payload.sinkid
      // 设置主播ai
      audioList.value.setSinkId(deviceId)
      // 设置报时
      setDeviceId(deviceId)
      // 设置铃铛
      bellAudio.setSinkId(deviceId);
      // 设置背景音乐

    })

})()

// 组件挂载时自动初始化
onMounted(initializeAudioPlaylist);
onUnmounted(() => {
  audioList.value?.destroy();
  if(unlisten) unlisten();
  if(unrefreshTimeAnnouncementList) unrefreshTimeAnnouncementList();
  if(unanchorVolume) unanchorVolume()
  if(unsetSinkId) unsetSinkId()
});
</script>

<style>
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
