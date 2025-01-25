import { onUnmounted, ref } from 'vue'
import { useForWithDelay } from '@/compositions/useForWithDelay.js'

export function useInterval(timeRange = ref([40, 50])) {
    if (!Array.isArray(timeRange.value) || timeRange.value.length !== 2 || timeRange.value.some(v => typeof v !== 'number' || v <= 0)) {
        throw new Error('Invalid timeRange: must be a ref of an array containing two positive numbers.');
    }

    const nextInterval = ref(0);
    let timeoutId = null;

    // 获取随机间隔时间（毫秒）
    function getRandomInterval() {
        const [min, max] = timeRange.value;
        const times = (Math.floor(Math.random() * (max - min + 1)) + min) * 1000;
        nextInterval.value = times;
        console.log(`Next interval: ${nextInterval.value}ms`);
        return times;
    }

    // 动态执行函数
    function startPeriodicExecution(text, count = 0, callback = null) {
        stopPeriodicExecution(); // 确保之前的执行已停止
        const { fetchSpeech } = useForWithDelay();

        async function execute() {
            try {

                if (callback && typeof callback === 'function') {
                    await callback(text);
                } 
            } catch (error) {
                console.error('Periodic execution error:', {
                    message: error.message,
                    stack: error.stack,
                    text,
                    count,
                });
                stopPeriodicExecution();
            } finally {
                // 设置下次执行
                timeoutId = setTimeout(execute, getRandomInterval());
            }
        }

        timeoutId = setTimeout(execute, getRandomInterval());
    }

    // 停止执行
    function stopPeriodicExecution() {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;

        }        
    }

    onUnmounted(() => {
        stopPeriodicExecution()
    })

    return {
        startPeriodicExecution,
        stopPeriodicExecution,
    };
}
