"use client";
import { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Task, TaskCategory, JenisRequest, DivisiRequest, RepeatType,
  ALL_CATEGORIES, ALL_JENIS, ALL_DIVISI_REQUEST,
} from "@/lib/mockData";
import { HPD_TEAM, getHPDByDivision } from "@/lib/hpdTeam";
import { parseDateCode, toDateCode, getLetterOptions, isValidDateCode } from "@/lib/dateCode";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, X, Upload, FileText, User, Phone, Hash,
  Calendar, RotateCcw, Tag, AlignLeft, Link2,
  ChevronDown, CheckCircle, Info,
} from "lucide-react";

interface Form {
  kode: string; title: string; category: TaskCategory;
  jenisRequest: JenisRequest; keterangan: string;
  konsepRef: string; referensiFileName: string;
  divisiRequest: DivisiRequest; picRequest: string;
  nomorPIC: string; namaHPD: string;
  startDate: string; endDate: string; repeat: RepeatType;
  startKode: string; endKode: string; useKode: boolean;
}

const EMPTY: Form = {
  kode:"", title:"", category:"Dokumentasi & Produksi",
  jenisRequest:"Foto", keterangan:"", konsepRef:"",
  referensiFileName:"", divisiRequest:"Acara",
  picRequest:"", nomorPIC:"", namaHPD:"",
  startDate: new Date().toISOString().split("T")[0],
  endDate:   new Date().toISOString().split("T")[0],
  repeat:"none", startKode:"", endKode:"", useKode:false,
};

const REPEAT_OPTS = [
  {value:"none",label:"Tidak Berulang"},{value:"daily",label:"Harian"},
  {value:"weekly",label:"Mingguan"},{value:"monthly",label:"Bulanan"},
];

