import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip 
} from 'recharts';
import { 
  PieChart as PieChartIcon, 
  Users, 
  HardHat, 
  Wrench, 
  UtensilsCrossed, 
  Layers, 
  Wallet, 
  TrendingUp, 
  HelpCircle,
  Eye,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Truck
} from 'lucide-react';
import { ExpenseItem, TemporaryWorkerPayment } from '../types';
import { formatRupiah } from '../utils/formatters';

interface ProjectAllocationChartProps {
  projectName: string;
  totalWagesExpense: number;             // Gaji harian karyawan tetap / terdaftar
  totalTemporaryWagesExpense?: number;    // Upah pekerja cor / cabutan lepas
  totalConcreteExpense?: number;          // Biaya cor Jayamix & sewa pompa beton
  expenses: ExpenseItem[];                // Daftar pengeluaran material, konsumsi, operasional
  ownerDealAmount?: number;               // Nilai deal owner
  onNavigateToTab?: (tab: 'attendance' | 'saturday' | 'temporary' | 'expenses' | 'summary' | 'kasbon' | 'casting') => void;
}

export const ProjectAllocationChart: React.FC<ProjectAllocationChartProps> = ({
  projectName,
  totalWagesExpense,
  totalTemporaryWagesExpense = 0,
  totalConcreteExpense = 0,
  expenses,
  ownerDealAmount = 0,
  onNavigateToTab,
}) => {
  const [viewMode, setViewMode] = useState<'expenses_only' | 'deal_breakdown'>('expenses_only');
  const [showSimulation, setShowSimulation] = useState<boolean>(false);

  // Compute breakdown for each specific category
  const actualRegularWages = totalWagesExpense;
  const actualTempWages = totalTemporaryWagesExpense;
  const actualTotalWages = actualRegularWages + actualTempWages;

  const actualMaterialExpense = expenses
    .filter((e) => e.category === 'material')
    .reduce((sum, item) => sum + item.amount, 0);

  const actualKonsumsiExpense = expenses
    .filter((e) => e.category === 'konsumsi')
    .reduce((sum, item) => sum + item.amount, 0);

  const actualOperasionalExpense = expenses
    .filter((e) => e.category === 'operasional' || e.category === 'lainnya')
    .reduce((sum, item) => sum + item.amount, 0);

  const actualConcreteExpense = totalConcreteExpense || 0;

  const actualTotalExpense = actualTotalWages + actualMaterialExpense + actualKonsumsiExpense + actualOperasionalExpense + actualConcreteExpense;
  const isActualEmpty = actualTotalExpense === 0;

  // Simulation fallback values if empty and user clicks "Lihat Contoh Simulasi"
  const simWages = 14500000;
  const simMaterial = 9800000;
  const simConcrete = 8500000;
  const simKonsumsi = 3200000;
  const simOperasional = 1500000;
  const simDeal = 45000000;

  const effectiveTotalWages = isActualEmpty && showSimulation ? simWages : actualTotalWages;
  const effectiveMaterial = isActualEmpty && showSimulation ? simMaterial : actualMaterialExpense;
  const effectiveConcrete = isActualEmpty && showSimulation ? simConcrete : actualConcreteExpense;
  const effectiveKonsumsi = isActualEmpty && showSimulation ? simKonsumsi : actualKonsumsiExpense;
  const effectiveOperasional = isActualEmpty && showSimulation ? simOperasional : actualOperasionalExpense;
  const effectiveDealAmount = isActualEmpty && showSimulation ? simDeal : ownerDealAmount;

  const currentTotalSpent = effectiveTotalWages + effectiveMaterial + effectiveConcrete + effectiveKonsumsi + effectiveOperasional;
  const currentMargin = Math.max(0, effectiveDealAmount - currentTotalSpent);

  // Prepare chart dataset based on selected view mode
  interface SliceItem {
    id: string;
    name: string;
    value: number;
    color: string;
    description: string;
    subLabel?: string;
  }

  let chartData: SliceItem[] = [];

  if (viewMode === 'deal_breakdown' && effectiveDealAmount > 0) {
    // Mode: Allocation against Owner Deal Budget
    if (effectiveTotalWages > 0) {
      chartData.push({
        id: 'gaji',
        name: 'Gaji Tenaga Kerja',
        value: effectiveTotalWages,
        color: '#2563eb', // Blue
        description: 'Upah tukang, kenek, dan pekerja cor',
        subLabel: `Gaji Harian: ${formatRupiah(actualRegularWages)} + Cor: ${formatRupiah(actualTempWages)}`,
      });
    }
    if (effectiveMaterial > 0) {
      chartData.push({
        id: 'material',
        name: 'Material & Alat',
        value: effectiveMaterial,
        color: '#059669', // Emerald
        description: 'Bahan bangunan, semen, paku, kawat, dll.',
      });
    }
    if (effectiveConcrete > 0) {
      chartData.push({
        id: 'concrete',
        name: 'Cor Jayamix & Pompa',
        value: effectiveConcrete,
        color: '#0284c7', // Sky Blue
        description: 'Pemesanan beton ready-mix Jayamix & sewa pompa beton',
        subLabel: `Total Biaya: ${formatRupiah(actualConcreteExpense)}`,
      });
    }
    if (effectiveKonsumsi > 0) {
      chartData.push({
        id: 'konsumsi',
        name: 'Konsumsi Proyek',
        value: effectiveKonsumsi,
        color: '#ea580c', // Orange
        description: 'Kopi, gula, rokok, air galon, makan siang',
      });
    }
    if (effectiveOperasional > 0) {
      chartData.push({
        id: 'operasional',
        name: 'Operasional & Lain',
        value: effectiveOperasional,
        color: '#7c3aed', // Purple
        description: 'Bensin, transport, sewa alat, & lain-lain',
      });
    }
    if (currentMargin > 0) {
      chartData.push({
        id: 'margin',
        name: 'Sisa Saldo / Profit Mandor',
        value: currentMargin,
        color: '#16a34a', // Bright Green
        description: 'Estimasi sisa keuntungan bersih borongan',
      });
    }
  } else {
    // Mode: Expense Only (Proportion of actual money spent)
    if (effectiveTotalWages > 0) {
      chartData.push({
        id: 'gaji',
        name: 'Gaji Tenaga Kerja',
        value: effectiveTotalWages,
        color: '#2563eb', // Blue
        description: 'Upah tukang, kenek, dan tukang cor/lepas',
        subLabel: `Gaji Karyawan: ${formatRupiah(actualRegularWages)} | Pekerja Cor: ${formatRupiah(actualTempWages)}`,
      });
    }
    if (effectiveMaterial > 0) {
      chartData.push({
        id: 'material',
        name: 'Material & Alat',
        value: effectiveMaterial,
        color: '#059669', // Emerald
        description: 'Belanja bahan material & perlengkapan',
      });
    }
    if (effectiveConcrete > 0) {
      chartData.push({
        id: 'concrete',
        name: 'Cor Jayamix & Pompa',
        value: effectiveConcrete,
        color: '#0284c7', // Sky Blue
        description: 'Pemesanan beton ready-mix Jayamix & sewa pompa beton',
      });
    }
    if (effectiveKonsumsi > 0) {
      chartData.push({
        id: 'konsumsi',
        name: 'Konsumsi Proyek',
        value: effectiveKonsumsi,
        color: '#ea580c', // Orange
        description: 'Makan harian, kopi, gula, rokok, & logistik',
      });
    }
    if (effectiveOperasional > 0) {
      chartData.push({
        id: 'operasional',
        name: 'Operasional & Lain',
        value: effectiveOperasional,
        color: '#7c3aed', // Purple
        description: 'Transportasi, bensin, dan perlengkapan lain',
      });
    }
  }

  const chartTotal = chartData.reduce((acc, curr) => acc + curr.value, 0);

  // Customized internal label for slices with >= 7% share
  const renderCustomizedLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
    if (!percent || percent < 0.08) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#ffffff"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-[11px] font-black pointer-events-none drop-shadow-md select-none"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Custom Tooltip component for Recharts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item: SliceItem = payload[0].payload;
      const pct = chartTotal > 0 ? ((item.value / chartTotal) * 100).toFixed(1) : '0';
      return (
        <div className="bg-stone-900/95 backdrop-blur-xs text-white text-xs rounded-xl p-3 shadow-xl border border-stone-700 min-w-[200px] z-50">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="font-bold text-sm text-stone-100">{item.name}</span>
          </div>
          <div className="text-base font-black text-amber-400">
            {formatRupiah(item.value)}
          </div>
          <div className="text-[11px] font-semibold text-stone-300 mt-0.5">
            Porsi: <span className="text-white font-bold">{pct}%</span> dari {viewMode === 'deal_breakdown' ? 'Deal Owner' : 'Total Biaya'}
          </div>
          <div className="text-[10px] text-stone-400 mt-1.5 pt-1.5 border-t border-stone-800">
            {item.description}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-stone-50/70 rounded-2xl border border-stone-200 p-5 md:p-6 my-6 shadow-2xs">
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
              <PieChartIcon className="w-4 h-4 text-amber-700" />
            </div>
            <h3 className="text-base font-extrabold text-stone-900 tracking-tight">
              Visualisasi Alokasi Dana ({projectName})
            </h3>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Persentase pembagian dana untuk <strong className="text-blue-700">Gaji</strong>, <strong className="text-emerald-700">Material</strong>, dan <strong className="text-orange-700">Konsumsi</strong>
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 p-1 bg-white border border-stone-200 rounded-xl self-start sm:self-auto shadow-2xs">
          <button
            type="button"
            onClick={() => setViewMode('expenses_only')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              viewMode === 'expenses_only'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Pengeluaran Terpakai
          </button>

          <button
            type="button"
            onClick={() => setViewMode('deal_breakdown')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              viewMode === 'deal_breakdown'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            Alokasi Deal Owner
          </button>
        </div>
      </div>

      {/* Simulated Mode Banner if active */}
      {isActualEmpty && showSimulation && (
        <div className="mt-3 px-3.5 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs flex items-center justify-between text-amber-900">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Mode Pratinjau Simulasi Data: Menampilkan grafik sampel contoh proyek borongan</span>
          </div>
          <button
            type="button"
            onClick={() => setShowSimulation(false)}
            className="text-[11px] font-bold text-amber-800 hover:text-amber-950 underline ml-2"
          >
            Tutup Contoh
          </button>
        </div>
      )}

      {/* Empty State when no expenses or wages are entered */}
      {isActualEmpty && !showSimulation ? (
        <div className="py-12 px-4 text-center">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-amber-100/60 border border-amber-200 text-amber-700 flex items-center justify-center">
            <PieChartIcon className="w-8 h-8 opacity-75" />
          </div>
          <h4 className="text-sm font-bold text-stone-800">
            Belum Ada Data Alokasi Dana untuk {projectName}
          </h4>
          <p className="text-xs text-stone-500 max-w-md mx-auto mt-1 mb-4 leading-relaxed">
            Grafik pie akan otomatis menghitung persentase alokasi begitu Anda mencatat absensi gaji karyawan atau nota belanja material & konsumsi.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={() => onNavigateToTab?.('attendance')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-xs"
            >
              <Users className="w-4 h-4" />
              Catat Absensi / Gaji &rarr;
            </button>

            <button
              type="button"
              onClick={() => onNavigateToTab?.('expenses')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl transition shadow-2xs"
            >
              <UtensilsCrossed className="w-4 h-4 text-orange-600" />
              Catat Konsumsi / Material &rarr;
            </button>

            <button
              type="button"
              onClick={() => onNavigateToTab?.('casting')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-300 rounded-xl transition shadow-2xs"
            >
              <Truck className="w-4 h-4 text-sky-600" />
              Catat Jayamix & Pompa &rarr;
            </button>

            <button
              type="button"
              onClick={() => setShowSimulation(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-amber-800 bg-amber-100/80 hover:bg-amber-200/80 border border-amber-300 rounded-xl transition"
            >
              <Eye className="w-4 h-4 text-amber-700" />
              Lihat Contoh Simulasi Grafik
            </button>
          </div>
        </div>
      ) : (
        /* Main Chart and Metrics Area */
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left: Recharts Pie Chart (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-full h-64 sm:h-72 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={62}
                    outerRadius={96}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                    label={renderCustomizedLabel}
                    labelLine={false}
                    animationDuration={800}
                  >
                    {chartData.map((entry) => (
                      <Cell
                        key={`cell-${entry.id}`}
                        fill={entry.color}
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Center donut label */}
              <div className="absolute pointer-events-none text-center flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  {viewMode === 'deal_breakdown' ? 'Total Deal' : 'Total Biaya'}
                </span>
                <span className="text-sm sm:text-base font-black text-stone-900 mt-0.5">
                  {formatRupiah(viewMode === 'deal_breakdown' ? (effectiveDealAmount || currentTotalSpent) : currentTotalSpent)}
                </span>
                <span className="text-[9px] text-stone-400 font-semibold">
                  {chartData.length} Pos Alokasi
                </span>
              </div>
            </div>

            <p className="text-[11px] text-stone-400 text-center italic mt-1">
              Arahkan kursor / ketuk pada bagian grafik untuk detail nominal
            </p>
          </div>

          {/* Right: Detailed Metric Cards & Percentage Bars (7 Cols) */}
          <div className="lg:col-span-7 space-y-3">
            {/* 1. Gaji Karyawan Card */}
            <div className="p-3.5 bg-white rounded-xl border border-blue-200/80 shadow-2xs hover:border-blue-300 transition">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-stone-900 block leading-tight">
                      Gaji Tenaga Kerja
                    </span>
                    <span className="text-[10px] text-stone-500">
                      Upah karyawan harian, tukang, kenek & cor
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs sm:text-sm font-black text-blue-900 block">
                    {formatRupiah(effectiveTotalWages)}
                  </span>
                  <span className="inline-block text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {chartTotal > 0 ? ((effectiveTotalWages / chartTotal) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>

              {/* Mini progress bar */}
              <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${chartTotal > 0 ? Math.min(100, (effectiveTotalWages / chartTotal) * 100) : 0}%`,
                  }}
                />
              </div>

              {actualTempWages > 0 && (
                <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-500">
                  <span>Tetap: {formatRupiah(actualRegularWages)}</span>
                  <span>Cor / Lepas: {formatRupiah(actualTempWages)}</span>
                </div>
              )}
            </div>

            {/* 2. Material & Alat Card */}
            <div className="p-3.5 bg-white rounded-xl border border-emerald-200/80 shadow-2xs hover:border-emerald-300 transition">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-stone-900 block leading-tight">
                      Material & Perlengkapan
                    </span>
                    <span className="text-[10px] text-stone-500">
                      Bahan bangunan, semen, pasir, paku, kawat, dll.
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs sm:text-sm font-black text-emerald-950 block">
                    {formatRupiah(effectiveMaterial)}
                  </span>
                  <span className="inline-block text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {chartTotal > 0 ? ((effectiveMaterial / chartTotal) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>

              {/* Mini progress bar */}
              <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${chartTotal > 0 ? Math.min(100, (effectiveMaterial / chartTotal) * 100) : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* 3. Cor Jayamix & Sewa Pompa Card */}
            {effectiveConcrete > 0 && (
              <div className="p-3.5 bg-white rounded-xl border border-sky-200/80 shadow-2xs hover:border-sky-300 transition">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-stone-900 block leading-tight">
                        Cor Jayamix & Sewa Pompa
                      </span>
                      <span className="text-[10px] text-stone-500">
                        Pemesanan beton ready-mix & concrete pump
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs sm:text-sm font-black text-sky-950 block">
                      {formatRupiah(effectiveConcrete)}
                    </span>
                    <span className="inline-block text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-sky-50 text-sky-800 border border-sky-200">
                      {chartTotal > 0 ? ((effectiveConcrete / chartTotal) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>

                {/* Mini progress bar */}
                <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-sky-600 h-1.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${chartTotal > 0 ? Math.min(100, (effectiveConcrete / chartTotal) * 100) : 0}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* 3. Konsumsi Proyek Card */}
            <div className="p-3.5 bg-white rounded-xl border border-orange-200/80 shadow-2xs hover:border-orange-300 transition">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                    <UtensilsCrossed className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-stone-900 block leading-tight">
                      Konsumsi & Logistik
                    </span>
                    <span className="text-[10px] text-stone-500">
                      Kopi, rokok, air galon, nasi bungkus harian
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs sm:text-sm font-black text-orange-950 block">
                    {formatRupiah(effectiveKonsumsi)}
                  </span>
                  <span className="inline-block text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-orange-50 text-orange-800 border border-orange-200">
                    {chartTotal > 0 ? ((effectiveKonsumsi / chartTotal) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>

              {/* Mini progress bar */}
              <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-orange-600 h-1.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${chartTotal > 0 ? Math.min(100, (effectiveKonsumsi / chartTotal) * 100) : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* 4. Operasional / Lainnya Card (if any) */}
            {effectiveOperasional > 0 && (
              <div className="p-3.5 bg-white rounded-xl border border-purple-200/80 shadow-2xs">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-stone-900 block leading-tight">
                        Operasional & Lain-lain
                      </span>
                      <span className="text-[10px] text-stone-500">
                        Bensin, transport, sewa alat, perizinan
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs sm:text-sm font-black text-purple-950 block">
                      {formatRupiah(effectiveOperasional)}
                    </span>
                    <span className="inline-block text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                      {chartTotal > 0 ? ((effectiveOperasional / chartTotal) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>

                <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-purple-600 h-1.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${chartTotal > 0 ? Math.min(100, (effectiveOperasional / chartTotal) * 100) : 0}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* 5. Sisa Margin / Profit Mandor (When viewing Deal Breakdown) */}
            {viewMode === 'deal_breakdown' && (
              <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-300 shadow-2xs">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-emerald-950 block leading-tight">
                        Estimasi Sisa Saldo / Profit Mandor
                      </span>
                      <span className="text-[10px] text-emerald-700">
                        Deal Owner ({formatRupiah(effectiveDealAmount)}) dikurangi seluruh biaya
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs sm:text-sm font-black block ${
                      currentMargin > 0 ? 'text-emerald-900' : 'text-red-700'
                    }`}>
                      {formatRupiah(currentMargin)}
                    </span>
                    <span className="inline-block text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                      {effectiveDealAmount > 0 ? ((currentMargin / effectiveDealAmount) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>

                <div className="w-full bg-emerald-200/60 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${effectiveDealAmount > 0 ? Math.min(100, (currentMargin / effectiveDealAmount) * 100) : 0}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer Info Box */}
      <div className="mt-5 pt-3.5 border-t border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-stone-500">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Perhitungan grafik ini terhubung langsung secara real-time dengan rekap absensi dan buku kas harian.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigateToTab?.('expenses')}
            className="text-amber-700 hover:text-amber-900 font-bold transition flex items-center gap-0.5"
          >
            Kelola Pengeluaran &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
