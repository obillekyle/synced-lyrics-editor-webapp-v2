import {
	CustomEventHandler,
	evaluate,
	getUnique,
	is,
	normalizeNewLines,
} from '@vue-material/core'

export type WithId<T> = T & { id: string }
export type ModifyFn<T> = Partial<T> | ((value: WithId<T>) => Partial<T>)

export type LRCLine = {
	time: number
	data: string
}

export type LRCData = {
	tags: Record<string, string>
	lines: Record<string, LRCLine>
}

export type LRCEvents = {
	parsed: undefined
	updated: undefined
	'tag-added': [key: string, value: string]
	'tag-updated': [key: string, value: string, oldValue: string]
	'tag-removed': [key: string, value: string]

	'line-added': [id: string, data: LRCLine]
	'line-updated': [id: string, data: LRCLine]
	'line-removed': [id: string, data: LRCLine]
}

export class LRCParser extends CustomEventHandler<LRCEvents> {
	private _increment = 0
	private _cachedTime: number[] = []
	private _cachedKeys: string[] = []

	public tags: Record<string, string> = {}
	public lines: Record<string, LRCLine> = {}
	get EMPTY_LINE(): LRCLine {
		return {
			time: -1,
			data: '',
		}
	}

	private get NEW_ID() {
		return `${Date.now()}_${this._increment++}`
	}

	getRaw(): LRCData {
		return {
			tags: { ...this.tags },
			lines: { ...this.lines },
		}
	}

	getJSON(): string {
		return JSON.stringify(this.getRaw())
	}

	private processTag(tag: string) {
		const match = tag.match(/(.*)\:(.*)/)

		if (match) {
			this.tags[match[1]] = match[2]
		}
	}

	private processLine(timeStr: string, line: string) {
		const time = LRCParser.timeToInt(timeStr)
		const value = line.trim()

		this.lines[this.NEW_ID] = {
			time: time,
			data: value,
		}
	}

	get length() {
		return this._cachedKeys.length
	}

	parse(data: string) {
		this.reset()
		const lines = normalizeNewLines(data).split('\n')

		for (const line of lines) {
			const match = line.match(/\[(\d{2}:\d{2}\.\d{2,3})\](.*)|\[(.*)\]/)

			if (match) {
				const [, timeString, value, tag] = match
				tag ? this.processTag(tag) : this.processLine(timeString, value)
				continue
			}

			this.add({ data: line })
		}

		this.updateCache()
		this.dispatchEvent('parsed')
	}

	stringify(): string {
		const final = []

		for (const tagName in this.tags) {
			final.push(`[${tagName}:${this.tags[tagName]}]`)
		}

		for (const line of Object.values(this.lines)) {
			if (line.time < 0) {
				final.push(line.data)
				continue
			}

			const time = this.timeToString(line.time)
			final.push(`[${time}] ${line.data}`)
		}

		return final.join('\n')
	}

	updateTag(key: string, value: string) {
		for (const tagName in this.tags) {
			if (tagName === key) {
				this.dispatchEvent('tag-update', key, value, this.tags[tagName])
				this.tags.value = value
				return
			}
		}
	}

	addTag(key: string, value: string) {
		if (this.tags[key]) return

		this.tags[key] = value
		this.dispatchEvent('tag-added', key, value)
	}

	removeTag(key: string) {
		for (const tagName in this.tags) {
			if (tagName === key) {
				this.dispatchEvent('tag-removed', key, this.tags[tagName])
				delete this.tags[key]
				return
			}
		}
	}

	import(data: LRCData) {
		this.tags = { ...data.tags }
		this.lines = { ...data.lines }

		this.updateCache()
		this.dispatchEvent('parsed')
	}

	getIdFromIndex(index: number): string | undefined {
		return this._cachedKeys[index]
	}

	getIndexFromId(id: string) {
		return this._cachedKeys.indexOf(id)
	}

	updateCache() {
		this._cachedKeys.length = 0
		this._cachedTime.length = 0

		for (const [id, line] of Object.entries(this.lines)) {
			this._cachedKeys.push(id)
			this._cachedTime.push(line.time)
		}
	}

