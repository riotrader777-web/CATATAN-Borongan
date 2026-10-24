import { ProjectData } from '../types';
import { calculateDayWage, getDaysInWorkWeek } from './formatters';

export interface ProjectCashFlowSummary {
  // Alokasi Kesepakatan Deal
  dealAmount: number;
  dealCash: number;
  dealBank: number;

  // Gaji Karyawan Tetap
  totalRegularWages: number;    // Akumulasi absensi berjalan
  totalPaidWages: number;       // HANYA yang sudah diklik "Sudah Dibayar" (lunas)
  accruedUnpaidWages: number;   // Gaji berjalan (belum lunas, tidak memotong kas)

  // Pengeluaran yang memotong Uang Cash di Tangan
  cashWagesSpent: number;          // HANYA gaji yang sudah lunas dibayar tunai
  cashTemporaryWagesSpent: number; // HANYA pekerja lepas yang lunas tunai
  cashExpensesSpent: number;       // Nota belanja/konsumsi tunai
  cashConcreteSpent: number;       // Jayamix/pompa lunas tunai
  totalCashSpent: number;

  // Pengeluaran yang memotong Saldo di Rekening Bank
  bankWagesSpent: number;          // HANYA gaji yang sudah lunas dibayar transfer
  bankTemporaryWagesSpent: number; // HANYA pekerja lepas yang lunas transfer
  bankExpensesSpent: number;       // Nota belanja/operasional transfer
  bankConcreteSpent: number;       // Jayamix/pompa lunas transfer
  totalBankSpent: number;

  // Total Pengeluaran Real yang Sudah Memotong Saldo
  totalAllSpent: number;

  // Sisa Saldo Riil Saat Ini
  remainingCash: number;
  remainingBank: number;
  totalRemaining: number;

  // Status Defisit Kas
  isCashDeficit: boolean;
  isBankDeficit: boolean;
}

/**
 * Menghitung arus kas (cash flow) otomatis proyek:
 * REVISI: Gaji karyawan TIDAK memotong saldo saat memasukkan absensi harian.
 * Saldo HANYA terpotong jika sudah diklik "Sudah Dibayar" (isPaid: true) pada rekap gaji Sabtu.
 */
export const calculateProjectCashFlow = (project: ProjectData): ProjectCashFlowSummary => {
  const dealAmount = project.ownerDealAmount || 0;
  const dealCash = project.ownerDealCash ?? 0;
  const dealBank = project.ownerDealBank !== undefined && project.ownerDealBank !== null
    ? project.ownerDealBank
    : Math.max(0, dealAmount - dealCash);

  // 1. Akumulasi Total Gaji Seluruh Absensi
  let totalRegularWages = 0;
  const workerWageMap = new Map<string, number>();
  project.workers.forEach((w) => workerWageMap.set(w.id, w.dailyWage));

  Object.values(project.attendance || {}).forEach((dayRecords) => {
    Object.entries(dayRecords).forEach(([workerId, rec]) => {
      const base = workerWageMap.get(workerId) || 0;
      totalRegularWages += calculateDayWage(rec.status, base, rec.customWage);
    });
  });

  // 2. Gaji Karyawan yang MEMOTONG SALDO:
  // HANYA dihitung jika sudah diklik "Sudah Dibayar" (isPaid === true)
  let cashWagesSpent = 0;
  let bankWagesSpent = 0;
  let totalPaidWages = 0;

  Object.values(project.weeklyPayments || {}).forEach((pay) => {
    if (pay.isPaid) {
      let paidAmt = pay.totalPaid || 0;
      // Jika totalPaid belum tercatat tapi isPaid true, hitung upah minggu terkait
      if (paidAmt === 0 && pay.saturdayDate) {
        const days = getDaysInWorkWeek(pay.saturdayDate);
        days.forEach((dayStr) => {
          const dayRecords = project.attendance[dayStr] || {};
          Object.entries(dayRecords).forEach(([workerId, rec]) => {
            const base = workerWageMap.get(workerId) || 0;
            paidAmt += calculateDayWage(rec.status, base, rec.customWage);
          });
        });
      }

      totalPaidWages += paidAmt;
      if (pay.paymentMethod === 'transfer') {
        bankWagesSpent += paidAmt;
      } else {
        // Default pembayaran gaji sabtu adalah tunai (memotong uang cash di tangan)
        cashWagesSpent += paidAmt;
      }
    }
  });

  // Gaji berjalan yang belum dibayar (tidak memotong saldo kas)
  const accruedUnpaidWages = Math.max(0, totalRegularWages - totalPaidWages);

  // 3. Upah Pekerja Cabutan / Cor Sekali Pakai (temporaryWorkers)
  let cashTemporaryWagesSpent = 0;
  let bankTemporaryWagesSpent = 0;
  (project.temporaryWorkers || []).forEach((t) => {
    if (t.isPaid) {
      if (t.paymentMethod === 'transfer') {
        bankTemporaryWagesSpent += t.totalAmount;
      } else {
        cashTemporaryWagesSpent += t.totalAmount;
      }
    }
  });

  // 4. Keperluan Lainnya (Expenses: Konsumsi, Material, Operasional)
  let cashExpensesSpent = 0;
  let bankExpensesSpent = 0;
  (project.expenses || []).forEach((e) => {
    if (e.paymentMethod === 'transfer') {
      bankExpensesSpent += e.amount;
    } else {
      cashExpensesSpent += e.amount;
    }
  });

  // 5. Cor Jayamix & Sewa Pompa (concreteCastings)
  let cashConcreteSpent = 0;
  let bankConcreteSpent = 0;
  (project.concreteCastings || []).forEach((c) => {
    if (c.isPaid) {
      if (c.paymentMethod === 'transfer') {
        bankConcreteSpent += c.grandTotal;
      } else {
        cashConcreteSpent += c.grandTotal;
      }
    }
  });

  // Total Terpotong dari Saldo Riil
  const totalCashSpent = cashWagesSpent + cashTemporaryWagesSpent + cashExpensesSpent + cashConcreteSpent;
  const totalBankSpent = bankWagesSpent + bankTemporaryWagesSpent + bankExpensesSpent + bankConcreteSpent;
  const totalAllSpent = totalCashSpent + totalBankSpent;

  // Sisa Saldo Riil Saat Ini
  const remainingCash = dealCash - totalCashSpent;
  const remainingBank = dealBank - totalBankSpent;
  const totalRemaining = dealAmount - totalAllSpent;

  return {
    dealAmount,
    dealCash,
    dealBank,

    totalRegularWages,
    totalPaidWages,
    accruedUnpaidWages,

    cashWagesSpent,
    cashTemporaryWagesSpent,
    cashExpensesSpent,
    cashConcreteSpent,
    totalCashSpent,

    bankWagesSpent,
    bankTemporaryWagesSpent,
    bankExpensesSpent,
    bankConcreteSpent,
    totalBankSpent,

    totalAllSpent,

    remainingCash,
    remainingBank,
    totalRemaining,

    isCashDeficit: remainingCash < 0,
    isBankDeficit: remainingBank < 0,
  };
};
