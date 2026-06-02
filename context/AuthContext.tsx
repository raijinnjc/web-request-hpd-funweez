"use client";

import {
  createContext, useContext, useState, useEffect, ReactNode,
} from "react";

// ── Types ──────────────────────────────────────────────────
export type Role     = "admin" | "division" | "viewer";
export type Division =
  | "Dokumentasi & Produksi"
  | "Desain"
  | "Sosial Media/Publikasi"
  | null;

export interface User {
  name:     string;
  role:     Role;
  division: Division;
}

// ── Hardcoded Credentials ──────────────────────────────────
const ROLE_PASSWORDS: Record<"admin" | "division", string> = {
  admin:    "kabidkasubid",
  division: "picdivisi",
};

interface AuthContextType {
  user:             User | null;
  isLoading:        boolean;
  login:            (user: User, password?: string) => { ok: boolean; error?: string };
  logout:           () => void;
  canAddTask:       boolean;
  canDeleteTask:    boolean;
  canChangeStatus:  (taskCategory?: string) => boolean;
  canAssignHPD:     boolean;
  validatePassword: (role: Role, password: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const STORAGE_KEY = "hpd_funweez_v3_user";

// ── Provider ───────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,      setUser]      = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch { /* ignore */ }
    finally { setIsLoading(false); }
  }, []);

  const validatePassword = (role: Role, password: string): boolean => {
    if (role === "viewer") return true; // no password for viewers
    return ROLE_PASSWORDS[role as "admin" | "division"] === password;
  };

  const login = (
    userData: User,
    password?: string
  ): { ok: boolean; error?: string } => {
    if (userData.role !== "viewer") {
      if (!password) return { ok: false, error: "Password harus diisi." };
      if (!validatePassword(userData.role, password)) {
        return { ok: false, error: "Password salah. Coba lagi." };
      }
    }
    if (userData.role === "division" && !userData.division) {
      return { ok: false, error: "Pilih divisi terlebih dahulu." };
    }
    setUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    return { ok: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  // ── Permission Helpers ─────────────────────────────────
  const canAddTask    = user?.role === "admin" || user?.role === "division";
  const canDeleteTask = user?.role === "admin";
  const canAssignHPD  = user?.role === "admin";

  const canChangeStatus = (taskCategory?: string): boolean => {
    if (!user) return false;
    if (user.role === "admin") return true;
    if (user.role === "division" && taskCategory) {
      return user.division === taskCategory;
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{
      user, isLoading, login, logout,
      canAddTask, canDeleteTask, canAssignHPD,
      canChangeStatus, validatePassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
