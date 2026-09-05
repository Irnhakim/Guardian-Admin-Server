"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Bell, Smartphone, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { DeviceSelector } from "@/components/DeviceSelector";

export default function NotificationsPage() {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");

  const { data: devices = [] } = useQuery({
    queryKey: ["devices"],
    queryFn: () => api.get("/devices").then((r) => r.data),
  });

  const activeDevice = devices.find((d: any) => d.id === selectedDeviceId) || devices[0];
  const deviceIdentifier = activeDevice?.deviceId || activeDevice?.id;

  const { data: notifications = [], refetch, isLoading } = useQuery({
    queryKey: ["notifications", deviceIdentifier],
    queryFn: () => api.get(`/devices/${deviceIdentifier}/notifications`).then((r) => r.data),
    enabled: !!deviceIdentifier,
    refetchInterval: 10000,
  });

  const handleClear = async () => {
    if (!confirm("Hapus semua riwayat notifikasi perangkat ini?")) return;
    try {
      await api.delete(`/devices/${deviceIdentifier}/notifications`);
      refetch();
    } catch {
      alert("Gagal menghapus riwayat notifikasi.");
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Riwayat Notifikasi</h1>
          <p className="text-xs sm:text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            Log notifikasi pesan dan aplikasi yang diterima HP anak secara real-time
          </p>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={handleClear}
            className="btn-danger flex items-center justify-center gap-1 text-xs py-1.5 px-3 rounded-lg border border-rose-500/30 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 cursor-pointer w-full sm:w-auto"
          >
            <Trash2 size={13} /> Hapus Riwayat
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
      ) : isLoading ? (
        <p className="text-center text-xs py-8" style={{ color: "var(--text-muted)" }}>Memuat notifikasi...</p>
      ) : notifications.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Bell size={40} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
          <p className="font-medium" style={{ color: "var(--text-secondary)" }}>Belum ada notifikasi tertangkap</p>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Pastikan izin akses notifikasi (Notification Listener) telah diaktifkan di HP anak.
          </p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden divide-y divide-[var(--border)]">
          {notifications.map((n: any) => (
            <div
              key={n.id}
              className="px-3.5 py-2 flex items-center gap-3 hover:bg-white/[0.02] transition-colors"
            >
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                style={{ background: "rgba(92,124,250,0.15)", color: "var(--accent)" }}
              >
                <Bell size={13} />
              </div>

              <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:gap-2">
                <span className="text-xs font-semibold shrink-0" style={{ color: "var(--text-primary)" }}>
                  {n.appName || n.packageName}
                </span>

                <div className="flex-1 min-w-0 flex items-center gap-1.5 text-xs truncate">
                  {n.title && (
                    <span className="font-medium truncate shrink-0 max-w-[140px] sm:max-w-[200px]" style={{ color: "var(--text-secondary)" }}>
                      {n.title}:
                    </span>
                  )}
                  {n.text && (
                    <span className="truncate" style={{ color: "var(--text-muted)" }}>
                      {n.text}
                    </span>
                  )}
                </div>
              </div>

              <span className="text-[11px] shrink-0 tabular-nums whitespace-nowrap ml-auto" style={{ color: "var(--text-muted)" }}>
                {formatDistanceToNow(new Date(n.receivedAt), { addSuffix: true })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
