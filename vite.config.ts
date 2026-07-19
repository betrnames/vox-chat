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
        'blog-automation-roi': resolve(__dirname, 'blog/automation-roi.html'),
        'blog-missed-calls': resolve(__dirname, 'blog/missed-calls.html'),
        'blog-chatbots-vs-forms': resolve(__dirname, 'blog/chatbots-vs-forms.html'),
        'blog-google-reviews': resolve(__dirname, 'blog/google-reviews.html'),
        'blog-plumber-after-hours': resolve(__dirname, 'blog/plumber-after-hours.html'),
        'blog-electrician-leads': resolve(__dirname, 'blog/electrician-leads.html'),
        'blog-manteca-reviews': resolve(__dirname, 'blog/manteca-contractors-double-google-reviews.html'),
        'blog-turlock-missed-calls': resolve(__dirname, 'blog/turlock-missed-calls-costing-thousands.html'),
        'blog-ai-automation-guide': resolve(__dirname, 'blog/ai-automation-guide-central-valley-contractors.html'),
        legal: resolve(__dirname, 'legal.html'),
      },
    },
  },
})
