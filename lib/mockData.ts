// ── Types ──────────────────────────────────────────────────
export type TaskStatus = "completed" | "in-progress" | "pending" | "cancelled";
export type TaskCategory =
  | "Dokumentasi & Produksi" | "Desain" | "Sosial Media/Publikasi";
export type DivisiRequest =
  | "Acara" | "Bisnis dan Pendanaan" | "Komunikasi"
  | "Logistik" | "BPH" | "Protokoler dan Panggung"
  | "Registrasi dan Konsumsi";
export type JenisRequest =
  | "Animasi" | "Foto" | "Movie/Video Dokumentasi"
  | "Teaser" | "Video Lainnya" | "Desain Grafis" | "Konten Sosmed";
export type RepeatType = "none" | "daily" | "weekly" | "monthly";

export interface Task {
  id:                  string;
  kode?:               string;
  title:               string;
  category:            TaskCategory;
  jenisRequest:        JenisRequest;
  keterangan:          string;
  konsepRef?:          string;
  referensiFileName?:  string;
  divisiRequest:       DivisiRequest;
  picRequest:          string;
  nomorPIC:            string;
  namaHPD?:            string;  // HPD team member assigned
  startDate:           string;
  endDate:             string;
  status:              TaskStatus;
  repeat:              RepeatType;
  createdAt:           string;
  linkOutput?:         string;
  rowIndex?:           number;  // Google Sheets row index (for updates)
}

// ── Styling Maps ───────────────────────────────────────────
export const STATUS_STYLES: Record<TaskStatus,{bg:string;text:string;label:string;dot:string}> = {
  completed:     { bg:"bg-emerald-100",  text:"text-emerald-700", label:"Completed",   dot:"bg-emerald-500" },
  "in-progress": { bg:"bg-amber-100",    text:"text-amber-700",   label:"In Progress", dot:"bg-amber-500"   },
  pending:       { bg:"bg-gray-100",     text:"text-gray-600",    label:"Pending",     dot:"bg-gray-400"    },
  cancelled:     { bg:"bg-red-100",      text:"text-red-600",     label:"Cancelled",   dot:"bg-red-500"     },
};

export const CATEGORY_COLORS: Record<TaskCategory,string> = {
  "Dokumentasi & Produksi": "bg-blue-100 text-blue-700",
  "Desain":                 "bg-pink-100 text-pink-700",
  "Sosial Media/Publikasi": "bg-orange-100 text-orange-700",
};

export const JENIS_COLORS: Record<JenisRequest,string> = {
  "Animasi":                "bg-purple-100 text-purple-700",
  "Foto":                   "bg-blue-100 text-blue-700",
  "Movie/Video Dokumentasi":"bg-slate-100 text-slate-700",
  "Teaser":                 "bg-orange-100 text-orange-700",
  "Video Lainnya":          "bg-teal-100 text-teal-700",
  "Desain Grafis":          "bg-pink-100 text-pink-700",
  "Konten Sosmed":          "bg-green-100 text-green-700",
};

export const DIVISI_COLORS: Record<DivisiRequest,string> = {
  "Acara":                   "bg-blue-100 text-blue-700",
  "Bisnis dan Pendanaan":    "bg-green-100 text-green-700",
  "Komunikasi":              "bg-violet-100 text-violet-700",
  "Logistik":                "bg-amber-100 text-amber-700",
  "BPH":                     "bg-red-100 text-red-700",
  "Protokoler dan Panggung": "bg-yellow-100 text-yellow-700",
  "Registrasi dan Konsumsi": "bg-teal-100 text-teal-700",
};

// ── Constants ──────────────────────────────────────────────
export const ALL_CATEGORIES: TaskCategory[] = [
  "Dokumentasi & Produksi","Desain","Sosial Media/Publikasi",
];
export const ALL_JENIS: JenisRequest[] = [
  "Animasi","Foto","Movie/Video Dokumentasi","Teaser",
  "Video Lainnya","Desain Grafis","Konten Sosmed",
];
export const ALL_DIVISI_REQUEST: DivisiRequest[] = [
  "Acara","Bisnis dan Pendanaan","Komunikasi","Logistik",
  "BPH","Protokoler dan Panggung","Registrasi dan Konsumsi",
];

