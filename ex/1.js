
// 使用示例
console.time('代码运行时间');
for (let index = 0; index < 1; index++) {
    let sentence = "欢迎{zhang,li,wang}来到直播间,{10,20，'a'}你好，现在是{time}";
    // 正则表达式匹配大括号内的内容
    let pattern = /\{([^}]+)\}/g;
    let newSentence = sentence.replace(pattern, (match, content) => {
        if (content === 'time') {
            // 获取当前时间
            let now = new Date();
            let hours = now.getHours().toString().padStart(2, '0');
            let minutes = now.getMinutes().toString().padStart(2, '0');
            let seconds = now.getSeconds().toString().padStart(2, '0');
            return `${hours}:${minutes}:${seconds}`;
        }
        console.log(content)
        let options = content.split(',');
        let randomIndex = Math.floor(Math.random() * options.length);
        return options[randomIndex];
    });

    console.log(newSentence);
    
}

processTemplate(text) {
    let pattern = /\{([^}]+)\}/g;
    let newSentence = sentence.replace(pattern, (match, content) => {
        if (content === 'time') {
            // 获取当前时间
            let now = new Date();
            let hours = now.getHours().toString().padStart(2, '0');
            let minutes = now.getMinutes().toString().padStart(2, '0');
            let seconds = now.getSeconds().toString().padStart(2, '0');
            return `${hours}:${minutes}:${seconds}`;
        }
        console.log(content)
        let options = content.split('|');
        let randomIndex = Math.floor(Math.random() * options.length);
        return options[randomIndex];
    });
    return newSentence
}

console.timeEnd('代码运行时间');