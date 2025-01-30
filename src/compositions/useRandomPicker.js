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
            crypto.getRandomValues(array)
            const j = array[0] % (i + 1)
            const temp = shuffled[i]
            shuffled[i] = shuffled[j]
            shuffled[j] = temp
        }
        return shuffled
    }

    // 创建一个循环选择器
    const createCyclicPicker = (array) => {
        let shuffled = shuffleArray([...array]);
        let currentIndex = 0;
        let lastElementOfPreviousRound = null; // 记录上一轮的最后一个元素
    
        return {
            next: () => {
                const item = shuffled[currentIndex];
                currentIndex = (currentIndex + 1) % shuffled.length;
    
                // 当遍历完一轮时
                if (currentIndex === 0) {
                    const previousLastElement = shuffled[shuffled.length - 1]; // 保存当前轮的最后一个元素
                    shuffled = shuffleArray(shuffled); // 重新打乱数组
    
                    // 检查新数组的第一个元素是否与上一轮的最后一个元素相同
                    if (lastElementOfPreviousRound !== null && shuffled[0] === lastElementOfPreviousRound) {
                        // 找到第一个不等于上一轮最后一个元素的元素位置
                        let swapIndex = shuffled.findIndex(el => el !== lastElementOfPreviousRound);
                        if (swapIndex !== -1) {
                            // 交换第一个元素和该位置的元素
                            [shuffled[0], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[0]];
                        }
                    }
    
                    lastElementOfPreviousRound = previousLastElement; // 更新为当前轮的最后一个元素
                }
    
                return item;
            },
            reset: () => {
                shuffled = shuffleArray([...array]);
                currentIndex = 0;
                lastElementOfPreviousRound = null; // 重置记录
            }
        };
    };
    const createCyclicPicker_ = (array) => {
        let shuffled = shuffleArray([...array])
        let currentIndex = 0

        return {
            next: () => {
                const item = shuffled[currentIndex]
                currentIndex = (currentIndex + 1) % shuffled.length
                // console.log(`currentIndex:${currentIndex}`)
                if (currentIndex === 0) {
                    // 当遍历完一轮时，重新打乱数组
                    shuffled = shuffleArray(shuffled)
                }
                return item
            },
            reset: () => {
                shuffled = shuffleArray(shuffled)
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