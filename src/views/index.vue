<script setup lang="ts">
import Shop from '../components/shop.vue';
import Daren from '../components/daren.vue';
</script>

<template>
    <a-tabs :animation="true" :justify="true" size="large" :destroy-on-hide="true" :lazy-load="true">
    <a-tab-pane key="1" >
      <template #title>
        <icon-apps /> 商家版
      </template>
      <Shop />
    </a-tab-pane>
    <a-tab-pane key="2">
      <template #title>
        <icon-bar-chart /> 达人版
      </template>
      <Daren />
    </a-tab-pane>
  </a-tabs>
</template>

<style>
.arco-tabs-nav-tab{
    display: flex;
    justify-content: center;
    font-size:16px;
}
</style>