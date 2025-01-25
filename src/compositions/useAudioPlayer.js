import { ref, onUnmounted, onMounted } from 'vue';
export function useAudioPlayer() {
  const playing = ref(true)
  const volume = ref(0.5) // 添加音量控制的响应式引用
  const playbackRate = ref(1.0); // 播放速度（默认1.0）

  const audioContext = new (window.AudioContext || window.webkitAudioContext)()  
  const playBlob = async (blob) => {
    try {
      console.log(`音量，语速：${volume.value,playbackRate.value}`)
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
       
       // 连接音频处理链：source -> gainNode -> destination
       source.connect(gainNode)
       gainNode.connect(audioContext.destination)
       
       // 播放完成后自动断开连接和销毁
       source.onended = () => {
         console.log('播放完毕')
         playing.value = true
         source.disconnect()
         gainNode.disconnect()
         source.buffer = null
       }
      // 连接到输出
      // source.connect(audioContext.destination)
      
      // 播放完成后自动断开连接和销毁
      source.onended = () => {
        console.log('播放完毕')
        playing.value = true
        source.disconnect()
        source.buffer = null // 帮助垃圾回收
      }
      
      // 播放
      playing.value = true
      
      source.start(0)
      
      return source
    } catch (error) {
      console.error('音频播放错误:', error)
    }
  }

  // 添加设置音量的方法
  const setVolume = (value) => {
    volume.value = value // 确保音量在 0-1 之间
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
    setPlaybackRate
  }
}