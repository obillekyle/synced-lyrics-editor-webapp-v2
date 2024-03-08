import Color from "color";
import { CustomEventHandler, type ArrayItems } from "./util"; // Assuming you have this file

type ColorsArray = string[];

export class Colors extends CustomEventHandler<"update", [ColorsArray]>{
  main: Color = Color("red");
  array: ColorsArray = [];
  alphas: ColorsArray = [];

  constructor(color?: string, shades = 10) {
    super();

    this.set(color ?? this.main, shades);
  }

  set(colorString: string | Color, numColors = 10): [ColorsArray, ColorsArray] {
    this.main = Color(colorString);

    let alphaColor: Color;

    this.array.length = 0;
    this.alphas.length = 0;

    for (let i = 0; i < numColors; i++) {
      const color = this.getShade(((i + 1) * 100 / numColors) * .9);
      this.array.push(color.hex());

      if (i == Math.floor(numColors / 1.25)) {
        alphaColor = color;
      }
    }

    for (let i = 0; i < numColors; i++) {
      const color = alphaColor!.alpha((i + 1) * .1);
      this.alphas.push(color.hexa());
    }

    this.dispatchEvent("update", [this.array]);
    return [this.array, this.alphas];
  }

  getShade(shade: number) {
    const [h, s] = this.main.hsl().array();

    return Color({ h, s, l: shade })
  }
}

export default Colors;
