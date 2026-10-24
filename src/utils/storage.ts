import { MultiProjectStore, ProjectData, Worker, KasbonRecord, KasbonPayment, TemporaryWorkerPayment, ConcreteCastingRecord, CashTransferRecord } from '../types';

const STORAGE_KEY = 'kalkulator_borongan_proyek_v1';

export const TOTAL_PROJECTS = 5;
export const TOTAL_WORKERS_SLOTS = 50;

export const createBlankWorkers = (count: number = 0): Worker[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `worker-${i + 1}`,
    name: '',
    dailyWage: 0,
    role: '',
  }));
};

export const createDefaultProject = (
  id: string,
  projectNumber: number,
  projectName?: string
): ProjectData => {
  return {
    id,
    projectNumber,
    projectName: projectName || `Proyek ${projectNumber}`,
    ownerName: '',
    ownerPhone: '',
    ownerDealAmount: 0,
    ownerDealCash: 0,
    ownerDealBank: 0,
    ownerDealNotes: '',
    ownerTermins: [],
    workers: [],
    attendance: {},
    expenses: [],
    weeklyPayments: {},
    temporaryWorkers: [],
    concreteCastings: [],
    cashTransfers: [],
  };
};

export const getDefaultKasbonList = (): KasbonRecord[] => {
  return [];
};

export const getDefaultMultiProjectStore = (): MultiProjectStore => {
  const projects: ProjectData[] = [];
  for (let i = 1; i <= TOTAL_PROJECTS; i++) {
    projects.push(createDefaultProject(`project-${i}`, i));
  }
  return {
    activeProjectId: 'project-1',
    projects,
    kasbonList: getDefaultKasbonList(),
  };
};

export const sanitizeKasbonRecord = (raw: any, index: number): KasbonRecord => {
  const payments: KasbonPayment[] = Array.isArray(raw?.payments)
    ? raw.payments.map((p: any, pIdx: number) => ({
        id: String(p?.id || `kasbon-pay-${Date.now()}-${pIdx}`),
        date: String(p?.date || new Date().toISOString().split('T')[0]),
        amount: Math.max(0, Number(p?.amount) || 0),
        note: String(p?.note || ''),
        createdAt: String(p?.createdAt || new Date().toISOString()),
      }))
    : [];

  return {
    id: String(raw?.id || `kasbon-${Date.now()}-${index}`),
    workerName: String(raw?.workerName || '').trim(),
    workerRole: String(raw?.workerRole || '').trim(),
    workerPhone: String(raw?.workerPhone || '').trim(),
    projectName: raw?.projectName ? String(raw.projectName) : undefined,
    date: String(raw?.date || new Date().toISOString().split('T')[0]),
    initialAmount: Math.max(0, Number(raw?.initialAmount) || 0),
    reason: String(raw?.reason || '').trim(),
    notes: String(raw?.notes || '').trim(),
    payments,
    createdAt: String(raw?.createdAt || new Date().toISOString()),
  };
};

export const sanitizeTemporaryWorkerPayment = (raw: any, index: number): TemporaryWorkerPayment => {
  const wageType = ['harian', 'borongan', 'setengah_hari', 'lembur_cor'].includes(raw?.wageType)
    ? raw.wageType
    : 'harian';
  
  const headcount = Math.max(1, Number(raw?.headcount) || 1);
  const ratePerPerson = Math.max(0, Number(raw?.ratePerPerson) || 0);
  const calculatedTotal = headcount * ratePerPerson;
  const totalAmount = raw?.totalAmount !== undefined && raw?.totalAmount !== null && Number(raw?.totalAmount) >= 0
    ? Number(raw.totalAmount)
    : calculatedTotal;

  return {
    id: String(raw?.id || `temp-worker-${Date.now()}-${index}`),
    date: String(raw?.date || new Date().toISOString().split('T')[0]),
    workerName: String(raw?.workerName || '').trim(),
    taskDescription: String(raw?.taskDescription || 'Ngecor & Tenaga Lepas').trim(),
    wageType,
    headcount,
    ratePerPerson,
    totalAmount,
    isPaid: Boolean(raw?.isPaid ?? true), // default to paid since temp workers are usually cash on site
    paidAt: raw?.paidAt ? String(raw.paidAt) : undefined,
    paymentMethod: raw?.paymentMethod === 'transfer' ? 'transfer' : 'tunai',
    notes: raw?.notes ? String(raw.notes).trim() : undefined,
    createdAt: String(raw?.createdAt || new Date().toISOString()),
  };
};

