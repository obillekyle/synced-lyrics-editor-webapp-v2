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

type FetchBodyTypes = 'json' | 'text'
export function useFetch<T>(url: string): FetchOptions<T>
export function useFetch(url: string, type: 'text'): FetchOptions<string>
export function useFetch<T>(url: string, type: 'json'): FetchOptions<T>
export function useFetch<T>(url: string, type: FetchBodyTypes = 'json') {
	let control = new AbortController()
	const data = shallowRef<T>()
	const status = shallowReactive({
		error: false,
		loading: true,
	})

	async function refetch() {
		status.loading && control.abort('Fetching?')
		control = new AbortController()

		status.error = false
		status.loading = true

		try {
			const res = await fetch(url, { signal: control.signal })

			if (!res.ok) {
				status.error = true
				return
			}
			data.value = type === 'json' ? await res.json() : await res.text()
		} catch (error) {
			console.error(error)
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
