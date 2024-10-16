import { toProxy } from '@vue-material/core'
import {
	computed,
	onMounted,
	onUnmounted,
	shallowReactive,
	shallowRef,
} from 'vue'

type FetchOptions<T> =
	| {
			data: undefined
			error: false
			loading: true
			refetch: () => Promise<T>
	  }
	| {
			data: T
			error: false
			loading: false
			refetch: () => Promise<T>
	  }
	| {
			data: undefined
			error: true
			loading: false
			refetch: () => Promise<T>
	  }

export function useFetch<T>(url: string) {
	const control = new AbortController()
	const data = shallowRef<T>()
	const status = shallowReactive({
		error: false,
		loading: true,
	})

	async function refetch() {
		control.abort()
		status.error = false
		status.loading = true
		try {
			const res = await fetch(url, { signal: control.signal })

			if (!res.ok) {
				status.error = true
				return
			}

			data.value = await res.json()
		} catch (error) {
			status.error = true
		} finally {
			status.loading = false
		}
	}

	onMounted(refetch)
	onUnmounted(() => control.abort())

	return toProxy(
		computed(
			() =>
				({
					data: data.value,
					error: status.error,
					loading: status.loading,
					refetch,
				}) as FetchOptions<T>,
		),
	)
}
