import { ref } from 'vue'

export function useRandomPicker() {
    const lastRandomIndex = ref(-1)

    // 从数组中随机选择一个元素
    const getRandomElement = (arr) => {
        if (!arr || arr.length === 0) {
            return null
        }
        
        if (arr.length === 1) {
            return arr[0]
        }
        
        let randomIndex
        do {
            const array = new Uint32Array(1)
            window.crypto.getRandomValues(array)
            randomIndex = array[0] % arr.length
        } while (randomIndex === lastRandomIndex.value)
        
        lastRandomIndex.value = randomIndex
        return arr[randomIndex]
    }

    // 打乱数组
    const shuffleArray = (array) => {
        const shuffled = [...array]
        for (let i = shuffled.length - 1; i > 0; i--) {
            const array = new Uint32Array(1)
            window.crypto.getRandomValues(array)
            const j = array[0] % (i + 1)
            const temp = shuffled[i]
            shuffled[i] = shuffled[j]
            shuffled[j] = temp
        }
        return shuffled
    }

    // 创建一个循环选择器
    const createCyclicPicker = (array) => {
        const shuffled = shuffleArray([...array])
        let currentIndex = 0

        return {
            next: () => {
                const item = shuffled[currentIndex]
                currentIndex = (currentIndex + 1) % shuffled.length
                if (currentIndex === 0) {
                    // 当遍历完一轮时，重新打乱数组
                    shuffleArray(shuffled)
                }
                return item
            },
            reset: () => {
                shuffleArray(shuffled)
                currentIndex = 0
            }
        }
    }

    return {
        getRandomElement,
        shuffleArray,
        createCyclicPicker
    }
} 