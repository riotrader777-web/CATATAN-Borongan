import React, { useState } from 'react';
import { 
  Wifi, 
  WifiOff, 
  CheckCircle2, 
  Database, 
  HardDrive, 
  Smartphone, 
  HelpCircle,
  X,
  FileSpreadsheet,
  Download,
  Info
} from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineStatusIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {/* Header Pill Button */}
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition ${
          isOnline
            ? 'bg-emerald-50/80 text-emerald-800 border-emerald-200/80 hover:bg-emerald-100'
            : 'bg-amber-500 text-white border-amber-600 animate-pulse shadow-sm'
        }`}
        title="Klik untuk melihat panduan & status mode offline"
      >
        {isOnline ? (
          <>
            <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-300"></span>
            <span className="hidden md:inline text-[11px] font-bold">Offline Ready</span>
            <span className="md:hidden text-[11px] font-bold">Offline OK</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold">Mode Offline Aktif</span>
          </>
        )}
      </button>

      {/* Floating Alert Banner when completely Offline */}
      {!isOnline && (
        <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-xl bg-stone-900/95 text-white px-3.5 py-2.5 text-xs font-medium shadow-xl border border-stone-700 backdrop-blur-xs">
          <div className="p-1 rounded-lg bg-amber-500/20 text-amber-400">
            <WifiOff className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-amber-400">Anda Sedang Offline</div>
            <div className="text-[11px] text-stone-300">Semua data & fitur tetap berfungsi normal di perangkat ini.</div>
          </div>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="ml-2 text-xs font-bold text-amber-400 hover:text-amber-300 underline"
          >
            Pelajari
          </button>
        </div>
      )}

      {/* Offline Help / Explanation Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-stone-100 bg-gradient-to-r from-stone-900 to-stone-800 text-white">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${isOnline ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                    Aplikasi 100% Bisa Offline
                    <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-full ${
                      isOnline ? 'bg-emerald-500/30 text-emerald-300' : 'bg-amber-500/30 text-amber-300'
                    }`}>
                      {isOnline ? 'Terhubung' : 'Offline'}
                    </span>
                  </h3>
                  <p className="text-xs text-stone-300">
                    Bisa digunakan di proyek pelosok tanpa sinyal internet
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowModal(false)}
                className="p-2 text-stone-400 hover:text-white hover:bg-stone-700/50 rounded-xl transition"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs text-stone-700 max-h-[75vh] overflow-y-auto">
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-emerald-950 text-sm">
                    Jawaban: YA, BISA DIBUKA & DIGUNAKAN SECARA OFFLINE!
                  </h4>
                  <p className="text-emerald-800 mt-1 leading-relaxed">
                    Aplikasi ini dirancang menggunakan arsitektur <strong>Progressive Web App (PWA)</strong> dan <strong>Local-First Storage</strong>, sehingga Anda tidak perlu kuota internet saat bekerja di lokasi proyek.
                  </p>
                </div>
              </div>

              {/* 4 Pilar Offline */}
              <div className="space-y-2.5">
                <div className="font-bold text-stone-900 uppercase text-[11px] tracking-wider">
                  Bagaimana Cara Kerjanya?
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-3">
                  <div className="p-2 bg-amber-100 text-amber-800 rounded-lg shrink-0">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-stone-900">1. Data Tersimpan di HP / Komputer Anda</div>
                    <p className="text-stone-600 mt-0.5 leading-relaxed">
                      Catatan 5 proyek, kesepakatan owner, riwayat termin, absensi 50 pegawai, belanja rokok/kopi/makan, hingga catatan kasbon pegawai disimpan langsung di memori perangkat (<code className="bg-stone-200 px-1 py-0.5 rounded text-[11px]">LocalStorage</code>), bukan di server internet luar.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-3">
                  <div className="p-2 bg-blue-100 text-blue-800 rounded-lg shrink-0">
                    <HardDrive className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-stone-900">2. Service Worker Caching (PWA Cache)</div>
                    <p className="text-stone-600 mt-0.5 leading-relaxed">
                      Seluruh file program, tampilan tombol, dan sistem hitungan otomatis sudah di-cache oleh browser. Sekali pernah dibuka, aplikasi dapat dimuat ulang kapan saja meski paket data HP dimatikan atau mode pesawat aktif.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg shrink-0">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-stone-900">3. Cara Terbaik: Pasang di Layar Utama HP</div>
                    <p className="text-stone-600 mt-0.5 leading-relaxed">
                      Buka menu browser Chrome di HP (titik tiga ⋮) lalu pilih <strong>"Instal aplikasi"</strong> atau <strong>"Tambahkan ke Layar Utama"</strong>. Aplikasi akan muncul dengan ikon di menu HP dan bisa dibuka kapan saja seperti aplikasi Android biasa.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-3">
                  <div className="p-2 bg-purple-100 text-purple-800 rounded-lg shrink-0">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-stone-900">4. Ekspor Cadangan (Backup JSON)</div>
                    <p className="text-stone-600 mt-0.5 leading-relaxed">
                      Anda bisa mencadangkan seluruh data ke file JSON kapan saja tanpa internet menggunakan tombol ikon Download di bagian atas.
                    </p>
                  </div>
                </div>
              </div>

              {/* Panduan Cetak Offline */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-amber-700" />
                  Cetak Slip Gaji & RAB saat Offline:
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Fitur cetak slip amplop Sabtu dan kalkulator RAB langsung memanfaatkan dialog cetak bawaan HP/laptop. Anda bisa langsung menyimpannya menjadi file <strong>PDF</strong> atau mencetak ke printer portable tanpa membutuhkan internet.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-stone-50 border-t border-stone-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold text-xs transition"
              >
                Mengerti & Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