// ── Mock Tasks ─────────────────────────────────────────────
export const MOCK_TASKS: Task[] = [
  { id:"1", kode:"B25", title:"Bumper FG", category:"Dokumentasi & Produksi",
    jenisRequest:"Animasi", keterangan:"Animasi bumper untuk acara First Gathering",
    divisiRequest:"Acara", picRequest:"Ketua Acara FG", nomorPIC:"wa.me/628111",
    namaHPD:"Mirza Azhar", startDate:"2025-08-15", endDate:"2025-08-25",
    status:"completed", repeat:"none", createdAt:"2025-08-10", linkOutput:"BUMPER FG" },
  { id:"2", kode:"B26", title:"Dokumentasi First Gathering", category:"Dokumentasi & Produksi",
    jenisRequest:"Foto", keterangan:"Dokumentasi kegiatan First Gathering panitia",
    divisiRequest:"Acara", picRequest:"Karen Amalia", nomorPIC:"wa.me/6281223793796",
    namaHPD:"Karen Amalia", startDate:"2025-08-20", endDate:"2025-08-26",
    status:"completed", repeat:"none", createdAt:"2025-08-18", linkOutput:"DOKUMENTASI FG" },
  { id:"3", kode:"C1", title:"Recap First Gathering", category:"Dokumentasi & Produksi",
    jenisRequest:"Movie/Video Dokumentasi", keterangan:"Video recap kegiatan First Gathering",
    konsepRef:"https://youtu.be/example",
    divisiRequest:"Komunikasi", picRequest:"Mirza Azhar", nomorPIC:"wa.me/081945522164",
    namaHPD:"Rafi Ahmad Fauzan", startDate:"2025-09-01", endDate:"2025-09-01",
    status:"completed", repeat:"none", createdAt:"2025-08-28", linkOutput:"RECAP FG" },
  { id:"4", kode:"C1", title:"Grading Foto First Gathering", category:"Desain",
    jenisRequest:"Foto", keterangan:"Color grading foto dokumentasi FG",
    divisiRequest:"Acara", picRequest:"Karen Amalia", nomorPIC:"wa.me/6281223793796",
    namaHPD:"Dina Kusumawati", startDate:"2025-09-01", endDate:"2025-09-01",
    status:"completed", repeat:"none", createdAt:"2025-08-29" },
  { id:"5", kode:"C11", title:"Dokumentasi RDP", category:"Dokumentasi & Produksi",
    jenisRequest:"Foto", keterangan:"Dokumentasi Rapat Dengar Pendapat",
    divisiRequest:"Komunikasi", picRequest:"Mirza Azhar", nomorPIC:"wa.me/081945522164",
    namaHPD:"Mirza Azhar", startDate:"2025-09-05", endDate:"2025-09-11",
    status:"completed", repeat:"none", createdAt:"2025-09-01" },
  { id:"6", kode:"C8", title:"Teaser Wisuda 2025", category:"Dokumentasi & Produksi",
    jenisRequest:"Teaser", keterangan:"Video teaser pengumuman wisuda 2025",
    konsepRef:"https://vt.tiktok.com/example",
    divisiRequest:"BPH", picRequest:"Fadhil Rahman", nomorPIC:"wa.me/628988264308",
    namaHPD:"Bima Sakti Pratama", startDate:"2025-09-04", endDate:"2025-09-08",
    status:"in-progress", repeat:"none", createdAt:"2025-09-02" },
  { id:"7", kode:"D10", title:"Dokumentasi Latgab I", category:"Dokumentasi & Produksi",
    jenisRequest:"Foto", keterangan:"Dokumentasi Latihan Gabungan I",
    divisiRequest:"Acara", picRequest:"Karen Amalia", nomorPIC:"wa.me/6281223793796",
    namaHPD:"Karen Amalia", startDate:"2025-10-05", endDate:"2025-10-10",
    status:"in-progress", repeat:"none", createdAt:"2025-10-01" },
  { id:"8", kode:"D13", title:"Coming Soon Open Registrasi", category:"Desain",
    jenisRequest:"Teaser", keterangan:"Konten coming soon pembukaan registrasi",
    divisiRequest:"BPH", picRequest:"Fadhil Rahman", nomorPIC:"wa.me/628988264308",
    namaHPD:"Dina Kusumawati", startDate:"2025-10-10", endDate:"2025-10-13",
    status:"pending", repeat:"none", createdAt:"2025-10-08" },
  { id:"9", kode:"D16", title:"Animasi Bumper Pubhear I", category:"Dokumentasi & Produksi",
    jenisRequest:"Animasi", keterangan:"Animasi bumper untuk Public Hearing I",
    konsepRef:"https://www.canva.com/design/example",
    divisiRequest:"Komunikasi", picRequest:"Mirza Azhar", nomorPIC:"wa.me/081945522164",
    namaHPD:"Mirza Azhar", startDate:"2025-10-13", endDate:"2025-10-16",
    status:"in-progress", repeat:"none", createdAt:"2025-10-10" },
  { id:"10", kode:"E13", title:"Take Video Tutorial Distribusi", category:"Dokumentasi & Produksi",
    jenisRequest:"Video Lainnya", keterangan:"Video tutorial cara distribusi konsumsi ke peserta",
    referensiFileName:"Konsep Tutorial Distribusi.docx",
    divisiRequest:"Registrasi dan Konsumsi", picRequest:"Fadhil Rahman", nomorPIC:"wa.me/628988264308",
    namaHPD:"Rafi Ahmad Fauzan", startDate:"2025-11-01", endDate:"2025-11-13",
    status:"completed", repeat:"none", createdAt:"2025-11-01", linkOutput:"5. SHOOT DISTRIB..." },
  { id:"11", kode:"E16", title:"Desain Banner Seminar", category:"Desain",
    jenisRequest:"Desain Grafis", keterangan:"Desain banner dan backdrop seminar nasional",
    divisiRequest:"Acara", picRequest:"Ketua Divisi Acara", nomorPIC:"wa.me/628222",
    namaHPD:"Rizky Aditya", startDate:"2025-11-10", endDate:"2025-11-16",
    status:"pending", repeat:"none", createdAt:"2025-11-08" },
  { id:"12", kode:"E20", title:"Konten Instagram Harian", category:"Sosial Media/Publikasi",
    jenisRequest:"Konten Sosmed", keterangan:"Konten feed Instagram selama rangkaian acara",
    divisiRequest:"Komunikasi", picRequest:"Yesa Pratiwi", nomorPIC:"wa.me/6285642497817",
    namaHPD:"Yesa Pratiwi", startDate:"2025-11-01", endDate:"2025-11-20",
    status:"in-progress", repeat:"daily", createdAt:"2025-11-01" },
];

