export function sanitizeText(text: string) {
  if (!text) return text;
  return text
    .replace(/≥/g, ">=")
    .replace(/≤/g, "<=")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, "-");
}
