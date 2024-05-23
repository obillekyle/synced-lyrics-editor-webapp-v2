type CustomEventCallback<T extends any[] | undefined> = T extends any[]
  ? ((...args: T) => any) | (() => any)
  : () => any;

type EventType = {
  [key: string]: any[] | undefined;
};

export class CustomEventHandler<Events extends EventType = {}> {
  private events: { [key: string]: any[] } = {};

  addEventListener<EK extends keyof Events | String>(
    type: EK,
    callback: EK extends keyof Events
      ? CustomEventCallback<Events[EK]>
      : () => any
  ): void;
  addEventListener(type: string, callback: () => any): void {
    this.events[type.toString()] = this.events[type] ?? [];

    const index = this.events[type]!.indexOf(callback);
    index < 0 && this.events[type]!.push(callback);
  }

  dispatchEvent<EK extends keyof Events | String>(
    event: EK,
    args: EK extends keyof Events ? Events[EK] : any[]
  ): void;
  dispatchEvent(event: string, args: any[] = []): void {
    for (let callback of this.events[event] ?? []) {
      callback.call(this, ...args);
    }
  }

  removeEventListener<EK extends keyof Events | String>(
    type: EK,
    callback: EK extends keyof Events
      ? CustomEventCallback<Events[EK]>
      : () => any
  ): void;
  removeEventListener(type: string, callback: () => any): void {
    if (!this.events[type]) return;

    const index = this.events[type]!.indexOf(callback);
    index >= 0 && this.events[type]!.splice(index, 1);
  }

  emit = this.dispatchEvent;
  on = this.addEventListener;
  listen = this.addEventListener;
  attach = this.addEventListener;
  detach = this.removeEventListener;

  removeAllEvents() {
    this.events = {};
  }
}
