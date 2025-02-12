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
      baseUrl: 'aiapi/voice',
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
    processUsername,
    fetchSpeech,
    printArrayWithDelay
  };
}