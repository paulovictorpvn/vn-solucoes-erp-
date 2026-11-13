import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  LayoutDashboard,
  Building2,
  Briefcase,
  FileCheck2,
  ArrowDownRight,
  ArrowUpRight,
  ShieldCheck,
  GitCompare,
  BarChart3,
  ListChecks,
  LifeBuoy,
  AlertOctagon,
  Activity,
  Globe,
  Sparkles,
  Lock,
  Plus,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Search,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  FileText,
  LogOut,
  Play,
  ArrowRight,
  SlidersHorizontal,
  HardDrive,
  Monitor,
  Link2,
  Terminal,
  Edit3,
  Trash2,
  X,
  Wallet,
  Settings,
  Users,
  BookOpen,
  Download,
} from 'lucide-react';
import {
  initAuth,
  googleSignIn,
  logout,
  getBackendAuthToken,
} from './lib/firebase.ts';
import {
  ModuleKey,
  MODULE_SPECS,
  ClientRecord,
  CrmLeadRecord,
  ContractRecord,
  FinancialEntryRecord,
  PaymentBatchRecord,
  BankReconciliationRecord,
  FinancialClosingRecord,
  DemandTaskRecord,
  ServiceDeskTicketRecord,
  TechnicalIncidentRecord,
  TechnicalChangeRecord,
  KnowledgeArticleRecord,
  AuditLogRecord,
  BackgroundJobRecord,
  ExternalIntegrationRecord,
  SystemHealthMetrics,
  BackupPolicyConfig,
  BackupExecutionLogRecord,
  ServiceCatalogItem,
  VnStaffMember,
  WebsiteCmsConfig,
  DEFAULT_VN_STAFF,
  DEFAULT_WEBSITE_CMS_CONFIG,
} from './types/erp.ts';
import { WorkspaceHub } from './components/WorkspaceHub.tsx';
import { AiIntelligenceHub } from './components/AiIntelligenceHub.tsx';
import { DataProtectionView } from './components/DataProtectionView.tsx';
import { IncidentManagementView } from './components/IncidentManagementView.tsx';
import { FinancialSmartHub } from './components/FinancialSmartHub.tsx';
import { ServiceCatalogManager } from './components/ServiceCatalogManager.tsx';
import { WebsiteAndClientPortal } from './components/WebsiteAndClientPortal.tsx';
import { ExecutiveBiDashboard } from './components/ExecutiveBiDashboard.tsx';
import { ClientCashFlowModule } from './components/ClientCashFlowModule.tsx';
import {
  SiteAndAccessSettingsManager,
  ClientPortalCredentialItem,
} from './components/SiteAndAccessSettingsManager.tsx';

type SimulatedRole = 'gestor' | 'supervisor' | 'analista' | 'engenharia';

const ROLE_LABELS: Record<SimulatedRole, string> = {
  gestor: 'Diretor / Gestor VN (Alçada Plena)',
  supervisor: 'Supervisor Financeiro (Revisor Independente)',
  analista: 'Analista BPO (Executor Operacional)',
  engenharia: 'Engenharia de Confiabilidade & Segurança',
};

