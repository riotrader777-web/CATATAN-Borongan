import React, { useState } from 'react';
import { 
  CircleDollarSign, 
  Users, 
  UtensilsCrossed, 
  ShoppingCart, 
  Wallet, 
  TrendingDown, 
  Edit3, 
  Check, 
  AlertCircle, 
  Building2, 
  FileText, 
  Phone, 
  Receipt, 
  HardHat, 
  Banknote, 
  Landmark, 
  Truck,
  ArrowRightLeft,
  RotateCcw
} from 'lucide-react';
import { ProjectData } from '../types';
import { formatRupiah, parseNumberInput } from '../utils/formatters';
import { calculateProjectCashFlow } from '../utils/cashFlow';
import { OwnerDealModal } from './OwnerDealModal';

interface FinancialSummaryProps {
  project: ProjectData;
  onUpdateProject: (updated: Partial<ProjectData>) => void;
  totalWagesExpense: number;
  totalKonsumsiExpense: number;
  totalOtherExpense: number;
  totalTemporaryWagesExpense?: number;
  totalConcreteExpense?: number;
  onNavigateToTab?: (tab: 'attendance' | 'saturday' | 'temporary' | 'expenses' | 'summary' | 'kasbon' | 'casting') => void;
  onOpenResetModal?: () => void;
}

