<template>
    <a-form ref="formRef" :rules="rules" :model="form" @submit="handleSubmit"
        style="position: relative;margin-bottom: 50px;">
            <a-form-item field="amount" label="成交额">
                <a-input v-model="form.amount" placeholder="￥" />
            </a-form-item>            
            <a-form-item field="adCost" label="广告">
                <a-input v-model="form.adCost" placeholder="￥" />
            </a-form-item>
            <a-form-item field="commission" label="佣金">
                <a-input v-model="form.commission" placeholder="￥" />
            </a-form-item>
            <a-form-item field="refundRate" label="退货率">
                <a-input v-model="form.refundRate" placeholder="￥" />
            </a-form-item>
       
        <div class="footer-action">
            <a-space>
                <a-button html-type="submit" type="primary">立即计算</a-button>
                <a-button @click="$refs.formRef.resetFields()">重置</a-button>
                <a-button type="text">保本ROI为: {{ roi }}</a-button>
            </a-space>
        </div>
    </a-form>
    <!-- {{ form }} -->
  </template>

  <!-- ROI = (广告所带来的收益 - 广告投入成本) / 广告投入成本 × 100% -->
  <script setup>
  import { reactive, ref, onMounted } from 'vue';
  import { Message } from '@arco-design/web-vue';
  
  const roi = ref(0)
  const handleSubmit = ({ values, errors }) => {
    // Convert all form values to numbers
    if (errors) {
        console.log('Form validation failed:', errors);
        return;
    }
    const amount = Number(form.amount)
    const adCost = Number(form.adCost)
    const commission = Number(form.commission)
    const refundRate = Number(form.refundRate)
    const order = (amount-(amount * (refundRate)/100)) * (commission)/100
    roi.value = Math.round(((order - adCost)/adCost) * 0.1)
    
  }
  
  const form = reactive({
    adRevenue: '',   
    adCost: '',
    commission: '', 
    refundRate:''
    
  });
  const rules = {
    amount: [
        {
            required: true,
            message: '请输入计划投入',
        },
        {
            validator: (value, callback) => {
                if (value !== '' && isNaN(Number(value))) {
                    callback('请输入有效的数字')
                }
            }
        }
    ],
    adCost: [
        {
            required: true,
            message: '请输入广告成本',
        },
        {
            validator: (value, callback) => {
                if (value !== '' && isNaN(Number(value))) {
                    callback('请输入有效的数字')
                }
            }
        }
    ],
    commission: [
        {
            required: true,
            message: '请输入佣金',
        },
        {
            validator: (value, callback) => {
                if (value !== '' && isNaN(Number(value))) {
                    callback('请输入有效的数字')
                }
            }
        }
    ],
    refundRate: [
        {
            required: true,
            message: '请输入退货率',
        },
        {
            validator: (value, callback) => {
                if (isNaN(Number(value))) {
                    callback('请输入有效的数字')
                }
            }
        }
    ]
  }
  
  </script>