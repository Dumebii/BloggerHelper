"use client";
import Link from "next/link";
import PersonasManager from "@/components/PersonasManager";
import { Store } from "lucide-react";

interface PersonasModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: any;
}

export default function PersonasModal({ isOpen, onClose, session }: PersonasModalProps) {
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
        
        {/* Marketplace Link */}
        <div className="mb-6 p-4 bg-gradient-to-r from-brand-red/10 to-orange-100/50 rounded-2xl border border-brand-red/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-red/10 rounded-xl flex items-center justify-center">
                <Store className="w-5 h-5 text-brand-red" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Persona Marketplace</h4>
                <p className="text-xs text-slate-500">Browse pre-built voices from industry experts</p>
              </div>
            </div>
            <Link
              href="/dashboard/personas/marketplace"
              onClick={onClose}
              className="text-xs font-black uppercase tracking-widest text-white bg-brand-red hover:bg-brand-red/90 px-4 py-2 rounded-lg transition-all"
            >
              Browse
            </Link>
          </div>
        </div>
        
        <PersonasManager session={session} />
      </div>
    </div>
  );
}
