<template>
    <div class="container">
        <!-- /@fs/E:/202222/roi/src/assets/111.mp4 -->
         <!-- /@fs/E:/111.mp4 -->
        <!-- <video src="/@fs/E:/111.mp4" controls loop></video> -->
    </div>
</template>

<script setup>
import { ref,onMounted,onUnmounted } from 'vue';
import { listen } from '@tauri-apps/api/event';

let video;
let unlisten;
onMounted(() => {
    video = document.querySelector('video')
})
unlisten = listen('custom-event', (event) => {    
    switch(event.payload.action){
        case 'play':
            video.play()
            break
        case 'pause':
            video.pause()
            break
        case 'stop':
            video.pause()
            video.currentTime = 0
            break
        case 'volume':
            video.volume = event.payload.volume
            break
    }
    
});

onUnmounted(() => {
    unlisten()
});
</script>

<style>
.container {
    position: relative;
    margin: 0 auto;
}

video {
   width: 100%;
   height: 100%;
}
</style>