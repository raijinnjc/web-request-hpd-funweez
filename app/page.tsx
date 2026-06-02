"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!isLoading) router.replace(user ? "/dashboard" : "/login");
  }, [user, isLoading, router]);
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}}
        className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-200">
          <Zap size={18} className="text-white" fill="white" />
        </div>
        <p className="text-xs text-gray-400 font-medium">Memuat FunWeez…</p>
      </motion.div>
    </div>
  );
}
