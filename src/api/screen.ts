import { CustomEventHandler } from "./util";

class Screen<IDS extends string> extends CustomEventHandler<"screenchange", [IDS]>
{
  current: IDS | undefined;

  constructor(screen: IDS) {
    super();

    this.set(screen);
  }

  set(screen: IDS) {
    if (screen == this.current) return;
    this.current = screen;
    this.dispatchEvent("screenchange", [screen])
  }
}

export default Screen