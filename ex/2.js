// 配置对象（便于维护和扩展）
const config = {
    pattern: /\{([^{}]+)\}/g, // 基础匹配模式
    fallbackHandler: (variable) => `[未定义变量:${variable}]`, // 未定义变量处理
    enableCache: true,        // 开启缓存
    cacheTTL: 60_000,         // 缓存保留时间(ms)
    logPerformance: true     // 开启性能日志
  };
  
  // 缓存系统（带过期机制）
  const cache = {
    options: new Map(),
    lastClean: Date.now(),
    get(key) {
      const entry = this.options.get(key);
      return entry && entry.expire > Date.now() ? entry.data : null;
    },
    set(key, data) {
      this.options.set(key, {
        data,
        expire: Date.now() + config.cacheTTL
      });
      // 自动清理过期缓存
      if (Date.now() - this.lastClean > 5_000) {
        this.options.forEach((v, k) => {
          if (v.expire <= Date.now()) this.options.delete(k);
        });
        this.lastClean = Date.now();
      }
    }
  };
  
  // 特殊处理函数注册表
  const handlers = new Map();
  handlers.set('time', {
    handler: () => {
      const d = new Date();
      return [d.getHours(), d.getMinutes(), d.getSeconds()]
        .map(n => n.toString().padStart(2, '0')).join(':');
    },
    singleton: true // 标识是否全局单例
  });
  
  // 核心处理函数
  function processTemplate(template) {
    // 性能监控
    const perfStart = config.logPerformance ? performance.now() : 0;
    let hasBrace = false;
  
    const result = template.replace(config.pattern, (fullMatch, content) => {
    //   hasBrace = true;
    // return 'zhang'
      return processVariable(content.trim());
    });
  
    if (config.logPerformance) {
      const time = performance.now() - perfStart;
      console.log(`处理耗时：${time.toFixed(2)}ms`, 
        hasBrace ? `(包含${(result.match(config.pattern) || []).length}处替换)` : '(无替换)');
    }
  
    return result;
  }
  
  // 变量处理逻辑
  function processVariable(content) {
    // 处理特殊变量
    if (handlers.has(content)) {
      const { handler, singleton } = handlers.get(content);
      return handler();
    }
  
    // 处理普通选项
    const cached = config.enableCache ? cache.get(content) : null;
    const options = cached || parseOptions(content);
    
    if (config.enableCache && !cached) {
      cache.set(content, options);
    }
  
    return options.length > 0 
      ? options[Math.random() * options.length | 0]
      : config.fallbackHandler(content);
  }
  
  // 单例值处理（如time）
//   const singletonCache = new Map();
//   function singletonValue(name, handler) {
//     if (!singletonCache.has(name)) {
//       singletonCache.set(name, {
//         value: handler(),
//         timer: setInterval(() => {
//           singletonCache.set(name, { value: handler() });
//         }, 1000) // 每秒刷新时间
//       });
//     }
//     return singletonCache.get(name).value;
//   }
  
  // 高级选项解析（支持带逗号的复杂值）
  function parseOptions(content) {
    const options = [];
    let buffer = '';
    let quoteChar = '';
    
    for (const char of content) {
      if ((char === "'" || char === '"') && !quoteChar) {
        quoteChar = char;
        continue;
      }
  
      if (char === quoteChar) {
        quoteChar = '';
        continue;
      }
  
      if (char === ',' && !quoteChar) {
        options.push(buffer.trim());
        buffer = '';
        continue;
      }
  
      buffer += char;
    }
  
    if (buffer) options.push(buffer.trim());
    return options.filter(s => s.length > 0);
  }
  
  /****************** 使用示例 ******************/
  // 情况1：没有大括号
//   console.log(processTemplate("欢迎来到直播间")); 
  // 输出：欢迎来到直播间
  
  // 情况2：包含特殊变量
  console.time('代码运行时间');
const a = processTemplate("欢迎{zhang,li,wang}来到直播间,{10,20,'a'}你好，现在是{t的ime},nihao{hello world,世界},欢迎{zhang,li,wang}欢迎{zhang,li,wang}欢迎{zhang,li,wang}欢迎{zhang,li,wang}欢迎{zhang,li,wang}欢迎{zhang,li,wang}欢迎{zhang,li,wang}欢迎{zhang,li,wang}欢迎{zhang,li,wang}欢迎{zhang,li,wang}欢迎{zhang,li,wang}欢迎{zhang,li,wang}欢迎{zhang,li,wang}欢迎{zhang,li,wang}欢迎{zhang,li,wang}欢迎{zhang,li,wang}欢迎{zhang,li,wang}欢迎{zhang,li,wang}欢迎{zhang,li,wang}欢迎{zhang,li,wang}欢迎{zhang,li,wang}欢迎{zhang,li,wang}欢迎{zhang,li,wang}欢迎{zhang,li,wang}欢迎{zhang,li,wang}欢迎{zhang,li,wang}欢迎{zhang,li,wang}欢迎{zhang,li,wang}欢迎{zhang,li,wang}欢迎{zhang,li,wang}欢迎{zhang,li,wang}欢迎{zhang,li,wang}欢迎{zhang,li,wang}欢迎{zhang,li,wang}欢迎{zhang,li,wang}欢迎{zhang,li,wang}欢迎{zhang,li,wang}欢迎{zhang,li,wang}");
// console.log(a)
  // 输出：当前时间：14:05:23
  console.timeEnd('代码运行时间');
  // 情况3：混合内容
//   const template = "欢迎{zhang, li,  wang  }，今天是{date}，现在{time}";
//   handlers.set('date', { handler: () => new Date().toLocaleDateString() });
//   console.log(processTemplate(template));
  // 输出：欢迎li，今天是2023/7/29，现在14:05:24
  
  // 情况4：未定义变量
//   console.log(processTemplate("无效变量：{date}"));
// 
// 使用示例
// console.time('代码运行时间');
// for (let index = 0; index < 2; index++) {
//     const sentence = "欢迎{zhang,li,wang}来到直播间,{10,20,'a,b'}你好，现在是{contnet}";
//     const a = processSentence(sentence)
//     console.log(a)
    
// }

// console.timeEnd('代码运行时间');