<template>
  <div style="position: relative;">
    <div style="position: absolute;top:0;right:0;z-index: 10;margin-top: 4px;">
      <a-space>
        <a-link :hoverable="false" style="margin-left: 10px;font-size: 12px;" href="/"><icon-left /> {{ category_name
        }}</a-link>
        <span style="font-size:12px">软件有效期至: 2025-10-10</span>
      </a-space>
    </div>
    <a-tabs default-active-key="1" type="line" size="large">
      <a-tab-pane key="1" style="height: 95vh;overflow-y: auto;">
        <template #title> <icon-home /> 主控台 </template>
        <div style="padding: 20px 10px">

          <div style="display: flex; justify-content: space-between;padding: 10px">
            <a-space>
              <div class="baoshi-box">
                <a-space>
                  <a-switch v-model="enableAnchor" @change="handleKaiqi" checked-color="#F53F3F" />
                  主播AI{{ enableAnchor ? "开启" : "关闭" }}
                </a-space>
              </div>
              <AssistantAI @update-bell-volume="handleUpdateBellVolume" @update-baoshi-volume="handleUpdateBaoshiVolume" :liveid="category_id"/>
              <div class="baoshi-box">
                <a-space>
                  <a-switch @change="handleAutoStart" /> 自动报时
                  <a-divider direction="vertical" />
                  <a-switch @change="handleBell" /> 开启铃铛
                </a-space>
              </div>
              <div class="ws-box">
                <a-space>
                  <a-switch @change="handleConnentDanMu" checked-color="#00B42A" /> 连接弹幕服务
                  <a-divider direction="vertical" />
                  直播间人数
                  <a-link :hoverable="false">{{ currentCount }}</a-link>
                  <a-divider direction="vertical" />
                  累计观看人数
                  <a-link :hoverable="false"> {{ totalViewersCount }}</a-link>
                </a-space>
              </div>
            </a-space>
            <a-space>
              <speechservice />
            </a-space>
          </div>
          <a-row>
            <a-col :span="24">
              <a-row :gutter="20">
                <a-col :span="10">
                  <a-divider orientation="left">插入播报</a-divider>
                  <ManualBroadcast v-model="selectedModels" />
                  <a-divider orientation="left">选择设备</a-divider>
                  <outputDevice />
                  <a-divider orientation="left">调音器</a-divider>
                  <outputIndex />
                  <a-divider orientation="left"></a-divider>
                  <a-space>
                    <managementmodel v-model="selectedModels" />
                    <rotationReportModel v-model="selectedModels"/>
                  </a-space>
                </a-col>
                <a-col :span="14">
                  <a-card title="互动消息" style="margin:20px 0;height: 58vh;">
                    <template #extra>
                      <a-space>
                        <a-checkbox-group :default-value="['2','3','5']" v-model="filetercomment" @change="handleFilterComment">
                        <a-checkbox :value="5">礼物</a-checkbox>
                        <a-checkbox :value="2">点赞</a-checkbox>
                        <a-checkbox :value="3">进入直播间</a-checkbox>
                      </a-checkbox-group>
                        <a-divider direction="vertical" />
                        <a-checkbox v-model="savelivecomment" @change="handleSaveLiveComment">保存评论</a-checkbox>
                        <a-link @click="handleOpenCommentTXT">打开文件</a-link>
                      </a-space>
                    </template>
                    <comment v-model="selectedModels" :commentList="hudongList" />
                  </a-card>
                </a-col>
              </a-row>
            </a-col>
            <a-col :span="24">
              <Log />
            </a-col>
          </a-row>
        </div>
      </a-tab-pane>
      <a-tab-pane key="2" title="主播设置" style="height: 95vh;overflow-y: auto;">
        <Anchor :liveid="category_id" />
      </a-tab-pane>
      <a-tab-pane key="3" title="助播设置" style="height: 95vh;overflow-y: auto;">
        <Assistant :liveid="category_id" />
      </a-tab-pane>
      <a-tab-pane key="4" title="衔接话术" disabled style="height: 95vh;overflow-y: auto;">
        <interrupt :liveid="category_id" />
      </a-tab-pane>
      <a-tab-pane key="5" title="报时话术" style="height: 95vh;overflow-y: auto;">
        <timeAnnouncement v-model="selectedModels" :liveid="category_id" />
      </a-tab-pane>
      <a-tab-pane key="6" title="系统设置" style="height: 95vh;overflow-y: auto;">
        <a-divider orientation="left">铃声设置</a-divider>
        <bellsetting @update-bell-time-range="handleTimeRangeUpdate" />
        <a-divider orientation="left">报时设置</a-divider>
        <timespeakersetting @update-timespeaker-range="handleTimeSpeakerRangeUpdate" />
        <a-divider orientation="left">背景音乐</a-divider>
        <bgm />
      </a-tab-pane>
      <a-tab-pane key="7" title="智景播放器" style="height: 95vh;overflow-y: auto;">
        <div style="padding: 10px">
          <smartscene :liveid="category_id"/>
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
  onBeforeUnmount
} from "vue";
import { Message } from "@arco-design/web-vue";
import { useSocket } from "@/compositions/useSocket.js";
import { useForWithDelay } from "@/compositions/useForWithDelay.js";
import { useInterval } from "@/compositions/useInterval.js";
import { useAudioPlayer } from "@/compositions/useAudioPlayer.js";
import outputDevice from '@/components/devices/outputDevice.vue'
import outputIndex from '@/components/devices/index.vue'
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
const AssistantAI = defineAsyncComponent(() =>
  import("@/components/assistant.vue")
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
const rotationReportModel = defineAsyncComponent(() => import("@/components/rotation/reportmodel.vue"))
import { useRandomPicker } from "@/compositions/useRandomPicker";
import AudioPlaylist from "@/compositions/playlist";
import dbManager from "@/db/index.js";
import LoopAudio from "@/compositions/loopAudio";
import wav01 from "@/assets/wav/01.wav";
import { setTimeParseTime } from '@/utils/index.js'
import { useRoute } from "vue-router";
import { listen, emit } from "@tauri-apps/api/event";
import { processTemplate } from '@/utils/index.js'
const params = useRoute();
const { category_id = 1, category_name = "默认直播间" } = params.query;
document.title = category_name;
const timeRange = ref([70, 90]);
const selectedModels = ref({anchor_model: '0', assistant_model: '0', report_model: '1'});
const { connectWebSocket, disconnectWebSocket, hudongList, currentCount, totalViewersCount, filterCommentList, setSaveComment } =
  useSocket(category_name);
const { fetchSpeech } = useForWithDelay();
const { startPeriodicExecution, stopPeriodicExecution } =
  useInterval(timeRange);
const { playBlob, setVolume, setPlaybackRate, setDeviceId } = useAudioPlayer();
const text = ref("");
const loading = ref(false);

const { getRandomElement } = useRandomPicker();

const isTotalUserCount = ref(0);

const audioUrl = ref(null);  // 用于存储动态生成的音频 URL

/**
 * 自动报时 和 铃铛
 */
// 停止报时
const handleStop = () => { };
import { convertFileSrc } from '@tauri-apps/api/core'
// 开始报时
const timeScript = ref([])
const handleAutoStart = async (e) => {
  if (!selectedModels.value?.report_model) {
    Message.error('没有选择模型')
    return false
  }
  timeScript.value = await dbManager.query(`select * from time_script where category_id=${category_id}`)
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
      emit('addLog', { time: new Date().toLocaleString(), role: '系统', logtext: '报时：' + text })      
      const audioBlob = await fetchSpeech(
        text,
        selectedModels.value.report_model
      );
      // 显示当前话术配置的贴片
      emit('show-marks',{type:temp.paster_type,path:convertFileSrc(temp.paster_path)})
      console.log({type:temp.paster_type,path:temp.paster_path})
      await playBlob(audioBlob);
    });
  } else {
    stopPeriodicExecution();
    emit('addLog', { time: new Date().toLocaleString(), role: '系统', logtext: '关闭定时报时' })
    loading.value = false;
  }
};

