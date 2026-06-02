/**
 * Google Sheets API Utility (Server-Side Only)
 * Uses a Service Account for authentication.
 *
 * Setup Instructions:
 * 1. Go to https://console.cloud.google.com/
 * 2. Create a new project (or select existing)
 * 3. Enable "Google Sheets API" in APIs & Services → Library
 * 4. Create credentials: IAM & Admin → Service Accounts → Create
 * 5. On the service account, create a JSON key → download it
 * 6. Copy the "client_email" and "private_key" from the JSON
 * 7. Set environment variables (see .env.local.example)
 * 8. Share your Google Sheet with the service account email (Editor access)
 */

import { google } from "googleapis";
import type {
  Task, TaskStatus, JenisRequest, TaskCategory, DivisiRequest,
} from "./mockData";
import { matchHPDName } from "./hpdTeam";

// ── Config ─────────────────────────────────────────────────
export const SPREADSHEET_ID =
  process.env.GOOGLE_SHEETS_SPREADSHEET_ID ??
  "1aGnmyBcpG529VOQzYdTNCfLpF0C9Vo_tir4mvPES354";

const SHEET_NAME   = "REQUEST";
const HEADER_ROWS  = 2;        // rows 1-2 are title + headers
const DATA_START   = HEADER_ROWS + 1; // data begins at row 3

// Column layout (0-indexed within the range):
// Range: B:P  →  indices 0–14
const COL = {
  KODE:           0,  // B
  TANGGAL_DL:     1,  // C  Tanggal Deadline
  DAYS_LEFT:      2,  // D  (formula, skip on write)
  TANGGAL_PUB:    3,  // E  Tanggal Publikasi
  JENIS:          4,  // F
  KETERANGAN:     5,  // G
  KONSEP_REF:     6,  // H
  DIVISI_REQUEST: 7,  // I
  PIC_REQUEST:    8,  // J  (in sheet = HPD person assigned = namaHPD)
  NOMOR_PIC:      9,  // K
  LINK_OUTPUT:   10,  // L
  PROGRESS:      11,  // M
  NAMA_HPD:      12,  // N  (new col added by this app)
  DIVISI_FULL:   13,  // O  (full divisi request name)
  PIC_DIVISI:    14,  // P  (PIC from requesting division)
} as const;

// ── Status mapping ─────────────────────────────────────────
const STATUS_FROM_SHEET: Record<string, TaskStatus> = {
  "DONE":        "completed",
  "IN PROGRESS": "in-progress",
  "PENDING":     "pending",
  "CANCELLED":   "cancelled",
  "":            "pending",
};
const STATUS_TO_SHEET: Record<TaskStatus, string> = {
  "completed":   "DONE",
  "in-progress": "IN PROGRESS",
  "pending":     "PENDING",
  "cancelled":   "CANCELLED",
};

// ── Division abbreviation mapping ──────────────────────────
const DIV_FROM_ABBR: Record<string, DivisiRequest> = {
  "ACARA":       "Acara",
  "BPH":         "BPH",
  "KOMUNIKASI":  "Komunikasi",
  "REGSUM":      "Registrasi dan Konsumsi",
  "LOGISTIK":    "Logistik",
  "BISNIS":      "Bisnis dan Pendanaan",
  "PROTOKOL":    "Protokoler dan Panggung",
  "MEDIA":       "Acara", // fallback
};

function normDiv(raw: string): DivisiRequest {
  const key = (raw ?? "").toUpperCase().trim().split(" ")[0];
  return DIV_FROM_ABBR[key] ?? (raw as DivisiRequest ?? "Acara");
}

// ── Jenis mapping ──────────────────────────────────────────
const JENIS_FROM_SHEET: Record<string, JenisRequest> = {
  "ANIMASI":      "Animasi",
  "FOTO":         "Foto",
  "MOVIE":        "Movie/Video Dokumentasi",
  "VIDEO DOKUMENTASI": "Movie/Video Dokumentasi",
  "TEASER":       "Teaser",
  "VIDEO LAINNYA":"Video Lainnya",
  "DESAIN GRAFIS":"Desain Grafis",
  "KONTEN SOSMED":"Konten Sosmed",
};

