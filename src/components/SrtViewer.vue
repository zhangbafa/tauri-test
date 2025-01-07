<template>
  <div class="srt-viewer">
    <div v-for="subtitle in subtitles" :key="subtitle.id" class="subtitle-item">
      <div class="time">{{ formatTime(subtitle.startTime) }} --> {{ formatTime(subtitle.endTime) }}</div>
      <div class="text">{{ subtitle.text }}</div>
      <label>
        <input type="checkbox" v-model="subtitle.selected" @change="updateSelection">
        选择此片段
      </label>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
  srtContent: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['selectionChange']);

const subtitles = ref([]);

// 解析 SRT 时间格式
function parseTime(timeStr) {
  const [hours, minutes, seconds] = timeStr.split(':');
  const [secs, ms] = seconds.split(',');
  return parseFloat(hours) * 3600 + parseFloat(minutes) * 60 + parseFloat(secs) + parseFloat(ms) / 1000;
}

// 格式化时间为 SRT 格式
function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
}

// 解析 SRT 内容
function parseSrt(content) {
  const blocks = content.trim().split('\n\n');
  return blocks.map(block => {
    const lines = block.split('\n');
    const id = parseInt(lines[0]);
    const [startTime, endTime] = lines[1].split(' --> ').map(parseTime);
    const text = lines.slice(2).join('\n');
    return {
      id,
      startTime,
      endTime,
      text,
      selected: false
    };
  });
}

// 更新选择并发出事件
function updateSelection() {
  const selectedSegments = subtitles.value
    .filter(sub => sub.selected)
    .map(sub => ({
      start: sub.startTime,
      end: sub.endTime
    }));
  emit('selectionChange', selectedSegments);
}

// 初始化
onMounted(() => {
  subtitles.value = parseSrt(props.srtContent);
});
</script>

<style scoped>
.srt-viewer {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.subtitle-item {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #f9f9f9;
}

.time {
  color: #666;
  font-family: monospace;
  margin-bottom: 8px;
}

.text {
  font-size: 16px;
  margin-bottom: 8px;
}

label {
  display: block;
  margin-top: 8px;
  color: #2c3e50;
}

input[type="checkbox"] {
  margin-right: 8px;
}
</style>
