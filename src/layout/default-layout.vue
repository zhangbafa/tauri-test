<template>
  <a-layout>
    <a-layout-content style="padding: 10px">
      <transition>
        <router-view v-slot="{ Component, route }">
          <component :is="Component" :key="route.fullPath" />
        </router-view>
      </transition>
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
