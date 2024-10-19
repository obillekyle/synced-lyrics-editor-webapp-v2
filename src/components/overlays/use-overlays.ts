import { toProxy } from '@vue-material/core'
import { watch } from 'vue'
import { type Ref, computed, inject } from 'vue'

export type AppOverlays = {
	download: () => void
	changelog: () => Promise<void>
	useAudioLRC: () => void
	useQueryLRC: (lrc: string) => void
	uploadNewLrc: () => void
	showKeyBinds: () => void
	openSettings: () => void
}

const DEFAULT_OVERLAYS: AppOverlays = {
	download: () => {},
	changelog: () => Promise.resolve(),
	useAudioLRC: () => {},
	useQueryLRC: () => {},
	uploadNewLrc: () => {},
	showKeyBinds: () => {},
	openSettings: () => {},
}

export function useOverlays(data?: Ref<AppOverlays>) {
	const overlays = inject('app-overlays', undefined)
	const proxied = computed(() => data?.value ?? overlays ?? DEFAULT_OVERLAYS)
	return toProxy(proxied, true)
}
