"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { api } from "@/lib/api";
import { useSocket } from "@/hooks/useSocket";
import {
  Battery, Wifi, WifiOff, Smartphone, MapPin,
  Clock, BarChart2, Shield, ChevronLeft,
  Thermometer, Navigation, RefreshCw, Bell, Trash2,
  Send, MessageSquare, Lock,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

// Leaflet must be loaded client-side
const LocationMap = dynamic(() => import("@/components/LocationMap"), { ssr: false });

function formatMs(ms: number) {
  if (!ms) return "0m";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

const getInitials = (name: string) => {
  return name ? name.substring(0, 2).toUpperCase() : "AP";
};

const getHashColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash % 360);
  return `hsl(${h}, 70%, 45%)`;
};

const formatTime = (dateStr: string) => {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch (e) {
    return "just now";
  }
};

const tabs = ["Overview", "Apps", "Approvals", "Notifications", "Location", "Usage", "Security"] as const;
type Tab = (typeof tabs)[number];

export default function DeviceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const socket = useSocket();
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [liveBattery, setLiveBattery] = useState<any>(null);
  const [liveLocation, setLiveLocation] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isClearing, setIsClearing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [msgText, setMsgText] = useState("");
  const [msgType, setMsgType] = useState<"MESSAGE" | "BLOCK">("MESSAGE");
  const [msgPassword, setMsgPassword] = useState("");
  const [isSendingMsg, setIsSendingMsg] = useState(false);

  const handleSendMessage = () => {
    if (!socket || !device) return;
    if (!msgText.trim()) {
      alert("Pesan tidak boleh kosong!");
      return;
    }
    if (msgType === "BLOCK" && !msgPassword.trim()) {
      alert("Sandi pembuka kunci tidak boleh kosong!");
      return;
    }

    setIsSendingMsg(true);
    socket.emit("send_device_message", {
      deviceId: device.deviceId,
      type: msgType,
      message: msgText,
      password: msgType === "BLOCK" ? msgPassword : "",
    });

    // Reset input fields
    setMsgText("");
    setMsgPassword("");
    alert("Pesan berhasil dikirim ke perangkat!");
    setIsSendingMsg(false);
  };

  const handleDeleteDevice = async () => {
    if (!device) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete "${device.deviceName}"? This will erase all location history, battery logs, installed apps list, and captured notifications.`
    );
    if (!confirmDelete) return;

    try {
      setIsDeleting(true);
      await api.delete(`/devices/${device.id}`);
      router.push("/dashboard");
    } catch (err) {
      console.error("Failed to delete device:", err);
      alert("Failed to delete device. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClearNotifications = async () => {
    if (!device) return;
    const confirmClear = window.confirm("Are you sure you want to clear all notification history for this device?");
    if (!confirmClear) return;

    try {
      setIsClearing(true);
      await api.delete(`/devices/${device.deviceId}/notifications`);
      refetchNotifications();
    } catch (err) {
      console.error("Failed to clear notifications:", err);
    } finally {
      setIsClearing(false);
    }
  };

  const { data: device, refetch: refetchDevice } = useQuery({
    queryKey: ["device", id],
    queryFn: () => api.get(`/devices/${id}`).then((r) => r.data),
  });

  const { data: battery } = useQuery({
    queryKey: ["battery", id],
    queryFn: () => api.get(`/devices/${device?.deviceId}/battery/latest`).then((r) => r.data),
    enabled: !!device,
  });

  const { data: location } = useQuery({
    queryKey: ["location", id],
    queryFn: () => api.get(`/devices/${device?.deviceId}/location/latest`).then((r) => r.data),
    enabled: !!device,
  });

  const { data: apps = [], refetch: refetchApps } = useQuery({
    queryKey: ["apps", id],
    queryFn: () => api.get(`/devices/${device?.deviceId}/apps`).then((r) => r.data),
    enabled: !!device && activeTab === "Apps",
  });

  const { data: approvals = [], refetch: refetchApprovals } = useQuery({
    queryKey: ["approvals", id],
    queryFn: () => api.get(`/devices/${device?.deviceId}/approvals`).then((r) => r.data),
    enabled: !!device && activeTab === "Approvals",
  });

  const { data: usage = [], refetch: refetchUsage } = useQuery({
    queryKey: ["usage", id],
    queryFn: () => api.get(`/devices/${device?.deviceId}/usage`).then((r) => r.data),
    enabled: !!device && activeTab === "Usage",
  });

  const { data: notifications = [], refetch: refetchNotifications } = useQuery({
    queryKey: ["notifications", id],
    queryFn: () => api.get(`/devices/${device?.deviceId}/notifications`).then((r) => r.data),
    enabled: !!device && activeTab === "Notifications",
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const handleResolveApproval = async (approvalId: string, status: "APPROVED" | "REJECTED") => {
    try {
      setResolvingId(approvalId);
      await api.patch(`/devices/${device?.deviceId}/approvals/${approvalId}`, { status });
      refetchApprovals();
    } catch (err) {
      console.error("Failed to resolve approval:", err);
      alert("Failed to update status. Please try again.");
    } finally {
      setResolvingId(null);
    }
  };

  useEffect(() => {
    if (!socket || !id) return;
    socket.emit("subscribe:device", { deviceId: id });
    socket.on("battery:update", ({ battery }) => setLiveBattery(battery));
    socket.on("location:update", ({ location }) => setLiveLocation(location));
    socket.on("apps:synced", () => {
      refetchApps();
      refetchDevice();
    });
    socket.on("usage:synced", () => {
      refetchUsage();
    });
    socket.on("notification:received", (payload: { deviceId: string; notification: any }) => {
      if (payload.deviceId === id) {
        refetchNotifications();
      }
    });
    socket.on("approval:requested", (payload: { deviceId: string; data: any }) => {
      if (payload.deviceId === id) {
        refetchApprovals();
      }
    });
    return () => {
      socket.off("battery:update");
      socket.off("location:update");
      socket.off("apps:synced");
      socket.off("usage:synced");
      socket.off("notification:received");
      socket.off("approval:requested");
    };
  }, [socket, id, refetchApps, refetchDevice, refetchUsage, refetchNotifications, refetchApprovals]);

  const handleForceSync = () => {
    if (!socket || !device) return;
    setIsSyncing(true);
    socket.emit("ping_device", { deviceId: device.deviceId });
    setTimeout(() => setIsSyncing(false), 2000);
  };

  const currentBattery = liveBattery || battery;
  const currentLocation = liveLocation || location;
  const isOnline = device?.status === "ONLINE";

  if (!device) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-3"
            style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
          <p style={{ color: "var(--text-muted)" }}>Loading device...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      {/* Back + Header */}
      <div>
        <Link href="/dashboard" className="flex items-center gap-1 text-sm mb-4 w-fit"
          style={{ color: "var(--text-muted)" }}>
          <ChevronLeft size={15} /> Back to Overview
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(92,124,250,0.15)" }}>
              <Smartphone size={24} style={{ color: "var(--accent)" }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                {device.deviceName}
              </h1>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                  {device.brand} {device.model}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className={`status-dot ${isOnline ? "online" : "offline"}`} />
                  <span className="text-sm" style={{ color: isOnline ? "var(--color-online)" : "var(--text-muted)" }}>
                    {isOnline ? "Online" : device.lastSeen
                      ? `Last seen ${formatDistanceToNow(new Date(device.lastSeen), { addSuffix: true })}`
                      : "Never connected"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <button 
            onClick={handleForceSync}
            disabled={!isOnline || isSyncing}
            className={`btn-primary flex items-center gap-2 ${(!isOnline || isSyncing) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
            {isSyncing ? "Syncing..." : "Force Sync Data"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: "var(--bg-card)" }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            id={`tab-${tab.toLowerCase()}`}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: activeTab === tab ? "var(--accent)" : "transparent",
              color: activeTab === tab ? "white" : "var(--text-secondary)",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ─────────────────────────────── */}
      {activeTab === "Overview" && (
        <div className="grid grid-cols-3 gap-4">
          {/* Battery card */}
          <div className="metric-card">
            <div className="flex items-center gap-2 mb-3">
              <Battery size={16} style={{ color: "var(--accent)" }} />
              <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Battery</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold" style={{ color: "var(--text-primary)" }}>
                {currentBattery?.level ?? "--"}
              </span>
              <span className="text-lg mb-1" style={{ color: "var(--text-secondary)" }}>%</span>
            </div>
            <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ background: "var(--bg-secondary)" }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${currentBattery?.level ?? 0}%`,
                  background: (currentBattery?.level ?? 100) > 20 ? "#10b981" : "#ef4444",
                }}
              />
            </div>
            <div className="mt-2 flex gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
              {currentBattery?.isCharging && <span className="text-green-400">⚡ Charging</span>}
              {currentBattery?.temperature && <span>🌡 {currentBattery.temperature}°C</span>}
            </div>
          </div>

          {/* Device info */}
          <div className="metric-card col-span-2">
            <p className="text-sm font-medium mb-3" style={{ color: "var(--text-secondary)" }}>Device Information</p>
            <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
              {[
                ["Brand", device.brand],
                ["Model", device.model],
                ["Android", `v${device.androidVersion}`],
                ["Security Patch", device.securityPatch || "Unknown"],
                ["Apps Installed", device._count?.installedApps ?? 0],
                ["Registered", new Date(device.registeredAt).toLocaleDateString()],
              ].map(([label, value]) => (
                <div key={label as string}>
                  <span style={{ color: "var(--text-muted)" }}>{label}</span>
                  <p className="font-medium mt-0.5" style={{ color: "var(--text-primary)" }}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Kirim Pesan atau Kunci Layar */}
          <div className="metric-card col-span-3 mt-1">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare size={18} style={{ color: "var(--accent)" }} />
              <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Kirim Pesan / Kunci Layar</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>Tipe Tindakan</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setMsgType("MESSAGE")}
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${
                        msgType === "MESSAGE"
                          ? "bg-[var(--accent)] text-white border-none"
                          : "bg-transparent text-[var(--text-secondary)] border-[var(--border)] hover:bg-[rgba(255,255,255,0.02)]"
                      }`}
                    >
                      Pesan Pop-up Biasa
                    </button>
                    <button
                      type="button"
                      onClick={() => setMsgType("BLOCK")}
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${
                        msgType === "BLOCK"
                          ? "bg-rose-600 text-white border-none"
                          : "bg-transparent text-[var(--text-secondary)] border-[var(--border)] hover:bg-[rgba(255,255,255,0.02)]"
                      }`}
                    >
                      Kunci Layar (Blokir)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>Isi Pesan</label>
                  <textarea
                    rows={3}
                    placeholder={msgType === "MESSAGE" ? "Tulis pesan biasa untuk anak..." : "Tulis pesan peringatan layar terkunci..."}
                    value={msgText}
                    onChange={(e) => setMsgText(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg outline-none border focus:border-[var(--accent)] transition-colors resize-none"
                    style={{
                      background: "var(--bg-secondary)",
                      borderColor: "var(--border)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
              </div>

              <div className="flex flex-col justify-between space-y-4">
                {msgType === "BLOCK" ? (
                  <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                    <label className="block text-xs font-semibold mb-2 text-rose-400">Sandi Pembuka Kunci (PIN)</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Contoh: 1234 atau sandi rahasia..."
                        value={msgPassword}
                        onChange={(e) => setMsgPassword(e.target.value)}
                        className="w-full px-3 py-2 pl-9 text-sm rounded-lg outline-none border focus:border-rose-500 transition-colors"
                        style={{
                          background: "var(--bg-secondary)",
                          borderColor: "var(--border)",
                          color: "var(--text-primary)",
                        }}
                      />
                      <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-400" />
                    </div>
                    <p className="text-[10px] mt-1.5" style={{ color: "var(--text-muted)" }}>
                      Anak harus memasukkan kata sandi ini persis untuk menutup layar pemblokiran pada ponselnya.
                    </p>
                  </div>
                ) : (
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Pesan biasa akan memunculkan dialog pop-up yang dapat langsung ditutup oleh anak dengan menekan tombol &quot;OK&quot;. Cocok untuk memberi peringatan ringan.
                  </div>
                )}
                
                <div className="flex-1 flex items-end">
                  <button
                    type="button"
                    onClick={handleSendMessage}
                    disabled={isSendingMsg || !isOnline}
                    className={`btn-primary w-full flex items-center justify-center gap-2 py-2.5 font-semibold text-sm ${
                      (!isOnline || isSendingMsg) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                    style={{
                      background: msgType === "BLOCK" ? "#ef4444" : "var(--accent)"
                    }}
                  >
                    <Send size={15} />
                    {isSendingMsg ? "Mengirim..." : msgType === "BLOCK" ? "Kirim Blokir Layar" : "Kirim Pesan Layar"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── APPS TAB ─────────────────────────────────── */}
      {activeTab === "Apps" && (
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
            <p className="font-medium" style={{ color: "var(--text-primary)" }}>
              Installed Apps ({apps.length})
            </p>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {apps.map((app: any) => (
              <div key={app.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{app.appName}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{app.packageName}</p>
                </div>
                <span className="text-xs badge badge-gray">{app.versionName || "—"}</span>
              </div>
            ))}
            {apps.length === 0 && (
              <div className="p-8 text-center" style={{ color: "var(--text-muted)" }}>
                No apps synced yet
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── APPROVALS TAB ────────────────────────────── */}
      {activeTab === "Approvals" && (
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
            <div>
              <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                App Install Approvals ({approvals.length})
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                Manage installations from sources outside the Google Play Store
              </p>
            </div>
            <span className="text-xs badge badge-blue" style={{ background: "rgba(92,124,250,0.15)", color: "var(--accent)" }}>
              {approvals.filter((a: any) => a.status === "PENDING").length} Pending
            </span>
          </div>

          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {approvals.map((app: any) => {
              const statusColors = {
                PENDING: { bg: "rgba(245,158,11,0.15)", text: "#f59e0b", label: "Pending Approval" },
                APPROVED: { bg: "rgba(16,185,129,0.15)", text: "#10b981", label: "Approved" },
                REJECTED: { bg: "rgba(239,68,68,0.15)", text: "#ef4444", label: "Rejected" },
              };
              const config = statusColors[app.status as keyof typeof statusColors] || {
                bg: "rgba(107,114,128,0.15)",
                text: "#6b7280",
                label: app.status,
              };

              return (
                <div key={app.id} className="flex items-center justify-between px-4 py-4 hover:bg-[rgba(255,255,255,0.01)] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shrink-0 text-sm shadow-md"
                      style={{ backgroundColor: getHashColor(app.appName || app.packageName) }}>
                      {getInitials(app.appName || app.packageName)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                          {app.appName}
                        </p>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: config.bg, color: config.text }}>
                          {config.label}
                        </span>
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {app.packageName} • Source: <span className="text-gray-300 font-mono text-[11px]">{app.installer || "Unknown"}</span>
                      </p>
                      <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>
                        Requested {formatTime(app.requestedAt)}
                        {app.resolvedAt && ` • Resolved ${formatTime(app.resolvedAt)}`}
                      </p>
                    </div>
                  </div>

                  {app.status === "PENDING" && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleResolveApproval(app.id, "APPROVED")}
                        disabled={resolvingId !== null}
                        className="btn-primary flex items-center gap-1 py-1.5 px-3 text-xs bg-emerald-600 hover:bg-emerald-500 border-none rounded-lg font-semibold cursor-pointer text-white"
                        style={{ background: "#10b981" }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleResolveApproval(app.id, "REJECTED")}
                        disabled={resolvingId !== null}
                        className="btn-primary flex items-center gap-1 py-1.5 px-3 text-xs bg-rose-600 hover:bg-rose-500 border-none rounded-lg font-semibold cursor-pointer text-white"
                        style={{ background: "#ef4444" }}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {approvals.length === 0 && (
              <div className="p-12 text-center" style={{ color: "var(--text-muted)" }}>
                <Shield className="mx-auto mb-2 opacity-40" size={36} />
                <p>No outside installations detected or requested yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── NOTIFICATIONS TAB ─────────────────────────── */}
      {activeTab === "Notifications" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center gap-4 flex-wrap">
            <input
              type="text"
              placeholder="Search notifications by app, title, or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 rounded-lg text-sm w-full md:w-96 outline-none border transition-all"
              style={{
                background: "var(--bg-card)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
            />
            {notifications.length > 0 && (
              <button
                onClick={handleClearNotifications}
                disabled={isClearing}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90`}
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#ef4444",
                  cursor: isClearing ? "not-allowed" : "pointer"
                }}
              >
                <Trash2 size={16} />
                {isClearing ? "Clearing..." : "Clear All"}
              </button>
            )}
          </div>

          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
              <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                Intercepted Notifications ({
                  notifications.filter((notif: any) => {
                    const term = searchTerm.toLowerCase();
                    return (
                      notif.appName?.toLowerCase().includes(term) ||
                      notif.packageName?.toLowerCase().includes(term) ||
                      notif.title?.toLowerCase().includes(term) ||
                      notif.text?.toLowerCase().includes(term)
                    );
                  }).length
                })
              </p>
            </div>
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {notifications
                .filter((notif: any) => {
                  const term = searchTerm.toLowerCase();
                  return (
                    notif.appName?.toLowerCase().includes(term) ||
                    notif.packageName?.toLowerCase().includes(term) ||
                    notif.title?.toLowerCase().includes(term) ||
                    notif.text?.toLowerCase().includes(term)
                  );
                })
                .map((notif: any) => {
                  const appColor = getHashColor(notif.appName || notif.packageName || "App");
                  return (
                    <div key={notif.id} className="flex items-start gap-4 px-4 py-4 hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shrink-0 text-sm shadow-md"
                        style={{ backgroundColor: appColor }}
                      >
                        {getInitials(notif.appName || notif.packageName || "App")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                              {notif.appName || "Unknown App"}
                            </span>
                            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                              {notif.packageName}
                            </span>
                            {notif.category && (
                              <span className="badge badge-blue capitalize">{notif.category}</span>
                            )}
                          </div>
                          <span className="text-xs shrink-0" style={{ color: "var(--text-muted)" }}>
                            {formatTime(notif.receivedAt)}
                          </span>
                        </div>
                        <div className="mt-1">
                          {notif.title && (
                            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                              {notif.title}
                            </p>
                          )}
                          {notif.text && (
                            <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
                              {notif.text}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              {notifications.filter((notif: any) => {
                const term = searchTerm.toLowerCase();
                return (
                  notif.appName?.toLowerCase().includes(term) ||
                  notif.packageName?.toLowerCase().includes(term) ||
                  notif.title?.toLowerCase().includes(term) ||
                  notif.text?.toLowerCase().includes(term)
                );
              }).length === 0 && (
                <div className="p-12 text-center" style={{ color: "var(--text-muted)" }}>
                  <Bell size={36} className="mx-auto mb-2 opacity-50" />
                  <p>No notifications matched search or intercepted yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── LOCATION TAB ─────────────────────────────── */}
      {activeTab === "Location" && (
        <div className="space-y-4">
          {currentLocation ? (
            <>
              <div className="glass-card p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(16,185,129,0.1)" }}>
                  <Navigation size={18} style={{ color: "#10b981" }} />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    Accuracy: {currentLocation.accuracy?.toFixed(0) ?? "?"} m •{" "}
                    {formatDistanceToNow(new Date(currentLocation.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <div className="rounded-xl overflow-hidden" style={{ height: "400px" }}>
                <LocationMap lat={currentLocation.latitude} lng={currentLocation.longitude} />
              </div>
            </>
          ) : (
            <div className="glass-card p-12 text-center">
              <MapPin size={36} className="mx-auto mb-2" style={{ color: "var(--text-muted)" }} />
              <p style={{ color: "var(--text-muted)" }}>No location data yet</p>
            </div>
          )}
        </div>
      )}

      {/* ── USAGE TAB ─────────────────────────────────── */}
      {activeTab === "Usage" && (
        <div className="space-y-4">
          <div className="glass-card p-4">
            <p className="font-medium mb-4" style={{ color: "var(--text-primary)" }}>Top Apps — Last 7 Days</p>
            {usage.length === 0 ? (
              <p className="text-sm text-center py-6" style={{ color: "var(--text-muted)" }}>No usage data yet</p>
            ) : (
              <div className="space-y-3">
                {usage.slice(0, 10).map((u: any, i: number) => {
                  const max = usage[0]?.totalUsageMs || 1;
                  const pct = Math.round((u.totalUsageMs / max) * 100);
                  return (
                    <div key={u.packageName}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span style={{ color: "var(--text-primary)" }}>{u.appName}</span>
                        <span style={{ color: "var(--text-muted)" }}>{formatMs(u.totalUsageMs)}</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-secondary)" }}>
                        <div className="h-full rounded-full" style={{
                          width: `${pct}%`,
                          background: i === 0 ? "var(--accent)" : `hsl(${220 + i * 20}, 70%, 60%)`
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── SECURITY TAB ──────────────────────────────── */}
      {activeTab === "Security" && (
        <div className="glass-card p-6 space-y-4">
          <p className="font-medium" style={{ color: "var(--text-primary)" }}>Security Status</p>
          {[
            { label: "Device Owner Mode", status: "Not Active", color: "#f59e0b", note: "Enable for full control" },
            { label: "Guardian VPN", status: "Coming in v3", color: "#6b7280", note: "" },
            { label: "Unknown Sources", status: "Unknown", color: "#6b7280", note: "" },
            { label: "Developer Options", status: "Unknown", color: "#6b7280", note: "" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between p-3 rounded-lg"
              style={{ background: "var(--bg-secondary)" }}>
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item.label}</p>
                {item.note && <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{item.note}</p>}
              </div>
              <span className="text-xs badge" style={{ background: `${item.color}1a`, color: item.color, border: `1px solid ${item.color}33` }}>
                {item.status}
              </span>
            </div>
          ))}

          {/* Danger Zone */}
          <div className="border-t pt-6 mt-6" style={{ borderColor: "rgba(239, 68, 68, 0.2)" }}>
            <p className="font-medium mb-1.5 text-red-400">Danger Zone</p>
            <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
              Permanently delete this device and erase all historical sync logs (battery, locations, app list, and intercepted notifications). This action is irreversible.
            </p>
            <button
              onClick={handleDeleteDevice}
              disabled={isDeleting}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 ${
                isDeleting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#ef4444",
              }}
            >
              <Trash2 size={16} />
              {isDeleting ? "Deleting Device..." : "Delete Device"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
