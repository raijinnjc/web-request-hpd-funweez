"use client";
import { useState, useEffect, useMemo } from "react";
import AppLayout from "@/components/layout/AppLayout";
import AddTaskModal from "@/components/layout/AddTaskModal";
import {
  MOCK_TASKS, Task, TaskStatus, TaskCategory, DivisiRequest, JenisRequest,
  ALL_CATEGORIES, ALL_DIVISI_REQUEST, ALL_JENIS,
  STATUS_STYLES, CATEGORY_COLORS, JENIS_COLORS, DIVISI_COLORS,
} from "@/lib/mockData";
import { HPD_TEAM } from "@/lib/hpdTeam";
import { useAuth } from "@/context/AuthContext";
import { parseDateCode, isValidDateCode } from "@/lib/dateCode";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, SlidersHorizontal, Search, X, ArrowUpDown,
  Eye, Trash2, User, Phone, FileText, ExternalLink,
  ChevronDown, CheckCircle2, RotateCcw,
} from "lucide-react";

type SortKey = "endDate" | "startDate" | "status" | "category" | "divisiRequest" | "createdAt";
type SortDir = "asc" | "desc";

const STATUS_OPTS: (TaskStatus|"all")[] = ["all","pending","in-progress","completed","cancelled"];
const STATUS_LABELS: Record<string,string> = {
  all:"Semua",pending:"Pending","in-progress":"In Progress",
  completed:"Selesai",cancelled:"Dibatalkan",
};
const DOT: Record<string,string> = {
  completed:"bg-emerald-500","in-progress":"bg-amber-500",pending:"bg-gray-300",cancelled:"bg-red-500",
};
const SORT_OPTIONS: {key:SortKey;label:string}[] = [
  {key:"endDate",label:"Deadline"},{key:"startDate",label:"Tgl. Mulai"},
  {key:"status",label:"Status"},{key:"category",label:"Divisi HPD"},
  {key:"divisiRequest",label:"Divisi Request"},{key:"createdAt",label:"Dibuat"},
];

