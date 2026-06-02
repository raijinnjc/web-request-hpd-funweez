"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import AppLayout from "@/components/layout/AppLayout";
import AddTaskModal from "@/components/layout/AddTaskModal";
import {
  MOCK_TASKS, Task, TaskStatus, STATUS_STYLES, JENIS_COLORS,
  ALL_CATEGORIES, ALL_DIVISI_REQUEST, TaskCategory, DivisiRequest,
} from "@/lib/mockData";
import { useAuth } from "@/context/AuthContext";
import { parseDateCode, isValidDateCode } from "@/lib/dateCode";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, SlidersHorizontal, X, Calendar, User, ChevronDown } from "lucide-react";

// ── Status dot colours ─────────────────────────────────────
const DOT_COLOR: Record<string, string> = {
  completed:     "#10b981",
  "in-progress": "#f59e0b",
  pending:       "#d1d5db",
  cancelled:     "#ef4444",
};

// ── Jenis → bar colour (hex) ──────────────────────────────
const JENIS_BAR: Record<string, string> = {
  "Animasi":                "#818cf8",
  "Foto":                   "#60a5fa",
  "Movie/Video Dokumentasi":"#64748b",
  "Teaser":                 "#fb923c",
  "Video Lainnya":          "#2dd4bf",
  "Desain Grafis":          "#f472b6",
  "Konten Sosmed":          "#4ade80",
};

function daysBetween(a: string, b: string) {
  return Math.max(0, (new Date(b).getTime() - new Date(a).getTime()) / 86_400_000);
}

// ── Task Tooltip ───────────────────────────────────────────
function TaskTooltip({ task, x, y }: { task: Task; x: number; y: number }) {
  const st  = STATUS_STYLES[task.status];
  return (
    <motion.div
      initial={{ opacity:0, scale:0.95 }}
      animate={{ opacity:1, scale:1 }}
      exit={{ opacity:0, scale:0.95 }}
      transition={{ duration:0.12 }}
      style={{ position:"fixed", left: x+12, top: y-8, zIndex:9999 }}
      className="bg-white border border-gray-200 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] px-4 py-3 min-w-[220px] max-w-[280px] pointer-events-none"
    >
      {task.kode && isValidDateCode(task.kode) && (
        <span className="text-[9px] font-mono font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md border border-indigo-100 inline-block mb-1.5">
          {task.kode} = {parseDateCode(task.kode)?.short}
        </span>
      )}
      <p className="font-semibold text-gray-900 text-xs leading-snug mb-2">{task.title}</p>
      <div className="flex flex-wrap gap-1 mb-2">
        <span className={`badge text-[9px] py-0.5 border-transparent ${st.bg} ${st.text}`}>{st.label}</span>
        <span className={`badge text-[9px] py-0.5 border-transparent ${JENIS_COLORS[task.jenisRequest]}`}>
          {task.jenisRequest.split("/")[0]}
        </span>
      </div>
      <p className="text-[10px] text-gray-500 flex items-center gap-1.5 mb-1">
        <User size={9}/> {task.picRequest} · {task.divisiRequest}
      </p>
      {task.namaHPD && (
        <p className="text-[10px] text-indigo-500 font-medium">HPD: {task.namaHPD}</p>
      )}
      <p className="text-[10px] font-mono text-gray-400 mt-1">
        {task.startDate} → {task.endDate}
      </p>
      {task.keterangan && (
        <p className="text-[10px] text-gray-400 mt-1.5 leading-relaxed line-clamp-2">
          {task.keterangan}
        </p>
      )}
    </motion.div>
  );
}

