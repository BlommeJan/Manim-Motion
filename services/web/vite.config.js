import { defineConfig } from 'vite';
import vue2 from '@vitejs/plugin-vue2';

const apiTarget = process.env.VITE_API_TARGET || 'http://localhost:3000';

export default defineConfig({
  plugins: [vue2()],
  resolve: {
    alias: {
      vue: 'vue/dist/vue.esm.js'
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true
      },
      '/health': {
        target: apiTarget,
        changeOrigin: true
      }
    }
  }
});
