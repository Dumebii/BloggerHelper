"use client";

interface StatsWidgetProps {
  stats: { campaignsGenerated: number; scheduledCount: number; personasSaved: number };
  isLoadingStats: boolean;
  isSidebarCollapsed: boolean;
}

export default function StatsWidget({ stats, isLoadingStats, isSidebarCollapsed }: StatsWidgetProps) {
  return (
    <div className={`p-5 border-t border-slate-100 bg-slate-50/50 ${isSidebarCollapsed ? 'text-center' : ''}`}>
      {!isSidebarCollapsed && (
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Your Impact</h3>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-3 rounded-xl border border-slate-200 text-center shadow-sm flex flex-col justify-center">
          {isLoadingStats ? (
            <div className="h-6 w-10 bg-slate-200 animate-pulse mx-auto rounded" />
          ) : (
            <span className="block text-2xl font-black text-slate-800">{stats.campaignsGenerated}</span>
          )}
          {!isSidebarCollapsed && (
            <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-1">
              Campaigns
            </span>
          )}
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 text-center shadow-sm flex flex-col justify-center">
          {isLoadingStats ? (
            <div className="h-6 w-10 bg-slate-200 animate-pulse mx-auto rounded" />
          ) : (
            <span className="block text-2xl font-black text-slate-800">{stats.scheduledCount}</span>
          )}
          {!isSidebarCollapsed && (
            <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-1">
              Scheduled
            </span>
          )}
        </div>
      </div>
    </div>
  );
}