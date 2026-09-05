"use client";

import Link from "next/link";
import { Smartphone, ChevronLeft, Download, QrCode, ShieldCheck, Check } from "lucide-react";

export default function AddDevicePage() {
  return (
    <div className="p-6 max-w-3xl space-y-6">
      <Link href="/dashboard" className="flex items-center gap-1 text-sm w-fit" style={{ color: "var(--text-muted)" }}>
        <ChevronLeft size={16} /> Kembali ke Dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Tambah Perangkat Baru</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
          Panduan menghubungkan smartphone anak ke sistem Guardian
        </p>
      </div>

      <div className="glass-card p-6 space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white shrink-0" style={{ background: "var(--accent)" }}>
            1
          </div>
          <div>
            <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Pasang Aplikasi di HP Anak</h3>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              Install APK Guardian Mobile Client pada smartphone Android target.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white shrink-0" style={{ background: "var(--accent)" }}>
            2
          </div>
          <div>
            <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Buka Aplikasi & Berikan Izin</h3>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              Buka aplikasi Guardian dan izinkan semua akses yang diminta:
            </p>
            <ul className="text-xs mt-2 space-y-1 list-disc list-inside" style={{ color: "var(--text-secondary)" }}>
              <li>Notifikasi (Post Notifications)</li>
              <li>Lokasi GPS (Location Always Allow)</li>
              <li>Akses Penggunaan Aplikasi (Usage Access)</li>
              <li>Notification Listener (Akses Notifikasi Pesan)</li>
              <li>Device Admin & Accessibility Service (Anti-Uninstall)</li>
            </ul>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white shrink-0" style={{ background: "var(--accent)" }}>
            3
          </div>
          <div>
            <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Perangkat Terhubung Otomatis</h3>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              Begitu aplikasi dibuka di HP anak, perangkat akan otomatis terdaftar dan muncul di halaman Overview serta menu Devices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
