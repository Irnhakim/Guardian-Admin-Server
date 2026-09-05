"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { BarChart2, Clock, Smartphone, RefreshCw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { DeviceSelector } from "@/components/DeviceSelector";
import { useSocket } from "@/hooks/useSocket";

function formatMs(ms: number) {
  if (!ms) return "0m";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h}j ${m}m` : `${m}m`;
}

export default function UsagePage() {
  const socket = useSocket();
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [isSyncing, setIsSyncing] = useState(false);

  const { data: devices = [] } = useQuery({
    queryKey: ["devices"],
    queryFn: () => api.get("/devices").then((r) => r.data),
  });

  const activeDevice = devices.find((d: any) => d.id === selectedDeviceId) || devices[0];
  const deviceIdentifier = activeDevice?.deviceId || activeDevice?.id;

  const { data: usage = [], isLoading } = useQuery({
    queryKey: ["usage", deviceIdentifier],
    queryFn: () => api.get(`/devices/${deviceIdentifier}/usage`).then((r) => r.data),
    enabled: !!deviceIdentifier,
  });

  const totalScreenTime = usage.reduce((acc: number, cur: any) => acc + (cur.totalUsageMs || 0), 0);
  const chartData = usage.slice(0, 8).map((u: any) => ({
    name: u.appName || u.packageName,
    minutes: Math.round((u.totalUsageMs || 0) / 60000),
  }));

  const handleSyncUsage = () => {
    if (!socket || !activeDevice) return;
    setIsSyncing(true);
    socket.emit("ping_device", { deviceId: activeDevice.deviceId, target: "usage" });
    setTimeout(() => setIsSyncing(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Screen Time & Penggunaan Aplikasi</h1>
          <p className="text-xs sm:text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            Analisis durasi pemakaian aplikasi selama 7 hari terakhir
          </p>
        </div>
        {activeDevice && (
          <button
            onClick={handleSyncUsage}
            disabled={activeDevice.status !== "ONLINE" || isSyncing}
            className={`btn-primary flex items-center justify-center gap-2 text-xs py-2 px-3.5 w-full sm:w-auto ${
              (activeDevice.status !== "ONLINE" || isSyncing) ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <RefreshCw size={13} className={isSyncing ? "animate-spin" : ""} />
            {isSyncing ? "Menyinkronkan..." : "Sync Screen Time"}
          </button>
        )}
      </div>

      <DeviceSelector
        devices={devices}
        selectedId={activeDevice?.id || ""}
        onSelect={setSelectedDeviceId}
      />

      {!activeDevice ? (
        <div className="glass-card p-12 text-center">
          <Smartphone size={40} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
          <p className="font-medium" style={{ color: "var(--text-secondary)" }}>Belum ada perangkat terhubung</p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-card p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(92,124,250,0.15)" }}>
                <Clock size={22} style={{ color: "var(--accent)" }} />
              </div>
              <div>
                <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Total Screen Time (7 Hari)</p>
                <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{formatMs(totalScreenTime)}</p>
              </div>
            </div>

            <div className="glass-card p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(16,185,129,0.15)" }}>
                <BarChart2 size={22} style={{ color: "#10b981" }} />
              </div>
              <div>
                <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Aplikasi Paling Sering Digunakan</p>
                <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                  {usage[0]?.appName || "Belum ada"}
                </p>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="glass-card p-5">
            <h3 className="font-semibold text-sm mb-4" style={{ color: "var(--text-primary)" }}>
              Grafik Menit Penggunaan per Aplikasi
            </h3>
            {chartData.length === 0 ? (
              <p className="text-center py-8 text-xs" style={{ color: "var(--text-muted)" }}>
                Belum ada data rekapan screen time tersinkronisasi.
              </p>
            ) : (
              <div style={{ height: "260px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} unit="m" />
                    <Tooltip
                      contentStyle={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }}
                    />
                    <Bar dataKey="minutes" radius={[6, 6, 0, 0]}>
                      {chartData.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? "var(--accent)" : `hsl(${220 + index * 18}, 70%, 60%)`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Table Breakdown */}
          <div className="glass-card p-5">
            <h3 className="font-semibold text-sm mb-3" style={{ color: "var(--text-primary)" }}>Rincian Aplikasi</h3>
            {usage.length === 0 ? (
              <p className="text-xs text-center py-4" style={{ color: "var(--text-muted)" }}>Tidak ada data aplikasi</p>
            ) : (
              <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                {usage.map((u: any) => (
                  <div key={u.packageName} className="py-2.5 flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium" style={{ color: "var(--text-primary)" }}>{u.appName || u.packageName}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{u.packageName}</p>
                    </div>
                    <span className="font-semibold" style={{ color: "var(--accent)" }}>
                      {formatMs(u.totalUsageMs)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
