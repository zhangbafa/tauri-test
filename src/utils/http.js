// API Key 和推理接入点 ID
const API_KEY = '8654bf2d-b682-477d-b74e-a6dcb1f0e2e7'; // 替换为你的 API Key
const MODEL_ID = 'ep-20250127160955-q86q2'; // 替换为你的推理接入点 ID
// API 地址
const API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

// 请求参数
const requestBody = {
  model: MODEL_ID,
  messages: [
    { role: 'system', content: '你是豆包，是由字节跳动开发的 AI 人工智能助手' },
    { role: 'user', content: '你可以做什么，简短回答' },
  ],
  stream: true, // 是否流式返回
  max_tokens: 4096, // 模型回复最大长度
  temperature: 0.8, // 采样温度
  top_p: 0.7, // 核采样概率阈值
};

// 发送请求
async function sendRequest() {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`请求失败: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    console.log('响应数据:', data);
  } catch (error) {
    console.error('请求出错:', error.message);
  }
}

// 调用函数
// sendRequest();

// 发送流式请求
async function sendStreamRequest() {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`请求失败: ${errorData.message || response.statusText}`);
    }

    // 处理流式响应
    const reader = response.body.getReader();
    console.log(reader)
    reader.closed
    .then(() => {
      console.log('流已正常关闭');
    })
    .catch((err) => {
      console.error('流发生错误:', err);
    }); 
    const decoder = new TextDecoder('utf-8');

    while (true) {
      const { done, value } = await reader.read();
      console.log(done,value)
      if (done) break;
     

      // 解码流式数据
      const chunk = decoder.decode(value);
      // console.log('收到流式数据:', chunk);

      // 解析 SSE 格式的数据
      chunk
        .split('\n\n') // SSE 数据以双换行符分隔
        .filter(Boolean) // 过滤空行
        .forEach((event) => {
          if (event === 'data: [DONE]') {
            console.log('流式响应结束');
            return;
          }

          try {
            const data = JSON.parse(event.replace('data: ', '')); // 去掉 "data: " 前缀
            console.log('解析后的数据:', data.choices[0].delta);
          } catch (error) {
            console.error('解析流式数据出错:', error);
          }
        });
    }
  } catch (error) {
    console.error('请求出错:', error.message);
  }
}

// 调用流式请求函数

sendStreamRequest();