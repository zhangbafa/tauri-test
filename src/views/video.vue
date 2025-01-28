<template>
    <div class="container2">
        <!-- /Users/zhang1/Downloads/tik.mp4 -->
        <video src=''
               id="video"
               loop
               controls></video>
        <canvas id="canvas"></canvas>
        <!-- <div class="uni"> -->

        <!-- <video :src="mp4"
        id="video" loop
        autoplay
        muted
        style   ="width: 100%;height: 100%;opacity: 0.55;"
        ></video> -->
        <!-- </div> -->
    </div>
    <a-modal v-model:visible="visible"
             title="去重设置"
             title-align="start"
             @ok="handleOk"
             @cancel="handleCancel">
        <div>
            <a-form :model="form"
                    @submit="handleSubmit">
                <a-form-item field=""
                             label="视频文件">
                    <a-input v-model="form.name"
                             placeholder="" />
                    <a-button type="primary"
                              @click="handleSelectVideo">选择文件</a-button>
                </a-form-item>
                <a-form-item field=""
                             label="透明度">
                    <a-slider :show-ticks="true"
                              v-model="alpha"
                              :min="0"
                              :max="1"
                              :step="0.01" />
                </a-form-item>
                <a-form-item field=""
                             label="查看效果">
                    <a-radio-group type="button" @change="handleChange">
                        <a-radio value="play">静音播放</a-radio>
                        <a-radio value="stop">暂定播放</a-radio>
                        <a-radio value="reset">播放</a-radio>
                    </a-radio-group>
                </a-form-item>
            </a-form>
        </div>
    </a-modal>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive } from 'vue';
import { listen } from '@tauri-apps/api/event';
import { open } from '@tauri-apps/plugin-dialog'

let video;
let canvas;
let ctx;
let unlisten;

const alpha = ref(0.05)
const visible = ref(true);
const form = reactive({
    name: '',
    post: '',
    isRead: false,
});
const handleClick = () => {
    visible.value = true;
};
const handleOk = () => {
    visible.value = false;
};
const handleCancel = () => {
    visible.value = false;
}
const handleSelectVideo = async () => {
    try {
        const selected = await open({
            multiple: false,
            directory: false,
            filters: [{
                name: '视频文件',
                extensions: ['mp4', 'mov']
            }]
        })
        const path = `/@fs/${selected}`
        form.name = path
        if (selected) {
            document.querySelector('video').src = path
        }
    } catch (error) {
        alert('选择文件出错')
    }
}
const handleChange=(e)=>{
    const video = document.querySelector('video')
    if (e === 'play') {
        video.style.display = 'none'
        video.muted = true
        video.play()
    } else if (e === 'stop') {
        video.pause()
    } else if (e === 'reset') {
        video.style.display = 'none'
        video.currentTime = 0
        video.muted = false
        video.volume = 1
        video.play()
    }
}

const handleKeyPress = (event) => {
    if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        visible.value = true
    }
    console.log(event.code)
    if (event.code === 'Space') {
        
    }
};

onMounted(() => {
    video = document.querySelector('video')
    canvas = document.querySelector('canvas');
    ctx = canvas.getContext('2d');

    // 添加键盘事件监听
    window.addEventListener('keydown', handleKeyPress);

    const updateCanvasSize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', updateCanvasSize);
    updateCanvasSize();

    video?.addEventListener('play', function () {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        function drawFrame() {
            if (!video.paused && !video.ended) {
                // 绘制视频帧
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                // 生成随机文字
                const randomText = generateRandomText(10);
                // 设置文字样式
                ctx.font = '20px Arial';
                ctx.fillStyle = generateRandomColor();
                // 随机位置
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;

                // 绘制随机文字
                ctx.fillText(randomText, x, y);
                // 继续绘制下一帧
                // 生成随机方块
                const squareX = Math.random() * canvas.width;
                const squareY = Math.random() * canvas.height;
                const squareWidth = Math.random() * 100 + 20; // 随机宽度 20 - 120
                const squareHeight = Math.random() * 100 + 20; // 随机高度 20 - 120
                const squareColor = generateRandomColor();

                ctx.fillStyle = squareColor;
                ctx.fillRect(squareX, squareY, squareWidth, squareHeight);
                requestAnimationFrame(drawFrame);
            }
        }

        drawFrame();
    });
})

unlisten = listen('custom-event', (event) => {
    switch (event.payload.action) {
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
    window.removeEventListener('resize', updateCanvasSize);
    window.removeEventListener('keydown', handleKeyPress);
    unlisten();
});

function generateRandomText(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
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

video {
    width: 100%;
    height: 100%;
    opacity: 1;
    display: none
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