<template>
    <h3 style="margin-left: 25px;">铃声设置</h3>
    <a-form :model="form" :style="{ margin: '20px' }" :rules="rules" @submit="handleSubmit" layout="inline">
      <a-form-item field="min" label="最小值" label-col-flex="100px">
        <a-input
          v-model="form.min"
          placeholder="请输入最小值"
        />
        <template #help>
        <div>单位是秒</div>
        </template>
      </a-form-item>
      <a-form-item field="max" label="最大值" label-col-flex="100px">
        <a-input v-model="form.max" placeholder="请输入max" />
      </a-form-item>
      <a-form-item field="volume" label="音量" label-col-flex="100px">
        <a-input v-model="form.volume" placeholder="请输入音量" :rules="{pattern:/^[0-9]+(\.[0-9]+)?$/,message:'请输入数字'}" />
        <template #help>
        <div>0-1之间</div>
        </template> 
      </a-form-item>
      <a-form-item field="playbackRate" label="播放速度" label-col-flex="100px">
        <a-input v-model="form.playbackRate" placeholder="请输入播放速度" />
        <template #help>
        <div>0.25-2之间</div>
        </template>
      </a-form-item>
      <a-form-item>
        <a-button html-type="submit" type="primary">确定</a-button>
      </a-form-item>
    </a-form>
  </template>
  
  <script setup>
  import { reactive } from 'vue';
  import { Notification } from '@arco-design/web-vue';
  const emit = defineEmits(['update-time-range']);
  
  const form = reactive({
    min: '40',
    max: '50',
    volume: '1',
    playbackRate: '1',
  });
  
  const handleSubmit = ({values, errors}) => {
    emit('update-time-range', [Number(form.min), Number(form.max)],form.volume,form.playbackRate);
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
  