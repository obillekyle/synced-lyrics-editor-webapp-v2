export const sizes = ['xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as const;
export type AppSizes = (typeof sizes)[number];
export type CSSMetricUnits =
  | 'px'
  | 'rem'
  | 'em'
  | 'vh'
  | 'vw'
  | 'vmin'
  | 'vmax'
  | '%'
  | 'ch'
  | 'cm'
  | 'mm'
  | 'in'
  | 'pt'
  | 'pc'
  | 'dvh'
  | 's'
  | 'ms'
  | 'deg'
  | 'dvw';

export function addUnit(
  value: number | string | String = 0,
  unit: CSSMetricUnits = 'px'
): string {
  if (typeof value === 'number') return value + unit;
  if (value.match(/^-?\d+(\.\d+)?$/)) return value + unit;
  return value.toString();
}

export const addPX = (value: number | string | String) => addUnit(value, 'px');

export function getCSSValue(
  value: number | string | String,
  unit: CSSMetricUnits = 'px',
  varType?: 'font' | 'size' | String
): string {
  if (typeof value === 'string' && value.includes(' ')) {
    return value
      .split(' ')
      .map((v) => getCSSValue(v, unit, varType))
      .join(' ');
  }

  if (sizes.find((size) => value.toString() === size)) {
    varType = varType ? varType + '-' : '';
    return `var(--${varType}${value})`;
  }
  if (value === 'rounded') return '9999px';
  return addUnit(value, unit);
}

type ColorVariants = 'color' | 'mono';
type ColorShades =
  | 0
  | 50
  | 100
  | 200
  | 300
  | 400
  | 500
  | 600
  | 700
  | 800
  | 900
  | 1000;
type ColorAlphas = 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90;
export type ColorString =
  | `${ColorVariants}-${ColorShades}`
  | `${ColorVariants}-${ColorShades}-${ColorAlphas}`
  | `#${string}`
  | String;

export function getCSSColor(value: ColorString): string {
  if (value.includes(' ')) {
    return value.split(' ').map(getCSSColor).join(' ');
  }
  if (value.startsWith('color-') || value.startsWith('mono-')) {
    return `var(--${value})`;
  }

  return value.toString();
}
