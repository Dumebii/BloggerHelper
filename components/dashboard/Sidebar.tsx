"use client";
import Link from "next/link";
import StatsWidget from "./StatsWidget";

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
  stats: { campaignsGenerated: number; scheduledCount: number; personasSaved: number };
  planStatus: any;
  isLoadingStats: boolean;
}

export default function Sidebar({
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  navItems,
  stats,
  planStatus,
  isLoadingStats,
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
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
        {!isSidebarCollapsed ? (
          <>
                        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Ozigi" className="h-8 w-auto logo-spin" />
          
          </Link>
          <Link href="/" className="text-2xl font-black text-brand-navy tracking-tighter">
            Ozigi
          </Link>
          </>
        ) : (
          <img src="/logo.png" alt="Ozigi" className="h-8 w-auto logo-spin" />
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

      <nav className="flex-1 px-2 py-6 space-y-2 overflow-y-auto" data-tour="sidebar-nav">
{navItems.map((item) => {
  let tourId = "";
  switch (item.label) {
    case "Generation History": tourId = "sidebar-history"; break;
    case "Scheduled Posts": tourId = "sidebar-scheduled"; break;
    case "Subscribers": tourId = "sidebar-subscribers"; break;
    case "Personas": tourId = "sidebar-personas"; break;
    case "Persona Marketplace": tourId = "sidebar-personas-marketplace"; break;
    case "Long-Form Content": tourId = "sidebar-long-form"; break;
    case "Email Lists": tourId = "sidebar-email-lists"; break;
    case "Settings & Integrations": tourId = "sidebar-settings"; break;
    case "Copilot Settings": tourId = "sidebar-copilot-settings"; break;
  }
  return (
    <button
      key={item.label}
      data-tour={tourId}
      onClick={() => { item.onClick(); setIsMobileSidebarOpen(false); }}
      className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-brand-red rounded-xl transition-colors ${isSidebarCollapsed ? 'justify-center' : ''}`}
      title={isSidebarCollapsed ? item.label : undefined}
    >
      <span className={isSidebarCollapsed ? 'mx-auto' : ''}>{item.icon}</span>
      {!isSidebarCollapsed && item.label}
    </button>
  );
})}
      </nav>

      <StatsWidget
        stats={stats}
        isLoadingStats={isLoadingStats}
        isSidebarCollapsed={isSidebarCollapsed}
        planStatus={planStatus}
      />
    </aside>
  );
}
