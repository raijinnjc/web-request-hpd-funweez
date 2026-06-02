"use client";
import { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import AddTaskModal from "@/components/layout/AddTaskModal";
import MetricCards from "@/components/dashboard/MetricCards";
import TaskProgressChart from "@/components/dashboard/TaskProgressChart";
import RightPanel from "@/components/dashboard/RightPanel";
import { MOCK_TASKS, Task, TaskStatus, JENIS_COLORS, STATUS_STYLES } from "@/lib/mockData";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { Plus, RefreshCw } from "lucide-react";
import { parseDateCode, isValidDateCode } from "@/lib/dateCode";

const stagger = { hidden:{}, show:{ transition:{ staggerChildren:0.07 } } };
const up = { hidden:{opacity:0,y:14}, show:{opacity:1,y:0,transition:{duration:0.4,ease:[0.22,1,0.36,1]}} };
const DOT: Record<string,string> = {
  completed:"bg-emerald-500","in-progress":"bg-amber-500",pending:"bg-gray-300",cancelled:"bg-red-500",
};

export default function DashboardPage() {
  const { canAddTask } = useAuth();
  const [tasks,    setTasks]   = useState<Task[]>(MOCK_TASKS);
  const [showModal,setModal]   = useState(false);
  const [loading,  setLoading] = useState(false);
  const [source,   setSource]  = useState<"mock"|"sheets">("mock");

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/tasks");
      const data = await res.json();
      setTasks(data.tasks);
      setSource(data.source);
    } catch {
      // use mock
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleAddTask = async (t: Omit<Task,"id"|"status"|"createdAt">) => {
    const newTask: Task = {
      ...t, id: String(Date.now()), status:"pending",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setTasks(p => [newTask, ...p]);
    try {
      await fetch("/api/tasks", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(t) });
    } catch {}
  };

  const recent = [...tasks].sort((a,b) => new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime()).slice(0,6);

  return (
    <AppLayout pageTitle="Dashboard" actions={
      <div className="flex items-center gap-2">
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${source==="sheets" ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-400"}`}>
          {source==="sheets" ? "Live Sheets" : "Mock Data"}
        </span>
        <button onClick={fetchTasks} disabled={loading} className="btn-ghost p-2">
          <motion.span animate={loading ? {rotate:360} : {rotate:0}}
            transition={loading ? {repeat:Infinity,duration:0.8,ease:"linear"} : {}}>
            <RefreshCw size={13} />
          </motion.span>
        </button>
        {canAddTask && (
          <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.97}}
            onClick={() => setModal(true)} className="btn-primary text-sm py-2">
            <Plus size={14} /> Tambah Task
          </motion.button>
        )}
      </div>
    }>
      <AddTaskModal open={showModal} onClose={() => setModal(false)} onSubmit={handleAddTask} />

      <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col xl:flex-row gap-4">
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <motion.div variants={up}><MetricCards tasks={tasks} /></motion.div>
          <motion.div variants={up}><TaskProgressChart /></motion.div>

          {/* Recent Tasks */}
          <motion.div variants={up} className="bento-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-semibold text-gray-900">Task Terbaru</p>
                <p className="text-xs text-gray-400 mt-0.5">Semua request masuk terkini</p>
              </div>
              <a href="/tasks" className="text-xs font-medium text-indigo-500 hover:text-indigo-700 transition-colors">
                Lihat semua →
              </a>
            </div>
            <div className="space-y-0.5">
              {recent.map((t, i) => (
                <motion.div key={t.id}
                  initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}}
                  transition={{delay:0.3+i*0.05}}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${DOT[t.status]}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">{t.title}</p>
                    <p className="text-[10px] text-gray-400 truncate">{t.keterangan}</p>
                  </div>
                  {t.namaHPD && (
                    <span className="text-[10px] text-gray-400 hidden md:block whitespace-nowrap">
                      {t.namaHPD.split(" ")[0]}
                    </span>
                  )}
                  {t.kode && isValidDateCode(t.kode) && (
                    <span className="font-mono text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-lg border border-indigo-100 shrink-0">
                      {t.kode}
                    </span>
                  )}
                  <span className={`badge text-[9px] py-0 border-transparent ${JENIS_COLORS[t.jenisRequest]} shrink-0`}>
                    {t.jenisRequest.split("/")[0]}
                  </span>
                  <span className="text-[10px] font-mono text-gray-400 shrink-0 hidden sm:block">
                    {new Date(t.endDate).toLocaleDateString("id-ID",{day:"2-digit",month:"short"})}
                  </span>
                </motion.div>
              ))}
              {tasks.length > 6 && (
                <p className="text-center text-[11px] text-gray-400 pt-2">
                  +{tasks.length-6} lainnya · <a href="/tasks" className="text-indigo-500 font-semibold hover:underline">Task Manager</a>
                </p>
              )}
            </div>
          </motion.div>
        </div>

        <div className="xl:w-72 shrink-0">
          <RightPanel tasks={tasks} />
        </div>
      </motion.div>
    </AppLayout>
  );
}