/* ── Main Page ─────────────────────────────────────────── */
export default function TimelinePage() {
  const { canAddTask, canChangeStatus } = useAuth();
  const [tasks,   setTasks]   = useState<Task[]>(MOCK_TASKS);
  const [modal,   setModal]   = useState(false);
  const [hover,   setHover]   = useState<{ task:Task; x:number; y:number } | null>(null);
  const [source,  setSource]  = useState<"mock"|"sheets">("mock");

  // Filters
  const [filterCat,   setFilterCat]   = useState<TaskCategory | "all">("all");
  const [filterDiv,   setFilterDiv]   = useState<DivisiRequest | "all">("all");
  const [filterStat,  setFilterStat]  = useState<TaskStatus | "all">("all");
  const [filterHPD,   setFilterHPD]   = useState("");
  const [dateFrom,    setDateFrom]    = useState("");
  const [dateTo,      setDateTo]      = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const fetchTasks = async () => {
    try {
      const res  = await fetch("/api/tasks");
      const data = await res.json();
      setTasks(data.tasks);
      setSource(data.source);
    } catch {}
  };
  useEffect(() => { fetchTasks(); }, []);

  const handleAddTask = async (t: Omit<Task,"id"|"status"|"createdAt">) => {
    const task: Task = { ...t, id:String(Date.now()), status:"pending", createdAt:new Date().toISOString().split("T")[0] };
    setTasks(p => [task, ...p]);
    try { await fetch("/api/tasks",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)}); } catch {}
  };

  const handleStatusChange = async (id: string, s: TaskStatus) => {
    setTasks(p => p.map(t => t.id===id ? {...t,status:s} : t));
  };

  // ── Filtered tasks ─────────────────────────────────────
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (filterCat  !== "all" && t.category       !== filterCat)  return false;
      if (filterDiv  !== "all" && t.divisiRequest   !== filterDiv)  return false;
      if (filterStat !== "all" && t.status          !== filterStat) return false;
      if (filterHPD  && !(t.namaHPD?.toLowerCase().includes(filterHPD.toLowerCase()))) return false;
      if (dateFrom   && t.endDate   < dateFrom) return false;
      if (dateTo     && t.startDate > dateTo)   return false;
      return true;
    });
  }, [tasks, filterCat, filterDiv, filterStat, filterHPD, dateFrom, dateTo]);

  // ── Timeline bounds ────────────────────────────────────
  const { minDate, maxDate, totalDays } = useMemo(() => {
    const arr = filteredTasks.flatMap(t => [t.startDate, t.endDate]).sort();
    if (!arr.length) {
      const today = new Date().toISOString().split("T")[0];
      return { minDate:today, maxDate:today, totalDays:30 };
    }
    const minDate = arr[0];
    const maxDate = arr[arr.length - 1];
    const totalDays = Math.max(daysBetween(minDate, maxDate) + 1, 30);
    return { minDate, maxDate, totalDays };
  }, [filteredTasks]);

  // Layout constants
  const COL_W   = 28;
  const ROW_H   = 50;
  const LABEL_W = 210;
  const BAR_H   = 22;
  const svgW    = LABEL_W + totalDays * COL_W + 24;
  const svgH    = (filteredTasks.length + 1) * ROW_H + 20;

  // Weekly tick marks
  const ticks = useMemo(() => {
    const out: { label:string; days:number }[] = [];
    const start = new Date(minDate + "T00:00:00");
    for (let i = 0; i <= totalDays; i += 7) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      out.push({
        label: d.toLocaleDateString("id-ID", { day:"2-digit", month:"short" }),
        days:  i,
      });
    }
    return out;
  }, [minDate, totalDays]);

  // Today marker
  const today = new Date().toISOString().split("T")[0];
  const todayX = today >= minDate && today <= maxDate
    ? LABEL_W + daysBetween(minDate, today) * COL_W
    : null;

  const hasFilters = filterCat!=="all"||filterDiv!=="all"||filterStat!=="all"||filterHPD||dateFrom||dateTo;

  return (
    <AppLayout pageTitle="Timeline View" actions={
      <div className="flex items-center gap-2">
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${source==="sheets"?"bg-emerald-100 text-emerald-600":"bg-gray-100 text-gray-400"}`}>
          {source==="sheets"?"Live":"Mock"}
        </span>
        <motion.button whileTap={{scale:0.97}} onClick={() => setShowFilters(f => !f)}
          className={`btn-secondary text-xs py-2 ${showFilters?"bg-indigo-50 border-indigo-200 text-indigo-700":""}`}>
          <SlidersHorizontal size={13}/> Filter
          {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 ml-0.5" />}
        </motion.button>
        {canAddTask && (
          <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.97}}
            onClick={() => setModal(true)} className="btn-primary text-sm py-2">
            <Plus size={14}/> Tambah Task
          </motion.button>
        )}
      </div>
    }>
      <AddTaskModal open={modal} onClose={() => setModal(false)} onSubmit={handleAddTask} />

      <div className="flex flex-col gap-4">
        {/* ── Filter Panel ──────────────────────────── */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}}
              exit={{opacity:0,height:0}} transition={{duration:0.25}}
              className="overflow-hidden"
            >
              <div className="bento-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-gray-600 flex items-center gap-2">
                    <SlidersHorizontal size={13} className="text-gray-400"/> Filter Timeline
                  </p>
                  {hasFilters && (
                    <button onClick={() => { setFilterCat("all"); setFilterDiv("all"); setFilterStat("all"); setFilterHPD(""); setDateFrom(""); setDateTo(""); }}
                      className="btn-ghost py-1 px-2 text-xs text-red-400 hover:text-red-600 hover:bg-red-50">
                      <X size={11}/> Reset semua
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {/* Status */}
                  <div>
                    <p className="form-label">Status</p>
                    <div className="relative">
                      <select value={filterStat} onChange={e => setFilterStat(e.target.value as any)}
                        className="input-clean select-clean text-xs py-2 pr-7 w-full">
                        <option value="all">Semua</option>
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Selesai</option>
                        <option value="cancelled">Dibatalkan</option>
                      </select>
                      <ChevronDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                    </div>
                  </div>
                  {/* Div HPD */}
                  <div>
                    <p className="form-label">Divisi HPD</p>
                    <div className="relative">
                      <select value={filterCat} onChange={e => setFilterCat(e.target.value as any)}
                        className="input-clean select-clean text-xs py-2 pr-7 w-full">
                        <option value="all">Semua</option>
                        {ALL_CATEGORIES.map(c => <option key={c} value={c}>{c.split(" ")[0]}</option>)}
                      </select>
                      <ChevronDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                    </div>
                  </div>
                  {/* Div Request */}
                  <div>
                    <p className="form-label">Div. Request</p>
                    <div className="relative">
                      <select value={filterDiv} onChange={e => setFilterDiv(e.target.value as any)}
                        className="input-clean select-clean text-xs py-2 pr-7 w-full">
                        <option value="all">Semua</option>
                        {ALL_DIVISI_REQUEST.map(d => <option key={d} value={d}>{d.split(" ")[0]}</option>)}
                      </select>
                      <ChevronDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                    </div>
                  </div>
                  {/* Nama HPD */}
                  <div>
                    <p className="form-label">Nama HPD</p>
                    <input type="text" value={filterHPD} onChange={e => setFilterHPD(e.target.value)}
                      placeholder="Cari nama…" className="input-clean text-xs py-2"/>
                  </div>
                  {/* Date From */}
                  <div>
                    <p className="form-label">Dari Tanggal</p>
                    <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                      className="input-clean text-xs py-2"/>
                  </div>
                  {/* Date To */}
                  <div>
                    <p className="form-label">Sampai Tanggal</p>
                    <input type="date" value={dateTo} min={dateFrom} onChange={e => setDateTo(e.target.value)}
                      className="input-clean text-xs py-2"/>
                  </div>
                </div>
                <p className="text-[11px] text-gray-400 mt-3">
                  Menampilkan <span className="font-semibold text-gray-700">{filteredTasks.length}</span> dari {tasks.length} task
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Gantt Card ────────────────────────────── */}
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
          transition={{delay:0.1,duration:0.35}} className="bento-card overflow-hidden">

          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-gray-900">Gantt Timeline</p>
              <p className="text-xs text-gray-400 mt-0.5 font-mono">{minDate} → {maxDate}</p>
            </div>
            {/* Jenis legend */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(JENIS_BAR).slice(0,4).map(([k,v]) => (
                <div key={k} className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="w-2 h-2 rounded-full" style={{backgroundColor:v}} />
                  <span className="text-[10px] font-medium text-gray-500">{k.split("/")[0]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Empty state */}
          {filteredTasks.length === 0 ? (
            <div className="py-16 text-center">
              <Calendar size={28} className="text-gray-200 mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-400">Tidak ada task</p>
              <p className="text-xs text-gray-300 mt-1">Coba ubah filter atau tambah task baru.</p>
            </div>
          ) : (
            <div className="overflow-x-auto overflow-y-auto max-h-[520px]">
              {/* Tooltip */}
              <AnimatePresence>
                {hover && <TaskTooltip task={hover.task} x={hover.x} y={hover.y} />}
              </AnimatePresence>

              <svg width={svgW} height={svgH} className="min-w-[640px]">
                {/* ── Vertical grid lines ────────────── */}
                {ticks.map((t, i) => (
                  <line key={i}
                    x1={LABEL_W + t.days * COL_W} y1={ROW_H}
                    x2={LABEL_W + t.days * COL_W} y2={svgH}
                    stroke="#f1f3f7" strokeWidth="1" />
                ))}

                {/* ── Header row ─────────────────────── */}
                <rect x={0} y={0} width={svgW} height={ROW_H} fill="#f8f9fb" />
                <line x1={0} y1={ROW_H} x2={svgW} y2={ROW_H} stroke="#e5e7eb" strokeWidth="1" />
                <text x={10} y={ROW_H/2+4} fill="#9ca3af" fontSize="10"
                  fontFamily="Inter,system-ui,sans-serif" fontWeight="600" letterSpacing="1.5">
                  TASK NAME
                </text>
                {ticks.map((t, i) => (
                  <text key={i}
                    x={LABEL_W + t.days * COL_W + 4} y={ROW_H/2+4}
                    fill="#6b7280" fontSize="9" fontFamily="Inter,system-ui,sans-serif">
                    {t.label}
                  </text>
                ))}

                {/* ── Today marker ───────────────────── */}
                {todayX && (
                  <g>
                    <line x1={todayX} y1={ROW_H} x2={todayX} y2={svgH}
                      stroke="#6366f1" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.7" />
                    <rect x={todayX - 16} y={2} width={32} height={18} rx={6} fill="#6366f1" />
                    <text x={todayX} y={14} textAnchor="middle" fill="white"
                      fontSize="8" fontFamily="Inter,system-ui,sans-serif" fontWeight="700">
                      Today
                    </text>
                  </g>
                )}

                {/* ── Task rows ──────────────────────── */}
                {filteredTasks.map((task, idx) => {
                  const rowY    = ROW_H + idx * ROW_H;
                  const barY    = rowY + (ROW_H - BAR_H) / 2;
                  const offsetX = LABEL_W + daysBetween(minDate, task.startDate) * COL_W;
                  const barW    = Math.max(daysBetween(task.startDate, task.endDate) * COL_W + COL_W, COL_W);
                  const fill    = JENIS_BAR[task.jenisRequest] ?? "#6366f1";
                  const isEven  = idx % 2 === 0;
                  const canEdit = canChangeStatus(task.category);

                  return (
                    <g key={task.id}>
                      {/* Row bg */}
                      <rect x={0} y={rowY} width={svgW} height={ROW_H}
                        fill={isEven ? "#ffffff" : "#f9fafb"} />
                      {/* Row divider */}
                      <line x1={0} y1={rowY+ROW_H} x2={svgW} y2={rowY+ROW_H}
                        stroke="#f3f4f6" strokeWidth="1" />

                      {/* Status dot */}
                      <circle cx={14} cy={rowY + ROW_H/2} r={4}
                        fill={DOT_COLOR[task.status]} />

                      {/* Label */}
                      <text x={24} y={rowY + ROW_H/2 + 4}
                        fontSize="10" fontFamily="Inter,system-ui,sans-serif"
                        fontWeight="500" fill="#374151">
                        {task.title.length > 20 ? task.title.slice(0,20)+"…" : task.title}
                      </text>
                      {task.kode && isValidDateCode(task.kode) && (
                        <text x={24} y={rowY + ROW_H/2 + 16}
                          fontSize="8" fontFamily="monospace" fill="#818cf8">
                          {task.kode} · {task.namaHPD?.split(" ")[0] ?? ""}
                        </text>
                      )}

                      {/* Bar */}
                      <rect
                        x={offsetX} y={barY} width={barW} height={BAR_H}
                        rx={8} fill={fill} opacity="0.85"
                        style={{ cursor:"pointer" }}
                        onMouseEnter={e => setHover({ task, x:(e as any).clientX, y:(e as any).clientY })}
                        onMouseLeave={() => setHover(null)}
                      />
                      {/* Bar label */}
                      {barW > 55 && (
                        <text x={offsetX + 8} y={barY + BAR_H/2 + 4}
                          fontSize="8" fontFamily="Inter,system-ui,sans-serif"
                          fontWeight="600" fill="white" style={{pointerEvents:"none"}}>
                          {STATUS_STYLES[task.status].label}
                        </text>
                      )}

                      {/* Progress overlay for in-progress */}
                      {task.status === "in-progress" && barW > 20 && (
                        <rect x={offsetX} y={barY + BAR_H - 3} width={barW * 0.6} height={3}
                          rx={0} fill="white" opacity="0.4" style={{pointerEvents:"none"}} />
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          )}

          {/* Footer */}
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">{filteredTasks.length} task ditampilkan</p>
            <p className="text-[10px] text-gray-300">Hover bar untuk detail task</p>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
