<template>
  <div class="container">
    <div v-show="showmarks" id="dragme" class="show-mark" draggable="true" resize>
     
      show marks</div>
    <video id="video" loop controls src=''></video>
    <canvas id="canvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive } from "vue";
import { listen } from "@tauri-apps/api/event";
import logo from '@/assets/128x128@2x.png'
// show marks
const showmarks = ref(true)
listen('show-marks',()=>{
  showmarks.value = !showmarks.value
})
onMounted(()=>{
  const dragElement = document.getElementById('dragme');
        let isDragging = false;
        let startX;
        let startY;

        dragElement.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX - dragElement.offsetLeft;
            startY = e.clientY - dragElement.offsetTop;
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const newX = e.clientX - startX;
                const newY = e.clientY - startY;
                dragElement.style.left = newX + 'px';
                dragElement.style.top = newY + 'px';
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
})
// 
//
let video;
let canvas;
let ctx;
let unlisten;
const draw=ref('C')
const alpha = ref(1);
const form = reactive({
  name: "",
  post: "",
  isRead: false,
});


// 将 updateCanvasSize 移到 onMounted 之外
const updateCanvasSize = () => {
  // canvas.width = window.innerWidth;
  // canvas.height = window.innerHeight;
};

onMounted(() => {
  video = document.querySelector("video");
  canvas = document.querySelector("canvas");
  ctx = canvas.getContext("2d");
  const img = new Image();
  img.src = logo
  // 添加键盘事件监听

  window.addEventListener("resize", updateCanvasSize);
  updateCanvasSize();

  video?.addEventListener("play", function () {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
   

    function drawFrame() {
      if (!video.paused && !video.ended) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 绘制视频帧
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
        // 生成随机文字
        if(draw.value == 'A' || draw.value=='C'){
          const randomText = generateRandomText(10);
          ctx.font = "20px Arial";
          ctx.fillStyle = generateRandomColor();
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          ctx.fillText(randomText, x, y);
        }
        

        // 继续绘制下一帧
        // 生成随机方块
        if(draw.value=='B' || draw.value=='C'){
          const squareX = Math.random() * canvas.width;
          const squareY = Math.random() * canvas.height;
          const squareWidth = Math.random() * 100 + 20; // 随机宽度 20 - 120
          const squareHeight = Math.random() * 100 + 20; // 随机高度 20 - 120
          const squareColor = generateRandomColor();
          ctx.fillStyle = squareColor;
          ctx.fillRect(squareX, squareY, squareWidth, squareHeight);
        }
        // 绘制图片
        if (img.complete) {
                    ctx.drawImage(img, 0, 0);
                }
        requestAnimationFrame(drawFrame);
      }
    }

    drawFrame();
  });
});

unlisten = listen("smartscene", (event) => {
  switch (event.payload.action) {
    case "setpath":
      canvas.width = 1080/4
      canvas.height = 1920/4
      // console.log(event.payload.src)
      video.src = event.payload.src
      video.addEventListener('loadeddata', () => {
        video.play().catch(e => console.error("播放失败:", e))
      }) // ✅ 确保加载完成

    break;
    case "play":
      video.play();
      break;
    case "pause":
      video.pause();
      break;
    case "stop":
      video.pause();
      video.currentTime = 0;
      break;
    case "setvolume":
      console.log('控制视频音量')
      video.volume = event.payload.volume;
      break;
    case 'setAlpha':
      alpha.value = event.payload.alpha
      break
    case 'setDeDuplicate':
      draw.value = event.payload.type
      break
    case 'openwindow':
      draw.value = event.payload.deduplicated
      alpha.value = event.payload.alpha
      document.querySelector('video').src = event.payload.src
      document.querySelector('video').play()
      break;
    case 'resetplay':
    document.querySelector('video').currentTime=0
    document.querySelector('video').play()
    break;
  }
});

onUnmounted(() => {
  window.removeEventListener("resize", updateCanvasSize);
  unlisten();
});

function generateRandomText(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
}

function generateRandomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  //const alpha = Math.random(); // 随机透明度
  return `rgba(${r}, ${g}, ${b}, ${alpha.value})`;
}  
</script>

<style scoped>
.container {
  position: relative;
  margin: 0 auto;
}
.show-mark{
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200px;
  height: 300px;
  z-index: 100;
  transform: translate(-50%, -50%);
  border:none;
  background-color: transparent;
  border: 1px solid red;
  /* transform: translateX(); */
}
video {
  width: 100%;
  height: 100%;
  opacity: 1;
  display: none;
}

.uni {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* background-color: rgba(0, 0, 0, 0.01); */
  color: rgba(238, 231, 231, 0.6);
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  line-height: 1.5;
  z-index: 1;
  white-space: normal;
  word-wrap: break-word;
}
</style>
