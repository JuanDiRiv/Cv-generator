export function normalizePdfParagraph(text?: string): string {
  return (text ?? '')
    .replace(/\u0000/g, '')
    .replace(/\r/g, '')
    .replace(/\s*\n+\s*/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}
