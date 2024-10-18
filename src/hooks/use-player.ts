import { inject } from 'vue'

export function usePlayer() {
	return inject('app-player', null)
}
