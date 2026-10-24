import React, { useState, useEffect } from 'react';
import { 
  X, 
  Truck, 
  Calculator, 
  Layers, 
  Banknote, 
  Landmark, 
  Building2, 
  Plus, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  DollarSign,
  Fuel,
  Wrench,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { ConcreteCastingRecord, ConcreteQuality, PumpType } from '../../types';
import { formatRupiah, parseNumberInput, formatNumberInput, getTodayDateString } from '../../utils/formatters';
import { CastingVolumeCalculatorModal } from './CastingVolumeCalculatorModal';

interface ConcreteCastingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: Omit<ConcreteCastingRecord, 'id' | 'createdAt'>, editingId?: string) => void;
  initialData?: ConcreteCastingRecord | null;
  projectName: string;
}

export const ConcreteCastingModal: React.FC<ConcreteCastingModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  projectName,
}) => {
  if (!isOpen) return null;

  const [date, setDate] = useState<string>(initialData?.date || getTodayDateString());
  const [castingSection, setCastingSection] = useState<string>(initialData?.castingSection || 'Dak Lantai 2');
  const [vendorName, setVendorName] = useState<string>(initialData?.vendorName || 'Jayamix (SCG)');
  const [concreteQuality, setConcreteQuality] = useState<ConcreteQuality>(initialData?.concreteQuality || 'K-250');
  
  // Ready Mix Inputs
  const [volumeInput, setVolumeInput] = useState<string>(
    initialData?.volumeM3 ? String(initialData.volumeM3) : '12'
  );
  const [pricePerM3Input, setPricePerM3Input] = useState<string>(
    initialData?.pricePerM3 ? String(initialData.pricePerM3) : '875000'
  );
  const [truckCountInput, setTruckCountInput] = useState<string>(
    initialData?.truckCount ? String(initialData.truckCount) : '2'
  );

  // Pump Rental Inputs
  const [pumpType, setPumpType] = useState<PumpType>(initialData?.pumpType || 'standar');
  const [pumpRentalInput, setPumpRentalInput] = useState<string>(
    initialData?.pumpRentalCost !== undefined ? String(initialData.pumpRentalCost) : '3500000'
  );
  const [extraPipeInput, setExtraPipeInput] = useState<string>(
    initialData?.pumpExtraPipeCost ? String(initialData.pumpExtraPipeCost) : '0'
  );
  const [tipsInput, setTipsInput] = useState<string>(
    initialData?.operatorTips ? String(initialData.operatorTips) : '150000'
  );

  // Payment & Proof
  const [isPaid, setIsPaid] = useState<boolean>(initialData?.isPaid ?? true);
  const [paymentMethod, setPaymentMethod] = useState<'tunai' | 'transfer'>(
    initialData?.paymentMethod || 'transfer'
  );
  const [deliveryOrderNo, setDeliveryOrderNo] = useState<string>(initialData?.deliveryOrderNo || '');
  const [notes, setNotes] = useState<string>(initialData?.notes || '');

  // Volume Calculator Modal State
  const [isCalcOpen, setIsCalcOpen] = useState(false);

  // Calculations
  const volumeM3 = parseFloat(volumeInput) || 0;
  const pricePerM3 = parseNumberInput(pricePerM3Input);
  const totalConcreteCost = Math.round(volumeM3 * pricePerM3);

  const pumpRentalCost = parseNumberInput(pumpRentalInput);
  const pumpExtraPipeCost = parseNumberInput(extraPipeInput);
  const operatorTips = parseNumberInput(tipsInput);
  const totalPumpCost = pumpType === 'tanpa_pompa' ? 0 : (pumpRentalCost + pumpExtraPipeCost + operatorTips);

  const grandTotal = totalConcreteCost + totalPumpCost;

  // Presets
  const sectionPresets = [
    'Dak Lantai 2',
    'Dak Lantai 3 / Atap',
    'Pondasi Sloof & Cakar Ayam',
    'Kolom & Balok Gantung',
    'Lantai Dasar / Carport',
    'Tangga & Ringbalk',
  ];

  const vendorPresets = [
    'Jayamix (SCG)',
    'Pionirbeton (Indocement)',
    'Holcim / Dynamix',
    'Adhimix Precast',
    'Merak Jaya Beton',
    'Karya Beton Mandiri',
  ];

  const qualityPresets: { label: ConcreteQuality; desc: string }[] = [
    { label: 'K-225', desc: 'Lantai kerja & non-struktural' },
    { label: 'K-250', desc: 'Standar plat dak rumah tinggal' },
    { label: 'K-300', desc: 'Struktur ruko & bentang lebar' },
    { label: 'K-350', desc: 'Beban berat / waterproof' },
    { label: 'K-400', desc: 'Jalan beton / industri' },
  ];

  const pumpTypePresets: { type: PumpType; label: string; defaultCost: number }[] = [
    { type: 'standar', label: 'Pompa Standar (Boom 18-21m)', defaultCost: 3500000 },
    { type: 'long_boom', label: 'Long Boom (Boom 27-32m)', defaultCost: 4500000 },
    { type: 'mini_kodok', label: 'Pompa Kodok (Portable pipa gang)', defaultCost: 4000000 },
    { type: 'super_long_boom', label: 'Super Long Boom (36-42m)', defaultCost: 6000000 },
    { type: 'tanpa_pompa', label: 'Tanpa Pompa (Bongkar talang/manual)', defaultCost: 0 },
  ];

  const handleSelectPumpType = (type: PumpType, defaultCost: number) => {
    setPumpType(type);
    if (type === 'tanpa_pompa') {
      setPumpRentalInput('0');
      setExtraPipeInput('0');
    } else if (parseNumberInput(pumpRentalInput) === 0 || pumpType === 'tanpa_pompa') {
      setPumpRentalInput(String(defaultCost));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!castingSection.trim() || volumeM3 <= 0) return;

    onSave(
      {
        date,
        castingSection: castingSection.trim(),
        vendorName: vendorName.trim(),
        concreteQuality,
        truckCount: parseInt(truckCountInput, 10) || undefined,
        volumeM3,
        pricePerM3,
        totalConcreteCost,
        pumpType,
        pumpRentalCost: pumpType === 'tanpa_pompa' ? 0 : pumpRentalCost,
        pumpExtraPipeCost: pumpType === 'tanpa_pompa' ? 0 : pumpExtraPipeCost,
        operatorTips: pumpType === 'tanpa_pompa' ? 0 : operatorTips,
        totalPumpCost,
        grandTotal,
        isPaid,
        paymentMethod,
        paidAt: isPaid ? (initialData?.paidAt || new Date().toISOString()) : undefined,
        deliveryOrderNo: deliveryOrderNo.trim() || undefined,
        notes: notes.trim() || undefined,
      },
      initialData?.id
    );

    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
        <div 
          className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
                <Truck className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-stone-900 tracking-tight">
                  {initialData ? 'Ubah Catatan Pengecoran' : 'Catat Cor Jayamix & Sewa Pompa'}
                </h2>
                <p className="text-xs text-stone-500">
                  {projectName} - Rincian pembelian beton ready mix dan sewa concrete pump
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-5">
            {/* 1. Data Umum & Jadwal Cor */}
            <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-600" />
                  1. Waktu & Bagian Struktur Pengecoran
                </span>
                <span className="text-[11px] text-stone-500">Wajib diisi</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-4">
                  <label className="block text-[10px] font-bold text-stone-600 mb-1">
                    Tanggal Pengecoran
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="sm:col-span-8">
                  <label className="block text-[10px] font-bold text-stone-600 mb-1">
                    Bagian Struktur yang Dicor
                  </label>
                  <input
                    type="text"
                    value={castingSection}
                    onChange={(e) => setCastingSection(e.target.value)}
                    placeholder="cth: Dak Lantai 2 & Balok Gantung"
                    className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Presets Bagian Cor */}
              <div className="flex flex-wrap gap-1 pt-1">
                {sectionPresets.map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setCastingSection(sec)}
                    className="px-2 py-0.5 text-[10px] font-medium bg-white hover:bg-stone-200 border border-stone-200 rounded-md text-stone-700 transition"
                  >
                    {sec}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Pemesanan Beton Ready Mix (Jayamix) */}
            <div className="bg-blue-50/60 rounded-xl p-3.5 border border-blue-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-blue-700" />
                  2. Pesanan Beton Ready Mix (Jayamix / Molen)
                </span>
                <button
                  type="button"
                  onClick={() => setIsCalcOpen(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white transition shadow-2xs"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  Hitung Kubikasi (m³)
                </button>
              </div>

              {/* Suplier & Mutu Beton */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-7">
                  <label className="block text-[10px] font-bold text-blue-900 mb-1">
                    Nama Suplier / Vendor Ready Mix
                  </label>
                  <input
                    type="text"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    placeholder="cth: Jayamix (SCG) / Pionirbeton"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {vendorPresets.slice(0, 4).map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setVendorName(v)}
                        className="px-1.5 py-0.2 text-[9px] font-medium bg-white text-blue-800 border border-blue-200 rounded hover:bg-blue-100 transition"
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-5">
                  <label className="block text-[10px] font-bold text-blue-900 mb-1">
                    Mutu Karakteristik Beton
                  </label>
                  <select
                    value={concreteQuality}
                    onChange={(e) => setConcreteQuality(e.target.value as ConcreteQuality)}
                    className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {qualityPresets.map((q) => (
                      <option key={q.label} value={q.label}>
                        {q.label} - {q.desc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Volume & Harga per m3 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-[10px] font-bold text-blue-900 mb-1">
                    Volume Beton (m³ / Kubik)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={volumeInput}
                    onChange={(e) => setVolumeInput(e.target.value)}
                    placeholder="cth: 12.5"
                    className="w-full px-2.5 py-1.5 text-sm font-black bg-white border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-blue-950"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-blue-900 mb-1">
                    Harga per m³ (Rp)
                  </label>
                  <input
                    type="text"
                    value={pricePerM3Input}
                    onChange={(e) => setPricePerM3Input(e.target.value)}
                    placeholder="cth: 875.000"
                    className="w-full px-2.5 py-1.5 text-sm font-bold bg-white border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-stone-900"
                    required
                  />
                  <span className="text-[10px] text-blue-700 block mt-0.5">
                    {formatRupiah(pricePerM3)} / m³
                  </span>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-blue-900 mb-1">
                    Estimasi Jumlah Molen (Truk)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={truckCountInput}
                    onChange={(e) => setTruckCountInput(e.target.value)}
                    placeholder="cth: 2"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-stone-500 block mt-0.5">
                    Standar 1 truk = 7 m³
                  </span>
                </div>
              </div>

              {/* Subtotal Beton */}
              <div className="p-2.5 bg-blue-100/70 border border-blue-300 rounded-lg flex items-center justify-between text-xs">
                <span className="font-bold text-blue-950">
                  Subtotal Biaya Ready Mix ({volumeM3} m³ × {formatRupiah(pricePerM3)}):
                </span>
                <span className="text-sm font-black text-blue-950">
                  {formatRupiah(totalConcreteCost)}
                </span>
              </div>
            </div>

            {/* 3. Sewa Pompa Beton (Concrete Pump) */}
            <div className="bg-amber-50/60 rounded-xl p-3.5 border border-amber-200 space-y-3">
              <span className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-amber-700" />
                3. Sewa Pompa Beton (Concrete Pump / CP)
              </span>

              {/* Tipe Pompa Selector */}
              <div>
                <label className="block text-[10px] font-bold text-amber-900 mb-1">
                  Pilih Jenis Pompa Beton
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {pumpTypePresets.map((p) => (
                    <button
                      key={p.type}
                      type="button"
                      onClick={() => handleSelectPumpType(p.type, p.defaultCost)}
                      className={`p-2 rounded-lg text-left text-xs transition border flex items-center justify-between ${
                        pumpType === p.type
                          ? 'bg-amber-600 text-white border-amber-600 shadow-2xs font-bold'
                          : 'bg-white text-stone-700 border-amber-200 hover:bg-amber-100/60'
                      }`}
                    >
                      <span>{p.label}</span>
                      <span className="text-[10px] opacity-90">
                        {p.defaultCost > 0 ? `~${formatRupiah(p.defaultCost)}` : 'Rp 0'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Biaya Sewa, Pipa Tambahan & Tips Operator */}
              {pumpType !== 'tanpa_pompa' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-[10px] font-bold text-amber-900 mb-1">
                      Biaya Sewa Pompa Pokok (Rp)
                    </label>
                    <input
                      type="text"
                      value={pumpRentalInput}
                      onChange={(e) => setPumpRentalInput(e.target.value)}
                      placeholder="cth: 3.500.000"
                      className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-amber-800 block mt-0.5">
                      {formatRupiah(pumpRentalCost)}
                    </span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-amber-900 mb-1">
                      Pipa Tambahan / Sambungan (Rp)
                    </label>
                    <input
                      type="text"
                      value={extraPipeInput}
                      onChange={(e) => setExtraPipeInput(e.target.value)}
                      placeholder="cth: 200.000"
                      className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-amber-800 block mt-0.5">
                      {formatRupiah(pumpExtraPipeCost)}
                    </span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-amber-900 mb-1">
                      Tips / Makan Kru & Sopir (Rp)
                    </label>
                    <input
                      type="text"
                      value={tipsInput}
                      onChange={(e) => setTipsInput(e.target.value)}
                      placeholder="cth: 150.000"
                      className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-amber-800 block mt-0.5">
                      {formatRupiah(operatorTips)}
                    </span>
                  </div>
                </div>
              )}

              {/* Subtotal Pompa */}
              <div className="p-2.5 bg-amber-100/70 border border-amber-300 rounded-lg flex items-center justify-between text-xs">
                <span className="font-bold text-amber-950">
                  Subtotal Biaya Sewa Pompa & Operasional Kru:
                </span>
                <span className="text-sm font-black text-amber-950">
                  {formatRupiah(totalPumpCost)}
                </span>
              </div>
            </div>

            {/* 4. Grand Total & Status Pembayaran */}
            <div className="p-4 bg-stone-900 text-white rounded-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-700 pb-3">
                <div>
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                    Total Keseluruhan Biaya Pengecoran
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-amber-400 block mt-0.5">
                    {formatRupiah(grandTotal)}
                  </span>
                </div>
                <div className="text-right text-xs text-stone-300 space-y-0.5">
                  <div>Beton Jayamix: <strong>{formatRupiah(totalConcreteCost)}</strong></div>
                  <div>Sewa Pompa: <strong>{formatRupiah(totalPumpCost)}</strong></div>
                </div>
              </div>

              {/* Status & Metode Pembayaran */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-stone-300 mb-1.5">
                    Status Pembayaran
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setIsPaid(true)}
                      className={`py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                        isPaid
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                          : 'bg-stone-800 text-stone-400 border-stone-700 hover:bg-stone-700'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Lunas
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPaid(false)}
                      className={`py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                        !isPaid
                          ? 'bg-rose-700 text-white border-rose-600 shadow-xs'
                          : 'bg-stone-800 text-stone-400 border-stone-700 hover:bg-stone-700'
                      }`}
                    >
                      <AlertCircle className="w-4 h-4" />
                      Tempo / Belum
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-300 mb-1.5">
                    Metode Pembayaran
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('transfer')}
                      className={`py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                        paymentMethod === 'transfer'
                          ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                          : 'bg-stone-800 text-stone-400 border-stone-700 hover:bg-stone-700'
                      }`}
                    >
                      <Landmark className="w-4 h-4" />
                      Rekening Bank
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('tunai')}
                      className={`py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                        paymentMethod === 'tunai'
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                          : 'bg-stone-800 text-stone-400 border-stone-700 hover:bg-stone-700'
                      }`}
                    >
                      <Banknote className="w-4 h-4" />
                      Tunai (Cash)
                    </button>
                  </div>
                </div>
              </div>

              {/* No DO & Catatan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 mb-1">
                    No. Surat Jalan / Delivery Order (DO)
                  </label>
                  <input
                    type="text"
                    value={deliveryOrderNo}
                    onChange={(e) => setDeliveryOrderNo(e.target.value)}
                    placeholder="cth: DO-2026/09/JYM-412"
                    className="w-full px-2.5 py-1.5 text-xs bg-stone-800 border border-stone-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-400 mb-1">
                    Catatan Khusus / Teknis
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="cth: Slump 12±2, mulai jam 09.00 pagi, jangan tambah air"
                    className="w-full px-2.5 py-1.5 text-xs bg-stone-800 border border-stone-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-stone-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition"
              >
                Batal
              </button>

              <button
                type="submit"
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <Save className="w-4 h-4" />
                {initialData ? 'Simpan Perubahan' : 'Simpan Catatan Pengecoran'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Kalkulator Kubikasi Modal */}
      <CastingVolumeCalculatorModal
        isOpen={isCalcOpen}
        onClose={() => setIsCalcOpen(false)}
        onApplyVolume={(vol) => {
          setVolumeInput(String(vol));
          const estTrucks = Math.ceil(vol / 7);
          setTruckCountInput(String(estTrucks));
        }}
      />
    </>
  );
};
