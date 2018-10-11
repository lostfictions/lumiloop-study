export function map(
  val: number,
  fromMin: number,
  fromMax: number,
  toMin: number,
  toMax: number
): number {
  //normalize val to 0..1 range
  val = (val - fromMin) / (fromMax - fromMin);
  //then map to other domain
  return val * (toMax - toMin) + toMin;
}

export function map01(val: number, fromMin: number, fromMax: number): number {
  //normalize val to 0..1 range
  return (val - fromMin) / (fromMax - fromMin);
}

export function clamp(val: number, min: number, max: number): number {
  if (val < min) return min;
  if (val > max) return max;
  return val;
}

// -0.5 => 0
//    0 => 1
//  0.5 => 0
export function sinmid(value: number) {
  return (Math.sin((value + 0.25) * (2 * Math.PI)) + 1) / 2;
}

// -1 => 0
//  0 => 1
//  1 => 0
export function sindesc(value: number): number {
  return (Math.sin((value + 0.5) * Math.PI) + 1) / 2;
}

// -1 => 1
//  0 => 0
//  1 => 1
export function sinasc(value: number): number {
  return (Math.sin((value + 1.5) * Math.PI) + 1) / 2;
}
