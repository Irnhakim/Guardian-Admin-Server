"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Settings, Shield, Lock, Eye, EyeOff, Smartphone, Clock } from "lucide-react";
import { useSocket } from "@/hooks/useSocket";
import { DeviceSelector } from "@/components/DeviceSelector";

export default function RulesPage() {
  const socket = useSocket();
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [isProtectionActive, setIsProtectionActive] = useState(true);
  const [isAppHidden, setIsAppHidden] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const { data: devices = [] } = useQuery({
    queryKey: ["devices"],
    queryFn: () => api.get("/devices").then((r) => r.data),
  });

  const activeDevice = devices.find((d: any) => d.id === selectedDeviceId) || devices[0];

  const handleToggleProtection = () => {
    if (!socket || !activeDevice) return;
    const nextState = !isProtectionActive;
    setIsSending(true);
    socket.emit("set_protection", {
      deviceId: activeDevice.deviceId,
      enabled: nextState,
    });
    setIsProtectionActive(nextState);
    setTimeout(() => setIsSending(false), 1000);
  };

  const handleToggleAppVisibility = () => {
    if (!socket || !activeDevice) return;
    const nextState = !isAppHidden;
    setIsSending(true);
    socket.emit(nextState ? "hide_app" : "show_app", {
      deviceId: activeDevice.deviceId,
    });
    setIsAppHidden(nextState);
    setTimeout(() => setIsSending(false), 1000);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Aturan & Proteksi (Rules)</h1>
        <p className="text-xs sm:text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
          Konfigurasi pembatasan, proteksi sistem, dan kendali jarak jauh
        </p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Anti-Uninstall Card */}
          <div className="glass-card p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(92,124,250,0.15)" }}>
                <Shield size={20} style={{ color: "var(--accent)" }} />
              </div>
              <div>
                <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Proteksi Anti-Uninstall</h3>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Device Admin & Accessibility Guard</p>
              </div>
            </div>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Saat aktif, anak tidak bisa menghapus aplikasi atau membuka info aplikasi Guardian di Settings.
            </p>
            <div className="pt-2 flex items-center justify-between">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${isProtectionActive ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"}`}>
                {isProtectionActive ? "Terkunci (Aktif)" : "Terbuka (Bisa Dihapus)"}
              </span>
              <button
                onClick={handleToggleProtection}
                disabled={isSending}
                className={`text-xs px-3.5 py-1.5 rounded-lg font-semibold cursor-pointer ${
                  isProtectionActive ? "bg-rose-600/20 text-rose-400 border border-rose-500/30" : "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30"
                }`}
              >
                {isSending ? "Mengirim..." : isProtectionActive ? "Buka Proteksi" : "Kunci Proteksi"}
              </button>
            </div>
          </div>

          {/* Launcher Icon Visibility Card */}
          <div className="glass-card p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(16,185,129,0.15)" }}>
                {isAppHidden ? <EyeOff size={20} style={{ color: "#ef4444" }} /> : <Eye size={20} style={{ color: "#10b981" }} />}
              </div>
              <div>
                <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Sembunyikan Ikon App (Stealth)</h3>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Launcher App Drawer Visibility</p>
              </div>
            </div>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Sembunyikan ikon aplikasi Guardian dari layar utama dan drawer ponsel anak agar tidak mencolok.
            </p>
            <div className="pt-2 flex items-center justify-between">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${isAppHidden ? "bg-rose-500/15 text-rose-400" : "bg-emerald-500/15 text-emerald-400"}`}>
                {isAppHidden ? "Ikon Tersembunyi" : "Ikon Terlihat"}
              </span>
              <button
                onClick={handleToggleAppVisibility}
                disabled={isSending}
                className="text-xs px-3.5 py-1.5 rounded-lg font-semibold bg-[var(--accent)] text-white hover:opacity-90 cursor-pointer"
              >
                {isSending ? "Mengirim..." : isAppHidden ? "Tampilkan Ikon" : "Sembunyikan Ikon"}
              </button>
            </div>
          </div>

          {/* Status Izin Sistem */}
          <div className="glass-card p-5 space-y-3 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(16,185,129,0.15)" }}>
                <Shield size={20} style={{ color: "#10b981" }} />
              </div>
              <div>
                <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Status Izin & Hak Akses HP Anak</h3>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Hak akses sistem yang telah aktif di perangkat</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              {[
                { k: "location", label: "Lokasi (GPS)" },
                { k: "usageStats", label: "Usage Stats" },
                { k: "notification", label: "Notifikasi" },
                { k: "notificationAccess", label: "Notification Listener" },
                { k: "overlay", label: "Draw Over Other Apps" },
                { k: "deviceAdmin", label: "Device Admin" },
                { k: "accessibility", label: "Accessibility Watchdog" },
              ].map((item) => {
                const ok = Boolean(activeDevice?.permissions?.[item.k]);
                return (
                  <div
                    key={item.k}
                    className="p-2.5 rounded-lg border flex items-center justify-between"
                    style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
                  >
                    <div>
                      <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{item.label}</p>
                      <span className="text-[10px]" style={{ color: ok ? "#10b981" : "#f59e0b" }}>
                        {ok ? "Aktif" : "Belum Aktif"}
                      </span>
                    </div>
                    <span className={`w-2 h-2 rounded-full ${ok ? "bg-emerald-400" : "bg-amber-400"}`} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
