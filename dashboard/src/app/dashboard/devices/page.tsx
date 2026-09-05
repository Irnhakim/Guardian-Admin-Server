"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/api";
import { Smartphone, Battery, ChevronRight, AlertTriangle, ShieldCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function DevicesPage() {
  const { data: devices = [], isLoading } = useQuery({
    queryKey: ["devices"],
    queryFn: () => api.get("/devices").then((r) => r.data),
    refetchInterval: 15000,
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Devices</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            Daftar seluruh perangkat anak yang terhubung ke Guardian
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center">
          <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-3"
            style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
          <p style={{ color: "var(--text-muted)" }}>Memuat perangkat...</p>
        </div>
      ) : devices.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Smartphone size={40} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
          <p className="font-medium" style={{ color: "var(--text-secondary)" }}>Belum ada perangkat terdaftar</p>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Buka aplikasi Guardian di HP anak untuk mendaftarkan perangkat secara otomatis.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {devices.map((device: any) => {
            const isOnline = device.status === "ONLINE";
            const battery = device.batteryLogs?.[0];
            return (
              <Link key={device.id} href={`/dashboard/devices/${device.id}`}>
                <div className="glass-card p-5 cursor-pointer hover:border-[rgba(92,124,250,0.4)] transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: "rgba(92,124,250,0.1)" }}>
                        <Smartphone size={20} style={{ color: "var(--accent)" }} />
                      </div>
                      <div>
                        <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                          {device.deviceName}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                          {device.brand} • Android {device.androidVersion}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`status-dot ${isOnline ? "online" : "offline"}`} />
                      <span className="text-xs" style={{ color: isOnline ? "var(--color-online)" : "var(--text-muted)" }}>
                        {isOnline ? "Online" : "Offline"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-2.5 rounded-lg text-center" style={{ background: "var(--bg-secondary)" }}>
                      <Battery size={15} className="mx-auto mb-1" style={{ color: battery?.level > 20 ? "#10b981" : "#ef4444" }} />
                      <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                        {battery?.level ?? "--"}%
                      </p>
                      <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Baterai</p>
                    </div>
                    <div className="p-2.5 rounded-lg text-center" style={{ background: "var(--bg-secondary)" }}>
                      <ShieldCheck size={15} className="mx-auto mb-1" style={{ color: "var(--accent)" }} />
                      <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                        {device._count?.installedApps ?? 0}
                      </p>
                      <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Aplikasi Terpasang</p>
                    </div>
                  </div>

                  {device.permissions && (
                    <div className="mb-3 pt-2 border-t flex flex-wrap gap-1.5" style={{ borderColor: "var(--border)" }}>
                      {[
                        { k: "location", label: "GPS" },
                        { k: "usageStats", label: "Usage" },
                        { k: "notification", label: "Notif" },
                        { k: "notificationAccess", label: "Listener" },
                        { k: "overlay", label: "Overlay" },
                        { k: "deviceAdmin", label: "Admin" },
                        { k: "accessibility", label: "A11y" },
                      ].map((p) => {
                        const ok = Boolean(device.permissions[p.k]);
                        return (
                          <span
                            key={p.k}
                            className={`text-[9px] px-1.5 py-0.5 rounded font-medium flex items-center gap-1 ${
                              ok ? "bg-emerald-500/15 text-emerald-400" : "bg-zinc-800 text-zinc-500"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${ok ? "bg-emerald-400" : "bg-zinc-500"}`} />
                            {p.label}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                    <span style={{ color: "var(--text-muted)" }}>
                      {device.lastSeen ? `Aktif ${formatDistanceToNow(new Date(device.lastSeen), { addSuffix: true })}` : "Belum aktif"}
                    </span>
                    <span className="flex items-center gap-1 font-medium" style={{ color: "var(--accent)" }}>
                      Detail <ChevronRight size={13} />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
