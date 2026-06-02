/**
 * HPD (Humas, Publikasi, Dokumentasi) Team Members
 * Used for the "Nama Orang HPD" assignment feature.
 * Update this list with actual team members.
 */

export interface HPDMember {
  id:       string;
  name:     string;          // Full name
  division: "Dokumentasi & Produksi" | "Desain" | "Sosial Media/Publikasi";
  contact?: string;
}

export const HPD_TEAM: HPDMember[] = [
  // ── Dokumentasi & Produksi ─────────────────────────
  { id:"hpd-1", name:"Rafi Ahmad Fauzan",   division:"Dokumentasi & Produksi" },
  { id:"hpd-2", name:"Bima Sakti Pratama",  division:"Dokumentasi & Produksi" },
  { id:"hpd-3", name:"Dimas Arya Putra",    division:"Dokumentasi & Produksi" },
  { id:"hpd-4", name:"Naufal Hendra",       division:"Dokumentasi & Produksi" },
  // ── Desain ─────────────────────────────────────────
  { id:"hpd-5", name:"Dina Kusumawati",     division:"Desain" },
  { id:"hpd-6", name:"Fira Aulia Rahmah",   division:"Desain" },
  { id:"hpd-7", name:"Rizky Aditya",        division:"Desain" },
  // ── Sosial Media / Publikasi ───────────────────────
  { id:"hpd-8", name:"Bima Satria",         division:"Sosial Media/Publikasi" },
  { id:"hpd-9", name:"Sari Dewi Anggita",   division:"Sosial Media/Publikasi" },
  { id:"hpd-10",name:"Mirza Azhar",         division:"Dokumentasi & Produksi" },
  { id:"hpd-11",name:"Karen Amalia",        division:"Dokumentasi & Produksi" },
  { id:"hpd-12",name:"Yesa Pratiwi",        division:"Sosial Media/Publikasi" },
  { id:"hpd-13",name:"Fadhil Rahman",       division:"Dokumentasi & Produksi" },
];

/** Normalize a name string for matching: lowercase, trim, collapse spaces */
function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

/** Extract the first N words from a normalized name */
function firstWords(s: string, n = 2): string {
  return normalize(s).split(" ").slice(0, n).join(" ");
}

/**
 * Attempt to match a raw name from Google Sheets to an HPD member.
 * Strategy:
 *  1. Exact match (case-insensitive)
 *  2. First-2-word match
 *  3. First-1-word match (first name only)
 *  4. "Includes" check
 *  Returns the matched member's full name, or the raw input as fallback.
 */
export function matchHPDName(rawName: string): string {
  if (!rawName?.trim()) return "";
  const raw  = normalize(rawName);
  const raw2 = firstWords(rawName, 2);
  const raw1 = firstWords(rawName, 1);

  // 1. Exact match
  const exact = HPD_TEAM.find(m => normalize(m.name) === raw);
  if (exact) return exact.name;

  // 2. First-2-words match
  const two = HPD_TEAM.find(m => firstWords(m.name, 2) === raw2);
  if (two) return two.name;

  // 3. First-1-word match
  const one = HPD_TEAM.find(m => firstWords(m.name, 1) === raw1);
  if (one) return one.name;

  // 4. Substring
  const sub = HPD_TEAM.find(m =>
    normalize(m.name).includes(raw) || raw.includes(firstWords(m.name, 1))
  );
  if (sub) return sub.name;

  // Fallback: return as-is (could be a name not in the list)
  return rawName.trim();
}

/**
 * Find an HPD member by name (with fuzzy matching).
 */
export function findHPDMember(rawName: string): HPDMember | undefined {
  const matched = matchHPDName(rawName);
  return HPD_TEAM.find(m => normalize(m.name) === normalize(matched));
}

/**
 * Get HPD members filtered by division.
 */
export function getHPDByDivision(
  division?: "Dokumentasi & Produksi" | "Desain" | "Sosial Media/Publikasi"
): HPDMember[] {
  if (!division) return HPD_TEAM;
  return HPD_TEAM.filter(m => m.division === division);
}
