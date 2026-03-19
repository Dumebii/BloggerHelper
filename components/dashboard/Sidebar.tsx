"use client";
import Link from "next/link";
import { Mail, User } from "lucide-react";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

interface SidebarProps {
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  navItems: NavItem[];
  stats?: React.ReactNode; // we'll pass StatsWidget as a child
}

export default function Sidebar({
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  navItems,
  stats,
}: SidebarProps) {
  return (
    <aside
      className={`
        ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 transition-all duration-300 ease-in-out
        fixed md:relative z-50 h-full bg-white border-r border-slate-200 flex flex-col shadow-2xl md:shadow-none
        ${isSidebarCollapsed ? "w-20" : "w-64 md:w-72"}
      `}
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
        {!isSidebarCollapsed ? (
          <Link href="/" className="text-2xl font-black text-slate-800 tracking-tighter">
            Ozigi.
          </Link>
        ) : (
          <div className="w-10 h-10 bg-red-700 rounded-xl flex items-center justify-center mx-auto">
            <span className="text-white font-black text-xl">O</span>
          </div>
        )}
        <button
          className="hidden md:block text-slate-400 hover:text-slate-600"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        >
          {isSidebarCollapsed ? "→" : "←"}
        </button>
        <button className="md:hidden text-slate-400" onClick={() => setIsMobileSidebarOpen(false)}>
          ✕
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => { item.onClick(); setIsMobileSidebarOpen(false); }}
            className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors ${
              isSidebarCollapsed ? 'justify-center' : ''
            }`}
            title={isSidebarCollapsed ? item.label : undefined}
          >
            {item.icon}
            {!isSidebarCollapsed && item.label}
          </button>
        ))}
      </nav>

      {/* Stats */}
      {stats}
    </aside>
  );
}