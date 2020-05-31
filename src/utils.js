
export function renderTime(period, t) {
  let hour = Math.floor(t/60);

  if (period === '12') {
    if (hour === 0) hour = 12;

    return `${ hour.toString() }:${(t % 60).toString().padStart(2, '0')}`
  }
  return `${ hour.toString().padStart(2, '0') }:${(t % 60).toString().padStart(2, '0')}`
}

export function roundDownBy(value, frequency) {
  return Math.floor(Math.floor(value / frequency) * frequency)
}
