/**
 * Custom Date Code System
 * Format: [Letter][Number]  e.g. "B25", "C1", "D10"
 * Letter → Month: A=Juli, B=Agustus, C=September, D=Oktober,
 *                 E=November, F=Desember, G=Januari(+1yr),
 *                 H=Februari(+1yr), I=Maret(+1yr), J=April(+1yr),
 *                 K=Mei(+1yr), L=Juni(+1yr)
 * Number → Day of month
 */

export const LETTER_TO_MONTH: Record<string, number> = {
  A: 7,  B: 8,  C: 9,  D: 10, E: 11, F: 12,
  G: 1,  H: 2,  I: 3,  J: 4,  K: 5,  L: 6,
};

const MONTH_TO_LETTER: Record<number, string> = Object.fromEntries(
  Object.entries(LETTER_TO_MONTH).map(([l, m]) => [m, l])
);

export const MONTH_NAMES_ID = [
  "", "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember",
];

export const MONTH_LETTERS_DISPLAY: Record<string, string> = {
  A:"Juli", B:"Agustus", C:"September", D:"Oktober",
  E:"November", F:"Desember", G:"Januari", H:"Februari",
  I:"Maret", J:"April", K:"Mei", L:"Juni",
};

export interface ParsedDateCode {
  raw:       string;   // "B25"
  letter:    string;   // "B"
  day:       number;   // 25
  month:     number;   // 8
  year:      number;   // 2025
  monthName: string;   // "Agustus"
  iso:       string;   // "2025-08-25"
  display:   string;   // "25 Agustus 2025"
  short:     string;   // "25 Agt"
}

/**
 * Returns the event base year.
 * Convention: if we're in Jul–Dec, base = current year.
 * If we're in Jan–Jun, base = previous year (the event started last July).
 */
export function getEventBaseYear(): number {
  const m = new Date().getMonth(); // 0-indexed
  return m >= 6 ? new Date().getFullYear() : new Date().getFullYear() - 1;
}

/**
 * Parse a date code string like "B25" into a full date object.
 * @param code      e.g. "B25" or "c1" (case-insensitive)
 * @param baseYear  The year for A (July). Defaults to getEventBaseYear().
 */
export function parseDateCode(
  code: string,
  baseYear?: number
): ParsedDateCode | null {
  if (!code || typeof code !== "string") return null;
  const clean = code.trim().toUpperCase();
  const match  = clean.match(/^([A-L])(\d{1,2})$/);
  if (!match) return null;

  const [, letter, dayStr] = match;
  const day   = parseInt(dayStr, 10);
  if (day < 1 || day > 31) return null;

  const month = LETTER_TO_MONTH[letter];
  if (!month) return null;

  const base  = baseYear ?? getEventBaseYear();
  // A-F (Jul-Dec) → baseYear; G-L (Jan-Jun) → baseYear+1
  const year  = month >= 7 ? base : base + 1;

  const pad   = (n: number) => String(n).padStart(2, "0");
  const iso   = `${year}-${pad(month)}-${pad(day)}`;
  const monthName = MONTH_NAMES_ID[month];

  const shortMonths = ["","Jan","Feb","Mar","Apr","Mei","Jun",
                       "Jul","Agt","Sep","Okt","Nov","Des"];

  return {
    raw: clean, letter, day, month, year,
    monthName,
    iso,
    display: `${day} ${monthName} ${year}`,
    short:   `${day} ${shortMonths[month]}`,
  };
}

/**
 * Convert an ISO date string or Date to a date code.
 * @param date      ISO "YYYY-MM-DD" or Date object
 * @param baseYear  The year for A (July). Defaults to getEventBaseYear().
 */
export function toDateCode(date: string | Date, baseYear?: number): string | null {
  const d = typeof date === "string" ? new Date(date + "T00:00:00") : date;
  if (isNaN(d.getTime())) return null;

  const month = d.getMonth() + 1;
  const day   = d.getDate();
  const year  = d.getFullYear();
  const base  = baseYear ?? getEventBaseYear();

  const letter = MONTH_TO_LETTER[month];
  if (!letter) return null;

  // Validate year alignment
  const expectedYear = month >= 7 ? base : base + 1;
  if (year !== expectedYear) return null;

  return `${letter}${day}`;
}

/**
 * Format a date code for display, e.g. "B25" → "25 Agustus 2025"
 */
export function displayDateCode(code: string, baseYear?: number): string {
  const parsed = parseDateCode(code, baseYear);
  return parsed ? parsed.display : code;
}

/**
 * Validate if a string is a valid date code.
 */
export function isValidDateCode(code: string): boolean {
  return parseDateCode(code) !== null;
}

/**
 * Get all letter options for a select dropdown.
 */
export function getLetterOptions(baseYear?: number) {
  const base = baseYear ?? getEventBaseYear();
  return Object.entries(LETTER_TO_MONTH).map(([letter, month]) => {
    const year = month >= 7 ? base : base + 1;
    return {
      value: letter,
      label: `${letter} — ${MONTH_NAMES_ID[month]} ${year}`,
      monthName: MONTH_NAMES_ID[month],
      month,
      year,
    };
  });
}
