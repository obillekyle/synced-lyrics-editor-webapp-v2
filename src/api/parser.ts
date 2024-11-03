import {
	CustomEventHandler,
	getUnique,
	is,
	normalizeNewLines,
} from '@vue-material/core'

export type LRCTags = Record<string, string>

export type LRCLine =
	| {
			id: number
			type: 'single'
			time: number
			data: string
	  }
	| {
			id: number
			type: 'multi'
			time: number
			data: {
				offset: number
				line: string
			}[]
	  }

export type LRCData = {
	tags: LRCTags
	lines: LRCLine[]
}

export type LRCEvents = {
	parsed: undefined
	'tag-added': [key: string, value: string]
	'tag-updated': [key: string, value: string, oldValue: string]
	'tag-removed': [key: string, value: string]

	'line-updated': [index: number, data: LRCLine]
	'line-added': [index: number, data: LRCLine]
	'line-removed': [index: number, data: LRCLine]
}

export class LRCParser extends CustomEventHandler<LRCEvents> {
	private _cachedTime: number[] = []
	public tags: LRCTags = {}
	public lines: LRCLine[] = []
	get EMPTYLINE(): LRCLine {
		return {
			id: getUnique(),
			type: 'single',
			time: 0,
			data: '',
		}
	}

	constructor(lrc?: string) {
		super()

		lrc && this.parse(lrc)
	}

	getRaw(): LRCData {
		return {
			tags: { ...this.tags },
			lines: [...this.lines],
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

		const multiMatch = value.match(/(.*)(\[\d{2}:\d{2}.\d{2,3}\].*)/)

		if (multiMatch) {
			const [, firstString, multi] = multiMatch

			const lyric: LRCLine = {
				id: getUnique(),
				type: 'multi',
				time: time,
				data: [],
			}

			lyric.data.push({ offset: 0, line: firstString || '' })

			const multiLines = multi.split('[')
			for (const multiLine of multiLines) {
				const array = multiLine.match(/(\d{2}:\d{2}.\d{2,3})\](.*)/)
				if (array) {
					const [, timeRaw, line] = array
					const offset = LRCParser.timeToInt(timeRaw) - time
					lyric.data.push({ offset, line })
				}
			}

			return
		}

		this.lines.push({
			id: getUnique(),
			type: 'single',
			time,
			data: value,
		})
	}

	parse(data: string) {
		this.reset()
		const lines = normalizeNewLines(data).split('\n')

		for (const line of lines) {
			const match = line.match(/\[(\d{2}:\d{2}\.\d{2,3})\](.*)|\[(.*)\]/)

			if (match) {
				const [, timeString, value, tag] = match
				tag ? this.processTag(tag) : this.processLine(timeString, value)
			}
		}

		this.updateCachedTime()
		this.dispatchEvent('parsed')
	}

	stringify(): string {
		let first = true
		let finalString = ''
		for (const tagName in this.tags) {
			finalString += first ? '' : '\n'
			finalString += `[${tagName}:${this.tags[tagName]}]`
			first = false
		}
		for (const line of this.lines) {
			finalString += first ? '' : '\n'
			first = false

			const time = this.timeToString(line.time)
			if (line.type === 'single') {
				finalString += `[${time}] ${line.data}`
			}

			if (line.type === 'multi') {
				let concat = `[${time}] `

				for (const data of line.data) {
					if (data.offset === 0) {
						concat += data.line
						continue
					}
					const multiTime = this.timeToString(line.time + data.offset)
					concat += `[${multiTime}]${data.line}`
				}
				finalString += concat
			}
		}
		return finalString
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
		this.lines = [...data.lines]

		this.updateCachedTime()
		this.dispatchEvent('parsed')
	}

	updateCachedTime() {
		this._cachedTime.length = 0
		for (const line of this.lines) {
			this._cachedTime.push(line.time)
		}
	}

	updateLine(index: number, line: Omit<Partial<LRCLine>, 'id'>) {
		if ('time' in line) line.time = undefined

		Object.assign({}, this.lines[index], line)
		this._cachedTime[index] = this.lines[index].time

		this.dispatchEvent('line-updated', index, this.lines[index])
	}

	removeLine(index: number) {
		const line = this.lines[index]
		this.lines.splice(index, 1)
		this._cachedTime.splice(index, 1)

		this.dispatchEvent('line-removed', index, line)
	}

	removeFromId(id: number) {
		const index = this.lines.findIndex((line) => line.id === id)

		if (index !== -1) {
			this.removeLine(index)
		}

		return index
	}

	addLine(line: LRCLine, after: number = this.lines.length - 1) {
		this.lines.splice(after + 1, 0, line)
		this._cachedTime.splice(after + 1, 0, line.time)

		this.dispatchEvent('line-added', after + 1, line)
	}

	timeToString(time: number, timeFixed: 2 | 3 = 2) {
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

	findIndex(timestamp: number, useCache = true) {
		const array = useCache ? this._cachedTime : this.lines
		for (let i = 0; i < array.length; i++) {
			const item = array[i]
			const line = this.lines[i]
			const time = is(item, 'number') ? item : line.time

			if (time > timestamp) return this.findIndexHelper(i - 1)
		}
		return this.findIndexHelper(this.lines.length - 1)
	}

	currentLine(timestamp: number): LRCLine | undefined {
		const index = this.findIndex(timestamp)
		return this.lines[index]
	}

	previousLine(timestamp: number): LRCLine | undefined {
		const index = this.findIndex(timestamp)
		if (index <= 0) return undefined
		return this.lines[index - 1]
	}

	nextLine(timestamp: number): LRCLine | undefined {
		const index = this.findIndex(timestamp)
		return this.lines[index + 1]
	}

	reset() {
		this.tags = {}
		this.lines.length = 0
		this._cachedTime.length = 0
	}
}

export default LRCParser