/* ── Detail Drawer ──────────────────────────────────────── */
function DetailDrawer({ task, onClose, onStatusChange, onDelete, onAssignHPD }: {
  task: Task; onClose:()=>void;
  onStatusChange:(id:string,s:TaskStatus)=>void;
  onDelete:(id:string)=>void;
  onAssignHPD:(id:string,name:string)=>void;
}) {
  const { canDeleteTask, canChangeStatus, canAssignHPD } = useAuth();
  const [hpd, setHPD] = useState(task.namaHPD ?? "");
  const st  = STATUS_STYLES[task.status];
  const cat = CATEGORY_COLORS[task.category];
  const div = DIVISI_COLORS[task.divisiRequest];
  const jenis = JENIS_COLORS[task.jenisRequest];
  const canEdit = canChangeStatus(task.category);

  return (
    <>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
        onClick={onClose} className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm" />
      <motion.div
        initial={{opacity:0,x:50}} animate={{opacity:1,x:0}} exit={{opacity:0,x:50}}
        transition={{type:"spring",stiffness:320,damping:28}}
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white border-l border-gray-100 shadow-bento-lg flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {task.kode && (
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 rounded-lg text-[10px] font-mono font-semibold text-indigo-600">
                  {task.kode}
                </span>
                {isValidDateCode(task.kode) && (
                  <span className="text-[10px] text-gray-400">
                    = {parseDateCode(task.kode)?.display}
                  </span>
                )}
              </div>
            )}
            <h3 className="font-semibold text-gray-900 leading-snug">{task.title}</h3>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center ml-3 mt-0.5 shrink-0">
            <X size={13} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <span className={`badge ${st.bg} ${st.text} border-transparent`}>
              <span className={`w-1.5 h-1.5 rounded-full ${DOT[task.status]}`} /> {st.label}
            </span>
            <span className={`badge ${cat} border-transparent`}>{task.category.split(" ")[0]}</span>
            <span className={`badge ${jenis} border-transparent`}>{task.jenisRequest}</span>
            {task.repeat !== "none" && (
              <span className="badge bg-gray-100 text-gray-500 border-transparent">
                <RotateCcw size={9} /> {task.repeat}
              </span>
            )}
          </div>

          {/* Keterangan */}
          <div>
            <p className="form-label mb-1.5">Keterangan / Brief</p>
            <div className="px-3.5 py-3 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-700 leading-relaxed">
              {task.keterangan || "—"}
            </div>
          </div>

          {/* Grid info */}
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label:"Divisi Pe-Request", content:<span className={`badge ${div} border-transparent text-[10px]`}>{task.divisiRequest}</span> },
              { label:"PIC Request",       content:<div className="flex items-center gap-1.5 text-sm font-semibold"><User size={11} className="text-gray-400" />{task.picRequest}</div> },
              { label:"Kontak PIC",        content:<a href={task.nomorPIC.startsWith("wa")? `https://${task.nomorPIC}`:`tel:${task.nomorPIC}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-indigo-500 hover:underline"><Phone size={10}/>{task.nomorPIC.slice(0,22)}</a> },
              { label:"Jadwal",            content:<p className="text-xs font-mono text-gray-600">{task.startDate}<br/><span className="text-gray-400">→</span> {task.endDate}</p> },
            ].map(item => (
              <div key={item.label} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <p className="form-label mb-1.5">{item.label}</p>
                {item.content}
              </div>
            ))}
          </div>

          {/* Referensi */}
          {(task.konsepRef || task.referensiFileName) && (
            <div>
              <p className="form-label mb-2">Referensi</p>
              <div className="space-y-2">
                {task.konsepRef && (
                  <a href={task.konsepRef} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 transition-colors text-xs font-medium text-indigo-600">
                    <ExternalLink size={12} /><span className="truncate">{task.konsepRef}</span>
                  </a>
                )}
                {task.referensiFileName && (
                  <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                    <FileText size={12} className="text-gray-400" />
                    <span className="font-medium text-gray-700">{task.referensiFileName}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Output */}
          {task.linkOutput && (
            <div>
              <p className="form-label mb-2">Link Output</p>
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-xs font-medium text-emerald-700">
                <CheckCircle2 size={13} className="text-emerald-500 shrink-0" /> {task.linkOutput}
              </div>
            </div>
          )}

          {/* Assign HPD */}
          {(canAssignHPD || canEdit) && (
            <div>
              <p className="form-label mb-2">Assign ke Orang HPD</p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <select value={hpd} onChange={e => setHPD(e.target.value)}
                    className="input-clean select-clean w-full text-sm pr-8">
                    <option value="">— Belum di-assign —</option>
                    {HPD_TEAM.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                  </select>
                  <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                <button onClick={() => { onAssignHPD(task.id, hpd); onClose(); }}
                  className="btn-primary py-2 px-3 text-xs">Simpan</button>
              </div>
            </div>
          )}

          {/* Change Status */}
          {canEdit && (
            <div>
              <p className="form-label mb-2">Ubah Status</p>
              <div className="grid grid-cols-2 gap-1.5">
                {(["pending","in-progress","completed","cancelled"] as TaskStatus[]).map(s => {
                  const ss = STATUS_STYLES[s];
                  return (
                    <button key={s}
                      onClick={() => { onStatusChange(task.id, s); onClose(); }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                        task.status===s ? `${ss.bg} ${ss.text} border-transparent` : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                      <span className={`w-2 h-2 rounded-full ${DOT[s]}`} />{ss.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-between">
          <p className="text-[10px] text-gray-400 font-mono">row: {task.rowIndex ?? task.id}</p>
          {canDeleteTask && (
            <button onClick={() => { onDelete(task.id); onClose(); }}
              className="btn-danger text-xs">
              <Trash2 size={12} /> Hapus Task
            </button>
          )}
        </div>
      </motion.div>
    </>
  );
}

/* ── Main Page ─────────────────────────────────────────── */
export default function TasksPage() {
  const { canAddTask } = useAuth();
  const [tasks,   setTasks]  = useState<Task[]>(MOCK_TASKS);
  const [modal,   setModal]  = useState(false);
  const [detail,  setDetail] = useState<Task|null>(null);
  const [cat,     setCat]    = useState<TaskCategory|"all">("all");
  const [status,  setStatus] = useState<TaskStatus|"all">("all");
  const [div,     setDiv]    = useState<DivisiRequest|"all">("all");
  const [jenis,   setJenis]  = useState<JenisRequest|"all">("all");
  const [search,  setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("endDate");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [loading, setLoading] = useState(false);
  const [source,  setSource] = useState<"mock"|"sheets">("mock");

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/tasks");
      const data = await res.json();
      setTasks(data.tasks);
      setSource(data.source);
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { fetchTasks(); }, []);

  const handleAdd = async (t: Omit<Task,"id"|"status"|"createdAt">) => {
    const task: Task = { ...t, id:String(Date.now()), status:"pending", createdAt:new Date().toISOString().split("T")[0] };
    setTasks(p => [task, ...p]);
    try { await fetch("/api/tasks",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)}); } catch {}
  };

  const handleStatus = async (id:string, s:TaskStatus) => {
    setTasks(p => p.map(t => t.id===id ? {...t,status:s} : t));
    const task = tasks.find(t => t.id===id);
    if (task?.rowIndex) {
      try { await fetch(`/api/tasks/${task.rowIndex}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:s})}); } catch {}
    }
  };

  const handleDelete = async (id:string) => {
    const task = tasks.find(t => t.id===id);
    setTasks(p => p.filter(t => t.id!==id));
    if (task?.rowIndex) {
      try { await fetch(`/api/tasks/${task.rowIndex}`,{method:"DELETE"}); } catch {}
    }
  };

  const handleAssignHPD = async (id:string, name:string) => {
    setTasks(p => p.map(t => t.id===id ? {...t,namaHPD:name||undefined} : t));
    const task = tasks.find(t => t.id===id);
    if (task?.rowIndex) {
      try { await fetch(`/api/tasks/${task.rowIndex}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({namaHPD:name})}); } catch {}
    }
  };

  const toggleSort = (key:SortKey) => {
    if (sortKey===key) setSortDir(d => d==="asc"?"desc":"asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const filtered = useMemo(() => {
    let arr = tasks.filter(t => {
      if (cat!=="all"    && t.category      !== cat)    return false;
      if (status!=="all" && t.status        !== status) return false;
      if (div!=="all"    && t.divisiRequest !== div)    return false;
      if (jenis!=="all"  && t.jenisRequest  !== jenis)  return false;
      if (search) {
        const q = search.toLowerCase();
        if (!t.title.toLowerCase().includes(q) &&
            !t.keterangan.toLowerCase().includes(q) &&
            !(t.picRequest?.toLowerCase().includes(q)) &&
            !(t.namaHPD?.toLowerCase().includes(q)) &&
            !(t.kode?.toLowerCase().includes(q))) return false;
      }
      return true;
    });
    arr.sort((a,b) => {
      let va = (a as any)[sortKey] ?? "";
      let vb = (b as any)[sortKey] ?? "";
      const cmp = va < vb ? -1 : va > vb ? 1 : 0;
      return sortDir==="asc" ? cmp : -cmp;
    });
    return arr;
  }, [tasks, cat, status, div, jenis, search, sortKey, sortDir]);

  const hasFilter = cat!=="all"||status!=="all"||div!=="all"||jenis!=="all"||search;

  return (
    <AppLayout pageTitle="Task Manager" actions={
      <div className="flex items-center gap-2">
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${source==="sheets"?"bg-emerald-100 text-emerald-600":"bg-gray-100 text-gray-400"}`}>
          {source==="sheets"?"Live Sheets":"Mock Data"}
        </span>
        {canAddTask && (
          <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.97}}
            onClick={() => setModal(true)} className="btn-primary text-sm py-2">
            <Plus size={14} /> Tambah Task
          </motion.button>
        )}
      </div>
    }>
      <AddTaskModal open={modal} onClose={() => setModal(false)} onSubmit={handleAdd} />
      <AnimatePresence>{detail && <DetailDrawer task={detail} onClose={() => setDetail(null)} onStatusChange={handleStatus} onDelete={handleDelete} onAssignHPD={handleAssignHPD} />}</AnimatePresence>

      <div className="flex flex-col gap-4">
        {/* ── Filters ───────────────────────────────── */}
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:0.3}}
          className="bento-card p-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={14} className="text-gray-400" />
              <p className="text-xs font-semibold text-gray-600">Filter & Pencarian</p>
            </div>
            {hasFilter && (
              <button onClick={() => {setCat("all");setStatus("all");setDiv("all");setJenis("all");setSearch("");}}
                className="btn-ghost py-1 px-2 text-xs text-gray-400 hover:text-red-500 hover:bg-red-50">
                <X size={11} /> Reset
              </button>
            )}
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama task, keterangan, PIC, kode, nama HPD…"
              className="input-clean pl-9 text-xs" />
          </div>

          <div className="flex flex-wrap gap-4">
            {[
              { label:"Status",       items:STATUS_OPTS,            val:status,    set:(v:any)=>setStatus(v),  labels:STATUS_LABELS },
              { label:"Divisi HPD",   items:["all",...ALL_CATEGORIES], val:cat,    set:(v:any)=>setCat(v),     labels:{all:"Semua",...Object.fromEntries(ALL_CATEGORIES.map(c=>[c,c.split(" ")[0]]))} },
              { label:"Div. Request", items:["all",...ALL_DIVISI_REQUEST], val:div, set:(v:any)=>setDiv(v),  labels:{all:"Semua",...Object.fromEntries(ALL_DIVISI_REQUEST.map(d=>[d,d.split(" ")[0]]))} },
            ].map(f => (
              <div key={f.label}>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{f.label}</p>
                <div className="flex flex-wrap gap-1">
                  {f.items.map((item:any) => (
                    <button key={item} onClick={() => f.set(item)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all ${
                        f.val===item ? "bg-indigo-500 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                      {f.labels[item] ?? item}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Sort */}
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1.5">
              <ArrowUpDown size={11} className="text-gray-400" />
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Urutkan:</span>
            </div>
            {SORT_OPTIONS.map(s => (
              <button key={s.key} onClick={() => toggleSort(s.key)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all ${
                  sortKey===s.key ? "bg-indigo-50 text-indigo-600 border border-indigo-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                {s.label}
                {sortKey===s.key && <span className="text-[9px]">{sortDir==="asc"?"↑":"↓"}</span>}
              </button>
            ))}
          </div>

          <p className="text-[11px] text-gray-400 mt-2.5">
            Menampilkan <span className="font-semibold text-gray-700">{filtered.length}</span> dari {tasks.length} task
          </p>
        </motion.div>

        {/* ── Table ─────────────────────────────────── */}
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.1,duration:0.3}}>
          {filtered.length === 0 ? (
            <div className="bento-card p-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <FileText size={20} className="text-gray-300" />
              </div>
              <p className="font-semibold text-gray-400">Tidak ada task</p>
              <p className="text-sm text-gray-300 mt-1">Coba ubah filter atau tambah request baru.</p>
            </div>
          ) : (
            <div className="bento-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1020px] border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {["#","Kode","Task","Jenis","Divisi Request","PIC","Orang HPD","Deadline","Status","Aksi"].map(h => (
                        <th key={h} className="px-3.5 py-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((task, idx) => {
                      const st  = STATUS_STYLES[task.status];
                      const cat = CATEGORY_COLORS[task.category];
                      const jen = JENIS_COLORS[task.jenisRequest];
                      const dv  = DIVISI_COLORS[task.divisiRequest];
                      return (
                        <motion.tr key={task.id}
                          initial={{opacity:0}} animate={{opacity:1}}
                          transition={{delay:idx*0.025}}
                          className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors group"
                        >
                          <td className="px-3.5 py-3 text-[11px] text-gray-300 font-mono">{String(idx+1).padStart(2,"0")}</td>
                          <td className="px-3.5 py-3">
                            {task.kode ? (
                              <div>
                                <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 rounded-lg text-[10px] font-mono font-semibold text-indigo-600">{task.kode}</span>
                                {isValidDateCode(task.kode) && (
                                  <p className="text-[9px] text-gray-400 mt-0.5">{parseDateCode(task.kode)?.short}</p>
                                )}
                              </div>
                            ) : <span className="text-gray-200">—</span>}
                          </td>
                          <td className="px-3.5 py-3 max-w-[160px]">
                            <p className="text-xs font-semibold text-gray-800 line-clamp-2">{task.title}</p>
                            {task.keterangan && <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{task.keterangan}</p>}
                          </td>
                          <td className="px-3.5 py-3"><span className={`badge text-[10px] border-transparent py-0.5 ${jen}`}>{task.jenisRequest.split("/")[0]}</span></td>
                          <td className="px-3.5 py-3"><span className={`badge text-[10px] border-transparent py-0.5 ${dv}`}>{task.divisiRequest.split(" ")[0]}</span></td>
                          <td className="px-3.5 py-3">
                            <div className="flex items-center gap-1"><User size={10} className="text-gray-400" /><span className="text-xs font-medium text-gray-700 truncate max-w-[80px]">{task.picRequest}</span></div>
                            <a href={task.nomorPIC.startsWith("wa")?`https://${task.nomorPIC}`:`tel:${task.nomorPIC}`} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1 text-[10px] text-indigo-500 hover:underline mt-0.5">
                              <Phone size={8}/>{task.nomorPIC.slice(0,16)}{task.nomorPIC.length>16?"…":""}
                            </a>
                          </td>
                          <td className="px-3.5 py-3">
                            {task.namaHPD
                              ? <span className="text-xs font-medium text-gray-700 whitespace-nowrap">{task.namaHPD.split(" ").slice(0,2).join(" ")}</span>
                              : <span className="text-[10px] text-gray-300 italic">Belum assign</span>}
                          </td>
                          <td className="px-3.5 py-3 text-[11px] font-mono text-gray-500 whitespace-nowrap">
                            {new Date(task.endDate).toLocaleDateString("id-ID",{day:"2-digit",month:"short",year:"2-digit"})}
                            {task.repeat!=="none" && <span className="flex items-center gap-0.5 text-gray-400 mt-0.5"><RotateCcw size={8}/>{task.repeat}</span>}
                          </td>
                          <td className="px-3.5 py-3">
                            <div className="flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${DOT[task.status]}`} />
                              <span className="text-xs font-medium text-gray-700">{st.label}</span>
                            </div>
                          </td>
                          <td className="px-3.5 py-3">
                            <button onClick={() => setDetail(task)}
                              className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-indigo-100 hover:text-indigo-600 flex items-center justify-center transition-colors">
                              <Eye size={13} />
                            </button>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-2.5 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-400">{filtered.length} task</p>
                <p className="text-[10px] text-gray-300">Klik ikon mata untuk detail, assign, & ubah status</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
}
