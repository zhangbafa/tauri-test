const processTemplate=(text) =>{
    let pattern = /\{([^}]+)\}/g;
    let newSentence = text.replace(pattern, (match, content) => {
        if (content === 'time') {
            return setTimeParseTime()
        }
        let options = content.split('|');
        let randomIndex = Math.floor(Math.random() * options.length);
        return options[randomIndex];
    });
    return newSentence
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
      if(hour==2){
        hour = '两'
      }
    } else if (hour >= 18) {
      hour_str = '晚上';
      hour = hour - 12
    }else {
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

export {
    processTemplate,
    setTimeParseTime
}