export const FinancialSummary: React.FC<FinancialSummaryProps> = ({
  project,
  onUpdateProject,
  totalWagesExpense,
  totalKonsumsiExpense,
  totalOtherExpense,
  totalTemporaryWagesExpense = 0,
  totalConcreteExpense = 0,
  onNavigateToTab,
  onOpenResetModal,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempNameInput, setTempNameInput] = useState(project.projectName);
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);

  const ownerDealAmount = project.ownerDealAmount || 0;
  const totalItemsExpense = totalKonsumsiExpense + totalOtherExpense;
  const totalExpense = totalWagesExpense + totalTemporaryWagesExpense + totalItemsExpense + totalConcreteExpense;
  const remainingBudget = ownerDealAmount - totalExpense;
  const spentPercentage = ownerDealAmount > 0 
    ? Math.min(100, Math.round((totalExpense / ownerDealAmount) * 100)) 
    : 0;

  const totalTerminReceived = (project.ownerTermins || []).reduce((sum, t) => sum + t.amount, 0);
  const totalTerminCash = (project.ownerTermins || [])
    .filter((t) => t.paymentMethod === 'cash')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalTerminBank = (project.ownerTermins || [])
    .filter((t) => t.paymentMethod !== 'cash')
    .reduce((sum, t) => sum + t.amount, 0);
  const flow = calculateProjectCashFlow(project);

  const handleSaveName = () => {
    if (tempNameInput.trim()) {
      onUpdateProject({ projectName: tempNameInput.trim() });
    }
    setIsEditingName(false);
  };

  return (
    <div id="financial-summary-card" className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 md:p-6 mb-6">
      {/* Project Title & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-stone-100">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide bg-stone-100 text-stone-700 border border-stone-200 rounded-md">
                Proyek {project.projectNumber}
              </span>
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    id="project-name-input"
                    type="text"
                    value={tempNameInput}
                    onChange={(e) => setTempNameInput(e.target.value)}
                    placeholder="Nama Proyek (cth: Renovasi Rumah Pak Budi)"
                    className="px-2.5 py-1 text-base font-bold text-stone-900 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    autoFocus
                  />
                  <button
                    id="save-project-name-btn"
                    onClick={handleSaveName}
                    className="p-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
                    title="Simpan nama proyek"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <h1 className="text-xl md:text-2xl font-extrabold text-stone-900 tracking-tight">
                    {project.projectName || `Proyek ${project.projectNumber}`}
                  </h1>
                  <button
                    id="edit-project-name-btn"
                    onClick={() => {
                      setTempNameInput(project.projectName);
                      setIsEditingName(true);
                    }}
                    className="text-stone-400 hover:text-stone-700 p-1"
                    title="Ubah nama proyek"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-0.5 text-xs text-stone-500">
              {project.ownerName ? (
                <span className="font-medium text-stone-700 flex items-center gap-1">
                  Owner: <strong>{project.ownerName}</strong>
                  {project.ownerPhone && (
                    <span className="text-stone-400 font-normal">({project.ownerPhone})</span>
                  )}
                </span>
              ) : (
                <span>Owner: Belum diisi</span>
              )}
              {project.ownerDealNotes && (
                <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-[11px] font-medium border border-amber-200/60">
                  <FileText className="w-3 h-3 text-amber-600" />
                  Ada Catatan Deal
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Button & Status Indicator */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsDealModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl transition shadow-2xs"
            title="Kelola Deal, Tarik Tunai & Riwayat Termin Owner"
          >
            <Receipt className="w-4 h-4 text-amber-700" />
            Deal Owner & Tarik Tunai
          </button>

          {onOpenResetModal && (
            <button
              onClick={onOpenResetModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-stone-600 bg-stone-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 border border-stone-200 rounded-xl transition shadow-2xs"
              title="Reset data proyek ini jika sudah selesai untuk digunakan kembali"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
              Reset Proyek Selesai
            </button>
          )}

          {ownerDealAmount === 0 ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              <AlertCircle className="w-3.5 h-3.5" />
              Isi Nilai Deal
            </span>
          ) : remainingBudget < 0 ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 animate-pulse">
              <AlertCircle className="w-3.5 h-3.5" />
              Defisit / Boncos
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <Check className="w-3.5 h-3.5" />
              Anggaran Aman
            </span>
          )}
        </div>
      </div>

      {/* 6 Key Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 gap-3 mt-5">
        {/* Metric 1: Deal dari Owner */}
        <div className="bg-stone-50 rounded-xl p-3 border border-stone-200/80 relative flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                <CircleDollarSign className="w-3.5 h-3.5 text-stone-600" />
                Deal Owner
              </span>
              <button
                onClick={() => setIsDealModalOpen(true)}
                className="text-[10px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-0.5"
                title="Buka Catatan & Termin Deal"
              >
                <Edit3 className="w-3 h-3" />
                Detail
              </button>
            </div>
            <p className="text-base sm:text-lg font-black text-stone-900 tracking-tight">
              {formatRupiah(ownerDealAmount)}
            </p>
            {ownerDealAmount > 0 && (
              <div className="flex flex-col gap-1 mt-1.5 text-[9px] font-bold">
                <div className="flex items-center justify-between text-blue-900 bg-blue-50/90 px-1.5 py-0.5 rounded border border-blue-200">
                  <span className="flex items-center gap-0.5">🏦 Sisa Rekening:</span>
                  <span>{formatRupiah(flow.remainingBank)}</span>
                </div>
                <div className={`flex items-center justify-between px-1.5 py-0.5 rounded border ${
                  flow.remainingCash < 0 
                    ? 'text-red-900 bg-red-50 border-red-200' 
                    : 'text-emerald-900 bg-emerald-50/90 border-emerald-200'
                }`}>
                  <span className="flex items-center gap-0.5">💵 Sisa Cash:</span>
                  <span>{formatRupiah(flow.remainingCash)}</span>
                </div>
              </div>
            )}
          </div>
          <div className="mt-2 pt-1.5 border-t border-stone-200/60 text-[10px] text-stone-500">
            {totalTerminReceived > 0 ? (
              <div>
                <span className="text-emerald-700 font-semibold truncate block">
                  Masuk: {formatRupiah(totalTerminReceived)}
                </span>
                <span className="text-[9px] text-stone-400 block truncate font-medium">
                  🏦 {formatRupiah(totalTerminBank)} | 💵 {formatRupiah(totalTerminCash)}
                </span>
              </div>
            ) : (
              <span>Belum ada termin</span>
            )}
          </div>
        </div>

        {/* Metric 2: Pengeluaran Gaji Pegawai */}
        <div className="bg-stone-50 rounded-xl p-3 border border-stone-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                Gaji Karyawan
              </span>
              <span className="text-[9px] text-blue-700 font-bold bg-blue-50 px-1 py-0.2 rounded">
                Mingguan
              </span>
            </div>
            <p className="text-base sm:text-lg font-black text-blue-900 tracking-tight">
              {formatRupiah(totalWagesExpense)}
            </p>
            <div className="flex flex-col gap-0.5 mt-1 text-[9px]">
              <span className="text-emerald-700 font-bold">
                ✓ Lunas Potong Kas: {formatRupiah(flow.totalPaidWages)}
              </span>
              {flow.accruedUnpaidWages > 0 && (
                <span className="text-amber-800 font-semibold">
                  ⏳ Berjalan: {formatRupiah(flow.accruedUnpaidWages)}
                </span>
              )}
            </div>
          </div>
          <div className="mt-2 pt-1.5 border-t border-stone-200/60 text-[10px] text-stone-500 truncate">
            {flow.accruedUnpaidWages > 0 ? 'Belum potong kas sampai diklik bayar' : 'Seluruh gaji telah lunas dibayar'}
          </div>
        </div>

        {/* Metric 3: Upah Pekerja Sekali Pakai (Ngecor) */}
        <div className="bg-amber-50/70 rounded-xl p-3 border border-amber-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                <HardHat className="w-3.5 h-3.5 text-amber-600" />
                Pekerja Cor / Lepas
              </span>
              {onNavigateToTab && (
                <button
                  type="button"
                  onClick={() => onNavigateToTab('temporary')}
                  className="text-[9px] text-amber-700 font-bold bg-amber-100 hover:bg-amber-200 px-1 py-0.2 rounded transition"
                  title="Buka Catatan Pekerja Sekali Pakai"
                >
                  Kelola
                </button>
              )}
            </div>
            <p className="text-base sm:text-lg font-black text-amber-950 tracking-tight">
              {formatRupiah(totalTemporaryWagesExpense)}
            </p>
          </div>
          <div className="mt-2 pt-1.5 border-t border-amber-200/60 text-[10px] text-amber-800/80 truncate">
            Tenaga cabutan ngecor
          </div>
        </div>

        {/* Metric 4: Cor Jayamix & Sewa Pompa */}
        <div className="bg-sky-50/70 rounded-xl p-3 border border-sky-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-sky-900 uppercase tracking-wider flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-sky-700" />
                Jayamix & Pompa
              </span>
              {onNavigateToTab && (
                <button
                  type="button"
                  onClick={() => onNavigateToTab('casting')}
                  className="text-[9px] text-sky-800 font-bold bg-sky-100 hover:bg-sky-200 px-1 py-0.2 rounded transition"
                  title="Buka Catatan Cor Jayamix & Pompa"
                >
                  Kelola
                </button>
              )}
            </div>
            <p className="text-base sm:text-lg font-black text-sky-950 tracking-tight">
              {formatRupiah(totalConcreteExpense)}
            </p>
          </div>
          <div className="mt-2 pt-1.5 border-t border-sky-200/60 text-[10px] text-sky-800/80 truncate">
            Ready mix & sewa pompa
          </div>
        </div>

        {/* Metric 5: Pengeluaran Konsumsi (Kopi, Rokok, Makan) */}
        <div className="bg-stone-50 rounded-xl p-3 border border-stone-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                <UtensilsCrossed className="w-3.5 h-3.5 text-orange-600" />
                Biaya Konsumsi
              </span>
              <span className="text-[9px] text-orange-700 font-bold bg-orange-50 px-1 py-0.2 rounded">
                Logistik
              </span>
            </div>
            <p className="text-base sm:text-lg font-black text-orange-950 tracking-tight">
              {formatRupiah(totalKonsumsiExpense)}
            </p>
          </div>
          <div className="mt-2 pt-1.5 border-t border-stone-200/60 text-[10px] text-stone-500 truncate">
            Kopi, rokok, makan, es
          </div>
        </div>

        {/* Metric 5: Pengeluaran Material & Lainnya */}
        <div className="bg-stone-50 rounded-xl p-3 border border-stone-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                <ShoppingCart className="w-3.5 h-3.5 text-stone-600" />
                Material / Lain
              </span>
              <span className="text-[9px] text-stone-600 font-bold bg-stone-200/70 px-1 py-0.2 rounded">
                Operasional
              </span>
            </div>
            <p className="text-base sm:text-lg font-black text-stone-800 tracking-tight">
              {formatRupiah(totalOtherExpense)}
            </p>
          </div>
          <div className="mt-2 pt-1.5 border-t border-stone-200/60 text-[10px] text-stone-500 truncate">
            Paku, kawat, bensin
          </div>
        </div>

        {/* Metric 6: Sisa Saldo / Profit Mandor */}
        <div className={`rounded-xl p-3 border flex flex-col justify-between ${
          remainingBudget < 0 
            ? 'bg-red-50/90 border-red-200 text-red-950' 
            : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                remainingBudget < 0 ? 'text-red-700' : 'text-emerald-700'
              }`}>
                <Wallet className="w-3.5 h-3.5" />
                Profit Mandor
              </span>
              <span className={`text-[9px] font-bold px-1 py-0.2 rounded ${
                remainingBudget < 0 ? 'bg-red-200 text-red-900' : 'bg-emerald-200 text-emerald-900'
              }`}>
                {ownerDealAmount > 0 ? `${100 - spentPercentage}% Sisa` : '0%'}
              </span>
            </div>
            <p className={`text-base sm:text-lg font-black tracking-tight ${
              remainingBudget < 0 ? 'text-red-700' : 'text-emerald-800'
            }`}>
              {formatRupiah(remainingBudget)}
            </p>
          </div>
          <div className="mt-2 pt-1.5 border-t border-stone-200/60 text-[10px] text-stone-600 truncate">
            {remainingBudget < 0 ? 'Defisit / Boncos!' : 'Sisa deal bersih'}
          </div>
        </div>
      </div>

      {/* Real-time Dompet Kas Proyek: Potongan Otomatis Uang Cash vs Rekening */}
      {ownerDealAmount > 0 && (
        <div className="mt-4 p-3.5 sm:p-4 rounded-xl border bg-linear-to-r from-emerald-50/70 via-white to-blue-50/70 border-stone-200 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-200/70">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shadow-2xs">
                <Banknote className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-black text-stone-900 flex items-center gap-1.5">
                  Dompet Kas Proyek (Uang Cash Terpotong Otomatis)
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Real-time
                  </span>
                </span>
                <p className="text-[11px] text-stone-500">
                  Uang cash di tangan berkurang saat Anda menandai gaji "Sudah Dibayar" & belanja cash/operasional.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsDealModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition self-start sm:self-auto shadow-2xs"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-amber-700" />
              Tarik Tunai / Kelola Kas
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-3">
            {/* Box 1: Uang Cash di Tangan */}
            <div className={`p-3 rounded-xl border ${
              flow.remainingCash < 0 
                ? 'bg-red-50 border-red-300 text-red-950' 
                : 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-black flex items-center gap-1">
                  <Banknote className="w-3.5 h-3.5 text-emerald-700" />
                  Sisa Uang Cash di Tangan
                </span>
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                  flow.remainingCash < 0 ? 'bg-red-200 text-red-900' : 'bg-emerald-200 text-emerald-900'
                }`}>
                  {flow.remainingCash < 0 ? 'Cash Kurang / Minus' : 'Tersedia Fisik'}
                </span>
              </div>
              <div className={`text-lg font-black tracking-tight ${
                flow.remainingCash < 0 ? 'text-red-700' : 'text-emerald-900'
              }`}>
                {formatRupiah(flow.remainingCash)}
              </div>
              <div className="mt-1.5 pt-1.5 border-t border-emerald-200/60 text-[10px] space-y-0.5 text-stone-600">
                <div className="flex justify-between">
                  <span>Alokasi Cash Awal:</span>
                  <span className="font-bold text-stone-800">{formatRupiah(flow.dealCash)}</span>
                </div>
                <div className="flex justify-between text-red-700">
                  <span>Terpotong Gaji Lunas:</span>
                  <span className="font-bold">-{formatRupiah(flow.cashWagesSpent + flow.cashTemporaryWagesSpent)}</span>
                </div>
                <div className="flex justify-between text-red-700">
                  <span>Terpotong Belanja:</span>
                  <span className="font-bold">-{formatRupiah(flow.cashExpensesSpent + flow.cashConcreteSpent)}</span>
                </div>
                {flow.accruedUnpaidWages > 0 && (
                  <div className="flex justify-between text-amber-700 bg-amber-100/60 px-1 py-0.5 rounded font-medium">
                    <span>Gaji Berjalan (Belum Lunas):</span>
                    <span>{formatRupiah(flow.accruedUnpaidWages)} (blm potong)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Box 2: Saldo di Rekening Bank */}
            <div className="p-3 rounded-xl border bg-blue-50/80 border-blue-300 text-blue-950">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-black flex items-center gap-1">
                  <Landmark className="w-3.5 h-3.5 text-blue-700" />
                  Sisa Saldo di Rekening
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-200 text-blue-900">
                  Bank / Transfer
                </span>
              </div>
              <div className="text-lg font-black text-blue-900 tracking-tight">
                {formatRupiah(flow.remainingBank)}
              </div>
              <div className="mt-1.5 pt-1.5 border-t border-blue-200/60 text-[10px] space-y-0.5 text-stone-600">
                <div className="flex justify-between">
                  <span>Alokasi Rekening:</span>
                  <span className="font-bold text-stone-800">{formatRupiah(flow.dealBank)}</span>
                </div>
                <div className="flex justify-between text-blue-800">
                  <span>Terpotong Transfer:</span>
                  <span className="font-bold">-{formatRupiah(flow.totalBankSpent)}</span>
                </div>
              </div>
            </div>

            {/* Box 3: Total Sisa Kas Bersih Proyek */}
            <div className="p-3 rounded-xl border bg-stone-100/90 border-stone-300 text-stone-900 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-black flex items-center gap-1 text-stone-800">
                  <Wallet className="w-3.5 h-3.5 text-amber-600" />
                  Total Sisa Kas Proyek
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-stone-200 text-stone-700">
                  Cash + Rekening
                </span>
              </div>
              <div className="text-lg font-black text-stone-950 tracking-tight">
                {formatRupiah(flow.totalRemaining)}
              </div>
              <div className="mt-1.5 pt-1.5 border-t border-stone-200 text-[10px] space-y-0.5 text-stone-600">
                <div className="flex justify-between">
                  <span>Total Nilai Deal:</span>
                  <span className="font-bold text-stone-800">{formatRupiah(flow.dealAmount)}</span>
                </div>
                <div className="flex justify-between text-red-700">
                  <span>Total Seluruh Biaya:</span>
                  <span className="font-bold">-{formatRupiah(flow.totalAllSpent)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Multi-category Progress Bar */}
      {ownerDealAmount > 0 && (
        <div className="mt-5 pt-4 border-t border-stone-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1 mb-1.5">
            <span className="text-stone-500 font-medium flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5 text-stone-600" />
              Total Terpotong: <strong className="text-stone-900">{formatRupiah(totalExpense)}</strong> ({spentPercentage}%)
            </span>
            <span className="text-stone-500 font-medium">
              Target Deal: <strong className="text-stone-900">{formatRupiah(ownerDealAmount)}</strong>
            </span>
          </div>

          <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden flex">
            {/* Gaji portion (Blue) */}
            <div
              style={{ width: `${Math.min(100, (totalWagesExpense / ownerDealAmount) * 100)}%` }}
              className="bg-blue-600 transition-all duration-300"
              title={`Gaji Karyawan: ${formatRupiah(totalWagesExpense)}`}
            />
            {/* Pekerja Sekali Pakai / Cor portion (Amber) */}
            <div
              style={{ width: `${Math.min(100 - (totalWagesExpense / ownerDealAmount) * 100, (totalTemporaryWagesExpense / ownerDealAmount) * 100)}%` }}
              className="bg-amber-500 transition-all duration-300"
              title={`Pekerja Cor / Lepas: ${formatRupiah(totalTemporaryWagesExpense)}`}
            />
            {/* Cor Jayamix & Pompa portion (Sky Blue) */}
            <div
              style={{ width: `${Math.min(100 - ((totalWagesExpense + totalTemporaryWagesExpense) / ownerDealAmount) * 100, (totalConcreteExpense / ownerDealAmount) * 100)}%` }}
              className="bg-sky-600 transition-all duration-300"
              title={`Cor Jayamix & Pompa: ${formatRupiah(totalConcreteExpense)}`}
            />
            {/* Konsumsi portion (Orange) */}
            <div
              style={{ width: `${Math.min(100 - ((totalWagesExpense + totalTemporaryWagesExpense + totalConcreteExpense) / ownerDealAmount) * 100, (totalKonsumsiExpense / ownerDealAmount) * 100)}%` }}
              className="bg-orange-500 transition-all duration-300"
              title={`Konsumsi: ${formatRupiah(totalKonsumsiExpense)}`}
            />
            {/* Material & Lainnya portion (Stone/Slate) */}
            <div
              style={{ width: `${Math.min(100 - ((totalWagesExpense + totalTemporaryWagesExpense + totalConcreteExpense + totalKonsumsiExpense) / ownerDealAmount) * 100, (totalOtherExpense / ownerDealAmount) * 100)}%` }}
              className="bg-stone-500 transition-all duration-300"
              title={`Material / Lainnya: ${formatRupiah(totalOtherExpense)}`}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between text-[11px] text-stone-500 mt-1.5 gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                Gaji ({Math.round((totalWagesExpense / (ownerDealAmount || 1)) * 100)}%)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                Cor Lepas ({Math.round((totalTemporaryWagesExpense / (ownerDealAmount || 1)) * 100)}%)
              </span>
              {totalConcreteExpense > 0 && (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-sky-600 inline-block" />
                  Jayamix ({Math.round((totalConcreteExpense / (ownerDealAmount || 1)) * 100)}%)
                </span>
              )}
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
                Konsumsi ({Math.round((totalKonsumsiExpense / (ownerDealAmount || 1)) * 100)}%)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-stone-500 inline-block" />
                Material ({Math.round((totalOtherExpense / (ownerDealAmount || 1)) * 100)}%)
              </span>
            </div>
            <span className="font-semibold text-stone-700">
              {remainingBudget >= 0 
                ? `Profit Bersih: ${formatRupiah(remainingBudget)}` 
                : `Defisit: ${formatRupiah(Math.abs(remainingBudget))}`}
            </span>
          </div>
        </div>
      )}

      {/* Modal Detail Deal & Termin */}
      <OwnerDealModal
        isOpen={isDealModalOpen}
        onClose={() => setIsDealModalOpen(false)}
        project={project}
        onUpdateProject={onUpdateProject}
      />
    </div>
  );
};