export const sanitizeConcreteCastingRecord = (raw: any, index: number): ConcreteCastingRecord => {
  const concreteQuality = ['K-225', 'K-250', 'K-300', 'K-350', 'K-400', 'Lainnya'].includes(raw?.concreteQuality)
    ? raw.concreteQuality
    : 'K-250';
  const pumpType = ['standar', 'long_boom', 'mini_kodok', 'super_long_boom', 'tanpa_pompa'].includes(raw?.pumpType)
    ? raw.pumpType
    : 'standar';
  
  const volumeM3 = Math.max(0, Number(raw?.volumeM3) || 0);
  const pricePerM3 = Math.max(0, Number(raw?.pricePerM3) || 0);
  const totalConcreteCost = Number(raw?.totalConcreteCost) >= 0 ? Number(raw.totalConcreteCost) : (volumeM3 * pricePerM3);

  const pumpRentalCost = Math.max(0, Number(raw?.pumpRentalCost) || 0);
  const pumpExtraPipeCost = Math.max(0, Number(raw?.pumpExtraPipeCost) || 0);
  const operatorTips = Math.max(0, Number(raw?.operatorTips) || 0);
  const totalPumpCost = Number(raw?.totalPumpCost) >= 0 ? Number(raw.totalPumpCost) : (pumpRentalCost + pumpExtraPipeCost + operatorTips);

  const grandTotal = Number(raw?.grandTotal) >= 0 ? Number(raw.grandTotal) : (totalConcreteCost + totalPumpCost);

  return {
    id: String(raw?.id || `casting-${Date.now()}-${index}`),
    date: String(raw?.date || new Date().toISOString().split('T')[0]),
    castingSection: String(raw?.castingSection || 'Dak Lantai').trim(),
    vendorName: String(raw?.vendorName || 'Jayamix').trim(),
    concreteQuality,
    truckCount: Number(raw?.truckCount) > 0 ? Number(raw.truckCount) : undefined,
    volumeM3,
    pricePerM3,
    totalConcreteCost,
    pumpType,
    pumpRentalCost,
    pumpExtraPipeCost,
    operatorTips,
    totalPumpCost,
    grandTotal,
    isPaid: Boolean(raw?.isPaid ?? true),
    paymentMethod: raw?.paymentMethod === 'tunai' ? 'tunai' : 'transfer',
    paidAt: raw?.paidAt ? String(raw.paidAt) : undefined,
    deliveryOrderNo: raw?.deliveryOrderNo ? String(raw.deliveryOrderNo).trim() : undefined,
    notes: raw?.notes ? String(raw.notes).trim() : undefined,
    createdAt: String(raw?.createdAt || new Date().toISOString()),
  };
};

/**
 * Ensures a single project object has all required fields including 50 workers.
 */
export const sanitizeProjectData = (
  rawProj: Partial<ProjectData>,
  fallbackId: string,
  fallbackNum: number
): ProjectData => {
  const id = rawProj.id || fallbackId;
  const projectNumber = rawProj.projectNumber || fallbackNum;
  const projectName = rawProj.projectName || `Proyek ${projectNumber}`;

  // Only keep real workers who have a name (remove empty phantom slots)
  const workers: Worker[] = Array.isArray(rawProj.workers)
    ? rawProj.workers
        .filter((w: any) => w && typeof w.name === 'string' && w.name.trim().length > 0)
        .map((w: any, i: number) => ({
          id: String(w.id || `worker-${Date.now()}-${i}`),
          name: String(w.name).trim(),
          dailyWage: Math.max(0, Number(w.dailyWage) || 0),
          role: w.role ? String(w.role).trim() : '',
          phone: w.phone ? String(w.phone).trim() : undefined,
        }))
    : [];

  const temporaryWorkers = Array.isArray(rawProj.temporaryWorkers)
    ? rawProj.temporaryWorkers.map((t: any, i: number) => sanitizeTemporaryWorkerPayment(t, i))
    : [];

  const concreteCastings = Array.isArray(rawProj.concreteCastings)
    ? rawProj.concreteCastings.map((c: any, i: number) => sanitizeConcreteCastingRecord(c, i))
    : [];

  const cashTransfers: CashTransferRecord[] = Array.isArray(rawProj.cashTransfers)
    ? rawProj.cashTransfers.map((ct: any, idx: number) => ({
        id: String(ct?.id || `transfer-${Date.now()}-${idx}`),
        date: String(ct?.date || new Date().toISOString().split('T')[0]),
        type: ct?.type === 'setor_tunai' ? 'setor_tunai' : 'tarik_tunai',
        amount: Math.max(0, Number(ct?.amount) || 0),
        note: ct?.note ? String(ct.note).trim() : undefined,
        createdAt: String(ct?.createdAt || new Date().toISOString()),
      }))
    : [];

  return {
    id,
    projectNumber,
    projectName,
    ownerName: rawProj.ownerName || '',
    ownerPhone: rawProj.ownerPhone || '',
    ownerDealAmount: Number(rawProj.ownerDealAmount) || 0,
    ownerDealCash: Math.max(0, Number(rawProj.ownerDealCash) || 0),
    ownerDealBank: Math.max(0, Number(rawProj.ownerDealBank) || 0),
    ownerDealNotes: rawProj.ownerDealNotes || '',
    ownerTermins: Array.isArray(rawProj.ownerTermins) 
      ? rawProj.ownerTermins.map((t: any, idx: number) => ({
          id: String(t?.id || `termin-${Date.now()}-${idx}`),
          date: String(t?.date || new Date().toISOString().split('T')[0]),
          title: String(t?.title || 'Termin'),
          amount: Math.max(0, Number(t?.amount) || 0),
          paymentMethod: t?.paymentMethod === 'cash' ? 'cash' : 'transfer',
          note: t?.note ? String(t.note) : undefined,
        }))
      : [],
    workers,
    attendance: rawProj.attendance && typeof rawProj.attendance === 'object' ? rawProj.attendance : {},
    expenses: Array.isArray(rawProj.expenses)
      ? rawProj.expenses.map((e: any, idx: number) => ({
          id: String(e?.id || `exp-${Date.now()}-${idx}`),
          date: String(e?.date || new Date().toISOString().split('T')[0]),
          name: String(e?.name || '').trim(),
          category: ['konsumsi', 'operasional', 'material', 'lainnya'].includes(e?.category) ? e.category : 'konsumsi',
          amount: Math.max(0, Number(e?.amount) || 0),
          note: e?.note ? String(e.note).trim() : undefined,
          paymentMethod: e?.paymentMethod === 'transfer' ? 'transfer' : 'tunai',
        }))
      : [],
    weeklyPayments: rawProj.weeklyPayments && typeof rawProj.weeklyPayments === 'object'
      ? Object.fromEntries(
          Object.entries(rawProj.weeklyPayments).map(([dateKey, val]: [string, any]) => [
            dateKey,
            {
              saturdayDate: String(val?.saturdayDate || dateKey),
              paidAt: val?.paidAt ? String(val.paidAt) : undefined,
              isPaid: Boolean(val?.isPaid),
              totalPaid: Math.max(0, Number(val?.totalPaid) || 0),
              note: val?.note ? String(val.note).trim() : undefined,
              paymentMethod: val?.paymentMethod === 'transfer' ? 'transfer' : 'tunai',
            },
          ])
        )
      : {},
    temporaryWorkers,
    concreteCastings,
    cashTransfers,
  };
};

