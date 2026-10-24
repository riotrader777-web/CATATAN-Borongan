import React, { useState, useEffect } from 'react';
import { 
  X, 
  Share2, 
  Download, 
  Upload, 
  Copy, 
  Check, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Link, 
  Building2, 
  Users, 
  HardHat, 
  Truck, 
  Coins, 
  ShieldCheck, 
  ArrowRight,
  Send,
  MessageCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowDownToLine
} from 'lucide-react';
import LZString from 'lz-string';
import { MultiProjectStore, ProjectData } from '../types';
import { formatRupiah, getTodayDateString } from '../utils/formatters';
import { sanitizeProjectData, sanitizeKasbonRecord, TOTAL_PROJECTS, createDefaultProject } from '../utils/storage';

interface ShareSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: MultiProjectStore;
  activeProject: ProjectData;
  onApplyStore: (newStore: MultiProjectStore) => void;
  onApplySingleProject: (targetProjectId: string, project: ProjectData) => void;
  initialImportData?: MultiProjectStore | ProjectData | null;
}

export const ShareSyncModal: React.FC<ShareSyncModalProps> = ({
  isOpen,
  onClose,
  store,
  activeProject,
  onApplyStore,
  onApplySingleProject,
  initialImportData = null,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [exportScope, setExportScope] = useState<'all' | 'active'>('all');
  
  // Export states
  const [shareLink, setShareLink] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [compressedCode, setCompressedCode] = useState<string>('');
  
  // Import states
  const [importTextCode, setImportTextCode] = useState<string>('');
  const [importPreview, setImportPreview] = useState<any | null>(null);
  const [importMode, setImportMode] = useState<'replace_all' | 'single_target'>('replace_all');
  const [targetProjectSlot, setTargetProjectSlot] = useState<string>(activeProject.id);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<boolean>(false);

  // When opened with initial imported data (e.g. from URL detection)
  useEffect(() => {
    if (initialImportData) {
      setActiveTab('import');
      setImportPreview(initialImportData);
    }
  }, [initialImportData]);

  // Generate share link and compressed string when modal opens or scope changes
  useEffect(() => {
    if (!isOpen) return;

    try {
      const dataToExport = exportScope === 'all' 
        ? {
            type: 'borongan_all_projects_sync',
            version: '2.0',
            exportedAt: new Date().toISOString(),
            activeProjectId: store.activeProjectId,
            projects: store.projects,
            kasbonList: store.kasbonList || [],
          }
        : {
            type: 'borongan_single_project_sync',
            version: '2.0',
            exportedAt: new Date().toISOString(),
            project: activeProject,
          };

      const jsonStr = JSON.stringify(dataToExport);
      const compressed = LZString.compressToEncodedURIComponent(jsonStr);
      setCompressedCode(compressed);

      // Construct absolute URL with hash parameter
      const baseUrl = window.location.origin + window.location.pathname;
      const fullUrl = `${baseUrl}#sync=${compressed}`;
      setShareLink(fullUrl);
    } catch (err) {
      console.error('Failed to encode share link', err);
    }
  }, [isOpen, exportScope, store, activeProject]);

  if (!isOpen) return null;

  // Handle Copy Link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = shareLink;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Handle Copy Text Code
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(compressedCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = compressedCode;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  // Handle Share WhatsApp
  const handleShareWhatsApp = () => {
    const scopeLabel = exportScope === 'all' 
      ? 'Rekap 5 Proyek & Kasbon Lengkap' 
      : `Catatan ${activeProject.projectName}`;
    const textMsg = encodeURIComponent(
      `*DATA CATATAN BORONGAN PROYEK*\n` +
      `Halo Partner, berikut update catatan kerja (${scopeLabel}).\n\n` +
      `Buka link ini di browser HP Anda untuk langsung mengimpor data otomatis:\n` +
      `${shareLink}\n\n` +
      `_Aplikasi Kalkulator Borongan Proyek_`
    );
    window.open(`https://api.whatsapp.com/send?text=${textMsg}`, '_blank');
  };

  // Download JSON Backup
  const handleDownloadJson = () => {
    const dataToExport = exportScope === 'all' ? store : activeProject;
    const jsonStr = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = exportScope === 'all'
      ? `data-borongan-5proyek-${getTodayDateString()}.json`
      : `data-${activeProject.projectName.toLowerCase().replace(/\\s+/g, '-')}-${getTodayDateString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Process text code input or pasted string
  const handleParseTextCode = (text: string) => {
    setImportError(null);
    setImportPreview(null);
    const cleaned = text.trim();
    if (!cleaned) return;

    try {
      let jsonStr = '';
      if (cleaned.startsWith('{') || cleaned.startsWith('[')) {
        // Raw JSON
        jsonStr = cleaned;
      } else {
        // LZ-String compressed code
        const decompressed = LZString.decompressFromEncodedURIComponent(cleaned);
        if (!decompressed) {
          throw new Error('Kode teks tidak valid atau data rusak.');
        }
        jsonStr = decompressed;
      }

      const parsed = JSON.parse(jsonStr);
      validateAndSetPreview(parsed);
    } catch (err: any) {
      setImportError(err.message || 'Gagal membaca kode data. Pastikan kode disalin lengkap.');
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportPreview(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const rawContent = event.target?.result as string;
        const parsed = JSON.parse(rawContent);
        validateAndSetPreview(parsed);
      } catch (err) {
        setImportError('File JSON tidak valid atau format rusak.');
      }
    };
    reader.readAsText(file);
  };

  // Validate and display preview
  const validateAndSetPreview = (data: any) => {
    if (!data) {
      setImportError('Data kosong.');
      return;
    }

    if (data.projects && Array.isArray(data.projects)) {
      setImportPreview({
        isMultiProject: true,
        projectCount: data.projects.length,
        projects: data.projects,
        kasbonCount: Array.isArray(data.kasbonList) ? data.kasbonList.length : 0,
        raw: data,
      });
      setImportMode('replace_all');
    } else if (data.project && (data.project.workers || data.project.projectName)) {
      setImportPreview({
        isMultiProject: false,
        singleProject: data.project,
        raw: data.project,
      });
      setImportMode('single_target');
    } else if (data.workers || data.projectName || data.ownerDealAmount !== undefined) {
      setImportPreview({
        isMultiProject: false,
        singleProject: data,
        raw: data,
      });
      setImportMode('single_target');
    } else {
      setImportError('Format data tidak dikenali sebagai catatan proyek borongan.');
    }
  };

  // Execute Import
  const handleConfirmImport = () => {
    if (!importPreview) return;

    try {
      // 1. Save safety snapshot in case user wants to rollback
      try {
        localStorage.setItem('kalkulator_borongan_backup_sebelum_impor', JSON.stringify(store));
      } catch (e) {
        console.warn('Could not save safety rollback backup');
      }

      if (importPreview.isMultiProject) {
        // Sanitize multi-project
        const incomingProjects = importPreview.projects;
        const sanitizedProjects: ProjectData[] = [];
        
        for (let i = 1; i <= TOTAL_PROJECTS; i++) {
          const match = incomingProjects.find(
            (p: ProjectData) => p.projectNumber === i || p.id === `project-${i}`
          ) || incomingProjects[i - 1];

          if (match) {
            sanitizedProjects.push(sanitizeProjectData(match, `project-${i}`, i));
          } else {
            sanitizedProjects.push(createDefaultProject(`project-${i}`, i));
          }
        }

        const sanitizedKasbon = Array.isArray(importPreview.raw.kasbonList)
          ? importPreview.raw.kasbonList.map((k: any, i: number) => sanitizeKasbonRecord(k, i))
          : (store.kasbonList || []);

        const newStore: MultiProjectStore = {
          activeProjectId: importPreview.raw.activeProjectId || store.activeProjectId,
          projects: sanitizedProjects,
          kasbonList: sanitizedKasbon,
        };

        onApplyStore(newStore);
        setImportSuccess(true);
        setTimeout(() => {
          setImportSuccess(false);
          onClose();
        }, 1500);
      } else {
        // Single project import into chosen target slot
        const single = importPreview.singleProject || importPreview.raw;
        const targetNum = Number(targetProjectSlot.replace('project-', '')) || 1;
        const sanitized = sanitizeProjectData(single, targetProjectSlot, targetNum);

        onApplySingleProject(targetProjectSlot, sanitized);
        setImportSuccess(true);
        setTimeout(() => {
          setImportSuccess(false);
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      setImportError('Gagal menerapkan data: ' + err.message);
    }
  };

  // Quick summary stats for export
  const totalRegisteredWorkers = store.projects.reduce((sum, p) => sum + (p.workers || []).length, 0);
  const totalCastingsCount = store.projects.reduce((sum, p) => sum + (p.concreteCastings || []).length, 0);
  const totalTempWorkersCount = store.projects.reduce((sum, p) => sum + (p.temporaryWorkers || []).length, 0);
  const totalExpensesCount = store.projects.reduce((sum, p) => sum + (p.expenses || []).length, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Modal */}
        <div className="px-5 py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
              <Share2 className="w-5 h-5 text-amber-100" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg leading-tight">
                Pusat Ekspor & Berbagi Antar Partner
              </h3>
              <p className="text-[11px] text-amber-100/90 leading-none mt-0.5">
                Kirim catatan ke HP partner kerja atau impor data melalui link & file
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-amber-200 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher (Bagikan vs Impor) */}
        <div className="flex border-b border-stone-200 bg-stone-50 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'export'
                ? 'bg-white text-stone-900 shadow-xs border border-stone-200/80'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Send className="w-4 h-4 text-amber-600" />
            1. Bagikan ke Partner (Ekspor)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'import'
                ? 'bg-white text-stone-900 shadow-xs border border-stone-200/80'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <ArrowDownToLine className="w-4 h-4 text-emerald-600" />
            2. Impor Data dari Partner (Masukkan)
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto space-y-5">
          
          {importSuccess ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-lg font-black text-stone-900">
                Data Berhasil Diterapkan!
              </h4>
              <p className="text-xs text-stone-600 max-w-sm mx-auto">
                Seluruh catatan proyek, absensi gaji, dan pengeluaran dari partner telah sukses disinkronkan ke aplikasi Anda.
              </p>
            </div>
          ) : activeTab === 'export' ? (
            /* TAB EKSPOR */
            <div className="space-y-5">
              {/* Scope Selector */}
              <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-2">
                  Pilih Data yang Ingin Dibagikan:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setExportScope('all')}
                    className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 ${
                      exportScope === 'all'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-950 font-bold shadow-2xs'
                        : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    <Building2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-black">Semua 5 Proyek & Kasbon</div>
                      <div className="text-[10px] text-stone-500 font-normal mt-0.5">
                        Rekomendasi utama: Mengirim seluruh 5 proyek, absen, cor Jayamix & buku kasbon.
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExportScope('active')}
                    className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 ${
                      exportScope === 'active'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-950 font-bold shadow-2xs'
                        : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    <FileText className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-black">Hanya {activeProject.projectName}</div>
                      <div className="text-[10px] text-stone-500 font-normal mt-0.5">
                        Hanya catatan proyek aktif ini saja yang akan dikirim ke partner.
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Ringkasan Data yang Dikirim */}
              <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-3.5 text-xs text-amber-950">
                <span className="font-extrabold text-amber-900 block mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  Rincian Catatan yang Masuk ke dalam Link/File:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-[11px]">
                  <div className="bg-white/80 p-2 rounded-lg border border-amber-200/60">
                    <span className="text-stone-500 block text-[10px]">Cakupan:</span>
                    <strong>{exportScope === 'all' ? '5 Proyek Penuh' : activeProject.projectName}</strong>
                  </div>
                  <div className="bg-white/80 p-2 rounded-lg border border-amber-200/60">
                    <span className="text-stone-500 block text-[10px]">Karyawan:</span>
                    <strong>{exportScope === 'all' ? `${totalRegisteredWorkers} Orang` : `${activeProject.workers.length} Orang`}</strong>
                  </div>
                  <div className="bg-white/80 p-2 rounded-lg border border-amber-200/60">
                    <span className="text-stone-500 block text-[10px]">Pekerja Cor / Lepas:</span>
                    <strong>{exportScope === 'all' ? `${totalTempWorkersCount} Transaksi` : `${(activeProject.temporaryWorkers || []).length} Transaksi`}</strong>
                  </div>
                  <div className="bg-white/80 p-2 rounded-lg border border-amber-200/60">
                    <span className="text-stone-500 block text-[10px]">Cor Jayamix & Pompa:</span>
                    <strong>{exportScope === 'all' ? `${totalCastingsCount} Order` : `${(activeProject.concreteCastings || []).length} Order`}</strong>
                  </div>
                </div>
              </div>

              {/* METODE 1: Link Otomatis (Paling Mudah) */}
              <div className="p-4 bg-white rounded-2xl border-2 border-amber-400 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-stone-900 flex items-center gap-1.5 uppercase tracking-wide">
                    <Link className="w-4 h-4 text-amber-600" />
                    Metode 1: Link Langsung ke Partner (Rekomendasi)
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    Satu Klik Buka
                  </span>
                </div>
                <p className="text-xs text-stone-600">
                  Kirim link ini ke WhatsApp partner Anda. Begitu partner mengetuk link di HP mereka, aplikasi akan langsung mengenali data dan menawarkan impor otomatis!
                </p>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareLink}
                    className="flex-1 px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl text-stone-600 select-all font-mono truncate focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-3.5 py-2 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shrink-0 shadow-xs"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        Tersalin!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Salin Link
                      </>
                    )}
                  </button>
                </div>

                <div className="pt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition shadow-xs"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Kirim Langsung via WhatsApp
                  </button>
                </div>
              </div>

              {/* METODE 2 & 3: Alternatif Kode Teks atau File JSON */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Salin Kode Teks */}
                <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-extrabold text-stone-800 block mb-1 flex items-center gap-1.5">
                      <Copy className="w-3.5 h-3.5 text-stone-600" />
                      Metode 2: Salin Kode Teks
                    </span>
                    <p className="text-[11px] text-stone-500 mb-2">
                      Jika link terlalu panjang di aplikasi chat tertentu, salin kode data ini dan partner tinggal menempelkannya.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="w-full mt-2 py-2 px-3 bg-white hover:bg-stone-100 border border-stone-300 text-stone-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Kode Teks Tersalin!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Salin Kode Data ({compressedCode.length} Karakter)
                      </>
                    )}
                  </button>
                </div>

                {/* Unduh File JSON */}
                <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-extrabold text-stone-800 block mb-1 flex items-center gap-1.5">
                      <Download className="w-3.5 h-3.5 text-stone-600" />
                      Metode 3: Unduh File JSON
                    </span>
                    <p className="text-[11px] text-stone-500 mb-2">
                      Simpan file `.json` cadangan ke memori HP / laptop Anda dan kirim sebagai dokumen.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadJson}
                    className="w-full mt-2 py-2 px-3 bg-white hover:bg-stone-100 border border-stone-300 text-stone-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-stone-700" />
                    Unduh File Cadangan .JSON
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* TAB IMPOR */
            <div className="space-y-5">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 leading-relaxed">
                <strong>Cara Memasukkan Data dari Partner:</strong>
                <p className="text-[11px] text-blue-800 mt-0.5">
                  Tempelkan kode teks yang dikirim partner kerja Anda atau pilih file cadangan JSON yang diberikan. Data lama Anda akan otomatis dicadangkan sebagai pengaman sebelum diganti.
                </p>
              </div>

              {/* Opsi 1: Tempel Kode Teks */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-700 flex items-center justify-between">
                  <span>Tempelkan Kode Data dari Partner:</span>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const clipText = await navigator.clipboard.readText();
                        setImportTextCode(clipText);
                        handleParseTextCode(clipText);
                      } catch {
                        // ignore
                      }
                    }}
                    className="text-[11px] text-amber-700 hover:text-amber-800 font-bold"
                  >
                    + Tempel dari Clipboard
                  </button>
                </label>
                <textarea
                  rows={3}
                  value={importTextCode}
                  onChange={(e) => {
                    setImportTextCode(e.target.value);
                    handleParseTextCode(e.target.value);
                  }}
                  placeholder="Tempel kode teks acak yang Anda salin dari pesan WA partner di sini..."
                  className="w-full p-3 text-xs font-mono bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Opsi 2: Upload File JSON */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-stone-200" />
                <span className="text-[10px] font-bold uppercase text-stone-400">Atau Unggah File</span>
                <div className="flex-1 h-px bg-stone-200" />
              </div>

              <div>
                <label
                  htmlFor="import-modal-file"
                  className="w-full p-4 border-2 border-dashed border-stone-300 hover:border-amber-500 rounded-2xl bg-stone-50 hover:bg-amber-50/40 flex flex-col items-center justify-center cursor-pointer transition text-center"
                >
                  <Upload className="w-6 h-6 text-stone-400 mb-1" />
                  <span className="text-xs font-bold text-stone-800">
                    Klik untuk Pilih File Cadangan (.JSON)
                  </span>
                  <span className="text-[10px] text-stone-400 mt-0.5">
                    Mendukung backup 5 proyek maupun backup 1 proyek tunggal
                  </span>
                  <input
                    id="import-modal-file"
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Error Warning */}
              {importError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Gagal Membaca Data:</span>
                    <span>{importError}</span>
                  </div>
                </div>
              )}

              {/* Pratinjau Data yang Terdeteksi */}
              {importPreview && (
                <div className="p-4 bg-emerald-50/70 border border-emerald-300 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5 uppercase">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Pratinjau Data Ditemukan & Valid!
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                      {importPreview.isMultiProject ? '5 Proyek Lengkap' : '1 Proyek Tunggal'}
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-emerald-200 text-xs space-y-2">
                    {importPreview.isMultiProject ? (
                      <>
                        <div className="font-bold text-stone-800">
                          Daftar Proyek yang Dikirim Partner:
                        </div>
                        <ul className="divide-y divide-stone-100 text-[11px] text-stone-600">
                          {importPreview.projects.map((p: ProjectData, idx: number) => (
                            <li key={idx} className="py-1 flex items-center justify-between">
                              <span><strong>Proyek {p.projectNumber}:</strong> {p.projectName}</span>
                              <span className="text-stone-500 font-medium">
                                Deal: {formatRupiah(p.ownerDealAmount || 0)} • {p.workers?.length || 0} Karyawan
                              </span>
                            </li>
                          ))}
                        </ul>
                        {importPreview.kasbonCount > 0 && (
                          <div className="pt-2 border-t border-stone-100 text-[11px] text-amber-800 font-semibold">
                            Catatan Kasbon Pegawai: {importPreview.kasbonCount} Catatan
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="font-bold text-stone-900 text-sm">
                          {importPreview.singleProject.projectName || 'Proyek Tanpa Nama'}
                        </div>
                        <div className="text-[11px] text-stone-600 space-y-1">
                          <div>Owner: <strong>{importPreview.singleProject.ownerName || '-'}</strong></div>
                          <div>Nilai Deal: <strong>{formatRupiah(importPreview.singleProject.ownerDealAmount || 0)}</strong></div>
                          <div>Karyawan: <strong>{importPreview.singleProject.workers?.length || 0} Orang</strong></div>
                        </div>

                        {/* Pilih slot tujuan untuk single project */}
                        <div className="pt-2 border-t border-stone-100">
                          <label className="text-[11px] font-bold text-stone-700 block mb-1">
                            Masukkan ke Slot Proyek Mana di HP Anda?
                          </label>
                          <select
                            value={targetProjectSlot}
                            onChange={(e) => setTargetProjectSlot(e.target.value)}
                            className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-bold text-stone-800"
                          >
                            {store.projects.map((p) => (
                              <option key={p.id} value={p.id}>
                                Slot Proyek {p.projectNumber} (Saat ini: {p.projectName})
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Tombol Eksekusi Impor */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleConfirmImport}
                      className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                      Terapkan Data dari Partner Sekarang &rarr;
                    </button>
                    <p className="text-[10px] text-stone-500 text-center mt-1.5">
                      Catatan: Data lama Anda sebelum diimpor akan tersimpan otomatis sebagai cadangan pengaman.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Sinkronisasi instan via URL & offline
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 font-bold rounded-xl transition"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
