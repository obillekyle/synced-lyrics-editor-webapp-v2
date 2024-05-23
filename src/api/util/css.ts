export const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
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
  if (sizes.find((size) => value.toString() === size)) {
    varType = varType ? varType + '-' : '';
    return `var(--${varType}${value})`;
  }
  if (value === 'rounded') return '9999px';
  return addUnit(value, unit);
}
