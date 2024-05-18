import { CustomEventHandler } from './event';

type ScreenEvents<IDS extends string | number> = {
  update: [screen: IDS, oldScreen: IDS];
};

class Screen<IDS extends string | number> extends CustomEventHandler<
  ScreenEvents<IDS>
> {
  constructor(private screen: IDS) {
    super();
  }

  set current(screen: IDS) {
    if (screen === this.screen) return;
    this.dispatchEvent('update', [screen, this.screen]);
    this.screen = screen;
  }

  get current(): IDS {
    return this.screen;
  }

  set(screen: IDS): void {
    this.current = screen;
  }
}

export default Screen;
