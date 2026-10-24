import React, { useState, useMemo } from 'react';
import { 
  CreditCard, 
  Plus, 
  Search, 
  Filter, 
  ArrowDownRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Share2, 
  Printer, 
  Trash2, 
  Edit3, 
  Calendar, 
  Building2, 
  Info, 
  ArrowUpDown,
  History,
  Coins
} from 'lucide-react';
import { KasbonRecord, KasbonPayment, ProjectData } from '../../types';
import { 
  getKasbonRemaining, 
  getKasbonTotalPaid, 
  getKasbonProgressPercent, 
  isKasbonLunas, 
  getKasbonGlobalSummary,
  formatKasbonWhatsAppMessage
} from '../../utils/kasbon';
import { formatRupiah, formatIndonesianDate } from '../../utils/formatters';
import { KasbonPaymentModal } from './KasbonPaymentModal';
import { KasbonFormModal } from './KasbonFormModal';
import { KasbonDetailModal } from './KasbonDetailModal';
import { KasbonPrintSlipModal } from './KasbonPrintSlipModal';

interface KasbonSectionProps {
  kasbonList: KasbonRecord[];
  activeProject: ProjectData;
  allProjects: ProjectData[];
  onAddKasbon: (newRecord: Omit<KasbonRecord, 'id' | 'createdAt' | 'payments'>) => void;
  onUpdateKasbon: (recordId: string, updated: Partial<KasbonRecord>) => void;
  onDeleteKasbon: (recordId: string) => void;
  onAddPayment: (recordId: string, payment: Omit<KasbonPayment, 'id' | 'createdAt'>) => void;
  onDeletePayment: (recordId: string, paymentId: string) => void;
}

