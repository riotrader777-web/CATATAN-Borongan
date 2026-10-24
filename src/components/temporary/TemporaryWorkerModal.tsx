import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  HardHat, 
  Users, 
  Calendar, 
  Coins, 
  CreditCard, 
  FileText, 
  Sparkles,
  Zap,
  Clock
} from 'lucide-react';
import { TemporaryWorkerPayment, TemporaryWageType } from '../../types';
import { getTodayDateString, formatRupiah, parseNumberInput, formatNumberInput } from '../../utils/formatters';

interface TemporaryWorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<TemporaryWorkerPayment, 'id' | 'createdAt'>) => void;
  initialData?: TemporaryWorkerPayment | null;
  projectName: string;
}

const COMMON_TASKS = [
  { label: '🏗️ Ngecor Dak Lantai / Atap', value: 'Ngecor Dak Lantai / Atap' },
  { label: '🧱 Ngecor Balok & Kolom', value: 'Ngecor Balok & Kolom' },
  { label: '⛏️ Ngecor Pondasi & Sloof', value: 'Ngecor Pondasi & Sloof' },
  { label: '🚛 Langsir Semen / Pasir / Split', value: 'Langsir Semen / Pasir / Split' },
  { label: '🪵 Bongkar Pasang Bekisting Cor', value: 'Bongkar Pasang Bekisting Cor' },
  { label: '🌙 Lembur Cor Malam', value: 'Lembur Cor Malam' },
  { label: '🪨 Galian Tanah & Buang Puing', value: 'Galian Tanah & Buang Puing' },
];

const WAGE_TYPE_LABELS: Record<TemporaryWageType, { title: string; desc: string }> = {
  harian: { title: 'Harian Lepas (1 Hari)', desc: 'Upah standar 1 hari penuh kerja' },
  borongan: { title: 'Borongan Sekali Jadi', desc: 'Upah flat borong per pekerjaan' },
  setengah_hari: { title: 'Setengah Hari (1/2)', desc: 'Kerja setengah hari / setengah shift' },
  lembur_cor: { title: 'Lembur Malam Cor', desc: 'Kerja lembur tambahan untuk selesaikan cor' },
};

const COMMON_RATES = [100000, 120000, 150000, 180000, 200000, 250000];

