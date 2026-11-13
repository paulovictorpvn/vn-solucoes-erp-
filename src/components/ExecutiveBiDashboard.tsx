import React, { useState, useMemo, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  Printer,
  Plus,
  Edit3,
  Trash2,
  Search,
  ArrowUpDown,
  ShieldCheck,
  GitCompare,
  LifeBuoy,
  HardDrive,
  AlertOctagon,
  Monitor,
  Building2,
  FileSpreadsheet,
  Upload,
  RotateCcw,
  CheckCircle2,
  X,
  Activity,
  BookOpen,
  FileText,
  Layers,
  AlertTriangle,
  BellRing,
  ClipboardList,
  UserCheck,
} from 'lucide-react';
import {
  ModuleKey,
  ClientRecord,
  ContractRecord,
  FinancialEntryRecord,
  PaymentBatchRecord,
  BankReconciliationRecord,
  FinancialClosingRecord,
  ServiceDeskTicketRecord,
  BackupExecutionLogRecord,
  SystemHealthMetrics,
} from '../types/erp.ts';

export type PeriodPreset =
  | 'HOJE'
  | '7_DIAS'
  | 'ESTE_MES'
  | '3_MESES'
  | 'ESTE_ANO'
  | 'PERSONALIZADO';

export type SpecializedReportType =
  | 'VISAO_GERAL'
  | 'DRE'
  | 'FLUXO_CAIXA'
  | 'FECHAMENTO'
  | 'CONCILIACAO'
  | 'PAGAR_RECEBER'
  | 'COBRANCAS'
  | 'PENDENCIAS_OBSERVACOES'
  | 'FICHA_FINANCEIRA'
  | 'PLANO_DE_CONTAS';

type SortField =
  | 'code'
  | 'dueDate'
  | 'clientName'
  | 'counterpartyName'
  | 'category'
  | 'createdByName'
  | 'status'
  | 'amount';

export interface ChartOfAccountItem {
  id: number;
  clientId: number | 'ALL';
  clientName: string;
  accountCode: string;
  accountName: string;
  nature: 'CREDORA' | 'DEVEDORA';
  accountType: 'SINTETICA' | 'ANALITICA';
  dreGroup:
    | '1. Receita Bruta Operacional'
    | '2. Deduções e Impostos s/ Vendas'
    | '3. Custos Operacionais Diretos (CMV/CSP)'
    | '4. Despesas Administrativas e Pessoal'
    | '5. Resultado Financeiro Líquido';
  linkedCategory: string;
  active: boolean;
}

export interface ClientPendencyObservation {
  id: number;
  code: string;
  clientId: number;
  clientName: string;
  type: 'PENDENCIA_DOCUMENTAL' | 'OBSERVACAO_CONTROLADORIA' | 'COBRANCA_RECEBIVEL';
  title: string;
  details: string;
  dueDate: string;
  severity: 'Alta' | 'Média' | 'Baixa';
  status: 'Pendente c/ Cliente' | 'Em Validação VN' | 'Resolvido';
  responsibleAnalyst: string;
  createdAt: string;
}

const INITIAL_CHART_OF_ACCOUNTS: ChartOfAccountItem[] = [
  {
    id: 1,
    clientId: 'ALL',
    clientName: 'Plano Padrão Multiempresa VN',
    accountCode: '1.01.01',
    accountName: 'Receita de Prestação de Serviços / Faturamento',
    nature: 'CREDORA',
    accountType: 'ANALITICA',
    dreGroup: '1. Receita Bruta Operacional',
    linkedCategory: 'Faturamento de Serviços',
    active: true,
  },
  {
    id: 2,
    clientId: 1,
    clientName: 'Atlas Engenharia',
    accountCode: '1.01.02',
    accountName: 'Receita de Medição de Obras Civis & Contratos',
    nature: 'CREDORA',
    accountType: 'ANALITICA',
    dreGroup: '1. Receita Bruta Operacional',
    linkedCategory: 'Medição de Obras',
    active: true,
  },
  {
    id: 3,
    clientId: 2,
    clientName: 'Clínica VidaPlena',
    accountCode: '1.01.03',
    accountName: 'Receita de Consultas, Exames & Repasses de Convênios',
    nature: 'CREDORA',
    accountType: 'ANALITICA',
    dreGroup: '1. Receita Bruta Operacional',
    linkedCategory: 'Repasse de Convênios',
    active: true,
  },
  {
    id: 4,
    clientId: 3,
    clientName: 'NorteSul Comércio',
    accountCode: '1.01.04',
    accountName: 'Vendas de Mercadorias Atacado & Adquirentes PIX/Cartão',
    nature: 'CREDORA',
    accountType: 'ANALITICA',
    dreGroup: '1. Receita Bruta Operacional',
    linkedCategory: 'Vendas Atacado',
    active: true,
  },
  {
    id: 5,
    clientId: 'ALL',
    clientName: 'Plano Padrão Multiempresa VN',
    accountCode: '2.01.01',
    accountName: 'Impostos Retidos e Tributos s/ Faturamento (ISS, PIS, COFINS, IRRF)',
    nature: 'DEVEDORA',
    accountType: 'ANALITICA',
    dreGroup: '2. Deduções e Impostos s/ Vendas',
    linkedCategory: 'Impostos e Tributos',
    active: true,
  },
  {
    id: 6,
    clientId: 1,
    clientName: 'Atlas Engenharia',
    accountCode: '3.01.01',
    accountName: 'Insumos de Obra, Concreto Usinado & Empreiteiros',
    nature: 'DEVEDORA',
    accountType: 'ANALITICA',
    dreGroup: '3. Custos Operacionais Diretos (CMV/CSP)',
    linkedCategory: 'Insumos de Obra',
    active: true,
  },
  {
    id: 7,
    clientId: 2,
    clientName: 'Clínica VidaPlena',
    accountCode: '3.01.02',
    accountName: 'Insumos Hospitalares, Laboratoriais & Reagentes',
    nature: 'DEVEDORA',
    accountType: 'ANALITICA',
    dreGroup: '3. Custos Operacionais Diretos (CMV/CSP)',
    linkedCategory: 'Insumos Médicos',
    active: true,
  },
  {
    id: 8,
    clientId: 3,
    clientName: 'NorteSul Comércio',
    accountCode: '3.01.03',
    accountName: 'Fretes Rodoviários, Logística & Armazenagem CD',
    nature: 'DEVEDORA',
    accountType: 'ANALITICA',
    dreGroup: '3. Custos Operacionais Diretos (CMV/CSP)',
    linkedCategory: 'Logística e Fretes',
    active: true,
  },
  {
    id: 9,
    clientId: 'ALL',
    clientName: 'Plano Padrão Multiempresa VN',
    accountCode: '4.01.01',
    accountName: 'Folha de Pagamento, Pró-Labore, Férias & Encargos (FGTS/INSS)',
    nature: 'DEVEDORA',
    accountType: 'ANALITICA',
    dreGroup: '4. Despesas Administrativas e Pessoal',
    linkedCategory: 'Folha e Encargos',
    active: true,
  },
  {
    id: 10,
    clientId: 'ALL',
    clientName: 'Plano Padrão Multiempresa VN',
    accountCode: '4.02.01',
    accountName: 'Infraestrutura Cloud, Licenças ERP & Serviços BPO',
    nature: 'DEVEDORA',
    accountType: 'ANALITICA',
    dreGroup: '4. Despesas Administrativas e Pessoal',
    linkedCategory: 'Tecnologia & Cloud',
    active: true,
  },
  {
    id: 11,
    clientId: 'ALL',
    clientName: 'Plano Padrão Multiempresa VN',
    accountCode: '5.01.01',
    accountName: 'Tarifas Bancárias, IOF, Juros & Descontos Financeiros',
    nature: 'DEVEDORA',
    accountType: 'ANALITICA',
    dreGroup: '5. Resultado Financeiro Líquido',
    linkedCategory: 'Despesas Bancárias',
    active: true,
  },
];

const INITIAL_CLIENT_PENDENCIES: ClientPendencyObservation[] = [
  {
    id: 1,
    code: 'PND-2026-01',
    clientId: 1,
    clientName: 'Atlas Engenharia',
    type: 'PENDENCIA_DOCUMENTAL',
    title: 'Envio de Nota Fiscal complementar referente à diferença de R$ 250,00 (LAN-8041)',
    details:
      'Boleto Itaú liquidado em R$ 18.750,00 enquanto NF-4410 original foi emitida por R$ 18.500,00. Necessário anexo da NF complementar ou recibo de frete acessório.',
    dueDate: '2026-11-15',
    severity: 'Alta',
    status: 'Pendente c/ Cliente',
    responsibleAnalyst: 'Mariana Costa (Sênior BPO)',
    createdAt: '2026-11-12',
  },
  {
    id: 2,
    code: 'PND-2026-02',
    clientId: 1,
    clientName: 'Atlas Engenharia',
    type: 'OBSERVACAO_CONTROLADORIA',
    title: 'Retenção obrigatória de 4,65% PCC conferida nos lotes da quinzena',
    details:
      'Conforme particularidade contratual da Atlas Engenharia, todos os títulos de serviços acima de R$ 5.000,00 tiveram retenção de PIS/COFINS/CSLL validada antes da remessa CNAB.',
    dueDate: '2026-11-20',
    severity: 'Média',
    status: 'Resolvido',
    responsibleAnalyst: 'Mariana Costa (Sênior BPO)',
    createdAt: '2026-11-10',
  },
  {
    id: 3,
    code: 'PND-2026-03',
    clientId: 2,
    clientName: 'Clínica VidaPlena',
    type: 'PENDENCIA_DOCUMENTAL',
    title: 'Borderô de glosas médicas do convênio Bradesco Saúde (Competência 11/2026)',
    details:
      'Solicitamos o envio do relatório analítico do portal TISS para conciliação dos recebíveis hospitalares previstos para 15/11/2026.',
    dueDate: '2026-11-16',
    severity: 'Alta',
    status: 'Em Validação VN',
    responsibleAnalyst: 'Rafael Mendes (Pleno BPO)',
    createdAt: '2026-11-11',
  },
  {
    id: 4,
    code: 'PND-2026-04',
    clientId: 3,
    clientName: 'NorteSul Comércio',
    type: 'COBRANCA_RECEBIVEL',
    title: 'Acompanhamento de Liquidação de Boletos Atacado — Rede Supermercados Sul',
    details:
      'Fatura FAT-2026-108 (R$ 36.500,00) com régua preventiva de cobrança D-2 disparada pela controladoria VN.',
    dueDate: '2026-11-14',
    severity: 'Média',
    status: 'Pendente c/ Cliente',
    responsibleAnalyst: 'Mariana Costa (Sênior BPO)',
    createdAt: '2026-11-12',
  },
];

interface ExecutiveBiDashboardProps {
  clients: ClientRecord[];
  selectedClientId: number | 'ALL';
  onSelectClientId: (id: number | 'ALL') => void;
  contracts?: ContractRecord[];
  financialEntries: FinancialEntryRecord[];
  paymentBatches: PaymentBatchRecord[];
  reconciliations: BankReconciliationRecord[];
  financialClosings?: FinancialClosingRecord[];
  serviceDeskTickets: ServiceDeskTicketRecord[];
  backupLogs: BackupExecutionLogRecord[];
  systemHealth: SystemHealthMetrics | null;
  onNavigateModule: (module: ModuleKey) => void;
  onCreateEntry: (entryData: {
    clientId: number;
    type: 'PAGAR' | 'RECEBER';
    counterpartyName: string;
    counterpartyDoc: string;
    category: string;
    costCenter: string;
    description: string;
    amount: string;
    dueDate: string;
    documentNumber: string;
  }) => Promise<void>;
  onEditEntry: (
    entryId: number,
    updatedData: {
      type: 'PAGAR' | 'RECEBER';
      counterpartyName: string;
      amount: string;
      dueDate: string;
      category: string;
      costCenter: string;
      documentNumber: string;
      description: string;
      status: string;
      adjustmentReason: string;
    }
  ) => Promise<void>;
  onDeleteEntry: (entryId: number, reason: string) => Promise<void>;
  onApproveBatch: (batchId: number) => Promise<void>;
  onFeedback: (type: 'success' | 'error' | 'warning', title: string, message: string) => void;
}

const CHART_PALETTE = ['#0052CC', '#0D9488', '#D97706', '#4F46E5', '#DC2626', '#475569'];

