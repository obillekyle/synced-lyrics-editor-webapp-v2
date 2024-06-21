import Color from 'color';
import { CustomEventHandler } from './event';

export type ColorEvents = {
  update: [color: Color, oldColor: Color];
};

export class Colors extends CustomEventHandler<ColorEvents> {
  main: Color = Color('white');

  constructor(color?: string | Color) {
    super();
    this.set(color ?? this.main);
  }

  set(colorString: string | Color): this {
    const old = this.main;
    this.main = Color(colorString);
    this.dispatchEvent('update', [this.main, old]);
    return this;
  }

  shade(shade: number, alpha = 1, theme: 'light' | 'dark' = 'dark') {
    const [h, s, v] = this.main.hsv().array();
    const color = Color({ h, s, l: shade, alpha });

    return theme == 'light'
      ? color
      : color.desaturate(Math.abs(50 - shade) / 50);
  }
}

export default Colors;
