import { KasbonRecord, KasbonPayment } from '../types';
import { formatRupiah, formatIndonesianDate } from './formatters';

export const getKasbonTotalPaid = (record: KasbonRecord): number => {
  if (!record || !Array.isArray(record.payments)) return 0;
  return record.payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
};

export const getKasbonRemaining = (record: KasbonRecord): number => {
  if (!record) return 0;
  const initial = Number(record.initialAmount) || 0;
  const totalPaid = getKasbonTotalPaid(record);
  return Math.max(0, initial - totalPaid);
};

export const isKasbonLunas = (record: KasbonRecord): boolean => {
  return getKasbonRemaining(record) <= 0;
};

export const getKasbonProgressPercent = (record: KasbonRecord): number => {
  const initial = Number(record.initialAmount) || 0;
  if (initial <= 0) return 100;
  const totalPaid = getKasbonTotalPaid(record);
  return Math.min(100, Math.round((totalPaid / initial) * 100));
};

export interface KasbonGlobalSummary {
  totalInitial: number;
  totalPaid: number;
  totalRemaining: number;
  totalCount: number;
  activeCount: number;
  lunasCount: number;
}

export const getKasbonGlobalSummary = (list: KasbonRecord[]): KasbonGlobalSummary => {
  const safeList = Array.isArray(list) ? list : [];
  let totalInitial = 0;
  let totalPaid = 0;
  let activeCount = 0;
  let lunasCount = 0;

  safeList.forEach((item) => {
    const init = Number(item.initialAmount) || 0;
    const paid = getKasbonTotalPaid(item);
    totalInitial += init;
    totalPaid += paid;
    if (init - paid <= 0) {
      lunasCount++;
    } else {
      activeCount++;
    }
  });

  return {
    totalInitial,
    totalPaid,
    totalRemaining: Math.max(0, totalInitial - totalPaid),
    totalCount: safeList.length,
    activeCount,
    lunasCount,
  };
};

export const formatKasbonWhatsAppMessage = (record: KasbonRecord): string => {
  const totalPaid = getKasbonTotalPaid(record);
  const remaining = getKasbonRemaining(record);
  const isPaidOff = remaining <= 0;

  let msg = `*CATATAN KASBON PEGAWAI*\n`;
  msg += `Nama: ${record.workerName}\n`;
  if (record.workerRole) msg += `Jabatan: ${record.workerRole}\n`;
  if (record.projectName) msg += `Proyek: ${record.projectName}\n`;
  msg += `Tanggal Pinjam: ${formatIndonesianDate(record.date)}\n`;
  msg += `Nominal Pinjaman Awal: ${formatRupiah(record.initialAmount)}\n`;
  if (record.reason) msg += `Keperluan: ${record.reason}\n`;
  msg += `\n*RIWAYAT PEMBAYARAN CICILAN:*\n`;

  if (record.payments && record.payments.length > 0) {
    record.payments.forEach((p, idx) => {
      msg += `${idx + 1}. ${formatIndonesianDate(p.date)}: ${formatRupiah(p.amount)}${p.note ? ` (${p.note})` : ''}\n`;
    });
  } else {
    msg += `- Belum ada cicilan yang masuk\n`;
  }

  msg += `\n------------------------\n`;
  msg += `Total Sudah Dicicil: ${formatRupiah(totalPaid)}\n`;
  msg += `*SISA KASBON: ${formatRupiah(remaining)}*\n`;
  msg += `Status: ${isPaidOff ? '✅ LUNAS' : '⏳ BELUM LUNAS'}\n`;
  msg += `------------------------\n`;
  msg += `Catatan ini murni pembukuan kasbon pribadi dan terpisah dari perhitungan borongan. Terima kasih.`;

  return encodeURIComponent(msg);
};