export const loadMultiProjectStore = (): MultiProjectStore => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return getDefaultMultiProjectStore();
    }

    const parsed = JSON.parse(raw);

    // Sanitize Kasbon List (filter out demo entries so user enters everything manually)
    let sanitizedKasbon: KasbonRecord[] = [];
    if (parsed && Array.isArray(parsed.kasbonList)) {
      sanitizedKasbon = parsed.kasbonList
        .filter((k: any) => k?.id !== 'kasbon-demo-1' && k?.id !== 'kasbon-demo-2')
        .map((k: any, i: number) => sanitizeKasbonRecord(k, i));
    } else {
      sanitizedKasbon = getDefaultKasbonList();
    }

    // Case 1: Already has multi-project structure
    if (parsed && Array.isArray(parsed.projects) && parsed.projects.length > 0) {
      const sanitizedProjects: ProjectData[] = [];
      for (let i = 1; i <= TOTAL_PROJECTS; i++) {
        const existing = parsed.projects.find(
          (p: ProjectData) => p.id === `project-${i}` || p.projectNumber === i
        ) || parsed.projects[i - 1];

        if (existing) {
          sanitizedProjects.push(sanitizeProjectData(existing, `project-${i}`, i));
        } else {
          sanitizedProjects.push(createDefaultProject(`project-${i}`, i));
        }
      }

      const activeId = parsed.activeProjectId && sanitizedProjects.some((p) => p.id === parsed.activeProjectId)
        ? parsed.activeProjectId
        : 'project-1';

      return {
        activeProjectId: activeId,
        projects: sanitizedProjects,
        kasbonList: sanitizedKasbon,
      };
    }

    // Case 2: Legacy single-project format (has .workers or .projectName)
    if (parsed && (Array.isArray(parsed.workers) || typeof parsed.projectName === 'string')) {
      const migratedProject1 = sanitizeProjectData(parsed, 'project-1', 1);
      const projects: ProjectData[] = [migratedProject1];
      for (let i = 2; i <= TOTAL_PROJECTS; i++) {
        projects.push(createDefaultProject(`project-${i}`, i));
      }
      return {
        activeProjectId: 'project-1',
        projects,
        kasbonList: sanitizedKasbon,
      };
    }

    return getDefaultMultiProjectStore();
  } catch (err) {
    console.error('Gagal memuat data multi-proyek dari storage:', err);
    return getDefaultMultiProjectStore();
  }
};

export const saveMultiProjectStore = (store: MultiProjectStore): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (err) {
    console.error('Gagal menyimpan data multi-proyek ke storage:', err);
  }
};

// Backward-compatibility helpers
export const getDefaultProjectData = (): ProjectData => {
  return createDefaultProject('project-1', 1, 'Proyek 1');
};

export const loadProjectData = (): ProjectData => {
  const store = loadMultiProjectStore();
  return store.projects[0] || getDefaultProjectData();
};

export const saveProjectData = (data: ProjectData): void => {
  const store = loadMultiProjectStore();
  const index = store.projects.findIndex((p) => p.id === data.id);
  if (index >= 0) {
    store.projects[index] = data;
  } else {
    store.projects[0] = data;
  }
  saveMultiProjectStore(store);
};
