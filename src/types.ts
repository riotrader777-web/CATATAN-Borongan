export type AttendanceStatus = 'H' | 'S' | 'A';

export interface Worker {
  id: string;
  name: string;
  dailyWage: number; // Nominal gaji per hari (dalam Rupiah)
  role?: string;     // Tukang, Kenek, Mandor, dll.
  phone?: string;
}

export interface AttendanceRecord {
  status: AttendanceStatus;
  customWage?: number; // Override jika ada lembur / kasbon harian
  note?: string;
}

// date string format: YYYY-MM-DD
// Map of: date -> workerId -> AttendanceRecord
export type AttendanceMap = Record<string, Record<string, AttendanceRecord>>;

export type ExpenseCategory = 'konsumsi' | 'operasional' | 'material' | 'lainnya';

export interface ExpenseItem {
  id: string;
  date: string; // YYYY-MM-DD
  name: string; // contoh: Kopi & Gula, Rokok Surya, Gorengan, Teh, Nasi Bungkus, dll.
  category: ExpenseCategory;
  amount: number; // Rupiah
  note?: string;
  paymentMethod?: 'tunai' | 'transfer'; // default 'tunai' (potong uang cash di tangan)
}

export interface SaturdayPayrollPayment {
  saturdayDate: string; // YYYY-MM-DD of the Saturday
  paidAt?: string;      // ISO string when marked paid
  isPaid: boolean;
  totalPaid: number;
  note?: string;        // Catatan khusus pembayaran gaji hari sabtu
  paymentMethod?: 'tunai' | 'transfer'; // default 'tunai' (potong uang cash di tangan)
}

export type TerminPaymentMethod = 'cash' | 'transfer';

export interface OwnerTermin {
  id: string;
  date: string;         // YYYY-MM-DD
  title: string;        // DP Awal, Termin 1 (Struktur), Termin 2, Pelunasan
  amount: number;       // Nominal uang yang diterima dari owner
  paymentMethod?: TerminPaymentMethod; // 'cash' (Tunai di Tangan) vs 'transfer' (Saldo di Rekening)
  note?: string;        // Catatan transfer / kuitansi / rekening bank / bukti
}

export type CashTransferType = 'tarik_tunai' | 'setor_tunai';

export interface CashTransferRecord {
  id: string;
  date: string;          // YYYY-MM-DD
  type: CashTransferType; // 'tarik_tunai' (Rekening -> Cash) | 'setor_tunai' (Cash -> Rekening)
  amount: number;        // Nominal uang yang dipindahkan (Rp)
  note?: string;         // Keterangan (misal: "Tarik ATM untuk gaji & konsumsi")
  createdAt: string;     // ISO timestamp
}

export interface KasbonPayment {
  id: string;
  date: string;         // YYYY-MM-DD tanggal bayar cicilan
  amount: number;       // Nominal cicilan yang dibayarkan (mengurangi sisa kasbon)
  note?: string;        // Keterangan / metode bayar (Tunai, Transfer, dll)
  createdAt: string;    // ISO timestamp
}

export interface KasbonRecord {
  id: string;
  workerName: string;       // Nama pegawai / tukang
  workerRole?: string;      // Role / Jabatan (Tukang Batu, Kenek, Mandor, dll)
  workerPhone?: string;     // No HP / WhatsApp pegawai
  workerId?: string;        // ID pegawai jika ditautkan ke slot pegawai
  projectName?: string;     // Catatan referensi proyek asal pegawai (opsional)
  date: string;             // Tanggal pinjaman kasbon diberikan (YYYY-MM-DD)
  initialAmount: number;    // Nominal pinjaman awal kasbon (Rupiah)
  reason?: string;          // Keperluan pinjaman (Keluarga, Beras, Sakit, Sekolah, dll)
  notes?: string;           // Catatan perjanjian / jaminan / keterangan
  payments: KasbonPayment[]; // Riwayat pembayaran cicilan
  createdAt: string;        // ISO timestamp
}

export type TemporaryWageType = 'harian' | 'borongan' | 'setengah_hari' | 'lembur_cor';

