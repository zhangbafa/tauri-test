<template>
  <h3 style="margin-left: 25px;">报时设置</h3>
  <a-alert type="success" v-show="show" closable>设置成功,下次播放生效.</a-alert>
  <a-form :model="form" :style="{ margin: '20px' }" :rules="rules" @submit="handleSubmit" layout="inline">
    <a-form-item field="min" label="最小值">
      <a-input v-model="form.min" placeholder="请输入最小值" />
      <template #help>
        <div>单位是秒</div>
      </template>
    </a-form-item>
    <a-form-item field="max" label="最大值">
      <a-input v-model="form.max" placeholder="请输入max" />
    </a-form-item>
    <a-form-item field="volume" label="音量">
      <a-input v-model="form.volume" placeholder="请输入音量" :rules="{ pattern: /^[0-9]+(\.[0-9]+)?$/, message: '请输入数字' }" />
      <template #help>
        <div>0-1之间</div>
      </template>
    </a-form-item>
    <a-form-item field="playbackRate" label="播放速度">
      <a-input v-model="form.playbackRate" placeholder="请输入播放速度" />
      <template #help>
        <div>0.25-2之间</div>
      </template>
    </a-form-item>
    <a-form-item field="totalUserCount" label="人数">
      <a-input v-model="form.totalUserCount" placeholder="请输入播放速度" />
      <template #help>
        <div>大于等于输入的数字开始报人数，0不报人数</div>
      </template>
    </a-form-item>
    <a-form-item>
      <a-button html-type="submit" type="primary">确定</a-button>
    </a-form-item>
  </a-form>
</template>

<script setup>
import { reactive,ref } from 'vue';
import { Notification } from '@arco-design/web-vue';
const emit = defineEmits(['update-timespeaker-range']);
const show = ref(false)
const form = reactive({
  min: '70',
  max: '90',
  volume: '1',
  playbackRate: '1',
  totalUserCount:'0'
});

const handleSubmit = ({ values, errors }) => {
  emit('update-timespeaker-range', [Number(form.min), Number(form.max)], form.volume, form.playbackRate,form.totalUserCount);
  Notification.success({
    title: '设置成功',
    content: '下次播放生效!',
    position: 'bottomRight',
    closable: true,
  })
};

const rules = {
  min: [
    {
      required: true,
      message: '不能为空',
    },
    {
      validator: (value, cb) => {
        const num = Number(value);
        if (isNaN(num)) {
          cb('请输入数字');
        } else if (num <= 0) {
          cb('必须大于0');
        } else {
          cb();
        }
      }
    }
  ],
  max: [
    {
      required: true,
      message: '不能为空',
    },
    {
      validator: (value, cb) => {
        const num = Number(value);
        const minNum = Number(form.min);
        if (isNaN(num)) {
          cb('请输入数字');
        } else if (num <= 0) {
          cb('必须大于0');
        } else if (num <= minNum) {
          cb('必须大于最小值');
        } else {
          cb();
        }
      }
    }
  ],
  volume: [
    {
      required: true,
      message: '不能为空',
    },
    {
      validator: (value, cb) => {
        const num = Number(value);
        if (isNaN(num)) {
          cb('请输入数字');
        } else if (num < 0 || num > 1) {
          cb('请输入0-1之间的数字');
        } else {
          cb();
        }
      }
    }
  ],
  playbackRate: [
    {
      required: true,
      message: '不能为空',
    },
    {
      validator: (value, cb) => {
        const num = Number(value);
        if (isNaN(num)) {
          cb('请输入数字');
        } else if (num < 0.25 || num > 2) {
          cb('请输入0.25-2之间的数字');
        } else {
          cb();
        }
      }
    }
  ],
}
</script>