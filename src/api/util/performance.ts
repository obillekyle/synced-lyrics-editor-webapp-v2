
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