import React, { useState, useMemo } from 'react';
import { 
  Truck, 
  Wrench, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Printer, 
  Trash2, 
  Edit3, 
  Share2, 
  Calculator, 
  Coins, 
  Calendar, 
  AlertCircle,
  Building2,
  Banknote,
  Landmark,
  FileText,
  Layers,
  ChevronDown
} from 'lucide-react';
import { ConcreteCastingRecord, ProjectData } from '../../types';
import { formatRupiah, formatIndonesianDate } from '../../utils/formatters';
import { ConcreteCastingModal } from './ConcreteCastingModal';
import { ConcreteCastingPrintModal } from './ConcreteCastingPrintModal';
import { CastingVolumeCalculatorModal } from './CastingVolumeCalculatorModal';

interface ConcreteCastingSectionProps {
  project: ProjectData;
  onAddConcreteCasting: (data: Omit<ConcreteCastingRecord, 'id' | 'createdAt'>) => void;
  onUpdateConcreteCasting: (id: string, updated: Partial<ConcreteCastingRecord>) => void;
  onDeleteConcreteCasting: (id: string) => void;
  onTogglePaid: (id: string) => void;
  onNavigateToTab?: (tab: 'attendance' | 'saturday' | 'temporary' | 'expenses' | 'summary' | 'kasbon' | 'casting') => void;
}

