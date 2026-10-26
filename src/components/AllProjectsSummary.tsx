import React from 'react';
import { 
  Building2, 
  CircleDollarSign, 
  Users, 
  UtensilsCrossed, 
  ShoppingCart, 
  Wallet, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Receipt,
  FileText,
  Printer,
  HardHat,
  Truck,
  RotateCcw
} from 'lucide-react';
import { ProjectData } from '../types';
import { formatRupiah, calculateDayWage } from '../utils/formatters';

interface AllProjectsSummaryProps {
  projects: ProjectData[];
  onSelectProject: (id: string) => void;
  onResetProject?: (project: ProjectData) => void;
}

export const AllProjectsSummary: React.FC<AllProjectsSummaryProps> = ({
  projects,
  onSelectProject,
  onResetProject,
}) => {
  // Compute analytics for each project
  const projectStats = projects.map((p) => {
    let wages = 0;
    const wageMap = new Map<string, number>();
    p.workers.forEach((w) => wageMap.set(w.id, w.dailyWage));

    Object.values(p.attendance).forEach((dayRecords) => {
      Object.entries(dayRecords).forEach(([workerId, rec]) => {
        const base = wageMap.get(workerId) || 0;
        wages += calculateDayWage(rec.status, base, rec.customWage);
      });
    });

    const temporaryWages = (p.temporaryWorkers || []).reduce((sum, t) => sum + t.totalAmount, 0);
    const concreteCost = (p.concreteCastings || []).reduce((sum, c) => sum + c.grandTotal, 0);

    const konsumsi = p.expenses
      .filter((e) => e.category === 'konsumsi')
      .reduce((sum, e) => sum + e.amount, 0);

    const nonKonsumsi = p.expenses
      .filter((e) => e.category !== 'konsumsi')
      .reduce((sum, e) => sum + e.amount, 0);

    const totalExpense = wages + temporaryWages + concreteCost + konsumsi + nonKonsumsi;
    const dealAmount = p.ownerDealAmount || 0;
    const remaining = dealAmount - totalExpense;

    const terminsReceived = (p.ownerTermins || []).reduce((sum, t) => sum + t.amount, 0);
    const sisaTagihan = Math.max(0, dealAmount - terminsReceived);

    const activeWorkersCount = p.workers.filter(
      (w) => w.name.trim().length > 0 || w.dailyWage > 0
    ).length;

    return {
      project: p,
      dealAmount,
      terminsReceived,
      sisaTagihan,
      wages,
      temporaryWages,
      concreteCost,
      konsumsi,
      nonKonsumsi,
      totalExpense,
      remaining,
      activeWorkersCount,
    };
  });

  // Grand totals across all 5 projects
  const grandTotalDeal = projectStats.reduce((sum, s) => sum + s.dealAmount, 0);
  const grandTotalDealCash = projects.reduce((sum, p) => sum + (p.ownerDealCash || 0), 0);
  const grandTotalDealBank = projects.reduce((sum, p) => sum + (p.ownerDealBank || 0), 0);
  const grandTotalTermins = projectStats.reduce((sum, s) => sum + s.terminsReceived, 0);
  const grandTotalTerminCash = projects.reduce(
    (sum, p) => sum + (p.ownerTermins || []).filter((t) => t.paymentMethod === 'cash').reduce((s, t) => s + t.amount, 0),
    0
  );
  const grandTotalTerminBank = projects.reduce(
    (sum, p) => sum + (p.ownerTermins || []).filter((t) => t.paymentMethod !== 'cash').reduce((s, t) => s + t.amount, 0),
    0
  );
  const grandTotalWages = projectStats.reduce((sum, s) => sum + s.wages, 0);
  const grandTotalTemporaryWages = projectStats.reduce((sum, s) => sum + s.temporaryWages, 0);
  const grandTotalConcrete = projectStats.reduce((sum, s) => sum + s.concreteCost, 0);
  const grandTotalKonsumsi = projectStats.reduce((sum, s) => sum + s.konsumsi, 0);
  const grandTotalNonKonsumsi = projectStats.reduce((sum, s) => sum + s.nonKonsumsi, 0);
  const grandTotalExpense = projectStats.reduce((sum, s) => sum + s.totalExpense, 0);
  const grandTotalRemaining = grandTotalDeal - grandTotalExpense;

  const handlePrintSummary = () => {
    window.print();
  };

  return (
    <div id="all-projects-summary" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center font-bold">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-stone-900 tracking-tight">
              Rekapitulasi Gabungan 5 Proyek Borongan
            </h2>
            <p className="text-xs text-stone-500">
              Laporan terpadu perbandingan deal owner, beban gaji tukang, dan konsumsi untuk 5 proyek
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrintSummary}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition border border-stone-200"
          >
            <Printer className="w-4 h-4" />
            Cetak Rekap 5 Proyek
          </button>
        </div>
      </div>

      {/* Aggregate 6 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* Deal Owner */}
        <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-2xs">
          <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1 mb-1">
            <CircleDollarSign className="w-3.5 h-3.5 text-stone-600" />
            Total Deal (5 Proyek)
          </div>
          <div className="text-xl font-black text-stone-900">
            {formatRupiah(grandTotalDeal)}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">
            Uang Masuk: {formatRupiah(grandTotalTermins)}
          </div>
          {(grandTotalDealCash > 0 || grandTotalDealBank > 0) && (
            <div className="text-[10px] text-stone-500 font-medium mt-1 pt-1 border-t border-stone-100 flex items-center justify-between">
              <span className="text-emerald-700 font-bold">💵 {formatRupiah(grandTotalDealCash)}</span>
              <span className="text-blue-700 font-bold">🏦 {formatRupiah(grandTotalDealBank)}</span>
            </div>
          )}
        </div>

        {/* Gaji Pegawai */}
        <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-2xs">
          <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1 mb-1">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            Total Gaji Karyawan
          </div>
          <div className="text-xl font-black text-blue-900">
            {formatRupiah(grandTotalWages)}
          </div>
          <div className="text-[11px] text-stone-400 mt-1">
            Akumulasi 5 proyek
          </div>
        </div>

        {/* Upah Pekerja Sekali Pakai (Cor/Lepas) */}
        <div className="bg-white rounded-xl p-4 border border-amber-200 bg-amber-50/30 shadow-2xs">
          <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1 mb-1">
            <HardHat className="w-3.5 h-3.5 text-amber-600" />
            Pekerja Cor / Lepas
          </div>
          <div className="text-xl font-black text-amber-950">
            {formatRupiah(grandTotalTemporaryWages)}
          </div>
          <div className="text-[11px] text-amber-800/80 mt-1">
            Tenaga cabutan ngecor 5 proyek
          </div>
        </div>

        {/* Cor Jayamix & Sewa Pompa */}
        <div className="bg-white rounded-xl p-4 border border-sky-200 bg-sky-50/30 shadow-2xs">
          <div className="text-[11px] font-bold text-sky-900 uppercase tracking-wider flex items-center gap-1 mb-1">
            <Truck className="w-3.5 h-3.5 text-sky-700" />
            Cor Jayamix & Pompa
          </div>
          <div className="text-xl font-black text-sky-950">
            {formatRupiah(grandTotalConcrete)}
          </div>
          <div className="text-[11px] text-sky-800/80 mt-1">
            Ready-mix & concrete pump
          </div>
        </div>

        {/* Konsumsi & Logistik */}
        <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-2xs">
          <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1 mb-1">
            <UtensilsCrossed className="w-3.5 h-3.5 text-orange-600" />
            Total Biaya Konsumsi
          </div>
          <div className="text-xl font-black text-orange-950">
            {formatRupiah(grandTotalKonsumsi)}
          </div>
          <div className="text-[11px] text-stone-400 mt-1">
            Kopi, rokok, makan siang
          </div>
        </div>

        {/* Total Keuntungan Bersih */}
        <div className={`rounded-xl p-4 border shadow-2xs ${
          grandTotalRemaining < 0 
            ? 'bg-red-50 border-red-200' 
            : 'bg-emerald-50 border-emerald-200'
        }`}>
          <div className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 mb-1 text-emerald-800">
            <Wallet className="w-3.5 h-3.5" />
            Total Sisa Saldo / Profit
          </div>
          <div className={`text-xl font-black ${
            grandTotalRemaining < 0 ? 'text-red-700' : 'text-emerald-900'
          }`}>
            {formatRupiah(grandTotalRemaining)}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            {grandTotalRemaining < 0 ? 'Defisit keseluruhan' : 'Profit bersih 5 proyek'}
          </div>
        </div>
      </div>

      {/* Comparative Detailed Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 md:p-6 overflow-hidden">
        <h3 className="text-sm font-extrabold text-stone-900 uppercase tracking-wider mb-4">
          Tabel Komparasi Rincian 5 Proyek
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50 text-stone-600 font-bold">
                <th className="p-3">No</th>
                <th className="p-3">Nama Proyek & Owner</th>
                <th className="p-3 text-right">Nilai Deal Owner</th>
                <th className="p-3 text-right">Termin Diterima</th>
                <th className="p-3 text-right text-blue-900">Gaji Karyawan</th>
                <th className="p-3 text-right text-amber-900">Pekerja Cor/Lepas</th>
                <th className="p-3 text-right text-sky-900">Jayamix & Pompa</th>
                <th className="p-3 text-right text-orange-950">Konsumsi</th>
                <th className="p-3 text-right text-stone-700">Material/Lain</th>
                <th className="p-3 text-right">Total Belanja</th>
                <th className="p-3 text-right text-emerald-900">Sisa Saldo</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium">
              {projectStats.map((item) => {
                const { project, dealAmount, terminsReceived, wages, temporaryWages, concreteCost, konsumsi, nonKonsumsi, totalExpense, remaining } = item;
                return (
                  <tr key={project.id} className="hover:bg-stone-50 transition">
                    <td className="p-3 font-bold text-stone-400">
                      <span className="w-6 h-6 rounded-md bg-stone-200 flex items-center justify-center text-xs text-stone-700">
                        {project.projectNumber}
                      </span>
                    </td>

                    <td className="p-3">
                      <div className="font-extrabold text-stone-900 text-sm">
                        {project.projectName || `Proyek ${project.projectNumber}`}
                      </div>
                      <div className="text-[11px] text-stone-500 mt-0.5 flex flex-wrap items-center gap-2">
                        {project.ownerName ? (
                          <span>Owner: <strong>{project.ownerName}</strong></span>
                        ) : (
                          <span className="text-stone-400">Owner belum diisi</span>
                        )}
                        {project.ownerPhone && <span>({project.ownerPhone})</span>}
                        {project.ownerDealNotes && (
                          <span className="inline-flex items-center gap-0.5 text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded text-[10px] border border-amber-200">
                            <FileText className="w-2.5 h-2.5" />
                            Ada Catatan
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-3 text-right font-bold text-stone-900 whitespace-nowrap">
                      <div>{formatRupiah(dealAmount)}</div>
                      {((project.ownerDealCash || 0) > 0 || (project.ownerDealBank || 0) > 0) && (
                        <div className="text-[10px] text-stone-500 font-medium mt-0.5">
                          {(project.ownerDealCash || 0) > 0 && <span className="text-emerald-700">💵 {formatRupiah(project.ownerDealCash || 0)}</span>}
                          {(project.ownerDealCash || 0) > 0 && (project.ownerDealBank || 0) > 0 && <span> | </span>}
                          {(project.ownerDealBank || 0) > 0 && <span className="text-blue-700">🏦 {formatRupiah(project.ownerDealBank || 0)}</span>}
                        </div>
                      )}
                    </td>

                    <td className="p-3 text-right font-semibold text-emerald-800 whitespace-nowrap">
                      <div>{formatRupiah(terminsReceived)}</div>
                      {terminsReceived > 0 && (
                        <div className="text-[10px] text-stone-500 font-medium mt-0.5">
                          <span className="text-emerald-700">💵 {formatRupiah((project.ownerTermins || []).filter(t => t.paymentMethod === 'cash').reduce((s, t) => s + t.amount, 0))}</span>
                          <span> | </span>
                          <span className="text-blue-700">🏦 {formatRupiah((project.ownerTermins || []).filter(t => t.paymentMethod !== 'cash').reduce((s, t) => s + t.amount, 0))}</span>
                        </div>
                      )}
                    </td>

                    <td className="p-3 text-right font-bold text-blue-900 whitespace-nowrap">
                      {formatRupiah(wages)}
                    </td>

                    <td className="p-3 text-right font-bold text-amber-950 whitespace-nowrap">
                      {formatRupiah(temporaryWages)}
                    </td>

                    <td className="p-3 text-right font-bold text-sky-950 whitespace-nowrap">
                      {formatRupiah(concreteCost)}
                    </td>

                    <td className="p-3 text-right font-bold text-orange-950 whitespace-nowrap">
                      {formatRupiah(konsumsi)}
                    </td>

                    <td className="p-3 text-right font-semibold text-stone-700 whitespace-nowrap">
                      {formatRupiah(nonKonsumsi)}
                    </td>

                    <td className="p-3 text-right font-bold text-stone-900 whitespace-nowrap">
                      {formatRupiah(totalExpense)}
                    </td>

                    <td className="p-3 text-right font-black whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-md ${
                        remaining < 0 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-emerald-100 text-emerald-900'
                      }`}>
                        {formatRupiah(remaining)}
                      </span>
                    </td>

                    <td className="p-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onSelectProject(project.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition shadow-2xs"
                          title="Buka dan kelola proyek ini"
                        >
                          Buka
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        {onResetProject && (
                          <button
                            type="button"
                            onClick={() => onResetProject(project)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition shadow-2xs"
                            title="Reset data proyek ini jika sudah selesai untuk digunakan kembali"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                            Reset
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-stone-200 bg-stone-50 font-black text-xs">
                <td colSpan={2} className="p-3 uppercase text-stone-800">
                  GRAND TOTAL (5 PROYEK):
                </td>
                <td className="p-3 text-right text-stone-900 whitespace-nowrap">
                  {formatRupiah(grandTotalDeal)}
                </td>
                <td className="p-3 text-right text-emerald-900 whitespace-nowrap">
                  {formatRupiah(grandTotalTermins)}
                </td>
                <td className="p-3 text-right text-blue-950 whitespace-nowrap">
                  {formatRupiah(grandTotalWages)}
                </td>
                <td className="p-3 text-right text-amber-950 whitespace-nowrap">
                  {formatRupiah(grandTotalTemporaryWages)}
                </td>
                <td className="p-3 text-right text-sky-950 whitespace-nowrap">
                  {formatRupiah(grandTotalConcrete)}
                </td>
                <td className="p-3 text-right text-orange-950 whitespace-nowrap">
                  {formatRupiah(grandTotalKonsumsi)}
                </td>
                <td className="p-3 text-right text-stone-800 whitespace-nowrap">
                  {formatRupiah(grandTotalNonKonsumsi)}
                </td>
                <td className="p-3 text-right text-stone-900 whitespace-nowrap">
                  {formatRupiah(grandTotalExpense)}
                </td>
                <td className="p-3 text-right text-emerald-950 font-black whitespace-nowrap">
                  {formatRupiah(grandTotalRemaining)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
