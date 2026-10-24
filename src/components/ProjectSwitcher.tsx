import React from 'react';
import { Building2, LayoutGrid, CheckCircle2, AlertCircle } from 'lucide-react';
import { ProjectData } from '../types';
import { formatRupiah, calculateDayWage } from '../utils/formatters';

interface ProjectSwitcherProps {
  projects: ProjectData[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  showAllProjectsView: boolean;
  onToggleAllProjectsView: (show: boolean) => void;
}

export const ProjectSwitcher: React.FC<ProjectSwitcherProps> = ({
  projects,
  activeProjectId,
  onSelectProject,
  showAllProjectsView,
  onToggleAllProjectsView,
}) => {
  // Helper to compute quick health for a project
  const getProjectQuickStats = (proj: ProjectData) => {
    let wages = 0;
    const wageMap = new Map<string, number>();
    proj.workers.forEach((w) => wageMap.set(w.id, w.dailyWage));

    Object.values(proj.attendance).forEach((dayRecords) => {
      Object.entries(dayRecords).forEach(([workerId, rec]) => {
        const base = wageMap.get(workerId) || 0;
        wages += calculateDayWage(rec.status, base, rec.customWage);
      });
    });

    const expenses = proj.expenses.reduce((s, e) => s + e.amount, 0);
    const totalSpent = wages + expenses;
    const remaining = (proj.ownerDealAmount || 0) - totalSpent;

    return { totalSpent, remaining };
  };

  return (
    <div className="bg-white border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          {/* Label */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-amber-600" />
              Pilih Proyek (5 Proyek):
            </span>
          </div>

          {/* 5 Project Tabs + Rekap 5 Proyek Button */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {projects.map((proj) => {
              const isActive = !showAllProjectsView && proj.id === activeProjectId;
              const { remaining } = getProjectQuickStats(proj);

              return (
                <button
                  key={proj.id}
                  type="button"
                  onClick={() => {
                    onToggleAllProjectsView(false);
                    onSelectProject(proj.id);
                  }}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
                    isActive
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                  title={`${proj.projectName} - ${proj.ownerName || 'Tanpa nama owner'}`}
                >
                  <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black ${
                    isActive ? 'bg-amber-700 text-white' : 'bg-stone-200 text-stone-700'
                  }`}>
                    {proj.projectNumber}
                  </span>
                  <span className="max-w-[130px] truncate">
                    {proj.projectName || `Proyek ${proj.projectNumber}`}
                  </span>
                  {proj.ownerDealAmount > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      isActive 
                        ? 'bg-amber-700/80 text-amber-100' 
                        : remaining < 0 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {remaining < 0 ? 'Defisit' : formatRupiah(remaining)}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Button View All 5 Projects Side-by-Side */}
            <button
              type="button"
              onClick={() => onToggleAllProjectsView(true)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                showAllProjectsView
                  ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                  : 'bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200 hover:text-stone-900'
              }`}
              title="Lihat Rekapitulasi & Perbandingan Seluruh 5 Proyek Sekaligus"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Rekap 5 Proyek</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