// 铃铛
const bellAudio = new LoopAudio(wav01, [40, 50]);
const handleBell = async (e) => {
  if (e) {
    // console.log('开启铃铛')
    bellAudio.start();
    emit('addLog', { time: new Date().toLocaleString(), role: '系统', logtext: '播放铃铛声音' })
  } else {
    // console.log('关闭铃铛')
    bellAudio.stop();
    emit('addLog', { time: new Date().toLocaleString(), role: '系统', logtext: '关闭铃铛' })
  }
};
// 更新铃铛时间范围
const handleTimeRangeUpdate = (range, volume, playbackRate) => {
  bellAudio.updateTimeRange(range, volume, playbackRate);
};
// 修改铃铛的音量
const handleUpdateBellVolume=(volume)=>{
  bellAudio.setVolume(volume)
}

// 修改报时音量
const handleUpdateBaoshiVolume=(volume)=>{
  setVolume(volume);
}
// 更新报时语速、音量
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
    emit('addLog', { time: new Date().toLocaleString(), role: '系统', logtext: '成功连接弹幕服务' })
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
const fetchAnchorList = async () => {
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
(async () => {
  unlisten = await listen("refreshAnchorList", async () => {
    const list = await fetchAnchorList()
    audioList.value.updateList(list);
    Message.success('主播刷术刷新成功')
  });
  unrefreshTimeAnnouncementList = await listen("refreshTimeAnnouncementList", async () => {
    timeScript.value = await dbManager.query('select * from time_script where category_id=?',[category_id])
    Message.success('报时刷术刷新成功')
  });
  unanchorVolume = await listen('setAnchorVolume', async (event) => {
    audioList.value.setVolume(event.payload.volume)
  })

  unsetSinkId = await listen('setSinkId', async (event) => {
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

//启动服务
import { useChildProcess } from '@/compositions/useChildProcess'
// 开启、关闭http服务
const { startHttpServer, checkServerStatus, stopHttpServer } = useChildProcess()
const handleCheck = async () => {
  const is_running = await checkServerStatus()
  console.log(is_running)
}
const handleStopAI = async () => {
  await stopHttpServer()
}
const startAIService = async (e) => {
  const is_running = await checkServerStatus()
  if (is_running) {
    // Message.info('正在关闭 AI 服务')
    emit('addLog', { time: new Date().toLocaleString(), role: '系统', logtext: 'AI 服务已经启动，无需启动' })
    return false
  }
  emit('addLog', { time: new Date().toLocaleString(), role: '系统', logtext: '正在启动 AI 服务' })
  try {
    await startHttpServer()
    let timer = null
    timer = setInterval(async () => {
      const result = await checkServerStatus()
      if (result) {
        clearInterval(timer)
        Message.info('启动成功')
        emit('addLog', { time: new Date().toLocaleString(), role: '系统', logtext: 'AI 服务启动成功' })
        return true
      }
    }, 1000)

  } catch (error) {
    Message.info('服务启动失败')
    emit('addLog', { time: new Date().toLocaleString(), role: '系统', logtext: 'AI 服务启动失败' })
  }
}
// 组件挂载时自动初始化
onMounted(() => {
  initializeAudioPlaylist()
  // startAIService()
  if (import.meta.env.DEV) { }
});
onBeforeUnmount(async () => {
  // await stopHttpServer()
})
onUnmounted(() => {
  audioList.value?.destroy();
  if (unlisten) unlisten();
  if (unrefreshTimeAnnouncementList) unrefreshTimeAnnouncementList();
  if (unanchorVolume) unanchorVolume()
  if (unsetSinkId) unsetSinkId()

});

/**
 * 弹幕处理开始
 */

// 保存弹幕
const savelivecomment = ref(false)
const filetercomment = ref([2,3,5])
// openDirectory
import { useFS } from '@/compositions/useFS.js'
const { openDirectory, createIfNotExists, generateDateTimeFilename } = useFS()
let commentFilename;
const handleSaveLiveComment = async (e) => {
  commentFilename = generateDateTimeFilename()
  await createIfNotExists(category_name)
  setSaveComment(`${category_name}/${commentFilename}`, e)
}
const handleOpenCommentTXT = async () => {
  const result = await openDirectory(category_name, `${commentFilename}`)
  if (!result) Message.error('打开错误')
}

const handleFilterComment=(value)=>{
  console.log(filetercomment.value)
  filterCommentList(value)
}
/**
 * 弹幕处理结束
 */
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

.arco-tabs-content {
  padding-top: 0
}
</style>
