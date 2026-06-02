"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "./Sidebar";
import { motion } from "framer-motion";

interface Props {
  children:   React.ReactNode;
  pageTitle?: string;
  actions?:   React.ReactNode;
}

export default function AppLayout({ children, pageTitle, actions }: Props) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div animate={{rotate:360}} transition={{repeat:Infinity,duration:0.9,ease:"linear"}}
          className="w-5 h-5 border-2 border-gray-200 border-t-indigo-500 rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top bar */}
        <div className="h-14 border-b border-gray-100 bg-white px-5 flex items-center justify-between shrink-0 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-3">
            <div className="lg:hidden w-9" />
            <h1 className="font-semibold text-gray-900">{pageTitle ?? "Dashboard"}</h1>
          </div>
          <div className="flex items-center gap-3">
            {actions}
            <span className="text-xs text-gray-400 hidden sm:block">{user.name}</span>
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">{user.name.charAt(0)}</span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <motion.main
          initial={{ opacity:0, y:8 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration:0.3, ease:[0.22,1,0.36,1] }}
          className="flex-1 overflow-y-auto p-4 lg:p-5"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