	update(id: string, line: ModifyFn<LRCLine>) {
		if (!this.has(id)) return
		const oldData = this.lines[id]
		const newData: LRCLine = evaluate(line, oldData)

		this.lines[id] = Object.assign({}, oldData, newData)

		if (oldData.time !== newData.time) this.updateCache()

		this.dispatchEvent('line-updated', id, this.lines[id])
	}

	has(id: string) {
		return this.lines[id] !== undefined
	}

	remove(id: string) {
		if (!this.has(id)) return

		const line = this.lines[id]
		delete this.lines[id]

		this.updateCache()
		this.dispatchEvent('line-removed', id, line)
	}

	add(line: Partial<LRCLine> = {}) {
		const newId = this.NEW_ID
		const data = Object.assign(this.EMPTY_LINE, line)

		this.lines[newId] = data
		this.updateCache()
		this.dispatchEvent('line-added', newId, data)
	}

	addAfter(after: string, line: Partial<LRCLine> = {}) {
		if (this.has(after)) {
			const data = Object.assign(this.EMPTY_LINE, line)
			const newLines: Record<string, LRCLine> = {}
			const id = this.NEW_ID

			for (const [key, value] of Object.entries(this.lines)) {
				newLines[key] = value

				if (key === after) {
					newLines[id] = data
				}
			}

			this.lines = newLines
			this.updateCache()
			this.dispatchEvent('line-added', id, data)
			return id
		}

		return this.add(line)
	}

	addBefore(before: string, line: Partial<LRCLine> = {}) {
		if (this.has(before)) {
			const data = Object.assign(this.EMPTY_LINE, line)
			const newLines: Record<string, LRCLine> = {}
			const id = this.NEW_ID

			for (const [key, value] of Object.entries(this.lines)) {
				if (key === before) newLines[id] = data

				newLines[key] = value
			}

			this.lines = newLines
			this.updateCache()
			this.dispatchEvent('line-added', id, data)
			return id
		}

		return this.add(line)
	}

	timeToString(time: number, timeFixed: 2 | 3 = 2) {
		if (time < 0) return ''
		const mins = Math.floor(time / 60000)
		const secs = Math.floor((time / 1000) % 60)
		const msec = Math.floor(time) % 1000

		const minutes = String(mins).padStart(2, '0')
		const seconds = String(secs).padStart(2, '0')
		const milsecs = String(msec).padStart(3, '0').slice(0, timeFixed)

		return `${minutes}:${seconds}.${milsecs}`
	}

	public static timeToInt(time: string) {
		const [mins, secs, msec] = time.split(/[\:\.]/)
		const ms = msec.padEnd(3, '0').slice(0, 3)

		const minutes = Number.parseInt(mins) * 60 * 1000
		const seconds = Number.parseInt(secs) * 1000
		const milsecs = Number.parseInt(ms)

		return minutes + seconds + milsecs
	}

	findIndexHelper(index: number): number {
		if (index < 0) return -1
		const line = this.lines[index]
		const prev = this.lines[index - 1]
		if (!prev || prev.time < line.time) return index
		return this.findIndexHelper(index - 1)
	}

	findIndex(timestamp: number) {
		const array = this._cachedTime
		for (let i = 0; i < array.length; i++) {
			const item = array[i]
			const line = this.lines[i]
			const time = is(item, 'number') ? item : line.time

			if (time > timestamp) return this.findIndexHelper(i - 1)
		}
		return this.findIndexHelper(this._cachedTime.length - 1)
	}

	findCurrentId(timestamp: number) {
		const keys = this._cachedKeys
		return keys[this.findIndex(timestamp)]
	}

	currentLine(timestamp: number): LRCLine | undefined {
		const id = this.findCurrentId(timestamp)
		return this.lines[id]
	}

	reset() {
		this.tags = {}
		this.lines = {}
		this.updateCache()
	}
}

export default LRCParser
