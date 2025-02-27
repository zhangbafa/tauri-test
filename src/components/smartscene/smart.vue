<template>
  <a-watermark :content="watermark">
    <div class="container">
      <div class="show-mark" v-show="hasBeenToggled" :class="getAnimationClasses">
        <img v-show="pasterType == 'image'" :src="showMedia" alt="" />
        <video v-show="pasterType == 'video'" id="pasterVideo" muted />
      </div>
      <canvas id="canvas"></canvas>
    </div>
  </a-watermark>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive, computed } from "vue";
import { listen } from "@tauri-apps/api/event";
// show marks
const showMedia = ref(true);
const isShowMarkVisible = ref(false)
const hasBeenToggled = ref(false)
const animationDirection = ref('zoom')
// 定义计算属性 getAnimationClasses
const getAnimationClasses = computed(() => {
  // hasBeenToggled.value = true
  const classes = {};
  if (hasBeenToggled.value) {
    switch (animationDirection.value) {
      case 'right':
        classes['slide-in-right'] = isShowMarkVisible.value;
        classes['slide-out-right'] = !isShowMarkVisible.value;
        break;
      case 'left':
        classes['slide-in-left'] = isShowMarkVisible.value;
        classes['slide-out-left'] = !isShowMarkVisible.value;
        break;
      case 'zoom':
        classes['zoom-in'] = isShowMarkVisible.value;
        classes['zoom-out'] = !isShowMarkVisible.value;
        break;
    }
  }
  return classes;
});

let durationTimer;
const pasterType = ref('')
listen("show-marks", (event) => {
  const { type, path } = event.payload
  showMedia.value = ''
  hasBeenToggled.value = true  
  pasterType.value = type
  if (durationTimer) clearTimeout(durationTimer)

  isShowMarkVisible.value = !isShowMarkVisible.value;
  showMedia.value = path
  if (pasterType.value == 'image') {
    durationTimer = setTimeout(() => {
      isShowMarkVisible.value = !isShowMarkVisible.value
    }, 5 * 1000)
  }else{
   
    const pasterVideo = document.getElementById('pasterVideo')
    console.log(pasterVideo)
    pasterVideo.controls = false;
    pasterVideo.setAttribute("playsinline", "playsinline");
    pasterVideo.setAttribute("preload", "auto");
    pasterVideo.setAttribute("disablePictureInPicture", "true");
    pasterVideo.setAttribute('autoplay', false);
    pasterVideo.setAttribute('src', path);
    pasterVideo.setAttribute('muted',true)
    pasterVideo.play()
    pasterVideo.addEventListener('ended', function() {
      console.log('视频播放结束');
      isShowMarkVisible.value = false
    });
  }

  // 
});

let video;
let canvas;
let ctx;
let unlisten;
const draw = ref("C");
const alpha = ref(1);
const form = reactive({
  name: "",
  post: "",
  isRead: false,
});
const watermark = ref('畅语智景,视频正在加载中...');


let shouldDrawImage = true;

// 雨滴相关变量
const rainDrops = [];
const numberOfRainDrops = ref(500);

// 调整雨滴数量
const adjustRainDrops = () => {
  rainDrops.length = 0;
  for (let i = 0; i < numberOfRainDrops.value; i++) {
    rainDrops.push(new RainDrop());
  }
};

// 更新画布大小
const updateCanvasSize = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  adjustRainDrops();
};

// RainDrop 类
class RainDrop {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.length = Math.random() * 20 + 10; // 雨滴长度
    this.speed = Math.random() * 4 + 2; // 雨滴下落速度
    this.opacity = alpha.value; // 雨滴透明度
  }

  update() {
    this.y += this.speed;

    // 雨滴移出画布时重置
    if (this.y > canvas.height) {
      this.y = Math.random() * -50; // 从画布顶部重新开始
      this.x = Math.random() * canvas.width;
      this.length = Math.random() * 20 + 10;
      this.speed = Math.random() * 4 + 2;
      this.opacity = alpha.value;
    }
  }

  draw() {
    ctx.strokeStyle = generateRandomColor()
    ctx.lineWidth = 1; // 雨滴宽度
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x, this.y + this.length);
    ctx.stroke();
  }
}

// 处理雨滴
const handleRainDrops = () => {
  for (let i = 0; i < rainDrops.length; i++) {
    rainDrops[i].update();
    rainDrops[i].draw();
  }
};