function formatBrl(val: string | number | undefined | null): string {
  const num = Number(val ?? 0);
  if (isNaN(num)) return 'R$ 0,00';
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDateBr(isoDate: string | undefined | null): string {
  if (!isoDate) return '—';
  const parts = String(isoDate).split('-');
  if (parts.length !== 3) return String(isoDate);
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export const ExecutiveBiDashboard: React.FC<ExecutiveBiDashboardProps> = ({
  clients,
  selectedClientId,
  onSelectClientId,
  contracts = [],
  financialEntries,
  paymentBatches,
  reconciliations,
  financialClosings = [],
  serviceDeskTickets,
  backupLogs,
  systemHealth,
  onNavigateModule,
  onCreateEntry,
  onEditEntry,
  onDeleteEntry,
  onFeedback,
}) => {
  // Active Specialized Report / View inside #overview
  const [activeReportType, setActiveReportType] = useState<SpecializedReportType>('VISAO_GERAL');

  // Global Date Filtering Control Bar State (anchored at 2026-11-13)
  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>('3_MESES');
  const [customStartDate, setCustomStartDate] = useState('2026-09-01');
  const [customEndDate, setCustomEndDate] = useState('2026-11-30');
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
  const [categoryFilter, setCategoryFilter] = useState<string>('TODAS');
  const [typeFilter, setTypeFilter] = useState<'TODOS' | 'PAGAR' | 'RECEBER'>('TODOS');
  const [responsibleFilter, setResponsibleFilter] = useState<string>('TODOS');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Co-Branding & Report Header State
  const [reportTitle, setReportTitle] = useState(
    'Relatório Executivo de Controladoria, DRE, Fluxo de Caixa & Ficha Financeira'
  );
  const [reportIssueDate, setReportIssueDate] = useState('2026-11-13');
  const [clientCustomLogoMap, setClientCustomLogoMap] = useState<Record<number, string>>({});

  // Chart of Accounts State (Plano de Contas por Empresa Cliente)
  const [chartOfAccounts, setChartOfAccounts] = useState<ChartOfAccountItem[]>(() => {
    try {
      const saved = localStorage.getItem('vn_erp_chart_of_accounts_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore storage errors
    }
    return INITIAL_CHART_OF_ACCOUNTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('vn_erp_chart_of_accounts_v1', JSON.stringify(chartOfAccounts));
    } catch {
      // ignore storage errors
    }
  }, [chartOfAccounts]);

  // New / Edit Chart of Account Form State
  const [coaClientId, setCoaClientId] = useState<number | 'ALL'>(selectedClientId);
  const [coaCode, setCoaCode] = useState('3.02.01');
  const [coaName, setCoaName] = useState('');
  const [coaNature, setCoaNature] = useState<'CREDORA' | 'DEVEDORA'>('DEVEDORA');
  const [coaType, setCoaType] = useState<'SINTETICA' | 'ANALITICA'>('ANALITICA');
  const [coaDreGroup, setCoaDreGroup] = useState<ChartOfAccountItem['dreGroup']>(
    '3. Custos Operacionais Diretos (CMV/CSP)'
  );
  const [coaLinkedCategory, setCoaLinkedCategory] = useState('');
  const [editingCoaId, setEditingCoaId] = useState<number | null>(null);

  // Client Pendencies & Observations State
  const [clientPendencies, setClientPendencies] = useState<ClientPendencyObservation[]>(() => {
    try {
      const saved = localStorage.getItem('vn_erp_client_pendencies_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore storage errors
    }
    return INITIAL_CLIENT_PENDENCIES;
  });

  useEffect(() => {
    try {
      localStorage.setItem('vn_erp_client_pendencies_v1', JSON.stringify(clientPendencies));
    } catch {
      // ignore storage errors
    }
  }, [clientPendencies]);

  const [newPendencyClientId, setNewPendencyClientId] = useState<number>(
    selectedClientId === 'ALL' ? clients[0]?.id || 1 : selectedClientId
  );
  const [newPendencyType, setNewPendencyType] =
    useState<ClientPendencyObservation['type']>('PENDENCIA_DOCUMENTAL');
  const [newPendencyTitle, setNewPendencyTitle] = useState('');
  const [newPendencyDetails, setNewPendencyDetails] = useState('');
  const [newPendencyDueDate, setNewPendencyDueDate] = useState('2026-11-20');
  const [newPendencySeverity, setNewPendencySeverity] =
    useState<ClientPendencyObservation['severity']>('Alta');

  // Analytical Table Sorting State
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Create / Edit / Delete Financial Entry Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newType, setNewType] = useState<'PAGAR' | 'RECEBER'>('PAGAR');
  const [newClientId, setNewClientId] = useState<number>(
    selectedClientId === 'ALL' ? clients[0]?.id || 1 : selectedClientId
  );
  const [newCounterparty, setNewCounterparty] = useState('');
  const [newDocCnpj, setNewDocCnpj] = useState('18.420.110/0001-99');
  const [newCategory, setNewCategory] = useState('Insumos de Obra');
  const [newCostCenter, setNewCostCenter] = useState('Operações & Controladoria');
  const [newDescription, setNewDescription] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDueDate, setNewDueDate] = useState('2026-11-20');
  const [newDocNumber, setNewDocNumber] = useState('NF-99401');
  const [submittingCrud, setSubmittingCrud] = useState(false);

  const [editingEntry, setEditingEntry] = useState<FinancialEntryRecord | null>(null);
  const [editType, setEditType] = useState<'PAGAR' | 'RECEBER'>('PAGAR');
  const [editCounterparty, setEditCounterparty] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editCostCenter, setEditCostCenter] = useState('');
  const [editDocNumber, setEditDocNumber] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editReason, setEditReason] = useState(
    'Ajuste contábil/documental revisado pela controladoria VN.'
  );

  const [deletingTarget, setDeletingTarget] = useState<FinancialEntryRecord | null>(null);
  const [deleteReason, setDeleteReason] = useState(
    'Exclusão autorizada após revisão de duplicidade/cancelamento.'
  );

  const activeClientObj = useMemo(() => {
    if (selectedClientId === 'ALL') return null;
    return clients.find((c) => c.id === selectedClientId) || null;
  }, [clients, selectedClientId]);

  const reportClientForBranding = useMemo(() => {
    if (activeClientObj) return activeClientObj;
    return clients[0] || null;
  }, [activeClientObj, clients]);

  // Effective Date Range computed from Global Date Filtering Control Bar
  const effectiveDateRange = useMemo(() => {
    switch (periodPreset) {
      case 'HOJE':
        return { start: '2026-11-13', end: '2026-11-13', label: 'Hoje / Today (13/11/2026)' };
      case '7_DIAS':
        return {
          start: '2026-11-07',
          end: '2026-11-16',
          label: 'Últimos 7 Dias / Last 7 Days (07/11 a 16/11)',
        };
      case 'ESTE_MES':
        return {
          start: '2026-11-01',
          end: '2026-11-30',
          label: 'Este Mês / This Month (Novembro/2026)',
        };
      case '3_MESES':
        return {
          start: '2026-09-01',
          end: '2026-11-30',
          label: 'Últimos 3 Meses / Last 3 Months (Set–Nov/2026)',
        };
      case 'ESTE_ANO':
        return {
          start: '2026-01-01',
          end: '2026-12-31',
          label: 'Este Ano / This Year (2026)',
        };
      case 'PERSONALIZADO':
      default:
        return {
          start: customStartDate || '2026-01-01',
          end: customEndDate || '2026-12-31',
          label: `Personalizado / Custom (${formatDateBr(customStartDate)} a ${formatDateBr(customEndDate)})`,
        };
    }
  }, [periodPreset, customStartDate, customEndDate]);

  // Global Date Filter onChange handler
  const handleDateFilterChange = (
    preset: PeriodPreset,
    nextStart?: string,
    nextEnd?: string
  ) => {
    setPeriodPreset(preset);
    if (preset === 'HOJE') {
      setCustomStartDate('2026-11-13');
      setCustomEndDate('2026-11-13');
    } else if (preset === '7_DIAS') {
      setCustomStartDate('2026-11-07');
      setCustomEndDate('2026-11-16');
    } else if (preset === 'ESTE_MES') {
      setCustomStartDate('2026-11-01');
      setCustomEndDate('2026-11-30');
    } else if (preset === '3_MESES') {
      setCustomStartDate('2026-09-01');
      setCustomEndDate('2026-11-30');
    } else if (preset === 'ESTE_ANO') {
      setCustomStartDate('2026-01-01');
      setCustomEndDate('2026-12-31');
    } else if (preset === 'PERSONALIZADO') {
      if (nextStart !== undefined) setCustomStartDate(nextStart);
      if (nextEnd !== undefined) setCustomEndDate(nextEnd);
    }
  };

  const handleResetFilters = () => {
    handleDateFilterChange('3_MESES');
    setStatusFilter('TODOS');
    setCategoryFilter('TODAS');
    setTypeFilter('TODOS');
    setResponsibleFilter('TODOS');
    setSearchQuery('');
  };

  // Distinct Categories & Responsibles
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    financialEntries.forEach((e) => {
      if (e.category) set.add(e.category);
    });
    chartOfAccounts.forEach((c) => {
      if (c.linkedCategory) set.add(c.linkedCategory);
    });
    return Array.from(set);
  }, [financialEntries, chartOfAccounts]);

  const availableResponsibles = useMemo(() => {
    const set = new Set<string>();
    financialEntries.forEach((e) => {
      if (e.createdByName) set.add(e.createdByName);
    });
    clients.forEach((c) => {
      if (c.responsibleAnalyst) set.add(c.responsibleAnalyst);
    });
    return Array.from(set);
  }, [financialEntries, clients]);

  // Filtered Financial Entries (reacts dynamically to the Global Date Filtering Control Bar)
  const filteredEntries = useMemo(() => {
    return financialEntries.filter((entry) => {
      if (selectedClientId !== 'ALL' && entry.clientId !== selectedClientId) return false;
      if (entry.dueDate < effectiveDateRange.start || entry.dueDate > effectiveDateRange.end) {
        return false;
      }
      if (statusFilter !== 'TODOS' && entry.status !== statusFilter) return false;
      if (categoryFilter !== 'TODAS' && entry.category !== categoryFilter) return false;
      if (typeFilter !== 'TODOS' && entry.type !== typeFilter) return false;
      if (responsibleFilter !== 'TODOS' && entry.createdByName !== responsibleFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          entry.code.toLowerCase().includes(q) ||
          entry.counterpartyName.toLowerCase().includes(q) ||
          entry.clientName.toLowerCase().includes(q) ||
          entry.category.toLowerCase().includes(q) ||
          entry.documentNumber.toLowerCase().includes(q) ||
          entry.description.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [
    financialEntries,
    selectedClientId,
    effectiveDateRange,
    statusFilter,
    categoryFilter,
    typeFilter,
    responsibleFilter,
    searchQuery,
  ]);

  // Sorted Entries
  const sortedEntries = useMemo(() => {
    const copy = [...filteredEntries];
    copy.sort((a, b) => {
      let comp = 0;
      if (sortField === 'amount') {
        comp = Number(a.amount || 0) - Number(b.amount || 0);
      } else {
        const valA = String(a[sortField] || '').toLowerCase();
        const valB = String(b[sortField] || '').toLowerCase();
        comp = valA.localeCompare(valB, 'pt-BR');
      }
      return sortDirection === 'asc' ? comp : -comp;
    });
    return copy;
  }, [filteredEntries, sortField, sortDirection]);

  const handleToggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Filtered Clients
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      if (selectedClientId !== 'ALL' && c.id !== selectedClientId) return false;
      if (
        responsibleFilter !== 'TODOS' &&
        !c.responsibleAnalyst.toLowerCase().includes(responsibleFilter.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [clients, selectedClientId, responsibleFilter]);

  // Scoped Tickets, Reconciliations, Closings, Pendencies & Chart of Accounts
  const scopedTickets = useMemo(() => {
    return serviceDeskTickets.filter(
      (t) => selectedClientId === 'ALL' || !t.clientId || t.clientId === selectedClientId
    );
  }, [serviceDeskTickets, selectedClientId]);

  const scopedReconciliations = useMemo(() => {
    return reconciliations.filter(
      (r) =>
        (selectedClientId === 'ALL' || r.clientId === selectedClientId) &&
        r.statementDate >= effectiveDateRange.start &&
        r.statementDate <= effectiveDateRange.end
    );
  }, [reconciliations, selectedClientId, effectiveDateRange]);

  const scopedClosings = useMemo(() => {
    return financialClosings.filter(
      (f) => selectedClientId === 'ALL' || f.clientId === selectedClientId
    );
  }, [financialClosings, selectedClientId]);

  const scopedChartOfAccounts = useMemo(() => {
    return chartOfAccounts.filter(
      (acc) =>
        selectedClientId === 'ALL' ||
        acc.clientId === 'ALL' ||
        acc.clientId === selectedClientId
    );
  }, [chartOfAccounts, selectedClientId]);

  const scopedPendencies = useMemo(() => {
    return clientPendencies.filter(
      (p) => selectedClientId === 'ALL' || p.clientId === selectedClientId
    );
  }, [clientPendencies, selectedClientId]);

  // Dynamic KPI Calculations (Top-Level 4 Executive KPIs + DRE & Cash Flow Metrics)
  const kpiMetrics = useMemo(() => {
    const totalReceivables = filteredEntries
      .filter((e) => e.type === 'RECEBER')
      .reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

    const totalPayables = filteredEntries
      .filter((e) => e.type === 'PAGAR')
      .reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

    const netCashResult = totalReceivables - totalPayables;
    const cashMarginPct =
      totalReceivables > 0 ? Math.round((netCashResult / totalReceivables) * 1000) / 10 : 0;

    const totalBpoMrr = filteredClients.reduce((acc, c) => acc + (Number(c.monthlyFee) || 0), 0);
    const totalBpoCost = filteredClients.reduce(
      (acc, c) => acc + (Number(c.operationalCost) || 0),
      0
    );
    const bpoMarginPct =
      totalBpoMrr > 0 ? Math.round(((totalBpoMrr - totalBpoCost) / totalBpoMrr) * 1000) / 10 : 0;

    const activeTicketsCount = scopedTickets.filter((t) => t.status !== 'Encerrado').length;
    const criticalTicketsCount = scopedTickets.filter(
      (t) => t.status !== 'Encerrado' && (t.severity.startsWith('S1') || t.severity.startsWith('S2'))
    ).length;

    const reconciledCount = filteredEntries.filter(
      (e) => e.status === 'Conciliado' || e.reconciled
    ).length;
    const reconciliationRate =
      filteredEntries.length > 0
        ? Math.round((reconciledCount / filteredEntries.length) * 100)
        : 100;

    return {
      totalReceivables,
      totalPayables,
      netCashResult,
      cashMarginPct,
      totalBpoMrr,
      totalBpoCost,
      bpoMarginPct,
      activeTicketsCount,
      criticalTicketsCount,
      reconciliationRate,
      entriesCount: filteredEntries.length,
    };
  }, [filteredEntries, filteredClients, scopedTickets]);

  // DRE Structured Calculation Linked to Chart of Accounts
  const dreStatement = useMemo(() => {
    const grossRevenue = filteredEntries
      .filter((e) => e.type === 'RECEBER')
      .reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

    const taxDeductions = filteredEntries
      .filter(
        (e) =>
          e.type === 'PAGAR' &&
          (e.category.toLowerCase().includes('imposto') ||
            e.category.toLowerCase().includes('tribut'))
      )
      .reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

    const effectiveTaxDeductions =
      taxDeductions > 0 ? taxDeductions : Math.round(grossRevenue * 0.0865 * 100) / 100;

    const netRevenue = grossRevenue - effectiveTaxDeductions;

    const directCosts = filteredEntries
      .filter(
        (e) =>
          e.type === 'PAGAR' &&
          (e.category.toLowerCase().includes('insumo') ||
            e.category.toLowerCase().includes('fornecedor') ||
            e.category.toLowerCase().includes('logística') ||
            e.category.toLowerCase().includes('frete'))
      )
      .reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

    const grossProfit = netRevenue - directCosts;

    const adminAndPayrollExpenses = filteredEntries
      .filter(
        (e) =>
          e.type === 'PAGAR' &&
          !e.category.toLowerCase().includes('imposto') &&
          !e.category.toLowerCase().includes('tribut') &&
          !e.category.toLowerCase().includes('insumo') &&
          !e.category.toLowerCase().includes('fornecedor') &&
          !e.category.toLowerCase().includes('logística') &&
          !e.category.toLowerCase().includes('frete')
      )
      .reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

    const netOperatingResult = grossProfit - adminAndPayrollExpenses;
    const av = (val: number) =>
      grossRevenue > 0 ? `${((val / grossRevenue) * 100).toFixed(1)}%` : '0.0%';

    return {
      grossRevenue,
      effectiveTaxDeductions,
      netRevenue,
      directCosts,
      grossProfit,
      adminAndPayrollExpenses,
      netOperatingResult,
      av,
    };
  }, [filteredEntries]);

  // Chart 1 & Cash Flow Statement: Temporal Evolution with Accumulated Balance
  const temporalChartData = useMemo(() => {
    const map = new Map<
      string,
      {
        dateKey: string;
        label: string;
        receitas: number;
        despesas: number;
        saldo: number;
        acumulado: number;
      }
    >();

    const chronological = [...filteredEntries].sort((a, b) =>
      a.dueDate.localeCompare(b.dueDate)
    );

    let runningBalance = 0;
    chronological.forEach((entry) => {
      const key = entry.dueDate;
      const existing = map.get(key) || {
        dateKey: key,
        label: formatDateBr(key).slice(0, 5),
        receitas: 0,
        despesas: 0,
        saldo: 0,
        acumulado: 0,
      };
      const val = Number(entry.amount) || 0;
      if (entry.type === 'RECEBER') {
        existing.receitas += val;
      } else {
        existing.despesas += val;
      }
      existing.saldo = existing.receitas - existing.despesas;
      map.set(key, existing);
    });

    const result = Array.from(map.values());
    result.forEach((row) => {
      runningBalance += row.saldo;
      row.acumulado = runningBalance;
    });

    return result;
  }, [filteredEntries]);

  // Chart 2: Client Profitability BarChart Data
  const clientProfitabilityData = useMemo(() => {
    return filteredClients.map((c) => {
      const fee = Number(c.monthlyFee) || 0;
      const cost = Number(c.operationalCost) || 0;
      const profit = Math.max(0, fee - cost);
      const marginPct = fee > 0 ? Math.round(((fee - cost) / fee) * 100) : 0;
      return {
        name: c.tradeName,
        code: c.code,
        honorario: fee,
        custo: cost,
        lucro: profit,
        margemPct: marginPct,
      };
    });
  }, [filteredClients]);

  // Chart 3: Category Distribution (Donut Chart)
  const categoryCompositionData = useMemo(() => {
    const map = new Map<string, number>();
    filteredEntries.forEach((e) => {
      const cat = e.category || 'Outros';
      map.set(cat, (map.get(cat) || 0) + (Number(e.amount) || 0));
    });
    const total = Array.from(map.values()).reduce((a, b) => a + b, 0);
    return Array.from(map.entries())
      .map(([name, value]) => ({
        name,
        value,
        pct: total > 0 ? Math.round((value / total) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredEntries]);

  // Real-time Service Desk Status Breakdown
  const ticketStatusStats = useMemo(() => {
    const total = scopedTickets.length || 1;
    const statuses = ['Aberto', 'Em análise', 'Resolvido', 'Encerrado'];
    return statuses.map((st) => {
      const count = scopedTickets.filter((t) => t.status === st).length;
      return {
        status: st,
        count,
        pct: Math.round((count / total) * 100),
      };
    });
  }, [scopedTickets]);

  // Client Logo Upload Handler
  const handleUploadClientLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !reportClientForBranding) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      setClientCustomLogoMap((prev) => ({
        ...prev,
        [reportClientForBranding.id]: dataUrl,
      }));
      onFeedback(
        'success',
        `Logo de ${reportClientForBranding.tradeName} Carregada`,
        'A logo da empresa cliente foi vinculada ao cabeçalho oficial de relatórios e impressão.'
      );
    };
    reader.readAsDataURL(file);
  };

  // Save or Update Chart of Account Item
  const handleSaveChartOfAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coaName.trim() || !coaCode.trim()) return;
    const targetClientName =
      coaClientId === 'ALL'
        ? 'Plano Padrão Multiempresa VN'
        : clients.find((c) => c.id === Number(coaClientId))?.tradeName || 'Cliente BPO';

    if (editingCoaId !== null) {
      setChartOfAccounts((prev) =>
        prev.map((item) =>
          item.id === editingCoaId
            ? {
                ...item,
                clientId: coaClientId === 'ALL' ? 'ALL' : Number(coaClientId),
                clientName: targetClientName,
                accountCode: coaCode.trim(),
                accountName: coaName.trim(),
                nature: coaNature,
                accountType: coaType,
                dreGroup: coaDreGroup,
                linkedCategory: coaLinkedCategory.trim() || coaName.trim(),
              }
            : item
        )
      );
      setEditingCoaId(null);
      onFeedback(
        'success',
        `Conta Contábil ${coaCode} Atualizada`,
        `Conta vinculada a "${targetClientName}" no grupo ${coaDreGroup}.`
      );
    } else {
      const nextId = chartOfAccounts.reduce((max, x) => Math.max(max, x.id), 0) + 1;
      const newAccount: ChartOfAccountItem = {
        id: nextId,
        clientId: coaClientId === 'ALL' ? 'ALL' : Number(coaClientId),
        clientName: targetClientName,
        accountCode: coaCode.trim(),
        accountName: coaName.trim(),
        nature: coaNature,
        accountType: coaType,
        dreGroup: coaDreGroup,
        linkedCategory: coaLinkedCategory.trim() || coaName.trim(),
        active: true,
      };
      setChartOfAccounts((prev) => [...prev, newAccount]);
      onFeedback(
        'success',
        `Conta ${newAccount.accountCode} Cadastrada no Plano de Contas`,
        `${newAccount.accountName} adicionada para ${targetClientName}.`
      );
    }
    setCoaName('');
    setCoaLinkedCategory('');
  };

  const handleEditCoaItem = (item: ChartOfAccountItem) => {
    setEditingCoaId(item.id);
    setCoaClientId(item.clientId);
    setCoaCode(item.accountCode);
    setCoaName(item.accountName);
    setCoaNature(item.nature);
    setCoaType(item.accountType);
    setCoaDreGroup(item.dreGroup);
    setCoaLinkedCategory(item.linkedCategory);
  };

  const handleDeleteCoaItem = (id: number) => {
    const target = chartOfAccounts.find((c) => c.id === id);
    setChartOfAccounts((prev) => prev.filter((c) => c.id !== id));
    if (target) {
      onFeedback(
        'success',
        `Conta ${target.accountCode} Excluída do Plano de Contas`,
        `A conta "${target.accountName}" foi removida.`
      );
    }
  };

  // Add / Update / Delete Client Pendency or Observation
  const handleAddClientPendency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPendencyTitle.trim()) return;
    const cl = clients.find((c) => c.id === Number(newPendencyClientId)) || clients[0];
    const nextId = clientPendencies.reduce((max, x) => Math.max(max, x.id), 0) + 1;
    const created: ClientPendencyObservation = {
      id: nextId,
      code: `PND-2026-0${nextId}`,
      clientId: cl?.id || 1,
      clientName: cl?.tradeName || 'Empresa Cliente',
      type: newPendencyType,
      title: newPendencyTitle.trim(),
      details:
        newPendencyDetails.trim() ||
        'Registrado pela Controladoria VN para acompanhamento junto ao cliente.',
      dueDate: newPendencyDueDate,
      severity: newPendencySeverity,
      status: 'Pendente c/ Cliente',
      responsibleAnalyst: cl?.responsibleAnalyst || 'Controladoria VN',
      createdAt: '2026-11-13',
    };
    setClientPendencies((prev) => [created, ...prev]);
    setNewPendencyTitle('');
    setNewPendencyDetails('');
    onFeedback(
      'success',
      `Pendência / Observação ${created.code} Registrada`,
      `Vinculada à Ficha Financeira e ao Portal da Empresa Cliente (${created.clientName}).`
    );
  };

  const handleTogglePendencyStatus = (id: number) => {
    setClientPendencies((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status: p.status === 'Resolvido' ? 'Pendente c/ Cliente' : 'Resolvido',
            }
          : p
      )
    );
  };

  const handleDeletePendency = (id: number) => {
    setClientPendencies((prev) => prev.filter((p) => p.id !== id));
    onFeedback('success', 'Registro Removido', 'Pendência/observação excluída do relatório.');
  };

  // Real CSV Export Handler
  const handleExportCsv = () => {
    const headers = [
      'Relatorio_Tipo',
      'Codigo',
      'Tipo_Fluxo',
      'Data_Vencimento',
      'Competencia',
      'Empresa_Cliente',
      'Favorecido_Pagador',
      'CNPJ_CPF',
      'Documento_Fiscal',
      'Categoria_Plano_Contas',
      'Centro_de_Custo',
      'Responsavel',
      'Status',
      'Valor_BRL',
    ];
    const rows = sortedEntries.map((e) => [
      activeReportType,
      e.code,
      e.type,
      e.dueDate,
      e.competence,
      `"${e.clientName}"`,
      `"${e.counterpartyName}"`,
      e.counterpartyDoc,
      `"${e.documentNumber}"`,
      `"${e.category}"`,
      `"${e.costCenter}"`,
      `"${e.createdByName}"`,
      `"${e.status}"`,
      Number(e.amount || 0).toFixed(2).replace('.', ','),
    ]);

    const summaryRow = [
      activeReportType,
      'TOTAL_CONSOLIDADO',
      '',
      effectiveDateRange.start,
      effectiveDateRange.end,
      `"${activeClientObj ? activeClientObj.tradeName : 'Multiempresa VN Gestão'}"`,
      `"Receitas: ${kpiMetrics.totalReceivables.toFixed(2)} | Despesas: ${kpiMetrics.totalPayables.toFixed(2)}"`,
      '',
      '',
      '',
      '',
      '',
      'SALDO_LIQUIDO',
      kpiMetrics.netCashResult.toFixed(2).replace('.', ','),
    ];

    const csvContent =
      '\uFEFF' +
      [headers.join(';'), ...rows.map((r) => r.join(';')), summaryRow.join(';')].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-${activeReportType.toLowerCase()}-vn-${reportIssueDate}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onFeedback(
      'success',
      'Relatório Exportado para CSV / Excel',
      `Arquivo "relatorio-${activeReportType.toLowerCase()}-vn-${reportIssueDate}.csv" gerado com ${sortedEntries.length} lançamentos filtrados.`
    );
  };

  const handlePrintReport = () => {
    window.print();
  };

  // Open Edit Modal for a specific row
  const handleOpenEditModal = (entry: FinancialEntryRecord) => {
    setEditingEntry(entry);
    setEditType(entry.type);
    setEditCounterparty(entry.counterpartyName);
    setEditAmount(entry.amount);
    setEditDueDate(entry.dueDate);
    setEditCategory(entry.category);
    setEditCostCenter(entry.costCenter);
    setEditDocNumber(entry.documentNumber);
    setEditDescription(entry.description);
    setEditStatus(entry.status);
    setEditReason('Ajuste operacional e revisão documental validada pela controladoria.');
  };

  const handleSubmitEditModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry) return;
    setSubmittingCrud(true);
    try {
      await onEditEntry(editingEntry.id, {
        type: editType,
        counterpartyName: editCounterparty,
        amount: editAmount,
        dueDate: editDueDate,
        category: editCategory,
        costCenter: editCostCenter,
        documentNumber: editDocNumber,
        description: editDescription,
        status: editStatus,
        adjustmentReason: editReason,
      });
      setEditingEntry(null);
    } finally {
      setSubmittingCrud(false);
    }
  };

  const handleSubmitCreateModal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingCrud(true);
    try {
      await onCreateEntry({
        clientId: Number(newClientId),
        type: newType,
        counterpartyName: newCounterparty || 'Parceiro Comercial Homologado Ltda',
        counterpartyDoc: newDocCnpj,
        category: newCategory,
        costCenter: newCostCenter,
        description: newDescription || `Lançamento operacional (${newType}) validado`,
        amount: newAmount || '1500.00',
        dueDate: newDueDate,
        documentNumber: newDocNumber || 'NF-001',
      });
      setCreateModalOpen(false);
      setNewCounterparty('');
      setNewAmount('');
      setNewDescription('');
    } finally {
      setSubmittingCrud(false);
    }
  };

  const handleConfirmDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deletingTarget) return;
    setSubmittingCrud(true);
    try {
      await onDeleteEntry(deletingTarget.id, deleteReason);
      setDeletingTarget(null);
    } finally {
      setSubmittingCrud(false);
    }
  };

  // Pending workflow counts for Connector Shortcuts
  const pendingBatchesCount = paymentBatches.filter((b) => b.status !== 'Aprovado').length;
  const divergentReconciliationsCount = reconciliations.filter(
    (r) => r.status !== 'Conciliado'
  ).length;
  const openTicketsCount = kpiMetrics.activeTicketsCount;

  // Report Selector Tabs
  const REPORT_TABS: Array<{
    key: SpecializedReportType;
    label: string;
    shortTitle: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      key: 'VISAO_GERAL',
      label: 'Painel BI & Visão Executiva',
      shortTitle: 'Painel Executivo de Controladoria & Inteligência BI',
      icon: Activity,
    },
    {
      key: 'FICHA_FINANCEIRA',
      label: 'Ficha Financeira do Cliente',
      shortTitle: 'Ficha Financeira 360º e Dossiê Cadastral da Empresa Cliente',
      icon: UserCheck,
    },
    {
      key: 'PLANO_DE_CONTAS',
      label: 'Plano de Contas por Cliente',
      shortTitle: 'Estrutura de Plano de Contas Contábil e Gerencial por Cliente',
      icon: BookOpen,
    },
    {
      key: 'DRE',
      label: 'Relatório DRE',
      shortTitle: 'Demonstração do Resultado do Exercício (DRE Gerencial & Contábil)',
      icon: Layers,
    },
    {
      key: 'FLUXO_CAIXA',
      label: 'Fluxo de Caixa',
      shortTitle: 'Demonstrativo de Fluxo de Caixa Realizado, Projetado e Saldo Acumulado',
      icon: DollarSign,
    },
    {
      key: 'FECHAMENTO',
      label: 'Relatório de Fechamento',
      shortTitle: 'Relatório de Fechamento Mensal BPO, Checklist e Bloqueios',
      icon: CheckCircle2,
    },
    {
      key: 'CONCILIACAO',
      label: 'Relatório de Conciliação',
      shortTitle: 'Relatório de Conciliação Bancária OFX vs. Razão e Divergências',
      icon: GitCompare,
    },
    {
      key: 'PAGAR_RECEBER',
      label: 'Contas a Pagar & Receber',
      shortTitle: 'Relatório Analítico de Contas a Pagar e Contas a Receber',
      icon: FileSpreadsheet,
    },
    {
      key: 'COBRANCAS',
      label: 'Relatório de Cobranças',
      shortTitle: 'Relatório de Cobranças, Recebíveis e Régua de Inadimplência',
      icon: BellRing,
    },
    {
      key: 'PENDENCIAS_OBSERVACOES',
      label: 'Pendências & Observações',
      shortTitle: 'Relatório de Pendências de Clientes e Observações da Controladoria',
      icon: ClipboardList,
    },
  ];

  const handleSelectReportType = (rep: SpecializedReportType) => {
    setActiveReportType(rep);
    const found = REPORT_TABS.find((t) => t.key === rep);
    if (found) {
      setReportTitle(found.shortTitle);
    }
  };

  return (
    <div id="overview" className="space-y-6 print-container">
      {/* ====================================================================
          CO-BRANDED EXECUTIVE HEADER (LOGO VN SOLUÇÕES + LOGO EMPRESA CLIENTE)
         ==================================================================== */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xs">
        {/* Left: Official VN Soluções Logo + Institutional Stamp */}
        <div className="flex items-center gap-4">
          <img
            src="/assets/aistudio/LOGO_VN_SOLUCOES_920d4640.png"
            alt="Logo Oficial VN Soluções BPO Financeiro"
            referrerPolicy="no-referrer"
            className="h-14 w-auto object-contain shrink-0"
          />
          <div className="border-l border-[#E2E8F0] pl-4">
            <div className="vn-eyebrow text-[11px] font-extrabold uppercase tracking-widest text-[#FA670D]">
              VN Soluções · Retaguarda & Controladoria BPO
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-[#052557] tracking-tight mt-0.5">
              {reportTitle}
            </h2>
            <div className="text-xs text-[#52627A] mt-0.5 tabular-nums">
              Período Ativo: <strong className="text-[#052557]">{effectiveDateRange.label}</strong> ·
              Emissão: <strong className="text-[#052557]">{formatDateBr(reportIssueDate)}</strong>
            </div>
          </div>
        </div>

        {/* Right: Client Company Co-Branding Logo / Identity Badge */}
        <div className="flex items-center gap-4 md:border-l md:border-[#E2E8F0] md:pl-6">
          {reportClientForBranding && clientCustomLogoMap[reportClientForBranding.id] ? (
            <img
              src={clientCustomLogoMap[reportClientForBranding.id]}
              alt={`Logo ${reportClientForBranding.tradeName}`}
              referrerPolicy="no-referrer"
              className="h-12 w-auto max-w-[150px] object-contain rounded-xl border border-[#E2E8F0] p-1 bg-white"
            />
          ) : (
            <div className="h-12 px-4 rounded-xl vn-hero text-white flex items-center gap-2.5 shrink-0">
              <Building2 className="w-5 h-5 text-[#FA670D]" />
              <div>
                <div className="text-[10px] text-blue-200 font-bold uppercase tracking-wider leading-none">
                  Empresa Cliente
                </div>
                <div className="text-xs font-extrabold tracking-tight mt-0.5">
                  {activeClientObj
                    ? activeClientObj.tradeName
                    : `Carteira Consolidada (${clients.length} Empresas)`}
                </div>
              </div>
            </div>
          )}

          <div className="text-xs">
            <div className="font-bold text-[#052557]">
              {activeClientObj ? activeClientObj.name : 'Multiempresa VN Gestão S.A.'}
            </div>
            <div className="font-mono text-[11px] text-[#52627A] tabular-nums">
              {activeClientObj
                ? `CNPJ: ${activeClientObj.cnpj} · ${activeClientObj.taxRegime}`
                : 'Isolamento Multiempresa Ativo · Demonstração Consolidada'}
            </div>
            <div className="mt-1 flex items-center gap-2 no-print">
              <label className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0571ED] hover:underline cursor-pointer">
                <Upload className="w-3 h-3" />
                <span>Anexar Logo da Empresa Cliente</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadClientLogo}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          1. TOP-LEVEL GRID OF 4 EXECUTIVE KPIs (PURE WHITE #FFFFFF CARDS,
             SUBTLE BORDERS, LUCIDE ICONS IN BADGES, TABULAR-NUMS)
         ==================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Monthly Revenue (Receita Mensal & Recebíveis) */}
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-5 flex flex-col justify-between vn-lift">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#52627A]">
              Monthly Revenue (Receita Mensal)
            </span>
            <span className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-[#052557] mt-3 tabular-nums tracking-tight">
            {formatBrl(kpiMetrics.totalReceivables)}
          </div>
          <div className="mt-3 flex items-center justify-between gap-2 text-xs tabular-nums">
            <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
              <TrendingUp className="w-3.5 h-3.5" />
              +14,2%
            </span>
            <span className="text-[#52627A]">
              Fee BPO (MRR): <strong className="text-[#052557]">{formatBrl(kpiMetrics.totalBpoMrr)}</strong>
            </span>
          </div>
        </div>

        {/* KPI 2: Operational Costs (Custos Operacionais & Despesas) */}
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-5 flex flex-col justify-between vn-lift">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#52627A]">
              Operational Costs (Custos Operacionais)
            </span>
            <span className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200 text-[#FA670D] flex items-center justify-center shrink-0">
              <ArrowDownRight className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-[#052557] mt-3 tabular-nums tracking-tight">
            {formatBrl(kpiMetrics.totalPayables)}
          </div>
          <div className="mt-3 flex items-center justify-between gap-2 text-xs tabular-nums">
            <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
              <TrendingDown className="w-3.5 h-3.5" />
              -3,8%
            </span>
            <span className="text-[#52627A]">
              Custo BPO: <strong className="text-[#052557]">{formatBrl(kpiMetrics.totalBpoCost)}</strong>
            </span>
          </div>
        </div>

        {/* KPI 3: Active Tickets (Chamados Ativos no Service Desk) */}
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-5 flex flex-col justify-between vn-lift">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#52627A]">
              Active Tickets (Chamados Ativos)
            </span>
            <span className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-[#0571ED] flex items-center justify-center shrink-0">
              <LifeBuoy className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-[#052557] mt-3 tabular-nums tracking-tight">
            {openTicketsCount} chamado(s)
          </div>
          <div className="mt-3 flex items-center justify-between gap-2 text-xs tabular-nums">
            <span className="font-bold text-[#FA670D]">
              {kpiMetrics.criticalTicketsCount} prioridade S1/S2
            </span>
            <span className="text-[#52627A]">
              Conciliação: <strong className="text-emerald-700">{kpiMetrics.reconciliationRate}%</strong>
            </span>
          </div>
        </div>

        {/* KPI 4: System Uptime (Disponibilidade & Uptime SLA) */}
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-5 flex flex-col justify-between vn-lift">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#52627A]">
              System Uptime (Disponibilidade SLA)
            </span>
            <span className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
              <Activity className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-[#052557] mt-3 tabular-nums tracking-tight">
            {systemHealth?.availabilityPct || '99.98%'}
          </div>
          <div className="mt-3 flex items-center justify-between gap-2 text-xs tabular-nums">
            <span className="font-bold text-emerald-700">
              Latência {systemHealth?.avgResponseMs || 42} ms
            </span>
            <span className="text-[#52627A]">
              Backups GCS: <strong className="text-[#052557]">{backupLogs.length} OK</strong>
            </span>
          </div>
        </div>
      </div>

      {/* ====================================================================
          2. GLOBAL DATE FILTERING CONTROL BAR & REPORT SELECTOR (ABOVE CHARTS)
         ==================================================================== */}
      <div
        id="global-date-filter-bar"
        className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-5 space-y-4 no-print shadow-2xs"
      >
        {/* Top Row: Global Date Filtering Control Bar (Today, Last 7 Days, This Month, Custom, etc.) */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-extrabold text-[#052557] flex items-center gap-1.5 mr-1">
              <Calendar className="w-4 h-4 text-[#FA670D]" />
              Filtro Global de Datas (Date Range):
            </span>
            <div
              role="group"
              aria-label="Global Date Filter Presets"
              className="flex flex-wrap items-center gap-1 bg-[#F4F7FB] p-1 rounded-xl border border-[#E2E8F0]"
            >
              {[
                { id: 'HOJE', label: 'Today (Hoje)' },
                { id: '7_DIAS', label: 'Last 7 Days (Últimos 7 Dias)' },
                { id: 'ESTE_MES', label: 'This Month (Este Mês)' },
                { id: '3_MESES', label: 'Last 3 Months (3 Meses)' },
                { id: 'ESTE_ANO', label: 'This Year (Este Ano)' },
                { id: 'PERSONALIZADO', label: 'Custom (Personalizado)' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleDateFilterChange(p.id as PeriodPreset)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                    periodPreset === p.id
                      ? 'bg-[#052557] text-white shadow-xs'
                      : 'text-[#52627A] hover:text-[#052557] hover:bg-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setCreateModalOpen(true)}
              className="px-3.5 py-2 bg-[#FA670D] hover:bg-[#E0570A] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Novo Lançamento
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3.5 py-2 bg-[#F4F7FB] hover:bg-slate-200/70 text-[#052557] border border-[#E2E8F0] text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#0571ED]" />
              Exportar CSV / Excel
            </button>
            <button
              type="button"
              onClick={handlePrintReport}
              className="px-3.5 py-2 bg-[#052557] hover:bg-[#031B4A] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir Relatório
            </button>
          </div>
        </div>

        {/* Second Row: Custom Range Picker (Start / End Date with dynamic onChange) + Segmented Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs pt-3 border-t border-[#E2E8F0]">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#52627A] mb-1">
              Empresa Cliente (Escopo)
            </label>
            <select
              value={selectedClientId}
              onChange={(e) =>
                onSelectClientId(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))
              }
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-xl bg-[#F4F7FB] font-semibold text-[#052557]"
            >
              <option value="ALL">Todas as Empresas ({clients.length})</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} · {c.tradeName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#52627A] mb-1">
              Data Inicial (Custom Start)
            </label>
            <input
              type="date"
              aria-label="Data Inicial"
              value={effectiveDateRange.start}
              onChange={(e) =>
                handleDateFilterChange('PERSONALIZADO', e.target.value, effectiveDateRange.end)
              }
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-xl bg-[#F4F7FB] font-mono text-[#052557] tabular-nums"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#52627A] mb-1">
              Data Final (Custom End)
            </label>
            <input
              type="date"
              aria-label="Data Final"
              value={effectiveDateRange.end}
              onChange={(e) =>
                handleDateFilterChange('PERSONALIZADO', effectiveDateRange.start, e.target.value)
              }
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-xl bg-[#F4F7FB] font-mono text-[#052557] tabular-nums"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#52627A] mb-1">
              Status do Lançamento
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-xl bg-[#F4F7FB] font-medium text-[#052557]"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="Conciliado">Conciliado</option>
              <option value="Aprovado">Aprovado</option>
              <option value="Aguardando aprovação">Aguardando aprovação</option>
              <option value="Pendente">Pendente</option>
              <option value="Em análise">Em análise</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#52627A] mb-1">
              Conta / Categoria Contábil
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-xl bg-[#F4F7FB] font-medium text-[#052557]"
            >
              <option value="TODAS">Todas as Categorias</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#52627A] mb-1">
              Responsável / Limpar
            </label>
            <div className="flex items-center gap-1.5">
              <select
                value={responsibleFilter}
                onChange={(e) => setResponsibleFilter(e.target.value)}
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-xl bg-[#F4F7FB] font-medium text-[#052557]"
              >
                <option value="TODOS">Todos Responsáveis</option>
                {availableResponsibles.map((resp) => (
                  <option key={resp} value={resp}>
                    {resp}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleResetFilters}
                title="Restaurar período e limpar filtros"
                className="p-2 border border-[#E2E8F0] rounded-xl bg-[#F4F7FB] hover:bg-slate-200/70 text-[#052557] shrink-0 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Third Row: Specialized Report Type Selector Ribbon */}
        <div className="pt-3 border-t border-[#E2E8F0]">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#52627A] mb-2">
            Central de Emissão de Relatórios Executivos, DRE, Fluxo de Caixa, Ficha Financeira & Plano de Contas
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {REPORT_TABS.map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeReportType === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleSelectReportType(tab.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#052557] text-white shadow-xs'
                      : 'bg-[#F4F7FB] text-[#52627A] hover:text-[#052557] border border-[#E2E8F0]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#FA670D]' : 'text-[#0571ED]'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ====================================================================
          3. ATALHOS DE NAVEGAÇÃO 'CONECTORES' BASEADOS EM FLUXOS DE TRABALHO
         ==================================================================== */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-5 no-print shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-sm font-extrabold text-[#052557]">
              Conectores de Fluxo de Trabalho & Subcomandos Operacionais
            </h3>
            <p className="text-xs text-[#52627A]">
              Navegação rápida para aprovações com Segregação de Funções (SoD), divergências de conciliação e Portal do Cliente
            </p>
          </div>
          <span className="text-xs font-mono text-[#52627A] tabular-nums">
            {kpiMetrics.entriesCount} lançamento(s) no período · Saldo Líquido:{' '}
            <strong className="text-emerald-700">{formatBrl(kpiMetrics.netCashResult)}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <button
            type="button"
            onClick={() => onNavigateModule('payment_batches')}
            className="p-3.5 rounded-xl border border-[#E2E8F0] bg-[#F4F7FB]/60 hover:border-[#0571ED] hover:bg-blue-50/40 text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <ShieldCheck className="w-4 h-4 text-[#0571ED]" />
              <span className="text-xs font-mono font-bold text-[#FA670D] tabular-nums">
                {pendingBatchesCount} pendente(s)
              </span>
            </div>
            <div className="text-xs font-bold text-[#052557] mt-2 group-hover:text-[#0571ED]">
              Pagamentos Pendentes
            </div>
            <div className="text-[11px] text-[#52627A] mt-0.5">
              Aprovar lotes bancários (SoD)
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateModule('reconciliation')}
            className="p-3.5 rounded-xl border border-[#E2E8F0] bg-[#F4F7FB]/60 hover:border-[#0571ED] hover:bg-blue-50/40 text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <GitCompare className="w-4 h-4 text-[#FA670D]" />
              <span className="text-xs font-mono font-bold text-red-700 tabular-nums">
                {divergentReconciliationsCount} alerta(s)
              </span>
            </div>
            <div className="text-xs font-bold text-[#052557] mt-2 group-hover:text-[#0571ED]">
              Conciliações c/ Divergência
            </div>
            <div className="text-[11px] text-[#52627A] mt-0.5">
              Sanear diferença R$ 250,00
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateModule('service_desk')}
            className="p-3.5 rounded-xl border border-[#E2E8F0] bg-[#F4F7FB]/60 hover:border-[#0571ED] hover:bg-blue-50/40 text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <LifeBuoy className="w-4 h-4 text-[#0571ED]" />
              <span className="text-xs font-mono font-bold text-[#052557] tabular-nums">
                {openTicketsCount} ativo(s)
              </span>
            </div>
            <div className="text-xs font-bold text-[#052557] mt-2 group-hover:text-[#0571ED]">
              VN Service Desk (SLA)
            </div>
            <div className="text-[11px] text-[#52627A] mt-0.5">
              Chamados & validação Seção 4.12
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateModule('data_protection')}
            className="p-3.5 rounded-xl border border-[#E2E8F0] bg-[#F4F7FB]/60 hover:border-[#0571ED] hover:bg-blue-50/40 text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <HardDrive className="w-4 h-4 text-emerald-700" />
              <span className="text-xs font-mono font-bold text-emerald-700 tabular-nums">
                {backupLogs.length} logs GCS
              </span>
            </div>
            <div className="text-xs font-bold text-[#052557] mt-2 group-hover:text-[#0571ED]">
              VN Data Protection
            </div>
            <div className="text-[11px] text-[#52627A] mt-0.5">
              Backups Cloud SQL (Seção 6.5)
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateModule('incident_management')}
            className="p-3.5 rounded-xl border border-[#E2E8F0] bg-[#F4F7FB]/60 hover:border-[#0571ED] hover:bg-blue-50/40 text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <AlertOctagon className="w-4 h-4 text-[#052557]" />
              <span className="text-xs font-mono font-bold text-[#052557]">5 Porquês</span>
            </div>
            <div className="text-xs font-bold text-[#052557] mt-2 group-hover:text-[#0571ED]">
              Causa Raiz & GMUD
            </div>
            <div className="text-[11px] text-[#52627A] mt-0.5">
              Análise RCA (Seção 5.3)
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateModule('client_portal_website')}
            className="p-3.5 rounded-xl border border-orange-200 bg-orange-50/50 hover:border-[#FA670D] hover:bg-orange-50 text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <Monitor className="w-4 h-4 text-[#FA670D]" />
              <span className="text-xs font-mono font-bold text-[#FA670D]">Link & Portal</span>
            </div>
            <div className="text-xs font-bold text-[#052557] mt-2 group-hover:text-[#FA670D]">
              Website & Área do Cliente
            </div>
            <div className="text-[11px] text-[#52627A] mt-0.5">
              Link Instagram, Login & Chamados
            </div>
          </button>
        </div>
      </div>

      {/* ====================================================================
          4. SPECIALIZED SECTION A: PLANO DE CONTAS POR EMPRESA CLIENTE
         ==================================================================== */}
      {activeReportType === 'PLANO_DE_CONTAS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Plano de Contas Contábil & Gerencial por Empresa Cliente ({scopedChartOfAccounts.length} contas)
                </h3>
                <p className="text-xs text-slate-500">
                  Estrutura hierárquica vinculada à DRE, Fluxo de Caixa e Categorias Operacionais de cada cliente BPO
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-2.5 px-4">Código / Tipo</th>
                    <th className="py-2.5 px-4">Conta Contábil / Gerencial</th>
                    <th className="py-2.5 px-4">Empresa Cliente</th>
                    <th className="py-2.5 px-4">Grupo na DRE</th>
                    <th className="py-2.5 px-4">Natureza</th>
                    <th className="py-2.5 px-4 text-right no-print">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {scopedChartOfAccounts.map((acc) => (
                    <tr key={acc.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono">
                        <div className="font-bold text-slate-900">{acc.accountCode}</div>
                        <div className="text-[10px] text-slate-500">{acc.accountType}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{acc.accountName}</div>
                        <div className="text-[11px] text-slate-500">
                          Categoria vinculada: <strong>{acc.linkedCategory}</strong>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">{acc.clientName}</td>
                      <td className="py-3 px-4 text-slate-700">{acc.dreGroup}</td>
                      <td className="py-3 px-4 font-mono">
                        <span
                          className={`font-semibold ${
                            acc.nature === 'CREDORA' ? 'text-emerald-700' : 'text-amber-700'
                          }`}
                        >
                          {acc.nature}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1 no-print">
                        <button
                          type="button"
                          onClick={() => handleEditCoaItem(acc)}
                          className="px-2 py-1 border border-slate-300 rounded hover:bg-slate-100 text-slate-700 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3 text-[#0052CC]" />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCoaItem(acc.id)}
                          className="px-2 py-1 border border-red-200 rounded hover:bg-red-50 text-red-700 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Form to Create / Edit Chart of Accounts per Client */}
          <form
            onSubmit={handleSaveChartOfAccount}
            className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-5 space-y-3 h-fit text-xs no-print"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-bold text-slate-900">
                {editingCoaId
                  ? 'Editar Conta do Plano de Contas'
                  : 'Cadastrar Conta no Plano de Contas do Cliente'}
              </h3>
              {editingCoaId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingCoaId(null);
                    setCoaName('');
                  }}
                  className="text-slate-500 hover:text-slate-800"
                >
                  Cancelar
                </button>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Empresa Cliente Destino *
              </label>
              <select
                value={coaClientId}
                onChange={(e) =>
                  setCoaClientId(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))
                }
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md bg-white"
              >
                <option value="ALL">Plano Padrão Multiempresa VN (Todas)</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} · {c.tradeName} ({c.taxRegime})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Código Estruturado *
                </label>
                <input
                  type="text"
                  required
                  value={coaCode}
                  onChange={(e) => setCoaCode(e.target.value)}
                  placeholder="Ex.: 3.02.04"
                  className="w-full px-3 py-1.5 font-mono border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Natureza *</label>
                <select
                  value={coaNature}
                  onChange={(e) => setCoaNature(e.target.value as 'CREDORA' | 'DEVEDORA')}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md bg-white"
                >
                  <option value="CREDORA">CREDORA (Receita)</option>
                  <option value="DEVEDORA">DEVEDORA (Custo/Despesa)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nome da Conta Contábil / Gerencial *
              </label>
              <input
                type="text"
                required
                value={coaName}
                onChange={(e) => setCoaName(e.target.value)}
                placeholder="Ex.: Manutenção de Equipamentos Médicos"
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Grau da Conta</label>
                <select
                  value={coaType}
                  onChange={(e) => setCoaType(e.target.value as 'SINTETICA' | 'ANALITICA')}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md bg-white"
                >
                  <option value="ANALITICA">ANALÍTICA (Recebe lançamentos)</option>
                  <option value="SINTETICA">SINTÉTICA (Grupo totalizador)</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Categoria Vinculada
                </label>
                <input
                  type="text"
                  value={coaLinkedCategory}
                  onChange={(e) => setCoaLinkedCategory(e.target.value)}
                  placeholder="Ex.: Insumos Médicos"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Agrupamento Oficial na DRE *
              </label>
              <select
                value={coaDreGroup}
                onChange={(e) =>
                  setCoaDreGroup(e.target.value as ChartOfAccountItem['dreGroup'])
                }
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md bg-white"
              >
                <option value="1. Receita Bruta Operacional">1. Receita Bruta Operacional</option>
                <option value="2. Deduções e Impostos s/ Vendas">
                  2. Deduções e Impostos s/ Vendas
                </option>
                <option value="3. Custos Operacionais Diretos (CMV/CSP)">
                  3. Custos Operacionais Diretos (CMV/CSP)
                </option>
                <option value="4. Despesas Administrativas e Pessoal">
                  4. Despesas Administrativas e Pessoal
                </option>
                <option value="5. Resultado Financeiro Líquido">
                  5. Resultado Financeiro Líquido
                </option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-[#0052CC] hover:bg-blue-700 text-white font-semibold rounded-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {editingCoaId ? 'Salvar Alteração na Conta' : 'Adicionar Conta ao Plano do Cliente'}
            </button>
          </form>
        </div>
      )}

      {/* ====================================================================
          5. SPECIALIZED SECTION B: FICHA FINANCEIRA DO CLIENTE (DOSSIÊ 360º)
         ==================================================================== */}
      {activeReportType === 'FICHA_FINANCEIRA' && (
        <div className="space-y-6">
          {(activeClientObj ? [activeClientObj] : clients).map((cl) => {
            const clEntries = filteredEntries.filter((e) => e.clientId === cl.id);
            const clRec = clEntries
              .filter((e) => e.type === 'RECEBER')
              .reduce((a, b) => a + Number(b.amount || 0), 0);
            const clPag = clEntries
              .filter((e) => e.type === 'PAGAR')
              .reduce((a, b) => a + Number(b.amount || 0), 0);
            const clPendencies = clientPendencies.filter((p) => p.clientId === cl.id);
            const clAccounts = chartOfAccounts.filter(
              (a) => a.clientId === 'ALL' || a.clientId === cl.id
            );
            const clContracts = contracts.filter((ct) => ct.clientId === cl.id);

            return (
              <div
                key={cl.id}
                className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-6 space-y-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-200">
                  <div>
                    <div className="text-xs font-mono font-bold text-[#0052CC]">
                      FICHA FINANCEIRA & CADASTRO EXECUTIVO · {cl.code}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                      {cl.name} ({cl.tradeName})
                    </h3>
                    <div className="text-xs text-slate-600 mt-1 font-mono">
                      CNPJ: <strong>{cl.cnpj}</strong> · Regime: <strong>{cl.taxRegime}</strong> ·
                      ERP: <strong>{cl.erpSystem}</strong> · Analista Responsável:{' '}
                      <strong>{cl.responsibleAnalyst}</strong>
                    </div>
                  </div>
                  <div className="text-right font-mono text-xs tabular-nums">
                    <div>
                      Honorário BPO Mensal:{' '}
                      <strong className="text-slate-900 text-sm">{formatBrl(cl.monthlyFee)}</strong>
                    </div>
                    <div className="text-slate-500">
                      Custo Operacional: {formatBrl(cl.operationalCost)} · Status:{' '}
                      <strong className="text-emerald-700">{cl.status}</strong>
                    </div>
                  </div>
                </div>

                {/* Client Financial Summary Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="text-slate-500">Contas Bancárias Homologadas</div>
                    <div className="font-semibold text-slate-900 mt-1">{cl.bankAccounts}</div>
                  </div>
                  <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-lg">
                    <div className="text-emerald-800">Entradas / Recebíveis no Período</div>
                    <div className="text-base font-bold text-emerald-700 mt-1 font-mono tabular-nums">
                      {formatBrl(clRec)}
                    </div>
                  </div>
                  <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-lg">
                    <div className="text-amber-900">Saídas / Pagamentos no Período</div>
                    <div className="text-base font-bold text-slate-900 mt-1 font-mono tabular-nums">
                      {formatBrl(clPag)}
                    </div>
                  </div>
                  <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-lg">
                    <div className="text-blue-900">Saldo Líquido & Contas Contábeis</div>
                    <div className="text-base font-bold text-[#0052CC] mt-1 font-mono tabular-nums">
                      {formatBrl(clRec - clPag)} ({clAccounts.length} contas)
                    </div>
                  </div>
                </div>

                {/* Particularities & Contracts */}
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-950">
                  <strong>Particularidades Operacionais Obrigatórias & Regras de Negócio:</strong>{' '}
                  {cl.particularities}
                  {clContracts.length > 0 && (
                    <div className="mt-1.5 pt-1.5 border-t border-amber-200/80 text-slate-700">
                      <strong>Contrato Vinculado:</strong> {clContracts[0].code} —{' '}
                      {clContracts[0].packageName} ({clContracts[0].servicesScope}) · Vigência:{' '}
                      {clContracts[0].startDate} a {clContracts[0].endDate}
                    </div>
                  )}
                </div>

                {/* Client Pendencies & Observations inside Ficha Financeira */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Pendências Documentais, Cobranças & Observações de {cl.tradeName} ({clPendencies.length})
                  </h4>
                  {clPendencies.length === 0 ? (
                    <div className="text-xs text-slate-500 italic">
                      Nenhuma pendência aberta para esta empresa cliente.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {clPendencies.map((p) => (
                        <div
                          key={p.id}
                          className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start justify-between gap-3"
                        >
                          <div>
                            <div className="font-mono text-[11px] text-slate-500">
                              {p.code} · {p.type} · Prazo: {formatDateBr(p.dueDate)}
                            </div>
                            <div className="font-semibold text-slate-900 mt-0.5">{p.title}</div>
                            <div className="text-slate-600 mt-0.5">{p.details}</div>
                          </div>
                          <span
                            className={`font-semibold shrink-0 ${
                              p.status === 'Resolvido' ? 'text-emerald-700' : 'text-amber-700'
                            }`}
                          >
                            {p.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ====================================================================
          6. SPECIALIZED SECTION C: RELATÓRIO DRE (DEMONSTRAÇÃO DO RESULTADO)
         ==================================================================== */}
      {activeReportType === 'DRE' && (
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Demonstração do Resultado do Exercício (DRE Contábil & Gerencial Reconciliada)
              </h3>
              <p className="text-xs text-slate-500">
                Integrada ao Plano de Contas por Empresa Cliente e filtrada pelo período{' '}
                {effectiveDateRange.label}
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-700 font-semibold">
              Invariante Centesimal Validado
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3 px-4">Código Plano de Contas</th>
                  <th className="py-3 px-4">Rubrica / Linha da DRE</th>
                  <th className="py-3 px-4 text-right">Valor Apurado (R$)</th>
                  <th className="py-3 px-4 text-right">Análise Vertical (% AV)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                <tr className="bg-emerald-50/40 font-semibold text-slate-900">
                  <td className="py-3 px-4">1.01.00</td>
                  <td className="py-3 px-4 font-sans">
                    (+) RECEITA BRUTA OPERACIONAL (Faturamento & Serviços)
                  </td>
                  <td className="py-3 px-4 text-right text-emerald-700 tabular-nums">
                    {formatBrl(dreStatement.grossRevenue)}
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums">100.0%</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-slate-500">2.01.01</td>
                  <td className="py-2.5 px-4 font-sans text-slate-700 pl-8">
                    (-) Deduções da Receita Bruta, Impostos e Retenções (ISS, PIS, COFINS, IRRF)
                  </td>
                  <td className="py-2.5 px-4 text-right text-red-700 tabular-nums">
                    - {formatBrl(dreStatement.effectiveTaxDeductions)}
                  </td>
                  <td className="py-2.5 px-4 text-right text-slate-500 tabular-nums">
                    {dreStatement.av(dreStatement.effectiveTaxDeductions)}
                  </td>
                </tr>
                <tr className="bg-slate-50 font-bold text-slate-900">
                  <td className="py-3 px-4">(=) 2.99</td>
                  <td className="py-3 px-4 font-sans">(=) RECEITA OPERACIONAL LÍQUIDA</td>
                  <td className="py-3 px-4 text-right tabular-nums">
                    {formatBrl(dreStatement.netRevenue)}
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums">
                    {dreStatement.av(dreStatement.netRevenue)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-slate-500">3.01.00</td>
                  <td className="py-2.5 px-4 font-sans text-slate-700 pl-8">
                    (-) Custos Operacionais Diretos (Insumos, Fornecedores Homologados & Fretes)
                  </td>
                  <td className="py-2.5 px-4 text-right text-red-700 tabular-nums">
                    - {formatBrl(dreStatement.directCosts)}
                  </td>
                  <td className="py-2.5 px-4 text-right text-slate-500 tabular-nums">
                    {dreStatement.av(dreStatement.directCosts)}
                  </td>
                </tr>
                <tr className="bg-slate-50 font-bold text-slate-900">
                  <td className="py-3 px-4">(=) 3.99</td>
                  <td className="py-3 px-4 font-sans">
                    (=) LUCRO BRUTO / MARGEM DE CONTRIBUIÇÃO OPERACIONAL
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums">
                    {formatBrl(dreStatement.grossProfit)}
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums">
                    {dreStatement.av(dreStatement.grossProfit)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-slate-500">4.01.00</td>
                  <td className="py-2.5 px-4 font-sans text-slate-700 pl-8">
                    (-) Despesas Administrativas, Folha de Pagamento, Tecnologia Cloud & BPO
                  </td>
                  <td className="py-2.5 px-4 text-right text-red-700 tabular-nums">
                    - {formatBrl(dreStatement.adminAndPayrollExpenses)}
                  </td>
                  <td className="py-2.5 px-4 text-right text-slate-500 tabular-nums">
                    {dreStatement.av(dreStatement.adminAndPayrollExpenses)}
                  </td>
                </tr>
                <tr className="bg-slate-900 text-white font-bold text-sm">
                  <td className="py-3.5 px-4">(=) 5.99</td>
                  <td className="py-3.5 px-4 font-sans">
                    (=) RESULTADO LÍQUIDO DO PERÍODO (SUPERÁVIT / DÉFICIT)
                  </td>
                  <td className="py-3.5 px-4 text-right text-emerald-400 tabular-nums">
                    {formatBrl(dreStatement.netOperatingResult)}
                  </td>
                  <td className="py-3.5 px-4 text-right text-emerald-400 tabular-nums">
                    {dreStatement.av(dreStatement.netOperatingResult)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ====================================================================
          7. SPECIALIZED SECTION D: FLUXO DE CAIXA DIÁRIO & ACUMULADO
         ==================================================================== */}
      {activeReportType === 'FLUXO_CAIXA' && (
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Relatório de Fluxo de Caixa Diário & Evolução de Saldo Acumulado
              </h3>
              <p className="text-xs text-slate-500">
                Entradas, saídas, geração líquida de caixa por data de vencimento/liquidação e saldo acumulado
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3 px-4">Data Movimento</th>
                  <th className="py-3 px-4 text-right">Entradas / Recebimentos (+)</th>
                  <th className="py-3 px-4 text-right">Saídas / Pagamentos (-)</th>
                  <th className="py-3 px-4 text-right">Geração Líquida do Dia (=)</th>
                  <th className="py-3 px-4 text-right">Saldo Acumulado no Período</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {temporalChartData.map((row) => (
                  <tr key={row.dateKey} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-semibold text-slate-900 tabular-nums">
                      {formatDateBr(row.dateKey)}
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-700 font-semibold tabular-nums">
                      + {formatBrl(row.receitas)}
                    </td>
                    <td className="py-3 px-4 text-right text-amber-800 font-semibold tabular-nums">
                      - {formatBrl(row.despesas)}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-bold tabular-nums ${
                        row.saldo >= 0 ? 'text-emerald-700' : 'text-red-700'
                      }`}
                    >
                      {formatBrl(row.saldo)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 tabular-nums">
                      {formatBrl(row.acumulado)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ====================================================================
          8. SPECIALIZED SECTION E: RELATÓRIO DE FECHAMENTO & CONCILIAÇÃO
         ==================================================================== */}
      {(activeReportType === 'FECHAMENTO' || activeReportType === 'CONCILIACAO') && (
        <div className="space-y-6">
          {/* Conciliação Bancária */}
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Relatório de Conciliação Bancária (Extrato OFX vs. Razão ERP) & Divergências ({scopedReconciliations.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Auditoria de pareamento bancário, diferenças apuradas e justificativas documentadas
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateModule('reconciliation')}
                className="text-xs font-semibold text-[#0052CC] hover:underline no-print cursor-pointer"
              >
                Ir para Conciliação →
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-2.5 px-4">Código / Data</th>
                    <th className="py-2.5 px-4">Empresa Cliente & Banco</th>
                    <th className="py-2.5 px-4">Histórico Extrato / Vínculo</th>
                    <th className="py-2.5 px-4 text-right">Extrato (R$)</th>
                    <th className="py-2.5 px-4 text-right">Razão ERP (R$)</th>
                    <th className="py-2.5 px-4 text-right">Diferença</th>
                    <th className="py-2.5 px-4">Status & Observação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {scopedReconciliations.map((rec) => {
                    const diff = Math.abs(Number(rec.differenceAmount || 0));
                    return (
                      <tr key={rec.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono">
                          <div className="font-bold text-slate-900">{rec.code}</div>
                          <div className="text-slate-500 tabular-nums">
                            {formatDateBr(rec.statementDate)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{rec.clientName}</div>
                          <div className="text-slate-500">{rec.bankAccount}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-900">
                            {rec.statementDescription}
                          </div>
                          <div className="font-mono text-[11px] text-slate-500">
                            Lançamento: {rec.linkedEntryCode || 'Pendente'}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums">
                          {formatBrl(rec.statementAmount)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums">
                          {formatBrl(rec.ledgerAmount)}
                        </td>
                        <td
                          className={`py-3 px-4 text-right font-mono font-bold tabular-nums ${
                            diff > 0 ? 'text-red-700' : 'text-emerald-700'
                          }`}
                        >
                          {formatBrl(rec.differenceAmount)}
                        </td>
                        <td className="py-3 px-4">
                          <div
                            className={`font-semibold ${
                              rec.status === 'Conciliado' ? 'text-emerald-700' : 'text-amber-700'
                            }`}
                          >
                            {rec.status}
                          </div>
                          {rec.justification && (
                            <div className="text-[11px] text-slate-500">{rec.justification}</div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Fechamento Mensal */}
          {scopedClosings.length > 0 && (
            <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200">
                <h3 className="text-sm font-bold text-slate-900">
                  Relatório de Fechamento Mensal & Checklist de Entregas ({scopedClosings.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-2.5 px-4">Fechamento / Competência</th>
                      <th className="py-2.5 px-4">Empresa Cliente</th>
                      <th className="py-2.5 px-4">Progresso Checklist</th>
                      <th className="py-2.5 px-4 text-right">Receita DRE</th>
                      <th className="py-2.5 px-4 text-right">Despesa DRE</th>
                      <th className="py-2.5 px-4 text-right">Resultado Líquido</th>
                      <th className="py-2.5 px-4">Status & Ressalvas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {scopedClosings.map((cl) => (
                      <tr key={cl.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {cl.code} · {cl.competence}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">{cl.clientName}</td>
                        <td className="py-3 px-4 font-mono tabular-nums">
                          {cl.checklistProgress}% ({cl.reconciliationStatus})
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums">
                          {formatBrl(cl.dreRevenue)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums">
                          {formatBrl(cl.dreExpenses)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700 tabular-nums">
                          {formatBrl(cl.dreNetResult)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{cl.status}</div>
                          <div className="text-[11px] text-slate-500">
                            {cl.pendingJustifications}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ====================================================================
          9. SPECIALIZED SECTION F: COBRANÇAS, PENDÊNCIAS DE CLIENTES & OBSERVAÇÕES
         ==================================================================== */}
      {(activeReportType === 'COBRANCAS' || activeReportType === 'PENDENCIAS_OBSERVACOES') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Pendências & Observações Table */}
            <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Relatório de Pendências de Clientes, Cobranças & Observações da Controladoria ({scopedPendencies.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Acompanhamento de documentos fiscais pendentes, comprovantes, glosas e régua de cobrança
                  </p>
                </div>
              </div>
              <div className="divide-y divide-slate-200 text-xs">
                {scopedPendencies.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-slate-500">
                        <strong className="text-[#0052CC]">{item.code}</strong>
                        <span>·</span>
                        <span className="font-sans font-semibold text-slate-800">
                          {item.clientName}
                        </span>
                        <span>·</span>
                        <span>{item.type}</span>
                        <span>·</span>
                        <span>Prazo: {formatDateBr(item.dueDate)}</span>
                        <span>·</span>
                        <span
                          className={
                            item.severity === 'Alta'
                              ? 'text-red-700 font-bold'
                              : 'text-amber-700 font-semibold'
                          }
                        >
                          Prioridade {item.severity}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-slate-900">{item.title}</div>
                      <p className="text-slate-600">{item.details}</p>
                      <div className="text-[11px] text-slate-500">
                        Responsável: <strong>{item.responsibleAnalyst}</strong> · Status:{' '}
                        <strong
                          className={
                            item.status === 'Resolvido' ? 'text-emerald-700' : 'text-amber-700'
                          }
                        >
                          {item.status}
                        </strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 no-print">
                      <button
                        type="button"
                        onClick={() => handleTogglePendencyStatus(item.id)}
                        className="px-2.5 py-1 border border-slate-300 rounded hover:bg-slate-100 text-slate-800 font-medium cursor-pointer"
                      >
                        {item.status === 'Resolvido' ? 'Reabrir' : 'Marcar Resolvido'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePendency(item.id)}
                        className="px-2 py-1 border border-red-200 rounded hover:bg-red-50 text-red-700 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Receivables / Cobranças Table */}
            <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200">
                <h3 className="text-sm font-bold text-slate-900">
                  Carteira de Cobranças & Títulos a Receber no Período
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-2.5 px-4">Título / NF</th>
                      <th className="py-2.5 px-4">Empresa Cliente</th>
                      <th className="py-2.5 px-4">Sacado / Pagador</th>
                      <th className="py-2.5 px-4">Vencimento</th>
                      <th className="py-2.5 px-4 text-right">Valor (R$)</th>
                      <th className="py-2.5 px-4">Status de Cobrança</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {sortedEntries
                      .filter((e) => e.type === 'RECEBER')
                      .map((rec) => (
                        <tr key={rec.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            {rec.code} · {rec.documentNumber}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            {rec.clientName}
                          </td>
                          <td className="py-3 px-4 text-slate-700">{rec.counterpartyName}</td>
                          <td className="py-3 px-4 font-mono tabular-nums">
                            {formatDateBr(rec.dueDate)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700 tabular-nums">
                            {formatBrl(rec.amount)}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-800">{rec.status}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Form to Add New Client Pendency / Observation / Collection Note */}
          <form
            onSubmit={handleAddClientPendency}
            className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-5 space-y-3 h-fit text-xs no-print"
          >
            <h3 className="text-sm font-bold text-slate-900">
              Registrar Nova Pendência de Cliente, Cobrança ou Observação
            </h3>
            <p className="text-slate-500">
              Integra automaticamente a Ficha Financeira e o relatório de pendências do cliente.
            </p>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Empresa Cliente *</label>
              <select
                value={newPendencyClientId}
                onChange={(e) => setNewPendencyClientId(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md bg-white"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} · {c.tradeName}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tipo *</label>
                <select
                  value={newPendencyType}
                  onChange={(e) =>
                    setNewPendencyType(e.target.value as ClientPendencyObservation['type'])
                  }
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md bg-white"
                >
                  <option value="PENDENCIA_DOCUMENTAL">Pendência Documental</option>
                  <option value="OBSERVACAO_CONTROLADORIA">Observação Controladoria</option>
                  <option value="COBRANCA_RECEBIVEL">Cobrança / Recebível</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Criticidade</label>
                <select
                  value={newPendencySeverity}
                  onChange={(e) =>
                    setNewPendencySeverity(
                      e.target.value as ClientPendencyObservation['severity']
                    )
                  }
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md bg-white"
                >
                  <option value="Alta">Alta</option>
                  <option value="Média">Média</option>
                  <option value="Baixa">Baixa</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Título da Pendência / Observação *
              </label>
              <input
                type="text"
                required
                value={newPendencyTitle}
                onChange={(e) => setNewPendencyTitle(e.target.value)}
                placeholder="Ex.: Enviar comprovante de pagamento FGTS / NF-4920"
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Prazo Limite p/ Regularização
              </label>
              <input
                type="date"
                value={newPendencyDueDate}
                onChange={(e) => setNewPendencyDueDate(e.target.value)}
                className="w-full px-3 py-1.5 font-mono border border-slate-300 rounded-md"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Observações Detalhadas para o Cliente *
              </label>
              <textarea
                rows={3}
                required
                value={newPendencyDetails}
                onChange={(e) => setNewPendencyDetails(e.target.value)}
                placeholder="Descreva o documento necessário ou a observação técnica da controladoria..."
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-[#0052CC] hover:bg-blue-700 text-white font-semibold rounded-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Registrar Pendência / Observação
            </button>
          </form>
        </div>
      )}

      {/* ====================================================================
          10. GRÁFICOS INTERATIVOS E VISUALIZAÇÃO DE DADOS (RECHARTS)
         ==================================================================== */}
      {(activeReportType === 'VISAO_GERAL' || activeReportType === 'FLUXO_CAIXA') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart A: Evolução Temporal de Receitas vs Despesas */}
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Evolução Temporal de Fluxo Financeiro ({effectiveDateRange.label})
                </h3>
                <p className="text-xs text-slate-500">
                  Comparativo diário/mensal de Receitas Operacionais vs. Despesas BPO
                </p>
              </div>
              <span className="text-xs font-mono text-slate-500 tabular-nums">
                {temporalChartData.length} ponto(s) no período
              </span>
            </div>

            {temporalChartData.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                <Calendar className="w-8 h-8 text-slate-400 mb-2" />
                <div className="text-xs font-semibold text-slate-800">
                  Nenhum lançamento encontrado para os filtros selecionados
                </div>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Amplie o período de datas (ex.: "Últimos 3 Meses") ou limpe os filtros ativos.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-3 px-3 py-1.5 bg-[#0052CC] text-white text-xs font-semibold rounded-md cursor-pointer"
                >
                  Restaurar Período Padrão
                </button>
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={temporalChartData}
                    margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0D9488" stopOpacity={0.28} />
                        <stop offset="95%" stopColor="#0D9488" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0052CC" stopOpacity={0.24} />
                        <stop offset="95%" stopColor="#0052CC" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: '#475569' }}
                      axisLine={{ stroke: '#CBD5E1' }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#475569' }}
                      axisLine={false}
                      tickFormatter={(v) => `R$ ${(Number(v) / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderColor: '#1E293B',
                        borderRadius: '8px',
                        color: '#F8FAFC',
                        fontSize: '12px',
                      }}
                      formatter={(value: unknown, name: unknown) => [
                        formatBrl(Number(value || 0)),
                        String(name) === 'receitas'
                          ? 'Receitas (Entradas)'
                          : 'Despesas (Saídas)',
                      ]}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
                      formatter={(val) =>
                        val === 'receitas' ? 'Receitas (R$)' : 'Despesas (R$)'
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="receitas"
                      stroke="#0D9488"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorReceitas)"
                    />
                    <Area
                      type="monotone"
                      dataKey="despesas"
                      stroke="#0052CC"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorDespesas)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Chart B: Rentabilidade por Empresa Cliente (Fee vs Custo Operacional vs Lucro) */}
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Rentabilidade por Empresa Cliente (Fee BPO vs. Custo Operacional)
                </h3>
                <p className="text-xs text-slate-500">
                  Análise de margem de contribuição por contrato ativo na carteira VN Soluções
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateModule('clients')}
                className="text-xs font-semibold text-[#0052CC] hover:underline no-print cursor-pointer"
              >
                Gerir Clientes →
              </button>
            </div>

            {clientProfitabilityData.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                <Building2 className="w-8 h-8 text-slate-400 mb-2" />
                <div className="text-xs font-semibold text-slate-800">
                  Nenhum cliente correspondente ao filtro de responsável
                </div>
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={clientProfitabilityData}
                    margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#475569' }}
                      axisLine={{ stroke: '#CBD5E1' }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#475569' }}
                      axisLine={false}
                      tickFormatter={(v) => `R$ ${(Number(v) / 1000).toFixed(1)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderColor: '#1E293B',
                        borderRadius: '8px',
                        color: '#F8FAFC',
                        fontSize: '12px',
                      }}
                      formatter={(value: unknown, name: unknown) => [
                        formatBrl(Number(value || 0)),
                        String(name) === 'honorario'
                          ? 'Fee Mensal BPO'
                          : String(name) === 'custo'
                          ? 'Custo Operacional'
                          : 'Lucro Líquido BPO',
                      ]}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
                      formatter={(val) =>
                        val === 'honorario'
                          ? 'Honorário Mensal'
                          : val === 'custo'
                          ? 'Custo Operacional'
                          : 'Margem Líquida'
                      }
                    />
                    <Bar dataKey="honorario" fill="#0052CC" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="custo" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="lucro" fill="#0D9488" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Chart C: Composição por Categoria Financeira (Donut Chart) */}
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Composição Financeira por Categoria do Plano de Contas
                </h3>
                <p className="text-xs text-slate-500">
                  Distribuição percentual e volume financeiro movimentado no período
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleSelectReportType('PLANO_DE_CONTAS')}
                className="text-xs font-semibold text-[#0052CC] hover:underline no-print cursor-pointer"
              >
                Plano de Contas →
              </button>
            </div>

            {categoryCompositionData.length === 0 ? (
              <div className="h-56 flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                <div className="text-xs font-semibold text-slate-700">
                  Sem categorias no período filtrado
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryCompositionData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={52}
                        outerRadius={82}
                        paddingAngle={3}
                      >
                        {categoryCompositionData.map((_entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_PALETTE[index % CHART_PALETTE.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          borderColor: '#1E293B',
                          borderRadius: '8px',
                          color: '#F8FAFC',
                          fontSize: '12px',
                        }}
                        formatter={(value: unknown) => [formatBrl(Number(value || 0)), 'Volume']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2 text-xs">
                  {categoryCompositionData.map((item, idx) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="w-2.5 h-2.5 rounded-xs shrink-0"
                          style={{
                            backgroundColor: CHART_PALETTE[idx % CHART_PALETTE.length],
                          }}
                        />
                        <span className="text-slate-700 font-medium truncate">{item.name}</span>
                      </div>
                      <div className="font-mono text-slate-900 font-semibold tabular-nums shrink-0">
                        {formatBrl(item.value)}{' '}
                        <span className="text-slate-400 font-normal">({item.pct}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Chart D: Status de Chamados em Tempo Real (VN Service Desk) & Filas */}
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Status de Chamados em Tempo Real (VN Service Desk)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Monitoramento de protocolos manuais, automáticos (Seção 13) e Portal do Cliente
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateModule('service_desk')}
                  className="text-xs font-semibold text-[#0052CC] hover:underline no-print cursor-pointer"
                >
                  Abrir Service Desk →
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2.5 mb-4">
                {ticketStatusStats.map((st) => (
                  <div
                    key={st.status}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-center"
                  >
                    <div className="text-xs text-slate-500">{st.status}</div>
                    <div className="text-lg font-bold text-slate-900 tabular-nums mt-0.5">
                      {st.count}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 tabular-nums">
                      {st.pct}% da fila
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                {scopedTickets.slice(0, 3).map((t) => (
                  <div
                    key={t.id}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="font-mono text-[11px] text-slate-500 truncate">
                        <strong className="text-slate-800">{t.protocolNumber}</strong> ·{' '}
                        {t.severity} · {t.clientName}
                      </div>
                      <div className="font-semibold text-slate-900 truncate mt-0.5">
                        {t.title}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-semibold text-slate-800">{t.status}</div>
                      <div className="font-mono text-[10px] text-slate-500">{t.slaDueAt}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          11. TABELA ANALÍTICA DE LANÇAMENTOS (CONTAS A PAGAR & RECEBER / CRUD)
         ==================================================================== */}
      {(activeReportType === 'VISAO_GERAL' ||
        activeReportType === 'PAGAR_RECEBER' ||
        activeReportType === 'FICHA_FINANCEIRA') && (
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Relatório Analítico de Contas a Pagar & Contas a Receber ({sortedEntries.length} registros)
              </h3>
              <p className="text-xs text-slate-500">
                Clique nos cabeçalhos para ordenar por coluna, filtre por tipo ou edite/exclua qualquer lançamento diretamente
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs no-print">
              {/* Type Filter Segmented Control */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg">
                {(['TODOS', 'RECEBER', 'PAGAR'] as const).map((tp) => (
                  <button
                    key={tp}
                    type="button"
                    onClick={() => setTypeFilter(tp)}
                    className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                      typeFilter === tp
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tp === 'TODOS'
                      ? 'Todos'
                      : tp === 'RECEBER'
                      ? 'Contas a Receber'
                      : 'Contas a Pagar'}
                  </button>
                ))}
              </div>

              {/* Search Input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar favorecido, NF, código..."
                  className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg bg-white w-56"
                />
              </div>
            </div>
          </div>

          {sortedEntries.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <FileSpreadsheet className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-sm font-semibold text-slate-800">
                Nenhum lançamento encontrado neste recorte de filtros
              </div>
              <p className="text-xs text-slate-500">
                Experimente limpar os filtros de período/categoria ou adicionar um novo lançamento.
              </p>
              <div className="pt-2 flex items-center justify-center gap-2 no-print">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-3 py-1.5 border border-slate-300 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Limpar Filtros
                </button>
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(true)}
                  className="px-3.5 py-1.5 bg-[#0052CC] text-white rounded-md text-xs font-semibold cursor-pointer"
                >
                  + Novo Lançamento
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleSort('code')}
                        className="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer"
                      >
                        Código / Doc <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleSort('dueDate')}
                        className="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer"
                      >
                        Vencimento <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleSort('clientName')}
                        className="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer"
                      >
                        Empresa Cliente <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleSort('counterpartyName')}
                        className="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer"
                      >
                        Favorecido / Pagador <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleSort('category')}
                        className="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer"
                      >
                        Plano de Contas / C. Custo <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleSort('createdByName')}
                        className="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer"
                      >
                        Responsável <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleSort('status')}
                        className="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer"
                      >
                        Status <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleToggleSort('amount')}
                        className="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer"
                      >
                        Valor (R$) <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-3 px-4 text-right no-print">Ações (Editar / Excluir)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {sortedEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50/90">
                      <td className="py-3 px-4 font-mono">
                        <div className="font-semibold text-slate-900">{entry.code}</div>
                        <div className="text-[11px] text-slate-500">
                          {entry.type} · {entry.documentNumber}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-800 tabular-nums">
                        {formatDateBr(entry.dueDate)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {entry.clientName}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900">{entry.counterpartyName}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">
                          {entry.description}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        <div className="font-medium">{entry.category}</div>
                        <div className="text-[11px] text-slate-500">{entry.costCenter}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">{entry.createdByName}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-semibold ${
                            entry.status === 'Conciliado' || entry.status === 'Aprovado'
                              ? 'text-emerald-700'
                              : entry.status === 'Em análise'
                              ? 'text-red-700'
                              : 'text-amber-700'
                          }`}
                        >
                          {entry.status}
                        </span>
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-mono font-bold tabular-nums ${
                          entry.type === 'RECEBER' ? 'text-emerald-700' : 'text-slate-900'
                        }`}
                      >
                        {entry.type === 'RECEBER' ? '+' : '-'} {formatBrl(entry.amount)}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap no-print">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(entry)}
                          className="px-2.5 py-1 border border-slate-300 hover:bg-blue-50 hover:text-[#0052CC] hover:border-blue-300 rounded text-xs font-medium text-slate-700 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeletingTarget(entry);
                            setDeleteReason(
                              `Exclusão operacional do lançamento ${entry.code} autorizada.`
                            );
                          }}
                          className="px-2.5 py-1 border border-red-200 bg-red-50/60 hover:bg-red-100 text-red-700 rounded text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-900 text-white font-mono text-xs">
                    <td colSpan={4} className="py-3.5 px-4 font-sans font-semibold">
                      TOTAIS CONSOLIDADOS DO PERÍODO ({sortedEntries.length} lançamentos filtrados)
                    </td>
                    <td colSpan={2} className="py-3.5 px-4 text-right tabular-nums">
                      Entradas:{' '}
                      <strong className="text-emerald-400">
                        {formatBrl(kpiMetrics.totalReceivables)}
                      </strong>{' '}
                      · Saídas:{' '}
                      <strong className="text-amber-300">
                        {formatBrl(kpiMetrics.totalPayables)}
                      </strong>
                    </td>
                    <td className="py-3.5 px-4 text-right font-sans font-semibold">
                      Saldo Líquido:
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-sm tabular-nums text-emerald-400">
                      {formatBrl(kpiMetrics.netCashResult)}
                    </td>
                    <td className="py-3.5 px-4 no-print" />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Print-Only Signature Block for Executive Co-Branded Reports */}
      <div className="hidden print-only pt-8 mt-8 border-t border-slate-300 text-xs text-slate-700">
        <div className="grid grid-cols-2 gap-12 pt-8">
          <div className="border-t border-slate-400 pt-2 text-center">
            <strong>VN Soluções — BPO Financeiro & Controladoria</strong>
            <div>Paulo Victor — Diretor de Operações VN</div>
          </div>
          <div className="border-t border-slate-400 pt-2 text-center">
            <strong>
              {activeClientObj
                ? activeClientObj.name
                : 'Representante Legal — Empresa Cliente BPO'}
            </strong>
            <div>Aprovação e Homologação do Demonstrativo</div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          MODAL 1: EDITAR LANÇAMENTO FINANCEIRO
         ==================================================================== */}
      {editingEntry && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 no-print">
          <form
            onSubmit={handleSubmitEditModal}
            className="bg-white border border-slate-200 rounded-xl max-w-xl w-full p-6 space-y-4 shadow-xl text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Editar Lançamento Financeiro — {editingEntry.code} ({editingEntry.clientName})
                </h3>
                <p className="text-slate-500 mt-0.5">
                  Recalcula automaticamente a conciliação bancária vinculada e grava evento em audit_logs
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingEntry(null)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tipo *</label>
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value as 'PAGAR' | 'RECEBER')}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white"
                >
                  <option value="PAGAR">PAGAR (Saída / Despesa)</option>
                  <option value="RECEBER">RECEBER (Entrada / Receita)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Valor (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="w-full px-3 py-1.5 font-mono border border-slate-300 rounded-md"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Favorecido / Cliente Pagador *
                </label>
                <input
                  type="text"
                  required
                  value={editCounterparty}
                  onChange={(e) => setEditCounterparty(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Data de Vencimento *
                </label>
                <input
                  type="date"
                  required
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="w-full px-3 py-1.5 font-mono border border-slate-300 rounded-md"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Documento Fiscal / NF
                </label>
                <input
                  type="text"
                  value={editDocNumber}
                  onChange={(e) => setEditDocNumber(e.target.value)}
                  className="w-full px-3 py-1.5 font-mono border border-slate-300 rounded-md"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Categoria / Conta Contábil
                </label>
                <input
                  type="text"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white"
                >
                  <option value="Aguardando aprovação">Aguardando aprovação</option>
                  <option value="Pendente">Pendente</option>
                  <option value="Aprovado">Aprovado</option>
                  <option value="Conciliado">Conciliado</option>
                  <option value="Em análise">Em análise</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Descrição Operacional
                </label>
                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Justificativa de Auditoria *
                </label>
                <input
                  type="text"
                  required
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEditingEntry(null)}
                className="px-3.5 py-1.5 border border-slate-300 rounded-md text-slate-700 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submittingCrud}
                className="px-4 py-1.5 bg-[#0052CC] hover:bg-blue-700 text-white font-semibold rounded-md cursor-pointer"
              >
                {submittingCrud ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ====================================================================
          MODAL 2: EXCLUIR LANÇAMENTO FINANCEIRO
         ==================================================================== */}
      {deletingTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 no-print">
          <form
            onSubmit={handleConfirmDelete}
            className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-red-700">
                Confirmar Exclusão Auditada — {deletingTarget.code}
              </h3>
              <button
                type="button"
                onClick={() => setDeletingTarget(null)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-600">
              Você está prestes a excluir o lançamento{' '}
              <strong>
                {deletingTarget.code} ({deletingTarget.counterpartyName})
              </strong>{' '}
              no valor de <strong>{formatBrl(deletingTarget.amount)}</strong>. Esta operação será
              registrada na trilha de auditoria imutável.
            </p>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Motivo da Exclusão *
              </label>
              <input
                type="text"
                required
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingTarget(null)}
                className="px-3.5 py-1.5 border border-slate-300 rounded-md text-slate-700 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submittingCrud}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md cursor-pointer"
              >
                {submittingCrud ? 'Excluindo...' : 'Confirmar Exclusão'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ====================================================================
          MODAL 3: NOVO LANÇAMENTO FINANCEIRO RÁPIDO
         ==================================================================== */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 no-print">
          <form
            onSubmit={handleSubmitCreateModal}
            className="bg-white border border-slate-200 rounded-xl max-w-xl w-full p-6 space-y-4 shadow-xl text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Novo Lançamento Financeiro (Vinculado ao Plano de Contas do Cliente)
              </h3>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Empresa Cliente *
                </label>
                <select
                  value={newClientId}
                  onChange={(e) => setNewClientId(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} · {c.tradeName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Natureza do Lançamento *
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as 'PAGAR' | 'RECEBER')}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white"
                >
                  <option value="PAGAR">PAGAR (Despesa / Saída)</option>
                  <option value="RECEBER">RECEBER (Receita / Entrada)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Favorecido / Cliente Pagador *
                </label>
                <input
                  type="text"
                  required
                  value={newCounterparty}
                  onChange={(e) => setNewCounterparty(e.target.value)}
                  placeholder="Ex.: Fornecedor Cloud Datacenter S.A."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Valor (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="2450.00"
                  className="w-full px-3 py-1.5 font-mono border border-slate-300 rounded-md"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Data de Vencimento *
                </label>
                <input
                  type="date"
                  required
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full px-3 py-1.5 font-mono border border-slate-300 rounded-md"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Conta / Categoria do Plano de Contas
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white"
                >
                  {availableCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Documento Fiscal / NF
                </label>
                <input
                  type="text"
                  value={newDocNumber}
                  onChange={(e) => setNewDocNumber(e.target.value)}
                  className="w-full px-3 py-1.5 font-mono border border-slate-300 rounded-md"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Descrição Operacional
                </label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Descrição para trilha de auditoria e DRE"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="px-3.5 py-1.5 border border-slate-300 rounded-md text-slate-700 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submittingCrud}
                className="px-4 py-1.5 bg-[#0052CC] hover:bg-blue-700 text-white font-semibold rounded-md cursor-pointer"
              >
                {submittingCrud ? 'Registrando...' : 'Confirmar e Persistir no ERP'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
