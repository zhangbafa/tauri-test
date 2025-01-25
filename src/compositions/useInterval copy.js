import { ref } from 'vue'
import { useForWithDelay } from '@/compositions/useForWithDelay.js'

export function useInterval(timeRange = [40, 50]) {
    console.log(timeRange.value)
    let intervalId = null
    let audioUrls = [] // 用于管理创建的音频URL
    let nextInterval = ref(0)
    // 获取10-30之间的随机秒数
    function getRandomInterval() {
        const [min, max] = timeRange.value;
        const times = (Math.floor(Math.random() * (max - min + 1)) + min) * 1000;
        nextInterval.value = times
        console.log(`nextInterval:${nextInterval.value}ms`)
        return times; // 将秒转换为毫秒
    }
    function startPeriodicExecution(text, count = 0, callback = null) {
        // 清理之前的资源
        stopPeriodicExecution()
        getRandomInterval();
       
        const { fetchSpeech } = useForWithDelay()

        intervalId = setInterval(async () => {
            try {
                // 清理之前的音频URL
                audioUrls.forEach(url => URL.revokeObjectURL(url))
                audioUrls = []
                if (callback && typeof callback === 'function') {
                     getRandomInterval();
                    await callback(text)
                } else {
                    // const audioBlob = await fetchSpeech(text + ',直播间共有' + count + '位家人')
                    // const audioUrl = URL.createObjectURL(audioBlob)
                    // audioUrls.push(audioUrl)

                    // const audioPlayer = document.getElementById('audioPlayer')
                    // audioPlayer.src = audioUrl
                    // audioPlayer.play()
                }
            } catch (error) {
                console.error('Periodic execution error:', error);
                stopPeriodicExecution()
            }
        }, nextInterval.value);

        return intervalId;
    }

    function stopPeriodicExecution() {
        if (intervalId) {
            clearInterval(intervalId)
            intervalId = null

            // 释放音频资源
            // audioUrls.forEach(url => URL.revokeObjectURL(url))
            // audioUrls = []
        }
    }

    return {
        startPeriodicExecution,
        stopPeriodicExecution
    }
}