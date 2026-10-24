import { AttendanceStatus } from '../types';

export const formatRupiah = (amount: number): string => {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'Rp 0';
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumberInput = (num: number): string => {
  if (!num && num !== 0) return '';
  return new Intl.NumberFormat('id-ID').format(num);
};

export const parseNumberInput = (str: string): number => {
  if (!str) return 0;
  // Strip out everything except digits
  const cleaned = str.replace(/[^\d]/g, '');
  return cleaned ? parseInt(cleaned, 10) : 0;
};

// Date utilities
export const getTodayDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const INDONESIAN_DAYS = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
];

export const INDONESIAN_MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export const formatIndonesianDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const dayName = INDONESIAN_DAYS[date.getDay()];
  const monthName = INDONESIAN_MONTHS[date.getMonth()];
  return `${dayName}, ${d} ${monthName} ${y}`;
};

export const formatShortDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const dayName = INDONESIAN_DAYS[date.getDay()];
  return `${dayName.slice(0, 3)}, ${d}/${m}`;
};

export const getDayName = (dateStr: string): string => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return INDONESIAN_DAYS[date.getDay()];
};

// Calculate wage earned on a day based on status and base wage
export const calculateDayWage = (
  status: AttendanceStatus | undefined,
  baseDailyWage: number,
  customWage?: number
): number => {
  if (customWage !== undefined && customWage !== null) {
    return customWage;
  }
  if (!status || status === 'A') {
    return 0;
  }
  if (status === 'S') {
    return Math.round(baseDailyWage * 0.5);
  }
  if (status === 'H') {
    return baseDailyWage;
  }
  return 0;
};

// Given any date YYYY-MM-DD, find the nearest Saturday that ends this work week
// Periode kerja dimulai dari hari Minggu dan tutup buku gaji di hari Sabtu (+6 hari dari hari Minggu)
export const getSaturdayOfWeek = (dateStr: string): string => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d, 12, 0, 0);
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  
  // Calculate days until Saturday (6)
  let daysUntilSaturday = 6 - dayOfWeek;
  if (dayOfWeek === 0) {
    // Sunday (hari Minggu): awal periode kerja mingguan, tutup buku pada hari Sabtu (+6 hari)
    daysUntilSaturday = 6;
  }
  
  const saturdayDate = new Date(date);
  saturdayDate.setDate(date.getDate() + daysUntilSaturday);

  const sy = saturdayDate.getFullYear();
  const sm = String(saturdayDate.getMonth() + 1).padStart(2, '0');
  const sd = String(saturdayDate.getDate()).padStart(2, '0');
  return `${sy}-${sm}-${sd}`;
};

// Get array of 7 dates for the week ending on the given Saturday
// Periode hitungan penuh: Hari Minggu s/d Sabtu (7 hari kerja)
export const getDaysInWorkWeek = (saturdayDateStr: string): string[] => {
  const [y, m, d] = saturdayDateStr.split('-').map(Number);
  const satDate = new Date(y, m - 1, d, 12, 0, 0);
  
  const dates: string[] = [];
  // 6 hari sebelum Sabtu adalah hari Minggu:
  // i = 6: Minggu (Sun)
  // i = 5: Senin (Mon)
  // i = 4: Selasa (Tue)
  // i = 3: Rabu (Wed)
  // i = 2: Kamis (Thu)
  // i = 1: Jumat (Fri)
  // i = 0: Sabtu (Sat)
  for (let i = 6; i >= 0; i--) {
    const cur = new Date(satDate);
    cur.setDate(satDate.getDate() - i);
    const cy = cur.getFullYear();
    const cm = String(cur.getMonth() + 1).padStart(2, '0');
    const cd = String(cur.getDate()).padStart(2, '0');
    dates.push(`${cy}-${cm}-${cd}`);
  }
  return dates;
};

export const terbilangRupiah = (nominal: number): string => {
  if (nominal <= 0) return 'Nol Rupiah';
  const satuan = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];
  const bil = (n: number): string => {
    if (n < 12) return satuan[n];
    if (n < 20) return bil(n - 10) + ' Belas';
    if (n < 100) return bil(Math.floor(n / 10)) + ' Puluh' + (n % 10 !== 0 ? ' ' + bil(n % 10) : '');
    if (n < 200) return 'Seratus' + (n - 100 !== 0 ? ' ' + bil(n - 100) : '');
    if (n < 1000) return bil(Math.floor(n / 100)) + ' Ratus' + (n % 100 !== 0 ? ' ' + bil(n % 100) : '');
    if (n < 2000) return 'Seribu' + (n - 1000 !== 0 ? ' ' + bil(n - 1000) : '');
    if (n < 1000000) return bil(Math.floor(n / 1000)) + ' Ribu' + (n % 1000 !== 0 ? ' ' + bil(n % 1000) : '');
    if (n < 1000000000) return bil(Math.floor(n / 1000000)) + ' Juta' + (n % 1000000 !== 0 ? ' ' + bil(n % 1000000) : '');
    if (n < 1000000000000) return bil(Math.floor(n / 1000000000)) + ' Miliar' + (n % 1000000000 !== 0 ? ' ' + bil(n % 1000000000) : '');
    return bil(Math.floor(n / 1000000000000)) + ' Triliun';
  };
  return bil(Math.floor(nominal)).trim() + ' Rupiah';
};
