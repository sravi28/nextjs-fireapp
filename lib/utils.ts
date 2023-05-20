/**
 * Formats given number
 * @param {number} number number to be formatted
 * @returns {string} formatted number
 */
export function formatNumber(number: number) {
  const formatter = Intl.NumberFormat("en", { notation: "compact" });
  return formatter.format(number);
}
