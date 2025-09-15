import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    viteStaticCopy({
      targets: [
        {
          src: 'public/_redirects', // make sure this file exists in your public folder
          dest: '.'                 // copy into dist/
        }
      ]
    })
  ],
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1000,
  },
})
