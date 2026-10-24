import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Wallet, Calendar, AlertCircle } from 'lucide-react';
import { KasbonRecord, KasbonPayment } from '../../types';
import { getKasbonRemaining, getKasbonTotalPaid } from '../../utils/kasbon';
import { formatRupiah, getTodayDateString, parseNumberInput, formatNumberInput } from '../../utils/formatters';

interface KasbonPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: KasbonRecord | null;
  onAddPayment: (recordId: string, payment: Omit<KasbonPayment, 'id' | 'createdAt'>) => void;
}

export const KasbonPaymentModal: React.FC<KasbonPaymentModalProps> = ({
  isOpen,
  onClose,
  record,
  onAddPayment,
}) => {
  const [date, setDate] = useState<string>(getTodayDateString());
  const [amountStr, setAmountStr] = useState<string>('');
  const [note, setNote] = useState<string>('Cicilan tunai');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (isOpen && record) {
      setDate(getTodayDateString());
      setAmountStr('');
      setNote('Cicilan tunai');
      setErrorMsg('');
    }
  }, [isOpen, record]);

  if (!isOpen || !record) return null;

  const totalPaid = getKasbonTotalPaid(record);
  const remaining = getKasbonRemaining(record);
  const enteredAmount = parseNumberInput(amountStr);
  const remainingAfterPayment = Math.max(0, remaining - enteredAmount);
  const isOverpaying = enteredAmount > remaining;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const num = parseNumberInput(raw);
    setAmountStr(num > 0 ? formatNumberInput(num) : '');
    setErrorMsg('');
  };

  const handleSetQuickAmount = (val: number) => {
    const capped = Math.min(val, remaining);
    setAmountStr(formatNumberInput(capped));
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredAmount <= 0) {
      setErrorMsg('Masukkan nominal cicilan yang valid (lebih dari Rp 0).');
      return;
    }
    if (enteredAmount > remaining) {
      setErrorMsg(`Nominal cicilan melebihi sisa kasbon (${formatRupiah(remaining)}).`);
      return;
    }

    onAddPayment(record.id, {
      date,
      amount: enteredAmount,
      note: note.trim() || 'Cicilan kasbon',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-stone-900 text-sm sm:text-base leading-tight">
                Bayar Cicilan Kasbon (Nominal Bebas)
              </h3>
              <p className="text-[11px] text-stone-500 font-medium">
                Bebas di hari apa saja & nominal berapa saja • Sisa kasbon terpotong otomatis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {/* Employee Info Card */}
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider block">
                  Nama Pegawai
                </span>
                <span className="font-bold text-stone-900 text-sm block">
                  {record.workerName}
                </span>
                {record.workerRole && (
                  <span className="text-stone-500 font-medium">{record.workerRole}</span>
                )}
              </div>
              {record.projectName && (
                <span className="px-2 py-0.5 rounded-md bg-stone-200 text-stone-700 text-[10px] font-bold">
                  {record.projectName}
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-200/80 text-center">
              <div className="p-1.5 bg-white rounded-lg border border-stone-200">
                <span className="text-[10px] text-stone-400 font-semibold block">Total Kasbon</span>
                <span className="font-bold text-stone-800 text-[11px] block mt-0.5">
                  {formatRupiah(record.initialAmount)}
                </span>
              </div>
              <div className="p-1.5 bg-white rounded-lg border border-emerald-200">
                <span className="text-[10px] text-emerald-600 font-semibold block">Sudah Dibayar</span>
                <span className="font-bold text-emerald-700 text-[11px] block mt-0.5">
                  {formatRupiah(totalPaid)}
                </span>
              </div>
              <div className="p-1.5 bg-amber-50 rounded-lg border border-amber-300">
                <span className="text-[10px] text-amber-800 font-bold block">Sisa Saat Ini</span>
                <span className="font-extrabold text-amber-950 text-xs block mt-0.5">
                  {formatRupiah(remaining)}
                </span>
              </div>
            </div>
          </div>

          {/* Tanggal Cicilan */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Tanggal Pembayaran (Bebas Hari Apa Saja)
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Nominal Cicilan */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-stone-700">
                Nominal Pembayaran Cicilan (Ketik Nominal Bebas)
              </label>
              {remaining > 0 && (
                <button
                  type="button"
                  onClick={() => handleSetQuickAmount(remaining)}
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                >
                  Bayar Lunas Sekaligus ({formatRupiah(remaining)})
                </button>
              )}
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-sm text-stone-500">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                autoFocus
                value={amountStr}
                onChange={handleAmountChange}
                placeholder="Ketik nominal bebas (contoh: 20.000, 50.000, dsb)"
                className="w-full pl-11 pr-3 py-2.5 text-base font-extrabold text-stone-900 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Quick buttons */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[10px] text-stone-400 font-semibold self-center mr-1">
                Tombol Cepat:
              </span>
              {[10000, 20000, 50000, 100000, 150000, 200000, 300000, 500000]
                .filter((amt) => amt <= remaining)
                .map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleSetQuickAmount(amt)}
                    className="px-2 py-0.5 text-[11px] font-medium bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 text-stone-700 rounded-lg border border-stone-200 transition"
                  >
                    +{formatNumberInput(amt)}
                  </button>
                ))}
            </div>

            {isOverpaying && (
              <p className="mt-1.5 text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Nominal melebihi sisa kasbon ({formatRupiah(remaining)})
              </p>
            )}

            {errorMsg && (
              <p className="mt-1.5 text-[11px] text-rose-600 font-semibold">
                {errorMsg}
              </p>
            )}
          </div>

          {/* Keterangan / Metode */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Catatan Pembayaran (Opsional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: Cicilan tunai di lokasi proyek / Transfer Mandiri"
              className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Preview Kalkulasi Otomatis */}
          {enteredAmount > 0 && !isOverpaying && (
            <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 text-xs">
              <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block">
                Hasil Pemotongan Otomatis
              </span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-stone-600">Sisa Kasbon Setelah Bayar Ini:</span>
                <span className="font-extrabold text-stone-900 text-sm">
                  {formatRupiah(remainingAfterPayment)}
                </span>
              </div>
              {remainingAfterPayment === 0 && (
                <div className="mt-1.5 pt-1.5 border-t border-emerald-200 text-emerald-800 font-bold text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Kasbon pegawai ini akan otomatis dinyatakan LUNAS!
                </div>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={enteredAmount <= 0 || isOverpaying}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:pointer-events-none rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Simpan & Potong Kasbon
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
