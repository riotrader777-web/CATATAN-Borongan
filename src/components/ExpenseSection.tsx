import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Trash2, 
  Calendar, 
  Tag, 
  Search, 
  Filter, 
  Coffee, 
  Cigarette, 
  CupSoda, 
  Fuel, 
  Wrench,
  UtensilsCrossed,
  Droplets,
  PackageCheck,
  Banknote,
  Landmark
} from 'lucide-react';
import { ExpenseItem, ExpenseCategory } from '../types';
import { formatRupiah, formatIndonesianDate, parseNumberInput } from '../utils/formatters';

interface ExpenseSectionProps {
  expenses: ExpenseItem[];
  selectedDate: string;
  onAddExpense: (expense: Omit<ExpenseItem, 'id'>) => void;
  onDeleteExpense: (id: string) => void;
}

export const ExpenseSection: React.FC<ExpenseSectionProps> = ({
  expenses,
  selectedDate,
  onAddExpense,
  onDeleteExpense,
}) => {
  const [expenseDate, setExpenseDate] = useState<string>(selectedDate);
  const [itemName, setItemName] = useState<string>('');
  const [amountInput, setAmountInput] = useState<string>('');
  const [category, setCategory] = useState<ExpenseCategory>('konsumsi');
  const [paymentMethod, setPaymentMethod] = useState<'tunai' | 'transfer'>('tunai');
  const [note, setNote] = useState<string>('');
  const [dateFilterMode, setDateFilterMode] = useState<'all' | 'selected_date'>('all');
  const [categoryTab, setCategoryTab] = useState<'all' | 'konsumsi' | 'non-konsumsi'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Quick suggestion presets
  const quickItems = [
    { label: 'Kopi & Gula', cat: 'konsumsi' as const, icon: Coffee },
    { label: 'Rokok Surya / Sampoerna', cat: 'konsumsi' as const, icon: Cigarette },
    { label: 'Nasi Bungkus / Makan', cat: 'konsumsi' as const, icon: UtensilsCrossed },
    { label: 'Air Galon / Minum', cat: 'konsumsi' as const, icon: Droplets },
    { label: 'Teh & Es Batu', cat: 'konsumsi' as const, icon: CupSoda },
    { label: 'Gorengan / Sarapan', cat: 'konsumsi' as const, icon: UtensilsCrossed },
    { label: 'Bensin & Transport', cat: 'operasional' as const, icon: Fuel },
    { label: 'Paku / Kawat / Amplas', cat: 'material' as const, icon: Wrench },
  ];

  const handleQuickSelect = (name: string, cat: ExpenseCategory) => {
    setItemName(name);
    setCategory(cat);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseNumberInput(amountInput);
    if (!itemName.trim() || amount <= 0) {
      return;
    }

    onAddExpense({
      date: expenseDate || selectedDate,
      name: itemName.trim(),
      amount,
      category,
      paymentMethod,
      note: note.trim() || undefined,
    });

    // Reset inputs
    setItemName('');
    setAmountInput('');
    setNote('');
  };

  // Filtered items
  const filteredExpenses = expenses
    .filter((item) => {
      if (dateFilterMode === 'selected_date' && item.date !== selectedDate) {
        return false;
      }
      if (categoryTab === 'konsumsi' && item.category !== 'konsumsi') {
        return false;
      }
      if (categoryTab === 'non-konsumsi' && item.category === 'konsumsi') {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return item.name.toLowerCase().includes(q) || (item.note && item.note.toLowerCase().includes(q));
      }
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalAllExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
  const totalKonsumsiExpense = expenses
    .filter((item) => item.category === 'konsumsi')
    .reduce((sum, item) => sum + item.amount, 0);
  const totalNonKonsumsiExpense = totalAllExpense - totalKonsumsiExpense;

  const totalCashExpense = expenses
    .filter((item) => item.paymentMethod !== 'transfer')
    .reduce((sum, item) => sum + item.amount, 0);
  const totalBankExpense = expenses
    .filter((item) => item.paymentMethod === 'transfer')
    .reduce((sum, item) => sum + item.amount, 0);

  const totalTodayKonsumsi = expenses
    .filter((item) => item.date === selectedDate && item.category === 'konsumsi')
    .reduce((sum, item) => sum + item.amount, 0);
  const totalFilteredExpense = filteredExpenses.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div id="expenses-section" className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 md:p-6 mb-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-stone-100">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">
              Catatan Pengeluaran Konsumsi & Keperluan Lainnya
            </h2>
            <p className="text-xs text-stone-500">
              Otomatis memotong uang tunai (cash) di tangan atau saldo rekening bank
            </p>
          </div>
        </div>

        {/* Overview Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-950 flex items-center gap-1">
            <Banknote className="w-3.5 h-3.5 text-emerald-600" />
            Potong Cash: {formatRupiah(totalCashExpense)}
          </div>
          {totalBankExpense > 0 && (
            <div className="px-3 py-1 bg-blue-50 border border-blue-200 rounded-xl text-xs font-bold text-blue-950 flex items-center gap-1">
              <Landmark className="w-3.5 h-3.5 text-blue-600" />
              Transfer: {formatRupiah(totalBankExpense)}
            </div>
          )}
          <div className="px-3 py-1 bg-orange-50 border border-orange-200 rounded-xl text-xs font-bold text-orange-950">
            Total Konsumsi: {formatRupiah(totalKonsumsiExpense)}
          </div>
        </div>
      </div>

      {/* Input Form & Quick Buttons Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-5">
        {/* Left Form: Add Expense Item */}
        <div className="lg:col-span-5 bg-stone-50 p-4 rounded-xl border border-stone-200">
          <h3 className="text-xs font-extrabold text-stone-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-orange-600" />
            Catat Pengeluaran Baru
          </h3>

          {/* Quick Item Chips */}
          <div className="mb-3">
            <span className="text-[11px] font-semibold text-stone-500 block mb-1.5">
              Pilihan Cepat (Konsumsi & Operasional):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickItems.map((q) => {
                const Icon = q.icon;
                return (
                  <button
                    key={q.label}
                    type="button"
                    onClick={() => handleQuickSelect(q.label, q.cat)}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium border transition ${
                      itemName === q.label
                        ? 'bg-orange-600 text-white border-orange-600'
                        : q.cat === 'konsumsi'
                        ? 'bg-white text-orange-950 border-orange-200 hover:bg-orange-100'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {q.label}
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Tanggal Pengeluaran
              </label>
              <input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Nama Item / Keperluan
              </label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="cth: Rokok Surya 2 bks, Nasi Bungkus 5 porsi"
                className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Kategori
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-semibold"
                >
                  <option value="konsumsi">☕ Konsumsi (Makan/Kopi/Rokok)</option>
                  <option value="material">🧱 Material Tambahan</option>
                  <option value="operasional">⛽ Operasional / Transport</option>
                  <option value="lainnya">📦 Lain-lain</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Biaya (Rp)
                </label>
                <input
                  type="text"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  placeholder="cth: 50000"
                  className="w-full px-3 py-2 text-xs font-bold bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Catatan Rincian (Opsional)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="cth: Untuk lembur 4 orang sampai malam"
                className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Pilihan Metode Bayar: Tunai (Potong Cash) vs Transfer (Potong Rekening) */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center justify-between">
                <span>Sumber Dana Pembayaran:</span>
                <span className="text-[10px] font-bold text-emerald-800">
                  {paymentMethod === 'tunai' ? '💵 Otomatis Potong Uang Cash di Tangan' : '🏦 Potong Saldo Rekening'}
                </span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('tunai')}
                  className={`py-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition ${
                    paymentMethod === 'tunai'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                      : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <Banknote className="w-3.5 h-3.5" />
                  Tunai (Potong Cash)
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('transfer')}
                  className={`py-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition ${
                    paymentMethod === 'transfer'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <Landmark className="w-3.5 h-3.5" />
                  Transfer (Rekening)
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Simpan Pengeluaran
            </button>
          </form>
        </div>

        {/* Right List: Table of Expenses */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div>
            {/* Filter Tabs & Search Bar */}
            <div className="space-y-2 mb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                {/* Category Tabs */}
                <div className="flex items-center bg-stone-100 p-0.5 rounded-lg text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setCategoryTab('all')}
                    className={`px-3 py-1 rounded-md transition ${
                      categoryTab === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
                    }`}
                  >
                    Semua ({expenses.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryTab('konsumsi')}
                    className={`px-3 py-1 rounded-md transition ${
                      categoryTab === 'konsumsi' ? 'bg-orange-600 text-white shadow-xs' : 'text-stone-600 hover:text-orange-700'
                    }`}
                  >
                    ☕ Konsumsi
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryTab('non-konsumsi')}
                    className={`px-3 py-1 rounded-md transition ${
                      categoryTab === 'non-konsumsi' ? 'bg-stone-800 text-white shadow-xs' : 'text-stone-600'
                    }`}
                  >
                    Material / Lain
                  </button>
                </div>

                {/* Date Filter Mode */}
                <div className="flex items-center bg-stone-100 p-0.5 rounded-lg text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setDateFilterMode('all')}
                    className={`px-2.5 py-1 rounded-md transition ${
                      dateFilterMode === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
                    }`}
                  >
                    Semua Tanggal
                  </button>
                  <button
                    type="button"
                    onClick={() => setDateFilterMode('selected_date')}
                    className={`px-2.5 py-1 rounded-md transition ${
                      dateFilterMode === 'selected_date' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
                    }`}
                  >
                    Tanggal Terpilih ({selectedDate})
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari item pengeluaran atau catatan..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Expenses Table */}
            <div className="overflow-x-auto max-h-[360px] overflow-y-auto border border-stone-200 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-50 text-stone-600 font-bold sticky top-0 border-b border-stone-200 z-10">
                  <tr>
                    <th className="p-2.5">Tanggal</th>
                    <th className="p-2.5">Item & Catatan</th>
                    <th className="p-2.5">Kategori</th>
                    <th className="p-2.5 text-center">Sumber Dana</th>
                    <th className="p-2.5 text-right">Biaya</th>
                    <th className="p-2.5 text-center w-10">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium">
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-stone-400">
                        Belum ada catatan pengeluaran sesuai filter.
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map((item) => (
                      <tr key={item.id} className="hover:bg-stone-50">
                        <td className="p-2.5 whitespace-nowrap text-stone-500 font-medium">
                          {formatIndonesianDate(item.date)}
                        </td>
                        <td className="p-2.5">
                          <div className="font-bold text-stone-900">{item.name}</div>
                          {item.note && (
                            <div className="text-[11px] text-stone-500 italic mt-0.5">
                              {item.note}
                            </div>
                          )}
                        </td>
                        <td className="p-2.5 whitespace-nowrap">
                          {item.category === 'konsumsi' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-100 text-orange-900 border border-orange-200">
                              ☕ Konsumsi
                            </span>
                          ) : item.category === 'material' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-800 border border-blue-200">
                              🧱 Material
                            </span>
                          ) : item.category === 'operasional' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200">
                              ⛽ Operasional
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-stone-100 text-stone-700">
                              Lainnya
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 text-center whitespace-nowrap">
                          {item.paymentMethod === 'transfer' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                              <Landmark className="w-3 h-3 text-blue-600" />
                              Rekening
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <Banknote className="w-3 h-3 text-emerald-600" />
                              Cash (Tunai)
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 text-right font-black text-stone-900 whitespace-nowrap">
                          {formatRupiah(item.amount)}
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => onDeleteExpense(item.id)}
                            className="p-1 text-stone-400 hover:text-red-600 rounded transition"
                            title="Hapus pengeluaran ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table Summary Footer */}
          <div className="mt-3 p-3 bg-stone-50 rounded-xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="text-stone-500">
              Total Sesuai Filter ({filteredExpenses.length} item):
            </div>
            <div className="text-sm font-black text-orange-950">
              {formatRupiah(totalFilteredExpense)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
