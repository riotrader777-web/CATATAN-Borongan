import React, { useState } from 'react';
import { 
  X, 
  CircleDollarSign, 
  Plus, 
  Trash2, 
  Calendar, 
  FileText, 
  User, 
  Phone, 
  CheckCircle2, 
  Clock,
  Building2,
  Receipt,
  Banknote,
  Landmark,
  CreditCard,
  ArrowRightLeft,
  ArrowRight,
  ArrowDown,
  Sparkles,
  PieChart,
  Info,
  Check,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { OwnerTermin, ProjectData, TerminPaymentMethod, CashTransferRecord, CashTransferType } from '../types';
import { formatRupiah, formatIndonesianDate, parseNumberInput, getTodayDateString } from '../utils/formatters';
import { calculateProjectCashFlow } from '../utils/cashFlow';

interface OwnerDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectData;
  onUpdateProject: (updated: Partial<ProjectData>) => void;
}

export const OwnerDealModal: React.FC<OwnerDealModalProps> = ({
  isOpen,
  onClose,
  project,
  onUpdateProject,
}) => {
  if (!isOpen) return null;

  // Initialize total deal, cash, and bank
  const initialTotal = project.ownerDealAmount || 0;
  const initialCash = project.ownerDealCash ?? 0;
  const initialBank = project.ownerDealBank !== undefined && project.ownerDealBank !== null 
    ? project.ownerDealBank 
    : Math.max(0, initialTotal - initialCash);

  const [dealAmountInput, setDealAmountInput] = useState<string>(
    initialTotal > 0 ? String(initialTotal) : ''
  );
  const [dealCashInput, setDealCashInput] = useState<string>(
    initialCash > 0 ? String(initialCash) : (initialTotal > 0 ? '0' : '')
  );
  const [dealBankInput, setDealBankInput] = useState<string>(
    initialBank > 0 ? String(initialBank) : (initialTotal > 0 ? String(initialTotal) : '')
  );

  const [ownerName, setOwnerName] = useState<string>(project.ownerName || '');
  const [ownerPhone, setOwnerPhone] = useState<string>(project.ownerPhone || '');
  const [dealNotes, setDealNotes] = useState<string>(project.ownerDealNotes || '');

  // Fitur Tarik Tunai / Pindah Saldo State
  const [transferType, setTransferType] = useState<CashTransferType>('tarik_tunai');
  const [transferAmountInput, setTransferAmountInput] = useState<string>('');
  const [transferDate, setTransferDate] = useState<string>(getTodayDateString());
  const [transferNote, setTransferNote] = useState<string>('');
  const [transferSuccessMessage, setTransferSuccessMessage] = useState<string | null>(null);

  // Form tambah termin baru
  const [terminDate, setTerminDate] = useState<string>(getTodayDateString());
  const [terminTitle, setTerminTitle] = useState<string>('');
  const [terminAmountInput, setTerminAmountInput] = useState<string>('');
  const [terminPaymentMethod, setTerminPaymentMethod] = useState<TerminPaymentMethod>('transfer');
  const [terminNote, setTerminNote] = useState<string>('');

  const termins = project.ownerTermins || [];
  const cashTransfers = project.cashTransfers || [];
  const flow = calculateProjectCashFlow(project);

  // Termin breakdown calculation
  const totalReceivedCash = termins
    .filter((t) => t.paymentMethod === 'cash')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalReceivedBank = termins
    .filter((t) => t.paymentMethod !== 'cash')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalReceivedTermin = totalReceivedCash + totalReceivedBank;

  const currentDealCash = parseNumberInput(dealCashInput);
  const currentDealBank = parseNumberInput(dealBankInput);
  const currentDealAmount = parseNumberInput(dealAmountInput);

  const effectiveTotalDeal = currentDealAmount > 0 
    ? currentDealAmount 
    : (currentDealCash + currentDealBank);

  const sisaTagihan = Math.max(0, effectiveTotalDeal - totalReceivedTermin);
  const sisaCash = Math.max(0, currentDealCash - totalReceivedCash);
  const sisaBank = Math.max(0, currentDealBank - totalReceivedBank);

  // =========================================================================
  // HANDLERS: CONNECTED CASH & REKENING (NILAI DEAL TETAP)
  // =========================================================================

  /**
   * Mengubah Total Nilai Deal:
   * Menyesuaikan porsi bank secara otomatis berdasarkan sisa (Total - Cash).
   */
  const handleTotalDealChange = (val: string) => {
    setDealAmountInput(val);
    const newTotal = parseNumberInput(val);
    const currentCash = parseNumberInput(dealCashInput);

    if (newTotal === 0) {
      setDealCashInput('0');
      setDealBankInput('0');
    } else {
      const newCash = Math.min(currentCash, newTotal);
      const newBank = Math.max(0, newTotal - newCash);
      setDealCashInput(String(newCash));
      setDealBankInput(String(newBank));
    }
  };

  /**
   * Mengubah Nominal Dana Tunai / Cash (misal tarik tunai 30jt):
   * NILAI DEAL TETAP SAMA!
   * Dana tunai yang dimasukkan otomatis mengurangi saldo rekening (Rekening = Total - Cash).
   */
  const handleCashChange = (val: string) => {
    setDealCashInput(val);
    const enteredCash = parseNumberInput(val);
    const total = parseNumberInput(dealAmountInput);

    if (total > 0) {
      // Nilai deal tidak bertambah atau berkurang!
      // Jika cash dimasukkan 30jt pada deal 100jt, rekening otomatis 70jt.
      if (enteredCash <= total) {
        const remainingBank = total - enteredCash;
        setDealBankInput(String(remainingBank));
      } else {
        // Jika nominal cash lebih besar dari deal, batasi ke total deal
        setDealCashInput(String(total));
        setDealBankInput('0');
      }
    } else if (enteredCash > 0) {
      // Jika deal masih 0, inisialisasi total = enteredCash
      setDealAmountInput(String(enteredCash));
      setDealBankInput('0');
    }
  };

  /**
   * Mengubah Saldo di Rekening:
   * NILAI DEAL TETAP SAMA!
   * Saldo rekening yang dimasukkan otomatis menyesuaikan cash (Cash = Total - Rekening).
   */
  const handleBankChange = (val: string) => {
    setDealBankInput(val);
    const enteredBank = parseNumberInput(val);
    const total = parseNumberInput(dealAmountInput);

    if (total > 0) {
      // Nilai deal tidak bertambah atau berkurang!
      if (enteredBank <= total) {
        const remainingCash = total - enteredBank;
        setDealCashInput(String(remainingCash));
      } else {
        setDealBankInput(String(total));
        setDealCashInput('0');
      }
    } else if (enteredBank > 0) {
      setDealAmountInput(String(enteredBank));
      setDealCashInput('0');
    }
  };

  const handleSaveMainDetails = () => {
    let totalAmount = parseNumberInput(dealAmountInput);
    let cashAmount = parseNumberInput(dealCashInput);
    let bankAmount = parseNumberInput(dealBankInput);

    if (totalAmount > 0) {
      if (cashAmount + bankAmount !== totalAmount) {
        bankAmount = Math.max(0, totalAmount - cashAmount);
      }
    } else if (cashAmount + bankAmount > 0) {
      totalAmount = cashAmount + bankAmount;
    }

    onUpdateProject({
      ownerDealAmount: totalAmount,
      ownerDealCash: cashAmount,
      ownerDealBank: bankAmount,
      ownerName: ownerName.trim(),
      ownerPhone: ownerPhone.trim(),
      ownerDealNotes: dealNotes.trim(),
    });
  };

  const handlePresetAllBank = () => {
    const total = effectiveTotalDeal;
    setDealCashInput('0');
    setDealBankInput(String(total));
    setDealAmountInput(String(total));
  };

  const handlePresetAllCash = () => {
    const total = effectiveTotalDeal;
    setDealCashInput(String(total));
    setDealBankInput('0');
    setDealAmountInput(String(total));
  };

  const handlePresetSplitFifty = () => {
    const total = effectiveTotalDeal;
    const half = Math.floor(total / 2);
    setDealCashInput(String(half));
    setDealBankInput(String(total - half));
    setDealAmountInput(String(total));
  };

  // =========================================================================
  // FITUR TARIK TUNAI / PINDAH SALDO (ATM ⇄ CASH)
  // =========================================================================
  const handleExecuteTransfer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const amount = parseNumberInput(transferAmountInput);
    if (amount <= 0) return;

    const currentCash = parseNumberInput(dealCashInput);
    const currentBank = parseNumberInput(dealBankInput);
    const total = effectiveTotalDeal;

    let newCash = currentCash;
    let newBank = currentBank;

    if (transferType === 'tarik_tunai') {
      if (amount > currentBank) {
        alert(`Saldo Rekening tidak mencukupi untuk tarik tunai! Saldo saat ini: ${formatRupiah(currentBank)}.`);
        return;
      }
      newBank = currentBank - amount;
      newCash = currentCash + amount;
    } else {
      // setor_tunai
      if (amount > currentCash) {
        alert(`Uang tunai (Cash) tidak mencukupi untuk setor tunai! Cash saat ini: ${formatRupiah(currentCash)}.`);
        return;
      }
      newCash = currentCash - amount;
      newBank = currentBank + amount;
    }

    // Update state form
    setDealCashInput(String(newCash));
    setDealBankInput(String(newBank));
    setDealAmountInput(String(total));

    // Catat log mutasi transfer
    const newRecord: CashTransferRecord = {
      id: `transfer-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      date: transferDate || getTodayDateString(),
      type: transferType,
      amount,
      note: transferNote.trim() || (transferType === 'tarik_tunai' ? 'Tarik tunai dari rekening ke cash' : 'Setor tunai ke rekening'),
      createdAt: new Date().toISOString(),
    };

    const nextTransfers = [newRecord, ...cashTransfers];

    // Simpan langsung ke project
    onUpdateProject({
      ownerDealAmount: total,
      ownerDealCash: newCash,
      ownerDealBank: newBank,
      cashTransfers: nextTransfers,
    });

    const msg = transferType === 'tarik_tunai'
      ? `✅ Tarik tunai ${formatRupiah(amount)} sukses! Saldo Rekening kini ${formatRupiah(newBank)}, Cash kini ${formatRupiah(newCash)}. Total Deal TETAP ${formatRupiah(total)}.`
      : `✅ Setor tunai ${formatRupiah(amount)} sukses! Saldo Rekening kini ${formatRupiah(newBank)}, Cash kini ${formatRupiah(newCash)}. Total Deal TETAP ${formatRupiah(total)}.`;

    setTransferSuccessMessage(msg);
    setTransferAmountInput('');
    setTransferNote('');
    setTimeout(() => setTransferSuccessMessage(null), 6000);
  };

  const handleDeleteTransfer = (id: string) => {
    const nextTransfers = cashTransfers.filter((ct) => ct.id !== id);
    onUpdateProject({ cashTransfers: nextTransfers });
  };

  // =========================================================================
  // HANDLERS: RIWAYAT TERMIN MASUK DARI OWNER
  // =========================================================================
  const handleAddTermin = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseNumberInput(terminAmountInput);
    if (!terminTitle.trim() || amount <= 0) return;

    const newTermin: OwnerTermin = {
      id: `termin-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      date: terminDate || getTodayDateString(),
      title: terminTitle.trim(),
      amount,
      paymentMethod: terminPaymentMethod,
      note: terminNote.trim() || undefined,
    };

    const nextTermins = [...termins, newTermin].sort((a, b) => a.date.localeCompare(b.date));
    onUpdateProject({ ownerTermins: nextTermins });

    // Reset form termin
    setTerminTitle('');
    setTerminAmountInput('');
    setTerminNote('');
  };

  const handleDeleteTermin = (id: string) => {
    const nextTermins = termins.filter((t) => t.id !== id);
    onUpdateProject({ ownerTermins: nextTermins });
  };

  const quickTerminPresets = [
    'DP Awal (Uang Muka)',
    'Termin 1 (Pondasi & Struktur)',
    'Termin 2 (Dinding & Atap)',
    'Termin 3 (Finishing & Cat)',
    'Pelunasan Akhir (Retensi)',
  ];

  // Quick chips for transfer amount
  const transferAmountPresets = [1000000, 5000000, 10000000, 20000000, 30000000];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
              <CircleDollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
                Deal Owner: Tunai & Saldo Rekening Terhubung
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Sinkron Otomatis
                </span>
              </h2>
              <p className="text-xs text-stone-500">
                {project.projectName} - Tarik tunai memindahkan saldo tanpa mengubah total deal
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              handleSaveMainDetails();
              onClose();
            }}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition"
            title="Tutup & Simpan"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5">
          {/* Section 1: Nilai Deal & Sinkronisasi Saldo */}
          <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/80 pb-3">
              <div>
                <h3 className="text-xs font-extrabold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-amber-600" />
                  1. Nilai Kesepakatan Deal Borongan
                </h3>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Saldo Rekening dan Dana Tunai (Cash) terhubung erat ke Total Deal.
                </p>
              </div>
              
              {/* Quick Split Buttons */}
              <div className="flex items-center gap-1 text-[10px]">
                <span className="text-stone-400 font-medium">Bagi Cepat:</span>
                <button
                  type="button"
                  onClick={handlePresetAllBank}
                  className="px-2 py-0.5 font-bold rounded bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition"
                  title="Alokasikan seluruh deal ke Rekening"
                >
                  100% Rekening
                </button>
                <button
                  type="button"
                  onClick={handlePresetAllCash}
                  className="px-2 py-0.5 font-bold rounded bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition"
                  title="Alokasikan seluruh deal ke Tunai"
                >
                  100% Cash
                </button>
                <button
                  type="button"
                  onClick={handlePresetSplitFifty}
                  className="px-2 py-0.5 font-bold rounded bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 transition"
                  title="Bagi rata 50% Cash & 50% Rekening"
                >
                  50:50
                </button>
              </div>
            </div>

            {/* Split Input Grid: Cash vs Rekening vs Total */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* 1. Total Nilai Deal Borongan */}
              <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-300 sm:order-1">
                <label className="block text-[11px] font-black text-amber-950 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <CircleDollarSign className="w-3.5 h-3.5 text-amber-600" />
                    Total Nilai Deal (Rp)
                  </span>
                  <span className="text-[9px] bg-amber-200/70 text-amber-900 px-1.5 py-0.2 rounded font-bold">
                    Nilai Kontrak
                  </span>
                </label>
                <input
                  type="text"
                  value={dealAmountInput}
                  onChange={(e) => handleTotalDealChange(e.target.value)}
                  onBlur={handleSaveMainDetails}
                  placeholder="cth: 100.000.000"
                  className="w-full px-2.5 py-1.5 text-sm font-black bg-white border border-amber-300 rounded-lg text-amber-950 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <span className="text-[10px] text-amber-800 font-bold mt-1 block">
                  {formatRupiah(effectiveTotalDeal)}
                </span>
                <span className="text-[9px] text-stone-500 block">
                  = Rekening + Cash
                </span>
              </div>

              {/* 2. Saldo di Rekening / Bank Transfer */}
              <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-200 sm:order-2">
                <label className="block text-[11px] font-bold text-blue-900 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Landmark className="w-3.5 h-3.5 text-blue-600" />
                    Saldo di Rekening (Rp)
                  </span>
                  <span className="text-[10px] text-blue-700 font-normal">Transfer Bank</span>
                </label>
                <input
                  type="text"
                  value={dealBankInput}
                  onChange={(e) => handleBankChange(e.target.value)}
                  onBlur={handleSaveMainDetails}
                  placeholder="cth: 70.000.000"
                  className="w-full px-2.5 py-1.5 text-sm font-bold bg-white border border-blue-300 rounded-lg text-blue-950 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <span className="text-[10px] text-blue-700 font-bold mt-1 block">
                  {formatRupiah(currentDealBank)}
                </span>
                <span className="text-[9px] text-blue-600/80 block">
                  {effectiveTotalDeal > 0 ? `${((currentDealBank / effectiveTotalDeal) * 100).toFixed(0)}% dari deal` : 'Tersimpan di Bank'}
                </span>
              </div>

              {/* 3. Cash / Tunai */}
              <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200 sm:order-3">
                <label className="block text-[11px] font-bold text-emerald-900 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                    Dana Tunai / Cash (Rp)
                  </span>
                  <span className="text-[10px] text-emerald-700 font-normal">Di tangan mandor</span>
                </label>
                <input
                  type="text"
                  value={dealCashInput}
                  onChange={(e) => handleCashChange(e.target.value)}
                  onBlur={handleSaveMainDetails}
                  placeholder="cth: 30.000.000"
                  className="w-full px-2.5 py-1.5 text-sm font-bold bg-white border border-emerald-300 rounded-lg text-emerald-950 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <span className="text-[10px] text-emerald-700 font-bold mt-1 block">
                  {formatRupiah(currentDealCash)}
                </span>
                <span className="text-[9px] text-emerald-600/80 block">
                  {effectiveTotalDeal > 0 ? `${((currentDealCash / effectiveTotalDeal) * 100).toFixed(0)}% dari deal` : 'Pegang Tunai'}
                </span>
              </div>
            </div>

            {/* Terhubung Otomatis Banner Notice */}
            <div className="bg-white p-3 rounded-xl border border-stone-200 flex items-start gap-2.5 text-xs text-stone-600">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5 leading-relaxed">
                <p className="font-bold text-stone-800">
                  Hubungan Otomatis & Terkunci: Nilai Deal Tetap Sama
                </p>
                <p className="text-[11px] text-stone-500">
                  Jika Anda memasukkan nominal <strong>{formatRupiah(currentDealCash)}</strong> di Cash, nominal tersebut <strong>tidak menambah atau mengurangi nilai deal</strong>. Jumlah total tetap <strong>{formatRupiah(effectiveTotalDeal)}</strong>, tersimpan di tempat berbeda: <strong>{formatRupiah(currentDealBank)} di Rekening</strong> dan <strong>{formatRupiah(currentDealCash)} di Cash</strong>.
                </p>
              </div>
            </div>

            {/* Visual ratio bar */}
            {effectiveTotalDeal > 0 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold text-stone-500">
                  <span className="text-blue-700 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                    Rekening: {((currentDealBank / effectiveTotalDeal) * 100).toFixed(0)}% ({formatRupiah(currentDealBank)})
                  </span>
                  <span className="text-emerald-700 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    Cash di Tangan: {((currentDealCash / effectiveTotalDeal) * 100).toFixed(0)}% ({formatRupiah(currentDealCash)})
                  </span>
                </div>
                <div className="w-full bg-stone-200 rounded-full h-2.5 overflow-hidden flex shadow-inner">
                  <div 
                    className="bg-blue-600 h-full transition-all duration-300"
                    style={{ width: `${(currentDealBank / effectiveTotalDeal) * 100}%` }}
                    title={`Rekening: ${formatRupiah(currentDealBank)}`}
                  />
                  <div 
                    className="bg-emerald-500 h-full transition-all duration-300"
                    style={{ width: `${(currentDealCash / effectiveTotalDeal) * 100}%` }}
                    title={`Cash: ${formatRupiah(currentDealCash)}`}
                  />
                </div>
              </div>
            )}

            {/* Owner Contact Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-200/60">
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1 flex items-center gap-1">
                  <User className="w-3 h-3 text-stone-400" />
                  Nama Pemilik / Owner
                </label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  onBlur={handleSaveMainDetails}
                  placeholder="cth: Pak Budi Santoso"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-stone-400" />
                  No. Telepon / WA Owner
                </label>
                <input
                  type="text"
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  onBlur={handleSaveMainDetails}
                  placeholder="cth: 0812-3456-7890"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Catatan Kesepakatan Kontrak / Deal */}
            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-stone-400" />
                Catatan Khusus Kesepakatan Deal dari Owner
              </label>
              <textarea
                value={dealNotes}
                onChange={(e) => setDealNotes(e.target.value)}
                onBlur={handleSaveMainDetails}
                rows={2}
                placeholder="Tulis catatan kesepakatan borongan (misal: DP awal 20% diberikan tunai/cash saat mulai kerja, sisanya ditransfer ke rekening BCA mandor tiap hari Jumat...)"
                className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none leading-relaxed"
              />
            </div>
          </div>

          {/* Section 2: FITUR TARIK TUNAI / PINDAH SALDO CEPAT */}
          <div className="bg-linear-to-br from-blue-50/70 to-emerald-50/70 rounded-xl p-4 border border-blue-200/80 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-200/60 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-2xs">
                  <ArrowRightLeft className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                    2. Fitur Tarik Tunai & Setor Saldo (Pindah Kas Langsung)
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Ambil uang tunai di ATM / bank untuk pegangan operasional tanpa merusak nilai deal.
                  </p>
                </div>
              </div>

              {/* Mode Switcher */}
              <div className="flex items-center gap-1 p-0.5 bg-white border border-stone-300 rounded-lg self-start sm:self-auto shadow-2xs text-[11px]">
                <button
                  type="button"
                  onClick={() => setTransferType('tarik_tunai')}
                  className={`px-2.5 py-1 rounded-md font-bold transition flex items-center gap-1 ${
                    transferType === 'tarik_tunai'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Banknote className="w-3.5 h-3.5" />
                  Tarik Tunai (Rekening &rarr; Cash)
                </button>
                <button
                  type="button"
                  onClick={() => setTransferType('setor_tunai')}
                  className={`px-2.5 py-1 rounded-md font-bold transition flex items-center gap-1 ${
                    transferType === 'setor_tunai'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Landmark className="w-3.5 h-3.5" />
                  Setor Tunai (Cash &rarr; Rekening)
                </button>
              </div>
            </div>

            {/* Feedback notification banner */}
            {transferSuccessMessage && (
              <div className="p-2.5 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{transferSuccessMessage}</span>
              </div>
            )}

            {/* Quick Amount Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold text-stone-500">Nominal Cepat:</span>
              {transferAmountPresets.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setTransferAmountInput(String(amt))}
                  className="px-2 py-0.5 text-[10px] font-bold bg-white border border-stone-300 hover:border-blue-400 hover:bg-blue-50 text-stone-700 rounded-md transition"
                >
                  {formatRupiah(amt)}
                </button>
              ))}
              {transferType === 'tarik_tunai' && currentDealBank > 0 && (
                <button
                  type="button"
                  onClick={() => setTransferAmountInput(String(currentDealBank))}
                  className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 border border-blue-300 hover:bg-blue-200 text-blue-800 rounded-md transition"
                >
                  Tarik Semua Saldo Rekening ({formatRupiah(currentDealBank)})
                </button>
              )}
              {transferType === 'setor_tunai' && currentDealCash > 0 && (
                <button
                  type="button"
                  onClick={() => setTransferAmountInput(String(currentDealCash))}
                  className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 border border-emerald-300 hover:bg-emerald-200 text-emerald-800 rounded-md transition"
                >
                  Setor Semua Cash ({formatRupiah(currentDealCash)})
                </button>
              )}
            </div>

            {/* Form Input Tarik Tunai */}
            <form onSubmit={handleExecuteTransfer} className="bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-2xs space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                <div className="sm:col-span-3">
                  <label className="block text-[10px] font-bold text-stone-700 mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-stone-400" />
                    Tanggal
                  </label>
                  <input
                    type="date"
                    value={transferDate}
                    onChange={(e) => setTransferDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-[10px] font-bold text-stone-700 mb-1 flex items-center justify-between">
                    <span>Nominal {transferType === 'tarik_tunai' ? 'Tarik Tunai' : 'Setor Tunai'} (Rp)</span>
                    <span className="text-[9px] text-stone-400">
                      Tersedia: {formatRupiah(transferType === 'tarik_tunai' ? currentDealBank : currentDealCash)}
                    </span>
                  </label>
                  <input
                    type="text"
                    value={transferAmountInput}
                    onChange={(e) => setTransferAmountInput(e.target.value)}
                    placeholder="cth: 30.000.000"
                    className="w-full px-2.5 py-1.5 text-xs font-black bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-stone-900"
                    required
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[10px] font-bold text-stone-700 mb-1">
                    Keterangan / Tujuan
                  </label>
                  <input
                    type="text"
                    value={transferNote}
                    onChange={(e) => setTransferNote(e.target.value)}
                    placeholder="cth: Tarik ATM BCA gaji & kopi"
                    className="w-full px-2.5 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    className={`w-full py-2 px-3 text-white rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 shadow-xs ${
                      transferType === 'tarik_tunai'
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    Eksekusi
                  </button>
                </div>
              </div>

              {/* Simulation Preview Banner */}
              {parseNumberInput(transferAmountInput) > 0 && (
                <div className="p-2.5 bg-blue-50/90 border border-blue-200 rounded-lg text-xs text-blue-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="font-semibold">
                      Simulasi: Rekening{' '}
                      <span className="line-through text-stone-400">{formatRupiah(currentDealBank)}</span>{' '}
                      &rarr; <strong>{formatRupiah(transferType === 'tarik_tunai' ? Math.max(0, currentDealBank - parseNumberInput(transferAmountInput)) : currentDealBank + parseNumberInput(transferAmountInput))}</strong>{' '}
                      | Cash{' '}
                      <span className="line-through text-stone-400">{formatRupiah(currentDealCash)}</span>{' '}
                      &rarr; <strong>{formatRupiah(transferType === 'tarik_tunai' ? currentDealCash + parseNumberInput(transferAmountInput) : Math.max(0, currentDealCash - parseNumberInput(transferAmountInput)))}</strong>
                    </span>
                  </div>
                  <span className="text-[10px] font-black bg-blue-200 text-blue-900 px-2 py-0.5 rounded-full shrink-0">
                    Nilai Deal Tetap: {formatRupiah(effectiveTotalDeal)}
                  </span>
                </div>
              )}
            </form>

            {/* Riwayat Tarik Tunai List */}
            {cashTransfers.length > 0 && (
              <div className="pt-2">
                <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block mb-1.5">
                  Riwayat Mutasi Saldo & Tarik Tunai ({cashTransfers.length}):
                </span>
                <div className="max-h-36 overflow-y-auto space-y-1.5 border border-stone-200/80 rounded-xl p-2 bg-white/80">
                  {cashTransfers.map((item) => (
                    <div 
                      key={item.id} 
                      className="flex items-center justify-between text-xs p-1.5 hover:bg-stone-50 rounded-lg border border-stone-100"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                          item.type === 'tarik_tunai' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {item.type === 'tarik_tunai' ? '🏧 Tarik Tunai' : '🏦 Setor Tunai'}
                        </span>
                        <span className="text-stone-500 text-[11px]">
                          {formatIndonesianDate(item.date)}
                        </span>
                        <span className="text-stone-700 font-medium text-[11px]">
                          {item.note || '-'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-stone-900">
                          {formatRupiah(item.amount)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteTransfer(item.id)}
                          className="p-1 text-stone-400 hover:text-red-600 rounded transition"
                          title="Hapus catatan transfer ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Status Saldo Real-Time (Uang Cash Terpotong Otomatis) */}
          <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <Banknote className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-black text-stone-900 uppercase tracking-wider">
                  Status Saldo Riil: Uang Cash Terpotong Otomatis
                </h3>
              </div>
              <span className="text-[10px] text-stone-500 font-semibold">
                Gaji & belanja otomatis memotong uang cash di tangan
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Cash Tracker Card */}
              <div className={`p-3 rounded-xl border ${
                flow.remainingCash < 0 ? 'bg-red-50 border-red-300' : 'bg-emerald-50/80 border-emerald-300'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-800 flex items-center gap-1">
                    💵 Sisa Uang Cash di Tangan
                  </span>
                  <span className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                    flow.remainingCash < 0 ? 'bg-red-200 text-red-900' : 'bg-emerald-200 text-emerald-900'
                  }`}>
                    {flow.remainingCash < 0 ? 'Minus / Kurang' : 'Tersedia Fisik'}
                  </span>
                </div>
                <div className={`text-xl font-black mt-1 ${
                  flow.remainingCash < 0 ? 'text-red-700' : 'text-emerald-950'
                }`}>
                  {formatRupiah(flow.remainingCash)}
                </div>
                <div className="mt-2 pt-2 border-t border-stone-200/60 text-[10px] space-y-1 text-stone-600">
                  <div className="flex justify-between">
                    <span>Uang Cash Masuk:</span>
                    <span className="font-bold">{formatRupiah(flow.dealCash)}</span>
                  </div>
                  <div className="flex justify-between text-red-700 font-medium">
                    <span>Terpotong Gaji Karyawan (Lunas):</span>
                    <span>-{formatRupiah(flow.cashWagesSpent + flow.cashTemporaryWagesSpent)}</span>
                  </div>
                  {flow.accruedUnpaidWages > 0 && (
                    <div className="flex justify-between text-amber-700 bg-amber-100/70 px-1 py-0.5 rounded font-medium">
                      <span>Gaji Berjalan (Belum Lunas):</span>
                      <span>{formatRupiah(flow.accruedUnpaidWages)} (blm potong)</span>
                    </div>
                  )}
                  <div className="flex justify-between text-red-700 font-medium">
                    <span>Terpotong Belanja & Lainnya:</span>
                    <span>-{formatRupiah(flow.cashExpensesSpent + flow.cashConcreteSpent)}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-dashed pt-1 text-stone-800">
                    <span>Total Pengeluaran Cash:</span>
                    <span className="text-red-700">-{formatRupiah(flow.totalCashSpent)}</span>
                  </div>
                </div>
              </div>

              {/* Rekening Tracker Card */}
              <div className="p-3 rounded-xl border bg-blue-50/80 border-blue-300">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-800 flex items-center gap-1">
                    🏦 Sisa Saldo di Rekening
                  </span>
                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-blue-200 text-blue-900">
                    Bank / Transfer
                  </span>
                </div>
                <div className="text-xl font-black mt-1 text-blue-950">
                  {formatRupiah(flow.remainingBank)}
                </div>
                <div className="mt-2 pt-2 border-t border-stone-200/60 text-[10px] space-y-1 text-stone-600">
                  <div className="flex justify-between">
                    <span>Saldo Rekening Masuk:</span>
                    <span className="font-bold">{formatRupiah(flow.dealBank)}</span>
                  </div>
                  <div className="flex justify-between text-blue-800 font-medium">
                    <span>Terpotong Transfer Gaji:</span>
                    <span>-{formatRupiah(flow.bankWagesSpent + flow.bankTemporaryWagesSpent)}</span>
                  </div>
                  <div className="flex justify-between text-blue-800 font-medium">
                    <span>Terpotong Transfer Nota:</span>
                    <span>-{formatRupiah(flow.bankExpensesSpent + flow.bankConcreteSpent)}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-dashed pt-1 text-stone-800">
                    <span>Total Pengeluaran Transfer:</span>
                    <span className="text-blue-800">-{formatRupiah(flow.totalBankSpent)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Ringkasan Status Pembayaran Deal (Summary Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Total Deal */}
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-[11px] text-stone-500 font-semibold block">Total Nilai Deal</span>
                <span className="text-base font-black text-stone-900 block mt-0.5">
                  {formatRupiah(effectiveTotalDeal)}
                </span>
              </div>
              <div className="mt-2 pt-1.5 border-t border-stone-200 text-[10px] space-y-0.5 text-stone-600">
                <div className="flex justify-between">
                  <span className="text-blue-700 font-medium">🏦 Rekening:</span>
                  <span className="font-bold">{formatRupiah(currentDealBank)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-700 font-medium">💵 Cash:</span>
                  <span className="font-bold">{formatRupiah(currentDealCash)}</span>
                </div>
              </div>
            </div>

            {/* Sudah Diterima */}
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-[11px] text-emerald-800 font-semibold block">Sudah Diterima (Termin)</span>
                <span className="text-base font-black text-emerald-950 block mt-0.5">
                  {formatRupiah(totalReceivedTermin)}
                </span>
              </div>
              <div className="mt-2 pt-1.5 border-t border-emerald-200 text-[10px] space-y-0.5 text-emerald-900">
                <div className="flex justify-between">
                  <span className="font-medium">🏦 Rekening:</span>
                  <span className="font-bold">{formatRupiah(totalReceivedBank)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">💵 Cash:</span>
                  <span className="font-bold">{formatRupiah(totalReceivedCash)}</span>
                </div>
              </div>
            </div>

            {/* Sisa Tagihan */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-[11px] text-amber-800 font-semibold block">Sisa Belum Diterima</span>
                <span className="text-base font-black text-amber-950 block mt-0.5">
                  {formatRupiah(sisaTagihan)}
                </span>
              </div>
              <div className="mt-2 pt-1.5 border-t border-amber-200 text-[10px] space-y-0.5 text-amber-900">
                <div className="flex justify-between">
                  <span className="font-medium">Sisa Rekening:</span>
                  <span className="font-bold">{formatRupiah(sisaBank)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Sisa Cash:</span>
                  <span className="font-bold">{formatRupiah(sisaCash)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Riwayat Termin Masuk dari Owner */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-emerald-600" />
                3. Catatan Pembayaran Termin Diterima Dari Owner ({termins.length})
              </h3>
            </div>

            {/* Form Input Termin Baru */}
            <form onSubmit={handleAddTermin} className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200 space-y-2.5">
              <span className="text-xs font-bold text-emerald-900 block">
                + Tambah Catatan Pembayaran Masuk (DP / Termin)
              </span>

              {/* Quick Presets */}
              <div className="flex flex-wrap gap-1.5">
                {quickTerminPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setTerminTitle(preset)}
                    className="px-2 py-0.5 text-[10px] font-semibold bg-white border border-emerald-300 text-emerald-800 rounded-md hover:bg-emerald-100 transition"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <div className="sm:col-span-3">
                  <label className="block text-[10px] font-bold text-emerald-900 mb-0.5">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    value={terminDate}
                    onChange={(e) => setTerminDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-[10px] font-bold text-emerald-900 mb-0.5">
                    Nama Termin
                  </label>
                  <input
                    type="text"
                    value={terminTitle}
                    onChange={(e) => setTerminTitle(e.target.value)}
                    placeholder="Nama Termin (cth: DP 30%)"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    required
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[10px] font-bold text-emerald-900 mb-0.5">
                    Nominal (Rp)
                  </label>
                  <input
                    type="text"
                    value={terminAmountInput}
                    onChange={(e) => setTerminAmountInput(e.target.value)}
                    placeholder="Nominal (Rp)"
                    className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div className="sm:col-span-2 flex flex-col justify-end">
                  <button
                    type="submit"
                    className="w-full py-1.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Simpan
                  </button>
                </div>
              </div>

              {/* Payment Method Selector & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center pt-1">
                <div className="sm:col-span-5 flex items-center gap-2">
                  <span className="text-[11px] font-bold text-emerald-950 whitespace-nowrap">
                    Metode Terima:
                  </span>
                  <div className="flex items-center gap-1.5 flex-1">
                    <button
                      type="button"
                      onClick={() => setTerminPaymentMethod('transfer')}
                      className={`flex-1 py-1 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition border ${
                        terminPaymentMethod === 'transfer'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      <Landmark className="w-3.5 h-3.5" />
                      Rekening
                    </button>
                    <button
                      type="button"
                      onClick={() => setTerminPaymentMethod('cash')}
                      className={`flex-1 py-1 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition border ${
                        terminPaymentMethod === 'cash'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      <Banknote className="w-3.5 h-3.5" />
                      Tunai (Cash)
                    </button>
                  </div>
                </div>

                <div className="sm:col-span-7">
                  <input
                    type="text"
                    value={terminNote}
                    onChange={(e) => setTerminNote(e.target.value)}
                    placeholder="Catatan transfer / kuitansi (misal: Transfer BCA jam 10 pagi, kuitansi No. 01/IX)"
                    className="w-full px-2.5 py-1 text-xs bg-white border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </form>

            {/* List Termin Table */}
            {termins.length === 0 ? (
              <div className="p-5 text-center bg-stone-50 rounded-xl border border-dashed border-stone-200 text-stone-400 text-xs">
                Belum ada catatan termin yang dicairkan oleh owner. Masukkan data pembayaran di atas saat owner mengirim uang muka / termin (baik cash maupun transfer).
              </div>
            ) : (
              <div className="overflow-x-auto border border-stone-200 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-stone-200 bg-stone-50 text-stone-600 font-bold">
                      <th className="p-2.5">No</th>
                      <th className="p-2.5">Tanggal</th>
                      <th className="p-2.5">Keterangan Termin</th>
                      <th className="p-2.5 text-center">Metode</th>
                      <th className="p-2.5">Catatan / Bukti</th>
                      <th className="p-2.5 text-right">Nominal Masuk</th>
                      <th className="p-2.5 text-center w-10">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-medium">
                    {termins.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-stone-50">
                        <td className="p-2.5 font-bold text-stone-400">#{idx + 1}</td>
                        <td className="p-2.5 whitespace-nowrap text-stone-600">
                          {formatIndonesianDate(item.date)}
                        </td>
                        <td className="p-2.5 font-bold text-stone-900">{item.title}</td>
                        <td className="p-2.5 text-center whitespace-nowrap">
                          {item.paymentMethod === 'cash' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <Banknote className="w-3 h-3 text-emerald-600" />
                              Tunai (Cash)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                              <Landmark className="w-3 h-3 text-blue-600" />
                              Rekening
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 text-stone-500 text-[11px]">{item.note || '-'}</td>
                        <td className="p-2.5 text-right font-black text-emerald-800 whitespace-nowrap">
                          {formatRupiah(item.amount)}
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteTermin(item.id)}
                            className="p-1 text-stone-400 hover:text-red-600 rounded transition"
                            title="Hapus termin ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-stone-200 bg-emerald-50/70 font-black">
                      <td colSpan={5} className="p-2.5 text-right text-emerald-950 uppercase">
                        Total Pembayaran Owner Masuk:
                      </td>
                      <td className="p-2.5 text-right text-sm text-emerald-900">
                        {formatRupiah(totalReceivedTermin)}
                      </td>
                      <td></td>
                    </tr>
                    <tr className="bg-emerald-50/40 text-[11px] text-stone-600 font-semibold border-t border-emerald-200/60">
                      <td colSpan={7} className="px-2.5 py-1.5 text-right">
                        Rincian Masuk: <span className="text-blue-800 font-bold">🏦 Rekening: {formatRupiah(totalReceivedBank)}</span> &nbsp;|&nbsp; <span className="text-emerald-800 font-bold">💵 Cash: {formatRupiah(totalReceivedCash)}</span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer Modal */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="text-xs text-stone-500">
            Perubahan otomatis tersimpan ke data proyek.
          </div>
          <button
            onClick={() => {
              handleSaveMainDetails();
              onClose();
            }}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            Selesai & Simpan
          </button>
        </div>
      </div>
    </div>
  );
};
