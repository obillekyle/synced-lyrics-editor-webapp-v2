import type { Screens } from '@/app/main'
import { useLocalStorage } from '@vue-material/core'
import { type Ref, inject, provide } from 'vue'

export function useShared<T>(key: string, defaultValue: T): Ref<T> {
	const shared = inject(key, useLocalStorage<T>(key, defaultValue))
	provide(key, shared)

	return shared
}
