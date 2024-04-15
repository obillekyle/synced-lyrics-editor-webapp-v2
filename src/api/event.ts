type EventItem<T extends string, O extends any, P extends any[]> =
  | Record<T | string, (((this: O, ...args: P) => any) | never)[]>

type CustomEventCallback<T extends any[]> = ((...args: T) => any) | (() => any)

export class CustomEventHandler<Events extends string, Args extends any[] = any[]> {
  private events: Partial<EventItem<Events, this, Args>> = {}

  addEventListener(type: Events, callback: CustomEventCallback<Args>) {
    this.events[type] = this.events[type] ?? [];
    this.events[type]!.push(callback);
  }

  dispatchEvent(event: Events, args: Args) {
    for (let callback of this.events[event] || []) {
      callback.call(this, ...args)
    }
  }

  removeEventListener(type: Events, callback?: CustomEventCallback<Args>) {
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