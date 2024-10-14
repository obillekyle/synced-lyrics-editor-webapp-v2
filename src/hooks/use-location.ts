import { FrameQueue } from '@vue-material/core'
import { onMounted, onUnmounted, ref, shallowReactive } from 'vue'

export function useLocation() {
	const location = shallowReactive({
		pathname: '/',
		search: '',
		hash: '',
		href: '',
		host: '',
		hostname: '',
		protocol: '',
		port: '',
		origin: '',
	})

	function getLocation() {
		if (location.href !== window.location.href) {
			Object.assign(location, window.location)
		}
	}

	onMounted(() => FrameQueue.add(getLocation))
	onUnmounted(() => FrameQueue.remove(getLocation))

	return location
}
