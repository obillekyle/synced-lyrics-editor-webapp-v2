import { toProxy } from '@vue-material/core'
import { computed, onUnmounted, shallowReactive, shallowRef, watch } from 'vue'

type FetchResult<T> =
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

type FetchInit = Omit<RequestInit, 'signal'>

type UseFetch = {
	(
		url: string,
		type: 'text' | 'url-blob',
		init?: FetchInit,
	): FetchResult<string>
	(url: string, type: 'blob', init?: FetchInit): FetchResult<Blob>
	<T>(
		url: string,
		type?: 'json' | (string & {}),
		init?: FetchInit,
	): FetchResult<T>
}

export const useFetch: UseFetch = (
	url: string,
	type = 'json',
	init?: Omit<RequestInit, 'signal'>,
) => {
	let control = new AbortController()
	const data = shallowRef()
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
			const res = await fetch(url, { ...init, signal: control.signal })

			if (!res.ok) {
				status.error = true
				return
			}

			switch (type) {
				case 'json':
					data.value = await res.json()
					break
				case 'text':
					data.value = await res.text()
					break
				case 'blob':
					data.value = await res.blob()
					break
				case 'url-blob':
					data.value && URL.revokeObjectURL(data.value)
					data.value = URL.createObjectURL(await res.blob())
					break
				default:
					throw new Error('Invalid useFetch data type')
			}
		} catch (error) {
			console.error(error)
			status.error = true
		} finally {
			status.loading = false
		}
	}

	onUnmounted(() => control.abort())
	watch(() => url, refetch, { immediate: true })

	return toProxy(
		computed(
			() =>
				({
					data: data.value,
					error: status.error,
					loading: status.loading,
					refetch,
					// biome-ignore lint/suspicious/noExplicitAny: function returns multiple types of data
				}) as FetchResult<any>,
		),
	)
}
