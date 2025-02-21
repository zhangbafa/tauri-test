<template>
  <router-view/>
</template>

<script setup lang="js">  
import { onMounted } from 'vue';
onMounted(async() => {
  document.getElementById('loadingPage').remove()
});
</script>