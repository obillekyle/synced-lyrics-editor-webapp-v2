let idIncrement = 0;

export function getUnique() {
  return idIncrement++;
}

export function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function inRange(value: number, min: number, max: number, excludeLimit = false) {
  if (excludeLimit) return value > min && value < max
  return value >= min && value <= max;
}

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

/** @deprecated */
export const minMax = clamp;