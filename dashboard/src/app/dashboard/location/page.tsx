"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { api } from "@/lib/api";
import { MapPin, Navigation, Smartphone, Clock, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { DeviceSelector } from "@/components/DeviceSelector";
import { useSocket } from "@/hooks/useSocket";

const LocationMap = dynamic(() => import("@/components/LocationMap"), { ssr: false });

export default function LocationPage() {
  const socket = useSocket();
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [isSyncing, setIsSyncing] = useState(false);

  const { data: devices = [] } = useQuery({
    queryKey: ["devices"],
    queryFn: () => api.get("/devices").then((r) => r.data),
  });

  const activeDevice = devices.find((d: any) => d.id === selectedDeviceId) || devices[0];
  const deviceIdentifier = activeDevice?.deviceId || activeDevice?.id;

  const { data: location } = useQuery({
    queryKey: ["location", deviceIdentifier],
    queryFn: () => api.get(`/devices/${deviceIdentifier}/location/latest`).then((r) => r.data),
    enabled: !!deviceIdentifier,
    refetchInterval: 10000,
  });

  const { data: history = [] } = useQuery({
    queryKey: ["locationHistory", deviceIdentifier],
    queryFn: () => api.get(`/devices/${deviceIdentifier}/location/history?limit=15`).then((r) => r.data),
    enabled: !!deviceIdentifier,
  });

  const handleSyncLocation = () => {
    if (!socket || !activeDevice) return;
    setIsSyncing(true);
    socket.emit("ping_device", { deviceId: activeDevice.deviceId, target: "location" });
    setTimeout(() => setIsSyncing(false), 2000);
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Lokasi Real-time</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            Pantau posisi GPS dan jejak rute perangkat anak secara akurat
          </p>
        </div>
        {activeDevice && (
          <button
            onClick={handleSyncLocation}
            disabled={activeDevice.status !== "ONLINE" || isSyncing}
            className={`btn-primary flex items-center gap-2 text-xs py-2 px-3.5 ${
              (activeDevice.status !== "ONLINE" || isSyncing) ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <RefreshCw size={13} className={isSyncing ? "animate-spin" : ""} />
            {isSyncing ? "Meminta GPS..." : "Minta Posisi Sekarang"}
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
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Hubungkan perangkat untuk melihat lokasi.</p>
        </div>
      ) : location ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(16,185,129,0.15)" }}>
                <Navigation size={18} style={{ color: "#10b981" }} />
              </div>
              <div>
                <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Koordinat</p>
                <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                  {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
                </p>
              </div>
            </div>

            <div className="glass-card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(92,124,250,0.15)" }}>
                <MapPin size={18} style={{ color: "var(--accent)" }} />
              </div>
              <div>
                <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Akurasi & Provider</p>
                <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                  ±{location.accuracy?.toFixed(0) ?? "?"} m ({location.provider || "fused"})
                </p>
              </div>
            </div>

            <div className="glass-card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(245,158,11,0.15)" }}>
                <Clock size={18} style={{ color: "#f59e0b" }} />
              </div>
              <div>
                <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Pembaruan Terakhir</p>
                <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                  {formatDistanceToNow(new Date(location.timestamp), { addSuffix: true })}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl overflow-hidden border shadow-sm" style={{ height: "480px", borderColor: "var(--border)" }}>
            <LocationMap lat={location.latitude} lng={location.longitude} />
          </div>

          {history.length > 0 && (
            <div className="glass-card p-4">
              <h3 className="font-semibold text-sm mb-3" style={{ color: "var(--text-primary)" }}>Riwayat Titik Lokasi Terbaru</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {history.map((h: any) => (
                  <div key={h.id} className="flex items-center justify-between text-xs py-2 px-3 rounded-lg" style={{ background: "var(--bg-secondary)" }}>
                    <div className="flex items-center gap-2">
                      <MapPin size={13} style={{ color: "var(--accent)" }} />
                      <span style={{ color: "var(--text-primary)" }}>{h.latitude.toFixed(5)}, {h.longitude.toFixed(5)}</span>
                    </div>
                    <span style={{ color: "var(--text-muted)" }}>
                      {new Date(h.timestamp).toLocaleTimeString("id-ID")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <MapPin size={40} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
          <p className="font-medium" style={{ color: "var(--text-secondary)" }}>Belum ada koordinat GPS dari {activeDevice.deviceName}</p>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Pastikan izin GPS HP anak telah diberikan.</p>
        </div>
      )}
    </div>
  );
}
