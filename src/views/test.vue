<template>
    <div>
        <a-button @click="createNewWindow">openNewWindow</a-button>
        <a-button @click="sendMessage">play</a-button>
        <a-button @click="sendMessage2">stop</a-button>

    </div>
</template>

<script setup>
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { emit } from '@tauri-apps/api/event';

let webview;
const createNewWindow = async () => {
    console.log('开始创建新窗口');
    try {
        webview = new WebviewWindow('goods', {
            url: '#/goods', // 修改为相对路径或本地路由
            title: '新窗口',
            width: 800,
            height: 600,
            center: true,
            transparent: true,
            decorations: true,
            alwaysOnTop: true,
            resizable: true,
            fullscreen: false,
            dragDropEnabled: true,
            alwaysOnTop: true,
            alwaysOnTop: true,
            alwaysOnTop: true,
            backgroundColor: '#000000',
            
        });

        webview.emit('tauri://created');

        // 监听窗口创建事件
        webview.once('tauri://created', () => {
            console.log('窗口创建成功');
        });

        // 监听错误事件
        webview.once('tauri://error', (e) => {
            console.error('窗口创建失败:', e);
        });

    } catch (error) {
        console.error('创建窗口时发生错误:', error);
    }
}
const sendMessage = () => {
    if (webview) {
      // emit('custom-event', { message: 'Hello from main window!' });
      webview.emit('custom-event', { message: 'Hello from main window!',action:'play'});
    }
}
const sendMessage2 = () => {
    if (webview) {
      // emit('custom-event', { message: 'Hello from main window!' });
      webview.emit('custom-event', { message: 'Hello from main window!',action:'volume',volume:0.5});
    }
}

</script>
