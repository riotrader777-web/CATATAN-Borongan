import React, { useState, useEffect } from 'react';
import { 
  RotateCcw, 
  AlertTriangle, 
  X, 
  Download, 
  Users, 
  Calendar, 
  Receipt, 
  Building2, 
  CheckSquare, 
  Square,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { ProjectData } from '../types';
import { formatRupiah, calculateDayWage, getTodayDateString } from '../utils/formatters';

interface ResetProjectModalProps {
  isOpen: boolean;
  project: ProjectData | null;
  onClose: () => void;
  onConfirmReset: (projectId: string, keepWorkers: boolean, newProjectName: string) => void;
}

export const ResetProjectModal: React.FC<ResetProjectModalProps> = ({
  isOpen,
  project,
  onClose,
  onConfirmReset,
}) => {
  const [keepWorkers, setKeepWorkers] = useState<boolean>(true);
  const [newProjectName, setNewProjectName] = useState<string>('');
  const [hasDownloadedBackup, setHasDownloadedBackup] = useState<boolean>(false);
  const [isConfirmStep, setIsConfirmStep] = useState<boolean>(false);

  useEffect(() => {
    if (project) {
      setNewProjectName(`Proyek ${project.projectNumber}`);
      setKeepWorkers(true);
      setHasDownloadedBackup(false);
      setIsConfirmStep(false);
    }
  }, [project, isOpen]);

  if (!isOpen || !project) return null;

  // Calculate project statistics for confirmation insight
  let wages = 0;
  const wageMap = new Map<string, number>();
  project.workers.forEach((w) => wageMap.set(w.id, w.dailyWage));

  Object.values(project.attendance || {}).forEach((dayRecords) => {
    Object.entries(dayRecords).forEach(([workerId, rec]) => {
      const base = wageMap.get(workerId) || 0;
      wages += calculateDayWage(rec.status, base, rec.customWage);
    });
  });

  const temporaryWages = (project.temporaryWorkers || []).reduce((s, t) => s + t.totalAmount, 0);
  const concreteCost = (project.concreteCastings || []).reduce((s, c) => s + c.grandTotal, 0);
  const expenses = (project.expenses || []).reduce((s, e) => s + e.amount, 0);
  const totalSpent = wages + temporaryWages + concreteCost + expenses;
  const attendanceDaysCount = Object.keys(project.attendance || {}).length;

  const handleDownloadBackup = () => {
    try {
      const jsonStr = JSON.stringify(project, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeName = (project.projectName || `proyek-${project.projectNumber}`).replace(/\s+/g, '-').toLowerCase();
      a.download = `arsip-${safeName}-${getTodayDateString()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setHasDownloadedBackup(true);
    } catch (e) {
      console.error('Failed to download project backup', e);
    }
  };

  const handleExecuteReset = () => {
    onConfirmReset(project.id, keepWorkers, newProjectName.trim() || `Proyek ${project.projectNumber}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-rose-700 p-4 sm:p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <RotateCcw className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight leading-tight">
                Reset Proyek Selesai
              </h3>
              <p className="text-xs text-rose-100 mt-0.5">
                Kosongkan data untuk dipakai proyek baru (Slot #{project.projectNumber})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Project Identity & Current Stats Box */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 text-xs text-stone-700 space-y-2">
            <div className="flex items-center justify-between border-b border-stone-200/80 pb-2">
              <span className="font-extrabold text-stone-900 text-sm flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-amber-600" />
                {project.projectName || `Proyek ${project.projectNumber}`}
              </span>
              <span className="px-2 py-0.5 bg-stone-200 text-stone-800 rounded font-bold text-[10px]">
                Slot {project.projectNumber} dari 5
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
              <div>
                <span className="text-stone-400 block">Owner Proyek:</span>
                <span className="font-bold text-stone-800">{project.ownerName || 'Belum diisi'}</span>
              </div>
              <div>
                <span className="text-stone-400 block">Nilai Deal Owner:</span>
                <span className="font-bold text-stone-800">{formatRupiah(project.ownerDealAmount || 0)}</span>
              </div>
              <div>
                <span className="text-stone-400 block">Total Pengeluaran:</span>
                <span className="font-bold text-red-700">{formatRupiah(totalSpent)}</span>
              </div>
              <div>
                <span className="text-stone-400 block">Hari Absensi Tercatat:</span>
                <span className="font-bold text-stone-800">{attendanceDaysCount} hari kerja</span>
              </div>
            </div>
          </div>

          {/* Backup Action Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-amber-950 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                Simpan Arsip Proyek (Sangat Disarankan)
              </span>
              <p className="text-[11px] text-amber-800">
                Unduh file arsip sebelum reset agar riwayat data proyek yang selesai tidak hilang jika sewaktu-waktu dibutuhkan.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadBackup}
              className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition shrink-0 ${
                hasDownloadedBackup
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
              }`}
            >
              {hasDownloadedBackup ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Arsip Terunduh
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Unduh Arsip .JSON
                </>
              )}
            </button>
          </div>

          {/* Configuration Options */}
          <div className="space-y-3 pt-1">
            <label className="block text-xs font-bold text-stone-800">
              Nama untuk Proyek Baru:
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder={`Proyek ${project.projectNumber} (atau cth: Rumah Pak Bambang)`}
                className="mt-1 w-full px-3 py-2 text-xs font-medium border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              />
            </label>

            {/* Checkbox: Keep workers list */}
            <div 
              onClick={() => setKeepWorkers(!keepWorkers)}
              className="flex items-start gap-2.5 p-3 rounded-xl border border-stone-200 bg-stone-50/70 hover:bg-stone-50 cursor-pointer transition select-none"
            >
              <div className="pt-0.5 text-amber-600">
                {keepWorkers ? (
                  <CheckSquare className="w-4 h-4 fill-amber-600 text-white" />
                ) : (
                  <Square className="w-4 h-4 text-stone-400" />
                )}
              </div>
              <div className="text-xs">
                <span className="font-bold text-stone-900 block">
                  Pertahankan Daftar Karyawan ({project.workers.length} Orang)
                </span>
                <span className="text-[11px] text-stone-500 leading-relaxed block mt-0.5">
                  Centang ini jika tim tukang/kenek di proyek berikutnya masih orang yang sama. Nama & tarif harian akan disimpan, hanya absensi dan gajinya yang dikosongkan.
                </span>
              </div>
            </div>
          </div>

          {/* Warning Confirmation Notice */}
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-950">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong>Perhatian:</strong> Seluruh catatan absensi, termin owner, gaji mingguan, pekerja cor, belanja nota, dan mutasi saldo pada <strong>{project.projectName}</strong> akan dikosongkan. Proyek lainnya (1–5) serta catatan buku kasbon tetap aman.
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-stone-50 p-4 border-t border-stone-200 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-stone-700 bg-white hover:bg-stone-100 border border-stone-300 rounded-xl transition"
          >
            Batal
          </button>

          {!isConfirmStep ? (
            <button
              type="button"
              onClick={() => setIsConfirmStep(true)}
              className="px-4 py-2 text-xs font-black text-white bg-red-600 hover:bg-red-700 rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs"
            >
              <RotateCcw className="w-4 h-4" />
              Lanjut Reset Proyek
            </button>
          ) : (
            <button
              type="button"
              onClick={handleExecuteReset}
              className="px-4 py-2 text-xs font-black text-white bg-red-700 hover:bg-red-800 rounded-xl transition flex items-center justify-center gap-1.5 shadow-md animate-pulse"
            >
              <RotateCcw className="w-4 h-4" />
              Yakin, Kosongkan & Reset Sekarang
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
