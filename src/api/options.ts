import { evaluate, interval } from "./util";

import { CustomEventHandler } from "./event";

type OptionsEvent =
  | 'event'

export type OptionsArgs =
  | ['added', { key: string, value: any }]
  | ['removed', { key: string, value: any }]
  | ['modified', { key: string, oldValue: any, newValue: any }]
  | ['loaded', undefined]
  | ['saved', undefined]

export type OptionsConfig<T> = {
  localSaving: boolean
  localKey: string
  defaultOptions: Partial<T>,
  autoSave: boolean
  saveIntervalSeconds: number
}

type GetType<T, K, O> = (K extends keyof O ? (O[K] extends () => any ? () => void : O[K]) : T);

type MapRecord = { [key: string]: any }



class Options<O extends object = MapRecord>
  extends CustomEventHandler<OptionsEvent, OptionsArgs> {

  private lastMod = 0;
  private config: OptionsConfig<O> = {
    localKey: "options",
    localSaving: true,
    autoSave: true,
    saveIntervalSeconds: 5,
    defaultOptions: {},
  };

  private options: MapRecord = {
    wow: '1.0.0',
  };

  constructor(config?: Partial<OptionsConfig<O>>) {
    super();

    if (config) {
      Object.assign(this.config, config);
    }

    this.load();

    if (this.config.localSaving && this.config.autoSave) {
      interval(
        this.save.bind(this),
        this.config.saveIntervalSeconds * 1000,
        this.config.localKey
      );
    }
  }


  load() {
    if (!this.config.localSaving) return;
    const saved = localStorage.getItem(this.config.localKey);
    const lastSave = localStorage.getItem(this.config.localKey + '-last-save');

    this.lastMod = lastSave ? Number(lastSave) : 0;
    this.options = saved ? parser(saved) : this.config.defaultOptions;

    this.dispatchEvent('event', ['loaded', undefined]);
  }

  save() {
    const key = this.config.localKey;
    const lastSave = localStorage.getItem(key + '-last-save');
    const lastSaveTime = lastSave ? Number(lastSave) : 0;

    if (lastSaveTime == this.lastMod) return;

    localStorage.setItem(key + '-last-save', String(this.lastMod));
    localStorage.setItem(key, stringify(this.options));
    this.dispatchEvent('event', ['saved', undefined]);
  }

  set<K extends keyof O | String>(key: K, newValue: K extends keyof O ? O[K] | ((oldVal: O[K]) => O[K]) : any): void;
  set(key: any, newValue: any) {

    const oldValue = this.options[key];
    this.options[key] = evaluate(newValue, oldValue);
    this.lastMod++

    this.dispatchEvent('event', ['modified', { key, oldValue, newValue: this.options[key] }]);
  }

  unset<K extends keyof O | String>(key: K): void;
  unset(key: string) {
    const copy = { key, value: this.options[key] }

    delete this.options[key];
    this.lastMod++;

    this.dispatchEvent('event', ['removed', copy]);
  }

  get<T = any, K extends keyof O | String = keyof O>(key: K): GetType<T, K, O> | undefined;
  get<T = any, K extends keyof O | String = keyof O>(key: K, defaultValue: K extends keyof O ? O[K] : T): GetType<T, K, O>;
  get(key: string, defaultValue?: any): any {
    if (typeof key != 'string') return;

    return this.options[key] ?? defaultValue;
  }


  getRaw(): O {
    return this.options as any;
  }

  defaults() {
    this.options = { ...this.config.defaultOptions };
  }

  revert<K extends keyof O>(key: K): void;
  revert(key: string) {
    this.options[key] = (this.config.defaultOptions as any)[key];
  }
}

export function stringify(obj: any): string {
  const newObj: { [key: string]: string } = {};

  switch (typeof obj) {
    case 'string':
      return `~$str:${obj}`;
    case 'number':
      return `~$num:${obj.toString()}`;
    case 'bigint':
      return `~$bignum:${obj.toString()}`;
    case 'boolean':
      const boolToString = obj ? '1' : '0';
      return `~$bool:${boolToString}`;
    case 'undefined':
      return '~$udf';
    case 'function':
      console.warn('Functions will be replaced by a dummy function when parsed');
      return '~$fun'
    case 'symbol':
      console.warn('Symbols will not be the same when parsed');
      return '~$sym:' + obj.description;
    case 'object':
      if (obj === null) {
        return '~$null';
      }
      if (Array.isArray(obj)) {
        const map = obj.map(stringify);
        return `~$arr:${JSON.stringify(map)}`;
      }
      if (obj instanceof Date) {
        return `~$date:${obj.getTime()}`;
      }
      if (obj instanceof Object) {
        for (const key in obj) {
          newObj[key] = stringify(obj[key]);
        }
      }
  }

  return `~$obj:${JSON.stringify(newObj)}`;
}

export function parser(str: string): any {
  if (typeof str !== 'string') {
    return str;
  }

  if (str === '~$null') {
    return null;
  }
  if (str.startsWith('~$num:')) {
    return Number(str.slice(6));
  }
  if (str.startsWith('~$bignum:')) {
    return BigInt(str.slice(9));
  }
  if (str.startsWith('~$str:')) {
    return str.slice(6);
  }
  if (str.startsWith('~$bool:')) {
    return str.slice(7) === '1';
  }
  if (str.startsWith('~$date:')) {
    return new Date(Number(str.slice(7)));
  }
  if (str.startsWith('~$fun')) {
    return () => { };
  }
  if (str.startsWith('~$sym:')) {
    return Symbol(str.slice(6));
  }
  if (str.startsWith('~$udf')) {
    return undefined
  }
  if (str.startsWith('~$arr:')) {
    const obj = JSON.parse(str.slice(6));
    return obj.map(parser);
  }

  if (str.startsWith('~$obj:')) {
    const obj = JSON.parse(str.slice(6));
    for (const key in obj) {
      obj[key] = parser(obj[key]);
    }
    return obj;
  }
  return str;
}

async function compress(str: string, encoding: CompressionFormat = 'gzip'): Promise<string> {
  const input = new TextEncoder().encode(str);

  const compressionStream = new CompressionStream(encoding);
  const writer = compressionStream.writable.getWriter();
  writer.write(input);
  writer.close();

  const compressed = await new Response(compressionStream.readable).arrayBuffer();
  const compressedData = new Uint8Array(compressed);

  const base64Data = btoa(String.fromCharCode(...compressedData));

  return `${encoding}:${base64Data}`;
}

async function decompress(str: string): Promise<string> {
  const [encoding, base64Data] = str.split(':');

  const binaryData = atob(base64Data);
  const compressedData = new Uint8Array(binaryData.length).map((_, i) => binaryData.charCodeAt(i));

  const decompressionStream = new DecompressionStream(encoding as CompressionFormat);
  const writer = decompressionStream.writable.getWriter();
  writer.write(compressedData);
  writer.close();

  const decompressed = await new Response(decompressionStream.readable).arrayBuffer();
  return new TextDecoder().decode(decompressed);
}

export default Options