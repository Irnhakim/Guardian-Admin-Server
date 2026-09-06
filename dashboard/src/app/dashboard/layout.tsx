"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSocket } from "@/hooks/useSocket";
import {
  Shield, LayoutDashboard, Smartphone, MapPin,
  BarChart2, Bell, Settings, ChevronRight, Menu, X,
  Lock, LogOut, KeyRound,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/devices", label: "Devices", icon: Smartphone },
  { href: "/dashboard/location", label: "Location", icon: MapPin },
  { href: "/dashboard/usage", label: "Screen Time", icon: BarChart2 },
  { href: "/dashboard/apps", label: "Apps", icon: Shield },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/rules", label: "Rules", icon: Settings },
];

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 menit
const DASHBOARD_PIN = "123123";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [inputPin, setInputPin] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useSocket();

  const handleLogout = useCallback(() => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("guardian_auth");
      sessionStorage.removeItem("guardian_last_active");
    }
    setIsAuthenticated(false);
    setInputPin("");
    setErrorMsg("");
  }, []);

  const updateActivity = useCallback(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("guardian_auth") === "true") {
      sessionStorage.setItem("guardian_last_active", Date.now().toString());
    }
  }, []);

  // Check initial auth & handle inactivity
  useEffect(() => {
    const isAuth = sessionStorage.getItem("guardian_auth") === "true";
    const lastActive = parseInt(sessionStorage.getItem("guardian_last_active") || "0", 10);
    const now = Date.now();

    if (isAuth && now - lastActive < INACTIVITY_TIMEOUT) {
      sessionStorage.setItem("guardian_last_active", now.toString());
      setIsAuthenticated(true);
    } else {
      handleLogout();
    }

    // Inactivity heartbeat checker every 10 seconds
    const interval = setInterval(() => {
      const auth = sessionStorage.getItem("guardian_auth") === "true";
      const last = parseInt(sessionStorage.getItem("guardian_last_active") || "0", 10);
      if (auth && Date.now() - last >= INACTIVITY_TIMEOUT) {
        handleLogout();
      }
    }, 10000);

    // User interaction listeners
    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((evt) => window.addEventListener(evt, updateActivity));

    return () => {
      clearInterval(interval);
      events.forEach((evt) => window.removeEventListener(evt, updateActivity));
    };
  }, [handleLogout, updateActivity]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPin === DASHBOARD_PIN) {
      sessionStorage.setItem("guardian_auth", "true");
      sessionStorage.setItem("guardian_last_active", Date.now().toString());
      setIsAuthenticated(true);
      setErrorMsg("");
      setInputPin("");
    } else {
      setErrorMsg("Password salah! Silakan coba lagi.");
    }
  };

  const closeMobile = () => setMobileOpen(false);

  // Loading state to prevent flash of content
  if (isAuthenticated === null) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Auth Gate modal
  if (!isAuthenticated) {
    return (
      <div className="h-screen w-screen flex items-center justify-center p-4" style={{ background: "var(--bg-primary)" }}>
        <div className="glass-card max-w-sm w-full p-6 text-center space-y-5 border border-[var(--border)] shadow-2xl">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
            style={{ background: "linear-gradient(135deg, #5c7cfa, #a78bfa)", boxShadow: "0 0 24px rgba(92,124,250,0.5)" }}>
            <Lock size={26} color="white" />
          </div>

          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Guardian Dashboard</h1>
            <p className="text-xs mt-1 text-slate-400">
              Masukkan password admin untuk mengakses kontrol panel. Sesi berakhir otomatis setelah 30 menit inaktif.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                autoFocus
                placeholder="Masukkan Password"
                value={inputPin}
                onChange={(e) => {
                  setInputPin(e.target.value);
                  if (errorMsg) setErrorMsg("");
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-[var(--bg-secondary)] border border-[var(--border)] text-white placeholder-slate-500 focus:outline-none focus:border-[var(--accent)] text-center tracking-widest font-mono"
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-400 font-medium">{errorMsg}</p>
            )}

            <button
              type="submit"
              className="btn-primary w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              Masuk Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden flex-col md:flex-row" style={{ background: "var(--bg-primary)" }}>
      {/* Mobile Top Bar */}
      <div
        className="flex md:hidden items-center justify-between px-4 py-3 z-30"
        style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #5c7cfa, #a78bfa)" }}
          >
            <Shield size={16} color="white" />
          </div>
          <span className="font-bold text-sm gradient-text">Guardian</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleLogout}
            title="Keluar"
            className="p-2 rounded-lg text-slate-400 hover:text-rose-400"
            style={{ background: "var(--bg-card)" }}
          >
            <LogOut size={16} />
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-white"
            style={{ background: "var(--bg-card)" }}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Backdrop for Mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar / Drawer */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 md:w-60 flex-shrink-0 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: "var(--bg-secondary)", borderRight: "1px solid var(--border)" }}
      >
        {/* Logo (Desktop) */}
        <div className="p-5 hidden md:flex items-center gap-3" style={{ borderBottom: "1px solid var(--border)" }}>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #5c7cfa, #a78bfa)", boxShadow: "0 0 16px rgba(92,124,250,0.4)" }}
          >
            <Shield size={18} color="white" />
          </div>
          <div>
            <p className="font-bold text-base leading-none gradient-text">Guardian</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Control Panel</p>
          </div>
        </div>

        {/* Mobile Header in Drawer */}
        <div className="p-4 flex md:hidden items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2">
            <Shield size={16} style={{ color: "var(--accent)" }} />
            <span className="font-bold text-sm gradient-text">Menu</span>
          </div>
          <button onClick={closeMobile} className="p-1 rounded text-slate-400">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobile}
                className={`sidebar-link ${isActive ? "active" : ""}`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
                {isActive && <ChevronRight size={14} className="ml-auto" style={{ color: "var(--accent)" }} />}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button in Sidebar Footer */}
        <div className="p-3 border-t border-[var(--border)]">
          <button
            onClick={handleLogout}
            className="sidebar-link w-full text-slate-400 hover:text-rose-400 cursor-pointer"
          >
            <LogOut size={18} />
            <span>Kunci Sesi</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full">
        {children}
      </main>
    </div>
  );
}
