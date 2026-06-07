"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { useSocket } from "@/hooks/useSocket";
import {
  Shield, LayoutDashboard, Smartphone, MapPin,
  BarChart2, Bell, Settings, LogOut, ChevronRight,
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
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useSocket(); // Initialize WebSocket connection

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push("/login");
    }
  }, [mounted, isAuthenticated, router]);

  if (!mounted || !isAuthenticated) return null;

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 flex flex-col" style={{ background: "var(--bg-secondary)", borderRight: "1px solid var(--border)" }}>
        {/* Logo */}
        <div className="p-5 flex items-center gap-3" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #5c7cfa, #a78bfa)", boxShadow: "0 0 16px rgba(92,124,250,0.4)" }}>
            <Shield size={18} color="white" />
          </div>
          <div>
            <p className="font-bold text-base leading-none gradient-text">Guardian</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Control Panel</p>
          </div>
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
                className={`sidebar-link ${isActive ? "active" : ""}`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
                {isActive && <ChevronRight size={14} className="ml-auto" style={{ color: "var(--accent)" }} />}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-3" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="flex items-center gap-3 p-2 rounded-lg" style={{ background: "var(--bg-card)" }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #5c7cfa, #a78bfa)", color: "white" }}>
              {user?.name?.[0]?.toUpperCase() ?? "P"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{user?.name}</p>
              <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{user?.role}</p>
            </div>
            <button
              id="logout-btn"
              onClick={handleLogout}
              className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
              title="Logout"
              style={{ color: "var(--text-muted)" }}
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
