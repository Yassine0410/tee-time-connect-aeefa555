export const HANDICAP_MIN = 0;
export const HANDICAP_MAX = 36;

export interface HandicapRange {
  min: number;
  max: number;
}

const LEGACY_RANGE_MAP: Record<string, HandicapRange> = {
  "All Levels": { min: 0, max: 36 },
  "0-10": { min: 0, max: 10 },
  "10-20": { min: 10, max: 20 },
  "20-30": { min: 20, max: 30 },
  "30+": { min: 30, max: 36 },
};

export function clampHandicap(value: number) {
  return Math.min(HANDICAP_MAX, Math.max(HANDICAP_MIN, Math.round(value)));
}

export function normalizeHandicapRange(min: number, max: number): HandicapRange {
  const normalizedMin = clampHandicap(min);
  const normalizedMax = clampHandicap(max);

  if (normalizedMin <= normalizedMax) {
    return { min: normalizedMin, max: normalizedMax };
  }

  return { min: normalizedMax, max: normalizedMin };
}

export function isAllLevelsRange(min: number, max: number) {
  const normalized = normalizeHandicapRange(min, max);
  return normalized.min === HANDICAP_MIN && normalized.max === HANDICAP_MAX;
}

export function toLegacyHandicapRange(min: number, max: number) {
  const normalized = normalizeHandicapRange(min, max);
  if (isAllLevelsRange(normalized.min, normalized.max)) {
    return "All Levels";
  }
  if (normalized.min === 0 && normalized.max === 10) return "0-10";
  if (normalized.min === 10 && normalized.max === 20) return "10-20";
  if (normalized.min === 20 && normalized.max === 30) return "20-30";
  if (normalized.min === 30 && normalized.max === 36) return "30+";
  return `${normalized.min}-${normalized.max}`;
}

export function parseLegacyHandicapRange(value?: string | null): HandicapRange | null {
  if (!value) return null;

  const mapped = LEGACY_RANGE_MAP[value];
  if (mapped) return mapped;

  const normalized = value.trim();
  const plusMatch = normalized.match(/^(\d{1,2})\+$/);
  if (plusMatch) {
    const min = clampHandicap(Number(plusMatch[1]));
    return normalizeHandicapRange(min, HANDICAP_MAX);
  }

  const rangeMatch = normalized.match(/^(\d{1,2})\s*-\s*(\d{1,2})$/);
  if (rangeMatch) {
    return normalizeHandicapRange(Number(rangeMatch[1]), Number(rangeMatch[2]));
  }

  return null;
}

export function resolveHandicapRangeFromRow(row: {
  min_handicap?: number | null;
  max_handicap?: number | null;
  handicap_range?: string | null;
}): HandicapRange {
  if (typeof row.min_handicap === "number" && typeof row.max_handicap === "number") {
    return normalizeHandicapRange(row.min_handicap, row.max_handicap);
  }

  const parsedLegacy = parseLegacyHandicapRange(row.handicap_range);
  if (parsedLegacy) return parsedLegacy;

  return { min: HANDICAP_MIN, max: HANDICAP_MAX };
}

export function isHandicapInRange(handicap: number, min: number, max: number) {
  const normalized = normalizeHandicapRange(min, max);
  return handicap >= normalized.min && handicap <= normalized.max;
}
