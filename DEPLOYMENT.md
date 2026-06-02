# 🚀 Panduan Deploy — Web Request HPD FunWeez v3

## Prasyarat
- Node.js v18+
- Akun GitHub & Vercel (gratis)
- (Opsional) Akun Google Cloud untuk integrasi Sheets

---

## 1 · Jalankan Lokal

```bash
cd web-request-hpd-funweez
npm install
cp .env.local.example .env.local   # lalu isi nilainya

npm run dev
# → http://localhost:3000
```

**Login credentials:**
| Role    | Password       | Catatan               |
|---------|----------------|-----------------------|
| Admin   | `kabidkasubid` | Akses penuh + delete  |
| Divisi  | `picdivisi`    | Pilih divisi HPD dulu |
| Viewer  | *(tanpa password)* | Read-only          |

---

## 2 · Google Sheets Setup (Opsional tapi Direkomendasikan)

### A. Buat Project Google Cloud
1. Buka https://console.cloud.google.com/
2. **New Project** → beri nama (misal `funweez-app`)
3. Pilih project tersebut

### B. Enable Google Sheets API
1. **APIs & Services → Library**
2. Cari **"Google Sheets API"** → klik **Enable**

### C. Buat Service Account
1. **IAM & Admin → Service Accounts → Create Service Account**
2. Nama: `funweez-sheets` → **Create and Continue**
3. Role: **Editor** → **Continue → Done**

### D. Buat JSON Key
1. Klik service account yang baru dibuat
2. Tab **Keys → Add Key → Create new key → JSON**
3. File JSON akan ter-download otomatis

### E. Share Google Sheet
1. Buka spreadsheet: https://docs.google.com/spreadsheets/d/1aGnmyBcpG529VOQzYdTNCfLpF0C9Vo_tir4mvPES354
2. Klik **Share**
3. Tambahkan email dari `client_email` di file JSON → berikan akses **Editor**
4. Klik **Send**

### F. Isi .env.local
Buka file JSON, salin nilai-nilai berikut ke `.env.local`:

```bash
GOOGLE_SHEETS_SPREADSHEET_ID=1aGnmyBcpG529VOQzYdTNCfLpF0C9Vo_tir4mvPES354
GOOGLE_SERVICE_ACCOUNT_EMAIL=   # isi dari "client_email"
GOOGLE_PRIVATE_KEY="            # isi dari "private_key" (jaga \n tetap apa adanya)
```

> ⚠️ **Jangan commit file `.env.local`** — sudah ada di `.gitignore`

---

## 3 · Push ke GitHub

```bash
git init
git add .
git commit -m "feat: HPD FunWeez v3 — Sheets + auth + interactive calendar"
git branch -M main
git remote add origin https://github.com/USERNAME/web-request-hpd-funweez.git
git push -u origin main
```

---

## 4 · Deploy ke Vercel

### Via Dashboard (Direkomendasikan)
1. Buka https://vercel.com/new
2. **Import Git Repository** → pilih repo
3. Framework: **Next.js** (auto-detect ✅)
4. **Environment Variables** → tambahkan 3 variable dari `.env.local`:
   - `GOOGLE_SHEETS_SPREADSHEET_ID`
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`
5. Klik **Deploy** → tunggu ~2 menit
6. ✅ Live di `https://web-request-hpd-funweez.vercel.app`

> **Tip untuk GOOGLE_PRIVATE_KEY di Vercel:**
> Paste seluruh private key termasuk `-----BEGIN...` dan `-----END...`.
> Vercel otomatis menangani newlines — tidak perlu escape manual.

### Via Vercel CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

---

## 5 · Struktur Folder

```
web-request-hpd-funweez/
├── app/
│   ├── layout.tsx                    Root layout + fonts
│   ├── page.tsx                      Auto-redirect
│   ├── globals.css                   Base styles + utilities
│   ├── login/page.tsx                Login + password validation
│   ├── dashboard/page.tsx            Bento dashboard + chart carousel
│   ├── tasks/page.tsx                Task Manager + sort + delete + assign HPD
│   ├── month-view/page.tsx           Kalender interaktif + klik detail
│   ├── timeline/page.tsx             Gantt + filter + hover tooltip
│   └── api/
│       ├── tasks/route.ts            GET all / POST new
│       └── tasks/[id]/route.ts       PATCH status / DELETE row
│
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx             Shell: sidebar + header
│   │   ├── Sidebar.tsx               Nav + user card + logout
│   │   └── AddTaskModal.tsx          Modal form + kode tanggal
│   └── dashboard/
│       ├── MetricCards.tsx           3 kartu metrik animasi
│       ├── TaskProgressChart.tsx     Bar chart carousel (swipe bulan)
│       └── RightPanel.tsx            Time filter + recently added + overview
│
├── context/
│   └── AuthContext.tsx               Role + password + permissions
│
├── lib/
│   ├── mockData.ts                   Types + mock tasks + chart data
│   ├── googleSheets.ts               Google Sheets CRUD API
│   ├── hpdTeam.ts                    HPD members + fuzzy name matching
│   └── dateCode.ts                   Kode tanggal parser (B25 → 25 Agt)
│
├── .env.local.example                Template env variables
├── .gitignore
├── tailwind.config.ts
├── next.config.js
└── package.json
```

---

## 6 · Sistem Kode Tanggal

| Huruf | Bulan         | Contoh    | Hasil              |
|-------|---------------|-----------|--------------------|
| A     | Juli          | A15       | 15 Juli 2025       |
| B     | Agustus       | B25       | 25 Agustus 2025    |
| C     | September     | C1        | 1 September 2025   |
| D     | Oktober       | D10       | 10 Oktober 2025    |
| E     | November      | E13       | 13 November 2025   |
| F     | Desember      | F5        | 5 Desember 2025    |
| G     | Januari (+1)  | G20       | 20 Januari 2026    |
| H     | Februari (+1) | H14       | 14 Februari 2026   |

---

## 7 · Ringkasan Role & Akses

| Fitur                      | Admin | Divisi | Viewer |
|----------------------------|:-----:|:------:|:------:|
| Lihat semua halaman        | ✅    | ✅     | ✅     |
| Tambah request task        | ✅    | ✅     | ❌     |
| Ubah status (divisinya)    | ✅    | ✅     | ❌     |
| Ubah status (semua)        | ✅    | ❌     | ❌     |
| Assign nama HPD            | ✅    | ❌     | ❌     |
| Hapus task                 | ✅    | ❌     | ❌     |
| Kode tanggal di form       | ✅    | ✅     | ❌     |
