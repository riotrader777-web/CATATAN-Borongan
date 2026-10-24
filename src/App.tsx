import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  CalendarCheck, 
  ShoppingCart, 
  Users, 
  Building2, 
  RotateCcw, 
  Download, 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  Smartphone,
  UtensilsCrossed,
  Receipt,
  FileText,
  Coins,
  HardHat,
  Truck,
  Share2
} from 'lucide-react';
import LZString from 'lz-string';
import { 
  MultiProjectStore, 
  ProjectData, 
  Worker, 
  AttendanceRecord, 
  AttendanceStatus, 
  ExpenseItem,
  KasbonRecord,
  KasbonPayment,
  TemporaryWorkerPayment,
  ConcreteCastingRecord
} from './types';
import { 
  loadMultiProjectStore, 
  saveMultiProjectStore, 
  createDefaultProject,
  TOTAL_PROJECTS,
  sanitizeProjectData,
  sanitizeKasbonRecord
} from './utils/storage';
import { 
  getTodayDateString, 
  getSaturdayOfWeek, 
  calculateDayWage, 
  formatRupiah 
} from './utils/formatters';
import { isKasbonLunas } from './utils/kasbon';
import { FinancialSummary } from './components/FinancialSummary';
import { DailyAttendanceSection } from './components/DailyAttendanceSection';
import { SaturdayPayrollSection } from './components/SaturdayPayrollSection';
import { ExpenseSection } from './components/ExpenseSection';
import { WorkersModal } from './components/WorkersModal';
import { PrintSlipModal } from './components/PrintSlipModal';
import { AndroidApkModal } from './components/AndroidApkModal';
import { ProjectSwitcher } from './components/ProjectSwitcher';
import { AllProjectsSummary } from './components/AllProjectsSummary';
import { OfflineStatusIndicator } from './components/OfflineStatusIndicator';
import { KasbonSection } from './components/kasbon/KasbonSection';
import { TemporaryWorkersSection } from './components/temporary/TemporaryWorkersSection';
import { ProjectAllocationChart } from './components/ProjectAllocationChart';
import { ConcreteCastingSection } from './components/casting/ConcreteCastingSection';
import { ShareSyncModal } from './components/ShareSyncModal';

