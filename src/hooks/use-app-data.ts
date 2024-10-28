import type { LRCData, LRCLine } from '@/api/parser2'
import { IDBStorage, toProxy, useIDBStorage } from '@vue-material/core'
import { inject, onUnmounted, provide, watch } from 'vue'

type AppData = {
	lrc: LRCData
	audio?: Blob
}

export function useAppData(): AppData {
	const injected = inject<AppData | undefined>('app-data', undefined)

	if (injected) return injected

	let ignore = false
	let ignoreAudio = false

	const Lyrics = window.app.lyric
	const Player = window.app.player

	const idb = useIDBStorage('app-data', { lrc: { lines: {}, tags: {} } })
	const data = toProxy(idb) as AppData

	function storageUpdate() {
		ignore = true
		ignoreAudio = true
		Lyrics.import(data.lrc)
	}

	function onUpdate() {
		if (ignore) {
			ignore = false
			return
		}

		data.lrc = Lyrics.getRaw()
	}

	function onAudioUpdate() {
		if (ignoreAudio) {
			ignoreAudio = false
			return
		}

		data.audio = Player.file
	}

	watch(idb.ready, () => {
		if (data.audio) {
			ignore = true
			ignoreAudio = true
			Player.updateFile(data.audio)
		}

		Lyrics.import(data.lrc)
		IDBStorage.addEventListener('storage', storageUpdate)
		Player.addEventListener('update', onAudioUpdate)
		Lyrics.addEventListener('update', onUpdate)
	})

	onUnmounted(() => {
		IDBStorage.removeEventListener('storage', storageUpdate)
		Player.removeEventListener('update', onAudioUpdate)
		Lyrics.removeEventListener('update', onUpdate)
	})

	provide('app-data', data)
	return data
}
