import { defineConfig } from 'vite';

export default defineConfig({
  base: '/net-sportswear-website/',
  build: {
    rollupOptions: { input: { home: 'index.html', products: 'products.html', detail: 'detail.html' } },
  },
});
