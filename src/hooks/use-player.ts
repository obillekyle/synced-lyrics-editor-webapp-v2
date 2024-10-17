import { inject } from 'vue'

export function usePlayer() {
	const player = inject('app-player', null)
	return player
}