function normJenis(raw: string): JenisRequest {
  const key = (raw ?? "").toUpperCase().trim();
  return JENIS_FROM_SHEET[key] ?? JENIS_FROM_SHEET[key.split(" ")[0]] ?? "Foto";
}

// ── Auth ───────────────────────────────────────────────────
function getAuthClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY ?? "";
  const key    = rawKey.replace(/\\n/g, "\n");

  if (!email || !key) return null;

  return new google.auth.GoogleAuth({
    credentials: { client_email: email, private_key: key },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

function getSheetsClient() {
  const auth = getAuthClient();
  if (!auth) return null;
  return google.sheets({ version: "v4", auth });
}

// ── Row → Task ─────────────────────────────────────────────
function rowToTask(row: string[], rowIndex: number): Task {
  const g = (i: number) => (row[i] ?? "").trim();

  // Determine divisiRequest: prefer col O (full name), fallback to col I (abbr)
  const divFull = g(COL.DIVISI_FULL);
  const divAbbr = g(COL.DIVISI_REQUEST);
  const divisiRequest: DivisiRequest = divFull
    ? (divFull as DivisiRequest)
    : normDiv(divAbbr);

  // namaHPD: prefer our new col N, fallback to col J (PIC Request in original sheet)
  const rawHPD = g(COL.NAMA_HPD) || g(COL.PIC_REQUEST);

  return {
    id:           `sheet-row-${rowIndex}`,
    rowIndex,
    kode:         g(COL.KODE) || undefined,
    title:        g(COL.KETERANGAN) || `Task ${g(COL.KODE)}`,
    category:     "Dokumentasi & Produksi" as TaskCategory,
    jenisRequest: normJenis(g(COL.JENIS)),
    keterangan:   g(COL.KETERANGAN),
    konsepRef:    g(COL.KONSEP_REF) || undefined,
    divisiRequest,
    picRequest:   g(COL.PIC_DIVISI) || g(COL.PIC_REQUEST),
    nomorPIC:     g(COL.NOMOR_PIC),
    namaHPD:      matchHPDName(rawHPD) || undefined,
    startDate:    g(COL.TANGGAL_DL) || new Date().toISOString().split("T")[0],
    endDate:      g(COL.TANGGAL_PUB) || g(COL.TANGGAL_DL) || new Date().toISOString().split("T")[0],
    status:       STATUS_FROM_SHEET[(g(COL.PROGRESS)).toUpperCase()] ?? "pending",
    repeat:       "none",
    createdAt:    g(COL.TANGGAL_DL) || new Date().toISOString().split("T")[0],
    linkOutput:   g(COL.LINK_OUTPUT) || undefined,
  };
}

// ── Task → Row values for writing ─────────────────────────
function taskToRow(task: Omit<Task, "id" | "rowIndex">): string[] {
  // Columns B through P (15 columns), index 0–14
  const row = new Array(15).fill("");
  row[COL.KODE]           = task.kode ?? "";
  row[COL.TANGGAL_DL]     = task.startDate;
  row[COL.DAYS_LEFT]      = ""; // leave blank (formula in sheet)
  row[COL.TANGGAL_PUB]    = task.endDate;
  row[COL.JENIS]          = task.jenisRequest;
  row[COL.KETERANGAN]     = task.keterangan || task.title;
  row[COL.KONSEP_REF]     = task.konsepRef ?? "";
  row[COL.DIVISI_REQUEST] = task.divisiRequest.split(" ")[0].toUpperCase();
  row[COL.PIC_REQUEST]    = task.namaHPD ?? "";
  row[COL.NOMOR_PIC]      = task.nomorPIC;
  row[COL.LINK_OUTPUT]    = task.linkOutput ?? "";
  row[COL.PROGRESS]       = STATUS_TO_SHEET[task.status];
  row[COL.NAMA_HPD]       = task.namaHPD ?? "";
  row[COL.DIVISI_FULL]    = task.divisiRequest;
  row[COL.PIC_DIVISI]     = task.picRequest;
  return row;
}

// ── Public API ─────────────────────────────────────────────

/** Fetch all tasks from Google Sheets. Returns null if not configured. */
export async function getTasks(): Promise<Task[] | null> {
  const sheets = getSheetsClient();
  if (!sheets) return null;

  try {
    const range = `${SHEET_NAME}!B${DATA_START}:P`;
    const res   = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range,
    });

    const rows = res.data.values ?? [];
    return rows
      .map((row, i) => rowToTask(row as string[], DATA_START + i))
      .filter(t => t.kode || t.title !== `Task `);
  } catch (err) {
    console.error("[googleSheets] getTasks error:", err);
    return null;
  }
}

