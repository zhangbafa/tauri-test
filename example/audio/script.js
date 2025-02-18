// 获取页面元素
const selectMicBtn = document.getElementById('selectMicBtn');
const startRecordingBtn = document.getElementById('startRecordingBtn');
const stopRecordingBtn = document.getElementById('stopRecordingBtn');
const statusText = document.getElementById('status');

// 用于存储媒体流和录制器
let mediaStream;
let mediaRecorder;
let recordedChunks = [];

// 请求麦克风权限并列出可用设备
async function getMicrophones() {
    try {
        // 请求访问媒体设备
        const devices = await navigator.mediaDevices.enumerateDevices();
        const microphones = devices.filter(device => device.kind === 'audioinput');

        if (microphones.length === 0) {
            statusText.textContent = '未找到可用的麦克风设备。';
            return;
        }

        // 提示用户选择麦克风
        const selectedDeviceId = await showDeviceSelection(microphones);
        console.log(selectedDeviceId);
        if (!selectedDeviceId) {
            statusText.textContent = '未选择麦克风。';
            return;
        }

        // 使用选择的麦克风获取媒体流
        mediaStream = await navigator.mediaDevices.getUserMedia({
            audio: { deviceId: { exact: selectedDeviceId } }
        });

        statusText.textContent = '已成功选择麦克风，可以开始录音。';
        startRecordingBtn.disabled = false;
    } catch (error) {
        console.error('获取麦克风设备时出错:', error);
        statusText.textContent = '获取麦克风设备时出错，请检查权限和设备连接。';
    }
}

// 显示设备选择对话框
function showDeviceSelection(devices) {
    return new Promise((resolve) => {
        const deviceNames = devices.map(device => device.label || `麦克风 ${device.deviceId}`);
        const selectedIndex = window.prompt(`请选择要使用的麦克风:\n${deviceNames.join('\n')}`, 0);
        if (selectedIndex === null) {
            resolve(null);
        } else {
            const index = parseInt(selectedIndex, 10);
            if (isNaN(index) || index < 0 || index >= devices.length) {
                resolve(null);
            } else {
                resolve(devices[index].deviceId);
            }
        }
    });
}

// 开始录音
function startRecording() {
    if (!mediaStream) {
        statusText.textContent = '请先选择麦克风。';
        return;
    }

    mediaRecorder = new MediaRecorder(mediaStream);

    mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
            recordedChunks.push(event.data);
            console.log('Recording data available:', event.data);
        }
    };

    mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        audio.play();
        recordedChunks = [];
    };

    mediaRecorder.start();
    statusText.textContent = '正在录音...';
    startRecordingBtn.disabled = true;
    stopRecordingBtn.disabled = false;
}

// 停止录音
function stopRecording() {
    if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        return;
    }

    mediaRecorder.stop();
    statusText.textContent = '录音已停止，正在播放录制的音频。';
    startRecordingBtn.disabled = false;
    stopRecordingBtn.disabled = true;
}

// 绑定按钮事件
selectMicBtn.addEventListener('click', getMicrophones);
startRecordingBtn.addEventListener('click', startRecording);
stopRecordingBtn.addEventListener('click', stopRecording);