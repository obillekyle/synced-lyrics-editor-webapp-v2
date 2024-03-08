import { URL, fileURLToPath } from 'node:url'

import { defineConfig } from 'vite'
import { dependencies } from './package.json'
import path from 'path'
import vue from '@vitejs/plugin-vue'

const vendor = ['vue']
const exclude = ['@capacitor', 'cordova', 'ionic']
const modules = Object.keys(dependencies)

const chunks = (() => {
  return modules.reduce((prev, current) => {
    if (vendor.includes(current) || current.match(RegExp(exclude.join('|'))))
      return prev
    return {
      ...prev,
      [current]: [current],
    }
  }, {})
})()


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'node:buffer': 'buffer',
      'node:process': 'process',
    }
  },
  define: {
    'process.env.NODE_DEBUG': false,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor,
          ...chunks,
        },

        chunkFileNames: (chunkInfo) => {
          console.log(chunkInfo.name);
          const name = chunkInfo.name;
          const version = (dependencies as any)[name]

          return `modules/${name}_${version}.js`
        },

        assetFileNames: (assetInfo) => {
          const { name: _name, ext } = path.parse(assetInfo.name!)
          if (ext === '.css') {
            return `styles/${_name}${ext}`
          }
          return `assets/${_name}${ext}`
        },

        entryFileNames: (_entry) => {
          return "app.js"
        },
      },
    },
    minify: true,
    sourcemap: true
  }
})