export interface TemporaryWorkerPayment {
  id: string;
  date: string;                  // Tanggal kerja (YYYY-MM-DD)
  workerName: string;            // Nama pekerja / nama rombongan (cth: "Pak Slamet (Tukang Cor)", "Tim Mas Joko (4 org)")
  taskDescription: string;       // Tugas / bagian yang dikerjakan: "Ngecor Dak Lantai 2", "Ngecor Pondasi Sloof", dll.
  wageType: TemporaryWageType;   // Tipe upah: Harian Lepas, Borongan Lepas Sekali Jadi, Setengah Hari, Lembur Malam Cor
  headcount: number;             // Jumlah orang (default 1)
  ratePerPerson: number;         // Upah per orang / shift (Rp)
  totalAmount: number;           // Total upah (Rp)
  isPaid: boolean;               // Status: Sudah Dibayar (Lunas) / Belum
  paidAt?: string;               // Tanggal & jam bayar
  paymentMethod: 'tunai' | 'transfer'; // Tunai / Transfer
  notes?: string;                // Catatan khusus (cth: "Termasuk rokok & kopi")
  createdAt: string;             // ISO timestamp
}

export type ConcreteQuality = 'K-225' | 'K-250' | 'K-300' | 'K-350' | 'K-400' | 'Lainnya';
export type PumpType = 'standar' | 'long_boom' | 'mini_kodok' | 'super_long_boom' | 'tanpa_pompa';

export interface ConcreteCastingRecord {
  id: string;
  date: string;                      // YYYY-MM-DD
  castingSection: string;            // Bagian pengecoran: "Dak Lantai 2", "Pondasi Sloof", dll.
  vendorName: string;                // Suplier Ready Mix: Jayamix, SCG, Pionirbeton, Holcim, dll.
  concreteQuality: ConcreteQuality;  // K-225, K-250, K-300, K-350, dll.
  truckCount?: number;               // Jumlah truk mixer (cth: 2 truk)
  volumeM3: number;                  // Volume pemesanan dalam m3 (meter kubik)
  pricePerM3: number;                // Harga per m3 (Rp)
  totalConcreteCost: number;         // Total biaya beton = volumeM3 * pricePerM3
  
  // Sewa Pompa Beton (Concrete Pump)
  pumpType: PumpType;                // Standar, Long Boom, Mini/Kodok, Tanpa Pompa
  pumpRentalCost: number;            // Biaya sewa pompa pokok (Rp)
  pumpExtraPipeCost?: number;        // Biaya pipa sambungan tambahan jika jauh (Rp)
  operatorTips?: number;             // Uang makan / tips kru pompa & sopir molen (Rp)
  totalPumpCost: number;             // pumpRentalCost + pumpExtraPipeCost + operatorTips

  // Total Keseluruhan
  grandTotal: number;                // totalConcreteCost + totalPumpCost
  
  // Status Pembayaran & Pembuktian
  isPaid: boolean;                   // Lunas / Belum Bayar (Bon/Tempo)
  paymentMethod: 'tunai' | 'transfer'; // Tunai (Cash) / Rekening (Transfer Bank)
  paidAt?: string;                   // ISO date string saat bayar
  deliveryOrderNo?: string;          // No. Surat Jalan / No. DO
  notes?: string;                    // Catatan khusus pengecoran
  createdAt: string;                 // ISO timestamp
}

export interface ProjectData {
  id: string;              // 'project-1' s/d 'project-5'
  projectNumber: number;   // 1 s/d 5
  projectName: string;     // Nama proyek
  ownerName?: string;      // Nama pemilik proyek / owner
  ownerPhone?: string;     // No HP / WA owner
  ownerDealAmount: number; // Nilai total kesepakatan deal dari owner
  ownerDealCash?: number;  // Porsi nominal deal secara Tunai / Cash (uang di tangan)
  ownerDealBank?: number;  // Porsi nominal deal via Saldo di Rekening (Transfer Bank)
  ownerDealNotes?: string; // Catatan kesepakatan kontrak borongan dari owner
  ownerTermins: OwnerTermin[]; // Catatan riwayat pembayaran/termin dari owner
  workers: Worker[];       // Daftar 50 pegawai per proyek
  attendance: AttendanceMap;
  expenses: ExpenseItem[];
  weeklyPayments: Record<string, SaturdayPayrollPayment>;
  temporaryWorkers?: TemporaryWorkerPayment[]; // Karyawan sekali pakai / cabutan harian lepas (ngecor, langsir, dll.)
  concreteCastings?: ConcreteCastingRecord[]; // Biaya pengecoran beton ready mix (Jayamix) & sewa pompa beton (concrete pump)
  cashTransfers?: CashTransferRecord[]; // Riwayat tarik tunai / mutasi saldo antara rekening & cash
}

export interface MultiProjectStore {
  activeProjectId: string;
  projects: ProjectData[];
  kasbonList?: KasbonRecord[]; // Murni catatan kasbon pegawai terpisah dari hitungan borongan
}
