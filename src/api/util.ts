import type { ComponentInternalInstance } from "vue";

export function $<T extends Element = HTMLElement>(selector: string, element?: Element | EventTarget | null): T | null {
  return (element as Element || document).querySelector(selector);
}

export function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getParent(
  element: HTMLElement | null,
  selector: string,
  self?: boolean,
  deep = 10
): HTMLElement | null {
  if (deep <= 0 || !element) return null;
  if (self && element.matches(selector)) return element;

  return getParent(element.parentElement, selector, true, deep - 1);
}

type ThrottlerStore = Record<string, number>
type ThrottlerOptions = {
  key: string;
  blockTime?: number;
  bypass?: boolean;
  endCall?: (() => void) | boolean;
}

let throttlerStore: ThrottlerStore = {};

export function throttler(
  callback: (...args: any[]) => any,
  { key, blockTime = 1000, bypass, endCall }: ThrottlerOptions
): void {

  if (bypass) {
    callback()?.then?.();
    return;
  }

  const currentTime = Date.now();
  const oldTime = throttlerStore[key];

  if (oldTime && currentTime - oldTime < (blockTime)) return;

  throttlerStore[key] = currentTime;
  callback()?.then?.();

  if (endCall) {
    debounce(() => {
      delete throttlerStore[key];
      (endCall === true ? callback : endCall)()?.then?.();
    }, blockTime + 50, "throttler-" + key, true);
  }
}


type IntervalStore = Record<string | number, ReturnType<typeof setInterval>>
let intervalStore: IntervalStore = {}
let intervalID = 0;

export function interval(callback: (key: number) => any, time: number): number;
export function interval(callback: (key: number) => any, time: number, key: number): void;
export function interval(callback: (key: string) => any, time: number, key: string): void;
export function interval(callback: (key: any) => any, time: number, key?: string | number): string | number | undefined {
  const id = key ?? intervalID++
  intervalStore[id] && clearInterval(intervalStore[id]);
  intervalStore[id] = setInterval(() => callback(id)?.then?.(), time);
  return key === undefined ? undefined : id;
}

export function removeInterval(key: string | number) {
  intervalStore[key] && clearInterval(intervalStore[key]);
  delete intervalStore[key];
}

type DebounceStore = Record<string | number, ReturnType<typeof setTimeout>>
let debounceStore: DebounceStore = {}
let debounceID = 0;

export function debounce(callback: (key: number) => any, time: number): number;
export function debounce(callback: (key: number) => any, time: number, key: number): void;
export function debounce(callback: (key: string) => any, time: number, key: string): void;
export function debounce(callback: (key: string) => any, time: number, key: string, ignore: boolean): void;
export function debounce(callback: (key: any) => any, time: number, key?: string | number, ignore?: boolean): string | number | undefined {
  const id = key ?? debounceID++

  ignore && debounceStore[id] || callback(id)?.then?.();
  debounceStore[id] && clearTimeout(debounceStore[id]);
  debounceStore[id] = setTimeout(() => {
    callback(id)?.then?.();
    delete debounceStore[id];
  }, time);

  return key === undefined ? undefined : id;
}

export function dataURLtoBlob(dataURL: string): Blob | undefined {
  const dataURLRegex = /^data:([^;,]+);base64,(.*)$/;
  const match = dataURL.match(dataURLRegex);

  if (!match) return undefined;

  const mimeType = match[1];
  const base64Data = match[2];

  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);

  const blob = new Blob([byteArray], { type: mimeType });
  return blob;
}

export async function openFilePickerAsync(): Promise<File | null>
export async function openFilePickerAsync(options: { accept?: string; }): Promise<File | null>
export async function openFilePickerAsync(options: { accept?: string; multiple: true; }): Promise<File[] | null>
export async function openFilePickerAsync(options: { accept?: string, multiple?: boolean } = {}) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = options.accept || "";
  input.multiple = options.multiple ?? false;

  return new Promise<File | File[] | null>((resolve) => {
    input.onchange = function () {
      resolve(options.multiple ? [...(input.files || [])] : input.files?.[0] || null);
      this.removeEventListener('change', input.onchange!);
    }
    input.click();
  });
}

export function openFilePicker(callback: (file: File | null) => any): void;
export function openFilePicker(callback: (file: File | null) => any, options: { accept?: string; }): void;
export function openFilePicker(callback: (file: File[]) => any, options: { accept?: string, multiple: true }): void;
export function openFilePicker(callback: (file: any) => any, options: { accept?: string, multiple?: boolean } = {}) {
  openFilePickerAsync(options).then((file) => callback(file)?.then?.());
}

export type MaybeFunction<T extends any> = T | (() => T)
export function evaluate<K extends any, V = K extends () => any ? ReturnType<K> : K>(this: any, obj: K, ...args: V extends (...args: infer P) => any ? P : any): V
export function evaluate(this: any, obj: any, ...params: any): any {
  return typeof obj === 'function' ? obj.call(this, ...params) : obj
}

