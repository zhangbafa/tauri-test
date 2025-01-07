<script setup>
import { ref } from 'vue'
import { invoke } from "@tauri-apps/api/core"
import SrtViewer from './components/SrtViewer.vue'

const greetMsg = ref("")
const name = ref("")
const srtContent = ref('')
const selectedSegments = ref([])


async function handle_parse_srt() {
  try {
    const result = await invoke('handle_parse_srt');
    console.log('处理结果:', result);
  } catch (error) {
    console.error('处理失败:', error);
  }
}
async function processAudio(inputPath, segments, outputPath) {
  try {
    const result = await invoke('process_audio_segments', {
      inputPath,
      segments,
      outputPath
    });
    console.log('处理结果:', result);
  } catch (error) {
    console.error('处理失败:', error);
  }
}

// 处理字幕选择变化
function handleSelectionChange(segments) {
  selectedSegments.value = segments;
}

// 处理音频剪辑
function handleProcessAudio() {
 
}

processAudio(
      'E:/0101/1.mp3',
      [{start: 0, end: 5}, {start: 6, end: 9}],
      'E:/0101/111.MP3'
    );
    handle_parse_srt('E:/0101/111.MP3')
</script>

<template>
 <div v-for="item in srtContent" :key="item.id" style="width: 100%;">
        {{item}}
      </div>
  <div class="container">
    <h1>音频剪辑工具</h1>
    
    <div class="card">
      
     
      <div class="actions">
        <button
          class="process-button"
          @click="handleProcessAudio"
        >
          处理选中片段
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  margin: 0;
  padding: 2rem;
  text-align: center;
}

.card {
  padding: 2rem;
}

.actions {
  margin-top: 2rem;
}

.process-button {
  padding: 0.7em 1.4em;
  margin: 0 0.3em 0.3em 0;
  border-radius: 0.15em;
  box-sizing: border-box;
  text-decoration: none;
  font-family: 'Roboto',sans-serif;
  text-transform: uppercase;
  font-weight: 400;
  color: #FFFFFF;
  background-color: #3369ff;
  box-shadow: inset 0 -0.6em 0 -0.35em rgba(0,0,0,0.17);
  text-align: center;
  position: relative;
  cursor: pointer;
  border: none;
}

.process-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.process-button:active:not(:disabled) {
  top: 0.1em;
}
</style>
