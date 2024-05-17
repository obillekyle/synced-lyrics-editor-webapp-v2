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

export function mapNumberToRange(number: number, oldMin: number, oldMax: number, newMin: number, newMax: number): number {
  return ((number - oldMin) / (oldMax - oldMin)) * (newMax - newMin) + newMin;
}

export function findNearestNumber(
  target: number,
  numberSet: number[]
): number | null {
  let nearestNumber: number | null = null;
  let minDifference: number = Number.POSITIVE_INFINITY;

  for (const num of numberSet) {
    const difference = Math.abs(target - num);
    if (difference < minDifference) {
      minDifference = difference;
      nearestNumber = num;
    }
  }

  return nearestNumber;
}

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

/** @deprecated */
export const minMax = clamp;