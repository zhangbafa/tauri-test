<template>
  <router-view v-slot="{ Component }">
    <transition>
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<script setup lang="js">  
import { onMounted } from 'vue';
onMounted(() => {
  document.getElementById('loadingPage').remove()
});
</script>