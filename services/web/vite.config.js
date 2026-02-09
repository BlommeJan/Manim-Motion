import { defineConfig } from 'vite';
import vue2 from '@vitejs/plugin-vue2';

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
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/health': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
});
