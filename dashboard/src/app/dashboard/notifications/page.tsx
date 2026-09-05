"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Bell, Smartphone, Trash2, Search, Filter, MessageSquare, Mail, Play, Layers } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { DeviceSelector } from "@/components/DeviceSelector";

export default function NotificationsPage() {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApp, setSelectedApp] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

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

  const appList = useMemo(() => {
    const set = new Set<string>();
    notifications.forEach((n: any) => {
      const name = n.appName || n.packageName;
      if (name) set.add(name);
    });
    return Array.from(set);
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n: any) => {
      const appName = n.appName || n.packageName || "";
      const matchesApp = selectedApp === "ALL" || appName === selectedApp;

      let matchesCategory = true;
      if (selectedCategory === "msg") {
        matchesCategory = n.category === "msg" || n.category === "message" ||
          /whatsapp|telegram|signal|messages|line|messenger/i.test(n.packageName || "");
      } else if (selectedCategory === "email") {
        matchesCategory = n.category === "email" || /gmail|outlook|mail/i.test(n.packageName || "");
      } else if (selectedCategory === "promo") {
        matchesCategory = n.category === "promo" || /shopee|tokopedia|lazada|gojek|grab/i.test(n.packageName || "");
      }

      const q = searchQuery.toLowerCase();
      const matchesSearch = !q ||
        appName.toLowerCase().includes(q) ||
        (n.title && n.title.toLowerCase().includes(q)) ||
        (n.text && n.text.toLowerCase().includes(q));

      return matchesApp && matchesCategory && matchesSearch;
    });
  }, [notifications, selectedApp, selectedCategory, searchQuery]);

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

      {/* Filter & Search Bar */}
      {activeDevice && notifications.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari pesan, pengirim, atau judul..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg text-xs bg-[var(--bg-secondary)] border border-[var(--border)] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          {/* App dropdown */}
          <select
            value={selectedApp}
            onChange={(e) => setSelectedApp(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs bg-[var(--bg-secondary)] border border-[var(--border)] text-slate-200 focus:outline-none focus:border-[var(--accent)] cursor-pointer"
          >
            <option value="ALL">Semua Aplikasi ({notifications.length})</option>
            {appList.map((app) => (
              <option key={app} value={app}>
                {app}
              </option>
            ))}
          </select>

          {/* Quick Category Chips */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {[
              { id: "ALL", label: "Semua", icon: Layers },
              { id: "msg", label: "Pesan", icon: MessageSquare },
              { id: "email", label: "Email", icon: Mail },
              { id: "promo", label: "Belanja", icon: Play },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-slate-200"
                }`}
              >
                <cat.icon size={11} />
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

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
      ) : filteredNotifications.length === 0 ? (
        <div className="glass-card p-8 text-center text-xs text-slate-400">
          Tidak ada notifikasi yang cocok dengan filter.
        </div>
      ) : (
        <div className="glass-card overflow-hidden divide-y divide-[var(--border)]">
          {filteredNotifications.map((n: any) => (
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
