/*
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: '8654bf2d-b682-477d-b74e-a6dcb1f0e2e7',
  baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
});

async function main() {
  // Non-streaming:
  console.log('----- standard request -----')
  const completion = await openai.chat.completions.create({
    messages: [
      { role: 'system', content: '你是豆包，是由字节跳动开发的 AI 人工智能助手' },
      { role: 'user', content: '常见的十字花科植物有哪些？' },
    ],
    model: 'ep-20250127160955-q86q2',
  });
  console.log(completion.choices[0]?.message?.content);

  // Streaming:
  console.log('----- streaming request -----')
  const stream = await openai.chat.completions.create({
    messages: [
      { role: 'system', content: '你是豆包，是由字节跳动开发的 AI 人工智能助手' },
      { role: 'user', content: '常见的十字花科植物有哪些？' },
    ],
    model: 'ep-20250127160955-q86q2',
    stream: true,
  });
  for await (const part of stream) {
    process.stdout.write(part.choices[0]?.delta?.content || '');
  }
  process.stdout.write('\n');
}

main();
*/