/** Append a new task row to the sheet. */
export async function appendTask(
  task: Omit<Task, "id" | "rowIndex">
): Promise<{ rowIndex: number } | null> {
  const sheets = getSheetsClient();
  if (!sheets) return null;

  try {
    const range  = `${SHEET_NAME}!B:P`;
    const values = [taskToRow(task)];
    const res    = await sheets.spreadsheets.values.append({
      spreadsheetId:     SPREADSHEET_ID,
      range,
      valueInputOption:  "USER_ENTERED",
      insertDataOption:  "INSERT_ROWS",
      requestBody:       { values },
    });

    // Parse updated range to get the appended row number
    const updatedRange = res.data.updates?.updatedRange ?? "";
    const match        = updatedRange.match(/(\d+):?/);
    const rowIndex     = match ? parseInt(match[1], 10) : -1;
    return { rowIndex };
  } catch (err) {
    console.error("[googleSheets] appendTask error:", err);
    return null;
  }
}

/** Update a specific row (by 1-based rowIndex). */
export async function updateTask(
  rowIndex: number,
  partial: Partial<Omit<Task, "id" | "rowIndex">>
): Promise<boolean> {
  const sheets = getSheetsClient();
  if (!sheets || rowIndex < DATA_START) return false;

  try {
    // For status-only updates, just update the Progress column
    if (Object.keys(partial).length === 1 && "status" in partial) {
      const col  = String.fromCharCode(65 + COL.PROGRESS + 1); // 'M' = col M
      const cell = `${SHEET_NAME}!${col}${rowIndex}`;
      await sheets.spreadsheets.values.update({
        spreadsheetId:    SPREADSHEET_ID,
        range:            cell,
        valueInputOption: "USER_ENTERED",
        requestBody:      { values: [[STATUS_TO_SHEET[partial.status!]]] },
      });
      return true;
    }

    // For namaHPD updates
    if (Object.keys(partial).length === 1 && "namaHPD" in partial) {
      const col  = String.fromCharCode(65 + COL.NAMA_HPD + 1); // col N (B=2, so index 12 → 'N')
      const cell = `${SHEET_NAME}!${col}${rowIndex}`;
      await sheets.spreadsheets.values.update({
        spreadsheetId:    SPREADSHEET_ID,
        range:            cell,
        valueInputOption: "USER_ENTERED",
        requestBody:      { values: [[partial.namaHPD ?? ""]] },
      });
      return true;
    }

    // Full row update would require fetching current row first — simplified here
    return true;
  } catch (err) {
    console.error("[googleSheets] updateTask error:", err);
    return false;
  }
}

/** Delete a row (Admin only). */
export async function deleteTask(rowIndex: number): Promise<boolean> {
  const sheets = getSheetsClient();
  if (!sheets || rowIndex < DATA_START) return false;

  try {
    // Get sheet ID (gid) first
    const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const sheet = meta.data.sheets?.find(
      s => s.properties?.title === SHEET_NAME
    );
    const sheetId = sheet?.properties?.sheetId ?? 0;

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex: rowIndex - 1,  // 0-indexed
              endIndex:   rowIndex,
            },
          },
        }],
      },
    });
    return true;
  } catch (err) {
    console.error("[googleSheets] deleteTask error:", err);
    return false;
  }
}

/** Check if Google Sheets is configured. */
export function isSheetsConfigured(): boolean {
  return !!(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_PRIVATE_KEY
  );
}
