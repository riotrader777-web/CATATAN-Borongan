import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, User, Phone, Briefcase, Calendar, Info, FileText } from 'lucide-react';
import { KasbonRecord, ProjectData } from '../../types';
import { getTodayDateString, parseNumberInput, formatNumberInput } from '../../utils/formatters';

interface KasbonFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordToEdit?: KasbonRecord | null;
  activeProject?: ProjectData;
  allProjects?: ProjectData[];
  onSave: (recordData: Partial<KasbonRecord>) => void;
}

export const KasbonFormModal: React.FC<KasbonFormModalProps> = ({
  isOpen,
  onClose,
  recordToEdit,
  activeProject,
  allProjects,
  onSave,
}) => {
  const [workerName, setWorkerName] = useState<string>('');
  const [workerRole, setWorkerRole] = useState<string>('');
  const [workerPhone, setWorkerPhone] = useState<string>('');
  const [projectName, setProjectName] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [amountStr, setAmountStr] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (recordToEdit) {
        setWorkerName(recordToEdit.workerName);
        setWorkerRole(recordToEdit.workerRole || '');
        setWorkerPhone(recordToEdit.workerPhone || '');
        setProjectName(recordToEdit.projectName || activeProject?.projectName || '');
        setDate(recordToEdit.date || getTodayDateString());
        setAmountStr(recordToEdit.initialAmount ? formatNumberInput(recordToEdit.initialAmount) : '');
        setReason(recordToEdit.reason || '');
        setNotes(recordToEdit.notes || '');
      } else {
        setWorkerName('');
        setWorkerRole('');
        setWorkerPhone('');
        setProjectName(activeProject?.projectName || '');
        setDate(getTodayDateString());
        setAmountStr('');
        setReason('');
        setNotes('');
      }
      setErrorMsg('');
    }
  }, [isOpen, recordToEdit, activeProject]);

  if (!isOpen) return null;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const num = parseNumberInput(raw);
    setAmountStr(num > 0 ? formatNumberInput(num) : '');
    setErrorMsg('');
  };

  const handleQuickAmount = (val: number) => {
    setAmountStr(formatNumberInput(val));
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = workerName.trim();
    if (!cleanName) {
      setErrorMsg('Silakan masukkan nama pegawai secara manual.');
      return;
    }
    const numAmount = parseNumberInput(amountStr);
    if (numAmount <= 0) {
      setErrorMsg('Silakan masukkan nominal kasbon secara manual (lebih dari Rp 0).');
      return;
    }

    onSave({
      workerName: cleanName,
      workerRole: workerRole.trim(),
      workerPhone: workerPhone.trim(),
      projectName: projectName.trim() || undefined,
      date,
      initialAmount: numAmount,
      reason: reason.trim(),
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold shadow-xs">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-stone-900 text-sm sm:text-base leading-tight">
                {recordToEdit ? 'Edit Catatan Kasbon' : 'Catat Kasbon Pegawai (Input Manual)'}
              </h3>
              <p className="text-[11px] text-stone-500 font-medium">
                Masukkan nama dan nominal secara manual • Terpisah dari borongan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Info Banner */}
          <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Ketik nama pegawai dan nominal kasbon secara bebas. Catatan ini murni kasbon pribadi dan tidak memotong nilai borongan proyek.
            </p>
          </div>

          {/* Worker Name (Manual Input) */}
          <div>
            <label className="block font-bold text-stone-800 mb-1">
              Nama Pegawai / Peminjam <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                required
                autoFocus
                value={workerName}
                onChange={(e) => setWorkerName(e.target.value)}
                placeholder="Ketik nama pegawai manual (contoh: Pak Joko, Doni, dsb.)"
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-stone-300 rounded-xl font-bold text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:font-normal placeholder:text-stone-400"
              />
            </div>
            <span className="text-[10px] text-stone-400 mt-1 block">
              Bebas ketik nama siapa saja tanpa terikat slot proyek
            </span>
          </div>

          {/* Nominal Kasbon (Manual Input) */}
          <div>
            <label className="block font-bold text-stone-800 mb-1">
              Nominal Pinjaman Kasbon (Rp) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-sm text-stone-500">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                required
                value={amountStr}
                onChange={handleAmountChange}
                placeholder="Ketik nominal manual (contoh: 200.000)"
                className="w-full pl-11 pr-3 py-2.5 bg-white border border-stone-300 rounded-xl font-black text-stone-900 text-base focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:font-normal placeholder:text-sm placeholder:text-stone-400"
              />
            </div>

            {/* Quick Helper Buttons for Faster Entry */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[10px] text-stone-500 font-semibold self-center mr-1">
                Tombol Cepat:
              </span>
              {[50000, 100000, 200000, 300000, 500000, 1000000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleQuickAmount(amt)}
                  className="px-2 py-0.5 bg-stone-100 hover:bg-amber-100 hover:text-amber-900 hover:border-amber-300 text-stone-700 rounded-lg border border-stone-200 transition font-medium text-[11px]"
                >
                  +{formatNumberInput(amt)}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Tanggal Diberikan Kasbon
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-xl font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Jabatan / Bagian (Opsional)
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={workerRole}
                  onChange={(e) => setWorkerRole(e.target.value)}
                  placeholder="Tukang / Kenek / Mandor"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Phone & Project Tag */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                No HP / WhatsApp (Opsional)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="tel"
                  value={workerPhone}
                  onChange={(e) => setWorkerPhone(e.target.value)}
                  placeholder="08123456789"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Referensi Proyek (Opsional)
              </label>
              {allProjects && allProjects.length > 0 ? (
                <select
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-stone-800 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Umum (Tanpa Proyek Khusus)</option>
                  {allProjects.map((p) => (
                    <option key={p.id} value={p.projectName}>
                      {p.projectName}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Proyek 1"
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              )}
            </div>
          </div>

          {/* Keperluan / Alasan Pinjam */}
          <div>
            <label className="block font-bold text-stone-700 mb-1">
              Keperluan / Alasan Pinjam (Opsional)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Contoh: Beras, obat keluarga, pulsa, keperluan mendesak..."
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Catatan Tambahan (Opsional) */}
          <div>
            <label className="block font-bold text-stone-700 mb-1">
              Catatan Tambahan (Opsional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan tambahan bila ada (nominal cicilan bebas dan bisa dibayar hari apa saja)..."
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
            />
          </div>

          {errorMsg && (
            <p className="text-rose-600 font-bold text-xs bg-rose-50 p-2.5 rounded-lg border border-rose-200">
              {errorMsg}
            </p>
          )}

          {/* Submit buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              {recordToEdit ? 'Simpan Perubahan' : 'Simpan Catatan Kasbon'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