export const TemporaryWorkerModal: React.FC<TemporaryWorkerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  projectName,
}) => {
  const [date, setDate] = useState<string>(getTodayDateString());
  const [workerName, setWorkerName] = useState<string>('');
  const [taskDescription, setTaskDescription] = useState<string>('Ngecor Dak Lantai / Atap');
  const [wageType, setWageType] = useState<TemporaryWageType>('harian');
  const [headcount, setHeadcount] = useState<number>(1);
  const [ratePerPerson, setRatePerPerson] = useState<number>(150000);
  const [customTotalAmount, setCustomTotalAmount] = useState<number | null>(null);
  const [isPaid, setIsPaid] = useState<boolean>(true);
  const [paymentMethod, setPaymentMethod] = useState<'tunai' | 'transfer'>('tunai');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setDate(initialData.date || getTodayDateString());
      setWorkerName(initialData.workerName || '');
      setTaskDescription(initialData.taskDescription || 'Ngecor Dak Lantai / Atap');
      setWageType(initialData.wageType || 'harian');
      setHeadcount(initialData.headcount || 1);
      setRatePerPerson(initialData.ratePerPerson || 0);
      setCustomTotalAmount(initialData.totalAmount);
      setIsPaid(initialData.isPaid ?? true);
      setPaymentMethod(initialData.paymentMethod || 'tunai');
      setNotes(initialData.notes || '');
    } else {
      setDate(getTodayDateString());
      setWorkerName('');
      setTaskDescription('Ngecor Dak Lantai / Atap');
      setWageType('harian');
      setHeadcount(1);
      setRatePerPerson(150000);
      setCustomTotalAmount(null);
      setIsPaid(true);
      setPaymentMethod('tunai');
      setNotes('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const calculatedTotal = headcount * ratePerPerson;
  const currentTotal = customTotalAmount !== null ? customTotalAmount : calculatedTotal;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = workerName.trim();
    if (!trimmedName) {
      alert('Silakan masukkan nama pekerja sekali pakai atau nama kelompok.');
      return;
    }

    if (currentTotal <= 0) {
      alert('Silakan masukkan nominal upah yang valid (lebih dari Rp 0).');
      return;
    }

    onSave({
      date,
      workerName: trimmedName,
      taskDescription: taskDescription.trim() || 'Ngecor & Tenaga Lepas',
      wageType,
      headcount: Math.max(1, headcount),
      ratePerPerson: Math.max(0, ratePerPerson),
      totalAmount: Math.max(0, currentTotal),
      isPaid,
      paidAt: isPaid ? (initialData?.paidAt || new Date().toISOString()) : undefined,
      paymentMethod,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 bg-amber-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
              <HardHat className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-stone-900 leading-tight">
                {initialData ? 'Ubah Catatan Pekerja Sekali Pakai' : 'Catat Pekerja Sekali Pakai (Ngecor)'}
              </h2>
              <p className="text-xs text-amber-900/80 font-medium">
                {projectName} • Tenaga lepas / cabutan harian & borongan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Quick Notice Info */}
          <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-2xl text-xs text-amber-950 flex items-start gap-2.5">
            <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Khusus Tenaga Lepas / Tambahan Saat Ngecor:</span>
              <p className="text-amber-900/80 mt-0.5 text-[11px] leading-relaxed">
                Pekerja ini tidak memakan slot 50 pegawai tetap. Upah yang dibayarkan langsung memotong sisa keuntungan proyek mandor secara akurat.
              </p>
            </div>
          </div>

          {/* Row: Tanggal & Nama */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-stone-500" />
                Tanggal Kerja / Ngecor <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-stone-500" />
                Nama Pekerja / Kelompok <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Cth: Pak Slamet, Cak Dul, Tim Cor 4 Org"
                value={workerName}
                onChange={(e) => setWorkerName(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold text-stone-900 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Pekerjaan / Tugas dengan Preset Chips */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <HardHat className="w-3.5 h-3.5 text-stone-500" />
                Pekerjaan / Kegiatan
              </span>
              <span className="text-[10px] text-stone-400 font-normal">Klik tombol cepat untuk mengisi</span>
            </label>

            {/* Preset chips */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COMMON_TASKS.map((task) => (
                <button
                  type="button"
                  key={task.value}
                  onClick={() => setTaskDescription(task.value)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition ${
                    taskDescription === task.value
                      ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {task.label}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Atau tulis jenis pekerjaan lainnya..."
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Tipe Upah */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Sistem Upah Pekerja
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(WAGE_TYPE_LABELS) as TemporaryWageType[]).map((type) => {
                const isSelected = wageType === type;
                return (
                  <button
                    type="button"
                    key={type}
                    onClick={() => {
                      setWageType(type);
                      setCustomTotalAmount(null);
                    }}
                    className={`p-2 rounded-xl text-left border transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20'
                        : 'bg-stone-50 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <span className={`text-xs font-bold leading-tight ${isSelected ? 'text-amber-950' : 'text-stone-800'}`}>
                      {WAGE_TYPE_LABELS[type].title}
                    </span>
                    <span className="text-[10px] text-stone-500 mt-1 leading-tight line-clamp-2">
                      {WAGE_TYPE_LABELS[type].desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row: Jumlah Orang & Tarif per Orang */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-stone-50 p-3.5 rounded-2xl border border-stone-200/80">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Jumlah Orang (Pekerja)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={headcount}
                  onChange={(e) => {
                    const val = Math.max(1, parseInt(e.target.value, 10) || 1);
                    setHeadcount(val);
                    setCustomTotalAmount(null);
                  }}
                  className="w-full px-3 py-2 text-xs font-bold text-stone-900 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-center"
                />
                <span className="text-xs font-bold text-stone-500 shrink-0">Orang</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Tarif per Orang / Shift (Rp)
              </label>
              <input
                type="text"
                value={formatNumberInput(ratePerPerson)}
                onChange={(e) => {
                  const val = parseNumberInput(e.target.value);
                  setRatePerPerson(val);
                  setCustomTotalAmount(null);
                }}
                placeholder="150.000"
                className="w-full px-3 py-2 text-xs font-bold text-stone-900 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Quick rate buttons */}
            <div className="col-span-1 sm:col-span-2">
              <span className="text-[10px] font-bold text-stone-400 block mb-1">Pilihan Tarif Cepat:</span>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_RATES.map((rate) => (
                  <button
                    type="button"
                    key={rate}
                    onClick={() => {
                      setRatePerPerson(rate);
                      setCustomTotalAmount(null);
                    }}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition ${
                      ratePerPerson === rate
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {formatRupiah(rate).replace(',00', '')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Total Upah yang Dibayarkan */}
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-amber-900 block">
                Total Upah Pekerja Sekali Pakai
              </span>
              <span className="text-[11px] text-amber-700">
                {headcount > 1 ? `${headcount} orang × ${formatRupiah(ratePerPerson)}` : 'Upah yang harus dibayarkan'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-black text-amber-950">
                {formatRupiah(currentTotal)}
              </span>
            </div>
          </div>

          {/* Status Bayar & Metode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Status Pembayaran
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsPaid(true)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                    isPaid
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                      : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  Sudah Dibayar
                </button>
                <button
                  type="button"
                  onClick={() => setIsPaid(false)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                    !isPaid
                      ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                      : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  Belum Bayar
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Metode Pembayaran
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('tunai')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                    paymentMethod === 'tunai'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                      : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <Coins className="w-3.5 h-3.5" />
                  Tunai (Cash)
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('transfer')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                    paymentMethod === 'transfer'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  Transfer Bank
                </button>
              </div>
            </div>
          </div>

          {/* Catatan Tambahan (Opsional) */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Catatan Tambahan (Opsional)
            </label>
            <input
              type="text"
              placeholder="Cth: Mulai jam 13.00 s/d 21.00, sudah termasuk uang rokok"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 active:scale-98 rounded-xl shadow-md transition flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              {initialData ? 'Simpan Perubahan' : 'Simpan Catatan Upah'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
