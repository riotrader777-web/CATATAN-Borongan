import React, { useState } from 'react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  UserPlus, 
  Coins, 
  CheckCheck, 
  AlertCircle,
  Sparkles,
  Info,
  Search,
  Users,
  Trash2,
  Edit2,
  X,
  Check,
  Briefcase
} from 'lucide-react';
import { Worker, AttendanceRecord, AttendanceStatus, AttendanceMap } from '../types';
import { 
  formatRupiah, 
  formatIndonesianDate, 
  calculateDayWage, 
  parseNumberInput,
  getDayName,
  getTodayDateString 
} from '../utils/formatters';

interface DailyAttendanceSectionProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  workers: Worker[];
  onUpdateWorker: (workerId: string, updatedWorker: Partial<Worker>) => void;
  onAddWorker: (newWorker: { name: string; dailyWage: number; role?: string }) => void;
  onDeleteWorker: (workerId: string) => void;
  attendance: AttendanceMap;
  onUpdateAttendance: (date: string, workerId: string, record: AttendanceRecord) => void;
  onBatchUpdateAttendance: (date: string, status: AttendanceStatus) => void;
}

export const DailyAttendanceSection: React.FC<DailyAttendanceSectionProps> = ({
  selectedDate,
  onSelectDate,
  workers,
  onUpdateWorker,
  onAddWorker,
  onDeleteWorker,
  attendance,
  onUpdateAttendance,
  onBatchUpdateAttendance,
}) => {
  // Modal / Form state for Adding Worker
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newWorkerName, setNewWorkerName] = useState('');
  const [newWorkerWage, setNewWorkerWage] = useState('150000');
  const [newWorkerRole, setNewWorkerRole] = useState('Tukang');
  const [addError, setAddError] = useState('');

  // Editing state for an existing worker
  const [editingWorkerId, setEditingWorkerId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editWage, setEditWage] = useState('');
  const [editRole, setEditRole] = useState('');

  // Delete confirmation modal / state
  const [workerToDelete, setWorkerToDelete] = useState<Worker | null>(null);

  // Quick wage editing for a row
  const [quickWageWorkerId, setQuickWageWorkerId] = useState<string | null>(null);
  const [quickWageInput, setQuickWageInput] = useState('');

  // Filter and Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'H' | 'S' | 'A'>('all');

  // Date Navigation
  const changeDateByDays = (deltaDays: number) => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, m - 1, d, 12, 0, 0);
    date.setDate(date.getDate() + deltaDays);
    const ny = date.getFullYear();
    const nm = String(date.getMonth() + 1).padStart(2, '0');
    const nd = String(date.getDate()).padStart(2, '0');
    onSelectDate(`${ny}-${nm}-${nd}`);
  };

  const dayName = getDayName(selectedDate);
  const isSaturday = dayName === 'Sabtu';
  const isSunday = dayName === 'Minggu';
  const todayStr = getTodayDateString();
  const isToday = selectedDate === todayStr;

  const currentDayAttendance = attendance[selectedDate] || {};

  // Calculate daily totals based on actual existing workers
  let totalDailyWage = 0;
  let countH = 0;
  let countS = 0;
  let countA = 0;

  workers.forEach((worker) => {
    const record = currentDayAttendance[worker.id];
    const status = record?.status;
    const earned = calculateDayWage(status, worker.dailyWage, record?.customWage);
    totalDailyWage += earned;

    if (status === 'H') countH++;
    else if (status === 'S') countS++;
    else if (status === 'A') countA++;
  });

  const handleStatusClick = (worker: Worker, newStatus: AttendanceStatus) => {
    const current = currentDayAttendance[worker.id];
    onUpdateAttendance(selectedDate, worker.id, {
      status: newStatus,
      customWage: current?.customWage,
      note: current?.note,
    });
  };

  // Add Worker Submit
  const handleAddWorkerSubmit = (addAnother: boolean = false) => {
    if (!newWorkerName.trim()) {
      setAddError('Nama karyawan wajib diisi');
      return;
    }

    const wage = parseNumberInput(newWorkerWage);
    onAddWorker({
      name: newWorkerName.trim(),
      dailyWage: wage,
      role: newWorkerRole.trim() || 'Tukang',
    });

    if (addAnother) {
      setNewWorkerName('');
      setAddError('');
    } else {
      setIsAddModalOpen(false);
      setNewWorkerName('');
      setAddError('');
    }
  };

  // Start editing existing worker
  const handleOpenEdit = (worker: Worker) => {
    setEditingWorkerId(worker.id);
    setEditName(worker.name);
    setEditWage(String(worker.dailyWage || 0));
    setEditRole(worker.role || '');
  };

  // Save edit existing worker
  const handleSaveEdit = () => {
    if (!editingWorkerId) return;
    if (!editName.trim()) return;

    onUpdateWorker(editingWorkerId, {
      name: editName.trim(),
      dailyWage: parseNumberInput(editWage),
      role: editRole.trim(),
    });
    setEditingWorkerId(null);
  };

  // Quick wage inline save
  const handleSaveQuickWage = (workerId: string) => {
    const val = parseNumberInput(quickWageInput);
    onUpdateWorker(workerId, { dailyWage: val });
    setQuickWageWorkerId(null);
  };

  // Filter actual workers (only existing workers, no phantom empty rows!)
  const filteredWorkers = workers.filter((worker, index) => {
    const record = currentDayAttendance[worker.id];
    const status = record?.status;

    // Status filter
    if (statusFilter === 'H' && status !== 'H') return false;
    if (statusFilter === 'S' && status !== 'S') return false;
    if (statusFilter === 'A' && status !== 'A') return false;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const numMatch = `#${index + 1}`.includes(q) || String(index + 1) === q;
      const nameMatch = worker.name.toLowerCase().includes(q);
      const roleMatch = (worker.role || '').toLowerCase().includes(q);
      return numMatch || nameMatch || roleMatch;
    }

    return true;
  });

  return (
    <div id="daily-attendance-section" className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 md:p-6 mb-6">
      {/* Date Header & Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-stone-100 p-1 rounded-xl">
            <button
              id="prev-day-btn"
              onClick={() => changeDateByDays(-1)}
              className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-white rounded-lg transition"
              title="Hari Sebelumnya"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              id="next-day-btn"
              onClick={() => changeDateByDays(1)}
              className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-white rounded-lg transition"
              title="Hari Berikutnya"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="relative">
            <label htmlFor="select-date-input" className="sr-only">Pilih Tanggal</label>
            <input
              id="select-date-input"
              type="date"
              value={selectedDate}
              onChange={(e) => e.target.value && onSelectDate(e.target.value)}
              className="px-3 py-1.5 text-sm font-semibold bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            />
          </div>

          {!isToday && (
            <button
              id="goto-today-btn"
              onClick={() => onSelectDate(todayStr)}
              className="px-2.5 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl transition border border-amber-200"
            >
              Hari Ini
            </button>
          )}

          {isSaturday && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
              <Sparkles className="w-3.5 h-3.5" />
              Hari Sabtu (Tutup Buku Gaji)
            </span>
          )}

          {isSunday && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
              <Calendar className="w-3.5 h-3.5 text-rose-600" />
              Hari Minggu (Awal Periode Kerja)
            </span>
          )}
        </div>

        {/* Date Display */}
        <div className="text-left md:text-right">
          <h2 className="text-lg md:text-xl font-bold text-stone-900 flex items-center gap-2 md:justify-end">
            <Calendar className="w-5 h-5 text-amber-600" />
            {formatIndonesianDate(selectedDate)}
          </h2>
          <p className="text-xs text-stone-500">
            Pencatatan Absensi & Hitungan Gaji Harian Karyawan
          </p>
        </div>
      </div>

      {/* Daily Summary & Action Buttons */}
      <div className="mt-5 p-4 rounded-xl bg-stone-50 border border-stone-200 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Left: Total Hari Ini */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center font-black shadow-sm shrink-0">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Total Gaji Hari Ini ({dayName})
            </span>
            <div className="text-2xl font-black text-stone-900">
              {formatRupiah(totalDailyWage)}
            </div>
            <div className="flex items-center gap-2 text-xs text-stone-600 mt-0.5">
              <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {countH} Hadir (H)
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 font-medium text-amber-700">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                {countS} Setengah (S)
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 font-medium text-rose-600">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                {countA} Alfa (A)
              </span>
            </div>
            <div className="mt-1.5 text-[10.5px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md font-medium inline-flex items-center gap-1">
              <span>💡</span>
              <span>Input absensi tidak memotong saldo kas. Saldo baru terpotong saat Anda klik "Sudah Dibayar" di Rekap Sabtu.</span>
            </div>
          </div>
        </div>

        {/* Right: Quick Action Buttons + Tambah Karyawan */}
        <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-stone-200">
          <button
            id="add-worker-main-btn"
            onClick={() => {
              setAddError('');
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-black text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 rounded-xl transition shadow-xs"
            title="Tambah karyawan baru tanpa batasan kuota"
          >
            <UserPlus className="w-4 h-4" />
            + Tambah Karyawan
          </button>

          {workers.length > 0 && (
            <>
              <button
                id="batch-all-present-btn"
                onClick={() => onBatchUpdateAttendance(selectedDate, 'H')}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition shadow-xs"
                title="Tandai semua karyawan sebagai Hadir penuh"
              >
                <CheckCheck className="w-4 h-4 text-emerald-700" />
                Semua Hadir (H)
              </button>
              <button
                id="batch-all-absent-btn"
                onClick={() => onBatchUpdateAttendance(selectedDate, 'A')}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-600 bg-stone-200/80 hover:bg-stone-300 rounded-xl transition"
                title="Set semua karyawan menjadi Alfa / Libur hari ini"
              >
                <XCircle className="w-3.5 h-3.5" />
                Reset (A)
              </button>
            </>
          )}
        </div>
      </div>

      {/* Helper Legend & Instructions */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs bg-amber-50/70 border border-amber-200/70 rounded-xl p-3 text-amber-900">
        <div className="flex items-center gap-1.5">
          <Info className="w-4 h-4 text-amber-700 flex-shrink-0" />
          <span>
            <strong>Keterangan Absensi:</strong> 
            <span className="ml-1 text-emerald-800 font-semibold">H = Hadir (100%)</span>, 
            <span className="ml-1 text-amber-800 font-semibold">S = Setengah Hari (50%)</span>, 
            <span className="ml-1 text-rose-800 font-semibold">A = Alfa / Libur (Rp 0)</span>
          </span>
        </div>
        <div className="text-stone-700 font-bold bg-white/80 px-2.5 py-1 rounded-lg border border-amber-200">
          Total: {workers.length} Karyawan Terdaftar (Tanpa Batasan)
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="mt-5 p-3 bg-stone-50 rounded-xl border border-stone-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 md:max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama karyawan atau posisi..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 overflow-x-auto text-xs font-medium">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-md transition whitespace-nowrap ${
              statusFilter === 'all' ? 'bg-stone-800 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
            }`}
          >
            Semua ({workers.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('H')}
            className={`px-3 py-1 rounded-md transition whitespace-nowrap ${
              statusFilter === 'H' ? 'bg-emerald-600 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
            }`}
          >
            Hadir ({countH})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('S')}
            className={`px-3 py-1 rounded-md transition whitespace-nowrap ${
              statusFilter === 'S' ? 'bg-amber-500 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
            }`}
          >
            Setengah ({countS})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('A')}
            className={`px-3 py-1 rounded-md transition whitespace-nowrap ${
              statusFilter === 'A' ? 'bg-rose-600 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
            }`}
          >
            Alfa ({countA})
          </button>
        </div>
      </div>

      {/* Workers Attendance List */}
      <div className="mt-4 space-y-2.5">
        {workers.length === 0 ? (
          /* Empty State: No Workers Yet */
          <div className="text-center py-12 px-4 border-2 border-dashed border-amber-200 rounded-2xl bg-amber-50/30">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-stone-900">
              Belum Ada Karyawan Terdaftar
            </h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto mt-1 mb-5">
              Kolom kosong untuk karyawan yang belum ada sudah dihilangkan. Cukup klik tombol di bawah untuk menambahkan karyawan tanpa ada batasan jumlah!
            </p>
            <button
              onClick={() => {
                setAddError('');
                setIsAddModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
            >
              <UserPlus className="w-4 h-4" />
              + Tambah Karyawan Pertama
            </button>
          </div>
        ) : filteredWorkers.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-stone-200 rounded-xl text-xs text-stone-500 bg-stone-50/50">
            Tidak ada karyawan yang cocok dengan filter atau pencarian "{searchQuery}".
          </div>
        ) : (
          filteredWorkers.map((worker, index) => {
            const record = currentDayAttendance[worker.id];
            const currentStatus = record?.status;
            const dayWage = calculateDayWage(currentStatus, worker.dailyWage, record?.customWage);

            return (
              <div
                key={worker.id}
                id={`worker-row-${worker.id}`}
                className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                  currentStatus === 'H'
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : currentStatus === 'S'
                    ? 'bg-amber-50/40 border-amber-200'
                    : currentStatus === 'A'
                    ? 'bg-stone-50 border-stone-200'
                    : 'bg-white border-stone-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  {/* Worker Identity & Base Wage */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Index Number */}
                    <div className="w-8 h-8 rounded-lg bg-stone-200/80 text-stone-800 font-bold text-xs flex items-center justify-center shrink-0">
                      #{index + 1}
                    </div>

                    {/* Name & Role */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-stone-900 text-sm truncate">
                          {worker.name}
                        </span>
                        {worker.role && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                            {worker.role}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(worker)}
                          className="p-1 text-stone-400 hover:text-stone-700 transition"
                          title="Ubah nama atau tarif karyawan"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Wage per Day Display & Edit */}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-stone-500">
                          Tarif Gaji Pokok/Hari:
                        </span>
                        {quickWageWorkerId === worker.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={quickWageInput}
                              onChange={(e) => setQuickWageInput(e.target.value)}
                              placeholder="150000"
                              className="w-28 px-1.5 py-0.5 text-xs font-bold bg-white border border-amber-400 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveQuickWage(worker.id);
                                if (e.key === 'Escape') setQuickWageWorkerId(null);
                              }}
                            />
                            <button
                              onClick={() => handleSaveQuickWage(worker.id)}
                              className="px-2 py-0.5 text-[11px] font-bold bg-amber-600 text-white rounded hover:bg-amber-700"
                            >
                              OK
                            </button>
                            <button
                              onClick={() => setQuickWageWorkerId(null)}
                              className="px-1.5 py-0.5 text-[11px] text-stone-500 hover:text-stone-700"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setQuickWageWorkerId(worker.id);
                              setQuickWageInput(worker.dailyWage ? String(worker.dailyWage) : '');
                            }}
                            className="text-xs font-bold text-stone-800 hover:text-amber-700 underline decoration-dashed transition"
                            title="Klik untuk ubah nominal gaji pokok per hari"
                          >
                            {worker.dailyWage > 0 ? formatRupiah(worker.dailyWage) : '+ Set Gaji/Hari'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Attendance Selector Buttons & Earned Today */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-stone-200/60">
                    {/* Buttons H / S / A */}
                    <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl">
                      {/* H = Hadir */}
                      <button
                        onClick={() => handleStatusClick(worker, 'H')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                          currentStatus === 'H'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-stone-600 hover:text-stone-900 hover:bg-white/80'
                        }`}
                        title="H = Hadir Penuh (Gaji 100%)"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Hadir (H)
                      </button>

                      {/* S = Setengah Hari */}
                      <button
                        onClick={() => handleStatusClick(worker, 'S')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                          currentStatus === 'S'
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'text-stone-600 hover:text-stone-900 hover:bg-white/80'
                        }`}
                        title="S = Setengah Hari (Gaji 50%)"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        Setengah (S)
                      </button>

                      {/* A = Alfa */}
                      <button
                        onClick={() => handleStatusClick(worker, 'A')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                          currentStatus === 'A'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'text-stone-600 hover:text-stone-900 hover:bg-white/80'
                        }`}
                        title="A = Alfa / Libur (Gaji Rp 0)"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Alfa (A)
                      </button>
                    </div>

                    {/* Calculated Earned Today */}
                    <div className="text-right min-w-[100px]">
                      <div className="text-xs text-stone-400 font-medium">Gaji Hari Ini</div>
                      <div className={`text-base font-black ${
                        dayWage > 0 ? 'text-stone-900' : 'text-stone-400'
                      }`}>
                        {formatRupiah(dayWage)}
                      </div>
                    </div>

                    {/* Delete Worker Button */}
                    <button
                      type="button"
                      onClick={() => setWorkerToDelete(worker)}
                      className="p-1.5 text-stone-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Hapus karyawan ini dari proyek"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating or Bottom Quick Add Button */}
      {workers.length > 0 && (
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
          <span className="text-xs text-stone-400">
            Total {workers.length} karyawan aktif di proyek ini
          </span>
          <button
            onClick={() => {
              setAddError('');
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-200 transition"
          >
            <UserPlus className="w-3.5 h-3.5" />
            + Tambah Karyawan Lainnya
          </button>
        </div>
      )}

      {/* Modal: Tambah Karyawan Baru (Tanpa Batasan) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-stone-200 overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-amber-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">
                    Tambah Karyawan Baru
                  </h3>
                  <p className="text-xs text-stone-500">
                    Bebas tambahkan karyawan tanpa ada batasan jumlah
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <div className="p-5 space-y-4 text-xs">
              {addError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-1.5 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {addError}
                </div>
              )}

              {/* Nama Karyawan */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Nama Karyawan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newWorkerName}
                  onChange={(e) => {
                    setNewWorkerName(e.target.value);
                    if (addError) setAddError('');
                  }}
                  placeholder="Contoh: Pak Slamet, Budi, Agus..."
                  className="w-full px-3 py-2 text-sm font-semibold border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddWorkerSubmit(false);
                  }}
                />
              </div>

              {/* Tarif Gaji Pokok per Hari */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Tarif Gaji Pokok / Hari (Rp)
                </label>
                <input
                  type="text"
                  value={newWorkerWage}
                  onChange={(e) => setNewWorkerWage(e.target.value)}
                  placeholder="150000"
                  className="w-full px-3 py-2 text-sm font-bold border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />

                {/* Preset Chips */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <span className="text-[11px] text-stone-400">Pilihan cepat:</span>
                  {[100000, 120000, 130000, 150000, 170000, 200000].map((nominal) => (
                    <button
                      key={nominal}
                      type="button"
                      onClick={() => setNewWorkerWage(String(nominal))}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition ${
                        newWorkerWage === String(nominal)
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {nominal / 1000}rb
                    </button>
                  ))}
                </div>
              </div>

              {/* Posisi / Jabatan */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Posisi / Peran (Opsional)
                </label>
                <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                  {['Tukang', 'Kenek / Laden', 'Mandor', 'Tukang Besi', 'Tukang Kayu'].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setNewWorkerRole(role)}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition ${
                        newWorkerRole === role
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={newWorkerRole}
                  onChange={(e) => setNewWorkerRole(e.target.value)}
                  placeholder="Atau ketik peran lain..."
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-200 rounded-xl transition"
              >
                Batal
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAddWorkerSubmit(true)}
                  className="px-3.5 py-2 text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-xl transition"
                >
                  Simpan & Tambah Lagi
                </button>
                <button
                  type="button"
                  onClick={() => handleAddWorkerSubmit(false)}
                  className="px-4 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Simpan Karyawan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Karyawan */}
      {editingWorkerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-stone-200 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-stone-700" />
                <h3 className="font-bold text-stone-900 text-base">
                  Ubah Data Karyawan
                </h3>
              </div>
              <button
                onClick={() => setEditingWorkerId(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Nama Karyawan
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-semibold border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Tarif Gaji Pokok / Hari (Rp)
                </label>
                <input
                  type="text"
                  value={editWage}
                  onChange={(e) => setEditWage(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-bold border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  {[100000, 120000, 130000, 150000, 170000, 200000].map((nominal) => (
                    <button
                      key={nominal}
                      type="button"
                      onClick={() => setEditWage(String(nominal))}
                      className="px-2 py-0.5 rounded text-[11px] font-semibold border bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100"
                    >
                      {nominal / 1000}rb
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Posisi / Peran
                </label>
                <input
                  type="text"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  placeholder="Tukang, Kenek, Mandor..."
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingWorkerId(null)}
                className="px-3.5 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-200 rounded-xl transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-4 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition shadow-xs flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Delete Worker */}
      {workerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-stone-200 p-5">
            <div className="w-11 h-11 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-stone-900 text-base text-center">
              Hapus Karyawan?
            </h3>
            <p className="text-xs text-stone-500 text-center mt-1 mb-5">
              Apakah Anda yakin ingin menghapus <strong>{workerToDelete.name}</strong> dari daftar karyawan proyek ini?
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setWorkerToDelete(null)}
                className="flex-1 py-2 text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteWorker(workerToDelete.id);
                  setWorkerToDelete(null);
                }}
                className="flex-1 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition shadow-xs"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
