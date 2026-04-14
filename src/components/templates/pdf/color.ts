export const DEFAULT_PDF_ACCENT = "#6366f1";

export function resolvePdfAccent(color: string | undefined): string {
  const value = typeof color === "string" ? color.trim() : "";
  if (/^#[0-9a-fA-F]{6}$/.test(value)) {
    return value;
  }

  return DEFAULT_PDF_ACCENT;
}

export function withOpacity(color: string, opacity: number): string {
  const alpha = Math.max(0, Math.min(1, opacity));
  const raw = color.trim().replace("#", "");
  const hex =
    raw.length === 3
      ? raw
          .split("")
          .map((ch) => ch + ch)
          .join("")
      : raw;

  if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
    return color;
  }

  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  const blendWithWhite = (channel: number) =>
    Math.round(255 - (255 - channel) * alpha);
  const outR = blendWithWhite(r);
  const outG = blendWithWhite(g);
  const outB = blendWithWhite(b);

  return `rgb(${outR}, ${outG}, ${outB})`;
}
