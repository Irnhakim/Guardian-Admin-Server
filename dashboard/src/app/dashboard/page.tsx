"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/api";
import { useSocket } from "@/hooks/useSocket";
import {
  Smartphone, Battery, MapPin, Clock, Wifi, WifiOff,
  ChevronRight, AlertTriangle, TrendingUp,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

function formatMs(ms: number) {
  if (!ms) return "0m";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function DashboardPage() {
  const socket = useSocket();
  const [liveData, setLiveData] = useState<Record<string, any>>({});

  const { data: devices = [], refetch } = useQuery({
    queryKey: ["devices"],
    queryFn: () => api.get("/devices").then((r) => r.data),
    refetchInterval: 30000,
  });

  // Real-time updates via WebSocket
  useEffect(() => {
    if (!socket) return;
    socket.on("battery:update", ({ deviceId, battery }) => {
      setLiveData((prev) => ({
        ...prev,
        [deviceId]: { ...prev[deviceId], battery },
      }));
    });
    socket.on("location:update", ({ deviceId, location }) => {
      setLiveData((prev) => ({
        ...prev,
        [deviceId]: { ...prev[deviceId], location },
      }));
    });
    socket.on("device:status", ({ deviceId, status }) => {
      refetch();
    });
    return () => {
      socket.off("battery:update");
      socket.off("location:update");
      socket.off("device:status");
    };
  }, [socket, refetch]);

  const onlineCount = devices.filter((d: any) => d.status === "ONLINE").length;
  const offlineCount = devices.length - onlineCount;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Overview</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <Link href="/dashboard/devices/add" className="btn-primary">
          <Smartphone size={16} />
          Add Device
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Devices", value: devices.length, icon: Smartphone, color: "#5c7cfa" },
          { label: "Online Now", value: onlineCount, icon: Wifi, color: "#10b981" },
          { label: "Offline", value: offlineCount, icon: WifiOff, color: "#6b7280" },
          { label: "Alerts Today", value: 0, icon: AlertTriangle, color: "#f59e0b" },
        ].map((stat) => (
          <div key={stat.label} className="metric-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{stat.label}</span>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: `${stat.color}1a` }}>
                <stat.icon size={18} style={{ color: stat.color }} />
              </div>
            </div>
            <p className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Device cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Connected Devices</h2>
          <Link href="/dashboard/devices" className="text-sm flex items-center gap-1"
            style={{ color: "var(--accent)" }}>
            View all <ChevronRight size={14} />
          </Link>
        </div>

        {devices.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Smartphone size={40} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
            <p className="font-medium" style={{ color: "var(--text-secondary)" }}>No devices yet</p>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              Install Guardian on your child's Android device to get started
            </p>
            <Link href="/dashboard/devices/add" className="btn-primary inline-flex mt-4">
              Add First Device
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {devices.map((device: any) => {
              const live = liveData[device.id] || {};
              const battery = live.battery || device.batteryLogs?.[0] || null;
              const isOnline = device.status === "ONLINE";

              return (
                <Link key={device.id} href={`/dashboard/devices/${device.id}`}>
                  <div className="glass-card p-5 cursor-pointer">
                    {/* Device header */}
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

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-2 rounded-lg" style={{ background: "var(--bg-secondary)" }}>
                        <Battery size={14} className="mx-auto mb-1" style={{ color: battery?.level > 20 ? "#10b981" : "#ef4444" }} />
                        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                          {battery?.level ?? "--"}%
                        </p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>Battery</p>
                      </div>
                      <div className="text-center p-2 rounded-lg" style={{ background: "var(--bg-secondary)" }}>
                        <Clock size={14} className="mx-auto mb-1" style={{ color: "var(--accent)" }} />
                        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                          {device._count?.installedApps ?? 0}
                        </p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>Apps</p>
                      </div>
                      <div className="text-center p-2 rounded-lg" style={{ background: "var(--bg-secondary)" }}>
                        <AlertTriangle size={14} className="mx-auto mb-1" style={{ color: "#f59e0b" }} />
                        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                          {device._count?.alerts ?? 0}
                        </p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>Alerts</p>
                      </div>
                    </div>

                    {/* Last seen */}
                    {device.lastSeen && (
                      <p className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>
                        Last seen {formatDistanceToNow(new Date(device.lastSeen), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
