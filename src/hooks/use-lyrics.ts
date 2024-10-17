import type { LRCLine, WithId } from '@/api/parser2'
import { evaluate, toProxy } from '@vue-material/core'
import { computed, inject, reactive } from 'vue'

export type ModifyFn<T> = Partial<T> | ((value: WithId<T>) => Partial<T>)

export type Lyrics = {
	tags: Record<string, string>
	lines: Record<string, LRCLine>

	addLine: (line?: Partial<LRCLine>) => string
	updateLine: (id: string, line: ModifyFn<LRCLine>) => void
	removeLine: (id: string) => void

	addTag: (tag: string, value?: string) => void
	removeTag: (tag: string) => void
	updateTag: (tag: string, value: string) => void
}

export function useLyrics() {
	const provided = inject<Lyrics | undefined>('app-lyrics', undefined)

	if (provided) return provided

	const lyrics = reactive({
		tags: {} as Record<string, string>,
		lines: {} as Record<string, LRCLine>,
	})

	function addLine(line: Partial<LRCLine> = {}) {
		const id = String(Date.now())
		lyrics.lines[id] = Object.assign({}, { time: -1, data: '' }, line)

		return id
	}

	function updateLine(id: string, line: ModifyFn<LRCLine>) {
		if (!lyrics.lines[id]) return
		const data = lyrics.lines[id]

		Object.assign(data, evaluate(line, data))
	}

	function removeLine(id: string) {
		delete lyrics.lines[id]
	}

	function addTag(tag: string, value?: string) {
		lyrics.tags[tag] = value ?? ''
	}

	function removeTag(tag: string) {
		delete lyrics.tags[tag]
	}

	function updateTag(tag: string, value: string) {
		if (!lyrics.tags[tag]) return
		lyrics.tags[tag] = value
	}

	const data = computed<Lyrics>(() => ({
		tags: lyrics.tags,
		lines: lyrics.lines,

		addLine,
		removeLine,
		updateLine,

		addTag,
		removeTag,
		updateTag,
	}))

	return toProxy(data)
}
