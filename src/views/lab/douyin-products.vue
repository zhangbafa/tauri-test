<template>
  <div>
    <a-space direction="vertical" style="width: 100%">
      <a-form :model="form" layout="inline">
        <a-form-item field="roomId" label="房间ID">
          <a-input v-model="form.roomId" placeholder="请输入房间ID" />
        </a-form-item>
        <a-form-item field="authorId" label="作者ID">
          <a-input v-model="form.authorId" placeholder="请输入作者ID" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleGetProduct">查询商品</a-button>
        </a-form-item>
      </a-form>
      
      <a-table :data="products" :loading="loading">
        <template #columns>
          <a-table-column title="商品名称" data-index="title">
            <template #cell="{ record }">
              <a-link :href="record.detailUrl" target="_blank">{{ record.title }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="价格" data-index="price" />
          <a-table-column title="销量" data-index="sales" />
        </template>
      </a-table>
    </a-space>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { getDouyinLiveProducts } from '@/compositions/useHttpLab.js';
import { Message } from '@arco-design/web-vue';

const form = reactive({
  roomId: '380952896968',
  authorId: '26639637029'
});

const products = ref([]);
const loading = ref(false);

const handleGetProduct = async () => {
  try {
    loading.value = true;
    const result = await getDouyinLiveProducts({
      roomid: form.roomId,
      author_id: form.authorId
    });
    products.value = result.data || [];
  } catch (error) {
    Message.error('获取商品数据失败');
  } finally {
    loading.value = false;
  }
};
</script>