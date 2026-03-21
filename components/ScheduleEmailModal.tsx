"use client";
import { useState } from "react";

interface ScheduleEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (isoString: string) => void;
}

export default function ScheduleEmailModal({ isOpen, onClose, onSchedule }: ScheduleEmailModalProps) {
  const [datetime, setDatetime] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!datetime) return;
    const localDate = new Date(datetime);
    if (!isNaN(localDate.getTime())) {
      onSchedule(localDate.toISOString());
      onClose();
    } else {
      alert("Invalid date/time");
    }
  };

  if (!isOpen) return null;

  // Minimum datetime (now) for the picker
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const minDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[250] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-red-600"
        >
          ✕
        </button>
        <h3 className="text-lg font-black mb-4">Schedule Newsletter</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
              Date & Time (your local time)
            </label>
            <input
              type="datetime-local"
              value={datetime}
              onChange={(e) => setDatetime(e.target.value)}
              min={minDateTime}
              required
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-colors"
          >
            Schedule
          </button>
        </form>
      </div>
    </div>
  );
}