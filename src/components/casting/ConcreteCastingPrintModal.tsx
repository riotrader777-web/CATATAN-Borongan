import React from 'react';
import { 
  X, 
  Printer, 
  Truck, 
  Wrench, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  Calendar,
  FileText
} from 'lucide-react';
import { ConcreteCastingRecord } from '../../types';
import { formatRupiah, formatIndonesianDate } from '../../utils/formatters';

interface ConcreteCastingPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: ConcreteCastingRecord | null;
  projectName: string;
}

export const ConcreteCastingPrintModal: React.FC<ConcreteCastingPrintModalProps> = ({
  isOpen,
  onClose,
  record,
  projectName,
}) => {
  if (!isOpen || !record) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-700" />
            <h3 className="text-base font-bold text-stone-900">
              Cetak Bukti Pengecoran ({record.castingSection})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Paper */}
        <div className="p-6 overflow-y-auto space-y-4 print:p-0">
          <div className="border border-stone-300 rounded-xl p-5 space-y-4 bg-stone-50/30">
            {/* Header Slip */}
            <div className="text-center border-b border-stone-200 pb-3">
              <h2 className="text-lg font-black text-stone-900 tracking-tight uppercase">
                Bukti Biaya Pengecoran & Sewa Pompa
              </h2>
              <p className="text-xs text-stone-600 font-bold mt-0.5">
                {projectName}
              </p>
              <p className="text-[11px] text-stone-400">
                Tanggal: {formatIndonesianDate(record.date)}
              </p>
            </div>

            {/* General Info */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-stone-400 uppercase font-bold block">Bagian Struktur</span>
                <span className="font-bold text-stone-900">{record.castingSection}</span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 uppercase font-bold block">Suplier Ready Mix</span>
                <span className="font-bold text-stone-900">{record.vendorName}</span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 uppercase font-bold block">Mutu Beton</span>
                <span className="font-bold text-blue-900">{record.concreteQuality}</span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 uppercase font-bold block">No. DO / Surat Jalan</span>
                <span className="font-bold text-stone-800">{record.deliveryOrderNo || '-'}</span>
              </div>
            </div>

            {/* Rincian Biaya Table */}
            <div className="border border-stone-200 rounded-lg overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-100 font-bold text-stone-700 border-b border-stone-200">
                  <tr>
                    <th className="p-2">Pos Pengeluaran</th>
                    <th className="p-2 text-center">Volume / Tipe</th>
                    <th className="p-2 text-right">Harga Satuan</th>
                    <th className="p-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  <tr>
                    <td className="p-2 font-bold text-stone-900">
                      Beton Ready Mix ({record.concreteQuality})
                      {record.truckCount && (
                        <span className="block text-[10px] text-stone-400 font-normal">
                          {record.truckCount} mobil mixer
                        </span>
                      )}
                    </td>
                    <td className="p-2 text-center font-bold text-blue-900">{record.volumeM3} m³</td>
                    <td className="p-2 text-right text-stone-600">{formatRupiah(record.pricePerM3)}</td>
                    <td className="p-2 text-right font-bold text-stone-900">{formatRupiah(record.totalConcreteCost)}</td>
                  </tr>

                  {record.pumpType !== 'tanpa_pompa' && (
                    <>
                      <tr>
                        <td className="p-2 font-bold text-stone-900">
                          Sewa Pompa Beton
                          <span className="block text-[10px] text-stone-400 font-normal">
                            Tipe: {record.pumpType}
                          </span>
                        </td>
                        <td className="p-2 text-center text-stone-500">1 Shift</td>
                        <td className="p-2 text-right text-stone-600">{formatRupiah(record.pumpRentalCost)}</td>
                        <td className="p-2 text-right font-bold text-stone-900">{formatRupiah(record.pumpRentalCost)}</td>
                      </tr>

                      {(record.pumpExtraPipeCost || 0) > 0 && (
                        <tr>
                          <td className="p-2 text-stone-700">Sambungan Pipa Ekstra</td>
                          <td className="p-2 text-center text-stone-500">-</td>
                          <td className="p-2 text-right text-stone-600">-</td>
                          <td className="p-2 text-right font-bold text-stone-900">{formatRupiah(record.pumpExtraPipeCost || 0)}</td>
                        </tr>
                      )}

                      {(record.operatorTips || 0) > 0 && (
                        <tr>
                          <td className="p-2 text-stone-700">Tips / Makan Kru Pompa & Sopir</td>
                          <td className="p-2 text-center text-stone-500">-</td>
                          <td className="p-2 text-right text-stone-600">-</td>
                          <td className="p-2 text-right font-bold text-stone-900">{formatRupiah(record.operatorTips || 0)}</td>
                        </tr>
                      )}
                    </>
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-stone-300 bg-stone-100 font-black">
                    <td colSpan={3} className="p-2 text-right uppercase text-stone-800">
                      Grand Total Biaya Pengecoran:
                    </td>
                    <td className="p-2 text-right text-sm text-stone-900">
                      {formatRupiah(record.grandTotal)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Status & Metode */}
            <div className="flex items-center justify-between text-xs pt-1">
              <div>
                <span className="text-[10px] text-stone-400 block font-bold">Status Pembayaran:</span>
                <span className={`font-black ${record.isPaid ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {record.isPaid ? 'SUDAH LUNAS' : 'TEMPO / BELUM BAYAR'}
                </span>
                <span className="text-[10px] text-stone-500 block">
                  Metode: {record.paymentMethod === 'tunai' ? 'Tunai (Cash)' : 'Transfer Rekening'}
                </span>
              </div>

              {record.notes && (
                <div className="text-right max-w-[200px]">
                  <span className="text-[10px] text-stone-400 block font-bold">Catatan:</span>
                  <span className="text-[11px] text-stone-600 italic">{record.notes}</span>
                </div>
              )}
            </div>

            {/* Signature Area */}
            <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs">
              <div>
                <span className="text-stone-400 block text-[10px]">Penerima / Mandor Proyek</span>
                <div className="h-12" />
                <span className="font-bold text-stone-800 border-t border-stone-400 pt-1 block">
                  ( ................................ )
                </span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px]">Owner / Pengawas Lapangan</span>
                <div className="h-12" />
                <span className="font-bold text-stone-800 border-t border-stone-400 pt-1 block">
                  ( ................................ )
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-stone-600 hover:text-stone-900 rounded-xl"
          >
            Tutup
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-4 h-4" />
            Cetak / Simpan PDF
          </button>
        </div>
      </div>
    </div>
  );
};
