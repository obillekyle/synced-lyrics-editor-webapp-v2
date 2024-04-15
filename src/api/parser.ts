import { CustomEventHandler } from "./event"

export type LRCTags = Record<string, string>;

export type LRCLine = {
  type: "single",
  time: number,
  data: string,
} | {
  type: "multi",
  time: number,
  data: {
    offset: number,
    line: string,
  }[]
}

export type LRCData = {
  tags: LRCTags
  lines: LRCLine[]
}

export type LRCEvents =
  | "lrc-updated"

export type LRCArgs =
  | ["tag", LRCTags]
  | ["line-updated", LRCLine, number]
  | ["line-added", LRCLine, number]
  | ["line-removed", LRCLine, number]
  | ["parsed", LRCParser]

export class LRCParser extends CustomEventHandler<LRCEvents, LRCArgs> {
  private _cachedTime: number[] = [];
  public tags: LRCTags = {}
  public lines: LRCLine[] = []
  get EMPTYLINE(): LRCLine { return { type: "single", time: 0, data: "" }; }


  constructor(lrc?: string) {
    super();

    lrc && this.parse(lrc);
  }

  getJSON(): LRCData {
    return {
      tags: { ...this.tags },
      lines: [...this.lines]
    }
  }

  parse(data: string) {
    this.reset();
    const lines = data.split('\n');
    for (const line of lines) {
      const match = line.match(/\[(\d{2}:\d{2}\.\d{2,3})\](.*)|\[(.*)\]/);
      if (match) {
        let [, timeString, data, tag] = match;
        if (tag) {
          const tagMatch = tag.match(/(.*)\:(.*)/);
          if (tagMatch) this.tags[tagMatch[1]] = tagMatch[2];
          continue;
        }

        data = data.trim()
        const time = this.timeToNumber(timeString!);
        const multiMatch = data.match(/(.*)(\[\d{2}:\d{2}.\d{2,3}\].*)/);

        if (!multiMatch) {
          this.lines.push({ type: "single", time, data });
          continue;
        }

        const lyric: LRCLine = {
          type: "multi",
          time: time,
          data: []
        }

        const [, firstString, multi] = multiMatch
        lyric.data.push({ offset: 0, line: firstString || "" });

        const multiLines = multi.split("[");
        for (const multiLine of multiLines) {
          const array = multiLine.match((/(\d{2}:\d{2}.\d{2,3})\](.*)/));
          if (array) {
            const [, timeRaw, line] = array;
            const offset = this.timeToNumber(timeRaw) - time;
            lyric.data.push({ offset, line });
          }
        }
      }

      this.lines.push({
        type: "single",
        time: 0,
        data: line
      });
    }

    this.updateCachedTime();
    this.dispatchEvent("lrc-updated", ["parsed", this]);
  }

  stringify(): string {
    let first = true;
    let finalString = "";
    for (const tagName in this.tags) {
      finalString += first ? "" : "\n";
      finalString += `[${tagName}:${this.tags[tagName]}]`;
      first = false;
    }
    for (const line of this.lines) {
      finalString += first ? "" : "\n";
      first = false;

      const time = this.timeToString(line.time);
      if (line.type === "single") {
        finalString += `[${time}] ${line.data}`;
      }

      if (line.type === "multi") {
        let concat = `[${time}] `;

        for (const data of line.data) {
          if (data.offset = 0) {
            concat += data.line;
            continue;
          }
          const multiTime = this.timeToString(line.time + data.offset);
          concat += `[${multiTime}]${data.line}`;
        }
        finalString += concat
      }
    }
    return finalString
  }

  updateTag(key: string, value: string) {
    for (const tagName in this.tags) {
      if (tagName === key) {
        this.tags.value = value;
        this.dispatchEvent("lrc-updated", ["tag", this.tags]);
        return;
      }
    }
  }

  import(data: LRCData) {
    this.tags = { ...data.tags };
    this.lines = [...data.lines];

    this.updateCachedTime();
    this.dispatchEvent("lrc-updated", ["parsed", this]);
  }

  updateCachedTime() {
    this._cachedTime.length = 0;
    for (const line of this.lines) {
      this._cachedTime.push(line.time);
    }
  }

  updateLine(index: number, line: Partial<LRCLine>) {
    Object.assign(this.lines[index], line);
    this._cachedTime[index] = this.lines[index].time;

    this.dispatchEvent("lrc-updated", ["line-updated", this.lines[index], index]);
  }

  removeLine(index: number) {
    const line = this.lines[index];
    this.lines.splice(index, 1);
    this._cachedTime.splice(index, 1);

    this.dispatchEvent("lrc-updated", ["line-removed", line, index]);
  }

  addLine(line: LRCLine, after: number = this.lines.length - 1) {
    this.lines.splice(after + 1, 0, line);
    this._cachedTime.splice(after + 1, 0, line.time);

    this.dispatchEvent("lrc-updated", ["line-added", line, after + 1]);
  }

  timeToString(time: number, timeFixed: 2 | 3 = 2) {
    const mins = Math.floor(time / 60000);
    const secs = Math.floor(time / 1000 % 60);
    const msec = Math.floor(time) % 1000;

    const minutes = mins.toString().padStart(2, '0');
    const seconds = secs.toString().padStart(2, '0');
    const milsecs = msec.toString().padStart(3, '0').slice(0, timeFixed);

    return `${minutes}:${seconds}.${milsecs}`;
  }

  timeToNumber(time: string) {
    const [mins, secs, msec] = time.split(/[\:\.]/);
    const ms = msec.padEnd(3, '0').slice(0, 3);

    const minutes = parseInt(mins) * 60 * 1000;
    const seconds = parseInt(secs) * 1000;
    const milsecs = parseInt(ms);

    return minutes + seconds + milsecs;
  }

  findIndex(timestamp: number, useCache = true) {
    const array = useCache ? this._cachedTime : this.lines;
    for (let i = 0; i < array.length; i++) {
      const line = this.lines[i];
      const item = array[i]
      const time = typeof item == 'number' ? item : line.time
      if (time > timestamp) {
        return i - 1;
      }
    }
    return this.lines.length - 1;
  }

  currentLine(timestamp: number): LRCLine | undefined {
    const index = this.findIndex(timestamp);
    return this.lines[index]
  }

  previousLine(timestamp: number): LRCLine | undefined {
    const index = this.findIndex(timestamp);
    if (index <= 0) return undefined;
    return this.lines[index - 1]
  }

  nextLine(timestamp: number): LRCLine | undefined {
    const index = this.findIndex(timestamp);
    return this.lines[index + 1]
  }

  reset() {
    this.tags = {};
    this.lines.length = 0;
    this._cachedTime.length = 0;
  }
}

export default LRCParser