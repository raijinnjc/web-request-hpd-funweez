"use client";
import { useState } from "react";
import { MONTHLY_CHART_DATA } from "@/lib/mockData";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-bento-md px-4 py-3 min-w-[140px]">
      <p className="text-xs font-semibold text-gray-700 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{backgroundColor:p.fill}} />
            <span className="text-gray-500">{p.name}</span>
          </div>
          <span className="font-semibold text-gray-800">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

const LEGEND = [
  {color:"#6366f1",label:"Selesai"},
  {color:"#f59e0b",label:"Proses"},
  {color:"#e5e7eb",label:"Pending"},
];

export default function TaskProgressChart() {
  const [idx, setIdx]     = useState(MONTHLY_CHART_DATA.length - 2); // default: last real month
  const [dir, setDir]     = useState(0); // -1 = left, +1 = right

  const current = MONTHLY_CHART_DATA[idx];
  const canPrev = idx > 0;
  const canNext = idx < MONTHLY_CHART_DATA.length - 1;

  const go = (d: number) => {
    setDir(d);
    setIdx(i => i + d);
  };

  const variants = {
    enter: (d: number) => ({ opacity:0, x: d * 40 }),
    center: { opacity:1, x:0 },
    exit:  (d: number) => ({ opacity:0, x: d * -40 }),
  };

  return (
    <motion.div
      initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}
      transition={{delay:0.2,duration:0.4,ease:[0.22,1,0.36,1]}}
      className="bento-card p-5"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-gray-900">Task Progress Analysis</p>
            {current.isPrediction && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 border border-purple-100 text-[10px] font-semibold text-purple-600">
                <Sparkles size={9} /> Prediksi
              </span>
            )}
          </div>
          <AnimatePresence mode="wait">
            <motion.p key={current.monthLabel}
              initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-4}}
              transition={{duration:0.2}}
              className="text-xs text-gray-400 mt-0.5"
            >
              {current.monthLabel}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-2 shrink-0 ml-4">
          {LEGEND.map(l => (
            <div key={l.label} className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-50 border border-gray-100">
              <span className="w-2 h-2 rounded-full" style={{backgroundColor:l.color}} />
              <span className="text-[10px] text-gray-500 font-medium">{l.label}</span>
            </div>
          ))}
          <button onClick={() => go(-1)} disabled={!canPrev}
            className="w-7 h-7 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center disabled:opacity-30 transition-colors">
            <ChevronLeft size={14} />
          </button>
          <span className="text-xs text-gray-400 font-mono w-6 text-center">{idx+1}/{MONTHLY_CHART_DATA.length}</span>
          <button onClick={() => go(1)} disabled={!canNext}
            className="w-7 h-7 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center disabled:opacity-30 transition-colors">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="overflow-hidden">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div key={idx}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{duration:0.3,ease:[0.22,1,0.36,1]}}
          >
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={current.weeks} barSize={16} barGap={3}
                margin={{top:4,right:8,left:-20,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f7" vertical={false} />
                <XAxis dataKey="week" tick={{fontSize:11,fill:"#9ca3af"}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize:11,fill:"#9ca3af"}} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{fill:"rgba(0,0,0,0.03)",radius:8}} />
                <Bar dataKey="completed"  name="Selesai" fill={current.isPrediction ? "#a5b4fc" : "#6366f1"} radius={[5,5,0,0]} />
                <Bar dataKey="inProgress" name="Proses"  fill={current.isPrediction ? "#fcd34d" : "#f59e0b"} radius={[5,5,0,0]} />
                <Bar dataKey="pending"    name="Pending" fill="#e5e7eb" radius={[5,5,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Month dots navigation */}
      <div className="flex items-center justify-center gap-1.5 mt-3">
        {MONTHLY_CHART_DATA.map((m,i) => (
          <button key={i} onClick={() => { setDir(i>idx?1:-1); setIdx(i); }}
            className={`rounded-full transition-all duration-200 ${
              i===idx ? "w-6 h-2 bg-indigo-500" : "w-2 h-2 bg-gray-200 hover:bg-gray-300"
            } ${m.isPrediction ? "border border-purple-300" : ""}`}
          />
        ))}
      </div>
    </motion.div>
  );
}
