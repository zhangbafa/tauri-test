class LoopAudio {
    constructor(audioPath, timeRange = [40, 50]) {
        this.audioPath = audioPath;
        this.audio = new Audio(audioPath);
        this.timeRange = timeRange;
        this.timer = null;
        this.isPlaying = false;
        this.volume = 1;
        this.playbackRate = 1;
        
        // 绑定方法
        this.handleAudioEnd = this.handleAudioEnd.bind(this);
    }

    // 获取10-30之间的随机秒数
    getRandomInterval() {
        const [min, max] = this.timeRange;
        const times = (Math.floor(Math.random() * (max - min + 1)) + min) * 1000;
        return times; // 将秒转换为毫秒
    }

    start() {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        this.playAudio(); // 立即播放一次

        // 设置下一次播放的定时器
        this.scheduleNextPlay();
    }

    scheduleNextPlay() {
        if (!this.isPlaying) return;

        const nextInterval = this.getRandomInterval();
        this.timer = setTimeout(() => {
            this.playAudio();
            this.scheduleNextPlay(); // 递归设置下一次播放
        }, nextInterval);
    }

    playAudio() {
        this.audio.currentTime = 0;
        this.audio.removeEventListener('ended', this.handleAudioEnd);
        this.audio.addEventListener('ended', this.handleAudioEnd);
        this.audio.volume = this.volume;
        this.audio.playbackRate = this.playbackRate;
        this.audio.play();
    }

    handleAudioEnd() {
        // 音频播放结束的处理逻铛播放结束')
    }

    stop() {
        // console.log('停止铃铛2')    
        // console.log(this.isPlaying)
        if (!this.isPlaying) return;
        
        this.isPlaying = false;
        this.audio.pause();
        this.audio.currentTime = 0;
        this.audio.removeEventListener('ended', this.handleAudioEnd);
        console.log('停止铃铛1')
        if (this.timer) {
            console.log('停止铃铛')
            clearTimeout(this.timer);
            this.timer = null;
        }
    }

    destroy() {
        this.stop();
        this.audio = null;
    }

    // 添加更新时间区间的方法
    updateTimeRange(newTimeRange,volume=1,playbackRate=1) {
        if (!Array.isArray(newTimeRange) || newTimeRange.length !== 2) {
            console.warn('时间区间格式必须是包含两个数字的数组');
            return;
        }
        const [min, max] = newTimeRange;
        if (min > max) {
            console.warn('最小值不能大于最大值');
            return;
        }
        
        this.timeRange = newTimeRange;
        this.volume = volume;
        this.playbackRate = playbackRate;
        
        // 如果正在播放，重新调度下一次播放
        if (this.isPlaying && this.timer) {
            clearTimeout(this.timer);
            this.scheduleNextPlay();
        }
    }
}

export default LoopAudio; 