export default function App() {
  const [store, setStore] = useState<MultiProjectStore>(loadMultiProjectStore);
  const [showAllProjectsView, setShowAllProjectsView] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [selectedSaturday, setSelectedSaturday] = useState<string>(getSaturdayOfWeek(getTodayDateString()));
  const [activeTab, setActiveTab] = useState<'attendance' | 'saturday' | 'temporary' | 'casting' | 'expenses' | 'summary' | 'kasbon'>('attendance');
  
  // Modals
  const [isWorkersModalOpen, setIsWorkersModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [incomingImportData, setIncomingImportData] = useState<any | null>(null);
  const [printSaturdayDate, setPrintSaturdayDate] = useState(selectedSaturday);

  // Count of workers with active unpaid kasbon
  const unpaidKasbonCount = (store.kasbonList || []).filter((k) => !isKasbonLunas(k)).length;

  // Sync state changes to localStorage
  useEffect(() => {
    saveMultiProjectStore(store);
  }, [store]);

  // Auto-detect incoming share sync link from URL hash (e.g. #sync=...)
  useEffect(() => {
    const handleCheckHash = () => {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#sync=')) {
        try {
          const compressed = hash.substring(6);
          const decompressed = LZString.decompressFromEncodedURIComponent(compressed);
          if (decompressed) {
            const parsed = JSON.parse(decompressed);
            setIncomingImportData(parsed);
            setIsShareModalOpen(true);
            // Clean hash without reload
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
          }
        } catch (e) {
          console.error('Failed to parse incoming share link', e);
        }
      }
    };

    handleCheckHash();
    window.addEventListener('hashchange', handleCheckHash);
    return () => window.removeEventListener('hashchange', handleCheckHash);
  }, []);

  // If selectedDate changes, also update suggested Saturday
  useEffect(() => {
    setSelectedSaturday(getSaturdayOfWeek(selectedDate));
  }, [selectedDate]);

  const handleApplyImportedStore = (newStore: MultiProjectStore) => {
    setStore(newStore);
  };

  const handleApplySingleProject = (targetProjectId: string, project: ProjectData) => {
    setStore((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === targetProjectId ? project : p)),
    }));
  };

  // Current active project
  const activeProject = store.projects.find((p) => p.id === store.activeProjectId) || store.projects[0];

  // Helper to update active project within the store
  const updateActiveProject = (updater: (prevProj: ProjectData) => ProjectData) => {
    setStore((prevStore) => {
      const nextProjects = prevStore.projects.map((p) => {
        if (p.id === prevStore.activeProjectId) {
          return updater(p);
        }
        return p;
      });
      return {
        ...prevStore,
        projects: nextProjects,
      };
    });
  };

  const handleUpdateProjectFields = (updated: Partial<ProjectData>) => {
    updateActiveProject((prev) => ({ ...prev, ...updated }));
  };

  // Switch active project
  const handleSelectProject = (projectId: string) => {
    setStore((prev) => ({ ...prev, activeProjectId: projectId }));
  };

  // Kasbon handlers (Murni catatan kasbon pegawai terpisah dari hitungan borongan)
  const handleAddKasbon = (newRecordData: Omit<KasbonRecord, 'id' | 'createdAt' | 'payments'>) => {
    const newRecord: KasbonRecord = {
      ...newRecordData,
      id: `kasbon-${Date.now()}`,
      payments: [],
      createdAt: new Date().toISOString(),
    };
    setStore((prev) => ({
      ...prev,
      kasbonList: [newRecord, ...(prev.kasbonList || [])],
    }));
  };

  const handleUpdateKasbon = (recordId: string, updated: Partial<KasbonRecord>) => {
    setStore((prev) => ({
      ...prev,
      kasbonList: (prev.kasbonList || []).map((k) =>
        k.id === recordId ? { ...k, ...updated } : k
      ),
    }));
  };

  const handleDeleteKasbon = (recordId: string) => {
    setStore((prev) => ({
      ...prev,
      kasbonList: (prev.kasbonList || []).filter((k) => k.id !== recordId),
    }));
  };

  const handleAddKasbonPayment = (recordId: string, paymentData: Omit<KasbonPayment, 'id' | 'createdAt'>) => {
    const newPayment: KasbonPayment = {
      ...paymentData,
      id: `pay-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setStore((prev) => ({
      ...prev,
      kasbonList: (prev.kasbonList || []).map((k) => {
        if (k.id === recordId) {
          return {
            ...k,
            payments: [...k.payments, newPayment],
          };
        }
        return k;
      }),
    }));
  };

  const handleDeleteKasbonPayment = (recordId: string, paymentId: string) => {
    setStore((prev) => ({
      ...prev,
      kasbonList: (prev.kasbonList || []).map((k) => {
        if (k.id === recordId) {
          return {
            ...k,
            payments: k.payments.filter((p) => p.id !== paymentId),
          };
        }
        return k;
      }),
    }));
  };

  // Calculate wages for active project
  const calculateTotalWagesExpense = (): number => {
    let total = 0;
    const workerWageMap = new Map<string, number>();
    activeProject.workers.forEach((w) => workerWageMap.set(w.id, w.dailyWage));

    Object.entries(activeProject.attendance).forEach(([_, dayRecords]) => {
      Object.entries(dayRecords).forEach(([workerId, record]) => {
        const baseWage = workerWageMap.get(workerId) || 0;
        total += calculateDayWage(record.status, baseWage, record.customWage);
      });
    });
    return total;
  };

  // Calculate expenses breakdown (Konsumsi vs Non-konsumsi) for active project
  const totalWagesExpense = calculateTotalWagesExpense();
  const totalTemporaryWagesExpense = (activeProject.temporaryWorkers || []).reduce(
    (sum, item) => sum + item.totalAmount,
    0
  );
  const unpaidTempWorkersCount = (activeProject.temporaryWorkers || []).filter(
    (t) => !t.isPaid
  ).length;

  const totalKonsumsiExpense = activeProject.expenses
    .filter((e) => e.category === 'konsumsi')
    .reduce((sum, item) => sum + item.amount, 0);
  const totalOtherExpense = activeProject.expenses
    .filter((e) => e.category !== 'konsumsi')
    .reduce((sum, item) => sum + item.amount, 0);
  const totalItemsExpense = totalKonsumsiExpense + totalOtherExpense;

  // Calculate Concrete Casting & Pump Rental Expense
  const totalConcreteExpense = (activeProject.concreteCastings || []).reduce(
    (sum, item) => sum + item.grandTotal,
    0
  );
  const unpaidCastingsCount = (activeProject.concreteCastings || []).filter(
    (c) => !c.isPaid
  ).length;

  // Handlers for Temporary Workers (Karyawan Sekali Pakai / Cabutan Ngecor)
  const handleAddTemporaryWorker = (data: Omit<TemporaryWorkerPayment, 'id' | 'createdAt'>) => {
    const newItem: TemporaryWorkerPayment = {
      ...data,
      id: `temp-worker-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    updateActiveProject((prev) => ({
      ...prev,
      temporaryWorkers: [newItem, ...(prev.temporaryWorkers || [])],
    }));
  };

  const handleUpdateTemporaryWorker = (id: string, updated: Partial<TemporaryWorkerPayment>) => {
    updateActiveProject((prev) => ({
      ...prev,
      temporaryWorkers: (prev.temporaryWorkers || []).map((t) =>
        t.id === id ? { ...t, ...updated } : t
      ),
    }));
  };

  const handleDeleteTemporaryWorker = (id: string) => {
    updateActiveProject((prev) => ({
      ...prev,
      temporaryWorkers: (prev.temporaryWorkers || []).filter((t) => t.id !== id),
    }));
  };

  const handleToggleTemporaryWorkerPaid = (id: string) => {
    updateActiveProject((prev) => ({
      ...prev,
      temporaryWorkers: (prev.temporaryWorkers || []).map((t) =>
        t.id === id
          ? {
              ...t,
              isPaid: !t.isPaid,
              paidAt: !t.isPaid ? new Date().toISOString() : undefined,
            }
          : t
      ),
    }));
  };

  // Handlers for Concrete Casting & Pump Rental (Jayamix & Sewa Pompa)
  const handleAddConcreteCasting = (data: Omit<ConcreteCastingRecord, 'id' | 'createdAt'>) => {
    const newRecord: ConcreteCastingRecord = {
      ...data,
      id: `casting-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };
    updateActiveProject((prev) => ({
      ...prev,
      concreteCastings: [newRecord, ...(prev.concreteCastings || [])],
    }));
  };

  const handleUpdateConcreteCasting = (id: string, updated: Partial<ConcreteCastingRecord>) => {
    updateActiveProject((prev) => ({
      ...prev,
      concreteCastings: (prev.concreteCastings || []).map((c) =>
        c.id === id ? { ...c, ...updated } : c
      ),
    }));
  };

  const handleDeleteConcreteCasting = (id: string) => {
    updateActiveProject((prev) => ({
      ...prev,
      concreteCastings: (prev.concreteCastings || []).filter((c) => c.id !== id),
    }));
  };

  const handleToggleConcreteCastingPaid = (id: string) => {
    updateActiveProject((prev) => ({
      ...prev,
      concreteCastings: (prev.concreteCastings || []).map((c) =>
        c.id === id
          ? {
              ...c,
              isPaid: !c.isPaid,
              paidAt: !c.isPaid ? new Date().toISOString() : undefined,
            }
          : c
      ),
    }));
  };

  // Handlers for Workers (Tanpa Batasan Kuota)
  const handleAddWorker = (data: { name: string; dailyWage: number; role?: string; phone?: string }) => {
    const newWorker: Worker = {
      id: `worker-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: data.name.trim(),
      dailyWage: Math.max(0, data.dailyWage || 0),
      role: data.role ? data.role.trim() : 'Tukang',
      phone: data.phone ? data.phone.trim() : undefined,
    };
    updateActiveProject((prev) => ({
      ...prev,
      workers: [...prev.workers, newWorker],
    }));
  };

  const handleUpdateWorker = (workerIdOrIndex: string | number, updated: Partial<Worker>) => {
    updateActiveProject((prev) => {
      const nextWorkers = prev.workers.map((w, idx) => {
        if (typeof workerIdOrIndex === 'number' && idx === workerIdOrIndex) {
          return { ...w, ...updated };
        }
        if (typeof workerIdOrIndex === 'string' && w.id === workerIdOrIndex) {
          return { ...w, ...updated };
        }
        return w;
      });
      return { ...prev, workers: nextWorkers };
    });
  };

  const handleDeleteWorker = (workerId: string) => {
    updateActiveProject((prev) => ({
      ...prev,
      workers: prev.workers.filter((w) => w.id !== workerId),
    }));
  };

  const handleSaveWorkersList = (newWorkers: Worker[]) => {
    updateActiveProject((prev) => ({ ...prev, workers: newWorkers }));
  };

  // Handlers for Attendance
  const handleUpdateAttendance = (date: string, workerId: string, record: AttendanceRecord) => {
    updateActiveProject((prev) => {
      const currentDay = prev.attendance[date] || {};
      const nextDay = { ...currentDay, [workerId]: record };
      return {
        ...prev,
        attendance: {
          ...prev.attendance,
          [date]: nextDay,
        },
      };
    });
  };

  const handleBatchUpdateAttendance = (date: string, status: AttendanceStatus) => {
    updateActiveProject((prev) => {
      const currentDay = { ...(prev.attendance[date] || {}) };
      prev.workers.forEach((w) => {
        currentDay[w.id] = {
          status,
          customWage: currentDay[w.id]?.customWage,
          note: currentDay[w.id]?.note,
        };
      });
      return {
        ...prev,
        attendance: {
          ...prev.attendance,
          [date]: currentDay,
        },
      };
    });
  };

  // Handlers for Expenses
  const handleAddExpense = (expense: Omit<ExpenseItem, 'id'>) => {
    const newItem: ExpenseItem = {
      ...expense,
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    updateActiveProject((prev) => ({
      ...prev,
      expenses: [newItem, ...prev.expenses],
    }));
  };

  const handleDeleteExpense = (id: string) => {
    updateActiveProject((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.id !== id),
    }));
  };

  // Handlers for Saturday Payroll
  const handleToggleWeeklyPayment = (
    satDate: string, 
    totalAmount: number, 
    paymentMethod: 'tunai' | 'transfer' = 'tunai'
  ) => {
    updateActiveProject((prev) => {
      const current = prev.weeklyPayments[satDate];
      const nextIsPaid = !current?.isPaid;
      return {
        ...prev,
        weeklyPayments: {
          ...prev.weeklyPayments,
          [satDate]: {
            saturdayDate: satDate,
            isPaid: nextIsPaid,
            paidAt: nextIsPaid ? new Date().toISOString() : undefined,
            totalPaid: nextIsPaid ? totalAmount : 0,
            paymentMethod: paymentMethod,
          },
        },
      };
    });
  };

  const handleOpenPrintModal = (satDate: string) => {
    setPrintSaturdayDate(satDate);
    setIsPrintModalOpen(true);
  };

  // Backup / Reset for active project or all projects
  const handleResetActiveProject = () => {
    if (window.confirm(`Yakin ingin mereset data "${activeProject.projectName}"? Semua catatan absensi, termin, dan pengeluaran pada proyek ini akan dikosongkan.`)) {
      updateActiveProject(() => 
        createDefaultProject(activeProject.id, activeProject.projectNumber, `Proyek ${activeProject.projectNumber}`)
      );
    }
  };

  const handleExportBackup = () => {
    const jsonStr = JSON.stringify(store, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-5proyek-borongan-${getTodayDateString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.projects)) {
          const sanitizedProjects: ProjectData[] = [];
          for (let i = 1; i <= TOTAL_PROJECTS; i++) {
            const match = parsed.projects.find((p: ProjectData) => p.projectNumber === i || p.id === `project-${i}`) || parsed.projects[i - 1];
            if (match) {
              sanitizedProjects.push(sanitizeProjectData(match, `project-${i}`, i));
            } else {
              sanitizedProjects.push(createDefaultProject(`project-${i}`, i));
            }
          }
          const sanitizedKasbon = Array.isArray(parsed.kasbonList)
            ? parsed.kasbonList.map((k: any, i: number) => sanitizeKasbonRecord(k, i))
            : (store.kasbonList || []);

          setStore({
            activeProjectId: parsed.activeProjectId || 'project-1',
            projects: sanitizedProjects,
            kasbonList: sanitizedKasbon,
          });
          alert('Seluruh data 5 proyek dan catatan kasbon berhasil dipulihkan!');
        } else if (parsed && (Array.isArray(parsed.workers) || typeof parsed.projectName === 'string')) {
          // Single project backup: import into current active project
          const single = sanitizeProjectData(parsed, activeProject.id, activeProject.projectNumber);
          updateActiveProject(() => single);
          alert(`Data proyek berhasil diimpor ke ${activeProject.projectName}!`);
        } else {
          alert('Format file backup tidak sesuai.');
        }
      } catch (err) {
        alert('Gagal membaca file JSON backup.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 pb-16">
      {/* Top Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center font-black shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-stone-900 text-sm sm:text-base tracking-tight leading-none block">
                Kalkulator Borongan Proyek
              </span>
              <span className="text-[11px] text-stone-500 font-medium leading-none block mt-0.5">
                5 Proyek • Deal Owner • Gaji 50 Pegawai & Konsumsi
              </span>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            <OfflineStatusIndicator />

            <button
              id="quick-kasbon-header-btn"
              onClick={() => {
                setShowAllProjectsView(false);
                setActiveTab('kasbon');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-950 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl transition shadow-2xs"
              title="Buku Catatan Kasbon Pegawai (Otomatis Terpotong Saat Dicicil)"
            >
              <Coins className="w-4 h-4 text-amber-700" />
              <span className="hidden sm:inline">Kasbon</span> Pegawai
              {unpaidKasbonCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-black bg-rose-600 text-white rounded-full">
                  {unpaidKasbonCount}
                </span>
              )}
            </button>

            <button
              id="quick-temporary-header-btn"
              onClick={() => {
                setShowAllProjectsView(false);
                setActiveTab('temporary');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-950 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl transition shadow-2xs"
              title="Gaji Karyawan Sekali Pakai (Ngecor & Harian Lepas)"
            >
              <HardHat className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">Pekerja</span> Cor/Lepas
              {unpaidTempWorkersCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-black bg-rose-600 text-white rounded-full">
                  {unpaidTempWorkersCount}
                </span>
              )}
            </button>

            <button
              id="android-apk-header-btn"
              onClick={() => setIsApkModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-xl transition shadow-2xs"
              title="Pasang di Layar HP Android / Buat File APK"
            >
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Pasang di</span> Android
            </button>

            <button
              id="manage-workers-header-btn"
              onClick={() => setIsWorkersModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition"
              title="Kelola Daftar Karyawan & Tarif Gaji (Tanpa Batasan)"
            >
              <Users className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">Kelola</span> Karyawan ({activeProject.workers.length})
            </button>
            <button
              id="share-sync-header-btn"
              onClick={() => {
                setIncomingImportData(null);
                setIsShareModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-950 bg-amber-100/90 hover:bg-amber-200 border border-amber-300 rounded-xl transition shadow-2xs"
              title="Kirim / Impor Catatan ke Partner Kerja (via Link WhatsApp, Kode Teks, atau File JSON)"
            >
              <Share2 className="w-4 h-4 text-amber-700" />
              <span className="hidden sm:inline">Kirim / Impor</span> Partner
            </button>

            <button
              id="export-backup-btn"
              onClick={handleExportBackup}
              className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition"
              title="Download Cadangan Data 5 Proyek (JSON)"
            >
              <Download className="w-4 h-4" />
            </button>

            <label
              htmlFor="import-file-input"
              className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition cursor-pointer"
              title="Impor Cadangan Data (JSON)"
            >
              <Upload className="w-4 h-4" />
              <input
                id="import-file-input"
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>

            <button
              id="reset-project-btn"
              onClick={handleResetActiveProject}
              className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
              title="Reset Data Proyek Aktif"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Project Switcher Bar (Proyek 1 - 5 + Rekap 5 Proyek) */}
      <ProjectSwitcher
        projects={store.projects}
        activeProjectId={store.activeProjectId}
        onSelectProject={handleSelectProject}
        showAllProjectsView={showAllProjectsView}
        onToggleAllProjectsView={setShowAllProjectsView}
      />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        {showAllProjectsView ? (
          /* View All 5 Projects Comparison Dashboard */
          <AllProjectsSummary
            projects={store.projects}
            onSelectProject={(id) => {
              handleSelectProject(id);
              setShowAllProjectsView(false);
            }}
          />
        ) : (
          /* View Single Active Project */
          <>
            {/* Top Financial Dashboard with Deal Owner & Notes */}
            <FinancialSummary
              project={activeProject}
              onUpdateProject={handleUpdateProjectFields}
              totalWagesExpense={totalWagesExpense}
              totalTemporaryWagesExpense={totalTemporaryWagesExpense}
              totalConcreteExpense={totalConcreteExpense}
              totalKonsumsiExpense={totalKonsumsiExpense}
              totalOtherExpense={totalOtherExpense}
              onNavigateToTab={(tab) => setActiveTab(tab)}
            />

            {/* Tab Navigation for Active Project */}
            <div className="flex items-center gap-1.5 p-1 bg-white border border-stone-200 rounded-2xl mb-6 shadow-2xs overflow-x-auto">
              <button
                id="tab-attendance"
                onClick={() => setActiveTab('attendance')}
                className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                  activeTab === 'attendance'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Absensi & Gaji Harian
              </button>

              <button
                id="tab-saturday"
                onClick={() => setActiveTab('saturday')}
                className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                  activeTab === 'saturday'
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <CalendarCheck className="w-4 h-4" />
                Rekap Gaji Sabtu
              </button>

              <button
                id="tab-temporary"
                onClick={() => setActiveTab('temporary')}
                className={`flex-1 min-w-[155px] py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                  activeTab === 'temporary'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <HardHat className="w-4 h-4 text-amber-500" />
                <span>Pekerja Cor / Lepas</span>
                {(activeProject.temporaryWorkers || []).length > 0 && (
                  <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                    activeTab === 'temporary' ? 'bg-amber-800 text-amber-100' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {(activeProject.temporaryWorkers || []).length}
                  </span>
                )}
              </button>

              <button
                id="tab-casting"
                onClick={() => setActiveTab('casting')}
                className={`flex-1 min-w-[165px] py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                  activeTab === 'casting'
                    ? 'bg-sky-700 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <Truck className="w-4 h-4 text-sky-500" />
                <span>Cor Jayamix & Pompa</span>
                {(activeProject.concreteCastings || []).length > 0 && (
                  <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                    activeTab === 'casting' ? 'bg-sky-900 text-sky-100' : 'bg-sky-100 text-sky-800'
                  }`}>
                    {(activeProject.concreteCastings || []).length}
                  </span>
                )}
              </button>

              <button
                id="tab-expenses"
                onClick={() => setActiveTab('expenses')}
                className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                  activeTab === 'expenses'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                Konsumsi & Logistik
              </button>

              <button
                id="tab-summary"
                onClick={() => setActiveTab('summary')}
                className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                  activeTab === 'summary'
                    ? 'bg-stone-800 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                Rincian & Rekap Proyek
              </button>

              <button
                id="tab-kasbon"
                onClick={() => setActiveTab('kasbon')}
                className={`flex-1 min-w-[150px] py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                  activeTab === 'kasbon'
                    ? 'bg-amber-700 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <Coins className="w-4 h-4 text-amber-400" />
                <span>Kasbon Pegawai</span>
                {unpaidKasbonCount > 0 && (
                  <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                    activeTab === 'kasbon' ? 'bg-amber-900 text-amber-100' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {unpaidKasbonCount}
                  </span>
                )}
              </button>
            </div>

            {/* Tab 1: Daily Attendance & Daily Wage Tracker */}
            {activeTab === 'attendance' && (
              <DailyAttendanceSection
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                workers={activeProject.workers}
                onUpdateWorker={handleUpdateWorker}
                onAddWorker={handleAddWorker}
                onDeleteWorker={handleDeleteWorker}
                attendance={activeProject.attendance}
                onUpdateAttendance={handleUpdateAttendance}
                onBatchUpdateAttendance={handleBatchUpdateAttendance}
              />
            )}

            {/* Tab 2: Saturday Payroll (Weekly Payout) */}
            {activeTab === 'saturday' && (
              <SaturdayPayrollSection
                selectedSaturday={selectedSaturday}
                onSelectSaturday={setSelectedSaturday}
                workers={activeProject.workers}
                attendance={activeProject.attendance}
                weeklyPayments={activeProject.weeklyPayments}
                onToggleWeeklyPayment={handleToggleWeeklyPayment}
                onOpenPrintModal={handleOpenPrintModal}
                temporaryWorkers={activeProject.temporaryWorkers}
                onNavigateToTemporary={() => setActiveTab('temporary')}
              />
            )}

            {/* Tab: Pekerja Sekali Pakai (Ngecor & Harian Lepas) */}
            {activeTab === 'temporary' && (
              <TemporaryWorkersSection
                project={activeProject}
                onAddTemporaryWorker={handleAddTemporaryWorker}
                onUpdateTemporaryWorker={handleUpdateTemporaryWorker}
                onDeleteTemporaryWorker={handleDeleteTemporaryWorker}
                onTogglePaid={handleToggleTemporaryWorkerPaid}
              />
            )}

            {/* Tab: Pengecoran Beton Ready Mix Jayamix & Sewa Pompa */}
            {activeTab === 'casting' && (
              <ConcreteCastingSection
                project={activeProject}
                onAddConcreteCasting={handleAddConcreteCasting}
                onUpdateConcreteCasting={handleUpdateConcreteCasting}
                onDeleteConcreteCasting={handleDeleteConcreteCasting}
                onTogglePaid={handleToggleConcreteCastingPaid}
                onNavigateToTab={(tab) => setActiveTab(tab)}
              />
            )}

            {/* Tab 3: Daily Expenses (Konsumsi vs Material/Operasional) */}
            {activeTab === 'expenses' && (
              <ExpenseSection
                expenses={activeProject.expenses}
                selectedDate={selectedDate}
                onAddExpense={handleAddExpense}
                onDeleteExpense={handleDeleteExpense}
              />
            )}

            {/* Tab 4: Overall Financial Breakdown & Project Health */}
            {activeTab === 'summary' && (
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 md:p-6 space-y-6">
                <div className="border-b border-stone-100 pb-4">
                  <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">
                    Rekapitulasi Keuangan {activeProject.projectName}
                  </h2>
                  <p className="text-xs text-stone-500">
                    Transparansi potongan deal owner, beban gaji pegawai, upah pekerja cor, biaya cor Jayamix & pompa, dan rincian logistik
                  </p>
                </div>

                {/* Financial Equation Card */}
                <div className="bg-stone-50 rounded-xl p-5 border border-stone-200">
                  <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-4">
                    Rumus Perhitungan Sisa Borongan & Profit Mandor
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-11 items-center gap-2 text-center">
                    <div className="p-3 bg-white rounded-lg border border-stone-200">
                      <span className="text-[10px] text-stone-500 font-semibold block">DEAL DARI OWNER</span>
                      <span className="text-base font-black text-stone-900 block mt-1">
                        {formatRupiah(activeProject.ownerDealAmount)}
                      </span>
                      {((activeProject.ownerDealCash || 0) > 0 || (activeProject.ownerDealBank || 0) > 0) && (
                        <div className="mt-1 pt-1 border-t border-stone-100 flex items-center justify-center gap-1.5 text-[9px] font-bold">
                          {(activeProject.ownerDealCash || 0) > 0 && (
                            <span className="text-emerald-700">💵 {formatRupiah(activeProject.ownerDealCash || 0)}</span>
                          )}
                          {(activeProject.ownerDealBank || 0) > 0 && (
                            <span className="text-blue-700">🏦 {formatRupiah(activeProject.ownerDealBank || 0)}</span>
                          )}
                        </div>
                      )}
                    </div>

                    <span className="text-xl font-black text-stone-400">-</span>

                    <div className="p-3 bg-white rounded-lg border border-blue-200 text-blue-900">
                      <span className="text-[10px] text-blue-600 font-semibold block">TOTAL GAJI KARYAWAN</span>
                      <span className="text-base font-black text-blue-950 block mt-1">
                        {formatRupiah(totalWagesExpense)}
                      </span>
                    </div>

                    <span className="text-xl font-black text-stone-400">-</span>

                    <div className="p-3 bg-white rounded-lg border border-amber-300 text-amber-950">
                      <span className="text-[10px] text-amber-700 font-semibold block">PEKERJA COR / LEPAS</span>
                      <span className="text-base font-black text-amber-950 block mt-1">
                        {formatRupiah(totalTemporaryWagesExpense)}
                      </span>
                    </div>

                    <span className="text-xl font-black text-stone-400">-</span>

                    <div className="p-3 bg-white rounded-lg border border-sky-300 text-sky-950">
                      <span className="text-[10px] text-sky-700 font-semibold block">COR JAYAMIX & POMPA</span>
                      <span className="text-base font-black text-sky-950 block mt-1">
                        {formatRupiah(totalConcreteExpense)}
                      </span>
                    </div>

                    <span className="text-xl font-black text-stone-400">-</span>

                    <div className="p-3 bg-white rounded-lg border border-orange-200 text-orange-900">
                      <span className="text-[10px] text-orange-600 font-semibold block">BIAYA KONSUMSI</span>
                      <span className="text-base font-black text-orange-950 block mt-1">
                        {formatRupiah(totalKonsumsiExpense)}
                      </span>
                    </div>

                    <span className="text-xl font-black text-stone-400">-</span>

                    <div className="p-3 bg-white rounded-lg border border-stone-300 text-stone-900">
                      <span className="text-[10px] text-stone-500 font-semibold block">MATERIAL & LAIN</span>
                      <span className="text-base font-black text-stone-900 block mt-1">
                        {formatRupiah(totalOtherExpense)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-stone-200 text-center">
                    <span className="text-xs text-stone-500 font-semibold uppercase">
                      Sisa Saldo Bersih / Profit Mandor ({activeProject.projectName}):
                    </span>
                    <div className={`text-2xl md:text-3xl font-black mt-1 ${
                      activeProject.ownerDealAmount - (totalWagesExpense + totalTemporaryWagesExpense + totalItemsExpense + totalConcreteExpense) < 0 
                        ? 'text-red-700' 
                        : 'text-emerald-800'
                    }`}>
                      {formatRupiah(activeProject.ownerDealAmount - (totalWagesExpense + totalTemporaryWagesExpense + totalItemsExpense + totalConcreteExpense))}
                    </div>
                  </div>
                </div>

                {/* Visualisasi Grafik Pie Alokasi Dana (Recharts) */}
                <ProjectAllocationChart
                  projectName={activeProject.projectName}
                  totalWagesExpense={totalWagesExpense}
                  totalTemporaryWagesExpense={totalTemporaryWagesExpense}
                  totalConcreteExpense={totalConcreteExpense}
                  expenses={activeProject.expenses}
                  ownerDealAmount={activeProject.ownerDealAmount}
                  onNavigateToTab={(tab) => setActiveTab(tab)}
                />

                {/* Catatan Khusus Deal Owner Ringkasan */}
                {activeProject.ownerDealNotes && (
                  <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-xs space-y-1">
                    <div className="font-bold text-amber-900 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-amber-700" />
                      Catatan Kesepakatan Deal dari Owner:
                    </div>
                    <p className="text-stone-700 whitespace-pre-wrap leading-relaxed">
                      {activeProject.ownerDealNotes}
                    </p>
                  </div>
                )}

                {/* Attendance Days Summary Table for Registered Workers */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-stone-800">
                        Ringkasan Jam Kerja Karyawan ({activeProject.projectName})
                      </h3>
                      <p className="text-xs text-stone-500">
                        Total {activeProject.workers.length} karyawan terdaftar di proyek ini
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('attendance');
                      }}
                      className="text-xs font-bold text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-200 transition self-start sm:self-auto"
                    >
                      + Kelola / Tambah Karyawan &rarr;
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    {activeProject.workers.length === 0 ? (
                      <div className="text-center py-10 border border-dashed border-stone-200 rounded-xl text-xs text-stone-400 bg-stone-50/50">
                        Belum ada karyawan terdaftar di proyek ini.
                      </div>
                    ) : (
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-stone-200 bg-stone-50 text-stone-600 font-bold">
                            <th className="p-2.5">No</th>
                            <th className="p-2.5">Nama Karyawan</th>
                            <th className="p-2.5">Tarif Gaji/Hari</th>
                            <th className="p-2.5 text-center">Total Hadir (H)</th>
                            <th className="p-2.5 text-center">Total Setengah (S)</th>
                            <th className="p-2.5 text-center">Total Alfa (A)</th>
                            <th className="p-2.5 text-right">Total Seluruh Gaji</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 font-medium">
                          {activeProject.workers.map((worker, i) => {
                            let h = 0;
                            let s = 0;
                            let a = 0;
                            let total = 0;

                            Object.values(activeProject.attendance).forEach((dayMap) => {
                              const rec = dayMap[worker.id];
                              if (rec?.status === 'H') h++;
                              else if (rec?.status === 'S') s++;
                              else if (rec?.status === 'A') a++;

                              total += calculateDayWage(rec?.status, worker.dailyWage, rec?.customWage);
                            });

                            return (
                              <tr key={worker.id} className="hover:bg-stone-50">
                                <td className="p-2.5 font-bold text-stone-400">#{i + 1}</td>
                                <td className="p-2.5">
                                  <div className="font-bold text-stone-900">{worker.name}</div>
                                  {worker.role && (
                                    <div className="text-[10px] text-stone-500">{worker.role}</div>
                                  )}
                                </td>
                                <td className="p-2.5 text-stone-600">{formatRupiah(worker.dailyWage)}</td>
                                <td className="p-2.5 text-center font-bold text-emerald-700">{h} Hari</td>
                                <td className="p-2.5 text-center font-bold text-amber-700">{s} Hari</td>
                                <td className="p-2.5 text-center font-bold text-rose-600">{a} Hari</td>
                                <td className="p-2.5 text-right font-black text-stone-900">
                                  {formatRupiah(total)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="border-t-2 border-stone-200 bg-stone-50 font-black">
                            <td colSpan={6} className="p-2.5 text-right uppercase text-stone-700">
                              Total Beban Gaji Keseluruhan:
                            </td>
                            <td className="p-2.5 text-right text-sm text-blue-950 font-black">
                              {formatRupiah(totalWagesExpense)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    )}
                  </div>
                </div>

                {/* Temporary Workers Summary Table in Project Summary */}
                {(activeProject.temporaryWorkers || []).length > 0 && (
                  <div className="pt-4 border-t border-stone-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <HardHat className="w-4 h-4 text-amber-600" />
                        <h3 className="text-sm font-bold text-stone-800">
                          Rincian Pekerja Sekali Pakai / Cor ({activeProject.projectName})
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('temporary')}
                        className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                      >
                        Kelola di Tab Pekerja Cor &rarr;
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-stone-200 bg-stone-50 text-stone-600 font-bold">
                            <th className="p-2.5">Tanggal</th>
                            <th className="p-2.5">Nama Pekerja / Kelompok</th>
                            <th className="p-2.5">Pekerjaan</th>
                            <th className="p-2.5">Jumlah</th>
                            <th className="p-2.5 text-center">Status</th>
                            <th className="p-2.5 text-right">Total Upah</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 font-medium">
                          {(activeProject.temporaryWorkers || []).map((t) => (
                            <tr key={t.id} className="hover:bg-stone-50">
                              <td className="p-2.5 whitespace-nowrap">{t.date}</td>
                              <td className="p-2.5 font-bold text-stone-900">{t.workerName}</td>
                              <td className="p-2.5 text-amber-900 font-semibold">{t.taskDescription}</td>
                              <td className="p-2.5">{t.headcount} Orang</td>
                              <td className="p-2.5 text-center">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  t.isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                }`}>
                                  {t.isPaid ? 'Lunas' : 'Belum Bayar'}
                                </span>
                              </td>
                              <td className="p-2.5 text-right font-black text-stone-900">
                                {formatRupiah(t.totalAmount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t-2 border-stone-200 bg-amber-50/50 font-black">
                            <td colSpan={5} className="p-2.5 text-right uppercase text-amber-900">
                              Total Upah Pekerja Sekali Pakai:
                            </td>
                            <td className="p-2.5 text-right text-sm text-amber-950 font-black">
                              {formatRupiah(totalTemporaryWagesExpense)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                {/* Concrete Castings Summary Table in Project Summary */}
                {(activeProject.concreteCastings || []).length > 0 && (
                  <div className="pt-4 border-t border-stone-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-sky-600" />
                        <h3 className="text-sm font-bold text-stone-800">
                          Rincian Cor Ready-Mix (Jayamix) & Sewa Pompa ({activeProject.projectName})
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('casting')}
                        className="text-xs font-bold text-sky-700 hover:text-sky-800 flex items-center gap-1"
                      >
                        Kelola di Tab Cor Jayamix & Pompa &rarr;
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-stone-200 bg-stone-50 text-stone-600 font-bold">
                            <th className="p-2.5">Tanggal</th>
                            <th className="p-2.5">Bagian Cor</th>
                            <th className="p-2.5">Vendor & Mutu</th>
                            <th className="p-2.5">Volume (m³)</th>
                            <th className="p-2.5">Biaya Beton</th>
                            <th className="p-2.5">Sewa Pompa</th>
                            <th className="p-2.5 text-center">Status</th>
                            <th className="p-2.5 text-right">Grand Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 font-medium">
                          {(activeProject.concreteCastings || []).map((c) => (
                            <tr key={c.id} className="hover:bg-stone-50">
                              <td className="p-2.5 whitespace-nowrap">{c.date}</td>
                              <td className="p-2.5 font-bold text-stone-900">{c.castingSection}</td>
                              <td className="p-2.5 text-sky-900 font-semibold">{c.vendorName} ({c.concreteQuality})</td>
                              <td className="p-2.5">{c.volumeM3} m³</td>
                              <td className="p-2.5">{formatRupiah(c.totalConcreteCost)}</td>
                              <td className="p-2.5">{formatRupiah(c.totalPumpCost)}</td>
                              <td className="p-2.5 text-center">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  c.isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                }`}>
                                  {c.isPaid ? 'Lunas' : 'Belum Bayar'}
                                </span>
                              </td>
                              <td className="p-2.5 text-right font-black text-stone-900">
                                {formatRupiah(c.grandTotal)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t-2 border-stone-200 bg-sky-50/50 font-black">
                            <td colSpan={7} className="p-2.5 text-right uppercase text-sky-900">
                              Total Biaya Cor Jayamix & Sewa Pompa:
                            </td>
                            <td className="p-2.5 text-right text-sm text-sky-950 font-black">
                              {formatRupiah(totalConcreteExpense)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 5: Catatan Kasbon Pegawai (Murni & Terpotong Otomatis) */}
            {activeTab === 'kasbon' && (
              <KasbonSection
                kasbonList={store.kasbonList || []}
                activeProject={activeProject}
                allProjects={store.projects}
                onAddKasbon={handleAddKasbon}
                onUpdateKasbon={handleUpdateKasbon}
                onDeleteKasbon={handleDeleteKasbon}
                onAddPayment={handleAddKasbonPayment}
                onDeletePayment={handleDeleteKasbonPayment}
              />
            )}
          </>
        )}
      </main>

      {/* Modal Manage Workers for Active Project */}
      <WorkersModal
        isOpen={isWorkersModalOpen}
        onClose={() => setIsWorkersModalOpen(false)}
        workers={activeProject.workers}
        onSaveWorkers={handleSaveWorkersList}
      />

      {/* Modal Print Slip Gaji for Active Project */}
      <PrintSlipModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        saturdayDate={printSaturdayDate}
        projectName={activeProject.projectName}
        workers={activeProject.workers}
        attendance={activeProject.attendance}
      />

      {/* Modal Pasang di HP Android / Buat APK */}
      <AndroidApkModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
      />

      {/* Modal Ekspor & Berbagi Antar Partner Kerja (Link, WA, Kode, JSON) */}
      <ShareSyncModal
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false);
          setIncomingImportData(null);
        }}
        store={store}
        activeProject={activeProject}
        onApplyStore={handleApplyImportedStore}
        onApplySingleProject={handleApplySingleProject}
        initialImportData={incomingImportData}
      />
    </div>
  );
}
