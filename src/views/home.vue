<template>
  <div class="home-container">
    <div class="debug-panel">
      <h3>Debug Events</h3>
      <div class="debug-logs">
        <div v-for="(log, index) in debugLogs" :key="index" class="log-item">
          {{ log }}
        </div>
      </div>
      <div class="debug-status">
        <p>监听器状态: {{ listenerStatus }}</p>
        <p>最后更新时间: {{ lastUpdateTime }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';

const debugLogs = ref([]);
const listenerStatus = ref('未初始化');
const lastUpdateTime = ref('无');
let debugEventUnlisten = null;

const requestData = {
  "model": "ep-20250127160955-q86q2",
  "messages": [
    {
      "content": "你可以做啥",
      "role": "user"
    }
  ],
  "max_tokens": 4096,
  "stream": true,
  "prompt": "你是一个专业的 AI 文档助手",
  "n": 1,
  "frequency_penalty": 0,
  "presence_penalty": 0,
  "repetition_penalty": 1,
  "temperature": 1,
  "top_p": 0.1,
  "top_k": 10,
  "min_p": 0.1,
};

// 添加日志的辅助函数
function addLog(message) {
  const timestamp = new Date().toLocaleTimeString();
  debugLogs.value.push(`[${timestamp}] ${message}`);
  lastUpdateTime.value = timestamp;
  // 保持最新的100条日志
  if (debugLogs.value.length > 100) {
    debugLogs.value.shift();
  }
}

// 监听debug事件
async function setupDebugEventListener() {
  try {
    addLog('开始设置debug事件监听器');
    listenerStatus.value = '正在初始化';
    
    debugEventUnlisten = await listen('debug-event', (event) => {
      addLog('收到新的事件数据');
      
      try {
        let displayData;
        if (typeof event.payload === 'string') {
          try {
            // 尝试解析JSON字符串
            const parsed = JSON.parse(event.payload);
            displayData = JSON.stringify(parsed, null, 2);
          } catch {
            // 如果不是JSON，直接显示字符串
            displayData = event.payload;
          }
        } else {
          // 如果是对象，格式化显示
          displayData = JSON.stringify(event.payload, null, 2);
        }
        
        addLog(`事件数据: ${displayData}`);
      } catch (parseError) {
        addLog(`事件数据解析错误: ${parseError.message}`);
      }
    });
    
    listenerStatus.value = '监听中';
    addLog('debug事件监听器设置成功');
  } catch (error) {
    listenerStatus.value = '初始化失败';
    addLog(`设置监听器失败: ${error.message}`);
    console.error('设置debug事件监听器失败:', error);
  }
}

// 启动流式请求
async function startDebugStream() {
  try {
    addLog('开始发起流式请求');
    await invoke('fetchstream', {
      url: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 8654bf2d-b682-477d-b74e-a6dcb1f0e2e7'
      },
      body: JSON.stringify(requestData),
    });
    addLog('流式请求发起成功');
  } catch (error) {
    addLog(`流式请求失败: ${error.message}`);
    console.error('启动debug流失败:', error);
  }
}

onMounted(async () => {
  addLog('组件已挂载');
//   await setupDebugEventListener();
//   await startDebugStream();
});

onUnmounted(() => {
  if (debugEventUnlisten) {
    debugEventUnlisten();
    addLog('事件监听器已清理');
  }
});
</script>

<style scoped>
.home-container {
  padding: 20px;
}

.debug-panel {
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 16px;
  height: 400px;
  overflow-y: auto;
}

.debug-logs {
  font-family: monospace;
  margin-bottom: 16px;
}

.log-item {
  padding: 4px 8px;
  border-bottom: 1px solid #e0e0e0;
  white-space: pre-wrap;
  word-break: break-all;
}

.log-item:hover {
  background-color: #e8e8e8;
}

.debug-status {
  margin-top: 16px;
  padding: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
}

.debug-status p {
  margin: 4px 0;
  font-family: monospace;
}
</style>