onMounted(() => {
  // video = document.querySelector("video");
  video = document.createElement("video");
  video.controls = false;
  video.setAttribute("playsinline", "playsinline");
  video.setAttribute("preload", "auto");
  video.setAttribute("disablePictureInPicture", "true");
  video.setAttribute('autoplay', 'autoplay');
  video.setAttribute('loop', 'loop');

  canvas = document.querySelector("canvas");
  ctx = canvas.getContext("2d");

  window.addEventListener("resize", updateCanvasSize);
  updateCanvasSize();

  video?.addEventListener("canplay", function () {
    watermark.value = '';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    function drawFrame() {
      if (!video.paused && !video.ended) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 绘制视频帧
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // 生成随机文字
        if (draw.value == "randomText" || draw.value == "randomTextAndGraphics") {
          const randomText = generateRandomText(10);
          ctx.font = "20px Arial";
          ctx.fillStyle = generateRandomColor();
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          ctx.fillText(randomText, x, y);
        }

        // 生成随机方块和圆形
        if (draw.value == "randomGraphics" || draw.value == "randomTextAndGraphics") {
          const squareX = Math.random() * canvas.width;
          const squareY = Math.random() * canvas.height;
          const squareWidth = Math.random() * 100 + 20;
          const squareHeight = Math.random() * 100 + 20;
          const squareColor = generateRandomColor();
          ctx.fillStyle = squareColor;
          ctx.fillRect(squareX, squareY, squareWidth, squareHeight);

          // 生成随机圆形
          ctx.beginPath();
          ctx.arc(Math.random() * canvas.width, Math.random() * canvas.width, Math.random() * 100 + 20, 0, 2 * Math.PI);
          ctx.fillStyle = generateRandomColor();
          ctx.fill();
        }



        // 绘制雨滴
        if (draw.value == "rain") {
          handleRainDrops();
        }

        // 绘制图片
        // if (img.complete && shouldDrawImage) {
        //   if (!imgWidth) {
        //     imgWidth = img.width;
        //     imgHeight = img.height;
        //   }
        //   ctx.drawImage(img, imgX, imgY, imgWidth, imgHeight);
        // }

        requestAnimationFrame(drawFrame);
      }
    }

    drawFrame();
  });
});

unlisten = listen("smartscene", (event) => {
  switch (event.payload.action) {
    case "setpath":
      canvas.width = 1080 / 4;
      canvas.height = 1920 / 4;
      video.src = event.payload.src;
      video.addEventListener("loadeddata", () => {
        video.play().catch((e) => console.error("播放失败:", e));
      });
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
      video.volume = event.payload.volume;
      break;
    case "setAlpha":
      alpha.value = event.payload.alpha;
      break;
    case "setDeDuplicate":
      draw.value = event.payload.type;
      break;
    case "openwindow":
      draw.value = event.payload.deduplicated;
      alpha.value = event.payload.alpha;
      // document.querySelector("video").src = event.payload.src;
      // document.querySelector("video").play();
      video.src = event.payload.src;
      console.log(event.payload);
      video.play();
      break;
    case "resetplay":
      // document.querySelector("video").currentTime = 0;
      // document.querySelector("video").play();
      video.currentTime = 0;
      video.play();
      break;
    case 'setRainNumber':
      numberOfRainDrops.value = event.payload.num;
      console.log(numberOfRainDrops.value)
      // rainDrops=[]
      adjustRainDrops()

  }
});

onUnmounted(() => {
  window.removeEventListener("resize", updateCanvasSize);
  unlisten();
  if (durationTimer) clearTimeout(durationTimer)
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
  return `rgba(${r}, ${g}, ${b}, ${alpha.value})`;
}

// 清除图片的函数
const clearImage = () => {
  shouldDrawImage = false;
};
</script>

<style>
.container {
  position: relative;
  margin: 0 auto;
}

.show-mark {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 80%;
  z-index: 100;
  border: none;
  border-radius: 10px;
  pointer-events: none;
  transform: translate(-50%, -50%);
  overflow: hidden;
  display: flex;
  justify-content: center;
}


.show-mark img, .show-mark video  {
  width: 50%;
  height: auto;
  border-radius: 10px;
  display: inline-block;
}



body {
  overflow: hidden;
}

/* 从右到左进入动画 */
.slide-in-right {
  animation: slideInFromRight 0.2s ease forwards;
}

/* 从右到左离开动画 */
.slide-out-right {
  animation: slideOutToRight 0.2s ease forwards;
}

/* 从左到右进入动画 */
.slide-in-left {
  animation: slideInFromLeft 0.2s ease forwards;
}

/* 从左到右离开动画 */
.slide-out-left {
  animation: slideOutToLeft 0.2s ease forwards;
}

/* 从中间放大进入动画 */
.zoom-in {
  animation: zoomIn 0.2s ease forwards;
}

/* 从中间缩小离开动画 */
.zoom-out {
  animation: zoomOut 0.2s ease forwards;
}

@keyframes slideInFromRight {
  from {
    transform: translateX(100%) translateY(-50%);
    opacity: 0;
  }

  to {
    transform: translateX(-50%) translateY(-50%);
    opacity: 1;
  }
}

@keyframes slideOutToRight {
  from {
    transform: translateX(-50%) translateY(-50%);
    opacity: 1;
  }

  to {
    transform: translateX(100%) translateY(-50%);
    opacity: 0;
  }
}

@keyframes slideInFromLeft {
  from {
    transform: translateX(-200%) translateY(-50%);
    opacity: 0;
  }

  to {
    transform: translateX(-50%) translateY(-50%);
    opacity: 1;
  }
}

@keyframes slideOutToLeft {
  from {
    transform: translateX(-50%) translateY(-50%);
    opacity: 1;
  }

  to {
    transform: translateX(-200%) translateY(-50%);
    opacity: 0;
  }
}

@keyframes zoomIn {
  from {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
  }

  to {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
}

@keyframes zoomOut {
  from {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }

  to {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
  }
}
</style>