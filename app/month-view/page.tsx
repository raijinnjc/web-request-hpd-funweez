"use client";
import { useState, useEffect, useMemo } from "react";
import AppLayout from "@/components/layout/AppLayout";
import AddTaskModal from "@/components/layout/AddTaskModal";
import { MOCK_TASKS, Task, TaskStatus, STATUS_STYLES, JENIS_COLORS, CATEGORY_COLORS, ALL_DIVISI_REQUEST, ALL_CATEGORIES, DivisiRequest, TaskCategory } from "@/lib/mockData";
import { useAuth } from "@/context/AuthContext";
import { parseDateCode, isValidDateCode, toDateCode } from "@/lib/dateCode";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Plus, X, User, Phone,
  ExternalLink, FileText, CheckCircle2, Calendar, RotateCcw,
} from "lucide-react";

const DAYS_HEADER  = ["Min","Sen","Sel","Rab","Kam","Jum","Sab"];
const MONTHS_ID    = ["Januari","Februari","Maret","April","Mei","Juni",
                      "Juli","Agustus","September","Oktober","November","Desember"];
const DOT: Record<string,string> = {
  completed:"bg-emerald-500","in-progress":"bg-amber-500",
  pending:"bg-gray-300",cancelled:"bg-red-500",
};

/* ── Day Detail Popover ─────────────────────────────────── */
function DayModal({ date, tasks, onClose, onStatusChange }: {
  date: Date; tasks: Task[]; onClose: () => void;
  onStatusChange: (id:string, s:TaskStatus) => void;
}) {
  const { canChangeStatus } = useAuth();
  const label  = date.toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  const iso    = date.toISOString().split("T")[0];
  const code   = toDateCode(iso);

  return (
    <>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
        onClick={onClose} className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm" />
      <motion.div
        initial={{opacity:0,scale:0.95,y:12}} animate={{opacity:1,scale:1,y:0}}
        exit={{opacity:0,scale:0.95,y:8}}
        transition={{type:"spring",stiffness:380,damping:28}}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="w-full max-w-sm bg-white rounded-3xl border border-gray-100 shadow-[0_20px_60px_rgba(0,0,0,0.12)] overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between">
            <div>
              <p className="font-semibold text-gray-900 text-sm">{label}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-gray-400">{tasks.length} task</span>
                {code && (
                  <span className="px-1.5 py-0.5 bg-indigo-50 border border-indigo-100 rounded-lg text-[10px] font-mono font-semibold text-indigo-600">
                    Kode: {code}
                  </span>
                )}
              </div>
            </div>
            <button onClick={onClose}
              className="w-7 h-7 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
              <X size={13} className="text-gray-500" />
            </button>
          </div>

          {/* Task list */}
          <div className="max-h-80 overflow-y-auto">
            {tasks.length === 0 ? (
              <div className="py-10 text-center">
                <Calendar size={24} className="text-gray-200 mx-auto mb-2" />
                <p className="text-xs text-gray-400">Tidak ada task pada tanggal ini</p>
              </div>
            ) : (
              <div className="p-3 space-y-2">
                {tasks.map(t => {
                  const st     = STATUS_STYLES[t.status];
                  const cat    = CATEGORY_COLORS[t.category];
                  const jenis  = JENIS_COLORS[t.jenisRequest];
                  const canEdit = canChangeStatus(t.category);
                  return (
                    <div key={t.id} className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                      {/* Title row */}
                      <div className="flex items-start gap-2.5 mb-2">
                        <span className={`w-2 h-2 rounded-full shrink-0 mt-1 ${DOT[t.status]}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800 leading-snug">{t.title}</p>
                          {t.namaHPD && (
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              HPD: {t.namaHPD}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-1.5 mb-2.5">
                        <span className={`badge text-[9px] py-0.5 border-transparent ${st.bg} ${st.text}`}>{st.label}</span>
                        <span className={`badge text-[9px] py-0.5 border-transparent ${cat}`}>{t.category.split(" ")[0]}</span>
                        <span className={`badge text-[9px] py-0.5 border-transparent ${jenis}`}>{t.jenisRequest.split("/")[0]}</span>
                        {t.kode && isValidDateCode(t.kode) && (
                          <span className="badge text-[9px] py-0.5 bg-indigo-50 text-indigo-600 border-indigo-100 font-mono">{t.kode}</span>
                        )}
                      </div>

                      {/* PIC row */}
                      <div className="flex items-center gap-2 text-[10px] text-gray-500 mb-2">
                        <User size={9} />
                        <span>{t.picRequest}</span>
                        <span className="text-gray-200">·</span>
                        <span>{t.divisiRequest}</span>
                      </div>

                      {/* Status change */}
                      {canEdit && (
                        <div className="flex gap-1 flex-wrap">
                          {(["pending","in-progress","completed","cancelled"] as TaskStatus[]).map(s => {
                            const ss = STATUS_STYLES[s];
                            return (
                              <button key={s}
                                onClick={() => { onStatusChange(t.id, s); }}
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-medium border transition-all ${
                                  t.status===s
                                    ? `${ss.bg} ${ss.text} border-transparent`
                                    : "border-gray-200 text-gray-500 hover:bg-gray-100"}`}>
                                {ss.label}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Keterangan */}
                      {t.keterangan && (
                        <p className="text-[10px] text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                          {t.keterangan}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}

/* ── Main Page ─────────────────────────────────────────── */
export default function MonthViewPage() {
  const { canAddTask } = useAuth();
  const now  = new Date();
  const [year,   setYear]   = useState(now.getFullYear());
  const [month,  setMonth]  = useState(now.getMonth());
  const [tasks,  setTasks]  = useState<Task[]>(MOCK_TASKS);
  const [selected, setSelected] = useState<Date | null>(null);
  const [modal,  setModal]  = useState(false);

  // Filter state
  const [filterCat,  setFilterCat]  = useState<TaskCategory | "all">("all");
  const [filterDiv,  setFilterDiv]  = useState<DivisiRequest | "all">("all");
  const [filterStat, setFilterStat] = useState<TaskStatus | "all">("all");

  const fetchTasks = async () => {
    try {
      const res  = await fetch("/api/tasks");
      const data = await res.json();
      setTasks(data.tasks);
    } catch {}
  };
  useEffect(() => { fetchTasks(); }, []);

  const handleAddTask = async (t: Omit<Task,"id"|"status"|"createdAt">) => {
    const task: Task = { ...t, id:String(Date.now()), status:"pending", createdAt:new Date().toISOString().split("T")[0] };
    setTasks(p => [task, ...p]);
    try { await fetch("/api/tasks",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)}); } catch {}
  };

  const handleStatusChange = (id: string, s: TaskStatus) => {
    setTasks(p => p.map(t => t.id===id ? {...t,status:s} : t));
  };

  // Calendar math
  const daysInMonth  = new Date(year, month+1, 0).getDate();
  const firstDay     = new Date(year, month, 1).getDay();
  const totalCells   = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  const cells        = Array.from({length:totalCells}, (_,i) => {
    const d = i - firstDay + 1;
    return d >= 1 && d <= daysInMonth ? d : null;
  });

  const getTasksForDay = (day: number): Task[] => {
    const ds = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    return tasks.filter(t => {
      if (filterCat  !== "all" && t.category       !== filterCat)  return false;
      if (filterDiv  !== "all" && t.divisiRequest   !== filterDiv)  return false;
      if (filterStat !== "all" && t.status          !== filterStat) return false;
      return t.startDate <= ds && t.endDate >= ds;
    });
  };

  // Count tasks per day for heatmap-style intensity
  const maxTasksInDay = useMemo(() => {
    let max = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      max = Math.max(max, getTasksForDay(d).length);
    }
    return max || 1;
  }, [tasks, year, month, filterCat, filterDiv, filterStat]);

  const prev = () => { if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1); };
  const next = () => { if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1); };

  const selectedTasks = selected
    ? getTasksForDay(selected.getDate()).filter(t => {
        const ds = selected.toISOString().split("T")[0];
        return t.startDate <= ds && t.endDate >= ds;
      })
    : [];

  // Monthly summary stats
  const monthTasks = useMemo(() => {
    const pad = (n:number) => String(n).padStart(2,"0");
    const prefix = `${year}-${pad(month+1)}`;
    return tasks.filter(t => t.startDate.startsWith(prefix) || t.endDate.startsWith(prefix));
  }, [tasks, year, month]);

  return (
    <AppLayout pageTitle="Month View" actions={
      canAddTask ? (
        <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.97}}
          onClick={() => setModal(true)} className="btn-primary text-sm py-2">
          <Plus size={14}/> Tambah Task
        </motion.button>
      ) : undefined
    }>
      <AddTaskModal open={modal} onClose={() => setModal(false)} onSubmit={handleAddTask} />
      <AnimatePresence>
        {selected && (
          <DayModal
            date={selected}
            tasks={selectedTasks}
            onClose={() => setSelected(null)}
            onStatusChange={handleStatusChange}
          />
        )}
      </AnimatePresence>

      <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:0.35}}
        className="flex flex-col gap-4">

        {/* ── Summary Cards ─────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label:"Task Bulan Ini",  value:monthTasks.length,                          color:"text-indigo-600",  bg:"bg-indigo-50"  },
            { label:"Selesai",         value:monthTasks.filter(t=>t.status==="completed").length, color:"text-emerald-600",bg:"bg-emerald-50"},
            { label:"Berjalan",        value:monthTasks.filter(t=>t.status==="in-progress").length,color:"text-amber-600", bg:"bg-amber-50"  },
            { label:"Pending",         value:monthTasks.filter(t=>t.status==="pending").length,  color:"text-gray-600",  bg:"bg-gray-100"  },
          ].map((s,i) => (
            <motion.div key={s.label} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
              transition={{delay:i*0.06}} className="bento-card px-4 py-3 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                <span className={`text-lg font-bold ${s.color}`}>{s.value}</span>
              </div>
              <p className="text-xs text-gray-500 font-medium leading-snug">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Calendar Card ─────────────────────────── */}
        <div className="bento-card overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <button onClick={prev} className="btn-secondary py-2 px-3">
                <ChevronLeft size={15}/>
              </button>
              <AnimatePresence mode="wait">
                <motion.h2 key={`${year}-${month}`}
                  initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-4}}
                  transition={{duration:0.2}}
                  className="font-semibold text-gray-900 w-44 text-center">
                  {MONTHS_ID[month]} {year}
                </motion.h2>
              </AnimatePresence>
              <button onClick={next} className="btn-secondary py-2 px-3">
                <ChevronRight size={15}/>
              </button>
              <button onClick={() => { setMonth(now.getMonth()); setYear(now.getFullYear()); }}
                className="btn-ghost text-xs py-2 px-3">Hari Ini</button>
            </div>

            {/* Mini filters */}
            <div className="flex flex-wrap gap-2 sm:ml-auto">
              <select value={filterStat} onChange={e => setFilterStat(e.target.value as any)}
                className="input-clean select-clean text-xs py-1.5 pr-7 min-w-[110px]">
                <option value="all">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Selesai</option>
                <option value="cancelled">Dibatalkan</option>
              </select>
              <select value={filterCat} onChange={e => setFilterCat(e.target.value as any)}
                className="input-clean select-clean text-xs py-1.5 pr-7 min-w-[130px]">
                <option value="all">Semua Divisi HPD</option>
                {ALL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={filterDiv} onChange={e => setFilterDiv(e.target.value as any)}
                className="input-clean select-clean text-xs py-1.5 pr-7 min-w-[130px]">
                <option value="all">Semua Div. Request</option>
                {ALL_DIVISI_REQUEST.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-gray-100">
            {DAYS_HEADER.map(d => (
              <div key={d} className="py-2.5 text-center text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar cells */}
          <div className="grid grid-cols-7">
            {cells.map((day, i) => {
              const isToday    = day===now.getDate() && month===now.getMonth() && year===now.getFullYear();
              const dayTasks   = day ? getTasksForDay(day) : [];
              const intensity  = day ? dayTasks.length / maxTasksInDay : 0;
              const isWeekend  = (i % 7 === 0) || (i % 7 === 6);

              // Status summary for bg hint
              const hasComplete   = dayTasks.some(t => t.status==="completed");
              const hasInProgress = dayTasks.some(t => t.status==="in-progress");
              const hasPending    = dayTasks.some(t => t.status==="pending");

              return (
                <motion.div key={i}
                  whileHover={day ? {scale:1.01} : {}}
                  whileTap={day ? {scale:0.98} : {}}
                  onClick={() => {
                    if (!day) return;
                    setSelected(new Date(year, month, day));
                  }}
                  className={`
                    min-h-[88px] border-r border-b border-gray-50 p-1.5 transition-colors
                    ${!day ? "bg-gray-50/40" : ""}
                    ${day ? "cursor-pointer" : ""}
                    ${day && dayTasks.length > 0 ? "hover:bg-indigo-50/40" : day ? "hover:bg-gray-50/60" : ""}
                    ${isWeekend && day ? "bg-gray-50/30" : ""}
                    ${ (i + 1) % 7 === 0 ? "border-r-0" : "" }
                  `}
                >
                  {day && (
                    <>
                      {/* Day number */}
                      <div className="flex items-center justify-between mb-1">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-xl text-xs font-semibold transition-colors ${
                          isToday
                            ? "bg-indigo-500 text-white shadow-sm shadow-indigo-200"
                            : dayTasks.length > 0
                              ? "text-gray-800 font-bold"
                              : "text-gray-400"
                        }`}>
                          {day}
                        </span>
                        {/* Task count badge */}
                        {dayTasks.length > 0 && (
                          <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-600 text-[9px] font-bold flex items-center justify-center">
                            {dayTasks.length}
                          </span>
                        )}
                      </div>

                      {/* Status dots row */}
                      {dayTasks.length > 0 && (
                        <div className="flex gap-0.5 mb-1">
                          {hasComplete   && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                          {hasInProgress && <span className="w-1.5 h-1.5 rounded-full bg-amber-400"   />}
                          {hasPending    && <span className="w-1.5 h-1.5 rounded-full bg-gray-300"    />}
                        </div>
                      )}

                      {/* Task pills */}
                      <div className="space-y-0.5">
                        {dayTasks.slice(0, 2).map(t => (
                          <div key={t.id} title={t.title}
                            className={`text-[8px] font-semibold px-1.5 py-0.5 rounded-lg truncate leading-tight badge border-transparent ${JENIS_COLORS[t.jenisRequest]}`}>
                            {t.title.length > 14 ? t.title.slice(0,14)+"…" : t.title}
                          </div>
                        ))}
                        {dayTasks.length > 2 && (
                          <p className="text-[8px] text-indigo-500 font-semibold px-1">
                            +{dayTasks.length - 2} lagi
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="px-5 py-3 border-t border-gray-100 flex flex-wrap items-center gap-x-5 gap-y-1.5">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mr-1">Legend:</p>
            {[
              {dot:"bg-emerald-400",label:"Selesai"},
              {dot:"bg-amber-400", label:"Berjalan"},
              {dot:"bg-gray-300",  label:"Pending"},
              {dot:"bg-indigo-500",label:"Hari ini"},
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${l.dot}`} />
                <span className="text-[10px] text-gray-500">{l.label}</span>
              </div>
            ))}
            <p className="ml-auto text-[10px] text-gray-400 italic">Klik tanggal untuk lihat detail task</p>
          </div>
        </div>
      </motion.div>
    </AppLayout>
  );
}
