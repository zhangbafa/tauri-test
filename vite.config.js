import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite';
import { ArcoResolver } from 'unplugin-vue-components/resolvers';
import path from 'path'
const host = process.env.TAURI_DEV_HOST;

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ArcoResolver()],
    }), 
    Components({
      resolvers: [ArcoResolver({sideEffect: true})],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    
    // 新增代理配置
    proxy: {
      // 示例：将所有以 /api 开头的请求代理到目标服务器
      '/api': {
        target: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions', // 替换为你的后端地址
        changeOrigin: true, // 改变 origin 头
        rewrite: (path) => path.replace(/^\/api/, ''), // 路径重写（可选）
        // 更多配置选项...
      },
      // 可以添加多个代理规则
      '/tikhub': {
        target: 'https://api.tikhub.io/api/v1/douyin/web/fetch_live_room_product_result',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/tikhub/, ''), // 路径重写（可选）
        // ...
      }
    },
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
}));