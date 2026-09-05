"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Shield, Smartphone, Search, CheckCircle, Clock, RefreshCw } from "lucide-react";
import { DeviceSelector } from "@/components/DeviceSelector";
import { useSocket } from "@/hooks/useSocket";

export default function AppsPage() {
  const socket = useSocket();
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSubTab, setActiveSubTab] = useState<"installed" | "approvals">("installed");
  const [isSyncing, setIsSyncing] = useState(false);

  const { data: devices = [] } = useQuery({
    queryKey: ["devices"],
    queryFn: () => api.get("/devices").then((r) => r.data),
  });

  const activeDevice = devices.find((d: any) => d.id === selectedDeviceId) || devices[0];
  const deviceIdentifier = activeDevice?.deviceId || activeDevice?.id;

  const { data: apps = [], isLoading: isLoadingApps } = useQuery({
    queryKey: ["apps", deviceIdentifier],
    queryFn: () => api.get(`/devices/${deviceIdentifier}/apps`).then((r) => r.data),
    enabled: !!deviceIdentifier,
  });

  const { data: approvals = [], refetch: refetchApprovals } = useQuery({
    queryKey: ["approvals", deviceIdentifier],
    queryFn: () => api.get(`/devices/${deviceIdentifier}/approvals`).then((r) => r.data),
    enabled: !!deviceIdentifier,
  });

  const handleResolveApproval = async (approvalId: string, status: "APPROVED" | "REJECTED") => {
    try {
      await api.patch(`/devices/${deviceIdentifier}/approvals/${approvalId}`, { status });
      refetchApprovals();
    } catch (err) {
      alert("Gagal memperbarui status perizinan.");
    }
  };

  const handleSyncApps = () => {
    if (!socket || !activeDevice) return;
    setIsSyncing(true);
    socket.emit("ping_device", { deviceId: activeDevice.deviceId, target: "apps" });
    setTimeout(() => setIsSyncing(false), 2000);
  };

  const filteredApps = apps.filter((app: any) =>
    (app.appName || app.packageName).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Manajemen Aplikasi</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            Daftar aplikasi terpasang dan persetujuan instalasi APK luar
          </p>
        </div>
        {activeDevice && (
          <button
            onClick={handleSyncApps}
            disabled={activeDevice.status !== "ONLINE" || isSyncing}
            className={`btn-primary flex items-center gap-2 text-xs py-2 px-3.5 ${
              (activeDevice.status !== "ONLINE" || isSyncing) ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <RefreshCw size={13} className={isSyncing ? "animate-spin" : ""} />
            {isSyncing ? "Menyinkronkan..." : "Sync Aplikasi"}
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
          <p className="font-medium" style={{ color: "var(--text-secondary)" }}>Belum ada perangkat</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Sub tabs */}
          <div className="flex gap-2 border-b pb-3" style={{ borderColor: "var(--border)" }}>
            <button
              onClick={() => setActiveSubTab("installed")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeSubTab === "installed"
                  ? "bg-[var(--accent)] text-white"
                  : "bg-transparent text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.03)]"
              }`}
            >
              Aplikasi Terpasang ({apps.length})
            </button>
            <button
              onClick={() => setActiveSubTab("approvals")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeSubTab === "approvals"
                  ? "bg-[var(--accent)] text-white"
                  : "bg-transparent text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.03)]"
              }`}
            >
              Permintaan Instalasi
              {approvals.filter((a: any) => a.status === "PENDING").length > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400" />
              )}
            </button>
          </div>

          {activeSubTab === "installed" && (
            <div className="glass-card p-5 space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari nama atau package aplikasi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border outline-none"
                  style={{ background: "var(--bg-secondary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                />
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
              </div>

              {isLoadingApps ? (
                <p className="text-center text-xs py-8" style={{ color: "var(--text-muted)" }}>Memuat aplikasi...</p>
              ) : filteredApps.length === 0 ? (
                <p className="text-center text-xs py-8" style={{ color: "var(--text-muted)" }}>Tidak ada aplikasi ditemukan.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto">
                  {filteredApps.map((app: any) => (
                    <div key={app.packageName} className="p-3 rounded-lg border flex items-center gap-3" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs text-white" style={{ background: "var(--accent)" }}>
                        {app.appName ? app.appName.substring(0, 2).toUpperCase() : "AP"}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>{app.appName}</p>
                        <p className="text-[10px] truncate" style={{ color: "var(--text-muted)" }}>{app.packageName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSubTab === "approvals" && (
            <div className="glass-card p-5 space-y-3">
              {approvals.length === 0 ? (
                <div className="text-center py-10">
                  <CheckCircle size={36} className="mx-auto mb-2 text-emerald-400" />
                  <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Tidak ada permintaan instalasi APK</p>
                </div>
              ) : (
                approvals.map((app: any) => (
                  <div key={app.id} className="p-3 rounded-lg border flex items-center justify-between" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
                    <div>
                      <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{app.appName || app.packageName}</p>
                      <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Source: {app.installer || "Unknown"}</p>
                    </div>
                    {app.status === "PENDING" ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleResolveApproval(app.id, "APPROVED")}
                          className="px-3 py-1 bg-emerald-600 text-white rounded text-xs font-medium hover:bg-emerald-500"
                        >
                          Izinkan
                        </button>
                        <button
                          onClick={() => handleResolveApproval(app.id, "REJECTED")}
                          className="px-3 py-1 bg-rose-600 text-white rounded text-xs font-medium hover:bg-rose-500"
                        >
                          Tolak
                        </button>
                      </div>
                    ) : (
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${app.status === "APPROVED" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
                        {app.status}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
