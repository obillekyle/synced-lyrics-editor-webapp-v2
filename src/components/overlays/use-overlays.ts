import { inject } from 'vue'

export type AppOverlays = {
	download: () => void
	changelog: () => Promise<void>
	useAudioLRC: () => void
	useQueryLRC: (lrc: string) => void
	uploadNewLrc: () => void
	showKeyBinds: () => void
	openSettings: () => void
}

export function useOverlays(data?: AppOverlays) {
	const overlays = inject('app-overlays', data)

	if (!overlays) {
		throw new Error('Overlays not found')
	}

	return overlays
}
