import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Download, 
  ExternalLink, 
  Copy, 
  Check, 
  X, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  Info,
  CheckCircle2
} from 'lucide-react';

interface AndroidApkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidApkModal: React.FC<AndroidApkModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [activeGuideTab, setActiveGuideTab] = useState<'pwa' | 'pwabuilder' | 'capacitor'>('pwa');

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (!isOpen) return null;

  const currentUrl = window.location.href;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleTriggerInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert('Untuk menginstal di HP Android: Buka menu titik tiga (⋮) di Chrome, lalu pilih "Instal aplikasi" atau "Tambahkan ke Layar Utama".');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-6 animate-in fade-in zoom-in duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-100 bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 rounded-xl backdrop-blur-xs">
              <Smartphone className="w-6 h-6 text-emerald-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-white">Pasang Aplikasi di HP Android</h3>
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-400/30 border border-emerald-300/40 rounded-full text-emerald-100">
                  Bisa APK / PWA
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                Bisa diinstal langsung di layar utama Android atau dibuat file .APK
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Quick status box */}
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-emerald-950">Aplikasi Sudah Siap Digunakan di Android!</h4>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Aplikasi ini sudah dilengkapi teknologi <strong>PWA (Progressive Web App)</strong>. Anda bisa langsung memasangnya di HP tanpa perlu repot download APK yang rawan virus.
                </p>
              </div>
            </div>
            {deferredPrompt && (
              <button
                onClick={handleTriggerInstall}
                className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-xs flex items-center justify-center gap-2 shrink-0 transition-colors"
              >
                <Download className="w-4 h-4" />
                Instal Sekarang
              </button>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-stone-200">
            <button
              onClick={() => setActiveGuideTab('pwa')}
              className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
                activeGuideTab === 'pwa'
                  ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>1. Instal Cepat di HP (PWA)</span>
            </button>
            <button
              onClick={() => setActiveGuideTab('pwabuilder')}
              className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
                activeGuideTab === 'pwabuilder'
                  ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>2. Buat File .APK</span>
            </button>
            <button
              onClick={() => setActiveGuideTab('capacitor')}
              className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
                activeGuideTab === 'capacitor'
                  ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <Info className="w-4 h-4" />
              <span>3. Android Studio</span>
            </button>
          </div>

          {/* TAB 1: PWA (Rekomendasi Utama) */}
          {activeGuideTab === 'pwa' && (
            <div className="space-y-4">
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-amber-900">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Kenapa cara ini paling direkomendasikan?</strong>
                  <ul className="list-disc pl-4 mt-1 space-y-0.5 text-amber-800">
                    <li>Tidak memakan memori HP (sangat ringan, ukuran di bawah 1 MB).</li>
                    <li>Muncul ikon resmi di layar menu HP persis seperti aplikasi APK biasa.</li>
                    <li>Tampilan layar penuh (fullscreen) tanpa kotak browser Chrome.</li>
                    <li>Bisa dibuka tanpa koneksi internet (offline) dan data otomatis tersimpan di HP.</li>
                  </ul>
                </div>
              </div>

              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">1</span>
                Cara Pasang di HP Android (Hanya 10 Detik):
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs flex flex-col justify-between">
                  <div>
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-xs mb-2">
                      1
                    </div>
                    <h5 className="font-bold text-stone-800 mb-1">Buka di Chrome HP</h5>
                    <p className="text-stone-600">
                      Buka tautan website ini menggunakan browser <strong>Google Chrome</strong> di HP Android Anda.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs flex flex-col justify-between">
                  <div>
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-xs mb-2">
                      2
                    </div>
                    <h5 className="font-bold text-stone-800 mb-1">Menu Titik Tiga (⋮)</h5>
                    <p className="text-stone-600">
                      Ketuk ikon menu titik tiga di pojok kanan atas layar Chrome Anda.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs flex flex-col justify-between">
                  <div>
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-xs mb-2">
                      3
                    </div>
                    <h5 className="font-bold text-stone-800 mb-1">Pilih "Instal Aplikasi"</h5>
                    <p className="text-stone-600">
                      Ketuk <strong>"Instal aplikasi"</strong> atau <strong>"Tambahkan ke Layar Utama"</strong>. Ikon akan langsung muncul di HP Anda!
                    </p>
                  </div>
                </div>
              </div>

              {/* Share link to open on phone */}
              <div className="p-4 bg-stone-100 rounded-xl border border-stone-200 space-y-2">
                <div className="text-xs font-bold text-stone-700">Tautan Aplikasi untuk Dibuka di HP:</div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={currentUrl}
                    className="flex-1 bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-700 font-mono truncate"
                  />
                  <button
                    onClick={handleCopyUrl}
                    className="px-3.5 py-2 bg-stone-800 hover:bg-stone-900 text-white font-medium text-xs rounded-lg flex items-center gap-1.5 shrink-0 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Tersalin!' : 'Salin Tautan'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PWABuilder (Untuk dapat file fisik .apk) */}
          {activeGuideTab === 'pwabuilder' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-blue-900">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Solusi Keterangan "Missing Name" di PWABuilder:</strong>
                  <p className="text-blue-800 mt-1">
                    File <strong>Manifest PWA resmi</strong> kini sudah aktif terpasang dengan nama <strong>"Kalkulator Borongan Proyek"</strong>, short name <strong>"Borongan"</strong>, ikon lengkap, serta screenshots.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-stone-900">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">1</span>
                    Salin URL Web Aplikasi
                  </div>
                  <div className="flex items-center gap-2 pl-7">
                    <input
                      type="text"
                      readOnly
                      value={currentUrl}
                      className="flex-1 bg-white border border-stone-300 rounded-md px-2.5 py-1.5 text-xs font-mono truncate text-stone-700"
                    />
                    <button
                      onClick={handleCopyUrl}
                      className="px-3 py-1.5 bg-stone-800 text-white rounded-md text-xs font-medium flex items-center gap-1 shrink-0"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copied ? 'Tersalin' : 'Salin URL'}
                    </button>
                  </div>
                  <p className="pl-7 text-[11px] text-stone-500">
                    *Tips: Pastikan menggunakan link yang dibagikan (Share Link) jika web berada di mode preview.
                  </p>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-stone-900">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">2</span>
                    Buka PWABuilder.com & Tempel URL
                  </div>
                  <div className="pl-7 flex items-center gap-2">
                    <a
                      href="https://www.pwabuilder.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md text-xs transition-colors"
                    >
                      Buka PWABuilder.com
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <span className="text-stone-600 text-xs">Tempel URL tadi lalu klik tombol <strong>Start</strong>.</span>
                  </div>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-stone-900">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">3</span>
                    Jika Masih Muncul Kotak "Missing Name" di PWABuilder:
                  </div>
                  <div className="pl-7 space-y-1.5 text-stone-600 text-[11px]">
                    <p>
                      Hal ini terjadi jika bot scanner PWABuilder terhalang oleh sesi login preview. Anda cukup mengisinya langsung di kotak input yang disediakan PWABuilder:
                    </p>
                    <div className="bg-white p-2.5 rounded-lg border border-stone-200 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-stone-500">App Name:</span>
                        <span className="font-mono font-bold text-stone-800">Kalkulator Borongan Proyek</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-stone-500">Short Name:</span>
                        <span className="font-mono font-bold text-stone-800">Borongan</span>
                      </div>
                    </div>
                    <p className="text-emerald-700 font-medium">
                      Setelah diisi, klik tombol simpan/lanjutkan di PWABuilder.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
                  <div className="flex items-center gap-2 font-bold text-stone-900">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">4</span>
                    Download File APK Android
                  </div>
                  <p className="pl-7 text-stone-600">
                    Klik tombol <strong>"Package for Android"</strong>, lalu pilih <strong>Download APK</strong>. File .apk akan langsung terunduh dan siap diinstal di semua HP Android.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Capacitor (Untuk Pengembang / Developer) */}
          {activeGuideTab === 'capacitor' && (
            <div className="space-y-3 text-xs">
              <p className="text-stone-600">
                Jika Anda seorang programmer dan ingin meng-compile file APK mandiri lewat <strong>Android Studio</strong> menggunakan source code ini:
              </p>

              <div className="bg-stone-900 text-stone-100 p-3.5 rounded-xl font-mono text-[11px] space-y-2 overflow-x-auto">
                <div className="text-stone-400"># 1. Install Capacitor di project ini:</div>
                <div className="text-emerald-400">npm install @capacitor/core @capacitor/cli @capacitor/android</div>
                
                <div className="text-stone-400 pt-2"># 2. Inisialisasi konfigurasi Capacitor:</div>
                <div className="text-emerald-400">npx cap init "Borongan Proyek" "com.proyek.borongan" --web-dir=dist</div>
                
                <div className="text-stone-400 pt-2"># 3. Build web dan tambahkan folder Android:</div>
                <div className="text-emerald-400">npm run build</div>
                <div className="text-emerald-400">npx cap add android</div>
                <div className="text-emerald-400">npx cap sync</div>
                
                <div className="text-stone-400 pt-2"># 4. Buka di Android Studio lalu Build APK:</div>
                <div className="text-emerald-400">npx cap open android</div>
              </div>

              <div className="p-3 bg-stone-100 rounded-lg text-stone-600 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Di Android Studio, pilih menu <strong>Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong> untuk menghasilkan file release APK.</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="text-xs text-stone-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Data tersimpan aman di perangkat lokal Anda.</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-800 hover:bg-stone-900 text-white font-medium text-xs rounded-xl transition-colors"
          >
            Selesai / Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