function Sel({value,onChange,children,disabled}:{value:string;onChange:(v:string)=>void;children:React.ReactNode;disabled?:boolean}) {
  return (
    <div className="relative">
      <select value={value} onChange={e=>onChange(e.target.value)} disabled={disabled}
        className="input-clean select-clean w-full disabled:opacity-50">
        {children}
      </select>
      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}

function F({label,req,tip,children}:{label:string;req?:boolean;tip?:string;children:React.ReactNode}) {
  return (
    <div>
      <label className="form-label flex items-center gap-1.5">
        {label}{req && <span className="text-red-400">*</span>}
        {tip && <span className="group relative cursor-help">
          <Info size={10} className="text-gray-300 hover:text-gray-500" />
          <span className="absolute bottom-full left-0 mb-1 w-48 bg-gray-800 text-white text-[10px] rounded-lg px-2 py-1.5 hidden group-hover:block z-50 leading-relaxed">{tip}</span>
        </span>}
      </label>
      {children}
    </div>
  );
}

interface Props {
  open:     boolean;
  onClose:  () => void;
  onSubmit: (task: Omit<Task,"id"|"status"|"createdAt">) => void;
}

export default function AddTaskModal({ open, onClose, onSubmit }: Props) {
  const { user } = useAuth();
  const [form,   setForm]   = useState<Form>({
    ...EMPTY,
    category: user?.role==="division" && user.division
      ? user.division as TaskCategory : "Dokumentasi & Produksi",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Form,string>>>({});
  const [done,   setDone]   = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const letterOpts = getLetterOptions();

  const set = (k:keyof Form, v:string|boolean) => {
    setForm(p => ({...p,[k]:v}));
    setErrors(p => {const n={...p};delete n[k];return n;});
  };

  // Handle kode input — parse and show ISO dates
  const handleKodeChange = (v: string) => {
    set("kode", v);
    if (isValidDateCode(v)) {
      const parsed = parseDateCode(v);
      if (parsed) set("endDate", parsed.iso);
    }
  };

  // Handle start/end kode toggle
  const handleStartKode = (v: string) => {
    set("startKode", v);
    const p = parseDateCode(v);
    if (p) set("startDate", p.iso);
  };
  const handleEndKode = (v: string) => {
    set("endKode", v);
    const p = parseDateCode(v);
    if (p) set("endDate", p.iso);
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!form.title.trim())      e.title      = "Wajib diisi";
    if (!form.keterangan.trim()) e.keterangan = "Wajib diisi";
    if (!form.picRequest.trim()) e.picRequest = "Wajib diisi";
    if (!form.nomorPIC.trim())   e.nomorPIC   = "Wajib diisi";
    if (form.endDate < form.startDate) e.endDate = "Tidak boleh sebelum tanggal mulai";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    onSubmit({
      kode: form.kode || undefined, title: form.title.trim(),
      category: form.category, jenisRequest: form.jenisRequest,
      keterangan: form.keterangan.trim(), konsepRef: form.konsepRef || undefined,
      referensiFileName: form.referensiFileName || undefined,
      divisiRequest: form.divisiRequest, picRequest: form.picRequest.trim(),
      nomorPIC: form.nomorPIC.trim(), namaHPD: form.namaHPD || undefined,
      startDate: form.startDate, endDate: form.endDate, repeat: form.repeat as RepeatType,
    });
    setDone(true);
    await new Promise(r => setTimeout(r, 800));
    setDone(false);
    setForm({...EMPTY});
    setErrors({});
    onClose();
  };

  const hpdFiltered = form.category !== "Dokumentasi & Produksi"
    ? getHPDByDivision(form.category as any)
    : HPD_TEAM;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm" />

          <motion.div
            initial={{opacity:0,scale:0.96,y:20}}
            animate={{opacity:1,scale:1,y:0}}
            exit={{opacity:0,scale:0.96,y:12}}
            transition={{type:"spring",stiffness:380,damping:30}}
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-6"
          >
            <div className="w-full max-w-2xl bg-white rounded-3xl border border-gray-100 shadow-[0_20px_60px_rgba(0,0,0,0.12)] overflow-hidden my-4">

              {/* Header */}
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">Form Request Task Baru</h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {user?.division ?? user?.role} · Isi semua field bertanda *
                  </p>
                </div>
                <button onClick={onClose}
                  className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                  <X size={14} className="text-gray-500" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6 max-h-[72vh] overflow-y-auto">

                {/* ── Sec 1: Identitas ─────────────────── */}
                <Section n={1} color="bg-indigo-500" title="Identitas Task">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <F label="Kode Task" tip="Format: [Huruf][Angka]. A=Jul, B=Agt, C=Sep, dst. Contoh: B25 = 25 Agustus">
                      <div className="relative">
                        <Hash size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" value={form.kode}
                          onChange={e => handleKodeChange(e.target.value)}
                          placeholder="Contoh: B25, C11…"
                          className="input-clean pl-9" />
                      </div>
                      {form.kode && isValidDateCode(form.kode) && (
                        <p className="text-[10px] text-indigo-500 mt-1">
                          → {parseDateCode(form.kode)?.display}
                        </p>
                      )}
                    </F>

                    <F label="Jenis Request" req>
                      <Sel value={form.jenisRequest} onChange={v => set("jenisRequest", v as JenisRequest)}>
                        {ALL_JENIS.map(j => <option key={j} value={j}>{j}</option>)}
                      </Sel>
                    </F>

                    <div className="sm:col-span-2">
                      <F label="Nama / Judul Task" req>
                        <input type="text" value={form.title}
                          onChange={e => set("title", e.target.value)}
                          placeholder="Contoh: Animasi Bumper Opening, Dokumentasi Workshop…"
                          className={`input-clean ${errors.title ? "error" : ""}`} />
                        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                      </F>
                    </div>

                    <div className="sm:col-span-2">
                      <F label="Keterangan / Brief" req>
                        <textarea value={form.keterangan}
                          onChange={e => set("keterangan", e.target.value)}
                          placeholder="Jelaskan detail kebutuhan, konsep, referensi warna, durasi, dll…"
                          rows={3}
                          className={`input-clean resize-none ${errors.keterangan ? "error" : ""}`} />
                        {errors.keterangan && <p className="text-xs text-red-500 mt-1">{errors.keterangan}</p>}
                      </F>
                    </div>
                  </div>
                </Section>

                {/* ── Sec 2: Referensi ─────────────────── */}
                <Section n={2} color="bg-emerald-500" title="Referensi & Konsep">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <F label="Link Konsep / Referensi">
                      <div className="relative">
                        <Link2 size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="url" value={form.konsepRef}
                          onChange={e => set("konsepRef", e.target.value)}
                          placeholder="https://drive.google.com/…"
                          className="input-clean pl-9" />
                      </div>
                    </F>

                    <F label="Upload File Referensi">
                      <div onClick={() => fileRef.current?.click()}
                        className={`input-clean flex items-center gap-2 cursor-pointer hover:bg-white ${form.referensiFileName ? "border-emerald-300 bg-emerald-50/50" : ""}`}>
                        <Upload size={12} className="text-gray-400 shrink-0" />
                        {form.referensiFileName
                          ? <span className="text-xs font-medium text-emerald-700 truncate">{form.referensiFileName}</span>
                          : <span className="text-sm text-gray-400">Pilih file…</span>}
                      </div>
                      <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.docx,.doc,.mp4,.mov"
                        className="hidden"
                        onChange={e => { const f=e.target.files?.[0]; if(f) set("referensiFileName",f.name); }} />
                      {form.referensiFileName && (
                        <div className="flex items-center gap-2 mt-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100">
                          <FileText size={10} className="text-emerald-500" />
                          <span className="text-xs text-emerald-700 flex-1 truncate">{form.referensiFileName}</span>
                          <button onClick={() => { set("referensiFileName",""); if(fileRef.current) fileRef.current.value=""; }}>
                            <X size={10} className="text-emerald-400" />
                          </button>
                        </div>
                      )}
                    </F>
                  </div>
                </Section>

                {/* ── Sec 3: Divisi & PIC ───────────────── */}
                <Section n={3} color="bg-amber-500" title="Informasi Divisi Pe-Request">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <F label="Divisi Pe-Request" req>
                      <Sel value={form.divisiRequest} onChange={v => set("divisiRequest", v as DivisiRequest)}>
                        {ALL_DIVISI_REQUEST.map(d => <option key={d} value={d}>{d}</option>)}
                      </Sel>
                    </F>

                    <F label="Ditujukan ke Divisi HPD" req>
                      <Sel value={form.category} onChange={v => { set("category", v as TaskCategory); set("namaHPD",""); }}
                        disabled={user?.role === "division"}>
                        {ALL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </Sel>
                    </F>

                    <F label="Nama PIC Request" req>
                      <div className="relative">
                        <User size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" value={form.picRequest}
                          onChange={e => set("picRequest", e.target.value)}
                          placeholder="Nama PIC dari divisi kamu…"
                          className={`input-clean pl-9 ${errors.picRequest ? "error" : ""}`} />
                      </div>
                      {errors.picRequest && <p className="text-xs text-red-500 mt-1">{errors.picRequest}</p>}
                    </F>

                    <F label="Nomor WA / Kontak PIC" req>
                      <div className="relative">
                        <Phone size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" value={form.nomorPIC}
                          onChange={e => set("nomorPIC", e.target.value)}
                          placeholder="wa.me/628xxx atau 08xxx…"
                          className={`input-clean pl-9 ${errors.nomorPIC ? "error" : ""}`} />
                      </div>
                      {errors.nomorPIC && <p className="text-xs text-red-500 mt-1">{errors.nomorPIC}</p>}
                    </F>

                    <div className="sm:col-span-2">
                      <F label="Nama Orang HPD (Assign)" tip="Pilih anggota HPD yang akan mengerjakan task ini">
                        <Sel value={form.namaHPD} onChange={v => set("namaHPD", v)}>
                          <option value="">— Belum di-assign —</option>
                          {hpdFiltered.map(m => <option key={m.id} value={m.name}>{m.name} ({m.division.split(" ")[0]})</option>)}
                        </Sel>
                      </F>
                    </div>
                  </div>
                </Section>

                {/* ── Sec 4: Jadwal ─────────────────────── */}
                <Section n={4} color="bg-blue-500" title="Jadwal Pengerjaan">
                  {/* Kode mode toggle */}
                  <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-indigo-50 border border-indigo-100">
                    <input type="checkbox" id="useKode" checked={form.useKode}
                      onChange={e => set("useKode", e.target.checked)}
                      className="w-4 h-4 rounded accent-indigo-500" />
                    <label htmlFor="useKode" className="text-xs font-medium text-indigo-700 cursor-pointer">
                      Gunakan Kode Tanggal (A=Jul, B=Agt, C=Sep, D=Okt…)
                    </label>
                  </div>

                  {form.useKode ? (
                    <div className="grid grid-cols-2 gap-4">
                      <F label="Kode Mulai" tip="Format: [Huruf][Angka]. B25 = 25 Agustus">
                        <input type="text" value={form.startKode}
                          onChange={e => handleStartKode(e.target.value)}
                          placeholder="Contoh: B20" className="input-clean" />
                        {form.startKode && isValidDateCode(form.startKode) && (
                          <p className="text-[10px] text-indigo-500 mt-1">→ {parseDateCode(form.startKode)?.display}</p>
                        )}
                      </F>
                      <F label="Kode Deadline" tip="Format: [Huruf][Angka]. C5 = 5 September">
                        <input type="text" value={form.endKode}
                          onChange={e => handleEndKode(e.target.value)}
                          placeholder="Contoh: C5" className="input-clean" />
                        {form.endKode && isValidDateCode(form.endKode) && (
                          <p className="text-[10px] text-indigo-500 mt-1">→ {parseDateCode(form.endKode)?.display}</p>
                        )}
                        {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>}
                      </F>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <F label="Tanggal Mulai" req>
                        <div className="relative">
                          <Calendar size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input type="date" value={form.startDate}
                            onChange={e => set("startDate", e.target.value)}
                            className="input-clean pl-9" />
                        </div>
                      </F>
                      <F label="Deadline / Tgl. Publikasi" req>
                        <div className="relative">
                          <Calendar size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input type="date" value={form.endDate} min={form.startDate}
                            onChange={e => set("endDate", e.target.value)}
                            className={`input-clean pl-9 ${errors.endDate ? "error" : ""}`} />
                        </div>
                        {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>}
                      </F>
                      <F label="Pengulangan">
                        <Sel value={form.repeat} onChange={v => set("repeat", v)}>
                          {REPEAT_OPTS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </Sel>
                      </F>
                    </div>
                  )}

                  {/* Date summary */}
                  {(form.startDate && form.endDate) && (
                    <div className="mt-3 px-3 py-2 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-3">
                      <Calendar size={12} className="text-gray-400" />
                      <span className="text-xs text-gray-600 font-mono">
                        {form.startDate} → {form.endDate}
                        {form.kode && isValidDateCode(form.kode) && (
                          <span className="ml-2 text-indigo-500">· Kode: {form.kode} = {parseDateCode(form.kode)?.short}</span>
                        )}
                      </span>
                    </div>
                  )}
                </Section>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
                <p className="text-xs text-gray-400"><span className="text-red-400">*</span> Wajib diisi</p>
                <div className="flex gap-2.5">
                  <button onClick={onClose} className="btn-secondary">Batal</button>
                  <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.97}}
                    onClick={handleSubmit}
                    className="btn-primary min-w-[140px] justify-center">
                    {done
                      ? <motion.span initial={{scale:0}} animate={{scale:1}} className="flex items-center gap-2"><CheckCircle size={14} /> Tersimpan!</motion.span>
                      : <><Plus size={14} /> Submit Request</>}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Section({n,color,title,children}:{n:number;color:string;title:string;children:React.ReactNode}) {
  return (
    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
      <div className="flex items-center gap-2.5 mb-4">
        <div className={`w-6 h-6 rounded-lg ${color} flex items-center justify-center shrink-0`}>
          <span className="text-xs font-bold text-white">{n}</span>
        </div>
        <p className="font-semibold text-sm text-gray-800">{title}</p>
      </div>
      {children}
    </div>
  );
}
