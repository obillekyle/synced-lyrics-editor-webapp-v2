import Color from 'color';
import { CustomEventHandler } from './event';
import { mapNumberToRange } from './util';

export type ColorEvents = {
  update: [color: Color, oldColor: Color];
};

export class Colors extends CustomEventHandler<ColorEvents> {
  main: Color = Color('white');

  constructor(color?: string) {
    super();
    this.set(color ?? this.main);
  }

  set(colorString: string | Color): this {
    const old = this.main;
    this.main = Color(colorString);
    this.dispatchEvent('update', [this.main, old]);
    return this;
  }

  shade(shade: number, alpha = 1) {
    const [h, s] = this.main.hsv().array();
    return Color({ h, s, v: shade })
      .desaturate(Math.abs(50 - shade) / 50)
      .lightness(shade)
      .alpha(alpha);
  }
}

export default Colors;
