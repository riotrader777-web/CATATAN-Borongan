import React, { useState, useEffect } from 'react';
import { X, Users, Check, AlertCircle, Search, UserPlus, Trash2, Edit2, Coins } from 'lucide-react';
import { Worker } from '../types';
import { formatRupiah, parseNumberInput } from '../utils/formatters';

interface WorkersModalProps {
  isOpen: boolean;
  onClose: () => void;
  workers: Worker[];
  onSaveWorkers: (workers: Worker[]) => void;
}

export const WorkersModal: React.FC<WorkersModalProps> = ({
  isOpen,
  onClose,
  workers,
  onSaveWorkers,
}) => {
  const [localWorkers, setLocalWorkers] = useState<Worker[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Quick Add worker inside modal
  const [newName, setNewName] = useState('');
  const [newWage, setNewWage] = useState('150000');
  const [newRole, setNewRole] = useState('Tukang');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLocalWorkers(workers);
      setSearchQuery('');
      setNewName('');
      setShowAddForm(false);
    }
  }, [isOpen, workers]);

  if (!isOpen) return null;

  const handleNameChange = (id: string, name: string) => {
    setLocalWorkers((prev) =>
      prev.map((w) => (w.id === id ? { ...w, name } : w))
    );
  };

  const handleWageChange = (id: string, wageStr: string) => {
    const num = parseNumberInput(wageStr);
    setLocalWorkers((prev) =>
      prev.map((w) => (w.id === id ? { ...w, dailyWage: num } : w))
    );
  };

  const handleRoleChange = (id: string, role: string) => {
    setLocalWorkers((prev) =>
      prev.map((w) => (w.id === id ? { ...w, role } : w))
    );
  };

  const handleDelete = (id: string) => {
    setLocalWorkers((prev) => prev.filter((w) => w.id !== id));
  };

  const handleAddWorker = () => {
    if (!newName.trim()) return;
    const newWorker: Worker = {
      id: `worker-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: newName.trim(),
      dailyWage: parseNumberInput(newWage),
      role: newRole.trim() || 'Tukang',
    };
    setLocalWorkers((prev) => [...prev, newWorker]);
    setNewName('');
    setShowAddForm(false);
  };

  const handleApplyUniformWage = (wageAmount: number) => {
    setLocalWorkers((prev) =>
      prev.map((w) => ({
        ...w,
        dailyWage: wageAmount,
      }))
    );
  };

  const handleSave = () => {
    // Filter out completely blank names if any
    const validWorkers = localWorkers.filter((w) => w.name.trim().length > 0);
    onSaveWorkers(validWorkers);
    onClose();
  };

  // Filter workers based on search
  const filteredWorkers = localWorkers.filter((worker, idx) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const numMatch = `#${idx + 1}`.includes(q) || String(idx + 1) === q;
    const nameMatch = worker.name.toLowerCase().includes(q);
    const roleMatch = (worker.role || '').toLowerCase().includes(q);
    return numMatch || nameMatch || roleMatch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-stone-900 text-base">
                  Kelola Daftar Karyawan & Tarif Gaji
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                  {localWorkers.length} Karyawan (Tanpa Batasan)
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Atur nama karyawan, tarif harian, dan tambah karyawan tanpa batasan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Search + Add Button */}
        <div className="px-4 py-2.5 bg-stone-100/70 border-b border-stone-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 text-xs">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama karyawan..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition shadow-2xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            {showAddForm ? 'Tutup Form' : '+ Tambah Karyawan'}
          </button>
        </div>

        {/* Quick Add Form */}
        {showAddForm && (
          <div className="p-4 bg-amber-50/80 border-b border-amber-200 text-xs animate-in fade-in duration-150">
            <div className="font-bold text-amber-950 mb-2 flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-amber-700" />
              Tambah Karyawan Baru:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nama Karyawan *"
                className="px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddWorker();
                }}
              />
              <input
                type="text"
                value={newWage}
                onChange={(e) => setNewWage(e.target.value)}
                placeholder="Tarif Gaji/Hari (Rp)"
                className="px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <input
                type="text"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                placeholder="Posisi (Tukang, Kenek...)"
                className="px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1 text-stone-600 hover:bg-amber-100 rounded-lg"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleAddWorker}
                disabled={!newName.trim()}
                className="px-4 py-1 font-bold bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg transition"
              >
                Tambahkan
              </button>
            </div>
          </div>
        )}

        {/* Quick Batch Uniform Wage */}
        {localWorkers.length > 0 && (
          <div className="px-4 py-2 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-stone-600 font-semibold flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-amber-600" />
              Set Tarif Semua Karyawan Sekaligus:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[120000, 150000, 170000, 200000].map((nominal) => (
                <button
                  key={nominal}
                  type="button"
                  onClick={() => handleApplyUniformWage(nominal)}
                  className="px-2 py-0.5 bg-white border border-stone-300 rounded hover:bg-stone-100 text-stone-800 font-medium"
                  title={`Terapkan tarif ${nominal / 1000}rb ke seluruh karyawan`}
                >
                  {nominal / 1000}rb
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Workers List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-2 flex-1 divide-y divide-stone-100">
          {localWorkers.length === 0 ? (
            <div className="text-center py-10 text-stone-400 text-xs">
              <Users className="w-8 h-8 text-stone-300 mx-auto mb-2" />
              Belum ada karyawan. Klik tombol <strong>+ Tambah Karyawan</strong> di atas.
            </div>
          ) : filteredWorkers.length === 0 ? (
            <div className="text-center py-8 text-stone-400 text-xs">
              Tidak ada karyawan yang sesuai pencarian "{searchQuery}"
            </div>
          ) : (
            filteredWorkers.map((w, idx) => (
              <div key={w.id} className="pt-2 first:pt-0 flex items-center gap-2.5">
                <span className="w-7 text-center font-black text-stone-400 text-xs bg-stone-100 py-1.5 rounded shrink-0">
                  #{idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={w.name}
                    onChange={(e) => handleNameChange(w.id, e.target.value)}
                    placeholder="Nama Karyawan"
                    className="w-full px-2.5 py-1 text-xs font-bold border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50/50"
                  />
                </div>
                <div className="w-28 hidden sm:block">
                  <input
                    type="text"
                    value={w.role || ''}
                    onChange={(e) => handleRoleChange(w.id, e.target.value)}
                    placeholder="Posisi"
                    className="w-full px-2 py-1 text-xs border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50/50"
                  />
                </div>
                <div className="w-32">
                  <input
                    type="text"
                    value={w.dailyWage ? String(w.dailyWage) : ''}
                    onChange={(e) => handleWageChange(w.id, e.target.value)}
                    placeholder="Gaji/Hari (Rp)"
                    className="w-full px-2.5 py-1 text-xs font-bold text-right border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(w.id)}
                  className="p-1.5 text-stone-300 hover:text-rose-600 rounded-lg transition"
                  title="Hapus karyawan"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between gap-2">
          <span className="text-xs text-stone-500 font-medium">
            Total {localWorkers.length} karyawan terdaftar
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-200 rounded-xl transition"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Simpan Daftar Karyawan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
