import React from 'react';
import { X, Printer, FileText } from 'lucide-react';
import { KasbonRecord } from '../../types';
import { getKasbonRemaining, getKasbonTotalPaid, isKasbonLunas } from '../../utils/kasbon';
import { formatRupiah, formatIndonesianDate, getTodayDateString } from '../../utils/formatters';

interface KasbonPrintSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: KasbonRecord | null;
}

export const KasbonPrintSlipModal: React.FC<KasbonPrintSlipModalProps> = ({
  isOpen,
  onClose,
  record,
}) => {
  if (!isOpen || !record) return null;

  const totalPaid = getKasbonTotalPaid(record);
  const remaining = getKasbonRemaining(record);
  const isPaidOff = isKasbonLunas(record);

  const handlePrint = () => {
    window.print();
  };

  // Calculate progressive remaining balance after each payment
  let runningPaid = 0;
  const paymentsWithBalance = (record.payments || []).map((p) => {
    runningPaid += p.amount;
    const remainingAfter = Math.max(0, record.initialAmount - runningPaid);
    return {
      ...p,
      remainingAfter,
    };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header (Hidden during print) */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-stone-700" />
            <div>
              <h3 className="font-extrabold text-stone-900 text-sm sm:text-base leading-tight">
                Cetak Slip Bukti Kasbon Pegawai
              </h3>
              <p className="text-[11px] text-stone-500 font-medium">
                Siap dicetak atau disimpan sebagai PDF
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sekarang</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas */}
        <div className="p-6 md:p-8 overflow-y-auto bg-white text-stone-900 print:p-0 print:m-0 font-sans">
          <div className="border border-stone-300 p-6 rounded-xl print:border-none print:p-0 space-y-6">
            {/* Header Slip */}
            <div className="border-b-2 border-stone-800 pb-3 flex justify-between items-start">
              <div>
                <h1 className="text-xl font-black tracking-tight text-stone-900 uppercase">
                  Bukti Kasbon & Angsuran Pegawai
                </h1>
                <p className="text-xs text-stone-600 mt-0.5">
                  Pembukuan Mandor • Catatan Pribadi Pegawai (Terpisah dari Borongan)
                </p>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-stone-500 block">Dicetak Tanggal:</span>
                <span className="text-xs font-bold text-stone-800 block">
                  {formatIndonesianDate(getTodayDateString())}
                </span>
              </div>
            </div>

            {/* Employee Data Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-stone-50 p-4 rounded-lg border border-stone-200">
              <div>
                <span className="text-[10px] text-stone-500 uppercase font-bold block">Nama Pegawai</span>
                <span className="font-extrabold text-stone-900 text-sm block mt-0.5">{record.workerName}</span>
                {record.workerRole && <span className="text-stone-600 block">{record.workerRole}</span>}
                {record.workerPhone && <span className="text-stone-500 block mt-0.5">HP/WA: {record.workerPhone}</span>}
              </div>

              <div>
                <span className="text-[10px] text-stone-500 uppercase font-bold block">Data Pinjaman</span>
                <span className="text-stone-700 block mt-0.5">
                  Tanggal Pinjam: <strong>{formatIndonesianDate(record.date)}</strong>
                </span>
                {record.projectName && (
                  <span className="text-stone-700 block">
                    Referensi Proyek: <strong>{record.projectName}</strong>
                  </span>
                )}
                {record.reason && (
                  <span className="text-stone-700 block">
                    Keperluan: <em>{record.reason}</em>
                  </span>
                )}
              </div>
            </div>

            {/* Financial Overview Box */}
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 border border-stone-300 rounded-lg">
                <span className="text-[10px] text-stone-500 uppercase font-bold block">Nominal Kasbon Awal</span>
                <span className="font-black text-stone-900 text-base block mt-1">
                  {formatRupiah(record.initialAmount)}
                </span>
              </div>

              <div className="p-3 border border-stone-300 rounded-lg">
                <span className="text-[10px] text-stone-500 uppercase font-bold block">Total Sudah Dicicil</span>
                <span className="font-black text-stone-800 text-base block mt-1">
                  {formatRupiah(totalPaid)}
                </span>
              </div>

              <div className={`p-3 border-2 rounded-lg ${
                isPaidOff ? 'border-emerald-600 bg-emerald-50' : 'border-stone-900 bg-stone-100'
              }`}>
                <span className="text-[10px] uppercase font-bold block">
                  {isPaidOff ? 'Status' : 'Sisa Kasbon Belum Lunas'}
                </span>
                <span className="font-black text-lg block mt-1">
                  {isPaidOff ? 'LUNAS (100%)' : formatRupiah(remaining)}
                </span>
              </div>
            </div>

            {/* Installment History Table */}
            <div>
              <h2 className="text-xs font-bold uppercase text-stone-700 tracking-wider mb-2">
                Rincian Pembayaran Angsuran / Cicilan
              </h2>
              <table className="w-full text-xs border border-stone-300">
                <thead>
                  <tr className="bg-stone-100 border-b border-stone-300 font-bold text-stone-700 text-left">
                    <th className="p-2 border-r border-stone-300 text-center w-10">No</th>
                    <th className="p-2 border-r border-stone-300">Tanggal Bayar</th>
                    <th className="p-2 border-r border-stone-300 text-right">Nominal Cicilan</th>
                    <th className="p-2 border-r border-stone-300">Keterangan / Catatan</th>
                    <th className="p-2 text-right">Sisa Kasbon</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {paymentsWithBalance.length > 0 ? (
                    paymentsWithBalance.map((item, idx) => (
                      <tr key={item.id}>
                        <td className="p-2 border-r border-stone-200 text-center font-bold text-stone-500">
                          {idx + 1}
                        </td>
                        <td className="p-2 border-r border-stone-200 font-medium">
                          {formatIndonesianDate(item.date)}
                        </td>
                        <td className="p-2 border-r border-stone-200 text-right font-black text-stone-900">
                          {formatRupiah(item.amount)}
                        </td>
                        <td className="p-2 border-r border-stone-200 text-stone-600">
                          {item.note || 'Cicilan kasbon'}
                        </td>
                        <td className="p-2 text-right font-extrabold text-stone-900">
                          {formatRupiah(item.remainingAfter)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-3 text-center text-stone-500 italic">
                        Belum ada pembayaran cicilan yang tercatat
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {record.notes && (
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs">
                <span className="font-bold text-stone-800 block text-[11px]">Catatan:</span>
                <span className="text-stone-600 italic whitespace-pre-wrap">{record.notes}</span>
              </div>
            )}

            {/* Signature Area */}
            <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs">
              <div>
                <p className="font-medium text-stone-600 mb-16">Peminjam / Pegawai,</p>
                <div className="border-t border-stone-400 mx-auto w-40 pt-1 font-bold text-stone-900">
                  ( {record.workerName} )
                </div>
              </div>

              <div>
                <p className="font-medium text-stone-600 mb-16">Mandor / Pengelola,</p>
                <div className="border-t border-stone-400 mx-auto w-40 pt-1 font-bold text-stone-900">
                  ( ................................ )
                </div>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="border-t border-stone-200 pt-3 text-[10px] text-stone-400 text-center">
              Dokumen ini adalah bukti pencatatan kasbon internal pegawai dan tidak terhubung dengan nominal kontrak borongan proyek.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
