import { URL, fileURLToPath } from 'node:url'

import path from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { dependencies } from './package.json'

const vendor = ['vue']
const exclude = ['@capacitor', 'cordova', 'ionic']
const modules = Object.keys(dependencies)

const chunks = (() => {
	return modules.reduce(
		(prev, current) => {
			if (vendor.includes(current) || current.match(RegExp(exclude.join('|'))))
				return prev

			prev[current] = [current]
			return prev
		},
		{} as Record<string, string[]>,
	)
})()

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		vue(),
		VitePWA({
			registerType: 'autoUpdate',
			includeAssets: ['**/*.{svg,png,jpg,gif,webp,ico,woff2,json,md}'],
			pwaAssets: {
				preset: 'minimal-2023',
				image: 'public/logo.svg',
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
					const name = chunkInfo.name
					// biome-ignore lint/suspicious/noExplicitAny: <explanation>
					const version = (dependencies as any)[name]
					if (name === 'vendor' && !version) return 'bin/vendor.js'
					if (version?.startsWith('github')) return 'modules/[name].js'

					return `modules/${name}_${version}.js`
				},

				assetFileNames: (assetInfo) => {
					const { name: _name, ext } = path.parse(assetInfo.name ?? '')
					return ext === '.css'
						? `styles/${_name}${ext}`
						: `assets/${_name}${ext}`
				},

				entryFileNames: (_entry) => {
					return 'bin/[name].js'
				},
			},
		},
		minify: true,
	},
	css: {
		preprocessorOptions: {
			scss: {
				api: 'modern-compiler',
			},
		},
	},
})
