<template>
  <div class="chat-container">
    <div class="message-content">{{ contentBuffer }}</div>
  </div>
</template>

<script setup>
import { ref, shallowRef } from 'vue';
import { streamRequest } from '@/utils/streamRequest';

const contentBuffer = shallowRef('');
let batchContent = '';
let updateTimer = null;

const apiUrl = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
const apiKey = '8654bf2d-b682-477d-b74e-a6dcb1f0e2e7';

function scheduleUpdate(content) {
  batchContent += content;
  if (!updateTimer) {
    updateTimer = setTimeout(() => {
      contentBuffer.value += batchContent;
      batchContent = '';
      updateTimer = null;
    }, 50);
  }
}
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
const fetchStreamData = async () => {
  try {
    await streamRequest(
      'https://ark.cn-beijing.volces.com/api/v3/chat/completions',  // API 地址
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 8654bf2d-b682-477d-b74e-a6dcb1f0e2e7'
        },
        body: JSON.stringify(requestData),
        stream: true  // 启用流式处理
      },
      (chunk) => {
        // 处理每个数据块
        try {
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const content = line.slice(6).trim();
              if (content === '[DONE]') return;
              
              const data = JSON.parse(content);
              scheduleUpdate(data.choices[0]?.delta?.content || '');
            }
          }
        } catch (e) {
          console.warn('解析数据块失败:', e);
        }
      }
    );
  } catch (error) {
    console.error('请求失败:', error);
  }
};

// 启动请求
fetchStreamData();
</script>

<style scoped>
.chat-container {
  padding: 20px;
}

.message-content {
  white-space: pre-wrap;
  line-height: 1.5;
}
</style>