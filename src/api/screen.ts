import { CustomEventHandler } from "./event";

class Screen<IDS extends string | number> extends CustomEventHandler<"screenchange", [IDS]>
{

  constructor(private _screen: IDS) {
    super();
  }

  set current(screen: IDS) {
    if (screen === this._screen) return;
    this._screen = screen
    this.dispatchEvent("screenchange", [screen])
  }

  get current(): IDS {
    return this._screen
  }

  set(screen: IDS): void {
    this.current = screen
  }
}

export default Screen