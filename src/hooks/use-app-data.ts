import type { LRCData, LRCLine } from '@/api/parser2'
import { toProxy, useIDBStorage } from '@vue-material/core'
import { inject, provide } from 'vue'

type AppData = {
	lrc: LRCData
	audio?: Blob
}

export function useAppData() {
	const data = inject(
		'app-data',
		useIDBStorage<AppData>('app-data', { lrc: { lines: {}, tags: {} } }),
	)

	provide('app-data', data)
	return toProxy(data)
}
