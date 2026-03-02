import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // base: '/admin-system/', // 仓库名，使用 域名绑定 后注释
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://8.137.157.16:9002', // 后端服务器地址
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '') // 去掉 /api 前缀
      }
    }
  }
})
