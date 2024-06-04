import { URL, fileURLToPath } from 'node:url';

import { defineConfig } from 'vite';
import { dependencies } from './package.json';
import path from 'path';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';
import { minimal2023Preset } from '@vite-pwa/assets-generator/config';

const vendor = ['vue'];
const exclude = ['@capacitor', 'cordova', 'ionic'];
const modules = Object.keys(dependencies);

const chunks = (() => {
  return modules.reduce((prev, current) => {
    if (vendor.includes(current) || current.match(RegExp(exclude.join('|'))))
      return prev;
    return {
      ...prev,
      [current]: [current],
    };
  }, {});
})();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['**/*.{svg,png,jpg,gif,webp,ico,woff2,json,md}'],
      pwaAssets: {
        overrideManifestIcons: true,
        preset: minimal2023Preset,
        htmlPreset: '2023',
        includeHtmlHeadLinks: true,
      },
      workbox: {
        cleanupOutdatedCaches: false,
      },
      manifest: {
        name: 'Synced Lyrics Editor',
        short_name: 'LRC Editor',
        description:
          'A web-based lyrics editor with sync and formatting support.',
        start_url: '/',
        display: 'standalone',
        background_color: '#101010',
        theme_color: '#101010',
        icons: [
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png',
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'node:buffer': 'buffer',
      'node:process': 'process',
    },
  },
  define: {
    'process.env.NODE_DEBUG': false,
  },
  build: {
    target: 'esnext',
    cssCodeSplit: true,
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor,
          ...chunks,
        },

        chunkFileNames: (chunkInfo) => {
          const name = chunkInfo.name;
          const version = (dependencies as any)[name];
          if (name === 'vendor' && !version) return 'bin/vendor.js';
          if (version && version.startsWith('github'))
            return 'modules/[name].js';

          return `modules/${name}_${version}.js`;
        },

        assetFileNames: (assetInfo) => {
          const { name: _name, ext } = path.parse(assetInfo.name!);
          return ext === '.css'
            ? `styles/${_name}${ext}`
            : `assets/${_name}${ext}`;
        },

        entryFileNames: (_entry) => {
          return 'bin/[name].js';
        },
      },
    },
    minify: true,
  },
});
