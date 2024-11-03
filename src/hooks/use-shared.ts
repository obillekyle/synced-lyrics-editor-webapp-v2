import { useLocalStorage } from '@vue-material/core'
import { type Ref, inject, provide } from 'vue'

export function useShared<T>(key: string, defaultValue: T): Ref<T> {
	const shared = inject(key, undefined)

	if (shared) return shared

	const storage = useLocalStorage(key, defaultValue)

	provide(key, storage)
	return storage
}
