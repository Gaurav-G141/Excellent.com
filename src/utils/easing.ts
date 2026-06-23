/** Strong ease-out — slows sharply as t approaches 1. */
export function easeOutQuint(t: number): number {
  return 1 - Math.pow(1 - t, 5)
}
