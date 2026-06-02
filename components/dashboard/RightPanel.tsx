"use client";
import { useState, useMemo } from "react";
import { Task, STATUS_STYLES, CATEGORY_OVERVIEW, JENIS_COLORS } from "@/lib/mockData";
import { motion } from "framer-motion";
import { Clock, BarChart2, Layers } from "lucide-react";

type TimeRange = "all" | "week" | "month";
const RANGES: {id:TimeRange;label:string}[] = [
  {id:"all",label:"Semua"},{id:"week",label:"Minggu Ini"},{id:"month",label:"Bulan Ini"},
];

const CAT_BAR: Record<string,string> = {
  "bg-blue-500":"bg-blue-500","bg-pink-500":"bg-pink-500","bg-orange-500":"bg-orange-500",
};

export default function RightPanel({ tasks }: { tasks: Task[] }) {
  const [range, setRange] = useState<TimeRange>("all");

  const filtered = useMemo(() => {
    const now = new Date();
    return tasks.filter(t => {
      const c = new Date(t.createdAt);
      if (range==="week")  { const w=new Date(now); w.setDate(now.getDate()-7);  return c>=w; }
      if (range==="month") { const m=new Date(now); m.setMonth(now.getMonth()-1); return c>=m; }
      return true;
    });
  }, [tasks, range]);

  const recent = [...filtered]
    .sort((a,b) => new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime())
    .slice(0, 6);

  const DOT: Record<string,string> = {
    completed:"bg-emerald-500","in-progress":"bg-amber-500",pending:"bg-gray-300",cancelled:"bg-red-500",
  };

  return (
    <motion.div initial={{opacity:0,x:16}} animate={{opacity:1,x:0}}
      transition={{delay:0.3,duration:0.4,ease:[0.22,1,0.36,1]}}
      className="flex flex-col gap-4">

      {/* Time Range */}
      <div className="bento-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock size={12} className="text-gray-400" />
          <p className="section-title">Time Range</p>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {RANGES.map(r => (
            <motion.button key={r.id} whileTap={{scale:0.95}} onClick={() => setRange(r.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                range===r.id ? "bg-indigo-500 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
              {r.label}
            </motion.button>
          ))}
        </div>
        <p className="text-[10px] text-gray-400 mt-2">{filtered.length} task ditemukan</p>
      </div>

      {/* Recently Added */}
      <div className="bento-card p-4 flex-1">
        <div className="flex items-center gap-2 mb-3">
          <Layers size={12} className="text-gray-400" />
          <p className="section-title">Recently Added</p>
        </div>
        <div className="space-y-1 max-h-72 overflow-y-auto">
          {recent.length === 0 && <p className="text-xs text-gray-400 py-4 text-center">Tidak ada task.</p>}
          {recent.map((t, i) => {
            const st = STATUS_STYLES[t.status];
            return (
              <motion.div key={t.id}
                initial={{opacity:0,x:6}} animate={{opacity:1,x:0}}
                transition={{delay:i*0.04}}
                className="flex items-start gap-2.5 px-2.5 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${DOT[t.status]}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 line-clamp-1">{t.title}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`badge text-[9px] py-0 border-transparent ${JENIS_COLORS[t.jenisRequest]}`}>
                      {t.jenisRequest.split("/")[0]}
                    </span>
                    {t.namaHPD && <span className="text-[9px] text-gray-400 truncate">{t.namaHPD.split(" ")[0]}</span>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className={`badge text-[9px] py-0 border-transparent ${st.bg} ${st.text}`}>{st.label}</span>
                  <p className="text-[9px] text-gray-400 mt-1">
                    {new Date(t.createdAt).toLocaleDateString("id-ID",{day:"2-digit",month:"short"})}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Category Overview */}
      <div className="bento-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <BarChart2 size={12} className="text-gray-400" />
          <p className="section-title">Category Overview</p>
        </div>
        <div className="space-y-3">
          {CATEGORY_OVERVIEW.map((cat, i) => {
            const pct = cat.total ? Math.round((cat.completed/cat.total)*100) : 0;
            const barCls = CAT_BAR[cat.color] ?? "bg-indigo-500";
            return (
              <div key={cat.name}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${cat.color}`} />
                    <span className="text-xs text-gray-700 font-medium truncate max-w-[130px]">{cat.name}</span>
                  </div>
                  <span className="text-[10px] text-gray-400">{cat.completed}/{cat.total}</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div className={`h-full ${barCls} rounded-full`}
                    initial={{width:0}} animate={{width:`${pct}%`}}
                    transition={{delay:0.4+i*0.1,duration:0.7,ease:[0.22,1,0.36,1]}} />
                </div>
                <p className="text-[9px] text-gray-400 mt-0.5 text-right">{pct}% selesai</p>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
