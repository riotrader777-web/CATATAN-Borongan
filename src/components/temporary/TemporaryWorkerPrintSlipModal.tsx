import React from 'react';
import { X, Printer, CheckCircle, HardHat, Building2, Calendar, Users, Coins } from 'lucide-react';
import { TemporaryWorkerPayment } from '../../types';
import { formatRupiah, formatIndonesianDate, terbilangRupiah, getTodayDateString } from '../../utils/formatters';

interface TemporaryWorkerPrintSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: TemporaryWorkerPayment | null;
  projectName: string;
}

export const TemporaryWorkerPrintSlipModal: React.FC<TemporaryWorkerPrintSlipModalProps> = ({
  isOpen,
  onClose,
  record,
  projectName,
}) => {
  if (!isOpen || !record) return null;

  const handlePrint = () => {
    window.print();
  };

  const getWageTypeBadge = (type: string) => {
    switch (type) {
      case 'harian':
        return 'Harian Lepas (1 Hari)';
      case 'borongan':
        return 'Borongan Lepas Sekali Jadi';
      case 'setengah_hari':
        return 'Setengah Hari (1/2)';
      case 'lembur_cor':
        return 'Lembur Malam Cor';
      default:
        return 'Tenaga Lepas';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="print:hidden flex items-center justify-between px-5 py-3.5 border-b border-stone-200 bg-stone-50">
          <div className="flex items-center gap-2 text-stone-800 text-xs font-bold">
            <Printer className="w-4 h-4 text-amber-600" />
            <span>Slip Kuitansi Upah Pekerja Sekali Pakai</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak / Simpan PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-xl transition"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div id="printable-temp-slip" className="p-6 sm:p-8 bg-white text-stone-900 font-sans">
          {/* Header */}
          <div className="border-b-2 border-stone-800 pb-4 mb-4">
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                  Kuitansi Pembayaran Upah Kerja Lepas
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-stone-950 mt-1 tracking-tight">
                  TANDA TERIMA UPAH HARIAN / NGECO
                </h1>
                <p className="text-xs text-stone-600 font-semibold mt-0.5">
                  Proyek: {projectName}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-mono text-stone-500 block">
                  No. Bukti:
                </span>
                <span className="text-xs font-black font-mono text-stone-800 block">
                  #{record.id.slice(-8).toUpperCase()}
                </span>
                <span className="text-[11px] text-stone-500 block mt-1">
                  {formatIndonesianDate(record.date)}
                </span>
              </div>
            </div>
          </div>

          {/* Details Table */}
          <div className="space-y-3 text-xs mb-6">
            <div className="grid grid-cols-3 py-1.5 border-b border-stone-100">
              <span className="text-stone-500 font-medium">Telah Diterima Dari</span>
              <span className="col-span-2 font-bold text-stone-900">
                Mandor / Pelaksana Proyek ({projectName})
              </span>
            </div>

            <div className="grid grid-cols-3 py-1.5 border-b border-stone-100">
              <span className="text-stone-500 font-medium">Nama Pekerja / Kelompok</span>
              <span className="col-span-2 font-black text-stone-950 text-sm">
                {record.workerName}
              </span>
            </div>

            <div className="grid grid-cols-3 py-1.5 border-b border-stone-100">
              <span className="text-stone-500 font-medium">Jenis Pekerjaan</span>
              <span className="col-span-2 font-bold text-amber-900">
                {record.taskDescription}
              </span>
            </div>

            <div className="grid grid-cols-3 py-1.5 border-b border-stone-100">
              <span className="text-stone-500 font-medium">Sistem Upah & Jumlah</span>
              <span className="col-span-2 font-medium text-stone-800">
                {getWageTypeBadge(record.wageType)} • {record.headcount} Orang {record.ratePerPerson > 0 && `(@ ${formatRupiah(record.ratePerPerson)})`}
              </span>
            </div>

            <div className="grid grid-cols-3 py-1.5 border-b border-stone-100">
              <span className="text-stone-500 font-medium">Metode Pembayaran</span>
              <span className="col-span-2 font-semibold text-stone-800 uppercase">
                {record.paymentMethod === 'transfer' ? 'Transfer Bank' : 'Tunai Langsung (Cash)'}
              </span>
            </div>

            {record.notes && (
              <div className="grid grid-cols-3 py-1.5 border-b border-stone-100">
                <span className="text-stone-500 font-medium">Keterangan / Catatan</span>
                <span className="col-span-2 font-normal text-stone-700 italic">
                  "{record.notes}"
                </span>
              </div>
            )}
          </div>

          {/* Amount Box */}
          <div className="p-4 bg-stone-100 rounded-2xl border border-stone-300 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-stone-500 block">
                  JUMLAH TOTAL UPAH DIBAYARKAN:
                </span>
                <div className="text-2xl sm:text-3xl font-black text-stone-950 tracking-tight mt-0.5">
                  {formatRupiah(record.totalAmount)}
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  record.isPaid ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                }`}>
                  <CheckCircle className="w-3.5 h-3.5" />
                  {record.isPaid ? 'LUNAS DIBAYAR' : 'BELUM DIBAYAR'}
                </span>
              </div>
            </div>

            {/* Terbilang */}
            <div className="mt-3 pt-2.5 border-t border-stone-200/80 text-[11px] text-stone-700">
              <span className="font-semibold text-stone-500">Terbilang: </span>
              <span className="font-bold italic text-stone-900 capitalize">
                {terbilangRupiah(record.totalAmount)}
              </span>
            </div>
          </div>

          {/* Signature Grid */}
          <div className="grid grid-cols-2 gap-8 pt-4 text-center text-xs">
            <div>
              <p className="text-stone-500 font-medium">Yang Menerima (Pekerja),</p>
              <div className="h-16 flex items-end justify-center">
                <div className="w-32 border-b border-stone-400"></div>
              </div>
              <p className="font-bold text-stone-900 mt-1">({record.workerName})</p>
            </div>

            <div>
              <p className="text-stone-500 font-medium">Yang Menyerahkan (Mandor),</p>
              <div className="h-16 flex items-end justify-center">
                <div className="w-32 border-b border-stone-400"></div>
              </div>
              <p className="font-bold text-stone-900 mt-1">(Mandor / Pelaksana)</p>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-8 pt-4 border-t border-stone-200 text-center text-[10px] text-stone-400">
            Bukti pembayaran sah pencatatan borongan proyek • Dicetak pada {formatIndonesianDate(getTodayDateString())}
          </div>
        </div>
      </div>
    </div>
  );
};
