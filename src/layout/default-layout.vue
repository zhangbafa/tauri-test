<template>
  <a-layout>
    <a-layout-content style="padding: 10px">
        <router-view v-slot="{ Component, route }">
          <!-- <transition name="fade" mode="out-in" appear> -->
            <component
        :is="Component"
        v-if="route.meta.ignoreCache"
        :key="route.fullPath"
      />
      <keep-alive v-else>
        <component :is="Component" :key="route.fullPath" />
      </keep-alive>
        <!-- </transition> -->
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
