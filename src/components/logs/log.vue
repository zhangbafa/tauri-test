<template>
  <div style="margin-top: 10px;">
    <a-table
      :columns="columns"
      :bordered="{wrapper: true, cell: true}"
      :data="data"
      :virtual-list-props="{ height: 200 }"
      :pagination="false"
      :scroll="{ x: 0 }"
    />
  </div>
</template>

<script setup>
import { ref,reactive,onMounted,onUnmounted} from "vue";
import { listen, emit } from "@tauri-apps/api/event";

const columns = [
  {
    title: "时间",
    dataIndex: "time",
    width: 190,
  },
  {
    title: "角色",
    dataIndex: "role",
    width: 100,
  },
  {
    title: "日志",
    dataIndex: "logtext",
    ellipsis: true,
  },
];
const data = ref([]);

function addLogWithLimit(newLog, maxCount = 100) {
  data.value.unshift(newLog); // 添加新日志
  if (data.value.length > maxCount) {
    data.value.splice(maxCount); // 保留最新的 maxCount 条
  }
}
let unlisten
listen("addLog", (event) => {
  addLogWithLimit(event.payload);
  unlisten = ()=>{}
}) 

onUnmounted(()=>{
  if(unlisten) unlisten()
})
</script>
