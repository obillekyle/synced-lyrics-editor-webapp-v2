import { Buffer } from 'buffer'
import LRCParser from '@/api/parser2'
import MusicService from '@/api/service'
import { loadIcons } from '@iconify/vue/dist/iconify.js'
import process from 'process'
import Clipboard from './api/clipboard'
import { AppIcons } from './app/icons'
import type { AppOverlays } from './components/overlays/use-overlays'

const appVer = Number(import.meta.env.VITE_VERSION_CODE ?? 0)
const appVerString = import.meta.env.VITE_VERSION ?? 'unknown'

declare global {
	interface Window {
		app: {
			version: number
			version_string: string
			player: MusicService
			lyric: LRCParser
			clipboard: Clipboard
			pwa: Event | null
			presets?: AppOverlays
		}
		Buffer: typeof Buffer
		process: typeof process
	}
}

loadIcons(AppIcons)

window.app = {
	version: appVer,
	version_string: appVerString,

	player: new MusicService(),
	lyric: new LRCParser(),
	clipboard: new Clipboard(),
	pwa: null,
}

window.addEventListener('beforeinstallprompt', (event) => {
	event.preventDefault()
	window.app.pwa = event
})

window.Buffer = Buffer
window.process = process
