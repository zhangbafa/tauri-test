<template>
  <div class="baoshi-box" style="margin-top: 20px; margin-bottom: 10px">
    <div class="slider-box">
      <div v-for="item in 10">
        <a-slider :default-value="0" direction="vertical" :min="-10" :max="10" size="large" />
        <div>{{ ss[item-1] }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive,ref } from "vue";

const ss= ref(['31','62','125','250','500','1k','2k','4k','8k','16k'])
const form = reactive({
  sound: "默认设备",
  mic: "默认麦克",
});
const handleSubmit = (data) => {
  console.log(data);
};
</script>

<style scoped>
.slider-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
}
.arco-slider-track.arco-slider-track-vertical{
    min-height: 100px;
}
</style>
