"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, LayoutDashboard, ListTodo, CalendarDays, GanttChartSquare,
  ExternalLink, LogOut, CheckCircle2, Menu, X, ChevronRight,
} from "lucide-react";

const NAV = [
  { href:"/dashboard",  label:"Dashboard",    icon:LayoutDashboard  },
  { href:"/tasks",      label:"Task Manager", icon:ListTodo         },
  { href:"/month-view", label:"Month View",   icon:CalendarDays     },
  { href:"/timeline",   label:"Timeline",     icon:GanttChartSquare },
];

const ROLE_BADGE: Record<string,{label:string;cls:string;dot:string}> = {
  admin:    { label:"Admin",  cls:"bg-indigo-50 text-indigo-600",   dot:"bg-indigo-500"  },
  division: { label:"Divisi", cls:"bg-emerald-50 text-emerald-600", dot:"bg-emerald-500" },
  viewer:   { label:"Viewer", cls:"bg-amber-50 text-amber-600",     dot:"bg-amber-500"   },
};

function NavContent({ onNav }: { onNav?: () => void }) {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, logout } = useAuth();
  const badge = user ? ROLE_BADGE[user.role] : null;

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 pt-5 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-200/60">
            <Zap size={15} className="text-white" fill="white" />
          </div>
          <div>
            <p className="font-bold text-sm text-gray-900 leading-none">FunWeez</p>
            <p className="text-[10px] text-gray-400 mt-0.5">HPD Request System</p>
          </div>
        </div>
      </div>

      {/* User card */}
      {user && badge && (
        <div className="px-3 pt-3">
          <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-bold">{user.name.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 truncate">{user.name}</p>
                {user.division && <p className="text-[10px] text-gray-400 truncate">{user.division}</p>}
              </div>
            </div>
            <span className={`inline-flex items-center gap-1.5 mt-2 px-2 py-0.5 rounded-full text-[10px] font-semibold ${badge.cls}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
              {badge.label}
            </span>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-2 mb-2 pt-1">Menu</p>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} onClick={onNav}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-indigo-500 text-white shadow-sm shadow-indigo-200"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}`}
            >
              <Icon size={15} className={active ? "text-white" : "text-gray-400"} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={12} className="text-white/60" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 space-y-2 border-t border-gray-100 pt-3">
        <a href={`https://docs.google.com/spreadsheets/d/1aGnmyBcpG529VOQzYdTNCfLpF0C9Vo_tir4mvPES354`}
          target="_blank" rel="noopener noreferrer"
          className="btn-secondary w-full justify-center text-xs py-2">
          <ExternalLink size={13} /> Open Google Sheet
        </a>
        <button onClick={() => { logout(); router.push("/login"); }}
          className="btn-ghost w-full justify-center text-xs text-gray-400 hover:text-red-500 hover:bg-red-50">
          <LogOut size={13} /> Logout
        </button>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-100">
          <CheckCircle2 size={12} className="text-emerald-500 shrink-0 animate-pulse-soft" />
          <div>
            <p className="text-[10px] font-semibold text-emerald-700">Data updated</p>
            <p className="text-[9px] text-emerald-500">{new Date().toLocaleDateString("id-ID",{day:"2-digit",month:"short",year:"numeric"})}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <motion.button whileTap={{scale:0.93}} onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-4 left-4 z-50 w-9 h-9 rounded-xl bg-white border border-gray-200 shadow-bento flex items-center justify-center">
        {open ? <X size={16} /> : <Menu size={16} />}
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            onClick={() => setOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-30" />
        )}
      </AnimatePresence>
      <aside className={`fixed lg:relative inset-y-0 left-0 z-40 w-56 bg-white border-r border-gray-100 flex flex-col h-screen transition-transform duration-200 ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <NavContent onNav={() => setOpen(false)} />
      </aside>
    </>
  );
}
