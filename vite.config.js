import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // base: '/admin-system/', // 仓库名，使用 域名绑定 后注释
  plugins: [react()],
})