export const KasbonSection: React.FC<KasbonSectionProps> = ({
  kasbonList,
  activeProject,
  allProjects,
  onAddKasbon,
  onUpdateKasbon,
  onDeleteKasbon,
  onAddPayment,
  onDeletePayment,
}) => {
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unpaid' | 'paid'>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'remaining-desc' | 'date-desc' | 'name-asc'>('remaining-desc');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<KasbonRecord | null>(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [recordForPayment, setRecordForPayment] = useState<KasbonRecord | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [recordForDetail, setRecordForDetail] = useState<KasbonRecord | null>(null);

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [recordForPrint, setRecordForPrint] = useState<KasbonRecord | null>(null);

  // Compute global summary metrics
  const globalSummary = useMemo(() => {
    return getKasbonGlobalSummary(kasbonList);
  }, [kasbonList]);

  // Filtered & sorted list
  const filteredList = useMemo(() => {
    return kasbonList
      .filter((record) => {
        // Search
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchName = record.workerName.toLowerCase().includes(q);
          const matchRole = (record.workerRole || '').toLowerCase().includes(q);
          const matchReason = (record.reason || '').toLowerCase().includes(q);
          const matchProj = (record.projectName || '').toLowerCase().includes(q);
          if (!matchName && !matchRole && !matchReason && !matchProj) return false;
        }

        // Status
        const paidOff = isKasbonLunas(record);
        if (statusFilter === 'unpaid' && paidOff) return false;
        if (statusFilter === 'paid' && !paidOff) return false;

        // Project filter
        if (projectFilter !== 'all') {
          if (record.projectName !== projectFilter) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'remaining-desc') {
          const remA = getKasbonRemaining(a);
          const remB = getKasbonRemaining(b);
          return remB - remA;
        }
        if (sortBy === 'date-desc') {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        if (sortBy === 'name-asc') {
          return a.workerName.localeCompare(b.workerName);
        }
        return 0;
      });
  }, [kasbonList, searchTerm, statusFilter, projectFilter, sortBy]);

  // Handlers for launching modals
  const handleOpenAdd = () => {
    setRecordToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (rec: KasbonRecord) => {
    setRecordToEdit(rec);
    setIsFormModalOpen(true);
  };

  const handleOpenPayment = (rec: KasbonRecord) => {
    setRecordForPayment(rec);
    setIsPaymentModalOpen(true);
  };

  const handleOpenDetail = (rec: KasbonRecord) => {
    setRecordForDetail(rec);
    setIsDetailModalOpen(true);
  };

  const handleOpenPrint = (rec: KasbonRecord) => {
    setRecordForPrint(rec);
    setIsPrintModalOpen(true);
  };

  const handleShareWhatsApp = (record: KasbonRecord) => {
    const text = formatKasbonWhatsAppMessage(record);
    const cleanPhone = record.workerPhone?.replace(/[^\d]/g, '') || '';
    let waUrl = `https://wa.me/?text=${text}`;
    if (cleanPhone) {
      const intlPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
      waUrl = `https://wa.me/${intlPhone}?text=${text}`;
    }
    window.open(waUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Notice Banner: Terpisah Murni dari Hitungan Borongan Proyek */}
      <div className="p-4 bg-amber-500/10 border border-amber-300/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-stone-900 text-sm flex items-center gap-1.5">
              Buku Catatan Kasbon Pegawai
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                Otomatis Terpotong Saat Dicicil
              </span>
            </h3>
            <p className="text-stone-600 mt-0.5 leading-relaxed">
              Catatan kasbon ini <strong>murni pembukuan pinjaman pegawai</strong>. Nominal kasbon dan cicilan tersimpan mandiri, sehingga <strong>TIDAK terhubung ataupun memotong</strong> nilai kesepakatan borongan owner maupun kas belanja proyek.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-xs text-xs shrink-0 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Catat Kasbon Baru</span>
        </button>
      </div>

      {/* KPI Financial Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Kasbon Diberikan */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              Total Kasbon Diberikan
            </span>
            <div className="w-7 h-7 rounded-lg bg-stone-100 text-stone-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg sm:text-xl font-black text-stone-900">
              {formatRupiah(globalSummary.totalInitial)}
            </div>
            <span className="text-[11px] text-stone-500 font-medium">
              Dari {globalSummary.totalCount} catatan pegawai
            </span>
          </div>
        </div>

        {/* Card 2: Total Sudah Dicicil */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
              Total Sudah Dicicil
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg sm:text-xl font-black text-emerald-700">
              {formatRupiah(globalSummary.totalPaid)}
            </div>
            <span className="text-[11px] text-emerald-600 font-medium">
              Uang kasbon yang sudah kembali
            </span>
          </div>
        </div>

        {/* Card 3: Sisa Kasbon Belum Lunas (Highlight) */}
        <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-300 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">
              Sisa Kasbon Belum Lunas
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-200/60 text-amber-800 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg sm:text-xl font-black text-amber-950">
              {formatRupiah(globalSummary.totalRemaining)}
            </div>
            <span className="text-[11px] text-amber-800 font-medium">
              Uang yang masih berada di pegawai
            </span>
          </div>
        </div>

        {/* Card 4: Status Pegawai */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              Status Pegawai
            </span>
            <div className="w-7 h-7 rounded-lg bg-stone-100 text-stone-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center gap-3">
              <div>
                <span className="text-xs text-rose-600 font-bold block">Belum Lunas</span>
                <span className="text-lg font-black text-rose-700 block">
                  {globalSummary.activeCount}
                </span>
              </div>
              <div className="w-px h-8 bg-stone-200" />
              <div>
                <span className="text-xs text-emerald-600 font-bold block">Sudah Lunas</span>
                <span className="text-lg font-black text-emerald-700 block">
                  {globalSummary.lunasCount}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama pegawai, jabatan, proyek, atau alasan kasbon..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <div className="flex items-center bg-stone-100 p-0.5 rounded-xl font-bold">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  statusFilter === 'all'
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Semua ({globalSummary.totalCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('unpaid')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  statusFilter === 'unpaid'
                    ? 'bg-amber-500 text-white shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Belum Lunas ({globalSummary.activeCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('paid')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  statusFilter === 'paid'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Lunas ({globalSummary.lunasCount})
              </button>
            </div>

            {/* Filter by Project */}
            {allProjects.length > 0 && (
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">Semua Proyek</option>
                {allProjects.map((p) => (
                  <option key={p.id} value={p.projectName}>
                    {p.projectName}
                  </option>
                ))}
              </select>
            )}

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="remaining-desc">Sisa Terbesar</option>
              <option value="date-desc">Tanggal Pinjam Terbaru</option>
              <option value="name-asc">Nama Pegawai (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Kasbon List Cards */}
      <div className="space-y-3">
        {filteredList.length > 0 ? (
          filteredList.map((record) => {
            const totalPaid = getKasbonTotalPaid(record);
            const remaining = getKasbonRemaining(record);
            const percent = getKasbonProgressPercent(record);
            const isPaidOff = isKasbonLunas(record);
            const lastPayment = record.payments && record.payments.length > 0 
              ? record.payments[record.payments.length - 1] 
              : null;

            return (
              <div
                key={record.id}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-2xs hover:shadow-xs ${
                  isPaidOff ? 'border-emerald-200' : 'border-stone-200'
                }`}
              >
                <div className="p-4 sm:p-5 space-y-3.5">
                  {/* Card Header: Worker Name, Status, Tags */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-2xs ${
                        isPaidOff ? 'bg-emerald-600' : 'bg-amber-600'
                      }`}>
                        {isPaidOff ? <CheckCircle2 className="w-5 h-5" /> : <Coins className="w-5 h-5" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-extrabold text-stone-900 text-sm sm:text-base leading-tight">
                            {record.workerName}
                          </h4>

                          {isPaidOff ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              LUNAS (100%)
                            </span>
                          ) : totalPaid > 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              DICICIL ({percent}%)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              BELUM DICICIL
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-stone-500 font-medium mt-0.5 flex-wrap">
                          {record.workerRole && <span>{record.workerRole}</span>}
                          {record.projectName && (
                            <>
                              <span>•</span>
                              <span className="text-stone-700 font-semibold">{record.projectName}</span>
                            </>
                          )}
                          <span>•</span>
                          <span>Pinjam: {formatIndonesianDate(record.date)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      {!isPaidOff && (
                        <button
                          onClick={() => handleOpenPayment(record)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition"
                          title="Bayar cicilan kasbon ini"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Bayar Cicilan</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleOpenDetail(record)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition"
                        title="Lihat riwayat lengkap cicilan"
                      >
                        <History className="w-3.5 h-3.5 text-stone-600" />
                        <span className="hidden sm:inline">Riwayat ({record.payments?.length || 0})</span>
                      </button>

                      <button
                        onClick={() => handleShareWhatsApp(record)}
                        className="p-1.5 text-stone-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition"
                        title="Kirim rincian sisa kasbon ke WA"
                      >
                        <Share2 className="w-4 h-4 text-emerald-600" />
                      </button>

                      <button
                        onClick={() => handleOpenPrint(record)}
                        className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition"
                        title="Cetak Kuitansi Kasbon"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleOpenEdit(record)}
                        className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition"
                        title="Edit Catatan Kasbon"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Financial Breakdown Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-center text-xs">
                    <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                      <span className="text-[10px] text-stone-400 font-semibold uppercase block">
                        Pinjaman Awal
                      </span>
                      <span className="text-sm font-black text-stone-900 block mt-0.5">
                        {formatRupiah(record.initialAmount)}
                      </span>
                    </div>

                    <div className="p-2.5 bg-stone-50 rounded-xl border border-emerald-200">
                      <span className="text-[10px] text-emerald-600 font-semibold uppercase block">
                        Sudah Dicicil ({record.payments?.length || 0}x)
                      </span>
                      <span className="text-sm font-black text-emerald-700 block mt-0.5">
                        {formatRupiah(totalPaid)}
                      </span>
                    </div>

                    <div className={`p-2.5 rounded-xl border ${
                      isPaidOff 
                        ? 'bg-emerald-50 border-emerald-300' 
                        : 'bg-amber-50 border-amber-300'
                    }`}>
                      <span className="text-[10px] font-bold uppercase block opacity-75">
                        {isPaidOff ? 'Status' : 'Sisa Kasbon Belum Lunas'}
                      </span>
                      <span className={`text-sm sm:text-base font-black block mt-0.5 ${
                        isPaidOff ? 'text-emerald-800' : 'text-amber-950'
                      }`}>
                        {isPaidOff ? 'LUNAS (Rp 0)' : formatRupiah(remaining)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar of Installment */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-stone-500 font-semibold">
                      <span>Progres Pelunasan</span>
                      <span>{percent}% ({formatRupiah(totalPaid)} / {formatRupiah(record.initialAmount)})</span>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden border border-stone-200">
                      <div
                        className={`h-2 transition-all duration-300 ${isPaidOff ? 'bg-emerald-500' : 'bg-amber-500'}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  {/* Bottom Info: Reason & Last Payment Notice */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-stone-100 text-[11px] text-stone-600">
                    <div className="truncate">
                      {record.reason ? (
                        <span>Keperluan: <strong className="text-stone-800">{record.reason}</strong></span>
                      ) : (
                        <span className="italic text-stone-400">Tidak ada keterangan khusus</span>
                      )}
                    </div>

                    {lastPayment && (
                      <div className="text-emerald-700 font-medium shrink-0 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>
                          Cicilan terakhir: <strong>{formatRupiah(lastPayment.amount)}</strong> ({formatIndonesianDate(lastPayment.date)})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          /* Empty State */
          <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-stone-900 text-sm sm:text-base">
                {searchTerm || statusFilter !== 'all' || projectFilter !== 'all'
                  ? 'Tidak ada catatan kasbon yang cocok dengan filter'
                  : 'Belum Ada Catatan Kasbon Pegawai'}
              </h4>
              <p className="text-xs text-stone-500 max-w-md mx-auto mt-1">
                {searchTerm || statusFilter !== 'all' || projectFilter !== 'all'
                  ? 'Coba ubah kata kunci pencarian atau reset filter di atas.'
                  : 'Gunakan fitur ini untuk mencatat pinjaman kasbon pegawai. Saat pegawai mengangsur cicilan, sisa kasbon akan terpotong secara otomatis.'}
              </p>
            </div>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Catatan Kasbon Sekarang</span>
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <KasbonFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        recordToEdit={recordToEdit}
        activeProject={activeProject}
        allProjects={allProjects}
        onSave={(data) => {
          if (recordToEdit) {
            onUpdateKasbon(recordToEdit.id, data);
          } else {
            onAddKasbon(data as any);
          }
        }}
      />

      <KasbonPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        record={recordForPayment}
        onAddPayment={onAddPayment}
      />

      <KasbonDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        record={recordForDetail}
        onOpenPaymentModal={handleOpenPayment}
        onOpenEditModal={handleOpenEdit}
        onOpenPrintModal={handleOpenPrint}
        onDeleteRecord={onDeleteKasbon}
        onDeletePayment={onDeletePayment}
      />

      <KasbonPrintSlipModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        record={recordForPrint}
      />
    </div>
  );
};