// ── Chart Data ─────────────────────────────────────────────
export const MONTHLY_CHART_DATA = [
  {
    monthLabel: "Agustus 2025",
    weeks: [
      { week:"W1 Agt", completed:2, inProgress:1, pending:1 },
      { week:"W2 Agt", completed:3, inProgress:2, pending:0 },
      { week:"W3 Agt", completed:1, inProgress:2, pending:2 },
      { week:"W4 Agt", completed:4, inProgress:1, pending:0 },
    ],
    isPrediction: false,
  },
  {
    monthLabel: "September 2025",
    weeks: [
      { week:"W1 Sep", completed:3, inProgress:2, pending:1 },
      { week:"W2 Sep", completed:2, inProgress:3, pending:2 },
      { week:"W3 Sep", completed:4, inProgress:1, pending:1 },
      { week:"W4 Sep", completed:3, inProgress:2, pending:0 },
    ],
    isPrediction: false,
  },
  {
    monthLabel: "Oktober 2025",
    weeks: [
      { week:"W1 Okt", completed:2, inProgress:4, pending:2 },
      { week:"W2 Okt", completed:3, inProgress:3, pending:1 },
      { week:"W3 Okt", completed:4, inProgress:2, pending:2 },
      { week:"W4 Okt", completed:3, inProgress:3, pending:1 },
    ],
    isPrediction: false,
  },
  {
    monthLabel: "November 2025",
    weeks: [
      { week:"W1 Nov", completed:4, inProgress:3, pending:2 },
      { week:"W2 Nov", completed:3, inProgress:4, pending:1 },
      { week:"W3 Nov", completed:5, inProgress:2, pending:1 },
      { week:"W4 Nov", completed:4, inProgress:3, pending:0 },
    ],
    isPrediction: false,
  },
  {
    monthLabel: "Desember 2025 (Prediksi)",
    weeks: [
      { week:"W1 Des", completed:3, inProgress:4, pending:2 },
      { week:"W2 Des", completed:4, inProgress:3, pending:2 },
      { week:"W3 Des", completed:5, inProgress:2, pending:1 },
      { week:"W4 Des", completed:6, inProgress:2, pending:0 },
    ],
    isPrediction: true,
  },
];

export const CATEGORY_OVERVIEW = [
  { name:"Dokumentasi & Produksi", total:7, completed:4, color:"bg-blue-500"   },
  { name:"Desain",                 total:3, completed:1, color:"bg-pink-500"   },
  { name:"Sosial Media/Publikasi", total:2, completed:0, color:"bg-orange-500" },
];
