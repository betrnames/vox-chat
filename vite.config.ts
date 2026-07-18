import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        faq: resolve(__dirname, 'faq.html'),
        blog: resolve(__dirname, 'blog.html'),
        'blog-missed-calls': resolve(__dirname, 'blog/missed-calls.html'),
        'blog-chatbots-vs-forms': resolve(__dirname, 'blog/chatbots-vs-forms.html'),
        'blog-google-reviews': resolve(__dirname, 'blog/google-reviews.html'),
        'blog-plumber-after-hours': resolve(__dirname, 'blog/plumber-after-hours.html'),
        'blog-electrician-leads': resolve(__dirname, 'blog/electrician-leads.html'),
        legal: resolve(__dirname, 'legal.html'),
      },
    },
  },
})
