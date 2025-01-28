// 更新设备列表的函数
async function updateDeviceList() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        
        const inputDevices = devices.filter(device => device.kind === 'audioinput');
        const outputDevices = devices.filter(device => device.kind === 'audiooutput');
        
        // 更新输入设备列表
        const inputList = document.getElementById('inputDevices');
        inputList.innerHTML = inputDevices.map(device => 
            `<div>${device.label || '未命名设备'}</div>`
        ).join('');
        
        // 更新输出设备列表
        const outputList = document.getElementById('outputDevices');
        outputList.innerHTML = outputDevices.map(device => 
            `<div>${device.label || '未命名设备'}</div>`
        ).join('');

        // 更新输出设备选择下拉菜单
        const outputSelect = document.getElementById('outputDeviceSelect');
        // 保存当前选中的值
        const currentValue = outputSelect.value;
        // 清空除了第一个默认选项外的所有选项
        while (outputSelect.options.length > 1) {
            outputSelect.remove(1);
        }
        // 添加设备选项
        outputDevices.forEach(device => {
            const option = new Option(device.label || '未命名设备', device.deviceId);
            outputSelect.add(option);
        });
        // 恢复之前选中的值
        if (currentValue) {
            outputSelect.value = currentValue;
        }
        
        updateStatus('设备列表已更新', 'success');
    } catch (error) {
        updateStatus('获取设备列表失败: ' + error.message, 'error');
    }
}

// 状态更新函数
function updateStatus(message, type) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = 'status ' + type;
}

// 音频测试相关变量
let mediaStream = null;
let audioContext = null;
let mediaStreamSource = null;
let analyser = null;
let animationFrame = null;

// 开始音频测试
async function startAudioTest() {
    try {
        // 请求麦克风权限
        mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // 创建音频上下文
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        mediaStreamSource = audioContext.createMediaStreamSource(mediaStream);
        analyser = audioContext.createAnalyser();
        
        // 连接节点
        mediaStreamSource.connect(analyser);
        
        // 设置分析器参数
        analyser.fftSize = 2048;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        // 更新UI状态
        document.getElementById('startTest').disabled = true;
        document.getElementById('stopTest').disabled = false;
        updateStatus('麦克风测试中...', 'success');
        
        // 开始音量监测
        function checkVolume() {
            analyser.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b) / bufferLength;
            updateStatus(`麦克风测试中... 当前音量: ${Math.round(average)}`, 'success');
            animationFrame = requestAnimationFrame(checkVolume);
        }
        
        checkVolume();
    } catch (error) {
        updateStatus('启动麦克风失败: ' + error.message, 'error');
    }
}

// 停止音频测试
function stopAudioTest() {
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
    }
    
    if (audioContext) {
        audioContext.close();
        audioContext = null;
    }
    
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
    }
    
    document.getElementById('startTest').disabled = false;
    document.getElementById('stopTest').disabled = true;
    updateStatus('测试已停止', 'success');
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 请求初始设备权限
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
            updateDeviceList();
        })
        .catch(error => {
            updateStatus('请授予麦克风访问权限以继续测试', 'error');
        });
    
    // 添加事件监听
    document.getElementById('refreshDevices').addEventListener('click', updateDeviceList);
    document.getElementById('startTest').addEventListener('click', startAudioTest);
    document.getElementById('stopTest').addEventListener('click', stopAudioTest);
    
    // 设备变化时自动更新列表
    navigator.mediaDevices.addEventListener('devicechange', updateDeviceList);

    // 音频文件选择处理
    const audioFile = document.getElementById('audioFile');
    const audioPlayer = document.getElementById('audioPlayer');
    audioFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            audioPlayer.src = url;
            // 当不再需要时，释放URL
            audioPlayer.onload = () => {
                URL.revokeObjectURL(url);
            };
        }
    });

    // 输出设备选择处理
    const outputSelect = document.getElementById('outputDeviceSelect');
    outputSelect.addEventListener('change', async () => {
        const deviceId = outputSelect.value;
        console.log(deviceId);
        if (deviceId && audioPlayer.setSinkId) {
            try {
                await audioPlayer.setSinkId(deviceId);
                updateStatus('已切换到选中的输出设备', 'success');
            } catch (error) {
                updateStatus('切换输出设备失败: ' + error.message, 'error');
            }
        }
    });
});