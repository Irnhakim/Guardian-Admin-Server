"use client";

import { Smartphone } from "lucide-react";

interface DeviceSelectorProps {
  devices: any[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function DeviceSelector({ devices, selectedId, onSelect }: DeviceSelectorProps) {
  if (devices.length === 0) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {devices.map((device: any) => {
        const isSelected = (selectedId ? device.id === selectedId : devices[0]?.id === device.id);
        const isOnline = device.status === "ONLINE";

        return (
          <button
            key={device.id}
            onClick={() => onSelect(device.id)}
            className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap ${
              isSelected
                ? "bg-[var(--accent)] text-white border-transparent shadow-md"
                : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border)] hover:bg-[rgba(255,255,255,0.03)]"
            }`}
          >
            <Smartphone size={14} className={isSelected ? "text-white" : "text-[var(--text-muted)]"} />
            <span>{device.deviceName}</span>
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? (isSelected ? "bg-white" : "bg-emerald-400") : "bg-gray-400"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
