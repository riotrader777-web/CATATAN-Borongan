import React, { useState } from 'react';
import { 
  CalendarCheck, 
  ChevronLeft, 
  ChevronRight, 
  Printer, 
  CheckCircle, 
  Clock, 
  Search, 
  HardHat, 
  Users,
  Banknote,
  Landmark
} from 'lucide-react';
import { Worker, AttendanceMap, SaturdayPayrollPayment, TemporaryWorkerPayment, AttendanceStatus } from '../types';
import { 
  formatRupiah, 
  formatIndonesianDate, 
  calculateDayWage, 
  getDaysInWorkWeek, 
  getDayName 
} from '../utils/formatters';

interface SaturdayPayrollSectionProps {
  selectedSaturday: string; // YYYY-MM-DD
  onSelectSaturday: (dateStr: string) => void;
  workers: Worker[];
  attendance: AttendanceMap;
  weeklyPayments: Record<string, SaturdayPayrollPayment>;
  onToggleWeeklyPayment: (saturdayDate: string, totalAmount: number, paymentMethod?: 'tunai' | 'transfer') => void;
  onOpenPrintModal: (satDate: string) => void;
  temporaryWorkers?: TemporaryWorkerPayment[];
  onNavigateToTemporary?: () => void;
}

export const SaturdayPayrollSection: React.FC<SaturdayPayrollSectionProps> = ({
  selectedSaturday,
  onSelectSaturday,
  workers,
  attendance,
  weeklyPayments,
  onToggleWeeklyPayment,
  onOpenPrintModal,
  temporaryWorkers = [],
  onNavigateToTemporary,
}) => {
  const daysInWeek = getDaysInWorkWeek(selectedSaturday);
  const paymentRecord = weeklyPayments[selectedSaturday];
  const isPaid = !!paymentRecord?.isPaid;
  const currentMethod = paymentRecord?.paymentMethod || 'tunai';
  const [payrollPaymentMethod, setPayrollPaymentMethod] = useState<'tunai' | 'transfer'>(currentMethod);

  const [searchQuery, setSearchQuery] = useState('');

  // Move week by 7 days
  const changeWeek = (deltaWeeks: number) => {
    const [y, m, d] = selectedSaturday.split('-').map(Number);
    const date = new Date(y, m - 1, d, 12, 0, 0);
    date.setDate(date.getDate() + deltaWeeks * 7);
    const ny = date.getFullYear();
    const nm = String(date.getMonth() + 1).padStart(2, '0');
    const nd = String(date.getDate()).padStart(2, '0');
    onSelectSaturday(`${ny}-${nm}-${nd}`);
  };

  // Calculate totals per worker for this week
  let grandTotalWageThisWeek = 0;

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
      return {
        dateStr,
        status,
        wage,
      };
    });

    const effectiveDays = daysH + daysS * 0.5;
    grandTotalWageThisWeek += totalWage;

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

  const activeWorkersCount = workerSummaries.filter(
    (item) => item.effectiveDays > 0 || item.totalWage > 0
  ).length;

  const tempWorkersThisWeek = temporaryWorkers.filter((t) => daysInWeek.includes(t.date));
  const totalTempWageThisWeek = tempWorkersThisWeek.reduce((sum, t) => sum + t.totalAmount, 0);

  const filteredSummaries = workerSummaries.filter((item, index) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const numMatch = `#${index + 1}`.includes(q) || String(index + 1) === q;
      const nameMatch = item.worker.name.toLowerCase().includes(q);
      const roleMatch = (item.worker.role || '').toLowerCase().includes(q);
      return numMatch || nameMatch || roleMatch;
    }
    return true;
  });

  return (
    <div id="saturday-payroll-section" className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 md:p-6 mb-6">
      {/* Header & Saturday Week Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold shrink-0">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">
                  Rekap Pembayaran Gaji Hari Sabtu
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                  {activeWorkersCount} dari {workers.length} Karyawan Bekerja Minggu Ini
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Hitungan akumulasi mingguan (Minggu s/d Sabtu) untuk seluruh karyawan proyek
              </p>
            </div>
          </div>
        </div>

        {/* Saturday Navigator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-stone-100 p-1 rounded-xl">
            <button
              id="prev-saturday-btn"
              onClick={() => changeWeek(-1)}
              className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-white rounded-lg transition"
              title="Sabtu Sebelumnya (Minggu Lalu)"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-3 py-1 text-xs font-bold text-stone-800">
              Sabtu, {selectedSaturday}
            </span>
            <button
              id="next-saturday-btn"
              onClick={() => changeWeek(1)}
              className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-white rounded-lg transition"
              title="Sabtu Berikutnya (Minggu Depan)"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <button
            id="print-slip-btn"
            onClick={() => onOpenPrintModal(selectedSaturday)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition"
            title="Cetak Kuitansi / Slip Gaji Sabtu"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Cetak</span> Slip Gaji
          </button>
        </div>
      </div>

      {/* Week Range Banner & Payment Status */}
      <div className="mt-5 p-4 rounded-xl bg-purple-50/60 border border-purple-200/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-purple-900 uppercase tracking-wider">
            Periode Kerja 1 Minggu:
          </span>
          <div className="text-sm font-black text-stone-900 mt-0.5">
            {formatIndonesianDate(daysInWeek[0])} — {formatIndonesianDate(daysInWeek[6])}
          </div>
          <div className="text-xs text-stone-600 mt-1">
            Total {workers.length} karyawan terdaftar di proyek ini.
          </div>
        </div>

        {/* Total & Paid Toggle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 self-start md:self-auto">
          <div className="text-left md:text-right">
            <span className="text-[11px] font-semibold text-stone-500 uppercase">
              Total Gaji Dibayarkan
            </span>
            <div className="text-2xl font-black text-purple-950">
              {formatRupiah(grandTotalWageThisWeek)}
            </div>
            {isPaid ? (
              <span className={`text-[10px] font-bold block mt-0.5 ${
                currentMethod === 'tunai' ? 'text-emerald-700' : 'text-blue-700'
              }`}>
                {currentMethod === 'tunai' ? '💵 Terbayar Tunai (Potong Cash)' : '🏦 Terbayar Transfer Rekening'}
              </span>
            ) : (
              <div className="flex items-center gap-1 mt-1 text-[10px]">
                <span className="text-stone-400 font-medium">Metode:</span>
                <button
                  type="button"
                  onClick={() => setPayrollPaymentMethod('tunai')}
                  className={`px-1.5 py-0.5 rounded font-bold transition border ${
                    payrollPaymentMethod === 'tunai'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-50'
                  }`}
                  title="Bayar Tunai / Cash (Otomatis potong uang cash di tangan)"
                >
                  💵 Tunai
                </button>
                <button
                  type="button"
                  onClick={() => setPayrollPaymentMethod('transfer')}
                  className={`px-1.5 py-0.5 rounded font-bold transition border ${
                    payrollPaymentMethod === 'transfer'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-50'
                  }`}
                  title="Bayar Transfer Bank (Potong saldo rekening)"
                >
                  🏦 Transfer
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col items-start sm:items-end">
            <button
              id="toggle-paid-saturday-btn"
              onClick={() => onToggleWeeklyPayment(selectedSaturday, grandTotalWageThisWeek, payrollPaymentMethod)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs ${
                isPaid
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-stone-800 hover:bg-stone-900 text-white'
              }`}
              title={isPaid ? 'Klik jika ingin membatalkan status bayar' : 'Klik saat uang sudah diserahkan ke karyawan untuk memotong saldo kas/rekening'}
            >
              {isPaid ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Sudah Dibayar (Saldo Terpotong)
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Klik Sudah Dibayar (Potong Saldo)
                </>
              )}
            </button>
            <span className="text-[10px] text-stone-500 mt-1">
              {isPaid ? 'Status: Lunas • Saldo telah terpotong' : 'Absensi belum memotong saldo hingga tombol ini diklik'}
            </span>
          </div>
        </div>
      </div>

      {/* Temporary Workers This Week Info Banner */}
      {tempWorkersThisWeek.length > 0 && (
        <div className="mt-4 p-3.5 bg-amber-50/90 border border-amber-200 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 text-amber-950">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
              <HardHat className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold">Info Pekerja Sekali Pakai (Ngecor) Minggu Ini:</span>
              <p className="text-amber-900/80 text-[11px] mt-0.5">
                Ada {tempWorkersThisWeek.length} catatan tenaga lepas/cabutan dengan total upah <strong>{formatRupiah(totalTempWageThisWeek)}</strong> pada periode minggu ini.
              </p>
            </div>
          </div>
          {onNavigateToTemporary && (
            <button
              type="button"
              onClick={onNavigateToTemporary}
              className="text-xs font-bold text-amber-800 hover:text-amber-950 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg border border-amber-300 transition shrink-0 self-start sm:self-auto"
            >
              Lihat Rincian Pekerja Cor &rarr;
            </button>
          )}
        </div>
      )}

      {/* Search Bar */}
      <div className="mt-5 p-3 bg-stone-50 rounded-xl border border-stone-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama karyawan..."
            className="w-full pl-8 pr-3 py-1 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <span className="text-xs text-stone-500 font-medium">
          Menampilkan {filteredSummaries.length} dari {workers.length} karyawan
        </span>
      </div>

      {/* Payroll Table */}
      <div className="mt-4 overflow-x-auto">
        {workers.length === 0 ? (
          <div className="text-center py-12 px-4 border-2 border-dashed border-stone-200 rounded-2xl bg-stone-50/50">
            <Users className="w-10 h-10 text-stone-400 mx-auto mb-2" />
            <h4 className="font-bold text-stone-800 text-sm">Belum Ada Karyawan Terdaftar</h4>
            <p className="text-xs text-stone-500 mt-1">
              Tambahkan karyawan di tab "Absensi & Gaji Harian" untuk melihat rekap gaji Sabtu di sini.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50 text-stone-600 uppercase font-bold text-[11px]">
                <th className="py-3 px-3">No</th>
                <th className="py-3 px-3">Nama Karyawan</th>
                <th className="py-3 px-3">Tarif/Hari</th>
                {daysInWeek.map((dateStr) => {
                  const day = getDayName(dateStr);
                  const isSunday = day === 'Minggu';
                  const dayNum = dateStr.split('-')[2];
                  return (
                    <th key={dateStr} className={`py-3 px-2 text-center ${isSunday ? 'bg-rose-50/70 border-x border-rose-100' : ''}`}>
                      <div className={isSunday ? 'text-rose-600 font-extrabold' : ''}>{day.slice(0, 3)}</div>
                      <div className={`text-[10px] ${isSunday ? 'text-rose-500 font-bold' : 'text-stone-400 font-normal'}`}>{dayNum}</div>
                    </th>
                  );
                })}
                <th className="py-3 px-3 text-center">Hari Kerja</th>
                <th className="py-3 px-3 text-right">Total Gaji Sabtu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium">
              {filteredSummaries.length === 0 ? (
                <tr>
                  <td colSpan={5 + daysInWeek.length} className="text-center py-8 text-stone-400 text-xs">
                    Tidak ada karyawan yang sesuai pencarian "{searchQuery}".
                  </td>
                </tr>
              ) : (
                filteredSummaries.map((summary, idx) => {
                  const { worker, totalWage, dailyBreakdown, effectiveDays } = summary;
                  return (
                    <tr 
                      key={worker.id}
                      className="hover:bg-stone-50/70 transition text-stone-800"
                    >
                      <td className="py-3 px-3 font-bold text-stone-400">#{idx + 1}</td>
                      <td className="py-3 px-3">
                        <div className="font-extrabold text-stone-900">
                          {worker.name}
                        </div>
                        {worker.role && (
                          <div className="text-[10px] text-stone-500 font-medium">
                            {worker.role}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-stone-600">
                        {worker.dailyWage > 0 ? formatRupiah(worker.dailyWage) : '-'}
                      </td>

                      {/* 7 Day Attendance Badges (Minggu s/d Sabtu) */}
                      {dailyBreakdown.map((d: { dateStr: string; status?: AttendanceStatus; wage: number }) => {
                        const isSunday = getDayName(d.dateStr) === 'Minggu';
                        let badgeClass = 'text-stone-300 bg-stone-50';
                        let label = '-';
                        if (d.status === 'H') {
                          badgeClass = 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-200';
                          label = 'H';
                        } else if (d.status === 'S') {
                          badgeClass = 'bg-amber-100 text-amber-800 font-bold border border-amber-200';
                          label = 'S';
                        } else if (d.status === 'A') {
                          badgeClass = 'bg-rose-50 text-rose-600 font-bold border border-rose-200';
                          label = 'A';
                        }

                        return (
                          <td key={d.dateStr} className={`py-2.5 px-1.5 text-center ${isSunday ? 'bg-rose-50/30 border-x border-rose-50' : ''}`}>
                            <span 
                              className={`inline-block w-6 h-6 leading-6 rounded-md text-[11px] ${badgeClass}`}
                              title={`${d.status === 'H' ? 'Hadir' : d.status === 'S' ? 'Setengah Hari' : d.status === 'A' ? 'Alfa' : 'Belum Diisi'}: ${formatRupiah(d.wage)}`}
                            >
                              {label}
                            </span>
                          </td>
                        );
                      })}

                      <td className="py-3 px-3 text-center font-bold text-stone-700">
                        {effectiveDays > 0 ? `${effectiveDays} Hari` : '-'}
                      </td>
                      <td className="py-3 px-3 text-right font-black text-stone-900 text-sm">
                        {formatRupiah(totalWage)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-stone-200 bg-stone-50/80 font-black text-stone-900">
                <td colSpan={3 + daysInWeek.length} className="py-3.5 px-3 text-right uppercase tracking-wider text-xs">
                  Total Gaji Dibayarkan Hari Sabtu Ini:
                </td>
                <td className="py-3.5 px-3 text-center text-xs">
                  {workerSummaries.reduce((sum, w) => sum + w.effectiveDays, 0)} Hari
                </td>
                <td className="py-3.5 px-3 text-right text-base text-purple-950 font-black">
                  {formatRupiah(grandTotalWageThisWeek)}
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
};