export const ConcreteCastingSection: React.FC<ConcreteCastingSectionProps> = ({
  project,
  onAddConcreteCasting,
  onUpdateConcreteCasting,
  onDeleteConcreteCasting,
  onTogglePaid,
  onNavigateToTab,
}) => {
  const castings = project.concreteCastings || [];

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ConcreteCastingRecord | null>(null);
  const [printingRecord, setPrintingRecord] = useState<ConcreteCastingRecord | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [vendorFilter, setVendorFilter] = useState<string>('all');

  // KPI Calculations
  const { 
    totalGrandTotal, 
    totalConcreteCost, 
    totalPumpCost, 
    totalVolumeM3, 
    totalPaidAmount, 
    totalUnpaidAmount,
    unpaidCount 
  } = useMemo(() => {
    let grand = 0;
    let concrete = 0;
    let pump = 0;
    let volume = 0;
    let paid = 0;
    let unpaid = 0;
    let unpCount = 0;

    castings.forEach((c) => {
      grand += c.grandTotal;
      concrete += c.totalConcreteCost;
      pump += c.totalPumpCost;
      volume += c.volumeM3;

      if (c.isPaid) {
        paid += c.grandTotal;
      } else {
        unpaid += c.grandTotal;
        unpCount += 1;
      }
    });

    return {
      totalGrandTotal: grand,
      totalConcreteCost: concrete,
      totalPumpCost: pump,
      totalVolumeM3: parseFloat(volume.toFixed(2)),
      totalPaidAmount: paid,
      totalUnpaidAmount: unpaid,
      unpaidCount: unpCount,
    };
  }, [castings]);

  // Unique vendors for filtering
  const vendorOptions = useMemo(() => {
    const set = new Set<string>();
    castings.forEach((c) => {
      if (c.vendorName) set.add(c.vendorName);
    });
    return Array.from(set);
  }, [castings]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return castings.filter((c) => {
      const matchSearch = 
        c.castingSection.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.deliveryOrderNo && c.deliveryOrderNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.notes && c.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus = 
        statusFilter === 'all' ||
        (statusFilter === 'paid' && c.isPaid) ||
        (statusFilter === 'unpaid' && !c.isPaid);

      const matchVendor = vendorFilter === 'all' || c.vendorName === vendorFilter;

      return matchSearch && matchStatus && matchVendor;
    });
  }, [castings, searchQuery, statusFilter, vendorFilter]);

  const handleOpenAddModal = () => {
    setEditingRecord(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rec: ConcreteCastingRecord) => {
    setEditingRecord(rec);
    setIsModalOpen(true);
  };

  const handleSaveModal = (data: Omit<ConcreteCastingRecord, 'id' | 'createdAt'>, editingId?: string) => {
    if (editingId) {
      onUpdateConcreteCasting(editingId, data);
    } else {
      onAddConcreteCasting(data);
    }
  };

  const handleShareWhatsApp = (rec: ConcreteCastingRecord) => {
    const text = `*RINCIAN BIAYA COR JAYAMIX & POMPA*
Proyek: ${project.projectName}
Tanggal: ${formatIndonesianDate(rec.date)}
Bagian Cor: ${rec.castingSection}

*1. BETON READY MIX:*
- Suplier: ${rec.vendorName}
- Mutu Beton: ${rec.concreteQuality}
- Volume: ${rec.volumeM3} m³ (~ ${rec.truckCount || Math.ceil(rec.volumeM3 / 7)} molen)
- Harga/m³: ${formatRupiah(rec.pricePerM3)}
- Total Beton: ${formatRupiah(rec.totalConcreteCost)}

*2. SEWA CONCRETE PUMP:*
- Tipe Pompa: ${rec.pumpType}
- Biaya Pompa: ${formatRupiah(rec.pumpRentalCost)}
- Pipa Tambahan: ${formatRupiah(rec.pumpExtraPipeCost || 0)}
- Tips Kru & Sopir: ${formatRupiah(rec.operatorTips || 0)}
- Total Pompa: ${formatRupiah(rec.totalPumpCost)}

*TOTAL KESELURUHAN: ${formatRupiah(rec.grandTotal)}*
Status: ${rec.isPaid ? 'LUNAS' : 'TEMPO / BELUM BAYAR'} (${rec.paymentMethod === 'tunai' ? 'Tunai/Cash' : 'Transfer Rekening'})
${rec.deliveryOrderNo ? `No. DO: ${rec.deliveryOrderNo}\n` : ''}${rec.notes ? `Catatan: ${rec.notes}\n` : ''}`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Title Card */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
              <Truck className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide bg-amber-100 text-amber-900 rounded-md">
                  Pengecoran Struktur
                </span>
                <span className="text-xs text-stone-400 font-semibold">
                  {project.projectName}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-stone-900 tracking-tight mt-0.5">
                Biaya Cor Jayamix & Sewa Pompa Beton
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Pencatatan pemesanan beton ready mix, volume kubikasi dak (m³), armada molen, dan sewa pompa beton
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCalcOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition shadow-2xs"
              title="Hitung kebutuhan m3 plat dak, balok, atau kolom sebelum order"
            >
              <Calculator className="w-4 h-4 text-blue-700" />
              Kalkulator Kubikasi (m³)
            </button>

            <button
              type="button"
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              + Catat Order Jayamix & Pompa
            </button>
          </div>
        </div>

        {/* 4 KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-5">
          {/* KPI 1: Grand Total */}
          <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200/90 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                Total Biaya Pengecoran
              </span>
              <p className="text-base sm:text-xl font-black text-stone-900 tracking-tight mt-1">
                {formatRupiah(totalGrandTotal)}
              </p>
            </div>
            <div className="mt-2 pt-1.5 border-t border-stone-200/80 text-[10px] text-stone-500 flex justify-between">
              <span>{castings.length} order tercatat</span>
              <span className="font-bold text-stone-700">{totalVolumeM3} m³</span>
            </div>
          </div>

          {/* KPI 2: Beton Ready Mix */}
          <div className="bg-blue-50/50 rounded-xl p-3.5 border border-blue-200/90 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-blue-600" />
                Biaya Beton Jayamix
              </span>
              <p className="text-base sm:text-xl font-black text-blue-950 tracking-tight mt-1">
                {formatRupiah(totalConcreteCost)}
              </p>
            </div>
            <div className="mt-2 pt-1.5 border-t border-blue-200/80 text-[10px] text-blue-800">
              Total Cor: <strong>{totalVolumeM3} m³</strong>
            </div>
          </div>

          {/* KPI 3: Sewa Pompa */}
          <div className="bg-amber-50/50 rounded-xl p-3.5 border border-amber-200/90 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block flex items-center gap-1">
                <Wrench className="w-3.5 h-3.5 text-amber-600" />
                Biaya Sewa Pompa
              </span>
              <p className="text-base sm:text-xl font-black text-amber-950 tracking-tight mt-1">
                {formatRupiah(totalPumpCost)}
              </p>
            </div>
            <div className="mt-2 pt-1.5 border-t border-amber-200/80 text-[10px] text-amber-800">
              Termasuk sewa shift, pipa, & tips kru
            </div>
          </div>

          {/* KPI 4: Status Pembayaran */}
          <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200/90 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                Status Pembayaran Suplier
              </span>
              <div className="mt-1 space-y-0.5">
                <div className="text-xs font-bold text-emerald-800 flex justify-between">
                  <span>Lunas:</span>
                  <span>{formatRupiah(totalPaidAmount)}</span>
                </div>
                <div className="text-xs font-bold text-rose-700 flex justify-between">
                  <span>Belum Bayar:</span>
                  <span>{formatRupiah(totalUnpaidAmount)}</span>
                </div>
              </div>
            </div>
            <div className="mt-2 pt-1.5 border-t border-stone-200/80 text-[10px]">
              {unpaidCount > 0 ? (
                <span className="text-rose-700 font-bold">Ada {unpaidCount} tagihan tempo</span>
              ) : (
                <span className="text-emerald-700 font-medium">Semua tagihan lunas</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main List Section */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 md:p-6 space-y-4">
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari bagian cor, suplier, no DO..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  statusFilter === 'all' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Semua ({castings.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('paid')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  statusFilter === 'paid' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Lunas
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('unpaid')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  statusFilter === 'unpaid' ? 'bg-rose-700 text-white shadow-2xs' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Belum ({unpaidCount})
              </button>
            </div>

            {/* Vendor Filter */}
            {vendorOptions.length > 1 && (
              <select
                value={vendorFilter}
                onChange={(e) => setVendorFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">Semua Suplier</option>
                {vendorOptions.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* List Table */}
        {filteredRecords.length === 0 ? (
          <div className="text-center py-14 px-4 border border-dashed border-stone-200 rounded-2xl bg-stone-50/50">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-amber-100/60 text-amber-700 flex items-center justify-center">
              <Truck className="w-7 h-7 opacity-80" />
            </div>
            <h4 className="text-sm font-bold text-stone-800">
              {castings.length === 0 ? 'Belum Ada Catatan Pengecoran Jayamix' : 'Tidak Ada Data Sesuai Filter'}
            </h4>
            <p className="text-xs text-stone-500 max-w-md mx-auto mt-1 mb-4 leading-relaxed">
              Catat setiap pembelian beton ready mix molen (Jayamix, Holcim, dll.) dan sewa pompa beton untuk transparansi pembukuan proyek.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition shadow-xs"
              >
                <Plus className="w-4 h-4" />
                + Catat Order Jayamix & Pompa
              </button>
              <button
                type="button"
                onClick={() => setIsCalcOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition"
              >
                <Calculator className="w-4 h-4 text-blue-700" />
                Kalkulator Kubikasi Dak
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto border border-stone-200 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-stone-600 font-bold">
                  <th className="p-3">Tanggal & Struktur</th>
                  <th className="p-3">Suplier & Mutu</th>
                  <th className="p-3 text-center">Volume (m³)</th>
                  <th className="p-3 text-right">Biaya Jayamix</th>
                  <th className="p-3">Pompa Beton</th>
                  <th className="p-3 text-right">Biaya Pompa</th>
                  <th className="p-3 text-right">Total Keseluruhan</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {filteredRecords.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50 transition">
                    {/* Tanggal & Bagian Cor */}
                    <td className="p-3">
                      <div className="font-extrabold text-stone-900 text-xs">
                        {item.castingSection}
                      </div>
                      <div className="text-[11px] text-stone-500 mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-stone-400" />
                        {formatIndonesianDate(item.date)}
                      </div>
                      {item.deliveryOrderNo && (
                        <span className="inline-block text-[10px] text-stone-400 mt-0.5">
                          DO: {item.deliveryOrderNo}
                        </span>
                      )}
                    </td>

                    {/* Suplier & Mutu Beton */}
                    <td className="p-3">
                      <div className="font-bold text-stone-900">{item.vendorName}</div>
                      <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
                        {item.concreteQuality}
                      </span>
                    </td>

                    {/* Volume m3 */}
                    <td className="p-3 text-center whitespace-nowrap">
                      <div className="font-black text-blue-950 text-sm">
                        {item.volumeM3} m³
                      </div>
                      {item.truckCount && (
                        <div className="text-[10px] text-stone-400">
                          {item.truckCount} Truk
                        </div>
                      )}
                    </td>

                    {/* Biaya Jayamix */}
                    <td className="p-3 text-right whitespace-nowrap">
                      <div className="font-bold text-stone-900">
                        {formatRupiah(item.totalConcreteCost)}
                      </div>
                      <div className="text-[10px] text-stone-400">
                        @{formatRupiah(item.pricePerM3)}
                      </div>
                    </td>

                    {/* Pompa Beton Type */}
                    <td className="p-3">
                      {item.pumpType === 'tanpa_pompa' ? (
                        <span className="text-[11px] text-stone-400 font-medium italic">
                          Tanpa Pompa (Manual)
                        </span>
                      ) : (
                        <div>
                          <span className="text-xs font-bold text-amber-950 block capitalize">
                            {item.pumpType.replace('_', ' ')}
                          </span>
                          {(item.operatorTips || item.pumpExtraPipeCost) ? (
                            <span className="text-[10px] text-amber-700 block mt-0.5">
                              Termasuk pipa/tips
                            </span>
                          ) : null}
                        </div>
                      )}
                    </td>

                    {/* Biaya Pompa */}
                    <td className="p-3 text-right whitespace-nowrap">
                      <span className="font-bold text-stone-900">
                        {formatRupiah(item.totalPumpCost)}
                      </span>
                    </td>

                    {/* Total Keseluruhan */}
                    <td className="p-3 text-right whitespace-nowrap">
                      <div className="font-black text-amber-950 text-sm">
                        {formatRupiah(item.grandTotal)}
                      </div>
                      <div className="text-[10px] text-stone-500 font-medium">
                        {item.paymentMethod === 'tunai' ? '💵 Cash' : '🏦 Rekening'}
                      </div>
                    </td>

                    {/* Status Pembayaran */}
                    <td className="p-3 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onTogglePaid(item.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition shadow-2xs ${
                          item.isPaid
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                        }`}
                        title="Klik untuk ubah status lunas/tempo"
                      >
                        {item.isPaid ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Lunas
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                            Tempo
                          </>
                        )}
                      </button>
                    </td>

                    {/* Aksi */}
                    <td className="p-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => setPrintingRecord(item)}
                          className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition"
                          title="Cetak Kuitansi / Tanda Terima"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleShareWhatsApp(item)}
                          className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                          title="Bagikan rincian ke WhatsApp"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition"
                          title="Ubah data"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteConcreteCasting(item.id)}
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Hapus catatan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-stone-200 bg-stone-50 font-black">
                  <td colSpan={2} className="p-3 text-right uppercase text-stone-700">
                    Total Keseluruhan ({filteredRecords.length} order):
                  </td>
                  <td className="p-3 text-center text-blue-950 font-black text-sm">
                    {filteredRecords.reduce((sum, c) => sum + c.volumeM3, 0).toFixed(1)} m³
                  </td>
                  <td className="p-3 text-right text-stone-900 font-bold">
                    {formatRupiah(filteredRecords.reduce((sum, c) => sum + c.totalConcreteCost, 0))}
                  </td>
                  <td></td>
                  <td className="p-3 text-right text-stone-900 font-bold">
                    {formatRupiah(filteredRecords.reduce((sum, c) => sum + c.totalPumpCost, 0))}
                  </td>
                  <td className="p-3 text-right text-sm text-amber-950 font-black">
                    {formatRupiah(filteredRecords.reduce((sum, c) => sum + c.grandTotal, 0))}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Modal Add / Edit */}
      <ConcreteCastingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        initialData={editingRecord}
        projectName={project.projectName}
      />

      {/* Modal Print Slip */}
      <ConcreteCastingPrintModal
        isOpen={Boolean(printingRecord)}
        onClose={() => setPrintingRecord(null)}
        record={printingRecord}
        projectName={project.projectName}
      />

      {/* Modal Kubikasi Calculator */}
      <CastingVolumeCalculatorModal
        isOpen={isCalcOpen}
        onClose={() => setIsCalcOpen(false)}
        onApplyVolume={(vol) => {
          setIsCalcOpen(false);
          setIsModalOpen(true);
        }}
      />
    </div>
  );
};
