<template>
  <div id="output">
{{ contentBuffer }}

  </div>
</template>

<script setup>
import { ref, onMounted,shallowRef } from 'vue'
import dbManager from '@/db/index.js'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { fetch as getfetch } from '@tauri-apps/plugin-http'
import { marked } from 'marked'
import { corsRequest } from '@/utils/corsRequest'
import { streamRequest } from '@/utils/streamRequest'


const apiUrl = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
const apiKey = '8654bf2d-b682-477d-b74e-a6dcb1f0e2e7';

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
const contentBuffer = shallowRef('')
let batchContent = ''
let updateTimer = null
function scheduleUpdate(content) {
    batchContent += content
    // contentBuffer.value += content
    if (!updateTimer) {
      updateTimer = setTimeout(() => {
        contentBuffer.value += batchContent
        batchContent = ''
        updateTimer = null
      }, 50)
    }
  }
const fetchStreamData = async () => {
  try {
    await streamRequest(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData),
      // signal: controller.signal 
    });

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || '请求失败')
    }
    // 处理流式数据
    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''

    const processChunk = (chunk) => {
      buffer += chunk
      console.log(buffer)
      const events = buffer.split(/\n\n/)
      buffer = events.pop() || ''

      events.forEach(event => {
        const lines = event.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const content = line.slice(6).trim()
            if (content === '[DONE]') return
            try {
              const data = JSON.parse(content)
              scheduleUpdate(data.choices[0]?.delta?.content || '')
            } catch (e) {
              console.warn('解析 JSON 失败:', e)
            }
          }
        }
      })
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      processChunk(decoder.decode(value))
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      console.log('请求被取消');
    } else {
      console.error('请求失败:', err);
      // 显示错误提示给用户
    }
  } finally {
    // controller.abort(); // 清理
  }
}

// 启动请求
fetchStreamData(apiUrl,apiKey,requestData);
</script>