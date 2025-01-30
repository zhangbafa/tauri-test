<template>
  <div class="container">
    <!-- <div v-show="showmarks" id="dragme" class="show-mark" draggable="true" resize>
      show marks
    </div> -->
    <video id="video" loop controls src=""></video>
    <canvas id="canvas"></canvas>
    <!-- <button @click="clearImage">清除图片</button> -->
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive } from "vue";
import { listen } from "@tauri-apps/api/event";
import logo from "@/assets/128x128@2x.png";

// show marks
const showmarks = ref(true);
listen("show-marks", () => {
  showmarks.value = !showmarks.value;
});

onMounted(() => {
  // const dragElement = document.getElementById("dragme");
  // let isDraggingDiv = false;
  // let startXDiv;
  // let startYDiv;

  // dragElement.addEventListener("mousedown", (e) => {
  //   isDraggingDiv = true;
  //   startXDiv = e.clientX - dragElement.offsetLeft;
  //   startYDiv = e.clientY - dragElement.offsetTop;
  // });

  // document.addEventListener("mousemove", (e) => {
  //   if (isDraggingDiv) {
  //     const newX = e.clientX - startXDiv;
  //     const newY = e.clientY - startYDiv;
  //     dragElement.style.left = newX + "px";
  //     dragElement.style.top = newY + "px";
  //   }
  // });

  // document.addEventListener("mouseup", () => {
  //   isDraggingDiv = false;
  // });
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

// 图片相关变量
const img = new Image();
img.src = logo;
let imgX = 0;
let imgY = 0;
let imgWidth;
let imgHeight;
let isDraggingImg = false;
let isResizingImg = false;
let resizeDirection = "";
let startImgX;
let startImgY;
let shouldDrawImage = true;

// 更新画布大小
const updateCanvasSize = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
};

onMounted(() => {
  video = document.querySelector("video");
  canvas = document.querySelector("canvas");
  ctx = canvas.getContext("2d");

  window.addEventListener("resize", updateCanvasSize);
  updateCanvasSize();

  video?.addEventListener("play", function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    function drawFrame() {
      if (!video.paused && !video.ended) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 绘制视频帧
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // 生成随机文字
        if (draw.value == "A" || draw.value == "C") {
          const randomText = generateRandomText(10);
          ctx.font = "20px Arial";
          ctx.fillStyle = generateRandomColor();
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          ctx.fillText(randomText, x, y);
        }

        // 生成随机方块
        if (draw.value == "B" || draw.value == "C") {
          const squareX = Math.random() * canvas.width;
          const squareY = Math.random() * canvas.height;
          const squareWidth = Math.random() * 100 + 20;
          const squareHeight = Math.random() * 100 + 20;
          const squareColor = generateRandomColor();
          ctx.fillStyle = squareColor;
          ctx.fillRect(squareX, squareY, squareWidth, squareHeight);
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

  // 鼠标按下事件处理
  canvas.addEventListener("mousedown", function (e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    resizeDirection = checkResizeArea(mouseX, mouseY);
    if (resizeDirection) {
      isResizingImg = true;
    } else if (
      img.complete &&
      shouldDrawImage &&
      mouseX >= imgX &&
      mouseX <= imgX + imgWidth &&
      mouseY >= imgY &&
      mouseY <= imgY + imgHeight
    ) {
      isDraggingImg = true;
    }
    startImgX = mouseX;
    startImgY = mouseY;
  });

  // 鼠标移动事件处理
  canvas.addEventListener("mousemove", function (e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    if (isDraggingImg) {
      const dx = mouseX - startImgX;
      const dy = mouseY - startImgY;
      imgX += dx;
      imgY += dy;
      startImgX = mouseX;
      startImgY = mouseY;
    } else if (isResizingImg) {
      const dx = mouseX - startImgX;
      const dy = mouseY - startImgY;
      if (resizeDirection === "bottom-right") {
        imgWidth += dx;
        imgHeight += dy;
      }
      startImgX = mouseX;
      startImgY = mouseY;
    } else {
      const direction = checkResizeArea(mouseX, mouseY);
      canvas.style.cursor = direction ? "nwse-resize" : "default";
    }
  });

  // 鼠标松开事件处理
  canvas.addEventListener("mouseup", function () {
    isDraggingImg = false;
    isResizingImg = false;
    canvas.style.cursor = "default";
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
      document.querySelector("video").src = event.payload.src;
      document.querySelector("video").play();
      break;
    case "resetplay":
      document.querySelector("video").currentTime = 0;
      document.querySelector("video").play();
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
  return `rgba(${r}, ${g}, ${b}, ${alpha.value})`;
}

// 检查鼠标是否在调整区域
function checkResizeArea(mouseX, mouseY) {
  const resizeThreshold = 10;
  if (
    mouseX >= imgX + imgWidth - resizeThreshold &&
    mouseX <= imgX + imgWidth &&
    mouseY >= imgY + imgHeight - resizeThreshold &&
    mouseY <= imgY + imgHeight
  ) {
    return "bottom-right";
  }
  return "";
}

// 清除图片的函数
const clearImage = () => {
  shouldDrawImage = false;
};
</script>

<style scoped>
.container {
  position: relative;
  margin: 0 auto;
}
.show-mark {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200px;
  height: 300px;
  z-index: 100;
  transform: translate(-50%, -50%);
  border: none;
  background-color: transparent;
  border: 1px solid red;
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