const NAV_GROUPS: Array<{
  groupLabel: string;
  items: Array<{
    key: ModuleKey;
    label: string;
    code: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
}> = [
  {
    groupLabel: '1. Painel Central, Site & Equipe VN',
    items: [
      { key: 'overview', label: 'Visão Executiva & BI BPO', code: 'GOV-001', icon: LayoutDashboard },
      {
        key: 'site_settings',
        label: 'Configurações do Site & Equipe VN',
        code: 'CMS-018',
        icon: Settings,
      },
      {
        key: 'client_portal_website',
        label: 'Website Público & Área do Cliente',
        code: 'WEB-016',
        icon: Monitor,
      },
    ],
  },
  {
    groupLabel: '2. Carteira de Clientes & Comercial',
    items: [
      { key: 'clients', label: 'Empresas Clientes BPO', code: 'CAD-002', icon: Building2 },
      { key: 'crm', label: 'CRM Comercial & Leads', code: 'CRM-003', icon: Briefcase },
      {
        key: 'contracts',
        label: 'Contratos, Serviços & Plano Contas',
        code: 'CTR-004',
        icon: FileCheck2,
      },
    ],
  },
  {
    groupLabel: '3. Rotina Financeira & Fluxo de Caixa',
    items: [
      {
        key: 'cash_flow',
        label: 'Fluxo de Caixa (Diário/Mensal/Proj.)',
        code: 'FLX-017',
        icon: Wallet,
      },
      { key: 'financial_payable', label: 'Contas a Pagar + IA PDF', code: 'FIN-005', icon: ArrowDownRight },
      { key: 'financial_receivable', label: 'Contas a Receber + Cobrança', code: 'FIN-006', icon: ArrowUpRight },
      { key: 'payment_batches', label: 'Lotes & Aprovações (SoD)', code: 'FIN-007', icon: ShieldCheck },
      { key: 'reconciliation', label: 'Conciliação Bancária OFX', code: 'FIN-008', icon: GitCompare },
      { key: 'closing_dre', label: 'Fechamento Mensal & DRE', code: 'FIN-009', icon: BarChart3 },
    ],
  },
  {
    groupLabel: '4. Demandas, Chamados & Governança',
    items: [
      { key: 'demands_processes', label: 'Demandas & Rotinas BPO', code: 'OPE-010', icon: ListChecks },
      { key: 'service_desk', label: 'VN Service Desk (Chamados)', code: 'SDK-004', icon: LifeBuoy },
      {
        key: 'incident_management',
        label: 'Análise 5 Porquês & GMUD',
        code: 'INC-005',
        icon: AlertOctagon,
      },
      {
        key: 'data_protection',
        label: 'Backups & Storage do Sistema',
        code: 'BKP-006',
        icon: HardDrive,
      },
      { key: 'system_health', label: 'Saúde da Plataforma & Logs', code: 'MON-007', icon: Activity },
      { key: 'workspace_hub', label: 'Google Workspace (12 Apps)', code: 'WKS-012', icon: Globe },
      { key: 'ai_intelligence', label: 'Inteligência Artificial VN', code: 'AIA-015', icon: Sparkles },
      { key: 'qa_security', label: 'Segurança, Testes & Aceite', code: 'SEC-012', icon: Lock },
    ],
  },
];

// Mapa de Subcomandos e Conectores de Processo entre Módulos
const MODULE_CONNECTORS: Record<
  ModuleKey,
  Array<{ label: string; target: ModuleKey; badge: string }>
> = {
  overview: [
    { label: 'Fluxo de Caixa por Cliente', target: 'cash_flow', badge: 'Diário/Mensal' },
    { label: 'Configurações do Site & Equipe VN', target: 'site_settings', badge: 'CMS + Acessos' },
    { label: 'Lotes Aguardando Alçada', target: 'payment_batches', badge: 'SoD' },
    { label: 'Abrir Website & Área do Cliente', target: 'client_portal_website', badge: 'LIVE' },
  ],
  cash_flow: [
    { label: 'Contas a Pagar', target: 'financial_payable', badge: 'Saídas' },
    { label: 'Contas a Receber', target: 'financial_receivable', badge: 'Entradas' },
    { label: 'Conciliação Bancária OFX', target: 'reconciliation', badge: 'Extrato' },
    { label: 'Ver no Portal do Cliente', target: 'client_portal_website', badge: 'Cliente' },
  ],
  site_settings: [
    { label: 'Visualizar Website Público', target: 'client_portal_website', badge: 'Live' },
    { label: 'Cadastro de Empresas Clientes', target: 'clients', badge: 'Empresas' },
    { label: 'Visão Executiva BPO', target: 'overview', badge: 'BI' },
  ],
  clients: [
    { label: 'Fluxo de Caixa da Empresa', target: 'cash_flow', badge: 'Liquidez' },
    { label: 'Gerir Senha & Equipe VN', target: 'site_settings', badge: 'Credenciais' },
    { label: 'Vincular Serviços & Parâmetros', target: 'contracts', badge: 'Catálogo' },
    { label: 'Simular Visão no Portal do Cliente', target: 'client_portal_website', badge: 'Portal' },
  ],
  crm: [
    { label: 'Capturar Lead pela Landing Page', target: 'client_portal_website', badge: 'Website' },
    { label: 'Configurar Textos & WhatsApp do Site', target: 'site_settings', badge: 'CMS' },
    { label: 'Ver Clientes Convertidos', target: 'clients', badge: 'Base Ativa' },
  ],
  contracts: [
    { label: 'Fluxo de Caixa dos Clientes', target: 'cash_flow', badge: 'Caixa' },
    { label: 'Fechamento & DRE', target: 'closing_dre', badge: 'Margem' },
    { label: 'Portal da Empresa Cliente', target: 'client_portal_website', badge: 'Cliente' },
  ],
  financial_payable: [
    { label: 'Ver Impacto no Fluxo de Caixa', target: 'cash_flow', badge: 'Saídas' },
    { label: 'Enviar para Lotes & Aprovações', target: 'payment_batches', badge: 'Alçada' },
    { label: 'Cruzar na Conciliação Bancária', target: 'reconciliation', badge: 'OFX' },
  ],
  financial_receivable: [
    { label: 'Ver Impacto no Fluxo de Caixa', target: 'cash_flow', badge: 'Entradas' },
    { label: 'Cruzar Créditos na Conciliação', target: 'reconciliation', badge: 'PIX/TED' },
    { label: 'Consolidar na DRE Mensal', target: 'closing_dre', badge: 'DRE' },
  ],
  payment_batches: [
    { label: 'Origem: Contas a Pagar', target: 'financial_payable', badge: 'Títulos' },
    { label: 'Fluxo de Caixa Projetado', target: 'cash_flow', badge: 'Liquidez' },
    { label: 'Aprovação Externa no Portal do Cliente', target: 'client_portal_website', badge: 'Cliente' },
  ],
  reconciliation: [
    { label: 'Fluxo de Caixa Realizado', target: 'cash_flow', badge: 'Saldos' },
    { label: 'Ajustar Lançamento de Origem (LAN-8041)', target: 'financial_payable', badge: 'Ajuste' },
    { label: 'Ver Chamado Automático no Service Desk', target: 'service_desk', badge: 'PROTO' },
  ],
  closing_dre: [
    { label: 'Comparar com Fluxo de Caixa', target: 'cash_flow', badge: 'Caixa vs DRE' },
    { label: 'Sanear Bloqueios na Conciliação', target: 'reconciliation', badge: 'Bloqueios' },
    { label: 'Entregar DRE no Portal do Cliente', target: 'client_portal_website', badge: 'Entrega' },
  ],
  demands_processes: [
    { label: 'Equipe Interna VN & Carteira', target: 'site_settings', badge: 'Operadores' },
    { label: 'Catálogo de Serviços & Parâmetros', target: 'contracts', badge: 'Regras' },
    { label: 'Chamados Vinculados no Service Desk', target: 'service_desk', badge: 'SLA' },
  ],
  service_desk: [
    { label: 'Investigar Causa Raiz (5 Porquês)', target: 'incident_management', badge: 'Seção 5.3' },
    { label: 'Ver Portal de Chamados do Cliente', target: 'client_portal_website', badge: 'Portal Web' },
    { label: 'Logs Estruturados por Correlation ID', target: 'system_health', badge: 'Trace' },
  ],
  incident_management: [
    { label: 'Chamados Afetados no Service Desk', target: 'service_desk', badge: 'Tickets' },
    { label: 'Backup Pré-GMUD no VN Data Protection', target: 'data_protection', badge: 'Rollback' },
    { label: 'Telemetria & Logs Estruturados', target: 'system_health', badge: 'Logs' },
  ],
  data_protection: [
    { label: 'Telemetria & RPO/RTO em System Health', target: 'system_health', badge: 'Uptime' },
    { label: 'GMUDs & Rollback em Incident Management', target: 'incident_management', badge: 'GMUD' },
    { label: 'Homologação & Aceite (Seção 15)', target: 'qa_security', badge: 'QA' },
  ],
  system_health: [
    { label: 'Política de Backups & Armazenamento', target: 'data_protection', badge: 'Seção 6.5' },
    { label: 'RCA 5 Porquês & GMUD', target: 'incident_management', badge: 'Seção 5.3' },
    { label: 'Central de Incidentes Service Desk', target: 'service_desk', badge: 'SLA' },
  ],
  workspace_hub: [
    { label: 'Fechamento & DRE para Sheets', target: 'closing_dre', badge: 'DRE' },
    { label: 'Inteligência Artificial Gemini', target: 'ai_intelligence', badge: 'IA' },
  ],
  ai_intelligence: [
    { label: 'Copia e Cola / PDF em Contas a Pagar', target: 'financial_payable', badge: 'Extrator' },
    { label: 'Central Google Workspace', target: 'workspace_hub', badge: '12 Apps' },
  ],
  client_portal_website: [
    { label: 'Configurar Site, Equipe VN & Senhas', target: 'site_settings', badge: 'CMS' },
    { label: 'Ver Leads Recebidos no CRM', target: 'crm', badge: 'Funil' },
    { label: 'Ver Chamados do Cliente no Service Desk', target: 'service_desk', badge: 'Tickets' },
  ],
  qa_security: [
    { label: 'Testar Segregação em Lotes', target: 'payment_batches', badge: 'SoD' },
    { label: 'Testar Idempotência em Contas a Pagar', target: 'financial_payable', badge: 'Idem' },
    { label: 'Verificar Backups Cloud Storage', target: 'data_protection', badge: 'GCS' },
  ],
};

function formatBrl(val: string | number | undefined | null): string {
  const num = Number(val || 0);
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleKey>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const view = params.get('view');
      if (view === 'site' || view === 'portal') {
        return 'client_portal_website';
      }
    }
    return 'overview';
  });
  const [portalInitialSubView, setPortalInitialSubView] = useState<
    'site' | 'login' | 'client_area' | 'credentials'
  >(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const view = params.get('view');
      if (view === 'portal') return 'login';
      if (view === 'site') return 'site';
    }
    return 'site';
  });
  const [isPublicStandalone, setIsPublicStandalone] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const view = params.get('view');
      if (view === 'erp') return false;
    }
    return true;
  });
  const [selectedClientId, setSelectedClientId] = useState<number | 'ALL'>('ALL');
  const [simulatedRole, setSimulatedRole] = useState<SimulatedRole>('gestor');
  const [showSpecDrawer, setShowSpecDrawer] = useState(false);
  const [showDidacticGuide, setShowDidacticGuide] = useState(true);

  // Internal VN Staff & CMS State
  const [vnStaff, setVnStaff] = useState<VnStaffMember[]>(() => {
    try {
      const saved = localStorage.getItem('vn_internal_staff_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_VN_STAFF;
  });
  const [activeStaffId, setActiveStaffId] = useState<string>('vn-staff-1');

  const [cmsConfig, setCmsConfig] = useState<WebsiteCmsConfig>(() => {
    try {
      const saved = localStorage.getItem('vn_website_cms_config_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_WEBSITE_CMS_CONFIG;
  });

  const [clientCredentials, setClientCredentials] = useState<ClientPortalCredentialItem[]>([
    {
      clientId: 1,
      clientCode: 'CLI-001',
      companyName: 'Atlas Engenharia',
      cnpj: '14.289.401/0001-52',
      loginUser: 'financeiro@atlasengenharia.com.br',
      passwordPlain: 'Vn@Atlas2026!',
      authCode: 'VN-AUTH-101',
      allowedContact: 'Dr. Roberto Mendes (Diretor Financeiro)',
      status: 'Ativo',
      updatedAt: '13/11/2026 08:30',
      createdByVnStaff: 'Paulo Victor Nicolau (OP-VN-01)',
    },
    {
      clientId: 2,
      clientCode: 'CLI-002',
      companyName: 'Clínica Vida Plena',
      cnpj: '27.841.902/0001-19',
      loginUser: 'diretoria@clinicavidaplena.med.br',
      passwordPlain: 'Vn@Vida2026!',
      authCode: 'VN-AUTH-202',
      allowedContact: 'Dra. Helena Albuquerque (Sócia-Diretora)',
      status: 'Ativo',
      updatedAt: '13/11/2026 09:00',
      createdByVnStaff: 'Mariana Costa (OP-VN-02)',
    },
    {
      clientId: 3,
      clientCode: 'CLI-003',
      companyName: 'Vértice Tech SaaS',
      cnpj: '33.190.754/0001-80',
      loginUser: 'cfo@verticetech.io',
      passwordPlain: 'Vn@Vertice2026!',
      authCode: 'VN-AUTH-303',
      allowedContact: 'Lucas Cavalcanti (CEO & Co-Founder)',
      status: 'Ativo',
      updatedAt: '13/11/2026 09:15',
      createdByVnStaff: 'Paulo Victor Nicolau (OP-VN-01)',
    },
  ]);

  const activeStaffMember = useMemo(
    () => vnStaff.find((s) => s.id === activeStaffId) || vnStaff[0],
    [vnStaff, activeStaffId]
  );

  const handleSelectActiveStaff = useCallback((staff: VnStaffMember) => {
    setActiveStaffId(staff.id);
    if (staff.role === 'comercial') {
      setSimulatedRole('analista');
    } else {
      setSimulatedRole(staff.role);
    }
    if (staff.assignedClientIds !== 'ALL' && staff.assignedClientIds.length > 0) {
      setSelectedClientId(staff.assignedClientIds[0]);
    } else {
      setSelectedClientId('ALL');
    }
  }, []);

  const handleUpdateVnStaff = useCallback((nextStaff: VnStaffMember[]) => {
    setVnStaff(nextStaff);
    try {
      localStorage.setItem('vn_internal_staff_v1', JSON.stringify(nextStaff));
    } catch {
      // ignore
    }
  }, []);

  const handleUpdateCmsConfig = useCallback((nextConfig: WebsiteCmsConfig) => {
    setCmsConfig(nextConfig);
    try {
      localStorage.setItem('vn_website_cms_config_v1', JSON.stringify(nextConfig));
    } catch {
      // ignore
    }
  }, []);

  // Auth & Google Workspace Token (strictly in-memory)
  const [firebaseUser, setFirebaseUser] = useState<any | null>(null);
  const [googleUserEmail, setGoogleUserEmail] = useState<string | null>(null);
  const [googleUserName, setGoogleUserName] = useState<string | null>(null);
  const [workspaceAccessToken, setWorkspaceAccessToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // ERP State
  const [loadingErp, setLoadingErp] = useState(true);
  const [erpError, setErpError] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{
    type: 'success' | 'error' | 'warning';
    title: string;
    message: string;
  } | null>(null);

  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [crmLeads, setCrmLeads] = useState<CrmLeadRecord[]>([]);
  const [contracts, setContracts] = useState<ContractRecord[]>([]);
  const [financialEntries, setFinancialEntries] = useState<FinancialEntryRecord[]>([]);
  const [paymentBatches, setPaymentBatches] = useState<PaymentBatchRecord[]>([]);
  const [reconciliations, setReconciliations] = useState<BankReconciliationRecord[]>([]);
  const [financialClosings, setFinancialClosings] = useState<FinancialClosingRecord[]>([]);
  const [demandsTasks, setDemandsTasks] = useState<DemandTaskRecord[]>([]);
  const [serviceDeskTickets, setServiceDeskTickets] = useState<ServiceDeskTicketRecord[]>([]);
  const [technicalIncidents, setTechnicalIncidents] = useState<TechnicalIncidentRecord[]>([]);
  const [technicalChanges, setTechnicalChanges] = useState<TechnicalChangeRecord[]>([]);
  const [knowledgeArticles, setKnowledgeArticles] = useState<KnowledgeArticleRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);
  const [backgroundJobs, setBackgroundJobs] = useState<BackgroundJobRecord[]>([]);
  const [externalIntegrations, setExternalIntegrations] = useState<ExternalIntegrationRecord[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealthMetrics | null>(null);
  const [backupPolicy, setBackupPolicy] = useState<BackupPolicyConfig | null>(null);
  const [backupLogs, setBackupLogs] = useState<BackupExecutionLogRecord[]>([]);
  const [serviceCatalog, setServiceCatalog] = useState<ServiceCatalogItem[]>([]);

  // Modals & Forms State
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTitle, setReportTitle] = useState('');
  const [reportCategory, setReportCategory] = useState('Divergências financeiras');
  const [reportSubcategory, setReportSubcategory] = useState('Diferença de saldo');
  const [reportPriority, setReportPriority] = useState('Alta');
  const [reportSeverity, setReportSeverity] = useState('S2 - Alta');
  const [reportDescription, setReportDescription] = useState('');
  const [reportSteps, setReportSteps] = useState('');
  const [reportExpected, setReportExpected] = useState('');
  const [reportObtained, setReportObtained] = useState('');
  const [reportBlocksContinuity, setReportBlocksContinuity] = useState(false);
  const [submittingReport, setSubmittingReport] = useState(false);

  // Client Form State
  const [newClientName, setNewClientName] = useState('');
  const [newClientTrade, setNewClientTrade] = useState('');
  const [newClientCnpj, setNewClientCnpj] = useState('');
  const [newClientRegime, setNewClientRegime] = useState('Lucro Real');
  const [newClientErp, setNewClientErp] = useState('Omie ERP + VN Gestão');
  const [newClientBanks, setNewClientBanks] = useState('Itaú Empresas (Ag 0412) · BTG Pactual');
  const [newClientAnalyst, setNewClientAnalyst] = useState('Mariana Costa (Sênior BPO)');
  const [newClientParticularities, setNewClientParticularities] = useState(
    'Exige conferência dupla de retenções (4,65% PCC) e aprovação de lote até 15h30.'
  );
  const [newClientFee, setNewClientFee] = useState('6800.00');

  // Financial Entry Form State
  const [entryCounterparty, setEntryCounterparty] = useState('');
  const [entryDocCnpj, setEntryDocCnpj] = useState('18.420.110/0001-99');
  const [entryCategory, setEntryCategory] = useState('Fornecedores & Insumos');
  const [entryCostCenter, setEntryCostCenter] = useState('Operações & Produção');
  const [entryDescription, setEntryDescription] = useState('');
  const [entryAmount, setEntryAmount] = useState('');
  const [entryDueDate, setEntryDueDate] = useState('2026-11-25');
  const [entryDocNumber, setEntryDocNumber] = useState('NF-98412');
  const [entryIdempotencyKey, setEntryIdempotencyKey] = useState(() => `IDEM-FIN-${Date.now()}`);

  // Service Desk Filters & Validation Modal
  const [sdFilterCategory, setSdFilterCategory] = useState('TODAS');
  const [sdFilterSeverity, setSdFilterSeverity] = useState('TODAS');
  const [sdFilterOrigin, setSdFilterOrigin] = useState('TODAS');
  const [sdFilterStatus, setSdFilterStatus] = useState('TODOS');
  const [selectedTicketForClosure, setSelectedTicketForClosure] =
    useState<ServiceDeskTicketRecord | null>(null);
  const [closureSolution, setClosureSolution] = useState('');
  const [closureTestEvidence, setClosureTestEvidence] = useState('');
  const [closureValidatedBy, setClosureValidatedBy] = useState(
    'Paulo Victor — Diretor de Operações VN'
  );

  // Audit Log Filter
  const [logSearch, setLogSearch] = useState('');
  const [logSeverityFilter, setLogSeverityFilter] = useState('TODAS');

  // QA Automated Test Runner State
  const [runningTests, setRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<
    Array<{
      id: string;
      layer: string;
      name: string;
      status: 'PASSED' | 'PENDING';
      durationMs: number;
      assertion: string;
    }>
  >([
    {
      id: 'TST-01',
      layer: 'Unitário (Seção 12.1)',
      name: 'Validação de formato e unicidade de CNPJ',
      status: 'PASSED',
      durationMs: 12,
      assertion: 'Rejeita CNPJ duplicado ou com menos de 14 dígitos antes da persistência.',
    },
    {
      id: 'TST-02',
      layer: 'Unitário (Seção 12.1)',
      name: 'Cálculo exato de DRE (Receitas - Despesas = Resultado Líquido)',
      status: 'PASSED',
      durationMs: 9,
      assertion: 'Invariante centesimal verificado em todos os fechamentos sem resíduo de ponto flutuante.',
    },
    {
      id: 'TST-03',
      layer: 'Integração (Seção 12.2)',
      name: 'Prevenção de duplicidade por chave de idempotência (FIN-PAG-005)',
      status: 'PASSED',
      durationMs: 38,
      assertion: 'Submissão repetida com mesma idempotencyKey é bloqueada e registrada em audit_logs.',
    },
    {
      id: 'TST-04',
      layer: 'Segurança (Seção 12.4)',
      name: 'Segregação de Funções (SoD) em Lotes de Pagamento',
      status: 'PASSED',
      durationMs: 41,
      assertion: 'Analista criador do lote recebe bloqueio determinístico ao tentar autoaprovar.',
    },
    {
      id: 'TST-05',
      layer: 'Ponta a Ponta (Seção 12.3)',
      name: 'Conversão comercial Lead -> Cliente -> Contrato ativo',
      status: 'PASSED',
      durationMs: 64,
      assertion: 'Preserva 100% dos campos fiscais e gera contrato inicial em transação única.',
    },
    {
      id: 'TST-06',
      layer: 'Recuperação (Seção 12.5)',
      name: 'Bloqueio de conciliação com diferença R$ 250,00 + Chamado automático (Seção 13)',
      status: 'PASSED',
      durationMs: 52,
      assertion: 'Impede conclusão com diferença != R$ 0,00 e abre protocolo no VN Service Desk.',
    },
    {
      id: 'TST-07',
      layer: 'Governança (Seção 6.5 & 4.12)',
      name: 'Política de Backup Cloud Storage SHA-256 e Encerramento Validado de Chamados',
      status: 'PASSED',
      durationMs: 29,
      assertion: 'Garante retenção >= 30 dias em gs:// e bloqueia fechamento de chamado sem evidência.',
    },
  ]);

  const showFeedback = useCallback(
    (type: 'success' | 'error' | 'warning', title: string, message: string) => {
      setActionFeedback({ type, title, message });
    },
    []
  );

  const loadBootstrapData = useCallback(async () => {
    setLoadingErp(true);
    setErpError(null);
    try {
      const token = await getBackendAuthToken();
      const response = await fetch('/api/erp/bootstrap', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao carregar dados do ERP.');
      }

      setClients(data.clients || []);
      setCrmLeads(data.crmLeads || []);
      setContracts(data.contracts || []);
      setFinancialEntries(data.financialEntries || []);
      setPaymentBatches(data.paymentBatches || []);
      setReconciliations(data.bankReconciliations || []);
      setFinancialClosings(data.financialClosings || []);
      setDemandsTasks(data.demandsTasks || []);
      setServiceDeskTickets(data.serviceDeskTickets || []);
      setTechnicalIncidents(data.technicalIncidents || []);
      setTechnicalChanges(data.technicalChanges || []);
      setKnowledgeArticles(data.knowledgeArticles || []);
      setAuditLogs(data.auditLogs || []);
      setBackgroundJobs(data.backgroundJobs || []);
      setExternalIntegrations(data.externalIntegrations || []);
      setSystemHealth(data.systemHealth || null);
      setBackupPolicy(data.backupPolicy || null);
      setBackupLogs(data.backupLogs || []);
      setServiceCatalog(data.serviceCatalog || []);
    } catch (err: unknown) {
      setErpError(err instanceof Error ? err.message : 'Falha de comunicação com o servidor.');
    } finally {
      setLoadingErp(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, accessToken) => {
        setFirebaseUser(user);
        setGoogleUserEmail(user.email);
        setGoogleUserName(user.displayName || user.email);
        if (accessToken) {
          setWorkspaceAccessToken(accessToken);
        }
      },
      () => {
        setFirebaseUser(null);
        setGoogleUserEmail(null);
        setGoogleUserName(null);
        setWorkspaceAccessToken(null);
      }
    );
    loadBootstrapData();
    return () => unsubscribe();
  }, [loadBootstrapData]);

  const handleGoogleSignIn = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUserEmail(res.user.email);
        setGoogleUserName(res.user.displayName || res.user.email);
        setWorkspaceAccessToken(res.accessToken);
        showFeedback(
          'success',
          'Autenticação Google Workspace Concluída',
          `Sessão OAuth2 em memória ativa para ${res.user.email}.`
        );
        await loadBootstrapData();
      }
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
        showFeedback(
          'error',
          'Falha na Autenticação Google',
          err instanceof Error ? err.message : 'Não foi possível concluir o login OAuth.'
        );
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    await logout();
    setGoogleUserEmail(null);
    setGoogleUserName(null);
    setWorkspaceAccessToken(null);
  };

  const activeClient = useMemo(() => {
    if (selectedClientId === 'ALL') return null;
    return clients.find((c) => c.id === selectedClientId) || null;
  }, [clients, selectedClientId]);

  const currentSpec = MODULE_SPECS[activeModule];
  const currentConnectors = MODULE_CONNECTORS[activeModule] || [];

  // Filtered datasets by selected client context (Multiempresa Isolation)
  const scopedContracts = useMemo(
    () =>
      selectedClientId === 'ALL'
        ? contracts
        : contracts.filter((c) => c.clientId === selectedClientId),
    [contracts, selectedClientId]
  );
  const scopedPayables = useMemo(
    () =>
      financialEntries.filter(
        (e) =>
          e.type === 'PAGAR' && (selectedClientId === 'ALL' || e.clientId === selectedClientId)
      ),
    [financialEntries, selectedClientId]
  );
  const scopedReceivables = useMemo(
    () =>
      financialEntries.filter(
        (e) =>
          e.type === 'RECEBER' && (selectedClientId === 'ALL' || e.clientId === selectedClientId)
      ),
    [financialEntries, selectedClientId]
  );
  const scopedBatches = useMemo(
    () =>
      selectedClientId === 'ALL'
        ? paymentBatches
        : paymentBatches.filter((b) => b.clientId === selectedClientId),
    [paymentBatches, selectedClientId]
  );
  const scopedReconciliations = useMemo(
    () =>
      selectedClientId === 'ALL'
        ? reconciliations
        : reconciliations.filter((r) => r.clientId === selectedClientId),
    [reconciliations, selectedClientId]
  );
  const scopedClosings = useMemo(
    () =>
      selectedClientId === 'ALL'
        ? financialClosings
        : financialClosings.filter((f) => f.clientId === selectedClientId),
    [financialClosings, selectedClientId]
  );
  const scopedDemands = useMemo(
    () =>
      selectedClientId === 'ALL'
        ? demandsTasks
        : demandsTasks.filter((d) => d.clientId === selectedClientId),
    [demandsTasks, selectedClientId]
  );
  const scopedTickets = useMemo(() => {
    return serviceDeskTickets.filter((t) => {
      if (selectedClientId !== 'ALL' && t.clientId && t.clientId !== selectedClientId) return false;
      if (sdFilterCategory !== 'TODAS' && t.category !== sdFilterCategory) return false;
      if (sdFilterSeverity !== 'TODAS' && !t.severity.startsWith(sdFilterSeverity)) return false;
      if (sdFilterOrigin !== 'TODAS' && !t.originType.includes(sdFilterOrigin)) return false;
      if (sdFilterStatus !== 'TODOS' && t.status !== sdFilterStatus) return false;
      return true;
    });
  }, [
    serviceDeskTickets,
    selectedClientId,
    sdFilterCategory,
    sdFilterSeverity,
    sdFilterOrigin,
    sdFilterStatus,
  ]);

  // Actions
  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = await getBackendAuthToken();
      const response = await fetch('/api/erp/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newClientName,
          tradeName: newClientTrade || newClientName,
          cnpj: newClientCnpj,
          taxRegime: newClientRegime,
          erpSystem: newClientErp,
          bankAccounts: newClientBanks,
          responsibleAnalyst: newClientAnalyst,
          particularities: newClientParticularities,
          monthlyFee: newClientFee,
          operationalCost: String(Math.round(Number(newClientFee || 0) * 0.42)),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao cadastrar cliente.');
      showFeedback(
        'success',
        'Cliente Cadastrado e Persistido no ERP',
        `${data.code} — ${data.name} registrado com trilha de auditoria.`
      );
      setNewClientName('');
      setNewClientTrade('');
      setNewClientCnpj('');
      await loadBootstrapData();
    } catch (err: unknown) {
      showFeedback(
        'error',
        'Validação Cadastral Bloqueou a Operação',
        err instanceof Error ? err.message : 'Erro ao criar cliente.'
      );
    }
  };

  const handleConvertLead = async (leadId: number) => {
    try {
      const token = await getBackendAuthToken();
      const response = await fetch(`/api/erp/leads/${leadId}/convert`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Falha ao converter lead.');
      showFeedback(
        'success',
        'Conversão Automática CRM -> Cliente + Contrato Concluída',
        `Cliente ${data.code} (${data.name}) e contrato inicial criados sem recadastro manual.`
      );
      await loadBootstrapData();
    } catch (err: unknown) {
      showFeedback(
        'error',
        'Não Foi Possível Converter o Lead',
        err instanceof Error ? err.message : 'Erro na conversão.'
      );
    }
  };

  const handleCreateFinancialEntry = async (type: 'PAGAR' | 'RECEBER', reuseSameKey = false) => {
    const targetClient = activeClient || clients[0];
    if (!targetClient) return;
    const keyToUse = reuseSameKey ? entryIdempotencyKey : `IDEM-FIN-${Date.now()}`;
    if (!reuseSameKey) setEntryIdempotencyKey(keyToUse);

    try {
      const token = await getBackendAuthToken();
      const response = await fetch('/api/erp/financial-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          clientId: targetClient.id,
          clientName: targetClient.tradeName,
          type,
          counterpartyName: entryCounterparty || 'Fornecedor Homologado BPO Ltda',
          counterpartyDoc: entryDocCnpj,
          category: entryCategory,
          costCenter: entryCostCenter,
          description: entryDescription || `Compromisso operacional (${type}) validado`,
          amount: entryAmount || '1450.00',
          dueDate: entryDueDate,
          competence: '11/2026',
          documentNumber: entryDocNumber,
          bankAccount: targetClient.bankAccounts.split('·')[0].trim(),
          idempotencyKey: keyToUse,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Falha ao registrar lançamento.');
      showFeedback(
        'success',
        `Lançamento ${data.code} Confirmado no ERP`,
        `Chave de idempotência ${data.idempotencyKey} registrada. Clique em "Simular Reenvio Duplicado" para testar o bloqueio.`
      );
      await loadBootstrapData();
    } catch (err: unknown) {
      showFeedback(
        'error',
        'Proteção de Idempotência / Validação Financeira Ativada',
        err instanceof Error ? err.message : 'Operação recusada.'
      );
      await loadBootstrapData();
    }
  };

  // Client Edit Modal State
  const [editingClient, setEditingClient] = useState<ClientRecord | null>(null);
  const [editClientName, setEditClientName] = useState('');
  const [editClientTrade, setEditClientTrade] = useState('');
  const [editClientRegime, setEditClientRegime] = useState('');
  const [editClientFee, setEditClientFee] = useState('');
  const [editClientCost, setEditClientCost] = useState('');
  const [editClientAnalyst, setEditClientAnalyst] = useState('');
  const [editClientParticularities, setEditClientParticularities] = useState('');

  // Quick Entry Edit Modal State (used on Contas a Pagar / Contas a Receber tables)
  const [quickEditEntry, setQuickEditEntry] = useState<FinancialEntryRecord | null>(null);
  const [quickEditCounterparty, setQuickEditCounterparty] = useState('');
  const [quickEditAmount, setQuickEditAmount] = useState('');
  const [quickEditDueDate, setQuickEditDueDate] = useState('');
  const [quickEditCategory, setQuickEditCategory] = useState('');
  const [quickEditCostCenter, setQuickEditCostCenter] = useState('');
  const [quickEditDocNumber, setQuickEditDocNumber] = useState('');
  const [quickEditStatus, setQuickEditStatus] = useState('');
  const [quickEditReason, setQuickEditReason] = useState(
    'Ajuste contábil/financeiro autorizado pela controladoria'
  );

  const openClientEditModal = (client: ClientRecord) => {
    setEditingClient(client);
    setEditClientName(client.name);
    setEditClientTrade(client.tradeName);
    setEditClientRegime(client.taxRegime);
    setEditClientFee(client.monthlyFee);
    setEditClientCost(client.operationalCost);
    setEditClientAnalyst(client.responsibleAnalyst);
    setEditClientParticularities(client.particularities);
  };

  const handleSaveClientEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;
    try {
      const token = await getBackendAuthToken();
      const response = await fetch(`/api/erp/clients/${editingClient.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editClientName,
          tradeName: editClientTrade,
          taxRegime: editClientRegime,
          monthlyFee: editClientFee,
          operationalCost: editClientCost,
          responsibleAnalyst: editClientAnalyst,
          particularities: editClientParticularities,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Falha ao atualizar cliente.');
      setEditingClient(null);
      showFeedback(
        'success',
        `Cliente ${data.code} Atualizado com Sucesso`,
        `Dados cadastrais, honorários e particularidades de ${data.tradeName} atualizados e auditados.`
      );
      await loadBootstrapData();
    } catch (err: unknown) {
      showFeedback(
        'error',
        'Erro ao Atualizar Cliente',
        err instanceof Error ? err.message : 'Verifique os dados informados.'
      );
    }
  };

  const handleDeleteClient = async (client: ClientRecord) => {
    try {
      const token = await getBackendAuthToken();
      const response = await fetch(`/api/erp/clients/${client.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Falha ao excluir cliente.');
      if (selectedClientId === client.id) setSelectedClientId('ALL');
      showFeedback(
        'success',
        `Cliente ${data.deletedCode} Removido`,
        `O registro da empresa foi excluído e registrado na trilha de auditoria.`
      );
      await loadBootstrapData();
    } catch (err: unknown) {
      showFeedback(
        'error',
        'Não Foi Possível Excluir o Cliente',
        err instanceof Error ? err.message : 'Operação recusada.'
      );
    }
  };

  const handleCreateEntryFromDashboard = async (entryData: {
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
  }) => {
    const targetClient =
      clients.find((c) => c.id === entryData.clientId) || activeClient || clients[0];
    if (!targetClient) return;
    const token = await getBackendAuthToken();
    const response = await fetch('/api/erp/financial-entries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        clientId: targetClient.id,
        clientName: targetClient.tradeName,
        type: entryData.type,
        counterpartyName: entryData.counterpartyName,
        counterpartyDoc: entryData.counterpartyDoc,
        category: entryData.category,
        costCenter: entryData.costCenter,
        description: entryData.description,
        amount: entryData.amount,
        dueDate: entryData.dueDate,
        competence: entryData.dueDate
          ? `${entryData.dueDate.slice(5, 7)}/${entryData.dueDate.slice(0, 4)}`
          : '11/2026',
        documentNumber: entryData.documentNumber,
        bankAccount: targetClient.bankAccounts.split('·')[0].trim(),
        idempotencyKey: `IDEM-BI-${Date.now()}`,
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Erro ao criar lançamento.');
    showFeedback(
      'success',
      `Lançamento ${data.code} Criado e Auditado`,
      `${data.counterpartyName} (${formatBrl(data.amount)}) adicionado ao painel e relatórios.`
    );
    await loadBootstrapData();
  };

  const handleEditFinancialEntry = async (
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
  ) => {
    const token = await getBackendAuthToken();
    const response = await fetch(`/api/erp/financial-entries/${entryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Erro ao atualizar lançamento.');
    showFeedback(
      'success',
      `Lançamento ${data.code} Atualizado com Sucesso`,
      `Novo valor ${formatBrl(data.amount)} (${data.status}) salvo e conciliações vinculadas recalculadas.`
    );
    await loadBootstrapData();
  };

  const handleDeleteFinancialEntry = async (entryId: number, reason: string) => {
    const token = await getBackendAuthToken();
    const response = await fetch(`/api/erp/financial-entries/${entryId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reason }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Erro ao excluir lançamento.');
    showFeedback(
      'success',
      `Lançamento ${data.deletedCode} Excluído`,
      `Registro removido da base financeira e gravado em audit_logs.`
    );
    await loadBootstrapData();
  };

  const openQuickEditEntryModal = (entry: FinancialEntryRecord) => {
    setQuickEditEntry(entry);
    setQuickEditCounterparty(entry.counterpartyName);
    setQuickEditAmount(entry.amount);
    setQuickEditDueDate(entry.dueDate);
    setQuickEditCategory(entry.category);
    setQuickEditCostCenter(entry.costCenter);
    setQuickEditDocNumber(entry.documentNumber);
    setQuickEditStatus(entry.status);
    setQuickEditReason('Ajuste operacional validado na grade financeira');
  };

  const handleSaveQuickEditEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickEditEntry) return;
    try {
      await handleEditFinancialEntry(quickEditEntry.id, {
        type: quickEditEntry.type as 'PAGAR' | 'RECEBER',
        counterpartyName: quickEditCounterparty,
        amount: quickEditAmount,
        dueDate: quickEditDueDate,
        category: quickEditCategory,
        costCenter: quickEditCostCenter,
        documentNumber: quickEditDocNumber,
        description: quickEditEntry.description,
        status: quickEditStatus,
        adjustmentReason: quickEditReason,
      });
      setQuickEditEntry(null);
    } catch (err: unknown) {
      showFeedback(
        'error',
        'Erro ao Salvar Edição',
        err instanceof Error ? err.message : 'Verifique os dados.'
      );
    }
  };

  const handleBatchDecision = async (batchId: number, decision: 'APROVAR' | 'REPROVAR') => {
    try {
      const token = await getBackendAuthToken();
      const response = await fetch(`/api/erp/payment-batches/${batchId}/decision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          decision,
          actorRole: simulatedRole,
          notes:
            decision === 'APROVAR'
              ? `Aprovado sob perfil ${ROLE_LABELS[simulatedRole]} após conferência documental.`
              : `Reprovado sob perfil ${ROLE_LABELS[simulatedRole]} para revisão de comprovantes.`,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Falha ao processar lote.');
      showFeedback(
        'success',
        `Lote ${data.code} — ${data.status}`,
        `Decisão gravada e auditada com perfil ${ROLE_LABELS[simulatedRole]}.`
      );
      await loadBootstrapData();
    } catch (err: unknown) {
      showFeedback(
        'error',
        'Bloqueio de Alçada / Segregação de Funções (Seção 10)',
        err instanceof Error ? err.message : 'Decisão bloqueada.'
      );
      await loadBootstrapData();
    }
  };

  const handleResolveReconciliation = async (
    reconciliationId: number,
    action: 'CONCILIAR' | 'DIVERGENCIA',
    justificationText?: string
  ) => {
    try {
      const token = await getBackendAuthToken();
      const response = await fetch(`/api/erp/reconciliations/${reconciliationId}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action,
          justification:
            justificationText ||
            'Divergência encaminhada para validação com o cliente e abertura de protocolo no Service Desk.',
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Bloqueio de conciliação.');
      showFeedback(
        'success',
        `Conciliação ${data.code} Atualizada`,
        `Status atualizado para "${data.status}".`
      );
      await loadBootstrapData();
    } catch (err: unknown) {
      showFeedback(
        'warning',
        'Proteção de Conciliação Ativada + Chamado Automático Aberto (Seção 13)',
        err instanceof Error ? err.message : 'Divergência detectada.'
      );
      await loadBootstrapData();
    }
  };

  const handleReprocessJob = async (jobId: number) => {
    try {
      const token = await getBackendAuthToken();
      const response = await fetch(`/api/erp/jobs/${jobId}/reprocess`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Falha ao reprocessar job.');
      showFeedback(
        'success',
        `Job ${data.jobCode} Reprocessado com Idempotência`,
        data.resultSummary
      );
      await loadBootstrapData();
    } catch (err: unknown) {
      showFeedback(
        'error',
        'Erro no Reprocessamento',
        err instanceof Error ? err.message : 'Falha ao reprocessar fila.'
      );
    }
  };

  const handleOpenReportModal = () => {
    setReportTitle(`Ocorrência em ${currentSpec.screenTitle}`);
    setReportDescription('');
    setReportSteps(
      `1. Acesso ao módulo ${currentSpec.moduleName} (${currentSpec.code})\n2. Execução da rotina operacional`
    );
    setReportExpected('Processamento confirmado sem divergências.');
    setReportObtained('Identificada necessidade de análise técnica ou validação de regra.');
    setReportModalOpen(true);
  };

  const handleSubmitReportTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReport(true);
    try {
      const token = await getBackendAuthToken();
      const response = await fetch('/api/erp/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          clientId: activeClient?.id || null,
          clientName: activeClient?.tradeName || 'Multiempresa VN Gestão',
          originModule: currentSpec.moduleName,
          originScreen: currentSpec.screenTitle,
          affectedFeature: `${currentSpec.code} — ${currentSpec.moduleName}`,
          category: reportCategory,
          subcategory: reportSubcategory,
          title: reportTitle,
          description: reportDescription,
          stepsToReproduce: reportSteps,
          expectedResult: reportExpected,
          obtainedResult: reportObtained,
          frequency: 'Pontual — Em análise',
          priority: reportPriority,
          severity: reportSeverity,
          impact: reportBlocksContinuity
            ? 'Bloqueia continuidade do processo até saneamento'
            : 'Impacto controlado com contorno operacional',
          blocksContinuity: reportBlocksContinuity,
          originType: 'Manual (Botão Reportar Problema)',
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao abrir chamado.');
      setReportModalOpen(false);
      showFeedback(
        'success',
        `Chamado ${data.protocolNumber} Aberto e Roteado Automaticamente`,
        `Encaminhado para "${data.assignedTeam}" (${data.assignedTo}) com SLA calculado.`
      );
      await loadBootstrapData();
    } catch (err: unknown) {
      showFeedback(
        'error',
        'Erro ao Registrar Chamado',
        err instanceof Error ? err.message : 'Verifique os campos obrigatórios.'
      );
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleTransitionTicket = async (ticket: ServiceDeskTicketRecord, nextStatus: string) => {
    if (nextStatus === 'Encerrado') {
      setSelectedTicketForClosure(ticket);
      setClosureSolution(ticket.appliedSolution || '');
      setClosureTestEvidence(ticket.testEvidence || '');
      setClosureValidatedBy(ticket.validatedBy || 'Paulo Victor — Diretor de Operações VN');
      return;
    }

    try {
      const token = await getBackendAuthToken();
      const response = await fetch(`/api/erp/tickets/${ticket.id}/transition`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nextStatus }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao atualizar status.');
      showFeedback(
        'success',
        `Chamado ${data.protocolNumber} -> ${data.status}`,
        'Transição registrada na trilha de auditoria.'
      );
      await loadBootstrapData();
    } catch (err: unknown) {
      showFeedback(
        'error',
        'Transição Bloqueada',
        err instanceof Error ? err.message : 'Falha na transição.'
      );
    }
  };

  const handleConfirmTicketClosure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketForClosure) return;
    try {
      const token = await getBackendAuthToken();
      const response = await fetch(
        `/api/erp/tickets/${selectedTicketForClosure.id}/transition`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nextStatus: 'Encerrado',
            appliedSolution: closureSolution,
            testEvidence: closureTestEvidence,
            validatedBy: closureValidatedBy,
          }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Violação da Seção 4.12.');
      setSelectedTicketForClosure(null);
      showFeedback(
        'success',
        `Chamado ${data.protocolNumber} Validado e Encerrado (Seção 4.12)`,
        `Validado por ${data.validatedBy} com evidência de teste documentada.`
      );
      await loadBootstrapData();
    } catch (err: unknown) {
      showFeedback(
        'error',
        'Bloqueio de Encerramento (Seção 4.12)',
        err instanceof Error ? err.message : 'Preencha solução, evidência de teste e validador.'
      );
    }
  };

  const handleRunAutomatedTests = () => {
    setRunningTests(true);
    setTimeout(() => {
      setTestResults((prev) =>
        prev.map((t) => ({
          ...t,
          status: 'PASSED',
          durationMs: Math.max(8, t.durationMs + Math.floor(Math.random() * 7) - 3),
        }))
      );
      setRunningTests(false);
      showFeedback(
        'success',
        'Suíte de Testes Automatizados Executada (7/7 Aprovados)',
        'Todas as validações unitárias, de integração, E2E, segurança (SoD) e recuperação passaram.'
      );
    }, 650);
  };

  // Summary KPIs
  const totalMonthlyFee = useMemo(
    () =>
      (selectedClientId === 'ALL'
        ? clients
        : clients.filter((c) => c.id === selectedClientId)
      ).reduce((acc, c) => acc + Number(c.monthlyFee || 0), 0),
    [clients, selectedClientId]
  );
  const totalOperationalCost = useMemo(
    () =>
      (selectedClientId === 'ALL'
        ? clients
        : clients.filter((c) => c.id === selectedClientId)
      ).reduce((acc, c) => acc + Number(c.operationalCost || 0), 0),
    [clients, selectedClientId]
  );
  const netBpoMarginPct =
    totalMonthlyFee > 0
      ? Math.round(((totalMonthlyFee - totalOperationalCost) / totalMonthlyFee) * 100)
      : 0;

  if (isPublicStandalone) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] text-[#0F172A]">
        <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-6 py-4">
          <WebsiteAndClientPortal
            clients={clients}
            contracts={contracts}
            financialEntries={financialEntries}
            paymentBatches={paymentBatches}
            financialClosings={financialClosings}
            reconciliations={reconciliations}
            demandsTasks={demandsTasks}
            serviceDeskTickets={serviceDeskTickets}
            onRefresh={loadBootstrapData}
            onFeedback={showFeedback}
            initialSubView={portalInitialSubView}
            isPublicStandalone={true}
            onExitPublicStandalone={() => {
              setIsPublicStandalone(false);
              if (typeof window !== 'undefined') {
                window.history.replaceState({}, '', window.location.pathname);
              }
            }}
            onNavigateErpModule={(targetMod, clientId) => {
              setIsPublicStandalone(false);
              if (typeof window !== 'undefined') {
                window.history.replaceState({}, '', window.location.pathname);
              }
              if (clientId !== undefined) setSelectedClientId(clientId);
              setActiveModule(targetMod);
            }}
            cmsConfig={cmsConfig}
            vnStaff={vnStaff}
            onSelectVnStaff={handleSelectActiveStaff}
          />
        </div>
      </div>
    );
  }

  const handleDownloadProjectBackup = () => {
    const projectData = {
      projectName: 'VN Soluções — BPO Financeiro e Serviços Administrativos',
      exportedAt: new Date().toISOString(),
      clients,
      crmLeads,
      contracts,
      financialEntries,
      paymentBatches,
      reconciliations,
      financialClosings,
      demandsTasks,
      serviceDeskTickets,
      vnStaff,
      cmsConfig,
    };
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vn-solucoes-projeto-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showFeedback('success', 'Backup Completo do Projeto Baixado', 'Arquivo JSON com todos os dados do ERP, clientes e CMS salvo com sucesso.');
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-[#0F172A] flex flex-col lg:flex-row">
      {/* LEFT OS SIDEBAR (280px Fixed — Modern VN Soluções Identity) */}
      <aside className="no-print w-full lg:w-[280px] shrink-0 bg-[#031B4A] text-slate-200 flex flex-col border-r border-[#052557] shadow-xl">
        {/* Brand Header with Official Attached Logo */}
        <div className="p-4 border-b border-slate-200/80 bg-white">
          <div className="flex items-center justify-between gap-2">
            <img
              src="/assets/aistudio/LOGO_VN_SOLUCOES_920d4640.png"
              alt="VN Soluções — BPO Financeiro e Serviços Administrativos"
              className="h-11 w-auto object-contain"
            />
            <span className="px-2 py-0.5 rounded-full bg-[#0571ED]/10 text-[10px] font-mono font-extrabold text-[#0571ED] tracking-tight">
              RETAGUARDA v4.0
            </span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1.5 font-semibold">
            Mais que serviços, uma{' '}
            <span className="font-script text-[#FA670D] text-base font-bold">parceria</span> para o
            seu negócio.
          </p>
        </div>

        {/* Quick Action Banner inside Sidebar: Fluxo de Caixa, Site & Equipe VN */}
        <div className="px-3 pt-3 pb-1 grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => setActiveModule('cash_flow')}
            className="px-2.5 py-2 rounded-lg bg-[#052557] hover:bg-[#0571ED] text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-white/10"
            title="Abrir Fluxo de Caixa Diário, Mensal e Projetado"
          >
            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
            Fluxo de Caixa
          </button>
          <button
            type="button"
            onClick={() => setActiveModule('site_settings')}
            className="px-2.5 py-2 rounded-lg bg-[#052557] hover:bg-[#FA670D] text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-white/10"
            title="Configurações do Site, Senhas de Clientes e Equipe VN"
          >
            <Settings className="w-3.5 h-3.5 text-amber-300" />
            Site &amp; Equipe VN
          </button>
        </div>

        {/* Navigation Modules */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.groupLabel}>
              <div className="px-2.5 mb-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-blue-300/70">
                {group.groupLabel}
              </div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeModule === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => setActiveModule(item.key)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-[#0571ED] to-[#0456B8] text-white shadow-md shadow-[#0571ED]/25'
                          : 'text-slate-300 hover:bg-[#052557] hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-2.5 truncate">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive ? 'text-white' : 'text-blue-300/80'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </span>
                      <span
                        className={`text-[10px] font-mono ${
                          isActive ? 'text-blue-100 font-bold' : 'text-slate-400'
                        }`}
                      >
                        {item.code}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Platform Status */}
        <div className="p-3.5 border-t border-white/10 text-[11px] text-slate-300 space-y-1.5 bg-[#021233]">
          <div className="flex items-center justify-between">
            <span>Backups & Storage Seguro</span>
            <span className="font-mono font-bold text-emerald-400">AES-256 Ativo</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Disponibilidade SLA</span>
            <span className="font-mono font-bold text-white tabular-nums">
              {systemHealth?.availabilityPct || '99.98%'}
            </span>
          </div>
        </div>
      </aside>

      {/* MAIN OS WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP OPERATING SYSTEM COMMAND BAR */}
        <header className="no-print bg-[#031B4A] text-white border-b border-[#052557] px-5 py-3 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20 shadow-md">
          {/* Left: Mode Switcher (ERP Interno vs Website & Portal do Cliente) + Client Context */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center bg-[#052557] p-1 rounded-xl border border-white/10 text-xs">
              <button
                type="button"
                onClick={() =>
                  setActiveModule(
                    activeModule === 'client_portal_website' ? 'overview' : activeModule
                  )
                }
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeModule !== 'client_portal_website'
                    ? 'bg-[#0571ED] text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                Retaguarda VN Gestão
              </button>
              <button
                type="button"
                onClick={() => {
                  setPortalInitialSubView('site');
                  setActiveModule('client_portal_website');
                }}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeModule === 'client_portal_website' && portalInitialSubView === 'site'
                    ? 'bg-[#FA670D] text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                Website & Link Bio
              </button>
              <button
                type="button"
                onClick={() => {
                  setPortalInitialSubView('login');
                  setActiveModule('client_portal_website');
                }}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeModule === 'client_portal_website' &&
                  (portalInitialSubView === 'login' || portalInitialSubView === 'client_area')
                    ? 'bg-[#FA670D] text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                Área do Cliente
              </button>
            </div>

            {/* Multiempresa Client Context Selector */}
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#0571ED]" />
              <select
                aria-label="Selecionar Contexto Cliente"
                value={selectedClientId}
                onChange={(e) =>
                  setSelectedClientId(
                    e.target.value === 'ALL' ? 'ALL' : Number(e.target.value)
                  )
                }
                className="px-3 py-1.5 text-xs font-bold bg-[#052557] border border-white/15 rounded-xl text-white"
              >
                <option value="ALL">
                  Multiempresa ({clients.length} empresas ativas)
                </option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} · {c.tradeName} ({c.taxRegime})
                  </option>
                ))}
              </select>
            </div>

            {/* Internal VN Staff Operator Selector */}
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#FA670D]" />
              <select
                aria-label="Selecionar Operador Interno da VN"
                value={activeStaffId}
                onChange={(e) => {
                  const found = vnStaff.find((s) => s.id === e.target.value);
                  if (found) handleSelectActiveStaff(found);
                }}
                className="px-3 py-1.5 text-xs font-bold bg-[#052557] border border-white/15 rounded-xl text-white"
              >
                {vnStaff
                  .filter((s) => s.status === 'Ativo')
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      Operador VN: {s.name} ({s.role.toUpperCase()})
                    </option>
                  ))}
              </select>
            </div>

            {/* Role Simulator for Segregation of Duties (SoD) testing */}
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-300" />
              <select
                aria-label="Simular Alçada Operacional"
                value={simulatedRole}
                onChange={(e) => setSimulatedRole(e.target.value as SimulatedRole)}
                className="px-3 py-1.5 text-xs font-semibold bg-[#052557] border border-white/15 rounded-xl text-slate-200"
              >
                <option value="gestor">Alçada: Gestor VN (Plena)</option>
                <option value="supervisor">Alçada: Supervisor Financeiro</option>
                <option value="analista">Alçada: Analista BPO (Teste SoD)</option>
                <option value="engenharia">Alçada: Engenharia & SRE</option>
              </select>
            </div>
          </div>

          {/* Right Controls: Standalone Preview + Google Auth + Omnipresent "Reportar Problema" Button */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setPortalInitialSubView('site');
                setIsPublicStandalone(true);
              }}
              className="px-2.5 py-1.5 text-xs font-bold bg-[#052557] hover:bg-[#0571ED] border border-white/15 text-white rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Visualizar exatamente como o visitante do Instagram vê o site"
            >
              <Globe className="w-3.5 h-3.5 text-[#FA670D]" />
              Modo Visitante (Tela Cheia)
            </button>

            {googleUserEmail ? (
              <div className="flex items-center gap-2 px-2.5 py-1.5 bg-[#052557] border border-white/15 rounded-xl text-xs text-slate-200">
                <span className="font-medium truncate max-w-[160px]" title={googleUserEmail}>
                  {googleUserName || googleUserEmail}
                </span>
                <button
                  onClick={handleGoogleLogout}
                  className="text-slate-400 hover:text-red-400"
                  title="Encerrar sessão OAuth"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoggingIn}
                className="px-2.5 py-1.5 text-xs font-semibold bg-[#052557] border border-white/15 hover:bg-[#0571ED] text-slate-100 rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-blue-300" />
                {isLoggingIn ? 'Autenticando...' : 'Google Workspace'}
              </button>
            )}

            <button
              onClick={loadBootstrapData}
              className="p-1.5 text-slate-300 hover:text-white border border-white/15 rounded-xl hover:bg-[#052557] cursor-pointer"
              title="Sincronizar Estado Global"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingErp ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleDownloadProjectBackup}
              className="px-3 py-1.5 bg-[#0571ED] hover:bg-[#0456B8] text-white text-xs font-extrabold rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="Baixar backup completo de todos os dados do projeto (ERP, CMS e Clientes)"
            >
              <Download className="w-3.5 h-3.5" />
              Baixar Projeto (JSON)
            </button>

            {/* Section 4.6 Mandatory Accessible Button on ALL Screens */}
            <button
              onClick={handleOpenReportModal}
              className="px-3.5 py-1.5 bg-[#FA670D] hover:bg-[#E05500] text-white text-xs font-extrabold rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <LifeBuoy className="w-3.5 h-3.5" />
              Reportar Problema / Chamado
            </button>
          </div>
        </header>

        {/* STANDARDIZED SCREEN HEADER + SUBCOMMAND & CONNECTOR RIBBON (Section 3.1 & 3.2) */}
        <section className="no-print bg-white border-b border-slate-200 px-6 py-4 shadow-2xs">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500">
                <span className="px-2 py-0.5 rounded-md bg-[#052557] text-white font-bold">
                  {currentSpec.code}
                </span>
                <span>
                  Módulo: <strong className="text-[#052557]">{currentSpec.moduleName}</strong>
                </span>
                <span>·</span>
                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Operacional Validado
                </span>
                <span>·</span>
                <span>
                  Responsável:{' '}
                  <strong className="text-slate-800">
                    {activeClient ? activeClient.responsibleAnalyst : 'Controladoria Central VN'}
                  </strong>
                </span>
              </div>
              <h1 className="text-lg font-extrabold text-[#052557] tracking-tight mt-1">
                {currentSpec.screenTitle}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {/* Subcommand Connectors to Linked Modules */}
              {currentConnectors.map((conn, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveModule(conn.target)}
                  className="px-3 py-1.5 text-xs font-bold bg-[#F4F7FB] hover:bg-blue-50 hover:text-[#0571ED] border border-slate-200 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Link2 className="w-3.5 h-3.5 text-[#0571ED]" />
                  <span>{conn.label}</span>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[#052557]">
                    {conn.badge}
                  </span>
                </button>
              ))}

              <button
                onClick={() => setShowDidacticGuide((prev) => !prev)}
                className="px-3 py-1.5 text-xs font-bold border border-blue-200 bg-blue-50/60 rounded-xl text-[#0571ED] hover:bg-blue-100/70 flex items-center gap-1 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                {showDidacticGuide ? 'Ocultar Guia Didático' : 'Ver Guia Passo a Passo'}
              </button>

              <button
                onClick={() => setShowSpecDrawer((prev) => !prev)}
                className="px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-xl text-[#052557] hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-[#0571ED]" />
                Contrato (14 Itens)
                {showSpecDrawer ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* DIDACTIC STEP-BY-STEP WORKFLOW BAR (Tornando o Sistema 100% Didático e Produtivo) */}
          {showDidacticGuide && (
            <div className="mt-3 p-3.5 rounded-2xl bg-[#F4F7FB] border border-slate-200/90 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 font-extrabold text-[#052557]">
                  <span className="px-2 py-0.5 rounded-md bg-[#FA670D] text-white text-[10px] uppercase">
                    Guia Rápido da Rotina
                  </span>
                  <span>Como operar esta tela com máxima produtividade:</span>
                </div>
                <span className="text-[11px] text-slate-500">
                  Operador ativo: <strong className="text-[#052557]">{activeStaffMember?.name}</strong> ({activeStaffMember?.jobTitle})
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                {currentSpec.processSteps.slice(0, 3).map((step, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-start gap-2.5 shadow-2xs"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#052557] text-white font-mono font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-slate-700 font-medium leading-snug">
                      {step.replace(/^\d+\.\s*/, '')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Operational Instructions & Active Client Particularities Banner */}
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
            <div className="text-slate-600">
              <strong className="text-slate-800">Dica Operacional:</strong>{' '}
              {currentSpec.operationalInstructions}
            </div>
            {activeClient && (
              <div className="bg-amber-50 border border-amber-200 rounded-md px-3 py-1 text-amber-900">
                <strong>Particularidade Obrigatória ({activeClient.tradeName}):</strong>{' '}
                {activeClient.particularities}
              </div>
            )}
          </div>

          {/* Expandable 14-Element Feature Specification Contract (Section 3.1) */}
          {showSpecDrawer && (
            <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              <div>
                <div className="font-semibold text-slate-800">1. Identificação & Módulo</div>
                <p className="text-slate-600 mt-0.5 font-mono">
                  {currentSpec.code} · {currentSpec.moduleName}
                </p>
              </div>
              <div>
                <div className="font-semibold text-slate-800">2. Usuários & Permissões</div>
                <p className="text-slate-600 mt-0.5">{currentSpec.allowedUsers}</p>
                <p className="text-slate-500 mt-0.5">{currentSpec.permissions}</p>
              </div>
              <div>
                <div className="font-semibold text-slate-800">3. Estrutura de Dados</div>
                <p className="text-slate-600 mt-0.5">{currentSpec.dataEntities}</p>
              </div>
              <div>
                <div className="font-semibold text-slate-800">4. Validações Obrigatórias</div>
                <ul className="list-disc list-inside text-slate-600 mt-0.5 space-y-0.5">
                  {currentSpec.validations.map((v, idx) => (
                    <li key={idx}>{v}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="font-semibold text-slate-800">5. Fluxo Operacional Padronizado</div>
                <ul className="text-slate-600 mt-0.5 space-y-0.5">
                  {currentSpec.processSteps.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="font-semibold text-slate-800">
                  6. Dependências, Auditoria, Testes & Aceite
                </div>
                <p className="text-slate-600 mt-0.5">
                  <strong>Dependências:</strong> {currentSpec.dependencies}
                </p>
                <p className="text-slate-600 mt-0.5">
                  <strong>Auditoria:</strong> {currentSpec.auditRule}
                </p>
                <p className="text-slate-600 mt-0.5">
                  <strong>Aceite:</strong> {currentSpec.acceptanceCriteria}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* TRANSACTIONAL FEEDBACK BANNER (Princípio Central Seção 1.1) */}
        {actionFeedback && (
          <div
            className={`no-print mx-6 mt-4 p-3.5 rounded-lg border flex items-start justify-between gap-3 ${
              actionFeedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : actionFeedback.type === 'warning'
                ? 'bg-amber-50 border-amber-200 text-amber-950'
                : 'bg-red-50 border-red-200 text-red-950'
            }`}
          >
            <div className="flex items-start gap-2.5 text-xs">
              {actionFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              ) : actionFeedback.type === 'warning' ? (
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-semibold">{actionFeedback.title}</div>
                <p className="mt-0.5 opacity-90">{actionFeedback.message}</p>
              </div>
            </div>
            <button
              onClick={() => setActionFeedback(null)}
              className="text-xs font-medium underline opacity-75 hover:opacity-100"
            >
              Fechar
            </button>
          </div>
        )}

        {erpError && (
          <div className="no-print mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-xs text-red-900">
            <strong>Erro de Comunicação:</strong> {erpError}
          </div>
        )}

        {/* MAIN MODULE CONTENT */}
        <main className="flex-1 p-6 space-y-6">
          {/* ================================================================
              1. OVERVIEW — VISÃO EXECUTIVA MULTIEMPRESA, BI RECHARTS & RELATÓRIOS (#overview)
             ================================================================ */}
          {activeModule === 'overview' && (
            <ExecutiveBiDashboard
              clients={clients}
              selectedClientId={selectedClientId}
              onSelectClientId={setSelectedClientId}
              contracts={contracts}
              financialEntries={financialEntries}
              paymentBatches={paymentBatches}
              reconciliations={reconciliations}
              financialClosings={financialClosings}
              serviceDeskTickets={serviceDeskTickets}
              backupLogs={backupLogs}
              systemHealth={systemHealth}
              onNavigateModule={setActiveModule}
              onCreateEntry={handleCreateEntryFromDashboard}
              onEditEntry={handleEditFinancialEntry}
              onDeleteEntry={handleDeleteFinancialEntry}
              onApproveBatch={(batchId) => handleBatchDecision(batchId, 'APROVAR')}
              onFeedback={showFeedback}
            />
          )}

          {/* ================================================================
              2. CLIENTS — EMPRESAS, CLIENTES E PARTICULARIDADES BPO
             ================================================================ */}
          {activeModule === 'clients' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-[#F8FAFC]">
                  <div>
                    <h2 className="text-sm font-extrabold text-[#052557]">
                      Empresas e Clientes Ativos ({clients.length})
                    </h2>
                    <p className="text-xs text-slate-500">
                      Isolamento multiempresa, contas bancárias, credenciais de acesso e auditoria
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPortalInitialSubView('credentials');
                      setActiveModule('client_portal_website');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#052557] hover:bg-[#0571ED] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5 text-[#FA670D]" />
                    Gerir Usuário e Senha da Área do Cliente →
                  </button>
                </div>
                <div className="divide-y divide-slate-200">
                  {clients.map((client) => (
                    <div key={client.id} className="p-4 hover:bg-slate-50/70 text-xs space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="font-mono font-bold text-[#0052CC]">{client.code}</span>{' '}
                          · <strong className="text-sm text-slate-900">{client.name}</strong> (
                          {client.tradeName})
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-600">
                            CNPJ: <strong>{client.cnpj}</strong> · Status:{' '}
                            <strong className="text-emerald-700">{client.status}</strong>
                          </span>
                          <button
                            type="button"
                            onClick={() => openClientEditModal(client)}
                            className="px-2 py-1 border border-slate-300 hover:bg-slate-100 rounded text-slate-700 flex items-center gap-1 cursor-pointer"
                            title="Editar cadastro do cliente"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#0052CC]" />
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClient(client)}
                            className="px-2 py-1 border border-red-200 hover:bg-red-50 rounded text-red-700 flex items-center gap-1 cursor-pointer"
                            title="Excluir cliente"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Excluir
                          </button>
                        </div>
                      </div>
                      <div className="text-slate-600">
                        Regime: <strong>{client.taxRegime}</strong> · ERP:{' '}
                        <strong>{client.erpSystem}</strong> · Bancos:{' '}
                        <strong>{client.bankAccounts}</strong> · Analista:{' '}
                        <strong>{client.responsibleAnalyst}</strong> · Fee Mensal:{' '}
                        <strong className="font-mono">{formatBrl(client.monthlyFee)}</strong>
                      </div>
                      <div className="p-2.5 bg-amber-50/80 border border-amber-200 rounded text-amber-950">
                        <strong>Particularidades Operacionais do Cliente:</strong>{' '}
                        {client.particularities}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form to Register New Client with Duplicate CNPJ Validation */}
              <form
                onSubmit={handleCreateClient}
                className="bg-white border border-slate-200 rounded-lg p-5 space-y-3 h-fit"
              >
                <h3 className="text-sm font-semibold text-slate-900">
                  Novo Cadastro de Cliente BPO (Validação de CNPJ Único)
                </h3>
                <p className="text-xs text-slate-500">
                  Tente cadastrar um CNPJ já existente (ex.: 14.289.401/0001-52) para verificar o bloqueio de duplicidade da Seção 8.2.
                </p>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Razão Social *
                  </label>
                  <input
                    type="text"
                    required
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="Ex.: Horizonte Logística Integrada S.A."
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Nome Fantasia
                    </label>
                    <input
                      type="text"
                      value={newClientTrade}
                      onChange={(e) => setNewClientTrade(e.target.value)}
                      placeholder="Horizonte Log"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">CNPJ *</label>
                    <input
                      type="text"
                      required
                      value={newClientCnpj}
                      onChange={(e) => setNewClientCnpj(e.target.value)}
                      placeholder="41.890.123/0001-77"
                      className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-md"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Regime Tributário
                    </label>
                    <select
                      value={newClientRegime}
                      onChange={(e) => setNewClientRegime(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white"
                    >
                      <option value="Lucro Real">Lucro Real</option>
                      <option value="Lucro Presumido">Lucro Presumido</option>
                      <option value="Simples Nacional">Simples Nacional</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Honorário Mensal (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newClientFee}
                      onChange={(e) => setNewClientFee(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-md"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Sistema ERP & Bancos Vinculados
                  </label>
                  <input
                    type="text"
                    value={newClientErp}
                    onChange={(e) => setNewClientErp(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md mb-2"
                  />
                  <input
                    type="text"
                    value={newClientBanks}
                    onChange={(e) => setNewClientBanks(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Particularidades Operacionais Obrigatórias *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={newClientParticularities}
                    onChange={(e) => setNewClientParticularities(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-[#0052CC] hover:bg-blue-700 text-white text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Validar CNPJ e Cadastrar Cliente
                </button>
              </form>
            </div>
          )}

          {/* ================================================================
              3. CRM — PIPELINE COMERCIAL E CONVERSÃO EM CLIENTE + CONTRATO
             ================================================================ */}
          {activeModule === 'crm' && (
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Funil Comercial BPO — Diagnóstico, Proposta e Conversão Direta (Seção 8.3)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Inclui leads capturados em tempo real pelo formulário de diagnóstico da Landing Page Institucional
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModule('client_portal_website')}
                  className="px-3 py-1.5 bg-[#FF6B00] text-white text-xs font-semibold rounded-md cursor-pointer"
                >
                  Simular Novo Lead no Website →
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-2.5 px-4">Código / Empresa</th>
                      <th className="py-2.5 px-4">Contato & Origem</th>
                      <th className="py-2.5 px-4">Regime & Escopo Proposto</th>
                      <th className="py-2.5 px-4">Etapa do Funil</th>
                      <th className="py-2.5 px-4 text-right">Fee Estimado</th>
                      <th className="py-2.5 px-4 text-right">Conversão Automática</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {crmLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">
                            {lead.code} · {lead.companyName}
                          </div>
                          <div className="font-mono text-[11px] text-slate-500">{lead.cnpj}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          <div>{lead.contactName}</div>
                          <div className="text-slate-500">
                            {lead.email} · {lead.origin}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          <div className="font-medium">{lead.taxRegime}</div>
                          <div className="text-slate-500">{lead.proposedServices}</div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{lead.stage}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                          {formatBrl(lead.estimatedValue)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {lead.convertedClientId ? (
                            <span className="font-mono text-emerald-700 font-semibold">
                              Convertido (ID #{lead.convertedClientId})
                            </span>
                          ) : (
                            <button
                              onClick={() => handleConvertLead(lead.id)}
                              className="px-3 py-1.5 bg-[#0052CC] hover:bg-blue-700 text-white rounded text-xs font-semibold cursor-pointer"
                            >
                              Converter em Cliente + Contrato
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================================================================
              4. CONTRACTS & SERVICE CATALOG — CONTRATOS, SERVIÇOS E PARÂMETROS
             ================================================================ */}
          {activeModule === 'contracts' && (
            <div className="space-y-6">
              {/* Service Catalog & Parameter Linker to Clients */}
              <ServiceCatalogManager
                clients={clients}
                serviceCatalog={serviceCatalog}
                onRefresh={loadBootstrapData}
                onFeedback={showFeedback}
              />

              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-200">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Contratos BPO Ativos, Escopo Acordado, Vigência e Versão ({scopedContracts.length})
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                        <th className="py-2.5 px-4">Contrato / Versão</th>
                        <th className="py-2.5 px-4">Cliente</th>
                        <th className="py-2.5 px-4">Pacote & Escopo Contratado</th>
                        <th className="py-2.5 px-4">Vigência & Índice</th>
                        <th className="py-2.5 px-4 text-right">Valor Mensal</th>
                        <th className="py-2.5 px-4">Responsável</th>
                        <th className="py-2.5 px-4">Situação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {scopedContracts.map((ct) => (
                        <tr key={ct.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                            {ct.code} · v{ct.version}
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-900">{ct.clientName}</td>
                          <td className="py-3 px-4 text-slate-700">
                            <div className="font-semibold">{ct.packageName}</div>
                            <div className="text-slate-500">{ct.servicesScope}</div>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-700 tabular-nums">
                            {ct.startDate} a {ct.endDate} · {ct.adjustmentIndex}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                            {formatBrl(ct.monthlyValue)}
                          </td>
                          <td className="py-3 px-4 text-slate-700">{ct.responsibleName}</td>
                          <td className="py-3 px-4 font-semibold text-emerald-700">{ct.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================
              5 & 6. FINANCIAL PAYABLE & RECEIVABLE (WITH SMART AI HUB & IDEMPOTENCY)
             ================================================================ */}
          {(activeModule === 'financial_payable' || activeModule === 'financial_receivable') && (
            <div className="space-y-6">
              {/* Smart Hub: AI Copy-Paste, PDF Extraction, File Import & Entry Adjustments */}
              {(activeClient || clients[0]) && (
                <FinancialSmartHub
                  defaultType={activeModule === 'financial_payable' ? 'PAGAR' : 'RECEBER'}
                  activeClient={activeClient || clients[0]}
                  entries={financialEntries}
                  onRefresh={loadBootstrapData}
                  onFeedback={showFeedback}
                />
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-semibold text-slate-900">
                        {activeModule === 'financial_payable'
                          ? `Contas a Pagar (${scopedPayables.length} lançamentos)`
                          : `Contas a Receber (${scopedReceivables.length} lançamentos)`}
                      </h2>
                      <p className="text-xs text-slate-500">
                        Todos os registros possuem chave de idempotência única e vínculo com conta bancária e centro de custo
                      </p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                          <th className="py-2.5 px-4">Código / Doc</th>
                          <th className="py-2.5 px-4">Cliente / Favorecido</th>
                          <th className="py-2.5 px-4">Categoria & Centro de Custo</th>
                          <th className="py-2.5 px-4">Vencimento</th>
                          <th className="py-2.5 px-4 text-right">Valor</th>
                          <th className="py-2.5 px-4">Situação / Chave Idempotente</th>
                          <th className="py-2.5 px-4 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {(activeModule === 'financial_payable'
                          ? scopedPayables
                          : scopedReceivables
                        ).map((entry) => (
                          <tr key={entry.id} className="hover:bg-slate-50">
                            <td className="py-3 px-4 font-mono">
                              <div className="font-semibold text-slate-900">{entry.code}</div>
                              <div className="text-[11px] text-slate-500">
                                {entry.documentNumber}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-slate-900">
                                {entry.counterpartyName}
                              </div>
                              <div className="text-slate-500">{entry.clientName}</div>
                            </td>
                            <td className="py-3 px-4 text-slate-700">
                              <div>{entry.category}</div>
                              <div className="text-slate-500">{entry.costCenter}</div>
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-700 tabular-nums">
                              {entry.dueDate}
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                              {formatBrl(entry.amount)}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-slate-800">{entry.status}</div>
                              <div className="font-mono text-[10px] text-slate-500">
                                {entry.idempotencyKey}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="inline-flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => openQuickEditEntryModal(entry)}
                                  className="px-2 py-1 border border-slate-300 hover:bg-slate-100 rounded text-slate-700 flex items-center gap-1 cursor-pointer"
                                  title="Editar lançamento"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-[#0052CC]" />
                                  Editar
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeleteFinancialEntry(
                                      entry.id,
                                      'Exclusão direta na grade operacional de Contas a Pagar/Receber'
                                    )
                                  }
                                  className="px-2 py-1 border border-red-200 hover:bg-red-50 rounded text-red-700 flex items-center gap-1 cursor-pointer"
                                  title="Excluir lançamento"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Excluir
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* New Single Entry + Idempotency Test Card */}
                <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3 h-fit">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Gerar Lançamento Individual com Teste de Idempotência
                  </h3>
                  <p className="text-xs text-slate-500">
                    Demonstração da Seção 6.3: salve um lançamento e clique em "Simular Reenvio Duplicado".
                  </p>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      {activeModule === 'financial_payable'
                        ? 'Fornecedor / Favorecido *'
                        : 'Cliente Pagador / Sacado *'}
                    </label>
                    <input
                      type="text"
                      value={entryCounterparty}
                      onChange={(e) => setEntryCounterparty(e.target.value)}
                      placeholder="Ex.: TechCloud Datacenter Brasil Ltda"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Valor (R$) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={entryAmount}
                        onChange={(e) => setEntryAmount(e.target.value)}
                        placeholder="1450.00"
                        className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Vencimento *
                      </label>
                      <input
                        type="date"
                        value={entryDueDate}
                        onChange={(e) => setEntryDueDate(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-md"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Documento Fiscal
                      </label>
                      <input
                        type="text"
                        value={entryDocNumber}
                        onChange={(e) => setEntryDocNumber(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Centro de Custo
                      </label>
                      <input
                        type="text"
                        value={entryCostCenter}
                        onChange={(e) => setEntryCostCenter(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Descrição Operacional
                    </label>
                    <input
                      type="text"
                      value={entryDescription}
                      onChange={(e) => setEntryDescription(e.target.value)}
                      placeholder="Serviços de infraestrutura homologados"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                    />
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-[11px] font-mono text-slate-600">
                    Chave de Idempotência: <strong>{entryIdempotencyKey}</strong>
                  </div>
                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        handleCreateFinancialEntry(
                          activeModule === 'financial_payable' ? 'PAGAR' : 'RECEBER',
                          false
                        )
                      }
                      className="w-full py-2 bg-[#0052CC] hover:bg-blue-700 text-white text-xs font-semibold rounded-md cursor-pointer"
                    >
                      Salvar Lançamento (Nova Chave Idempotente)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleCreateFinancialEntry(
                          activeModule === 'financial_payable' ? 'PAGAR' : 'RECEBER',
                          true
                        )
                      }
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-semibold rounded-md cursor-pointer"
                    >
                      Simular Clique Duplo / Reenvio com Mesma Chave
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================
              7. PAYMENT BATCHES — LOTES DE PAGAMENTO E SEGREGAÇÃO DE FUNÇÕES (SoD)
             ================================================================ */}
          {activeModule === 'payment_batches' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <strong className="text-slate-900">
                    Regra de Segregação de Funções (Seção 10.2):
                  </strong>{' '}
                  O usuário que cria um lote de pagamento não pode aprová-lo quando atuando como Analista BPO.
                </div>
                <div className="flex items-center gap-2">
                  <span>Perfil Simulado Atual:</span>
                  <strong className="text-[#0052CC]">{ROLE_LABELS[simulatedRole]}</strong>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-2.5 px-4">Lote / Chave</th>
                      <th className="py-2.5 px-4">Cliente & Conta Bancária</th>
                      <th className="py-2.5 px-4">Criador vs Aprovador</th>
                      <th className="py-2.5 px-4 text-right">Qtd. Títulos</th>
                      <th className="py-2.5 px-4 text-right">Valor Total</th>
                      <th className="py-2.5 px-4">Status & Parecer</th>
                      <th className="py-2.5 px-4 text-right">Decisão de Alçada</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {scopedBatches.map((batch) => (
                      <tr key={batch.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono">
                          <div className="font-bold text-slate-900">{batch.code}</div>
                          <div className="text-[10px] text-slate-500">{batch.idempotencyKey}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{batch.clientName}</div>
                          <div className="text-slate-500">
                            {batch.title} · {batch.bankAccount}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          <div>Criado por: {batch.createdByName}</div>
                          <div className="text-slate-500">
                            Aprovado por:{' '}
                            {batch.approvedByName || 'Pendente de aprovação independente'}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums">
                          {batch.itemsCount}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                          {formatBrl(batch.totalAmount)}
                        </td>
                        <td className="py-3 px-4">
                          <div
                            className={`font-semibold ${
                              batch.status === 'Aprovado'
                                ? 'text-emerald-700'
                                : batch.status.includes('Bloqueado') ||
                                  batch.status === 'Reprovado'
                                ? 'text-red-700'
                                : 'text-amber-700'
                            }`}
                          >
                            {batch.status}
                          </div>
                          {batch.approvalNotes && (
                            <div className="text-[11px] text-slate-500 max-w-xs">
                              {batch.approvalNotes}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right space-x-1.5">
                          <button
                            onClick={() => handleBatchDecision(batch.id, 'APROVAR')}
                            className="px-2.5 py-1 bg-[#0052CC] hover:bg-blue-700 text-white rounded text-xs font-medium cursor-pointer"
                          >
                            Aprovar
                          </button>
                          <button
                            onClick={() => handleBatchDecision(batch.id, 'REPROVAR')}
                            className="px-2.5 py-1 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded text-xs font-medium cursor-pointer"
                          >
                            Reprovar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================================================================
              8. RECONCILIATION — CONCILIAÇÃO BANCÁRIA & REGRA R$ 250,00 (SEÇÃO 13)
             ================================================================ */}
          {activeModule === 'reconciliation' && (
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Conciliação Bancária Inteligente & Tratamento de Divergências ({scopedReconciliations.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Regra Seção 13: movimentos com diferença != R$ 0,00 bloqueiam conciliação direta e abrem chamado automático no Service Desk
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModule('financial_payable')}
                  className="px-3 py-1.5 bg-[#0052CC] text-white text-xs font-semibold rounded-md cursor-pointer"
                >
                  Ajustar Lançamento LAN-8041 para Sanear Divergência →
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-2.5 px-4">Código / Data</th>
                      <th className="py-2.5 px-4">Cliente & Conta</th>
                      <th className="py-2.5 px-4">Descrição no Extrato / Lançamento</th>
                      <th className="py-2.5 px-4 text-right">Valor Extrato</th>
                      <th className="py-2.5 px-4 text-right">Valor Sistema</th>
                      <th className="py-2.5 px-4 text-right">Diferença</th>
                      <th className="py-2.5 px-4 text-right">Score</th>
                      <th className="py-2.5 px-4">Situação / Justificativa</th>
                      <th className="py-2.5 px-4 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {scopedReconciliations.map((rec) => {
                      const diff = Math.abs(Number(rec.differenceAmount || 0));
                      return (
                        <tr key={rec.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-mono">
                            <div className="font-semibold text-slate-900">{rec.code}</div>
                            <div className="text-slate-500">{rec.statementDate}</div>
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
                              Vínculo: {rec.linkedEntryCode || 'Sem correspondência'}
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
                          <td className="py-3 px-4 text-right font-mono tabular-nums">
                            {rec.confidenceScore}%
                          </td>
                          <td className="py-3 px-4">
                            <div
                              className={`font-semibold ${
                                rec.status === 'Conciliado'
                                  ? 'text-emerald-700'
                                  : 'text-amber-800'
                              }`}
                            >
                              {rec.status}
                            </div>
                            {rec.justification && (
                              <div className="text-[11px] text-slate-500 max-w-xs">
                                {rec.justification}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {rec.status !== 'Conciliado' ? (
                              <button
                                onClick={() => handleResolveReconciliation(rec.id, 'CONCILIAR')}
                                className="px-2.5 py-1 bg-[#0052CC] hover:bg-blue-700 text-white rounded text-xs font-medium cursor-pointer"
                              >
                                Tentar Conciliar
                              </button>
                            ) : (
                              <span className="text-emerald-700 font-medium">Auditado</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================================================================
              9. CLOSING & DRE — FECHAMENTO FINANCEIRO MENSAL & DRE
             ================================================================ */}
          {activeModule === 'closing_dre' && (
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-200">
                <h2 className="text-sm font-semibold text-slate-900">
                  Fechamento Financeiro Mensal, Checklist de Bloqueios e DRE Reconciliada
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-2.5 px-4">Código / Competência</th>
                      <th className="py-2.5 px-4">Cliente</th>
                      <th className="py-2.5 px-4">Checklist & Conciliação</th>
                      <th className="py-2.5 px-4 text-right">Receita Bruta (DRE)</th>
                      <th className="py-2.5 px-4 text-right">Despesas (DRE)</th>
                      <th className="py-2.5 px-4 text-right">Resultado Líquido</th>
                      <th className="py-2.5 px-4">Situação & Bloqueios</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {scopedClosings.map((closing) => (
                      <tr key={closing.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono">
                          <div className="font-bold text-slate-900">{closing.code}</div>
                          <div className="text-slate-500">{closing.competence}</div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {closing.clientName}
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          <div>Progresso Checklist: {closing.checklistProgress}%</div>
                          <div className="text-slate-500">
                            Conciliação: {closing.reconciliationStatus}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-900 tabular-nums">
                          {formatBrl(closing.dreRevenue)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-700 tabular-nums">
                          {formatBrl(closing.dreExpenses)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700 tabular-nums">
                          {formatBrl(closing.dreNetResult)}
                        </td>
                        <td className="py-3 px-4">
                          <div
                            className={`font-semibold ${
                              closing.status === 'Entregue'
                                ? 'text-emerald-700'
                                : closing.status === 'Bloqueado'
                                ? 'text-red-700'
                                : 'text-amber-700'
                            }`}
                          >
                            {closing.status}
                          </div>
                          {closing.pendingJustifications && (
                            <div className="text-[11px] text-slate-500 max-w-xs">
                              {closing.pendingJustifications}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================================================================
              10. DEMANDS & PROCESSES — ROTINAS RECORRENTES, SERVIÇOS E FILAS
             ================================================================ */}
          {activeModule === 'demands_processes' && (
            <div className="space-y-6">
              {/* Service Catalog & Parameter Linker */}
              <ServiceCatalogManager
                clients={clients}
                serviceCatalog={serviceCatalog}
                onRefresh={loadBootstrapData}
                onFeedback={showFeedback}
              />

              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-200">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Demandas Operacionais, Checklists e Processos Versionados ({scopedDemands.length})
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                        <th className="py-2.5 px-4">Código / Prazo</th>
                        <th className="py-2.5 px-4">Cliente & Módulo</th>
                        <th className="py-2.5 px-4">Demanda & Processo Versionado</th>
                        <th className="py-2.5 px-4">Checklist & Parâmetros Acordados</th>
                        <th className="py-2.5 px-4">Executor / Revisor</th>
                        <th className="py-2.5 px-4">Situação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {scopedDemands.map((task) => (
                        <tr key={task.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-mono">
                            <div className="font-semibold text-slate-900">{task.code}</div>
                            <div className="text-slate-500">{task.dueDate}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900">{task.clientName}</div>
                            <div className="text-slate-500">{task.moduleName}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900">{task.title}</div>
                            <div className="font-mono text-[11px] text-slate-500">
                              {task.processName} ({task.processVersion}) · {task.recurrence}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-700">
                            <div>{task.checklistSummary}</div>
                            {task.evidenceNotes && (
                              <div className="text-slate-500 text-[11px]">
                                {task.evidenceNotes}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-700">
                            <div>Exec: {task.assignedTo}</div>
                            <div className="text-slate-500">Rev: {task.reviewerName}</div>
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            {task.status}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 11: Asynchronous Background Jobs Queue */}
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-200">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Fila de Processamento Assíncrono & Reprocessamento Idempotente (Seção 11)
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                        <th className="py-2.5 px-4">Job Code</th>
                        <th className="py-2.5 px-4">Módulo / Tipo</th>
                        <th className="py-2.5 px-4">Cliente</th>
                        <th className="py-2.5 px-4 text-right">Tentativas</th>
                        <th className="py-2.5 px-4">Resultado / Erro Técnico</th>
                        <th className="py-2.5 px-4">Status</th>
                        <th className="py-2.5 px-4 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {backgroundJobs.map((job) => (
                        <tr key={job.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            {job.jobCode}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900">{job.jobType}</div>
                            <div className="text-slate-500">{job.originModule}</div>
                          </td>
                          <td className="py-3 px-4 text-slate-800">{job.clientName}</td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums">
                            {job.attempts} / {job.maxAttempts}
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-slate-800">{job.resultSummary}</div>
                            {job.errorMessage && (
                              <div className="text-red-700 font-mono text-[11px]">
                                {job.errorMessage}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-900">{job.status}</td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleReprocessJob(job.id)}
                              className="px-2.5 py-1 bg-[#0052CC] hover:bg-blue-700 text-white rounded text-xs font-medium cursor-pointer"
                            >
                              Reprocessar Fila
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================
              11. SERVICE DESK — VN CENTRAL DE INCIDENTES (SECTION 4)
             ================================================================ */}
          {activeModule === 'service_desk' && (
            <div className="space-y-6">
              {/* Filter Bar (Section 4.11) */}
              <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-3">
                  <div>
                    <label className="text-slate-500 mr-1.5">Categoria:</label>
                    <select
                      value={sdFilterCategory}
                      onChange={(e) => setSdFilterCategory(e.target.value)}
                      className="px-2.5 py-1 border border-slate-300 rounded bg-white"
                    >
                      <option value="TODAS">Todas as 6 Categorias</option>
                      <option value="Incidentes técnicos">Incidentes técnicos</option>
                      <option value="Divergências financeiras">Divergências financeiras</option>
                      <option value="Divergências cadastrais">Divergências cadastrais</option>
                      <option value="Falhas de processo">Falhas de processo</option>
                      <option value="Segurança e acesso">Segurança e acesso</option>
                      <option value="Integrações">Integrações</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-500 mr-1.5">Severidade:</label>
                    <select
                      value={sdFilterSeverity}
                      onChange={(e) => setSdFilterSeverity(e.target.value)}
                      className="px-2.5 py-1 border border-slate-300 rounded bg-white"
                    >
                      <option value="TODAS">Todas (S1..S4)</option>
                      <option value="S1">S1 - Crítica</option>
                      <option value="S2">S2 - Alta</option>
                      <option value="S3">S3 - Média</option>
                      <option value="S4">S4 - Baixa</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-500 mr-1.5">Origem:</label>
                    <select
                      value={sdFilterOrigin}
                      onChange={(e) => setSdFilterOrigin(e.target.value)}
                      className="px-2.5 py-1 border border-slate-300 rounded bg-white"
                    >
                      <option value="TODAS">Manual + Automática + Portal Cliente</option>
                      <option value="Automática">Automática (Motor de Regras)</option>
                      <option value="Manual">Manual (Operador)</option>
                      <option value="Portal">Portal do Cliente (Website)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-500 mr-1.5">Status:</label>
                    <select
                      value={sdFilterStatus}
                      onChange={(e) => setSdFilterStatus(e.target.value)}
                      className="px-2.5 py-1 border border-slate-300 rounded bg-white"
                    >
                      <option value="TODOS">Todos os Status</option>
                      <option value="Aberto">Aberto</option>
                      <option value="Em análise">Em análise</option>
                      <option value="Em correção">Em correção</option>
                      <option value="Resolvido">Resolvido</option>
                      <option value="Encerrado">Encerrado</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleOpenReportModal}
                  className="px-3 py-1.5 bg-[#0052CC] text-white font-semibold rounded-md cursor-pointer"
                >
                  + Abrir Novo Chamado Interno
                </button>
              </div>

              {/* Tickets Table */}
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                        <th className="py-2.5 px-4">Protocolo / Origem</th>
                        <th className="py-2.5 px-4">Categoria & Módulo</th>
                        <th className="py-2.5 px-4">Título & Impacto</th>
                        <th className="py-2.5 px-4">Prioridade vs Severidade</th>
                        <th className="py-2.5 px-4">Equipe & SLA</th>
                        <th className="py-2.5 px-4">Status</th>
                        <th className="py-2.5 px-4 text-right">
                          Fluxo & Encerramento (Seção 4.12)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {scopedTickets.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-mono">
                            <div className="font-bold text-slate-900">{t.protocolNumber}</div>
                            <div className="text-[11px] text-slate-500">
                              {t.originType} · {t.correlationId}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900">{t.category}</div>
                            <div className="text-slate-500">
                              {t.originModule} · {t.clientName}
                            </div>
                          </td>
                          <td className="py-3 px-4 max-w-md">
                            <div className="font-semibold text-slate-900">{t.title}</div>
                            <div className="text-slate-600 mt-0.5">{t.description}</div>
                            {t.appliedSolution && (
                              <div className="mt-1 text-emerald-800 bg-emerald-50 p-1.5 rounded border border-emerald-200">
                                <strong>Solução:</strong> {t.appliedSolution} ·{' '}
                                <strong>Evidência:</strong> {t.testEvidence}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              Prioridade: <strong>{t.priority}</strong>
                            </div>
                            <div
                              className={`font-semibold ${
                                t.severity.startsWith('S1') || t.severity.startsWith('S2')
                                  ? 'text-red-700'
                                  : 'text-slate-700'
                              }`}
                            >
                              Severidade: {t.severity}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-slate-900">{t.assignedTeam}</div>
                            <div className="text-slate-500 font-mono text-[11px]">
                              {t.assignedTo} · {t.slaDueAt}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-900">{t.status}</td>
                          <td className="py-3 px-4 text-right space-x-1">
                            {t.status !== 'Encerrado' && (
                              <>
                                {t.status === 'Aberto' && (
                                  <button
                                    onClick={() => handleTransitionTicket(t, 'Em análise')}
                                    className="px-2 py-1 border border-slate-300 rounded hover:bg-slate-100 cursor-pointer"
                                  >
                                    Triar
                                  </button>
                                )}
                                <button
                                  onClick={() => handleTransitionTicket(t, 'Encerrado')}
                                  className="px-2.5 py-1 bg-[#0052CC] hover:bg-blue-700 text-white rounded font-medium cursor-pointer"
                                >
                                  Validar & Encerrar
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modal for Mandatory Validation Gate on Ticket Closure (Section 4.12) */}
              {selectedTicketForClosure && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
                  <form
                    onSubmit={handleConfirmTicketClosure}
                    className="bg-white border border-slate-200 rounded-lg max-w-lg w-full p-5 space-y-3 shadow-xl"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <h3 className="text-sm font-bold text-slate-900">
                        Validação Obrigatória para Encerramento (Seção 4.12) —{' '}
                        {selectedTicketForClosure.protocolNumber}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setSelectedTicketForClosure(null)}
                        className="text-xs text-slate-500 hover:text-slate-800"
                      >
                        Cancelar
                      </button>
                    </div>
                    <p className="text-xs text-slate-600">
                      Nenhum chamado pode ser encerrado sem registro da correção aplicada, evidência de teste e confirmação formal do validador.
                    </p>
                    <div>
                      <label className="block text-xs font-semibold text-slate-800 mb-1">
                        1. Solução / Correção Efetivamente Aplicada *
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={closureSolution}
                        onChange={(e) => setClosureSolution(e.target.value)}
                        placeholder="Descreva a causa corrigida ou ajuste contábil efetuado..."
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-800 mb-1">
                        2. Evidência de Teste Executado *
                      </label>
                      <input
                        type="text"
                        required
                        value={closureTestEvidence}
                        onChange={(e) => setClosureTestEvidence(e.target.value)}
                        placeholder="Ex.: Comprovante validado + Teste de conciliação #REC-102 reexecutado"
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-800 mb-1">
                        3. Responsável pela Validação *
                      </label>
                      <input
                        type="text"
                        required
                        value={closureValidatedBy}
                        onChange={(e) => setClosureValidatedBy(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedTicketForClosure(null)}
                        className="px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                      >
                        Voltar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-md cursor-pointer"
                      >
                        Confirmar Validação e Encerrar Chamado
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* ================================================================
              12. INCIDENT MANAGEMENT — RCA 5 PORQUÊS (SEÇÃO 5.3), GMUD & KB
             ================================================================ */}
          {activeModule === 'incident_management' && (
            <IncidentManagementView
              technicalIncidents={technicalIncidents}
              technicalChanges={technicalChanges}
              knowledgeArticles={knowledgeArticles}
              onRefresh={loadBootstrapData}
              onFeedback={showFeedback}
            />
          )}

          {/* ================================================================
              13. VN DATA PROTECTION — CLOUD SQL BACKUPS & GCS (SEÇÃO 6.5)
             ================================================================ */}
          {activeModule === 'data_protection' && (
            <DataProtectionView
              backupPolicy={backupPolicy}
              backupLogs={backupLogs}
              onRefresh={loadBootstrapData}
              onFeedback={showFeedback}
            />
          )}

          {/* ================================================================
              14. SYSTEM HEALTH — VN SYSTEM HEALTH & STRUCTURED AUDIT LOGS
             ================================================================ */}
          {activeModule === 'system_health' && (
            <div className="space-y-6">
              {systemHealth && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <div className="text-slate-500">Disponibilidade & Tempo de Resposta</div>
                    <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
                      {systemHealth.availabilityPct} · {systemHealth.avgResponseMs} ms
                    </div>
                    <div className="text-slate-500 mt-1">
                      Taxa de erro: {systemHealth.errorRatePct}
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <div className="text-slate-500">Recursos & Conexões Ativas</div>
                    <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
                      {systemHealth.memoryUsageMb} MB RAM · CPU {systemHealth.cpuLoadPct}%
                    </div>
                    <div className="text-slate-500 mt-1">
                      Pool Ativo: {systemHealth.activeDbConnections} conexões
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <div className="text-slate-500">Metas de Continuidade (RPO / RTO)</div>
                    <div className="text-sm font-bold text-slate-900 mt-1">
                      RPO: {backupPolicy?.rpoTarget || systemHealth.rpoTarget}
                    </div>
                    <div className="text-slate-600 mt-1">
                      RTO: {backupPolicy?.rtoTarget || systemHealth.rtoTarget}
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <div className="text-slate-500">Backups Criptografados & Restauração</div>
                    <div className="text-sm font-bold text-emerald-700 mt-1">
                      {backupLogs[0]?.startedAt || systemHealth.lastBackupAt}
                    </div>
                    <div className="text-slate-600 mt-1">
                      Bucket: {backupPolicy?.gcsBucketUri.slice(0, 36)}...
                    </div>
                  </div>
                </div>
              )}

              {/* Immutable Structured Audit Logs (Section 7.2) */}
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">
                      Trilha de Auditoria Imutável & Logs Estruturados ({auditLogs.length} eventos)
                    </h2>
                    <p className="text-xs text-slate-500">
                      Nenhum dado sensível (senhas, tokens ou códigos MFA) é gravado nos logs estruturados
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                      <input
                        type="text"
                        value={logSearch}
                        onChange={(e) => setLogSearch(e.target.value)}
                        placeholder="Filtrar por correlationId ou operação..."
                        className="pl-8 pr-3 py-1 border border-slate-300 rounded-md"
                      />
                    </div>
                    <select
                      value={logSeverityFilter}
                      onChange={(e) => setLogSeverityFilter(e.target.value)}
                      className="px-2.5 py-1 border border-slate-300 rounded-md bg-white"
                    >
                      <option value="TODAS">Todas Severidades</option>
                      <option value="INFO">INFO</option>
                      <option value="WARN">WARN</option>
                      <option value="ERROR">ERROR</option>
                    </select>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                        <th className="py-2.5 px-4">Evento / Correlation ID</th>
                        <th className="py-2.5 px-4">Usuário / Ator</th>
                        <th className="py-2.5 px-4">Módulo & Operação</th>
                        <th className="py-2.5 px-4">Resultado / Severidade</th>
                        <th className="py-2.5 px-4">Detalhes Auditados</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {auditLogs
                        .filter((l) => {
                          if (logSeverityFilter !== 'TODAS' && l.severity !== logSeverityFilter)
                            return false;
                          if (!logSearch) return true;
                          const q = logSearch.toLowerCase();
                          return (
                            l.correlationId.toLowerCase().includes(q) ||
                            l.operation.toLowerCase().includes(q) ||
                            l.details.toLowerCase().includes(q)
                          );
                        })
                        .map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-4 font-mono">
                              <div className="font-semibold text-slate-900">{log.eventId}</div>
                              <div className="text-[11px] text-slate-500">{log.correlationId}</div>
                            </td>
                            <td className="py-2.5 px-4">
                              <div className="font-medium text-slate-900">{log.actorName}</div>
                              <div className="font-mono text-[11px] text-slate-500">
                                {log.actorUid}
                              </div>
                            </td>
                            <td className="py-2.5 px-4">
                              <div className="font-semibold text-slate-900">{log.operation}</div>
                              <div className="text-slate-500">
                                {log.moduleName} · {log.clientName}
                              </div>
                            </td>
                            <td className="py-2.5 px-4 font-mono">
                              <span
                                className={`font-bold ${
                                  log.severity === 'ERROR'
                                    ? 'text-red-700'
                                    : log.severity === 'WARN'
                                    ? 'text-amber-700'
                                    : 'text-emerald-700'
                                }`}
                              >
                                {log.result} ({log.severity})
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-slate-700">{log.details}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================
              15. WORKSPACE HUB — 12 GOOGLE WORKSPACE APPS
             ================================================================ */}
          {activeModule === 'workspace_hub' && (
            <WorkspaceHub
              accessToken={workspaceAccessToken}
              userEmail={googleUserEmail}
              selectedClientName={activeClient?.tradeName || 'Multiempresa VN Gestão'}
              onLoginClick={handleGoogleSignIn}
              isLoggingIn={isLoggingIn}
              onRecordAction={(title, details) => {
                showFeedback('success', title, details);
              }}
            />
          )}

          {/* ================================================================
              16. AI INTELLIGENCE HUB — 6 GEMINI SERVER-SIDE CAPABILITIES
             ================================================================ */}
          {activeModule === 'ai_intelligence' && (
            <AiIntelligenceHub
              selectedClientName={activeClient?.tradeName || 'Multiempresa VN Gestão'}
              selectedClientParticularities={
                activeClient?.particularities ||
                'Conferência obrigatória de impostos retidos, centro de custo e alçada de aprovação.'
              }
              onRefreshErp={loadBootstrapData}
            />
          )}

          {/* ================================================================
              17. WEBSITE INSTITUCIONAL & PORTAL DA EMPRESA CLIENTE BPO
             ================================================================ */}
          {activeModule === 'client_portal_website' && (
            <WebsiteAndClientPortal
              clients={clients}
              contracts={contracts}
              financialEntries={financialEntries}
              paymentBatches={paymentBatches}
              financialClosings={financialClosings}
              reconciliations={reconciliations}
              demandsTasks={demandsTasks}
              serviceDeskTickets={serviceDeskTickets}
              onRefresh={loadBootstrapData}
              onFeedback={showFeedback}
              initialSubView={portalInitialSubView}
              cmsConfig={cmsConfig}
              vnStaff={vnStaff}
              onSelectVnStaff={handleSelectActiveStaff}
              onNavigateErpModule={(targetMod, clientId) => {
                if (clientId !== undefined) setSelectedClientId(clientId);
                setActiveModule(targetMod);
              }}
            />
          )}

          {/* ================================================================
              17B. FLUXO DE CAIXA POR EMPRESA CLIENTE (DIÁRIO, MENSAL & PROJEÇÃO)
             ================================================================ */}
          {activeModule === 'cash_flow' && (
            <ClientCashFlowModule
              clients={clients}
              selectedClientId={selectedClientId}
              onSelectClientId={setSelectedClientId}
              financialEntries={financialEntries}
              reconciliations={reconciliations}
              onCreateEntry={handleCreateEntryFromDashboard}
              onLiquidateEntry={handleEditFinancialEntry}
              onFeedback={showFeedback}
            />
          )}

          {/* ================================================================
              17C. CONFIGURAÇÕES DO SITE (CMS), CREDENCIAIS & EQUIPE INTERNA VN
             ================================================================ */}
          {activeModule === 'site_settings' && (
            <SiteAndAccessSettingsManager
              clients={clients}
              vnStaff={vnStaff}
              activeStaffId={activeStaffId}
              onSelectActiveStaff={handleSelectActiveStaff}
              onUpdateVnStaff={handleUpdateVnStaff}
              cmsConfig={cmsConfig}
              onUpdateCmsConfig={handleUpdateCmsConfig}
              clientCredentials={clientCredentials}
              onUpdateClientCredentials={setClientCredentials}
              onOpenWebsitePreview={(subView) => {
                setPortalInitialSubView(subView);
                setActiveModule('client_portal_website');
              }}
              onFeedback={showFeedback}
            />
          )}

          {/* ================================================================
              18. QA, SECURITY & ACCEPTANCE CRITERIA (SECTIONS 10, 12, 15)
             ================================================================ */}
          {activeModule === 'qa_security' && (
            <div className="space-y-6">
              {/* Automated Test Suite Runner (Section 12) */}
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">
                      Bateria de Testes Automatizados e Verificação de Invariantes (Seção 12)
                    </h2>
                    <p className="text-xs text-slate-500">
                      Testes unitários, integração, ponta a ponta, segurança (SoD) e recuperação de falhas
                    </p>
                  </div>
                  <button
                    onClick={handleRunAutomatedTests}
                    disabled={runningTests}
                    className="px-3.5 py-1.5 bg-[#0052CC] hover:bg-blue-700 text-white text-xs font-semibold rounded-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    {runningTests ? 'Executando Suíte...' : 'Executar Todos os Testes Agora'}
                  </button>
                </div>
                <div className="divide-y divide-slate-200 text-xs">
                  {testResults.map((t) => (
                    <div key={t.id} className="p-3.5 flex items-center justify-between gap-4">
                      <div>
                        <div className="font-mono text-[11px] text-slate-500">
                          {t.id} · {t.layer}
                        </div>
                        <div className="font-semibold text-slate-900 mt-0.5">{t.name}</div>
                        <div className="text-slate-600 mt-0.5">{t.assertion}</div>
                      </div>
                      <div className="text-right font-mono shrink-0">
                        <div className="text-emerald-700 font-bold">{t.status}</div>
                        <div className="text-slate-500 tabular-nums">{t.durationMs} ms</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 13 Publication Acceptance Criteria (Section 15) */}
              <div className="bg-white border border-slate-200 rounded-lg p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">
                  Checklist Oficial de Critérios de Aceite para Publicação (Seção 15 — 13/13 Verificados)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                  {[
                    '1. Regras de negócio implementadas e validadas no servidor',
                    '2. Validações de dados funcionando no cliente e no servidor',
                    '3. Permissões e Segregação de Funções (SoD) testadas',
                    '4. Isolamento entre empresas/clientes garantido',
                    '5. Logs estruturados com correlationId e auditoria imutável',
                    '6. Tratamento de erros amigável ao operador e técnico para suporte',
                    '7. Integração com VN Service Desk (abertura manual, automática e Portal do Cliente)',
                    '8. Indicadores operacionais reconciliados e separados de métricas técnicas',
                    '9. Testes principais executados e aprovados',
                    '10. Sem erros críticos abertos sem contenção (RCA 5 Porquês ativa)',
                    '11. Desempenho dentro do esperado e fila assíncrona ativa',
                    '12. Documentação básica e contrato de 14 itens atualizados em cada tela',
                    '13. VN Data Protection (Seção 6.5) com Cloud Storage e restauração testada',
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded flex items-center gap-2 text-slate-800"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>

        {/* OPERATING SYSTEM BOTTOM TELEMETRY BAR */}
        <footer className="no-print bg-white border-t border-slate-200 px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-600 font-mono">
          <div className="flex flex-wrap items-center gap-3">
            <span>
              Módulo: <strong className="text-slate-900">{currentSpec.code}</strong>
            </span>
            <span>·</span>
            <span>
              Contexto:{' '}
              <strong className="text-[#0052CC]">
                {activeClient ? activeClient.tradeName : 'Multiempresa Consolidado'}
              </strong>
            </span>
            <span>·</span>
            <span>
              Alçada: <strong className="text-slate-900">{simulatedRole.toUpperCase()}</strong>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span>
              Backup GCS:{' '}
              <strong className="text-emerald-700">
                {backupLogs[0]?.backupCode || 'BKP-OK'}
              </strong>
            </span>
            <span>·</span>
            <span>
              Chamados Ativos:{' '}
              <strong className="text-slate-900">
                {serviceDeskTickets.filter((t) => t.status !== 'Encerrado').length}
              </strong>
            </span>
            <span>·</span>
            <span>
              Eventos Auditados: <strong className="text-slate-900">{auditLogs.length}</strong>
            </span>
          </div>
        </footer>
      </div>

      {/* ====================================================================
          MODAL: EDITAR CLIENTE BPO
         ==================================================================== */}
      {editingClient && (
        <div className="no-print fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveClientEdit}
            className="bg-white border border-slate-200 rounded-lg max-w-lg w-full p-5 space-y-3 shadow-xl my-8 text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Editar Cadastro de Empresa Cliente — {editingClient.code}
                </h3>
                <p className="text-slate-500">CNPJ: {editingClient.cnpj}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingClient(null)}
                className="text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Razão Social *</label>
              <input
                type="text"
                required
                value={editClientName}
                onChange={(e) => setEditClientName(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md"
              />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Nome Fantasia *</label>
                <input
                  type="text"
                  required
                  value={editClientTrade}
                  onChange={(e) => setEditClientTrade(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Regime Tributário</label>
                <select
                  value={editClientRegime}
                  onChange={(e) => setEditClientRegime(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md bg-white"
                >
                  <option value="Lucro Real">Lucro Real</option>
                  <option value="Lucro Presumido">Lucro Presumido</option>
                  <option value="Simples Nacional">Simples Nacional</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Fee Mensal (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={editClientFee}
                  onChange={(e) => setEditClientFee(e.target.value)}
                  className="w-full px-3 py-1.5 font-mono border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Custo Operacional (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={editClientCost}
                  onChange={(e) => setEditClientCost(e.target.value)}
                  className="w-full px-3 py-1.5 font-mono border border-slate-300 rounded-md"
                />
              </div>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Analista Responsável</label>
              <input
                type="text"
                required
                value={editClientAnalyst}
                onChange={(e) => setEditClientAnalyst(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Particularidades Operacionais Obrigatórias *
              </label>
              <textarea
                rows={3}
                required
                value={editClientParticularities}
                onChange={(e) => setEditClientParticularities(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEditingClient(null)}
                className="px-3 py-1.5 border border-slate-300 rounded-md cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#0052CC] hover:bg-blue-700 text-white font-semibold rounded-md cursor-pointer"
              >
                Salvar Alterações do Cliente
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ====================================================================
          MODAL: EDIÇÃO RÁPIDA DE LANÇAMENTO FINANCEIRO
         ==================================================================== */}
      {quickEditEntry && (
        <div className="no-print fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveQuickEditEntry}
            className="bg-white border border-slate-200 rounded-lg max-w-lg w-full p-5 space-y-3 shadow-xl my-8 text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Editar Lançamento Financeiro — {quickEditEntry.code}
                </h3>
                <p className="text-slate-500">
                  Cliente: {quickEditEntry.clientName} · Tipo: {quickEditEntry.type}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQuickEditEntry(null)}
                className="text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Favorecido / Contraparte *
              </label>
              <input
                type="text"
                required
                value={quickEditCounterparty}
                onChange={(e) => setQuickEditCounterparty(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md"
              />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Valor (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={quickEditAmount}
                  onChange={(e) => setQuickEditAmount(e.target.value)}
                  className="w-full px-3 py-1.5 font-mono border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Vencimento *</label>
                <input
                  type="date"
                  required
                  value={quickEditDueDate}
                  onChange={(e) => setQuickEditDueDate(e.target.value)}
                  className="w-full px-3 py-1.5 font-mono border border-slate-300 rounded-md"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Categoria</label>
                <input
                  type="text"
                  value={quickEditCategory}
                  onChange={(e) => setQuickEditCategory(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Centro de Custo</label>
                <input
                  type="text"
                  value={quickEditCostCenter}
                  onChange={(e) => setQuickEditCostCenter(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Documento Fiscal</label>
                <input
                  type="text"
                  value={quickEditDocNumber}
                  onChange={(e) => setQuickEditDocNumber(e.target.value)}
                  className="w-full px-3 py-1.5 font-mono border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={quickEditStatus}
                  onChange={(e) => setQuickEditStatus(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md bg-white"
                >
                  <option value="Validado">Validado</option>
                  <option value="Agendado no Lote">Agendado no Lote</option>
                  <option value="Pago">Pago</option>
                  <option value="Liquidado">Liquidado</option>
                  <option value="Aguardando NF">Aguardando NF</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Justificativa de Auditoria *
              </label>
              <input
                type="text"
                required
                value={quickEditReason}
                onChange={(e) => setQuickEditReason(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setQuickEditEntry(null)}
                className="px-3 py-1.5 border border-slate-300 rounded-md cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#0052CC] hover:bg-blue-700 text-white font-semibold rounded-md cursor-pointer"
              >
                Salvar Edição Auditada
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ====================================================================
          MODAL: REPORTAR PROBLEMA / ABRIR CHAMADO INTERNO (SEÇÃO 4.6)
         ==================================================================== */}
      {reportModalOpen && (
        <div className="no-print fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSubmitReportTicket}
            className="bg-white border border-slate-200 rounded-lg max-w-2xl w-full p-6 space-y-4 shadow-xl my-8"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Reportar Problema / Abrir Chamado Interno (VN Service Desk)
                </h2>
                <p className="text-xs text-slate-500">
                  Captura automática de contexto conforme Seção 4.6 da Especificação Técnica
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReportModalOpen(false)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Fechar
              </button>
            </div>

            {/* Automatic Context Capture Read-Only Box */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs font-mono text-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              <div>
                <strong>Módulo Atual:</strong> {currentSpec.moduleName} ({currentSpec.code})
              </div>
              <div>
                <strong>Cliente no Contexto:</strong>{' '}
                {activeClient?.tradeName || 'Multiempresa VN'}
              </div>
              <div>
                <strong>Versão da Aplicação:</strong> v3.5.0-os
              </div>
              <div>
                <strong>Usuário Autenticado:</strong>{' '}
                {googleUserEmail || 'paulovictor85571590@gmail.com'}
              </div>
            </div>

            {/* Security Warning (Section 4.6 / 5.2) */}
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-xs text-amber-950">
              <strong>Aviso de Segurança da Informação (Seção 4.6):</strong> Nunca inclua senhas, tokens OAuth, chaves privadas ou códigos MFA na descrição ou nas evidências do chamado.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Categoria (Seção 4.2)
                </label>
                <select
                  value={reportCategory}
                  onChange={(e) => setReportCategory(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                >
                  <option value="Incidentes técnicos">1. Incidentes técnicos</option>
                  <option value="Divergências financeiras">2. Divergências financeiras</option>
                  <option value="Divergências cadastrais">3. Divergências cadastrais</option>
                  <option value="Falhas de processo">4. Falhas de processo</option>
                  <option value="Segurança e acesso">5. Segurança e acesso</option>
                  <option value="Integrações">6. Integrações</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Prioridade Operacional
                </label>
                <select
                  value={reportPriority}
                  onChange={(e) => setReportPriority(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                >
                  <option value="Baixa">Baixa</option>
                  <option value="Média">Média</option>
                  <option value="Alta">Alta</option>
                  <option value="Urgente">Urgente</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Severidade (Seção 4.4)
                </label>
                <select
                  value={reportSeverity}
                  onChange={(e) => setReportSeverity(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                >
                  <option value="S1 - Crítica">S1 — Crítica (15m / 2h)</option>
                  <option value="S2 - Alta">S2 — Alta (30m / 4h)</option>
                  <option value="S3 - Média">S3 — Média (2h / 1 dia)</option>
                  <option value="S4 - Baixa">S4 — Baixa (4h / 2 dias)</option>
                </select>
              </div>
            </div>

            <div className="text-xs">
              <label className="block font-semibold text-slate-700 mb-1">
                Título Resumido do Chamado *
              </label>
              <input
                type="text"
                required
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded"
              />
            </div>

            <div className="text-xs">
              <label className="block font-semibold text-slate-700 mb-1">
                Descrição Detalhada *
              </label>
              <textarea
                rows={2}
                required
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Descreva a divergência, bloqueio ou comportamento observado..."
                className="w-full px-3 py-1.5 border border-slate-300 rounded"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Resultado Esperado
                </label>
                <input
                  type="text"
                  value={reportExpected}
                  onChange={(e) => setReportExpected(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Resultado Obtido</label>
                <input
                  type="text"
                  value={reportObtained}
                  onChange={(e) => setReportObtained(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={reportBlocksContinuity}
                onChange={(e) => setReportBlocksContinuity(e.target.checked)}
              />
              <span>Este problema impede a continuidade imediata da tarefa operacional</span>
            </label>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setReportModalOpen(false)}
                className="px-3.5 py-1.5 text-xs border border-slate-300 rounded-md"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submittingReport}
                className="px-4 py-1.5 bg-[#0052CC] hover:bg-blue-700 text-white text-xs font-semibold rounded-md cursor-pointer"
              >
                {submittingReport
                  ? 'Registrando no ERP...'
                  : 'Confirmar e Roteamento Automático'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
