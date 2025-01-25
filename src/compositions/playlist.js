import { useForWithDelay } from '@/compositions/useForWithDelay.js'
const { fetchSpeech } = useForWithDelay()

class AudioPlaylist {
    constructor(audioList) {
        this.audioList = audioList;  // 音频文件路径数组
        this.currentIndex = 0;
        this.isPlaying = false;
        this.audio = new Audio();
        // 绑定方法到实例，避免多次创建函数引用
        this.handleAudioEnd = this.handleAudioEnd.bind(this);
    }

    handleAudioEnd() {
        if (this.currentAudioURL) {
            URL.revokeObjectURL(this.currentAudioURL);
            this.currentAudioURL = null;
        }
        this.isPlaying = false;
        setTimeout(() => {
            this.currentIndex++;
            if(this.currentIndex >= this.audioList.length){
                this.currentIndex = 0;
            }
            this.play();
        }, 2000);  // 3秒延迟
    }
    play() {
        if (this.isPlaying || this.currentIndex >= this.audioList.length) {
            return;
        }

        this.isPlaying = true;
        const currentItem = this.audioList[this.currentIndex];
        
        // Check if current item is a text that needs speech synthesis
        const processAudioSource = async () => {
            let audioSource;
            // 、、typeof currentItem === 'string' && currentItem.startsWith('text:')
            if (1) {
                const text = currentItem; // Remove 'text:' prefix
                try {
                    audioSource = await fetchSpeech(text);
                    this.currentAudioURL = URL.createObjectURL(audioSource);
                    this.audio.src = this.currentAudioURL;
                } catch (error) {
                    console.error('Failed to fetch speech:', error);
                    return;
                }
            } else {
                // Clear any previous Blob URL
                if (this.currentAudioURL) {
                    URL.revokeObjectURL(this.currentAudioURL);
                    this.currentAudioURL = null;
                }
                this.audio.src = currentItem;
            }

            this.audio.volume = 1;
            this.audio.playbackRate = 1;
            // 确保每次播放前移除之前的事件监听器
            this.audio.removeEventListener('ended', this.handleAudioEnd);
            this.audio.addEventListener('ended', this.handleAudioEnd);
            this.audio.play();
        };

        processAudioSource();
    }
    play2() {
        if (this.isPlaying || this.currentIndex >= this.audioList.length) {
            return;
        }

        this.isPlaying = true;
        console.log(this.audioList[this.currentIndex])
        this.audio.src = this.audioList[this.currentIndex];
        this.audio.volume = 1
        this.audio.playbackRate = 1
        // // 确保每次播放前移除之前的事件监听器
        this.audio.removeEventListener('ended', this.handleAudioEnd);
        this.audio.addEventListener('ended', this.handleAudioEnd);
        this.audio.play();
    }

    stop() {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.isPlaying = false;
        // 停止时移除事件监听器
        this.audio.removeEventListener('ended', this.handleAudioEnd);
    }

    reset() {
        this.stop();
        this.currentIndex = 0;
    }

    // 添加销毁方法
    destroy() {
        this.stop();
        this.audio = null;
        this.audioList = null;
    }
}

export default AudioPlaylist;
