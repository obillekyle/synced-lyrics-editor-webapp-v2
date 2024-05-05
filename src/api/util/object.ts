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
export type MaybeFunction<T extends any> = T | (() => T)
export function evaluate<K extends any, V = K extends () => any ? ReturnType<K> : K>(this: any, obj: K, ...args: V extends (...args: infer P) => any ? P : any): V
export function evaluate(this: any, obj: any, ...params: any): any {
  return typeof obj === 'function' ? obj.call(this, ...params) : obj
}



export function exclude(obj: any, keys: string[]) {
  return Object.keys(obj).filter(key => !keys.includes(key)).reduce((prev, key) => {
    prev[key] = obj[key]
    return prev
  }, {} as any)
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
