"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, Role, Division } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, LayoutGrid, Eye, ArrowRight, Zap,
  CheckCircle, Lock, EyeOff, AlertCircle,
} from "lucide-react";

const ROLES = [
  {
    id: "admin" as Role,
    label: "Admin",
    description: "Akses penuh: lihat semua data, ubah status, hapus task, assign HPD.",
    icon: <ShieldCheck size={18} />,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    needsPassword: true,
    hint: "Masukkan password Admin",
  },
  {
    id: "division" as Role,
    label: "Divisi Terkait",
    description: "Buat request task baru & ubah status pekerjaan divisimu.",
    icon: <LayoutGrid size={18} />,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    needsPassword: true,
    hint: "Masukkan password Divisi",
  },
  {
    id: "viewer" as Role,
    label: "Viewer",
    description: "Hanya bisa melihat dashboard & status (read-only, tanpa password).",
    icon: <Eye size={18} />,
    color: "text-amber-600",
    bg: "bg-amber-50",
    needsPassword: false,
    hint: "",
  },
];

const DIVISIONS: Division[] = [
  "Dokumentasi & Produksi",
  "Desain",
  "Sosial Media/Publikasi",
];

const FACTS = [
  "Monitoring task realtime per divisi",
  "Request & tracking konten HPD",
  "Kalender & Timeline Gantt interaktif",
  "Integrasi langsung ke Google Sheets",
  "Role-based access control",
];

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [name,     setName]    = useState("");
  const [role,     setRole]    = useState<Role | null>(null);
  const [division, setDiv]     = useState<Division>(null);
  const [password, setPass]    = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]   = useState("");
  const [loading,  setLoading] = useState(false);

  const selectedRole = ROLES.find(r => r.id === role);

  const handleSubmit = async () => {
    if (!name.trim()) { setError("Masukkan namamu terlebih dahulu."); return; }
    if (!role)        { setError("Pilih role yang sesuai."); return; }
    if (role === "division" && !division) { setError("Pilih divisimu."); return; }

    setLoading(true);
    setError("");
    await new Promise(r => setTimeout(r, 500));

    const result = login({ name: name.trim(), role, division }, password);
    if (!result.ok) {
      setError(result.error ?? "Login gagal.");
      setLoading(false);
      return;
    }
    router.push("/dashboard");
  };

  const clear = () => { setError(""); setPass(""); };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-white to-indigo-50/40">
      {/* ── Left Hero ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity:0, x:-20 }}
        animate={{ opacity:1, x:0 }}
        transition={{ duration:0.55, ease:[0.22,1,0.36,1] }}
        className="hidden lg:flex w-[400px] shrink-0 flex-col justify-between bg-gradient-to-b from-slate-900 to-indigo-950 p-10 relative overflow-hidden"
      >
        {/* bg blobs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-14">
            <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Zap size={17} className="text-white" fill="white" />
            </div>
            <div>
              <span className="text-white font-bold text-lg">FunWeez</span>
              <span className="ml-2 text-indigo-400 text-xs font-medium bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">HPD</span>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Satu platform,<br />
            <span className="text-indigo-400">semua request.</span>
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Kelola, monitor, dan track semua pekerjaan kepanitiaan dari satu dashboard terpadu.
          </p>
        </div>

        <div className="relative z-10 space-y-2.5">
          {FACTS.map((f, i) => (
            <motion.div key={f}
              initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }}
              transition={{ delay: 0.3 + i*0.08 }}
              className="flex items-center gap-2.5 text-slate-300 text-sm"
            >
              <CheckCircle size={13} className="text-indigo-400 shrink-0" />
              {f}
            </motion.div>
          ))}

          <div className="grid grid-cols-3 gap-3 mt-8 pt-6 border-t border-white/10">
            {[{n:"12+",l:"Tasks"},{n:"3",l:"Divisi HPD"},{n:"7",l:"Div. Request"}].map(s => (
              <div key={s.l} className="text-center">
                <p className="text-2xl font-bold text-white">{s.n}</p>
                <p className="text-xs text-slate-400">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Right Form ────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-14 overflow-y-auto">
        <motion.div
          initial={{ opacity:0, y:16 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration:0.5, delay:0.1, ease:[0.22,1,0.36,1] }}
          className="w-full max-w-[420px]"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center">
              <Zap size={14} className="text-white" fill="white" />
            </div>
            <span className="font-bold text-gray-900">FunWeez HPD</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Selamat datang!</h2>
          <p className="text-sm text-gray-500 mb-7">Pilih role dan masukkan info login untuk mulai.</p>

          {/* Name */}
          <div className="mb-5">
            <label className="form-label">Nama Kamu</label>
            <input type="text" value={name}
              onChange={e => { setName(e.target.value); setError(""); }}
              onKeyDown={e => e.key==="Enter" && handleSubmit()}
              placeholder="Contoh: Budi Santoso"
              className="input-clean" autoFocus />
          </div>

          {/* Role */}
          <div className="mb-5">
            <label className="form-label">Pilih Role</label>
            <div className="space-y-2">
              {ROLES.map((r, i) => (
                <motion.button key={r.id}
                  initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                  transition={{ delay: 0.18 + i*0.07 }}
                  whileHover={{ scale:1.01 }} whileTap={{ scale:0.99 }}
                  onClick={() => { setRole(r.id); setDiv(null); clear(); }}
                  className={`w-full flex items-start gap-3 p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    role === r.id
                      ? "border-indigo-400 bg-indigo-50 shadow-[0_0_0_3px_rgba(99,102,241,0.12)]"
                      : "border-gray-200 bg-white hover:border-gray-300"}`}
                >
                  <div className={`w-8 h-8 rounded-xl ${r.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                    <span className={r.color}>{r.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900">{r.label}</p>
                      {role === r.id && (
                        <motion.span initial={{scale:0}} animate={{scale:1}} className="text-indigo-500">
                          <CheckCircle size={15} />
                        </motion.span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{r.description}</p>
                    {r.needsPassword && (
                      <div className="flex items-center gap-1 mt-1">
                        <Lock size={9} className="text-gray-400" />
                        <span className="text-[10px] text-gray-400">{r.hint}</span>
                      </div>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Division */}
          <AnimatePresence>
            {role === "division" && (
              <motion.div
                initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}}
                exit={{opacity:0,height:0}} transition={{duration:0.22}}
                className="mb-5 overflow-hidden"
              >
                <label className="form-label">Pilih Divisimu</label>
                <div className="space-y-1.5">
                  {DIVISIONS.map(d => (
                    <button key={d as string} onClick={() => { setDiv(d); setError(""); }}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium text-left transition-all ${
                        division === d
                          ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                          : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"}`}
                    >
                      {d as string}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Password */}
          <AnimatePresence>
            {role && role !== "viewer" && (
              <motion.div
                initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}}
                exit={{opacity:0,height:0}} transition={{duration:0.22}}
                className="mb-5 overflow-hidden"
              >
                <label className="form-label">
                  Password {role === "admin" ? "Admin" : "Divisi"}
                </label>
                <div className="relative">
                  <Lock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={e => { setPass(e.target.value); setError(""); }}
                    onKeyDown={e => e.key==="Enter" && handleSubmit()}
                    placeholder={role === "admin" ? "Password Admin…" : "Password Divisi…"}
                    className="input-clean pl-9 pr-10"
                  />
                  <button
                    onClick={() => setShowPass(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} exit={{opacity:0}}
                className="mb-4 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600"
              >
                <AlertCircle size={15} className="shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button
            whileHover={{ scale:1.01 }} whileTap={{ scale:0.98 }}
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary w-full justify-center py-3 text-base font-semibold"
          >
            {loading ? (
              <motion.span animate={{rotate:360}} transition={{repeat:Infinity,duration:0.8,ease:"linear"}}
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full inline-block" />
            ) : (
              <>Masuk ke Dashboard <ArrowRight size={16} /></>
            )}
          </motion.button>

          <p className="text-center text-[11px] text-gray-400 mt-4">
            FunWeez v3 · HPD Request System
          </p>
        </motion.div>
      </div>
    </div>
  );
}
