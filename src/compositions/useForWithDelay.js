// useAudioPlayer.js
import { ref, onUnmounted, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue'

export function useForWithDelay() {

  const buildUrl = (config) => {
    const queryParams = new URLSearchParams(
      Object.entries(config.params).map(([key, value]) => [key, String(value)])
    );
    return `${config.baseUrl}?${queryParams.toString()}`;
  }

  const fetchSpeech = async (text,model_id=0) => {
    const voiceRequestConfig = {
      baseUrl: 'http://127.0.0.1:5876/voice',
      params: {
        text: text,
        model_id: model_id,
        speaker_id: 0,
        sdp_ratio: 0.2,
        noise: 0.2,
        noisew: 0.9,
        length: 1,
        auto_translate: false,
        auto_split: false,
        style_weight: 0.7
      }
    };
    const url = buildUrl(voiceRequestConfig);
    const options = {
      method: 'GET',
      headers: {
        'accept': 'application/json'
      }
    };
    const response = await fetch(url, options)
    const blob = await response.blob();
    return blob
  }

  const setTimeParseTime = () => {
    const date = new Date()
    let hour = date.getHours()
    const minute = date.getMinutes()
    let hour_str = ''
    if (hour < 6) {
      hour_str = '凌晨';
    } else if (hour === 12) {
      hour_str = '中午';
    } else if (hour > 12 && hour < 18) {
      hour_str = '下午';
      hour = hour - 12
    } else if (hour >= 18) {
      hour_str = '晚上';
      hour = hour - 12
    } else {
      hour_str = '早上';
    }
    // console.log(minute)
    let minute_str = ''
    if(minute<10){
      minute_str='零'+minute
    }else{
      minute_str=minute
    }
    return `现在是${hour_str}${hour}点${minute_str}分 `
  }
  const processUsername = (username) => {
    let result = '';
    if(username.indexOf('*')>-1){
      return ''
    }
    for (let i = 0; i < username.length; i++) {
        let charCode = username.charCodeAt(i);
        if ((charCode >= 0x4e00 && charCode <= 0x9fff) || (charCode >= 48 && charCode <= 57) || (charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122)) {
            result += username[i];
        }
    }
    return result;
}

  // while 循环的方式定时运行
  async function printArrayWithDelay(array) {
    let index = 0;
    while (shouldContinue.value) {
      console.log(array[index]);
      // await fetchSpeech()
      index = (index + 1) % array.length;
      await new Promise(resolve => setTimeout(resolve, 1000 * 60 * 5));
    }
  }

  return {
    setTimeParseTime,
    processUsername,
    fetchSpeech,
    printArrayWithDelay
  };
}