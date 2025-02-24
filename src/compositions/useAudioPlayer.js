import { ref, onUnmounted, onMounted } from 'vue';
import { listen, emit } from "@tauri-apps/api/event";
export function useAudioPlayer() {
  const playing = ref(true)
  const volume = ref(0.5) // 添加音量控制的响应式引用
  const playbackRate = ref(1.0); // 播放速度（默认1.0）
  const deviceId = ref('')
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()  
  const currentGainNode = ref(null) // 新增当前增益节点引用

  const playBlob = async (blob) => {
    try {
      // console.log(`音量，语速：${volume.value,playbackRate.value}`)
      // 将 Blob 转换为音频缓冲区
      const arrayBuffer = await blob.arrayBuffer()
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
      
      // 创建音频源
      const source = audioContext.createBufferSource()
      source.buffer = audioBuffer

      // 设置播放速度
      source.playbackRate.value = playbackRate.value;
       // 创建增益节点控制音量
       const gainNode = audioContext.createGain()
       gainNode.gain.value = volume.value
       currentGainNode.value = gainNode // 存储当前增益节点
       // 连接音频处理链：source -> gainNode -> destination
       source.connect(gainNode)
       gainNode.connect(audioContext.destination)
      
      // 播放完成后自动断开连接和销毁
      source.onended = () => {
        console.log('播放完毕')
        currentGainNode.value = null // 清除引用
        playing.value = true
        source.disconnect()
        source.buffer = null // 帮助垃圾回收
        // emit('setAnchorVolume',{action:'setvolume',volume:1}) 主播ai
        emit('smartscene',{action:'setvolume',volume:1})
      }
      
      // 播放
      playing.value = true
      

      source.start(0)
      // setAnchorVolume
      // emit('setAnchorVolume',{action:'setvolume',volume:0.2}) 主播ai
      emit('smartscene',{action:'setvolume',volume:0})
      
      return source
    } catch (error) {
      console.error('音频播放错误:', error)
    }
  }

  // 添加设备
  const setDeviceId = (value) => {
    // deviceId.value = value 
    audioContext.setSinkId(value);
  }

  // 添加设置音量的方法
  const setVolume2 = (value) => {
    volume.value = value // 确保音量在 0-1 之间
  }

  const setVolume = (value) => {  
    console.log('baoshi:'+value)  
    if (currentGainNode.value) {
      // 使用指数曲线更符合人类听觉感知
      currentGainNode.value.gain.setTargetAtTime(
        value,
        audioContext.currentTime,
        0.01
      )
    }
  }


  // 设置播放速度
  const setPlaybackRate = (value) => {
    playbackRate.value = value // 确保播放速度在合理范围（0.1x ~ 4.0x）
  };
  // 关闭 AudioContext 的方法
  const close = () => {
    playing.value = false
    audioContext.close()
  }

  return {
    playBlob,
    close,
    playing,
    volume,
    setVolume,
    setPlaybackRate,
    setDeviceId
  }
}