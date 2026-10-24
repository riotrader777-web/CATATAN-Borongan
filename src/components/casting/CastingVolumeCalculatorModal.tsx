import React, { useState } from 'react';
import { 
  X, 
  Calculator, 
  Layers, 
  Columns, 
  Box, 
  Check, 
  ArrowRight,
  Info,
  Truck
} from 'lucide-react';

interface CastingVolumeCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyVolume: (volume: number) => void;
}

export const CastingVolumeCalculatorModal: React.FC<CastingVolumeCalculatorModalProps> = ({
  isOpen,
  onClose,
  onApplyVolume,
}) => {
  if (!isOpen) return null;

  const [calcMode, setCalcMode] = useState<'slab' | 'beam' | 'column'>('slab');

  // Mode Plat Dak
  const [slabLength, setSlabLength] = useState<string>('12');
  const [slabWidth, setSlabWidth] = useState<string>('8');
  const [slabThicknessCm, setSlabThicknessCm] = useState<string>('12'); // 12 cm standar dak

  // Mode Balok / Sloof
  const [beamTotalLength, setBeamTotalLength] = useState<string>('40');
  const [beamWidthCm, setBeamWidthCm] = useState<string>('20');
  const [beamHeightCm, setBeamHeightCm] = useState<string>('40');

  // Mode Kolom
  const [colCount, setColCount] = useState<string>('12');
  const [colWidthCm, setColWidthCm] = useState<string>('20');
  const [colLengthCm, setColLengthCm] = useState<string>('20');
  const [colHeightM, setColHeightM] = useState<string>('3.5');

  // Waste / Safety Margin (toleransi bekisting mekar / tumpah)
  const [wastePercent, setWastePercent] = useState<number>(5); // default 5%

  // Perhitungan
  let netVolume = 0;

  if (calcMode === 'slab') {
    const l = parseFloat(slabLength) || 0;
    const w = parseFloat(slabWidth) || 0;
    const t = (parseFloat(slabThicknessCm) || 0) / 100;
    netVolume = l * w * t;
  } else if (calcMode === 'beam') {
    const l = parseFloat(beamTotalLength) || 0;
    const w = (parseFloat(beamWidthCm) || 0) / 100;
    const h = (parseFloat(beamHeightCm) || 0) / 100;
    netVolume = l * w * h;
  } else if (calcMode === 'column') {
    const count = parseFloat(colCount) || 0;
    const w = (parseFloat(colWidthCm) || 0) / 100;
    const l = (parseFloat(colLengthCm) || 0) / 100;
    const h = parseFloat(colHeightM) || 0;
    netVolume = count * (w * l * h);
  }

  const wasteVolume = (netVolume * wastePercent) / 100;
  const totalRecommendedVolume = parseFloat((netVolume + wasteVolume).toFixed(2));

  // Estimasi jumlah armada mixer (truk molen)
  const standardTruckCapacity = 7; // 7 m3 per truk standar
  const miniTruckCapacity = 3; // 3 m3 per truk mini / minimix

  const estimatedStandardTrucks = Math.ceil(totalRecommendedVolume / standardTruckCapacity);
  const estimatedMiniTrucks = Math.ceil(totalRecommendedVolume / miniTruckCapacity);

  const handleApply = () => {
    onApplyVolume(totalRecommendedVolume);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
              <Calculator className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-stone-900 tracking-tight">
                Kalkulator Kubikasi Beton (m³)
              </h2>
              <p className="text-xs text-stone-500">
                Hitung kebutuhan volume cor dak, balok, atau sloof sebelum order Jayamix
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

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Mode Selector */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-stone-100 rounded-xl">
            <button
              type="button"
              onClick={() => setCalcMode('slab')}
              className={`py-2 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                calcMode === 'slab'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              Plat Dak Lantai
            </button>
            <button
              type="button"
              onClick={() => setCalcMode('beam')}
              className={`py-2 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                calcMode === 'beam'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Box className="w-3.5 h-3.5 text-amber-600" />
              Balok & Sloof
            </button>
            <button
              type="button"
              onClick={() => setCalcMode('column')}
              className={`py-2 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                calcMode === 'column'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Columns className="w-3.5 h-3.5 text-emerald-600" />
              Kolom Praktis
            </button>
          </div>

          {/* Form Dimensions based on Mode */}
          {calcMode === 'slab' && (
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-200/80 space-y-3">
              <span className="text-xs font-bold text-blue-950 block">
                Dimensi Plat Dak / Lantai Cor
              </span>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-stone-600 mb-1">
                    Panjang (m)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={slabLength}
                    onChange={(e) => setSlabLength(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="12"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-600 mb-1">
                    Lebar (m)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={slabWidth}
                    onChange={(e) => setSlabWidth(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="8"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-600 mb-1">
                    Tebal Dak (cm)
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={slabThicknessCm}
                    onChange={(e) => setSlabThicknessCm(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="12"
                  />
                </div>
              </div>
              <p className="text-[10px] text-blue-800">
                Standar tebal dak rumah 2 lantai: 12 cm. Untuk bentang lebar: 15 cm.
              </p>
            </div>
          )}

          {calcMode === 'beam' && (
            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200/80 space-y-3">
              <span className="text-xs font-bold text-amber-950 block">
                Dimensi Balok Gantung / Sloof Pondasi
              </span>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-stone-600 mb-1">
                    Total Panjang (m)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={beamTotalLength}
                    onChange={(e) => setBeamTotalLength(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    placeholder="40"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-600 mb-1">
                    Lebar Balok (cm)
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={beamWidthCm}
                    onChange={(e) => setBeamWidthCm(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    placeholder="20"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-600 mb-1">
                    Tinggi Balok (cm)
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={beamHeightCm}
                    onChange={(e) => setBeamHeightCm(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    placeholder="40"
                  />
                </div>
              </div>
            </div>
          )}

          {calcMode === 'column' && (
            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200/80 space-y-3">
              <span className="text-xs font-bold text-emerald-950 block">
                Dimensi Kolom Struktur
              </span>
              <div className="grid grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-stone-600 mb-1">
                    Jml Titik
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={colCount}
                    onChange={(e) => setColCount(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs font-bold bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="12"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-600 mb-1">
                    Sisi A (cm)
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={colWidthCm}
                    onChange={(e) => setColWidthCm(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs font-bold bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="20"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-600 mb-1">
                    Sisi B (cm)
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={colLengthCm}
                    onChange={(e) => setColLengthCm(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs font-bold bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="20"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-600 mb-1">
                    Tinggi (m)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={colHeightM}
                    onChange={(e) => setColHeightM(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs font-bold bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="3.5"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Safety / Waste Allowance */}
          <div>
            <label className="block text-[11px] font-bold text-stone-700 mb-1.5 flex items-center justify-between">
              <span>Faktor Cadangan / Waste (Bekisting Mekar & Pipa Pompa):</span>
              <span className="text-amber-800 font-extrabold">+{wastePercent}%</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[0, 3, 5, 8].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setWastePercent(pct)}
                  className={`py-1 text-xs font-bold rounded-lg border transition ${
                    wastePercent === pct
                      ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {pct === 0 ? 'Pas (0%)' : `+${pct}%`}
                </button>
              ))}
            </div>
          </div>

          {/* Calculation Result Summary Card */}
          <div className="p-4 bg-stone-900 text-white rounded-xl space-y-3">
            <div className="flex items-center justify-between border-b border-stone-700 pb-2.5">
              <span className="text-xs text-stone-400 font-medium">Volume Bersih (Netto):</span>
              <span className="text-sm font-bold text-stone-200">{netVolume.toFixed(2)} m³</span>
            </div>
            <div className="flex items-center justify-between border-b border-stone-700 pb-2.5">
              <span className="text-xs text-stone-400 font-medium">Cadangan Tambahan (+{wastePercent}%):</span>
              <span className="text-sm font-bold text-amber-400">+{wasteVolume.toFixed(2)} m³</span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">
                  Rekomendasi Pemesanan Jayamix
                </span>
                <span className="text-2xl font-black text-amber-400 block mt-0.5">
                  {totalRecommendedVolume} m³
                </span>
              </div>
              <div className="text-right text-[11px] text-stone-300 space-y-0.5">
                <div className="flex items-center gap-1 text-emerald-400 font-semibold justify-end">
                  <Truck className="w-3.5 h-3.5" />
                  ~{estimatedStandardTrucks} Truk Standar (7m³)
                </div>
                <div className="text-stone-400 text-[10px]">
                  atau ~{estimatedMiniTrucks} Truk Mini (3m³)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-xl transition"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <Check className="w-4 h-4" />
            Pakai Hasil ({totalRecommendedVolume} m³) di Form
          </button>
        </div>
      </div>
    </div>
  );
};
