export type DiffSegmentType = "unchanged" | "added" | "removed";

export interface DiffSegment {
  type: DiffSegmentType;
  text: string;
}

function tokenize(text: string): string[] {
  return text.match(/\s+|[^\s]+/g) ?? [];
}

function mergeSegments(segments: DiffSegment[]): DiffSegment[] {
  if (segments.length === 0) return segments;

  const merged: DiffSegment[] = [segments[0]!];
  for (let i = 1; i < segments.length; i += 1) {
    const current = segments[i]!;
    const prev = merged[merged.length - 1]!;
    if (current.type === prev.type) {
      prev.text += current.text;
    } else {
      merged.push({ ...current });
    }
  }

  return merged;
}

export function diffByWords(
  previousText: string,
  nextText: string,
): DiffSegment[] {
  const oldTokens = tokenize(previousText);
  const newTokens = tokenize(nextText);

  const n = oldTokens.length;
  const m = newTokens.length;

  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    Array<number>(m + 1).fill(0),
  );

  for (let i = 1; i <= n; i += 1) {
    for (let j = 1; j <= m; j += 1) {
      if (oldTokens[i - 1] === newTokens[j - 1]) {
        dp[i]![j] = dp[i - 1]![j - 1]! + 1;
      } else {
        dp[i]![j] = Math.max(dp[i - 1]![j]!, dp[i]![j - 1]!);
      }
    }
  }

  let i = n;
  let j = m;
  const reversed: DiffSegment[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldTokens[i - 1] === newTokens[j - 1]) {
      reversed.push({ type: "unchanged", text: oldTokens[i - 1]! });
      i -= 1;
      j -= 1;
      continue;
    }

    if (j > 0 && (i === 0 || dp[i]![j - 1]! >= dp[i - 1]![j]!)) {
      reversed.push({ type: "added", text: newTokens[j - 1]! });
      j -= 1;
      continue;
    }

    if (i > 0) {
      reversed.push({ type: "removed", text: oldTokens[i - 1]! });
      i -= 1;
    }
  }

  return mergeSegments(reversed.reverse());
}
