"use client";
import SubscribersManager from "@/components/SubscribersManager";

interface SubscribersModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: any;
}

export default function SubscribersModal({ isOpen, onClose, session }: SubscribersModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl p-6 max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-red-600 font-black text-xl"
        >
          ✕
        </button>
        <SubscribersManager session={session} />
      </div>
    </div>
  );
}