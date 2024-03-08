export function $<T extends HTMLElement = HTMLElement>(selector: string, element?: Element): T | null {
  return (element || document).querySelector(selector);
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

type EventItem<T extends string, O extends any, P extends any[]> =
  | Record<T | string, (((this: O, ...args: P) => any) | never)[]>

export class CustomEventHandler<Events extends string, Args extends any[] = any[]> {
  private events: Partial<EventItem<Events, this, Args>> = {}

  addEventListener(type: Events, callback: (...args: Args) => any) {
    this.events[type] = this.events[type] ?? [];
    this.events[type]!.push(callback);
  }

  dispatchEvent(event: Events, args: Args) {
    this.events[event]?.forEach(callback => {
      callback.call(this, ...args)
    });
  }

  removeEventListener(type: Events, callback?: (...args: Args) => any) {
    if (!this.events[type]) return;

    if (!callback) {
      delete this.events[type];
    } else {
      const index = this.events[type]!.indexOf(callback);
      index >= 0 && this.events[type]!.splice(index, 1);
    }
  }

  removeAllEvents() {
    this.events = {};
  }
}

type RateLimitStore = {
  [key: string]: number;
}

let rateLimitStore: RateLimitStore = {};

export function rateLimiter(
  callback: (...args: any[]) => any,
  [key, blockTime]: [string, number]
) {
  const currentTime = Date.now();
  const oldTime = rateLimitStore[key];

  if (oldTime && currentTime - oldTime < blockTime) return;

  rateLimitStore[key] = currentTime;
  callback()?.then?.();
}

type IntervalStore = {
  [key: string | number]: ReturnType<typeof setInterval>
}
let intervalStore: IntervalStore = {}
let intervalID = 0;

export function interval(callback: (key: number) => void, time: number): number;
export function interval(callback: (key: number) => void, time: number, key: number): void;
export function interval(callback: (key: string) => void, time: number, key: string): void;
export function interval(callback: (key: any) => void, time: number, key?: string | number): number | undefined {
  const id = intervalID++
  intervalStore[key ?? id] && clearInterval(intervalStore[key ?? id]);
  intervalStore[key ?? id] = setInterval(() => callback(key ?? id), time);
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

export function rgbaToHex(r: number, g: number, b: number, a: number = 1.0): string {
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  a = Math.max(0.0, Math.min(1.0, a));

  const hexR = r.toString(16).padStart(2, '0');
  const hexG = g.toString(16).padStart(2, '0');
  const hexB = b.toString(16).padStart(2, '0');
  const hexA = Math.round(a * 255).toString(16).padStart(2, '0');

  return `#${hexR}${hexG}${hexB}${hexA}`;
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
  openFilePickerAsync(options).then((file) => callback(file));
}

export type ArrayItems<T, N extends number> = T extends unknown
  ? T[]
  : _ArrayItems<T, N, []>;

type _ArrayItems<T, N extends number, R extends unknown[]> =
  R['length'] extends N
  ? R
  : _ArrayItems<T, N, [...R, T]>;