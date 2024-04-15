import Color from "color";
import { CustomEventHandler } from "./event";

export class Colors extends CustomEventHandler<"update", [Color]>{
  main: Color = Color("white");

  constructor(color?: string) {
    super();

    this.set(color ?? this.main);
  }

  set(colorString: string | Color): this {
    this.main = Color(colorString);
    this.dispatchEvent("update", [this.main]);
    return this;
  }

  shade(shade: number, alpha = 1,) {
    const [h, s] = this.main.hsv().array();
    return Color({ h, s, v: shade }).lightness(shade).alpha(alpha);
  }
}

export default Colors;
