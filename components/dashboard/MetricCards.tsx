"use client";
import { Task } from "@/lib/mockData";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Clock, TrendingUp } from "lucide-react";

export default function MetricCards({ tasks }: { tasks: Task[] }) {
  const total      = tasks.length;
  const completed  = tasks.filter(t => t.status==="completed").length;
  const inProgress = tasks.filter(t => t.status==="in-progress").length;
  const pending    = tasks.filter(t => t.status==="pending").length;
  const avg = tasks.reduce((a,t) => a + Math.max((new Date(t.endDate).getTime()-new Date(t.startDate).getTime())/86400000,0), 0) / (total||1);
  const completionRate = total ? Math.round((completed/total)*100) : 0;

  const cards = [
    { label:"Total Tasks",       value:total,              sub:`${completed} selesai · ${pending} pending`,
      icon:<CheckCircle2 size={18}/>, color:"text-indigo-600", bg:"bg-indigo-50",
      trend:`${completionRate}%`, trendSub:"completion rate",
      bar:completionRate, barCls:"bg-indigo-500" },
    { label:"In-Process",        value:inProgress,         sub:`${total-inProgress} tidak aktif`,
      icon:<Loader2 size={18}/>,  color:"text-amber-600",  bg:"bg-amber-50",
      trend:total ? `${Math.round((inProgress/total)*100)}%` : "0%", trendSub:"dari total",
      bar:total ? Math.round((inProgress/total)*100) : 0, barCls:"bg-amber-400" },
    { label:"Time Distribution", value:`${avg.toFixed(1)}d`, sub:"rata-rata durasi task",
      icon:<Clock size={18}/>,    color:"text-emerald-600",bg:"bg-emerald-50",
      trend:`${Math.min(Math.round((avg/14)*100),100)}%`, trendSub:"dari target 2 minggu",
      bar:Math.min(Math.round((avg/14)*100),100), barCls:"bg-emerald-400" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((c,i) => (
        <motion.div key={c.label}
          initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}
          transition={{delay:i*0.07,duration:0.4,ease:[0.22,1,0.36,1]}}
          whileHover={{y:-2,transition:{duration:0.15}}}
          className="bento-card p-5 hover:shadow-bento-md"
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center`}>
              <span className={c.color}>{c.icon}</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-50 border border-gray-100">
              <TrendingUp size={9} className="text-gray-400" />
              <span className="text-[10px] font-semibold text-gray-500">{c.trend}</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-0.5">{c.value}</p>
          <p className="text-xs text-gray-400 font-medium mb-0.5">{c.label}</p>
          <p className="text-[11px] text-gray-400 mb-4">{c.sub}</p>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] text-gray-400">{c.trendSub}</span>
            <span className="text-[10px] font-semibold text-gray-600">{c.bar}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div className={`h-full ${c.barCls} rounded-full`}
              initial={{width:0}} animate={{width:`${c.bar}%`}}
              transition={{delay:i*0.1+0.3,duration:0.8,ease:[0.22,1,0.36,1]}} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
