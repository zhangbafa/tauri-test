<template>
  <a-layout>
    <a-layout-content style="padding: 10px">
        <router-view v-slot="{ Component, route }">
          <transition>
          <component :is="Component" :key="route.fullPath" />
        </transition>
        </router-view>
    </a-layout-content>
  </a-layout>
</template>
<script setup>
</script>
<style scoped>
body {
  background-color: var(--color-bg-1);
  color: var(--color-text-1);
}
</style>
