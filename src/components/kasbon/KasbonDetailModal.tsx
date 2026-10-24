import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Share2, 
  Printer, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Calendar,
  User,
  Phone,
  FileText,
  CreditCard
} from 'lucide-react';
import { KasbonRecord, KasbonPayment } from '../../types';
import { 
  getKasbonRemaining, 
  getKasbonTotalPaid, 
  getKasbonProgressPercent, 
  isKasbonLunas, 
  formatKasbonWhatsAppMessage 
} from '../../utils/kasbon';
import { formatRupiah, formatIndonesianDate } from '../../utils/formatters';

interface KasbonDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: KasbonRecord | null;
  onOpenPaymentModal: (record: KasbonRecord) => void;
  onOpenEditModal: (record: KasbonRecord) => void;
  onOpenPrintModal: (record: KasbonRecord) => void;
  onDeleteRecord: (recordId: string) => void;
  onDeletePayment: (recordId: string, paymentId: string) => void;
}

export const KasbonDetailModal: React.FC<KasbonDetailModalProps> = ({
  isOpen,
  onClose,
  record,
  onOpenPaymentModal,
  onOpenEditModal,
  onOpenPrintModal,
  onDeleteRecord,
  onDeletePayment,
}) => {
  const [confirmDeleteRecord, setConfirmDeleteRecord] = useState(false);
  const [confirmDeletePaymentId, setConfirmDeletePaymentId] = useState<string | null>(null);

  if (!isOpen || !record) return null;

  const totalPaid = getKasbonTotalPaid(record);
  const remaining = getKasbonRemaining(record);
  const percent = getKasbonProgressPercent(record);
  const isPaidOff = isKasbonLunas(record);

  const handleShareWhatsApp = () => {
    const text = formatKasbonWhatsAppMessage(record);
    const cleanPhone = record.workerPhone?.replace(/[^\d]/g, '') || '';
    let waUrl = `https://wa.me/?text=${text}`;
    if (cleanPhone) {
      const intlPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
      waUrl = `https://wa.me/${intlPhone}?text=${text}`;
    }
    window.open(waUrl, '_blank');
  };

  const handleDeleteRecordClick = () => {
    if (confirmDeleteRecord) {
      onDeleteRecord(record.id);
      onClose();
    } else {
      setConfirmDeleteRecord(true);
    }
  };

  const handleDeletePaymentClick = (paymentId: string) => {
    if (confirmDeletePaymentId === paymentId) {
      onDeletePayment(record.id, paymentId);
      setConfirmDeletePaymentId(null);
    } else {
      setConfirmDeletePaymentId(paymentId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-xs ${
              isPaidOff ? 'bg-emerald-600' : 'bg-amber-600'
            }`}>
              {isPaidOff ? <CheckCircle2 className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-stone-900 text-base leading-tight">
                  {record.workerName}
                </h3>
                {isPaidOff ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                    LUNAS
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                    SISA {formatRupiah(remaining)}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-500 font-medium">
                {record.workerRole || 'Pegawai'} {record.projectName ? `• ${record.projectName}` : ''}
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

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Main Progress & Balance Card */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                <span className="text-[10px] text-stone-400 font-semibold block uppercase">Pinjaman Awal</span>
                <span className="text-xs sm:text-sm font-black text-stone-900 block mt-0.5">
                  {formatRupiah(record.initialAmount)}
                </span>
                <span className="text-[10px] text-stone-500 block mt-0.5">{formatIndonesianDate(record.date)}</span>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
                <span className="text-[10px] text-emerald-600 font-semibold block uppercase">Sudah Dicicil</span>
                <span className="text-xs sm:text-sm font-black text-emerald-700 block mt-0.5">
                  {formatRupiah(totalPaid)}
                </span>
                <span className="text-[10px] text-emerald-600 block mt-0.5">{record.payments?.length || 0}x Pembayaran</span>
              </div>

              <div className={`p-2.5 rounded-xl border ${
                isPaidOff 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950' 
                  : 'bg-amber-50 border-amber-300 text-amber-950'
              }`}>
                <span className="text-[10px] font-bold block uppercase opacity-75">
                  {isPaidOff ? 'Status' : 'Sisa Kasbon'}
                </span>
                <span className="text-xs sm:text-sm font-black block mt-0.5">
                  {isPaidOff ? 'LUNAS (0)' : formatRupiah(remaining)}
                </span>
                <span className="text-[10px] font-semibold block mt-0.5">
                  {percent}% Terbayar
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 transition-all duration-300 ${isPaidOff ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Details & Notes */}
          <div className="space-y-2 p-3.5 bg-white rounded-xl border border-stone-200 text-stone-700">
            {record.reason && (
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-stone-900 block text-[11px]">Keperluan Pinjaman:</span>
                  <span>{record.reason}</span>
                </div>
              </div>
            )}

            {record.notes && (
              <div className="flex items-start gap-2 pt-1 border-t border-stone-100">
                <AlertCircle className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-stone-900 block text-[11px]">Catatan:</span>
                  <span className="whitespace-pre-wrap">{record.notes}</span>
                </div>
              </div>
            )}

            {record.workerPhone && (
              <div className="flex items-center gap-2 pt-1 border-t border-stone-100">
                <Phone className="w-4 h-4 text-stone-400 shrink-0" />
                <div>
                  <span className="font-bold text-stone-900 text-[11px]">WhatsApp / HP: </span>
                  <span className="font-mono text-stone-700">{record.workerPhone}</span>
                </div>
              </div>
            )}
          </div>

          {/* Installment History Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-stone-900 text-xs sm:text-sm">
                  Riwayat Pembayaran Cicilan ({record.payments?.length || 0})
                </h4>
                <p className="text-[11px] text-stone-500">
                  Tiap cicilan langsung memotong sisa kasbon secara otomatis
                </p>
              </div>

              {!isPaidOff && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenPaymentModal(record);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition"
                >
                  <Plus className="w-4 h-4" />
                  Bayar Cicilan
                </button>
              )}
            </div>

            {record.payments && record.payments.length > 0 ? (
              <div className="border border-stone-200 rounded-xl overflow-hidden divide-y divide-stone-100 bg-white">
                {record.payments.map((payment, idx) => (
                  <div key={payment.id} className="p-3 flex items-center justify-between hover:bg-stone-50 transition">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[11px]">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-stone-900 text-xs sm:text-sm">
                            {formatRupiah(payment.amount)}
                          </span>
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold border border-emerald-200">
                            Terpotong
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-500 flex items-center gap-1.5 mt-0.5">
                          <Calendar className="w-3 h-3 text-stone-400" />
                          <span>{formatIndonesianDate(payment.date)}</span>
                          {payment.note && (
                            <>
                              <span>•</span>
                              <span className="italic">{payment.note}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      {confirmDeletePaymentId === payment.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDeletePaymentClick(payment.id)}
                            className="px-2 py-1 bg-red-600 text-white rounded-md text-[10px] font-bold hover:bg-red-700"
                          >
                            Ya, Hapus
                          </button>
                          <button
                            onClick={() => setConfirmDeletePaymentId(null)}
                            className="px-2 py-1 bg-stone-200 text-stone-700 rounded-md text-[10px] font-medium"
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleDeletePaymentClick(payment.id)}
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Hapus riwayat cicilan ini (sisa kasbon akan dikoreksi)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-stone-50 rounded-xl border border-dashed border-stone-200 text-center">
                <Clock className="w-6 h-6 text-stone-400 mx-auto mb-1" />
                <p className="font-semibold text-stone-700">Belum ada cicilan yang masuk</p>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Klik tombol "Bayar Cicilan" saat pegawai mulai mengangsur
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-stone-100 bg-stone-50 flex flex-wrap items-center justify-between gap-2">
          {/* Delete Record Confirmation */}
          <div>
            {confirmDeleteRecord ? (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-red-600">Yakin hapus?</span>
                <button
                  onClick={handleDeleteRecordClick}
                  className="px-2.5 py-1 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs"
                >
                  Hapus Kasbon
                </button>
                <button
                  onClick={() => setConfirmDeleteRecord(false)}
                  className="px-2 py-1 text-xs font-semibold text-stone-600 hover:bg-stone-200 rounded-lg"
                >
                  Batal
                </button>
              </div>
            ) : (
              <button
                onClick={handleDeleteRecordClick}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Data</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                onClose();
                onOpenEditModal(record);
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-stone-700 bg-white hover:bg-stone-100 border border-stone-300 rounded-xl transition shadow-2xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenPrintModal(record);
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-stone-700 bg-white hover:bg-stone-100 border border-stone-300 rounded-xl transition shadow-2xs"
              title="Cetak Bukti Kuitansi Kasbon"
            >
              <Printer className="w-3.5 h-3.5 text-stone-600" />
              <span>Cetak Slip</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition"
              title="Kirim rincian sisa kasbon ke WhatsApp pegawai"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Kirim WA</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
