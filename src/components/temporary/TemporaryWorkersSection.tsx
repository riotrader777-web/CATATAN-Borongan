import React, { useState, useMemo } from 'react';
import { 
  HardHat, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  Printer, 
  Trash2, 
  Edit3, 
  Share2, 
  Users, 
  Coins, 
  Calendar, 
  Zap, 
  AlertCircle,
  CreditCard,
  MessageCircle,
  Building2
} from 'lucide-react';
import { ProjectData, TemporaryWorkerPayment } from '../../types';
import { formatRupiah, formatIndonesianDate, formatShortDate } from '../../utils/formatters';
import { TemporaryWorkerModal } from './TemporaryWorkerModal';
import { TemporaryWorkerPrintSlipModal } from './TemporaryWorkerPrintSlipModal';

interface TemporaryWorkersSectionProps {
  project: ProjectData;
  onAddTemporaryWorker: (data: Omit<TemporaryWorkerPayment, 'id' | 'createdAt'>) => void;
  onUpdateTemporaryWorker: (id: string, updated: Partial<TemporaryWorkerPayment>) => void;
  onDeleteTemporaryWorker: (id: string) => void;
  onTogglePaid: (id: string) => void;
}

export const TemporaryWorkersSection: React.FC<TemporaryWorkersSectionProps> = ({
  project,
  onAddTemporaryWorker,
  onUpdateTemporaryWorker,
  onDeleteTemporaryWorker,
  onTogglePaid,
}) => {
  const temporaryWorkers = project.temporaryWorkers || [];

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TemporaryWorkerPayment | null>(null);
  const [printingRecord, setPrintingRecord] = useState<TemporaryWorkerPayment | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [taskFilter, setTaskFilter] = useState<string>('all');

  // KPI Calculations
  const { totalExpense, totalPaid, totalUnpaid, totalHeadcount, unpaidCount } = useMemo(() => {
    let expense = 0;
    let paid = 0;
    let unpaid = 0;
    let headcount = 0;
    let unpaidItems = 0;

    temporaryWorkers.forEach((rec) => {
      expense += rec.totalAmount;
      headcount += rec.headcount;
      if (rec.isPaid) {
        paid += rec.totalAmount;
      } else {
        unpaid += rec.totalAmount;
        unpaidItems += 1;
      }
    });

    return {
      totalExpense: expense,
      totalPaid: paid,
      totalUnpaid: unpaid,
      totalHeadcount: headcount,
      unpaidCount: unpaidItems,
    };
  }, [temporaryWorkers]);

  // Filtered List
  const filteredRecords = useMemo(() => {
    return temporaryWorkers.filter((rec) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = rec.workerName.toLowerCase().includes(q);
        const matchesTask = rec.taskDescription.toLowerCase().includes(q);
        const matchesNotes = rec.notes ? rec.notes.toLowerCase().includes(q) : false;
        if (!matchesName && !matchesTask && !matchesNotes) return false;
      }

      // Status
      if (statusFilter === 'paid' && !rec.isPaid) return false;
      if (statusFilter === 'unpaid' && rec.isPaid) return false;

      // Task
      if (taskFilter !== 'all') {
        if (!rec.taskDescription.toLowerCase().includes(taskFilter.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [temporaryWorkers, searchQuery, statusFilter, taskFilter]);

  // Open WhatsApp share
  const handleShareWhatsApp = (rec: TemporaryWorkerPayment) => {
    const statusText = rec.isPaid ? 'SUDAH DIBAYAR LUNAS (CASH)' : 'BELUM DIBAYAR';
    const text = `*BUKTI PEMBAYARAN UPAH KERJA LEPAS (NGECOR)*%0A` +
      `------------------------------------%0A` +
      `*Proyek:* ${project.projectName}%0A` +
      `*Tanggal:* ${formatIndonesianDate(rec.date)}%0A` +
      `*Nama Pekerja/Tim:* ${rec.workerName}%0A` +
      `*Pekerjaan:* ${rec.taskDescription}%0A` +
      `*Jumlah:* ${rec.headcount} Orang ${rec.ratePerPerson > 0 ? `(@ ${formatRupiah(rec.ratePerPerson)})` : ''}%0A` +
      `*Total Upah:* ${formatRupiah(rec.totalAmount)}%0A` +
      `*Status:* ${statusText}%0A` +
      `*Metode:* ${rec.paymentMethod === 'transfer' ? 'Transfer Bank' : 'Tunai Langsung'}%0A` +
      (rec.notes ? `*Catatan:* ${rec.notes}%0A` : '') +
      `------------------------------------%0A` +
      `_Pencatatan Mandor Proyek_`;
    
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const getWageTypeBadge = (type: string) => {
    switch (type) {
      case 'harian':
        return { label: 'Harian Lepas', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'borongan':
        return { label: 'Borongan Flat', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'setengah_hari':
        return { label: 'Setengah Hari', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'lembur_cor':
        return { label: 'Lembur Cor', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
      default:
        return { label: 'Lepas', bg: 'bg-stone-50 text-stone-700 border-stone-200' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold shadow-xs">
              <HardHat className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-black text-stone-900 tracking-tight">
                  Karyawan Sekali Pakai (Ngecor & Harian Lepas)
                </h2>
                <span className="px-2 py-0.5 text-[11px] font-extrabold uppercase bg-amber-100 text-amber-900 border border-amber-300 rounded-md">
                  Proyek {project.projectNumber}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Pencatatan upah tenaga lepas/cabutan saat ngecor dak, balok, pondasi, langsir material tanpa membebani 50 slot pegawai tetap.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setEditingRecord(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 active:scale-98 rounded-xl shadow-md transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            + Catat Pekerja Sekali Pakai
          </button>
        </div>

        {/* 4 Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-5">
          {/* KPI 1: Total Upah Lepas */}
          <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200/80">
            <div className="flex items-center justify-between text-stone-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-600" />
                Total Upah Pekerja Lepas
              </span>
              <span className="text-[10px] font-bold text-stone-600 bg-stone-200/80 px-1.5 py-0.2 rounded">
                {temporaryWorkers.length} Catatan
              </span>
            </div>
            <p className="text-lg md:text-xl font-black text-stone-900 tracking-tight">
              {formatRupiah(totalExpense)}
            </p>
            <span className="text-[10px] text-stone-500 mt-1 block">
              Memotong total sisa anggaran proyek
            </span>
          </div>

          {/* KPI 2: Sudah Dibayar */}
          <div className="bg-emerald-50/70 rounded-xl p-3.5 border border-emerald-200/80">
            <div className="flex items-center justify-between text-emerald-800 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                Sudah Dibayar (Lunas)
              </span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-200/70 px-1.5 py-0.2 rounded">
                Cash / Transfer
              </span>
            </div>
            <p className="text-lg md:text-xl font-black text-emerald-900 tracking-tight">
              {formatRupiah(totalPaid)}
            </p>
            <span className="text-[10px] text-emerald-700/80 mt-1 block">
              Upah langsung diterima tukang cor
            </span>
          </div>

          {/* KPI 3: Belum Dibayar */}
          <div className="bg-rose-50/70 rounded-xl p-3.5 border border-rose-200/80">
            <div className="flex items-center justify-between text-rose-800 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-rose-600" />
                Belum Dibayar
              </span>
              {unpaidCount > 0 && (
                <span className="text-[10px] font-bold text-white bg-rose-600 px-1.5 py-0.2 rounded-full">
                  {unpaidCount} Antrean
                </span>
              )}
            </div>
            <p className="text-lg md:text-xl font-black text-rose-950 tracking-tight">
              {formatRupiah(totalUnpaid)}
            </p>
            <span className="text-[10px] text-rose-700/80 mt-1 block">
              {unpaidCount > 0 ? 'Perlu diselesaikan pembayarannya' : 'Seluruh upah lepas telah lunas'}
            </span>
          </div>

          {/* KPI 4: Total Tenaga Cabutan */}
          <div className="bg-blue-50/70 rounded-xl p-3.5 border border-blue-200/80">
            <div className="flex items-center justify-between text-blue-800 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                Total Tukang Cabutan
              </span>
              <span className="text-[10px] font-bold text-blue-800 bg-blue-200/70 px-1.5 py-0.2 rounded">
                Tenaga Tambahan
              </span>
            </div>
            <p className="text-lg md:text-xl font-black text-blue-950 tracking-tight">
              {totalHeadcount} Orang
            </p>
            <span className="text-[10px] text-blue-700/80 mt-1 block">
              Akumulasi pekerja sekali pakai
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama pekerja, jenis cor, atau catatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs font-medium bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Task category chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <select
            value={taskFilter}
            onChange={(e) => setTaskFilter(e.target.value)}
            className="px-2.5 py-2 text-xs font-semibold bg-stone-50 border border-stone-200 rounded-xl text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">Semua Pekerjaan</option>
            <option value="dak">Ngecor Dak</option>
            <option value="balok">Ngecor Balok / Kolom</option>
            <option value="sloof">Ngecor Sloof / Pondasi</option>
            <option value="langsir">Langsir Material</option>
            <option value="bekisting">Bongkar Bekisting</option>
            <option value="lembur">Lembur Cor</option>
          </select>

          {/* Status buttons */}
          <div className="flex items-center bg-stone-100 p-0.5 rounded-xl text-xs font-semibold shrink-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusFilter === 'all' ? 'bg-white text-stone-900 shadow-2xs font-bold' : 'text-stone-600'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setStatusFilter('unpaid')}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusFilter === 'unpaid' ? 'bg-rose-600 text-white shadow-2xs font-bold' : 'text-stone-600'
              }`}
            >
              Belum Bayar {unpaidCount > 0 && `(${unpaidCount})`}
            </button>
            <button
              onClick={() => setStatusFilter('paid')}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusFilter === 'paid' ? 'bg-emerald-600 text-white shadow-2xs font-bold' : 'text-stone-600'
              }`}
            >
              Lunas
            </button>
          </div>
        </div>
      </div>

      {/* Records List / Table */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-10 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
            <HardHat className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-stone-800">
            {temporaryWorkers.length === 0
              ? 'Belum Ada Catatan Pekerja Sekali Pakai'
              : 'Tidak Ada Data yang Cocok'}
          </h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto mt-1 mb-4">
            {temporaryWorkers.length === 0
              ? 'Gunakan fitur ini ketika ada acara pengecoran dak, balok, pondasi, atau tenaga lepas harian cabutan agar biaya upah tercatat rapi.'
              : 'Coba ubah kata kunci pencarian atau ganti filter status di atas.'}
          </p>
          <button
            onClick={() => {
              setEditingRecord(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            + Catat Pekerja Sekali Pakai Sekarang
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-stone-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="p-3.5">Tanggal</th>
                  <th className="p-3.5">Nama Pekerja / Kelompok</th>
                  <th className="p-3.5">Kegiatan / Pekerjaan</th>
                  <th className="p-3.5">Sistem Upah</th>
                  <th className="p-3.5 text-right">Total Upah</th>
                  <th className="p-3.5 text-center">Status Bayar</th>
                  <th className="p-3.5 text-center">Aksi & Kuitansi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredRecords.map((rec) => {
                  const wageBadge = getWageTypeBadge(rec.wageType);
                  return (
                    <tr key={rec.id} className="hover:bg-amber-50/30 transition">
                      {/* Tanggal */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="font-bold text-stone-900 block">
                          {formatShortDate(rec.date)}
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {rec.date}
                        </span>
                      </td>

                      {/* Nama Pekerja / Tim */}
                      <td className="p-3.5">
                        <div className="font-extrabold text-stone-900 text-sm">
                          {rec.workerName}
                        </div>
                        {rec.notes && (
                          <div className="text-[10px] text-stone-500 italic mt-0.5 line-clamp-1">
                            "{rec.notes}"
                          </div>
                        )}
                      </td>

                      {/* Pekerjaan / Acara */}
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 font-bold text-amber-950 bg-amber-50/80 px-2.5 py-1 rounded-lg border border-amber-200/80">
                          <HardHat className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          {rec.taskDescription}
                        </span>
                      </td>

                      {/* Sistem Upah */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${wageBadge.bg}`}>
                          {wageBadge.label}
                        </span>
                        <div className="text-[10px] text-stone-500 mt-0.5">
                          {rec.headcount} Orang {rec.ratePerPerson > 0 && `(@ ${formatRupiah(rec.ratePerPerson)})`}
                        </div>
                      </td>

                      {/* Total Upah */}
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="font-black text-sm text-stone-900">
                          {formatRupiah(rec.totalAmount)}
                        </div>
                        <span className="text-[10px] text-stone-400 capitalize">
                          {rec.paymentMethod === 'transfer' ? 'Transfer Bank' : 'Tunai / Cash'}
                        </span>
                      </td>

                      {/* Status Bayar */}
                      <td className="p-3.5 text-center whitespace-nowrap">
                        {rec.isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            Lunas
                          </span>
                        ) : (
                          <button
                            onClick={() => onTogglePaid(rec.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 transition"
                            title="Klik untuk tandai sudah lunas"
                          >
                            <Clock className="w-3.5 h-3.5 text-rose-600" />
                            Belum Bayar (Klik Bayar)
                          </button>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          {/* Cetak Slip Kuitansi */}
                          <button
                            onClick={() => setPrintingRecord(rec)}
                            className="p-1.5 text-stone-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition"
                            title="Cetak Kuitansi / Slip Upah"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* Kirim WhatsApp */}
                          <button
                            onClick={() => handleShareWhatsApp(rec)}
                            className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                            title="Kirim Rincian Upah ke WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => {
                              setEditingRecord(rec);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 text-stone-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Ubah Catatan"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`Hapus catatan upah pekerja sekali pakai "${rec.workerName}"?`)) {
                                onDeleteTemporaryWorker(rec.id);
                              }
                            }}
                            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <TemporaryWorkerModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRecord(null);
        }}
        onSave={(data) => {
          if (editingRecord) {
            onUpdateTemporaryWorker(editingRecord.id, data);
          } else {
            onAddTemporaryWorker(data);
          }
        }}
        initialData={editingRecord}
        projectName={project.projectName}
      />

      {/* Print Slip Modal */}
      <TemporaryWorkerPrintSlipModal
        isOpen={!!printingRecord}
        onClose={() => setPrintingRecord(null)}
        record={printingRecord}
        projectName={project.projectName}
      />
    </div>
  );
};
