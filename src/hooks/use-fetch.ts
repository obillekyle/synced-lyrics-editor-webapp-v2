import { type MaybeFunction, evaluate, toProxy } from '@vue-material/core'
import {
	type Ref,
	computed,
	isRef,
	onUnmounted,
	shallowReactive,
	shallowRef,
	watch,
} from 'vue'

type FetchResult<T> =
	| {
			data: undefined
			error: false
			loading: true
			progress: number
			refetch: () => Promise<T>
	  }
	| {
			data: T
			error: false
			loading: false
			progress: number
			refetch: () => Promise<T>
	  }
	| {
			data: undefined
			error: true
			loading: false
			progress: number
			refetch: () => Promise<T>
	  }

type FetchInit = {
	withCredentials?: boolean
	headers?: Record<string, string>
}

type UseFetch = {
	(
		url: string | Ref<string>,
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
	url: MaybeFunction<string> | Ref<string>,
	type = 'json',
	init?: FetchInit,
) => {
	let xhr: XMLHttpRequest
	const data = shallowRef()
	const status = shallowReactive({
		error: false,
		loading: true,
		progress: 0,
	})

	async function request(url: string) {
		status.loading && xhr?.abort()

		status.error = false
		status.loading = true

		xhr = new XMLHttpRequest()
		xhr.open('GET', url, true)

		xhr.withCredentials = init?.withCredentials ?? false

		xhr.responseType =
			type === 'url-blob' ? 'blob' : (type as XMLHttpRequestResponseType)

		for (const [key, value] of Object.entries(init?.headers || {})) {
			xhr.setRequestHeader(key, value)
		}

		xhr.onprogress = (event) => {
			status.progress = (event.total ? event.loaded / event.total : 0) * 100
		}

		xhr.onload = () => {
			switch (type) {
				case 'json':
				case 'text':
				case 'blob':
					data.value = xhr.response
					break
				case 'url-blob':
					data.value && URL.revokeObjectURL(data.value)
					data.value = URL.createObjectURL(xhr.response)
					break
				default:
					console.error('Invalid useFetch data type')
					status.error = true
					break
			}

			status.loading = false
			status.progress = 100
		}

		xhr.onerror = () => {
			status.error = true
			status.loading = false
		}

		xhr.send()
	}

	onUnmounted(() => xhr.abort())
	watch(typeof url === 'string' ? () => url : url, request, { immediate: true })

	return toProxy(
		computed(
			() =>
				({
					data: data.value,
					error: status.error,
					progress: status.progress,
					loading: status.loading,
					refetch: () => request(isRef(url) ? url.value : evaluate(url)),
					// biome-ignore lint/suspicious/noExplicitAny: function returns multiple types of data
				}) as FetchResult<any>,
		),
	)
}