export function addPX(str: number | string = "0px"): string {
  if (typeof str === 'number') return str + 'px'
  if (str.match(/^-?\d+(\.\d+)?$/)) return str + 'px'
  return str
}

export function exclude(obj: any, keys: string[]) {
  return Object.keys(obj).filter(key => !keys.includes(key)).reduce((prev, key) => {
    prev[key] = obj[key]
    return prev
  }, {} as any)
}

export function getModalID(instance: ComponentInternalInstance): string | number | undefined {
  const elem = getParent(instance.proxy?.$el, '.modal')

  if (elem) {
    return elem.id
  }
}

export function fixLineBreaks(str: string) {
  if (str === '' || str === '\n') return '';
  let text = '';
  let skip = true;

  str = str.endsWith('\n') ? str.slice(0, -1) : str;
  const arr = str.split('\n') as string[];

  for (let i = 0; i < arr.length; i++) {
    const line = arr[i].replace('\r', '');
    if (i == 0 && line == '') {
      text += '\n';
      continue;
    } else if (arr[i - 1] == '' && line == '' && skip) {
      text += '';
      skip = false;
      continue;
    } else if (line == '' && i !== arr.length - 1) {
      text += '\n';
      skip = true;
      continue;
    } else if (line == '' && i === arr.length - 1) {
      continue;
    } else if (i == arr.length - 1) {
      text += line;
      skip = false;
      break;
    }

    text += `${line}\n`;
    skip = false;
  }

  return text;
}

let idIncrement = 0;

export function getUnique() {
  return idIncrement++;
}

let cdtID: ReturnType<typeof setTimeout> | null = null;

export function charDimensions(parent = document.body, text = 'A'): { width: number; height: number } {

  parent ??= document.body;
  let span: HTMLSpanElement | null = $('span.char-dimensions', parent);


  if (!span) {
    span = document.createElement("span");
    span.style.position = "fixed";
    span.style.whiteSpace = "pre";
    span.style.visibility = "hidden";
    span.style.pointerEvents = "none";
    span.style.opacity = "0";
    span.className = "char-dimensions";
    parent.appendChild(span);
  }

  span.textContent = text;

  // The font family and font size can also directly be specified
  // span.style.fontFamily = "Source Code Pro";
  // span.style.fontSize = "24px";

  const rect = span.getBoundingClientRect();
  const width = Number(rect.width.toFixed(2));
  const height = Number(rect.height.toFixed(2));


  if (cdtID) {
    clearTimeout(cdtID);
    cdtID = null;
  }

  cdtID = setTimeout(() => {
    span && span.remove();
  }, 50);

  return { width, height };
};

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

/** @deprecated */
export const minMax = clamp;

export function inRange(value: number, min: number, max: number, excludeLimit = false) {
  if (excludeLimit) {
    return value > min && value < max
  }
  return value >= min && value <= max;
}

export function insertAt(text: string, index: number, value: string) {
  return text.slice(0, index) + value + text.slice(index);
}


export function replaceRange(text: string, [start, end]: [number, number], value: string) {
  return text.slice(0, start) + value + text.slice(end);
}

export function reverseString(str: string) {
  return str
    .split('')
    .reverse()
    .join('');
}

export function escapeHtml(unsafeText: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };

  return unsafeText.replace(/[&<>"']/g, (match) => map[match]);
}

export function unscapeHtml(unsafeText: string): string {
  const map: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'"
  };

  return unsafeText.replace(/(&amp;|&lt;|&gt;|&quot;|&#39;)/g, (match) => map[match]);
}

export function rippleEffect(e: MouseEvent, to?: string) {
  const target = e.currentTarget as HTMLElement;
  const element = to ? $(to, target) || target : target;

  const rect = element.getBoundingClientRect();
  const ripple = document.createElement('span');

  ripple.className = 'ripple';
  ripple.style.left = addPX(e.clientX - rect.left);
  ripple.style.top = addPX(e.clientY - rect.top);
  ripple.style.width = addPX(rect.height > rect.width ? rect.height : rect.width);
  ripple.style.height = ripple.style.width;

  ripple.addEventListener('animationend', () => {
    ripple.remove();
  })

  element.appendChild(ripple);
}

export function is(value: string, type: 'string'): true;
export function is(value: number, type: 'number'): true;
export function is(value: boolean, type: 'boolean'): true;
export function is(value: undefined, type: 'undefined'): true;
export function is(value: null, type: 'null'): true;
export function is(value: object, type: 'object'): true;
export function is(value: () => any, type: 'function'): true;
export function is(value: bigint, type: 'bigint'): true;
export function is(value: symbol, type: 'symbol'): true;
export function is(value: any, type: 'string' | 'number' | 'boolean' | 'null' | 'undefined' | 'object' | 'function' | 'bigint' | 'symbol'): boolean
export function is(value: any, type: string) {
  if (value === null) return type === 'null';
  return typeof value == type;
}
