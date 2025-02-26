import { useForWithDelay } from '@/compositions/useForWithDelay.js'
import { emit } from '@tauri-apps/api/event';
import {useRandomPicker} from './useRandomPicker.js'
const { fetchSpeech } = useForWithDelay()
const { getRandomElement,createCyclicPicker } = useRandomPicker()
import { processTemplate } from '@/utils/index.js'
import wav01 from "@/assets/wav/01.wav";
class AudioPlaylist {
    constructor(audioList) {
        this.audioList = audioList;  // 音频文件路径数组
        this.currentIndex = 0;
        this.isPlaying = false;
        this.audio = new Audio();
        this.currentAudioURL = null
        this.timer = null
        // 绑定方法到实例，避免多次创建函数引用
        this.handleAudioEnd = this.handleAudioEnd.bind(this);
        this.cyclicPicker = createCyclicPicker(this.audioList)
    }
    revokeObjectURL(){
        if (this.currentAudioURL) {
            URL.revokeObjectURL(this.currentAudioURL);
            this.currentAudioURL = null;
        }
    }
    updateList(audioList) {
        if (!Array.isArray(audioList)) {
            console.error('audioList must be an array');
            return;
        }
        // this.stop(); // 停止当前播放
        this.audioList = audioList;
        this.cyclicPicker = createCyclicPicker(audioList)
        emit('addLog',{time:new Date().toLocaleString(),role:'用户',logtext:'主播话术更新成功'})
        // this.currentIndex = 0; // 重置播放索引
        // this.isPlaying = false;
    }
    handleAudioEnd() {
        // 先移除事件监听器
        this.audio.removeEventListener('ended', this.handleAudioEnd);
        // emit('setAnchorVolume',{action:'setvolume',volume:1})
        emit('smartscene',{action:'setvolume',volume:1})
        // 清理URL资源
        this.revokeObjectURL()
        this.isPlaying = false;
        // 重置音频状态
        this.audio.currentTime = 0;
        this.timer =  setTimeout(() => {
            this.currentIndex++;
            if(this.currentIndex >= this.audioList.length){
                this.currentIndex = 0;
            }
            this.play();
        }, 100);  // 2秒延迟
    }
    play(model_id=0) {
        if (this.isPlaying || this.currentIndex >= this.audioList.length) {
            return;
        }

        this.isPlaying = true;
        // 顺序播放
        // const currentItem = this.audioList[this.currentIndex];
        // 随机播放
        const currentItem = this.cyclicPicker.next()
        // Check if current item is a text that needs speech synthesis
        const processAudioSource = async () => {
            let audioSource;
            // 、、typeof currentItem === 'string' && currentItem.startsWith('text:')
            if (1) {
                const text = processTemplate(currentItem); 
                try {
                   // console.log(this.audioList)
                   // console.log(processTemplate(text))
                    audioSource = await fetchSpeech(text,model_id);
                    this.currentAudioURL = URL.createObjectURL(audioSource);
                    this.audio.src = this.currentAudioURL;
                    emit('addLog',{time:new Date().toLocaleString(),role:'主播',logtext:text})

                } catch (error) {
                    console.error('Failed to fetch speech:', error);
                    return;
                }
            } else {
                // Clear any previous Blob URL
                this.revokeObjectURL();
                this.audio.src = currentItem;
            }

            // 先清理之前的资源
            // this.revokeObjectURL();
            this.audio.volume = 1;
            this.audio.playbackRate = 1;


            // 确保每次播放前移除之前的事件监听器
            this.audio.removeEventListener('ended', this.handleAudioEnd);
            this.audio.addEventListener('ended', this.handleAudioEnd);
            // emit('setAnchorVolume',{action:'setvolume',volume:0.2})
            emit('smartscene',{action:'setvolume',volume:0.2})
            this.audio.play();
        };

        processAudioSource();
    }

    setVolume(volume){
        this.audio.volume = volume
    }

    setSinkId(id){
        this.audio.setSinkId = id
    }

    stop() {
        // 先移除事件监听器，避免触发自动播放
        if(this.timer){
            clearTimeout(this.timer)
            this.timer = null
        }
        this.audio.removeEventListener('ended', this.handleAudioEnd);
        this.audio.pause();
        this.audio.currentTime = 0;
        this.isPlaying = false;
        // 最后清理URL资源
        this.revokeObjectURL()
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
