<template>
    <div class="container">
        
        <div 
          
          class="markdown-content"
          ref="contentContainer"
          v-html="renderedContent"
        />
      </div>
    
  </template>
  
  <script setup>
  import { ref, shallowRef, computed, onBeforeUnmount,watch } from 'vue'
  import { marked } from 'marked'
//   import DOMPurify from 'dompurify'
//   import hljs from 'highlight.js'
  
  // 配置 Markdown 解析
  marked.setOptions({
    highlight: (code, lang) => {
      return hljs.highlightAuto(code).value
    },
    breaks: true
  })
  
  // 初始化 Hightlight.js
//   hljs.configure({
//     languages: ['javascript', 'python', 'java', 'html', 'css', 'bash']
//   })
  
  // 常量配置
 // API Key 和推理接入点 ID
const API_KEY = '8654bf2d-b682-477d-b74e-a6dcb1f0e2e7'; // 替换为你的 API Key
const MODEL_ID = 'ep-20250127160955-q86q2'; // 替换为你的推理接入点 ID
// API 地址
const API_URL = '/api';
  const BATCH_UPDATE_INTERVAL = 50 // 批处理间隔
  const requestBody = {
  model: MODEL_ID,
  messages: [
    { role: 'system', content: '你是豆包，是由字节跳动开发的 AI 人工智能助手' },
    { role: 'user', content: '世界上有哪些编程语言，他们的应用场景分别是什么' },
  ],
  stream: true, // 是否流式返回
  max_tokens: 4096, // 模型回复最大长度
  temperature: 0.8, // 采样温度
  top_p: 0.7, // 核采样概率阈值
};
  // 响应式数据
  const inputText = ref('')
  const contentBuffer = shallowRef('')
  const isLoading = ref(false)
  const errorMessage = ref('')
  const controller = ref(null)
  const contentContainer = ref(null)
  
  
  // 处理批更新
  let batchContent = ''
  let updateTimer = null
  
  function scheduleUpdate(content) {
    // batchContent += content
    contentBuffer.value += content
    // if (!updateTimer) {
    //   updateTimer = setTimeout(() => {
    //     contentBuffer.value += batchContent
    //     batchContent = ''
    //     updateTimer = null
    //   }, BATCH_UPDATE_INTERVAL)
    // }
  }
  
  // 安全渲染 Markdown
  const renderedContent = computed(() => {
    return marked.parse(contentBuffer.value)
    // return contentBuffer.value
  })
  
  // 流式请求处理
  async function sendRequest() {
    try {
      // 重置状态
      contentBuffer.value = ''
      errorMessage.value = ''
      isLoading.value = true
      controller.value = new AbortController()
  
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`
        },
        body: JSON.stringify(requestBody),
        signal: controller.value.signal
      })
  
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
        const { done, value } = await reader.read()
        if (done) break
        processChunk(decoder.decode(value))
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        errorMessage.value = `请求失败: ${err.message}`
        console.error('请求出错:', err)
      }
    } finally {
      isLoading.value = false
      controller.value = null
    }
  }
  sendRequest()
  // 自动滚动到底部
  const scrollToBottom = () => {
    if (contentContainer.value) {
      contentContainer.value.scrollTop = contentContainer.value.scrollHeight
    }
  }
  
  // 组件卸载时中止请求
  onBeforeUnmount(() => {
    if (controller.value) {
      controller.value.abort()
    }
  })
  
  // 监听内容变化自动滚动
//   watch(contentBuffer, () => {
//     nextTick(scrollToBottom)
//   })
  </script>
  
 
  
  <style>
  @import 'https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.8.1/github-markdown.min.css';

</style>