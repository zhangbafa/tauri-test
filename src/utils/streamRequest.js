import { invoke } from '@tauri-apps/api/tauri';
import { listen } from '@tauri-apps/api/event';

export async function streamRequest(url, options = {}, onChunk = null) {
  // 如果是流式请求
  if (options.stream) {
    return new Promise(async (resolve, reject) => {
      // 监听数据块事件
      const unlisten = await listen('stream-data', (event) => {
        if (onChunk) {
          onChunk(event.payload);
        }
      });

      try {
        await invoke('fetch_stream', {
          url,
          headers: options.headers || {},
          body: options.body || ''
        });
        resolve();
      } catch (error) {
        reject(error);
      } finally {
        unlisten();
      }
    });
  }

  // 非流式请求使用 Tauri 的 HTTP 插件
  const response = await invoke('fetch_request', {
    url,
    options
  });

  return response;
} 