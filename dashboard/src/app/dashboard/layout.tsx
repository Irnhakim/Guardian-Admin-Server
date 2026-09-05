"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSocket } from "@/hooks/useSocket";
import {
  Shield, LayoutDashboard, Smartphone, MapPin,
  BarChart2, Bell, Settings, ChevronRight, Menu, X,
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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useSocket();

  const closeMobile = () => setMobileOpen(false);

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
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-slate-400 hover:text-white"
          style={{ background: "var(--bg-card)" }}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
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
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full">
        {children}
      </main>
    </div>
  );
}
