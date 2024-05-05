export const sizes = ["xs", "sm", "md", "lg", "xl"] as const
export type AppSizes = typeof sizes[number]
export type CSSMetricUnits = "px" | "rem" | "em" | "vh" | "vw" | "vmin" | "vmax" | "%" | "ch" | "cm" | "mm" | "in" | "pt" | "pc" | "dvh" | "dvw"

export function addUnit(value: number | string = 0, unit: CSSMetricUnits = 'px'): string {
  if (typeof value === 'number') return value + unit
  if (value.match(/^-?\d+(\.\d+)?$/)) return value + unit
  return value
}

export const addPX = (value: number | string) => addUnit(value, 'px')

export function getCSSValue(value: number | string, unit: CSSMetricUnits = 'px'): string {
  if (sizes.find(size => value.toString() === size)) return `var(--${value})`;
  if (value === 'rounded') return '9999px';
  return addUnit(value, unit);
}