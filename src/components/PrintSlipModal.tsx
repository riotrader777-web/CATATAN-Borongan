import React, { useState } from 'react';
import { X, Printer, FileText, CheckCircle2, UserCheck } from 'lucide-react';
import { Worker, AttendanceMap } from '../types';
import { 
  formatRupiah, 
  formatIndonesianDate, 
  calculateDayWage, 
  getDaysInWorkWeek, 
  getDayName 
} from '../utils/formatters';

interface PrintSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  saturdayDate: string;
  projectName: string;
  workers: Worker[];
  attendance: AttendanceMap;
}

export const PrintSlipModal: React.FC<PrintSlipModalProps> = ({
  isOpen,
  onClose,
  saturdayDate,
  projectName,
  workers,
  attendance,
}) => {
  const [printMode, setPrintMode] = useState<'individual' | 'master'>('master');
  const [onlyActiveWorkers, setOnlyActiveWorkers] = useState<boolean>(true);

  if (!isOpen) return null;

  const daysInWeek = getDaysInWorkWeek(saturdayDate);

  const workerSummaries = workers.map((worker) => {
    let daysH = 0;
    let daysS = 0;
    let daysA = 0;
    let totalWage = 0;

    const dailyBreakdown = daysInWeek.map((dateStr) => {
      const record = attendance[dateStr]?.[worker.id];
      const status = record?.status;
      const wage = calculateDayWage(status, worker.dailyWage, record?.customWage);

      if (status === 'H') daysH += 1;
      else if (status === 'S') daysS += 1;
      else if (status === 'A') daysA += 1;

      totalWage += wage;
      return { dateStr, status, wage };
    });

    const effectiveDays = daysH + daysS * 0.5;

    return {
      worker,
      daysH,
      daysS,
      daysA,
      effectiveDays,
      totalWage,
      dailyBreakdown,
    };
  });

  const activeSummaries = workerSummaries.filter(
    (item) => item.worker.name.trim().length > 0 || item.totalWage > 0
  );
  const masterList = onlyActiveWorkers ? activeSummaries : workerSummaries;
  const totalAllWage = workerSummaries.reduce((sum, w) => sum + w.totalWage, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto print:p-0 print:static print:bg-white">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl border border-stone-200 overflow-hidden print:shadow-none print:border-none print:max-w-none">
        {/* Modal Top Bar (Hidden during print) */}
        <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-700" />
            <h3 className="font-bold text-stone-900 text-sm">
              Cetak Rekap / Slip Gaji Sabtu ({saturdayDate})
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-stone-200/70 p-1 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setPrintMode('master')}
                className={`px-2.5 py-1 rounded-md transition ${
                  printMode === 'master' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
                }`}
              >
                Daftar Rekap (1 Lembar)
              </button>
              <button
                type="button"
                onClick={() => setPrintMode('individual')}
                className={`px-2.5 py-1 rounded-md transition ${
                  printMode === 'individual' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
                }`}
              >
                Slip Amplop Per Pegawai
              </button>
            </div>

            {printMode === 'master' && (
              <label className="hidden sm:flex items-center gap-1.5 text-xs text-stone-600 cursor-pointer font-medium select-none bg-stone-100 px-2 py-1 rounded-lg border border-stone-200">
                <input
                  type="checkbox"
                  checked={onlyActiveWorkers}
                  onChange={(e) => setOnlyActiveWorkers(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                Hanya yang Bekerja ({activeSummaries.length})
              </label>
            )}

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak Sekarang
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Content */}
        <div className="p-6 md:p-8 space-y-6 max-h-[80vh] overflow-y-auto print:max-h-none print:overflow-visible">
          {/* Header */}
          <div className="text-center border-b-2 border-stone-900 pb-4">
            <h1 className="text-2xl font-black text-stone-900 uppercase tracking-tight">
              {projectName || 'PROYEK BORONGAN'}
            </h1>
            <p className="text-sm font-semibold text-stone-700 mt-1">
              DAFTAR TANDA TERIMA GAJI MINGGUAN (SABTU)
            </p>
            <p className="text-xs text-stone-500 mt-0.5 font-medium">
              Periode Kerja: {formatIndonesianDate(daysInWeek[0])} s/d {formatIndonesianDate(saturdayDate)} (Minggu s/d Sabtu)
            </p>
          </div>

          {printMode === 'master' ? (
            /* Master Sheet Table for Signatures */
            <div>
              <table className="w-full text-left text-xs border border-stone-300">
                <thead>
                  <tr className="bg-stone-100 text-stone-800 font-bold border-b border-stone-300">
                    <th className="p-2 border-r border-stone-300 text-center w-8">No</th>
                    <th className="p-2 border-r border-stone-300">Nama Pegawai</th>
                    <th className="p-2 border-r border-stone-300 text-right">Tarif/Hari</th>
                    <th className="p-2 border-r border-stone-300 text-center">H</th>
                    <th className="p-2 border-r border-stone-300 text-center">S</th>
                    <th className="p-2 border-r border-stone-300 text-center">A</th>
                    <th className="p-2 border-r border-stone-300 text-center">Hari Kerja</th>
                    <th className="p-2 border-r border-stone-300 text-right">Total Diterima</th>
                    <th className="p-2 text-center w-28">Tanda Tangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {masterList.map((item, idx) => (
                    <tr key={item.worker.id} className="border-b border-stone-200">
                      <td className="p-2 border-r border-stone-300 text-center font-bold">{idx + 1}</td>
                      <td className="p-2 border-r border-stone-300 font-bold text-stone-900">
                        {item.worker.name.trim() || `Pegawai ${idx + 1}`}
                      </td>
                      <td className="p-2 border-r border-stone-300 text-right">
                        {formatRupiah(item.worker.dailyWage)}
                      </td>
                      <td className="p-2 border-r border-stone-300 text-center font-semibold text-emerald-700">{item.daysH}</td>
                      <td className="p-2 border-r border-stone-300 text-center font-semibold text-amber-700">{item.daysS}</td>
                      <td className="p-2 border-r border-stone-300 text-center font-semibold text-rose-600">{item.daysA}</td>
                      <td className="p-2 border-r border-stone-300 text-center font-bold">{item.effectiveDays} Hari</td>
                      <td className="p-2 border-r border-stone-300 text-right font-black text-stone-900 text-sm">
                        {formatRupiah(item.totalWage)}
                      </td>
                      <td className="p-2 text-center text-stone-400 font-mono text-[10px] h-10 align-bottom">
                        (...............……)
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-stone-100 font-black border-t-2 border-stone-400 text-stone-900">
                    <td colSpan={7} className="p-2.5 text-right uppercase">Total Pembayaran Sabtu:</td>
                    <td className="p-2.5 text-right text-sm">{formatRupiah(totalAllWage)}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>

              {/* Signature Section */}
              <div className="mt-8 flex justify-between text-xs text-stone-800 pt-4">
                <div className="text-center w-48">
                  <p>Disetujui oleh Mandor,</p>
                  <div className="h-16" />
                  <p className="font-bold underline">(.......................................)</p>
                </div>
                <div className="text-center w-48">
                  <p>Kasir / Bendahara,</p>
                  <div className="h-16" />
                  <p className="font-bold underline">(.......................................)</p>
                </div>
              </div>
            </div>
          ) : (
            /* Individual Envelope Slips (Cut-out cards) */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workerSummaries
                .filter((item) => item.worker.name.trim().length > 0 || item.totalWage > 0)
                .map((item, idx) => (
                  <div 
                    key={item.worker.id}
                    className="border-2 border-dashed border-stone-300 p-4 rounded-xl relative bg-stone-50/50"
                  >
                    <div className="flex justify-between items-start border-b border-stone-200 pb-2 mb-2">
                      <div>
                        <span className="text-[10px] font-bold text-stone-500 uppercase">SLIP GAJI MINGGUAN (SABTU)</span>
                        <h4 className="font-black text-stone-900 text-base">{item.worker.name}</h4>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-stone-400">Tgl Bayar</span>
                        <p className="text-xs font-bold text-stone-700">{saturdayDate}</p>
                      </div>
                    </div>

                    <div className="text-xs space-y-1 text-stone-700">
                      <div className="flex justify-between">
                        <span>Tarif Harian:</span>
                        <span className="font-semibold">{formatRupiah(item.worker.dailyWage)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Kehadiran (H: {item.daysH}, S: {item.daysS}, A: {item.daysA}):</span>
                        <span className="font-bold text-emerald-800">{item.effectiveDays} Hari Kerja</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-stone-200 text-sm font-black text-stone-900">
                        <span>Total Diterima:</span>
                        <span className="text-purple-950">{formatRupiah(item.totalWage)}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-2 border-t border-dashed border-stone-200 flex justify-between text-[11px] text-stone-500">
                      <span>Tanda Terima: _________________</span>
                      <span>Cap/Paraf Mandor</span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
