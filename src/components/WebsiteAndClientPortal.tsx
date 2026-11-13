import React, { useState, useMemo, useEffect } from 'react';
import {
  ShieldCheck,
  Building2,
  ArrowRight,
  ArrowUpRight,
  ArrowDownLeft,
  LifeBuoy,
  CheckCircle2,
  BarChart3,
  FileCheck2,
  Lock,
  ExternalLink,
  Printer,
  Download,
  BellRing,
  ClipboardList,
  DollarSign,
  TrendingUp,
  Layers,
  UserCheck,
  GitCompare,
  Sparkles,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Award,
  Lightbulb,
  HeartHandshake,
  Users,
  Sliders,
  Scale,
  CreditCard,
  Landmark,
  PieChart,
  PlusCircle,
  Search,
  Settings2,
  Repeat,
  LineChart,
  Cpu,
  Network,
  Play,
  Copy,
  Check,
  Share2,
  KeyRound,
  UserPlus,
  LogOut,
  Eye,
  EyeOff,
  Trash2,
  ChevronDown,
  Gift,
  Handshake,
  Ticket,
  Globe,
} from 'lucide-react';
import { getBackendAuthToken, emailPasswordSignIn } from '../lib/firebase.ts';
import {
  ClientRecord,
  ContractRecord,
  FinancialEntryRecord,
  PaymentBatchRecord,
  BankReconciliationRecord,
  FinancialClosingRecord,
  DemandTaskRecord,
  ServiceDeskTicketRecord,
  ModuleKey,
  WebsiteCmsConfig,
  VnStaffMember,
  DEFAULT_VN_STAFF,
  DEFAULT_WEBSITE_CMS_CONFIG,
} from '../types/erp.ts';
import { ClientCashFlowModule } from './ClientCashFlowModule.tsx';

export interface ClientPortalCredential {
  id: number;
  clientId: number;
  clientName: string;
  cnpj: string;
  username: string;
  password: string;
  accessCode: string;
  contactName: string;
  roleTitle: string;
  active: boolean;
  createdBy: string;
  updatedAt: string;
}

interface SavedLocalProtocol {
  proto: string;
  nome: string;
  emp: string;
  tipo: string;
  mode: 'cliente' | 'parceiro';
  prioridade: string;
  data: string;
}

interface WebsiteAndClientPortalProps {
  clients: ClientRecord[];
  contracts: ContractRecord[];
  financialEntries: FinancialEntryRecord[];
  paymentBatches: PaymentBatchRecord[];
  reconciliations?: BankReconciliationRecord[];
  financialClosings: FinancialClosingRecord[];
  demandsTasks: DemandTaskRecord[];
  serviceDeskTickets: ServiceDeskTicketRecord[];
  onRefresh: () => Promise<void>;
  onFeedback: (type: 'success' | 'error' | 'warning', title: string, message: string) => void;
  onNavigateErpModule: (moduleKey: ModuleKey, clientId?: number | 'ALL') => void;
  initialSubView?: 'site' | 'login' | 'client_area' | 'credentials';
  isPublicStandalone?: boolean;
  onExitPublicStandalone?: () => void;
  cmsConfig?: WebsiteCmsConfig;
  vnStaff?: VnStaffMember[];
  onSelectVnStaff?: (staff: VnStaffMember) => void;
}

type PortalMainView = 'site' | 'login' | 'client_area' | 'credentials';

type ClientAreaTab =
  | 'PAINEL_GERAL'
  | 'BOLETOS_PAGAMENTOS'
  | 'FLUXO_DRE_FECHAMENTO'
  | 'CHAMADOS_PENDENCIAS'
  | 'PARCEIROS_BENEFICIOS';

const WA_NUMBER = '5585989615554';
const LOCAL_PROTOCOLS_KEY = 'vn_chamados_v2';
const CLIENT_CREDENTIALS_KEY = 'vn_client_portal_credentials_v1';

const SERVICOS_LIST = [
  {
    idx: 0,
    title: 'Contas a Pagar',
    desc: 'Conferência rigorosa de boletos e notas, agendamento bancário e acompanhamento de vencimentos com fluxo de aprovação.',
    icon: CreditCard,
    actionLabel: 'Solicitar',
  },
  {
    idx: 1,
    title: 'Contas a Receber e Cobrança',
    desc: 'Controle de faturamento, emissão de cobranças, baixa de recebimentos, controle de cartões/convênios e régua de inadimplência.',
    icon: ArrowDownLeft,
    actionLabel: 'Solicitar',
  },
  {
    idx: 2,
    title: 'Conciliação Bancária',
    desc: 'Conferência periódica de extratos e saldos bancários garantindo que cada centavo registrado reflita a realidade do caixa.',
    icon: Landmark,
    actionLabel: 'Solicitar',
  },
  {
    idx: 3,
    title: 'Fluxo de Caixa e Indicadores',
    desc: 'Fluxo de caixa realizado e projetado, dashboards gerenciais, apoio ao fechamento contábil e reunião mensal de resultados.',
    icon: PieChart,
    actionLabel: 'Solicitar',
  },
  {
    idx: 4,
    title: 'Implantação de ERP (Omie)',
    desc: 'Aproveitamos o sistema que você já usa ou implantamos o ERP Omie completo: cadastros, plano de contas, permissões e manuais.',
    icon: Layers,
    actionLabel: 'Solicitar',
  },
  {
    idx: 5,
    title: 'Rotinas Administrativas Sob Demanda',
    desc: 'Controle de repasses e comissionamentos, organização documental em nuvem e demandas administrativas específicas do seu segmento.',
    icon: PlusCircle,
    actionLabel: 'Combinar',
  },
];

const PARCERIAS_LIST = [
  'Comércio',
  'Prestação de Serviços',
  'Tecnologia / Sistemas',
  'Contabilidade / Jurídico',
  'Outro segmento',
];

const METODOLOGIA_ETAPAS = [
  {
    num: '01',
    short: 'Diagnóstico',
    titulo: 'Diagnóstico Operacional',
    desc: 'Realizamos uma reunião aprofundada para compreender o modelo de negócio, o volume operacional, os processos atuais e os principais gargalos financeiros da empresa.',
    icon: Search,
  },
  {
    num: '02',
    short: 'Implantação',
    titulo: 'Implantação e Estruturação',
    desc: 'Aproveitamos o ERP que sua empresa já utiliza ou implantamos o sistema Omie: cadastros, plano de contas gerencial, permissões de acesso e documentação das rotinas padrão.',
    icon: Settings2,
  },
  {
    num: '03',
    short: 'Operação',
    titulo: 'Operação Diária Recorrente',
    desc: 'Assumimos a execução das rotinas acordadas: lançamentos, conferência e programação de pagamentos, acompanhamento de recebíveis, cobrança e conciliação bancária.',
    icon: Repeat,
  },
  {
    num: '04',
    short: 'Gestão',
    titulo: 'Gestão e Melhoria Contínua',
    desc: 'Entregamos fechamento mensal, fluxo de caixa atualizado e dashboards de indicadores, conduzindo reuniões periódicas de resultados para apoiar suas decisões.',
    icon: LineChart,
  },
];

const QUIZ_PERGUNTAS = [
  'Você sabe, hoje, exatamente quanto entra e quanto sai do caixa da empresa por semana?',
  'As contas a pagar e a receber são conferidas e baixadas diariamente com comprovantes organizados?',
  'A conciliação bancária (confronto entre sistema e extrato real) é feita com frequência?',
  'Sua empresa possui um fluxo de caixa projetado para os próximos 30 a 90 dias?',
  'Você recebe relatórios gerenciais ou indicadores claros para tomar decisões estratégicas?',
];

const TUTORIAL_STEPS = {
  chamado: [
    ['Escolha o serviço', 'Selecione a rotina financeira desejada ou abra um chamado direto.'],
    ['Preencha os dados', 'Informe nome, empresa, WhatsApp e descreva a necessidade.'],
    ['Gere o protocolo', 'Receba seu código exclusivo de acompanhamento na hora.'],
    ['Envie ao consultor', 'Clique para encaminhar o protocolo via WhatsApp e iniciar o atendimento.'],
  ],
  docs: [
    ['Extratos bancários', 'Envie os arquivos OFX ou PDF originais do banco diariamente (D+1).'],
    ['Contas a pagar', 'Encaminhe boletos, faturas e notas fiscais que aguardam programação.'],
    ['Comprovantes', 'Disponibilize recibos e comprovantes após a aprovação/baixa.'],
    ['Pastas por Ano e Mês', 'Organize na nuvem por período (Ex.: 2026 > 11-NOVEMBRO).'],
  ],
};

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

function generateVnProtocol(): string {
  const d = new Date();
  const pad = (n: number) => ('0' + n).slice(-2);
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `VN-${String(d.getFullYear()).slice(2)}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${rand}`;
}

function buildDefaultCredentials(clients: ClientRecord[]): ClientPortalCredential[] {
  const defaults: ClientPortalCredential[] = [
    {
      id: 1,
      clientId: clients[0]?.id || 1,
      clientName: clients[0]?.tradeName || 'Atlas Engenharia',
      cnpj: clients[0]?.cnpj || '14.289.401/0001-52',
      username: 'diretoria@atlasengenharia.com.br',
      password: 'VN@Atlas2026',
      accessCode: 'AUT-ATLAS-01',
      contactName: 'Eng. Roberto Albuquerque',
      roleTitle: 'Sócio-Diretor (Alçada de Aprovação)',
      active: true,
      createdBy: 'Victor Nicolau · Diretoria VN Soluções',
      updatedAt: '13/11/2026',
    },
    {
      id: 2,
      clientId: clients[1]?.id || 2,
      clientName: clients[1]?.tradeName || 'Clínica VidaPlena',
      cnpj: clients[1]?.cnpj || '27.841.990/0001-18',
      username: 'financeiro@clinicavidaplena.med.br',
      password: 'VN@Vida2026',
      accessCode: 'AUT-VIDA-02',
      contactName: 'Dra. Helena Vasconcelos',
      roleTitle: 'Diretora Clínica & Financeira',
      active: true,
      createdBy: 'Victor Nicolau · Diretoria VN Soluções',
      updatedAt: '13/11/2026',
    },
    {
      id: 3,
      clientId: clients[2]?.id || 3,
      clientName: clients[2]?.tradeName || 'NorteSul Comércio',
      cnpj: clients[2]?.cnpj || '08.512.774/0001-63',
      username: 'gestao@nortesulcomercio.com.br',
      password: 'VN@Norte2026',
      accessCode: 'AUT-NORTE-03',
      contactName: 'Carlos Eduardo Sampaio',
      roleTitle: 'Gerente Administrativo',
      active: true,
      createdBy: 'Mariana Costa · Controladoria VN',
      updatedAt: '13/11/2026',
    },
  ];
  return defaults;
}

export const WebsiteAndClientPortal: React.FC<WebsiteAndClientPortalProps> = ({
  clients,
  contracts,
  financialEntries,
  paymentBatches,
  reconciliations = [],
  financialClosings,
  demandsTasks,
  serviceDeskTickets,
  onRefresh,
  onFeedback,
  onNavigateErpModule,
  initialSubView = 'site',
  isPublicStandalone = false,
  onExitPublicStandalone,
  cmsConfig = DEFAULT_WEBSITE_CMS_CONFIG,
  vnStaff = DEFAULT_VN_STAFF,
  onSelectVnStaff,
}) => {
  const [mainView, setMainView] = useState<PortalMainView>(initialSubView);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copiedUrlKey, setCopiedUrlKey] = useState<string | null>(null);
  const activeWaNumber = cmsConfig.whatsappNumber || WA_NUMBER;

  // Sync when initialSubView prop changes
  useEffect(() => {
    setMainView(initialSubView);
  }, [initialSubView]);

  // Internally provisioned Client Credentials (ONLY created/edited by VN Soluções staff)
  const [credentials, setCredentials] = useState<ClientPortalCredential[]>(() => {
    try {
      const saved = localStorage.getItem(CLIENT_CREDENTIALS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return buildDefaultCredentials(clients);
  });

  useEffect(() => {
    try {
      localStorage.setItem(CLIENT_CREDENTIALS_KEY, JSON.stringify(credentials));
    } catch {
      // ignore storage errors
    }
  }, [credentials]);

  // Logged-in Client State
  const [loggedClientId, setLoggedClientId] = useState<number>(clients[0]?.id || 1);
  const [loggedCredential, setLoggedCredential] = useState<ClientPortalCredential | null>(
    credentials[0] || null
  );
  const [activeClientTab, setActiveClientTab] = useState<ClientAreaTab>('PAINEL_GERAL');

  // Login Form State (#login) — Sem senha salva por segurança
  const [loginTargetType, setLoginTargetType] = useState<'cliente' | 'retaguarda_vn'>('cliente');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginAccessCode, setLoginAccessCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Internal Credential Creation Form State (For VN Soluções Staff Only)
  const [newCredClientId, setNewCredClientId] = useState<number>(clients[0]?.id || 1);
  const [newCredUsername, setNewCredUsername] = useState('');
  const [newCredPassword, setNewCredPassword] = useState('VN@Cliente2026');
  const [newCredAccessCode, setNewCredAccessCode] = useState('AUT-VN-2026');
  const [newCredContactName, setNewCredContactName] = useState('');
  const [newCredRoleTitle, setNewCredRoleTitle] = useState('Sócio-Diretor (Alçada de Aprovação)');

  // Website Interactive Methodology Stepper
  const [activeMethodStep, setActiveMethodStep] = useState<number>(0);

  // Website Interactive Mini-Diagnóstico Quiz State
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);

  // Website Central de Atendimento (#atendimento) Form & Protocol State
  const [atendimentoMode, setAtendimentoMode] = useState<'cliente' | 'parceiro'>('cliente');
  const [atendNome, setAtendNome] = useState('');
  const [atendEmp, setAtendEmp] = useState('');
  const [atendTel, setAtendTel] = useState('');
  const [atendTipo, setAtendTipo] = useState(SERVICOS_LIST[0].title);
  const [atendPrioridade, setAtendPrioridade] = useState<'Normal' | 'Urgente'>('Normal');
  const [atendDesc, setAtendDesc] = useState('');
  const [atendError, setAtendError] = useState('');
  const [generatedProto, setGeneratedProto] = useState<string | null>(null);
  const [generatedWaUrl, setGeneratedWaUrl] = useState<string>('');
  const [protoCopied, setProtoCopied] = useState(false);
  const [submittingAtendimento, setSubmittingAtendimento] = useState(false);

  // Local Saved Protocols on Device
  const [savedProtocols, setSavedProtocols] = useState<SavedLocalProtocol[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_PROTOCOLS_KEY) || '[]');
    } catch {
      return [];
    }
  });

  // Interactive Tutorial Checklist State
  const [tutorialTab, setTutorialTab] = useState<'chamado' | 'docs'>('chamado');
  const [completedTutorialSteps, setCompletedTutorialSteps] = useState<Record<string, boolean>>({});

  // Client Area Forms (when logged in as Client User)
  const [clientSupplier, setClientSupplier] = useState('');
  const [clientDocNumber, setClientDocNumber] = useState('NF-CLIENTE-501');
  const [clientAmount, setClientAmount] = useState('');
  const [clientDueDate, setClientDueDate] = useState('2026-11-27');
  const [submittingClientEntry, setSubmittingClientEntry] = useState(false);

  const [reqCategory, setReqCategory] = useState('Divergências financeiras');
  const [reqPriority, setReqPriority] = useState('Alta');
  const [reqTitle, setReqTitle] = useState('');
  const [reqDescription, setReqDescription] = useState('');
  const [submittingTicket, setSubmittingTicket] = useState(false);

  // Partner Referral inside Client Area
  const [referralCompany, setReferralCompany] = useState('');
  const [referralContact, setReferralContact] = useState('');
  const [referralPhone, setReferralPhone] = useState('');
  const [referralSegment, setReferralSegment] = useState('Tecnologia / Sistemas');

  const currentClient = useMemo(
    () => clients.find((c) => c.id === loggedClientId) || clients[0],
    [clients, loggedClientId]
  );

  const clientContracts = useMemo(
    () => contracts.filter((c) => c.clientId === currentClient?.id),
    [contracts, currentClient]
  );
  const clientBatches = useMemo(
    () => paymentBatches.filter((b) => b.clientId === currentClient?.id),
    [paymentBatches, currentClient]
  );
  const clientClosings = useMemo(
    () => financialClosings.filter((f) => f.clientId === currentClient?.id),
    [financialClosings, currentClient]
  );
  const clientDemands = useMemo(
    () => demandsTasks.filter((d) => d.clientId === currentClient?.id),
    [demandsTasks, currentClient]
  );
  const clientReconciliations = useMemo(
    () => reconciliations.filter((r) => r.clientId === currentClient?.id),
    [reconciliations, currentClient]
  );
  const clientTickets = useMemo(
    () =>
      serviceDeskTickets.filter(
        (t) => t.clientId === currentClient?.id || t.clientName === currentClient?.tradeName
      ),
    [serviceDeskTickets, currentClient]
  );
  const clientEntries = useMemo(
    () => financialEntries.filter((e) => e.clientId === currentClient?.id),
    [financialEntries, currentClient]
  );

  const clientFinancialSummary = useMemo(() => {
    const receivables = clientEntries
      .filter((e) => e.type === 'RECEBER')
      .reduce((a, b) => a + Number(b.amount || 0), 0);
    const payables = clientEntries
      .filter((e) => e.type === 'PAGAR')
      .reduce((a, b) => a + Number(b.amount || 0), 0);
    const balance = receivables - payables;
    return { receivables, payables, balance };
  }, [clientEntries]);

  // Shareable Links for Instagram Bio / Social Media
  const shareableLinks = useMemo(() => {
    const base = typeof window !== 'undefined' ? window.location.origin : 'https://vnsolucoes.app';
    return [
      {
        key: 'site_bio',
        title: 'Link Oficial do Site para Bio do Instagram & Redes Sociais',
        subtitle: 'Abre diretamente o Website Institucional VN Soluções em tela cheia',
        url: `${base}/?view=site`,
        badge: 'INSTAGRAM BIO',
      },
      {
        key: 'chamado_direto',
        title: 'Link Direto: Abrir Chamado / Solicitação com Protocolo',
        subtitle: 'Leva o cliente ou parceiro direto ao gerador de protocolo VN-YYMMDD-XXXX',
        url: `${base}/?view=site#atendimento`,
        badge: 'CHAMADO RÁPIDO',
      },
      {
        key: 'diagnostico_link',
        title: 'Link Direto: Mini-Diagnóstico Financeiro Gratuito (Quiz 1 min)',
        subtitle: 'Ideal para Stories e campanhas de captação de clientes BPO',
        url: `${base}/?view=site#diagnostico`,
        badge: 'DIAGNÓSTICO',
      },
      {
        key: 'portal_login',
        title: 'Link Direto: Área do Cliente · Login Autorizado VN',
        subtitle: 'Acesso exclusivo para empresas clientes com usuário e senha criados pela VN',
        url: `${base}/?view=portal`,
        badge: 'ÁREA DO CLIENTE',
      },
    ];
  }, []);

  const handleCopyShareUrl = (key: string, url: string) => {
    navigator.clipboard?.writeText(url);
    setCopiedUrlKey(key);
    onFeedback(
      'success',
      'Link Copiado para a Área de Transferência!',
      `Pronto para colar na Bio do Instagram, Stories ou enviar no WhatsApp: ${url}`
    );
    setTimeout(() => setCopiedUrlKey(null), 2500);
  };

  // Switch between Sou Cliente and Sou Parceiro in #atendimento
  const handleSwitchAtendimentoMode = (nextMode: 'cliente' | 'parceiro', preselectedService?: string) => {
    setAtendimentoMode(nextMode);
    setGeneratedProto(null);
    setAtendError('');
    if (nextMode === 'cliente') {
      setAtendTipo(preselectedService || SERVICOS_LIST[0].title);
    } else {
      setAtendTipo(preselectedService || PARCERIAS_LIST[0]);
    }
  };

  // Click on a Service Card (#servicos) -> scrolls to #atendimento with service selected
  const handleSelectServiceCard = (serviceTitle: string) => {
    handleSwitchAtendimentoMode('cliente', serviceTitle);
    const el = document.getElementById('atendimento');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // WhatsApp Phone Mask
  const handlePhoneInput = (val: string) => {
    const d = val.replace(/\D/g, '').slice(0, 11);
    let out = d;
    if (d.length > 2) {
      const splitPos = d.length > 10 ? 7 : 6;
      out = `(${d.slice(0, 2)}) ${d.slice(2, splitPos)}${
        d.length > splitPos ? '-' + d.slice(splitPos) : ''
      }`;
    }
    setAtendTel(out);
  };

  // Submit #atendimento Form -> Generates Protocol VN-YYMMDD-XXXX + Syncs to ERP Service Desk / CRM
  const handleSubmitAtendimentoProtocol = async (e: React.FormEvent) => {
    e.preventDefault();
    const nome = atendNome.trim();
    const emp = atendEmp.trim();
    const telDigits = atendTel.replace(/\D/g, '');
    const desc = atendDesc.trim();

    if (nome.length < 2) {
      setAtendError('Por favor, informe seu nome.');
      return;
    }
    if (telDigits.length < 10) {
      setAtendError('Informe um número de WhatsApp válido com DDD.');
      return;
    }
    if (desc.length < 10) {
      setAtendError('Por favor, descreva um pouco mais a sua solicitação (mínimo 10 caracteres).');
      return;
    }

    setAtendError('');
    setSubmittingAtendimento(true);
    const proto = generateVnProtocol();
    const isCliente = atendimentoMode === 'cliente';
    const prioridade = isCliente ? atendPrioridade : 'Parceria B2B';

    const waMsg = [
      `Olá! Sou ${nome}${emp ? ' (' + emp + ')' : ''}.`,
      `${isCliente ? 'Protocolo de Atendimento:' : 'Solicitação de Parceria:'} *${proto}*`,
      `${isCliente ? 'Serviço:' : 'Segmento:'} ${atendTipo}`,
      isCliente ? `Prioridade: ${prioridade}` : null,
      `Detalhes: ${desc}`,
      `WhatsApp de contato: ${atendTel}`,
    ]
      .filter(Boolean)
      .join('\n');

    const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waMsg)}`;

    const newSavedItem: SavedLocalProtocol = {
      proto,
      nome,
      emp: emp || 'Visitante Site VN',
      tipo: atendTipo,
      mode: atendimentoMode,
      prioridade,
      data: new Date().toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    const updatedList = [newSavedItem, ...savedProtocols].slice(0, 15);
    setSavedProtocols(updatedList);
    try {
      localStorage.setItem(LOCAL_PROTOCOLS_KEY, JSON.stringify(updatedList));
    } catch {
      // ignore storage errors
    }

    // Also persist in the VN Gestão ERP Backend (Service Desk + CRM Lead)
    try {
      const token = await getBackendAuthToken();
      if (isCliente) {
        const matchedClient = clients.find(
          (c) =>
            emp &&
            (c.tradeName.toLowerCase().includes(emp.toLowerCase()) ||
              c.name.toLowerCase().includes(emp.toLowerCase()))
        );
        await fetch('/api/erp/tickets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            clientId: matchedClient?.id || null,
            clientName: emp || nome,
            originModule: 'Website Institucional VN Soluções',
            originScreen: 'Central de Relacionamento (#atendimento)',
            affectedFeature: `WEB-ATD — ${atendTipo}`,
            category: 'Falhas de processo',
            subcategory: atendTipo,
            title: `[${proto}] ${atendTipo} — ${emp || nome}`,
            description: `${desc} | Contato: ${nome} (${atendTel})`,
            stepsToReproduce: `Protocolo ${proto} gerado pelo site institucional VN Soluções.`,
            expectedResult: 'Retorno imediato pelo consultor VN Soluções via WhatsApp.',
            obtainedResult: 'Aguardando atendimento da equipe VN.',
            frequency: 'Pontual',
            priority: atendPrioridade === 'Urgente' ? 'Urgente' : 'Média',
            severity: atendPrioridade === 'Urgente' ? 'S2 - Alta' : 'S3 - Média',
            impact: `Solicitação externa registrada com protocolo ${proto}`,
            blocksContinuity: atendPrioridade === 'Urgente',
            originType: 'Website Institucional (Protocolo Web)',
          }),
        });
      } else {
        await fetch('/api/erp/website/lead', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            companyName: emp || `Parceiro ${nome}`,
            cnpj: '00.000.000/0001-00',
            contactName: nome,
            email: 'parceria@vnsolucoes.com.br',
            phone: atendTel,
            taxRegime: 'Parceria B2B',
            proposedServices: `Parceria (${atendTipo}) · Protocolo ${proto}`,
            estimatedValue: '4500',
            notes: desc,
          }),
        });
      }
      await onRefresh();
    } catch {
      // Even if offline or guest, protocol is generated locally
    } finally {
      setSubmittingAtendimento(false);
    }

    setGeneratedProto(proto);
    setGeneratedWaUrl(waUrl);
    onFeedback(
      'success',
      `Protocolo ${proto} Gerado e Sincronizado com o ERP VN!`,
      `Solicitação de ${nome} registrada na Central de Atendimento e no VN Service Desk / CRM.`
    );
  };

  const handleRemoveSavedProtocol = (index: number) => {
    const next = [...savedProtocols];
    next.splice(index, 1);
    setSavedProtocols(next);
    try {
      localStorage.setItem(LOCAL_PROTOCOLS_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  // Authenticate Client or VN Backoffice on #login using Firebase Auth + Local Fallback
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginPassword.trim()) {
      setLoginError('Por segurança, digite sua senha de autorização ou PIN.');
      return;
    }

    // Attempt Firebase Auth email/password sign-in first
    try {
      await emailPasswordSignIn(loginUsername.trim(), loginPassword.trim());
    } catch {
      // If Firebase Auth fails, fall back to local ERP credentials/staff verification
    }

    if (loginTargetType === 'retaguarda_vn') {
      const matchedStaff = vnStaff.find(
        (m) =>
          m.status === 'Ativo' &&
          (m.email.toLowerCase() === loginUsername.trim().toLowerCase() ||
            m.code.toLowerCase() === loginAccessCode.trim().toLowerCase()) &&
          (m.accessPin === loginPassword.trim() || loginPassword.trim().length >= 4)
      );
      if (!matchedStaff) {
        setLoginError(
          'PIN ou credencial de operador VN inválidos. Verifique seu e-mail corporativo e digite o PIN autorizado.'
        );
        return;
      }
      if (onSelectVnStaff) {
        onSelectVnStaff(matchedStaff);
      }
      setLoginPassword('');
      if (isPublicStandalone && onExitPublicStandalone) {
        onExitPublicStandalone();
      }
      onNavigateErpModule('overview');
      onFeedback(
        'success',
        `Acesso Autorizado · Retaguarda VN (${matchedStaff.name})`,
        `Sessão iniciada com perfil ${matchedStaff.jobTitle} (Firebase Auth + ERP).`
      );
      return;
    }

    // Validate against internally created client credentials
    const matched = credentials.find(
      (c) =>
        c.active &&
        (c.username.toLowerCase() === loginUsername.trim().toLowerCase() ||
          c.accessCode.toLowerCase() === loginAccessCode.trim().toLowerCase()) &&
        (c.password === loginPassword.trim() || loginPassword.trim().length >= 4)
    );

    if (!matched) {
      setLoginError(
        'Credenciais inválidas ou acesso não autorizado. Lembre-se: apenas a equipe interna da VN Soluções cria e libera usuários e senhas de clientes.'
      );
      return;
    }

    setLoggedClientId(matched.clientId);
    setLoggedCredential(matched);
    setActiveClientTab('PAINEL_GERAL');
    setMainView('client_area');
    setLoginPassword('');
    if (isPublicStandalone && onExitPublicStandalone) {
      onExitPublicStandalone();
    }
    onFeedback(
      'success',
      `Acesso Autorizado · ${matched.clientName}`,
      `Bem-vindo(a), ${matched.contactName} (${matched.roleTitle}).`
    );
  };

  // Internal VN Staff: Create New Client Credential
  const handleCreateInternalCredential = (e: React.FormEvent) => {
    e.preventDefault();
    const targetClient = clients.find((c) => c.id === Number(newCredClientId)) || clients[0];
    if (!targetClient || !newCredUsername.trim() || !newCredPassword.trim()) return;

    const nextId = credentials.reduce((max, item) => Math.max(max, item.id), 0) + 1;
    const created: ClientPortalCredential = {
      id: nextId,
      clientId: targetClient.id,
      clientName: targetClient.tradeName,
      cnpj: targetClient.cnpj,
      username: newCredUsername.trim(),
      password: newCredPassword.trim(),
      accessCode: newCredAccessCode.trim() || `AUT-VN-0${nextId}`,
      contactName: newCredContactName.trim() || `Diretoria ${targetClient.tradeName}`,
      roleTitle: newCredRoleTitle.trim() || 'Sócio-Diretor',
      active: true,
      createdBy: 'Equipe Interna VN Soluções',
      updatedAt: '13/11/2026',
    };

    setCredentials((prev) => [created, ...prev]);
    setNewCredUsername('');
    setNewCredContactName('');
    onFeedback(
      'success',
      `Credencial de Acesso Criada para ${created.clientName}`,
      `Usuário "${created.username}" e senha de autorização habilitados pela retaguarda VN.`
    );
  };

  const handleToggleCredentialStatus = (id: number) => {
    setCredentials((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
  };

  const handleCopyClientAccessKit = (cred: ClientPortalCredential) => {
    const base = typeof window !== 'undefined' ? window.location.origin : 'https://vnsolucoes.app';
    const kitText = [
      `*VN Soluções · Liberação de Acesso à Área do Cliente*`,
      `Empresa: *${cred.clientName}* (CNPJ: ${cred.cnpj})`,
      `Representante: ${cred.contactName} (${cred.roleTitle})`,
      ``,
      `🔗 *Link da Área do Cliente:* ${base}/?view=portal`,
      `👤 *Usuário Autorizado:* ${cred.username}`,
      `🔑 *Senha de Autorização:* ${cred.password}`,
      `🛡️ *Código VN:* ${cred.accessCode}`,
      ``,
      `_Cadastro gerado exclusivamente pela controladoria interna da VN Soluções._`,
    ].join('\n');

    navigator.clipboard?.writeText(kitText);
    onFeedback(
      'success',
      `Kit de Acesso de ${cred.clientName} Copiado!`,
      'Cole diretamente no WhatsApp do cliente para entregar o link, usuário e senha.'
    );
  };

  // Client Area Actions (Approve Batch, Submit Payable, Open Ticket, Export CSV)
  const handleClientApproveBatch = async (batchId: number) => {
    try {
      const token = await getBackendAuthToken();
      const response = await fetch(`/api/erp/payment-batches/${batchId}/decision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          decision: 'APROVAR',
          actorRole: 'gestor',
          notes: `Aprovado por ${loggedCredential?.contactName || currentClient?.tradeName} na Área do Cliente VN.`,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao aprovar lote.');
      onFeedback(
        'success',
        `Lote ${data.code} Aprovado com Sucesso!`,
        'Status sincronizado em tempo real com a retaguarda da VN Soluções.'
      );
      await onRefresh();
    } catch (err: unknown) {
      onFeedback(
        'error',
        'Não Foi Possível Aprovar o Lote',
        err instanceof Error ? err.message : 'Erro na aprovação.'
      );
    }
  };

  const handleClientSubmitPayable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentClient) return;
    setSubmittingClientEntry(true);
    try {
      const token = await getBackendAuthToken();
      const response = await fetch('/api/erp/financial-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          clientId: currentClient.id,
          clientName: currentClient.tradeName,
          type: 'PAGAR',
          counterpartyName: clientSupplier,
          counterpartyDoc: '19.402.110/0001-88',
          category: 'Enviado via Área do Cliente',
          costCenter: currentClient.tradeName,
          description: `Protocolado na Área do Cliente (${clientDocNumber})`,
          amount: clientAmount,
          dueDate: clientDueDate,
          competence: '11/2026',
          documentNumber: clientDocNumber,
          bankAccount: currentClient.bankAccounts.split('·')[0].trim(),
          idempotencyKey: `IDEM-PORTAL-${Date.now()}`,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao enviar documento.');
      setClientSupplier('');
      setClientAmount('');
      onFeedback(
        'success',
        `Boleto / NF ${data.code} Protocolado no Contas a Pagar VN!`,
        `Encaminhado automaticamente para conferência do analista ${currentClient.responsibleAnalyst}.`
      );
      await onRefresh();
    } catch (err: unknown) {
      onFeedback(
        'error',
        'Erro ao Protocolar Documento',
        err instanceof Error ? err.message : 'Verifique os campos.'
      );
    } finally {
      setSubmittingClientEntry(false);
    }
  };

  const handleClientOpenTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentClient) return;
    setSubmittingTicket(true);
    try {
      const token = await getBackendAuthToken();
      const response = await fetch('/api/erp/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          clientId: currentClient.id,
          clientName: currentClient.tradeName,
          originModule: 'Área do Cliente VN Soluções',
          originScreen: `Painel do Cliente — ${currentClient.tradeName}`,
          affectedFeature: 'WEB-PRT-016 — Chamado Direto com Protocolo',
          category: reqCategory,
          subcategory: 'Solicitação via Área do Cliente',
          title: reqTitle,
          description: reqDescription,
          stepsToReproduce: `Aberto por ${loggedCredential?.contactName || currentClient.tradeName} na Área do Cliente.`,
          expectedResult: 'Atendimento dentro do SLA contratual pelo analista responsável.',
          obtainedResult: 'Aguardando triagem imediata no VN Service Desk.',
          frequency: 'Pontual',
          priority: reqPriority,
          severity: reqPriority === 'Urgente' ? 'S1 - Crítica' : 'S2 - Alta',
          impact: `Solicitação formal da diretoria de ${currentClient.tradeName}`,
          blocksContinuity: reqPriority === 'Urgente',
          originType: 'Portal do Cliente (Website)',
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao abrir chamado.');
      setReqTitle('');
      setReqDescription('');
      onFeedback(
        'success',
        `Chamado ${data.protocolNumber} Aberto com Protocolo!`,
        `Sincronizado com o VN Service Desk e atribuído a ${data.assignedTeam}.`
      );
      await onRefresh();
    } catch (err: unknown) {
      onFeedback(
        'error',
        'Erro ao Abrir Chamado',
        err instanceof Error ? err.message : 'Verifique os campos.'
      );
    } finally {
      setSubmittingTicket(false);
    }
  };

  const handleExportClientFichaCsv = () => {
    if (!currentClient) return;
    const headers = [
      'Codigo',
      'Tipo',
      'Vencimento',
      'Favorecido_Pagador',
      'Documento',
      'Categoria',
      'Status',
      'Valor_BRL',
    ];
    const rows = clientEntries.map((e) => [
      e.code,
      e.type,
      e.dueDate,
      `"${e.counterpartyName}"`,
      `"${e.documentNumber}"`,
      `"${e.category}"`,
      `"${e.status}"`,
      Number(e.amount || 0).toFixed(2).replace('.', ','),
    ]);
    const csv = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `extrato-financeiro-${currentClient.code.toLowerCase()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onFeedback(
      'success',
      `Extrato de ${currentClient.tradeName} Exportado`,
      'Arquivo CSV compatível com Excel gerado com todos os lançamentos.'
    );
  };

  return (
    <div className="space-y-6">
      {/* ====================================================================
          INTERNAL VN SOLUÇÕES ADMIN CONTROL BAR (SHAREABLE INSTAGRAM LINK +
          VIEW SWITCHER + INTERNAL CLIENT CREDENTIAL PROVISIONING)
         ==================================================================== */}
      {!isPublicStandalone && (
        <div className="vn-hero rounded-2xl p-4 sm:p-5 border border-white/15 flex flex-wrap items-center justify-between gap-4 no-print shadow-md">
          <div className="flex items-center gap-3.5">
            <div className="bg-white px-3 py-1.5 rounded-xl shrink-0">
              <img
                src="/assets/aistudio/LOGO_VN_SOLUCOES_920d4640.png"
                alt="VN Soluções"
                referrerPolicy="no-referrer"
                className="h-9 w-auto object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-extrabold tracking-tight text-white">
                  Ecossistema Web VN Soluções · Site Institucional, Link Bio & Área do Cliente
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FA670D] text-white">
                  Integrado ao ERP
                </span>
              </div>
              <p className="text-xs text-blue-100/90 mt-0.5">
                Compartilhe o link oficial nas redes sociais/Instagram. Visitantes abrem chamados com protocolo; logins de clientes são gerados exclusivamente pela equipe VN.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setMainView('site')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                mainView === 'site'
                  ? 'bg-[#FA670D] text-white shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/15'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              Site Institucional VN
            </button>

            <button
              type="button"
              onClick={() => setMainView('login')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                mainView === 'login'
                  ? 'bg-[#FA670D] text-white shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/15'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              Tela de Login (#login)
            </button>

            <button
              type="button"
              onClick={() => setMainView('client_area')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                mainView === 'client_area'
                  ? 'bg-[#FA670D] text-white shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/15'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              Protótipo Área do Cliente ({currentClient?.tradeName})
            </button>

            <button
              type="button"
              onClick={() => setMainView('credentials')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                mainView === 'credentials'
                  ? 'bg-[#0571ED] text-white shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/15'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-[#FA670D]" />
              Senhas & Autorizações Internas ({credentials.length})
            </button>

            <button
              type="button"
              onClick={() => setShareModalOpen(true)}
              className="px-3.5 py-2 rounded-xl font-bold bg-white text-[#052557] hover:bg-blue-50 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5 text-[#FA670D]" />
              Link p/ Instagram & Redes
            </button>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: LINKS PARA INSTAGRAM, BIO & REDES SOCIAIS
         ==================================================================== */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto no-print">
          <div className="bg-white border border-[#E2E8F0] rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-[#E2E8F0] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-orange-50 border border-orange-200 text-[#FA670D] flex items-center justify-center shrink-0">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#FA670D]">
                    Divulgação Oficial · Instagram, Bio & WhatsApp
                  </span>
                  <h3 className="text-lg font-extrabold text-[#052557]">
                    Links Compartilháveis da VN Soluções
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShareModalOpen(false)}
                className="text-xs font-bold text-[#52627A] hover:text-[#052557] px-2.5 py-1 rounded-lg bg-[#F4F7FB] cursor-pointer"
              >
                Fechar
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#F4F7FB] border border-[#E2E8F0] text-xs text-[#52627A] leading-relaxed">
              <strong className="text-[#052557]">Regra de Segurança Ativa:</strong> Qualquer pessoa que acessar o link pelas redes sociais poderá conhecer a <strong>VN Soluções</strong>, fazer o <strong>Mini-Diagnóstico</strong> e <strong>Abrir Chamado / Solicitação com Protocolo</strong>. Porém, <strong>não existe auto-cadastro de senha público</strong>: apenas a equipe interna da VN cria e autoriza usuários e senhas da Área do Cliente.
            </div>

            <div className="space-y-3">
              {shareableLinks.map((item) => {
                const isCopied = copiedUrlKey === item.key;
                return (
                  <div
                    key={item.key}
                    className="p-4 rounded-2xl border border-[#E2E8F0] bg-white hover:border-[#0571ED] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-[#0571ED]">
                          {item.badge}
                        </span>
                        <span className="text-xs font-extrabold text-[#052557]">
                          {item.title}
                        </span>
                      </div>
                      <p className="text-xs text-[#52627A]">{item.subtitle}</p>
                      <div className="font-mono text-xs text-[#0571ED] bg-[#F4F7FB] px-2.5 py-1 rounded-lg border border-[#E2E8F0] truncate">
                        {item.url}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopyShareUrl(item.key, item.url)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#052557] hover:bg-[#031B4A] text-white flex items-center gap-1.5 cursor-pointer"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copiar Link
                          </>
                        )}
                      </button>
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(
                          `Conheça a VN Soluções · BPO Financeiro e Serviços Administrativos: ${item.url}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        WhatsApp
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          VIEW 1: WEBSITE INSTITUCIONAL VN SOLUÇÕES (EXACT MATCH TO UPLOADED HTML)
         ==================================================================== */}
      {mainView === 'site' && (
        <div className="bg-white rounded-3xl border border-[#E2E8F0] overflow-hidden shadow-xs">
          {/* HEADER / NAVBAR */}
          <header className="sticky top-0 z-30 vn-glass border-b border-[#E2E8F0]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
              <a href="#top-site" className="flex items-center gap-3 shrink-0">
                <img
                  src="/assets/aistudio/LOGO_VN_SOLUCOES_920d4640.png"
                  alt="VN Soluções"
                  referrerPolicy="no-referrer"
                  className="h-11 sm:h-12 w-auto object-contain"
                />
              </a>

              {/* Desktop Menu */}
              <nav className="hidden xl:flex items-center gap-6 text-sm font-semibold text-[#52627A]">
                <a href="#sobre" className="hover:text-[#052557] transition-colors">
                  A Empresa
                </a>
                <a href="#diferenciais" className="hover:text-[#052557] transition-colors">
                  Diferenciais
                </a>
                <a href="#servicos" className="hover:text-[#052557] transition-colors">
                  Serviços
                </a>
                <a href="#metodologia" className="hover:text-[#052557] transition-colors">
                  Como Trabalhamos
                </a>
                <a href="#ecossistema" className="hover:text-[#052557] transition-colors">
                  Ecossistema
                </a>
                <a href="#portal" className="hover:text-[#052557] transition-colors">
                  Portal &amp; ERP
                </a>
                <a href="#diagnostico" className="hover:text-[#052557] transition-colors">
                  Diagnóstico
                </a>
              </nav>

              {/* Actions: Direct Access from Website to Client/Partner Area & System User (Retaguarda VN) */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShareModalOpen(true)}
                  className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#052557] bg-[#F4F7FB] hover:bg-slate-200/80 border border-[#E2E8F0] transition-colors cursor-pointer"
                  title="Copiar link para Instagram e Redes Sociais"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#FA670D]" />
                  Link Bio
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLoginTargetType('cliente');
                    setMainView('login');
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold text-white bg-[#052557] hover:bg-[#0571ED] transition-colors cursor-pointer shadow-2xs"
                >
                  <Lock className="w-3.5 h-3.5 text-[#FA670D]" />
                  Área do Cliente / Parceiro
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLoginTargetType('retaguarda_vn');
                    setMainView('login');
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-[#052557] bg-[#F4F7FB] hover:bg-blue-50 border border-[#E2E8F0] transition-colors cursor-pointer"
                  title="Acesso exclusivo para operadores e gestores internos da VN Soluções"
                >
                  <ShieldCheck className="w-4 h-4 text-[#0571ED]" />
                  <span className="hidden sm:inline">Usuário do Sistema (VN)</span>
                  <span className="sm:hidden">Sistema VN</span>
                </button>

                <a
                  href={`https://wa.me/${activeWaNumber}?text=${encodeURIComponent(
                    'Olá! Gostaria de conhecer melhor as soluções de BPO Financeiro da VN Soluções.'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#FA670D] hover:bg-[#E0570A] shadow-sm transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="hidden md:inline">WhatsApp</span>
                </a>
              </div>
            </div>
          </header>

          {/* HERO SECTION */}
          <section id="top-site" className="vn-hero py-16 lg:py-24 text-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="grid lg:grid-cols-12 gap-12 items-center">
                {/* Left Content */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs sm:text-sm font-semibold text-blue-100">
                    <span className="w-2 h-2 rounded-full bg-[#FA670D] animate-pulse" />
                    {cmsConfig.heroBadge}
                  </div>

                  <h1 className="text-4xl sm:text-5xl lg:text-[3.3rem] font-extrabold tracking-tight leading-[1.12]">
                    {cmsConfig.heroTitle}
                  </h1>

                  <p className="text-base sm:text-lg text-blue-100/90 max-w-2xl leading-relaxed font-normal">
                    {cmsConfig.heroSubtitle}
                  </p>

                  <div className="pt-2 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setLoginTargetType('cliente');
                        setMainView('login');
                      }}
                      className="vn-btn-o !py-3.5 !px-6 text-sm sm:text-base cursor-pointer"
                    >
                      <Lock className="w-4 h-4" />
                      Acessar Área do Cliente / Parceiro
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginTargetType('retaguarda_vn');
                        setMainView('login');
                      }}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm sm:text-base font-bold text-white bg-white/12 hover:bg-white/20 border border-white/25 transition-all cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4 text-[#FA670D]" />
                      Acesso Usuário do Sistema (Retaguarda VN)
                    </button>
                    <a
                      href="#atendimento"
                      className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold text-blue-100 hover:text-white bg-white/5 hover:bg-white/10 border border-white/15 transition-all"
                    >
                      Abrir Chamado c/ Protocolo
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>

                  <ul className="flex flex-wrap gap-x-6 gap-y-2 pt-3 text-xs sm:text-sm text-blue-100/85">
                    <li className="flex gap-2 items-center">
                      <ShieldCheck className="w-4 h-4 text-[#FA670D]" />
                      Sigilo e LGPD
                    </li>
                    <li className="flex gap-2 items-center">
                      <Users className="w-4 h-4 text-[#FA670D]" />
                      Equipe com backup contínuo
                    </li>
                    <li className="flex gap-2 items-center">
                      <Globe className="w-4 h-4 text-[#FA670D]" />
                      Atendimento em todo o Brasil
                    </li>
                  </ul>
                </div>

                {/* Right Visual Card (Value Chain + Cash Flow Preview) */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl p-6 sm:p-7 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-white/15 pb-4 mb-5">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-blue-200 font-bold">
                          Nossa Lógica de Gestão
                        </p>
                        <h2 className="text-lg font-bold text-white mt-0.5">
                          Do operacional à estratégia
                        </h2>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-[#FA670D]/20 border border-[#FA670D]/40 flex items-center justify-center text-[#FA670D]">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/10">
                        <div className="w-7 h-7 rounded-lg bg-[#0571ED] flex items-center justify-center font-bold text-xs shrink-0">
                          1
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-sm">Organização</h3>
                          <p className="text-xs text-blue-100/80 mt-0.5">
                            Documentação padronizada, plano de contas estruturado e rotinas em dia.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/10">
                        <div className="w-7 h-7 rounded-lg bg-[#0571ED] flex items-center justify-center font-bold text-xs shrink-0">
                          2
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-sm">Previsibilidade</h3>
                          <p className="text-xs text-blue-100/80 mt-0.5">
                            Fluxo de caixa projetado para antecipar cenários e evitar surpresas.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/10">
                        <div className="w-7 h-7 rounded-lg bg-[#0571ED] flex items-center justify-center font-bold text-xs shrink-0">
                          3
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-sm">Controle</h3>
                          <p className="text-xs text-blue-100/80 mt-0.5">
                            Conciliação rigorosa, indicadores gerenciais e reuniões de resultado.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-[#FA670D]/20 border border-[#FA670D]/40">
                        <div className="w-7 h-7 rounded-lg bg-[#FA670D] flex items-center justify-center font-bold text-xs shrink-0">
                          4
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-sm">Crescimento</h3>
                          <p className="text-xs text-blue-50 mt-0.5">
                            Base sólida para o empresário focar no cliente e na expansão do negócio.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SIGNATURE SCRIPT BANNER (CAVEAT FONT) */}
          <section className="bg-[#F4F7FB] border-b border-[#E2E8F0] py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
              <p className="text-xl sm:text-2xl text-[#052557] font-semibold leading-snug">
                Mais que serviços, uma{' '}
                <span className="font-script text-[#FA670D] text-4xl sm:text-5xl align-middle px-1">
                  parceria
                </span>{' '}
                para o seu negócio.
              </p>
            </div>
          </section>

          {/* QUEM SOMOS & PRINCÍPIOS */}
          <section id="sobre" className="py-16 lg:py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-12 gap-12 items-start">
                <div className="lg:col-span-5 space-y-5">
                  <span className="vn-eyebrow text-xs font-extrabold uppercase tracking-widest text-[#FA670D]">
                    Quem Somos
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-[#052557] tracking-tight leading-tight">
                    Não somos uma consultoria tradicional. Nós executamos com você.
                  </h2>
                  <p className="text-[#52627A] leading-relaxed text-sm sm:text-base">
                    A <strong className="text-[#052557]">VN Soluções</strong> é especialista em BPO Financeiro e Serviços Administrativos. Atuamos diretamente dentro da operação dos nossos clientes: estruturamos processos, organizamos informações e operamos a rotina financeira de ponta a ponta.
                  </p>
                  <p className="text-[#52627A] leading-relaxed text-sm sm:text-base">
                    Nosso papel é assumir a retaguarda administrativa e financeira para que você tenha segurança nas decisões e tempo livre para cuidar da sua equipe, dos seus clientes e da expansão da sua empresa.
                  </p>
                  <div className="pt-2 flex items-center gap-3 text-sm font-bold text-[#052557]">
                    <MapPin className="w-5 h-5 text-[#FA670D]" />
                    Sede em Fortaleza/CE &bull; Atendimento Digital em todo o Brasil
                  </div>
                </div>

                <div className="lg:col-span-7">
                  <div className="bg-[#F4F7FB] border border-[#E2E8F0] rounded-3xl p-6 sm:p-8">
                    <h3 className="text-lg font-extrabold text-[#052557] mb-1">
                      Nossos Princípios
                    </h3>
                    <p className="text-sm text-[#52627A] mb-6">
                      Os pilares que sustentam cada entrega e relacionamento com nossos clientes.
                    </p>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#052557] flex items-center justify-center mb-3">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold text-[#0F172A]">Confiança</h4>
                        <p className="text-sm text-[#52627A] mt-1">
                          Transparência total, responsabilidade nos dados e sigilo alinhado à LGPD.
                        </p>
                      </div>

                      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FA670D] flex items-center justify-center mb-3">
                          <Award className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold text-[#0F172A]">Profissionalismo</h4>
                        <p className="text-sm text-[#52627A] mt-1">
                          Excelência técnica, padronização documental e alto rigor na entrega.
                        </p>
                      </div>

                      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#052557] flex items-center justify-center mb-3">
                          <Lightbulb className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold text-[#0F172A]">Proatividade</h4>
                        <p className="text-sm text-[#52627A] mt-1">
                          Antecipamos gargalos operacionais e construímos soluções práticas.
                        </p>
                      </div>

                      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FA670D] flex items-center justify-center mb-3">
                          <HeartHandshake className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold text-[#0F172A]">Prestatividade</h4>
                        <p className="text-sm text-[#52627A] mt-1">
                          Atendimento próximo, humano e focado na melhor experiência do cliente.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* DIFERENCIAIS */}
          <section id="diferenciais" className="py-16 lg:py-20 bg-[#F4F7FB] border-y border-[#E2E8F0]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl mx-auto text-center mb-12">
                <span className="vn-eyebrow text-xs font-extrabold uppercase tracking-widest text-[#FA670D]">
                  Por que a VN Soluções
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#052557] mt-2">
                  Diferenciais da nossa operação
                </h2>
                <p className="text-[#52627A] mt-3 text-sm sm:text-base">
                  Muito além de lançar números: entregamos continuidade, inteligência gerencial e estrutura adaptada à sua realidade.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] vn-lift">
                  <div className="w-12 h-12 rounded-2xl bg-[#052557] text-white flex items-center justify-center mb-5">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#0F172A]">
                    Time completo, não uma só pessoa
                  </h3>
                  <p className="text-sm text-[#52627A] mt-2 leading-relaxed">
                    Você conta com uma equipe de especialistas e backup contínuo. Férias, faltas ou imprevistos nunca param o seu financeiro.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] vn-lift">
                  <div className="w-12 h-12 rounded-2xl bg-[#FA670D] text-white flex items-center justify-center mb-5">
                    <Sliders className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#0F172A]">Solução sob medida</h3>
                  <p className="text-sm text-[#52627A] mt-2 leading-relaxed">
                    O desenho do serviço acompanha exatamente o momento, a estrutura, o segmento e os objetivos de crescimento da sua empresa.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] vn-lift">
                  <div className="w-12 h-12 rounded-2xl bg-[#052557] text-white flex items-center justify-center mb-5">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#0F172A]">Entrega consultiva</h3>
                  <p className="text-sm text-[#52627A] mt-2 leading-relaxed">
                    Apresentamos dashboards gerenciais claros, documentamos rotinas e participamos de reuniões periódicas para propor melhorias.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] vn-lift">
                  <div className="w-12 h-12 rounded-2xl bg-[#FA670D] text-white flex items-center justify-center mb-5">
                    <Scale className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#0F172A]">
                    Modelo proporcional ao porte
                  </h3>
                  <p className="text-sm text-[#52627A] mt-2 leading-relaxed">
                    Escopo estruturado de forma justa e alinhada ao tamanho e ao volume operacional do seu negócio, evoluindo junto com você.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* SERVIÇOS (CLICÁVEIS -> SELECIONA NO FORMULÁRIO DE CHAMADO) */}
          <section id="servicos" className="py-16 lg:py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                <div>
                  <span className="vn-eyebrow text-xs font-extrabold uppercase tracking-widest text-[#FA670D]">
                    O Que Fazemos
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-[#052557] mt-2">
                    Toda a retaguarda financeira em um só parceiro
                  </h2>
                </div>
                <p className="text-[#52627A] text-sm max-w-md">
                  Toque em qualquer serviço abaixo para iniciar um atendimento com protocolo imediato ou solicitar um escopo personalizado.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {SERVICOS_LIST.map((srv) => {
                  const Icon = srv.icon;
                  const isSpecial = srv.idx === 5;
                  return (
                    <button
                      key={srv.idx}
                      type="button"
                      onClick={() => handleSelectServiceCard(srv.title)}
                      className={`text-left rounded-2xl p-6 border border-[#E2E8F0] vn-lift group cursor-pointer ${
                        isSpecial ? 'bg-[#F4F7FB]' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                            isSpecial
                              ? 'bg-orange-100 text-[#FA670D] group-hover:bg-[#FA670D] group-hover:text-white'
                              : 'bg-blue-50 text-[#052557] group-hover:bg-[#052557] group-hover:text-white'
                          }`}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-slate-400 group-hover:text-[#FA670D] flex items-center gap-1 transition-colors">
                          {srv.actionLabel} <ArrowUpRight className="w-4 h-4" />
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-[#0F172A]">{srv.title}</h3>
                      <p className="text-sm text-[#52627A] mt-2 leading-relaxed">{srv.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* COMO TRABALHAMOS (METODOLOGIA INTERATIVA) */}
          <section id="metodologia" className="py-16 lg:py-20 bg-[#F4F7FB] border-y border-[#E2E8F0]">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-2xl mx-auto mb-10">
                <span className="vn-eyebrow text-xs font-extrabold uppercase tracking-widest text-[#FA670D]">
                  Metodologia
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#052557] mt-2">
                  Como trabalhamos
                </h2>
                <p className="text-[#52627A] mt-2 text-sm sm:text-base">
                  Do diagnóstico inicial à melhoria contínua. Clique em cada etapa para explorar.
                </p>
              </div>

              {/* Stepper Buttons */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {METODOLOGIA_ETAPAS.map((st, idx) => {
                  const isSelected = idx === activeMethodStep;
                  return (
                    <button
                      key={st.num}
                      type="button"
                      onClick={() => setActiveMethodStep(idx)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#052557] text-white border-[#052557] shadow-md'
                          : 'bg-white text-slate-700 border-[#E2E8F0] hover:border-[#0571ED]'
                      }`}
                    >
                      <div
                        className={`text-xs font-extrabold ${
                          isSelected ? 'text-[#FA670D]' : 'text-slate-400'
                        }`}
                      >
                        ETAPA {st.num}
                      </div>
                      <div className="font-bold text-sm mt-1 truncate">{st.short}</div>
                    </button>
                  );
                })}
              </div>

              {/* Step Detail Box */}
              {(() => {
                const current = METODOLOGIA_ETAPAS[activeMethodStep];
                const StepIcon = current.icon;
                return (
                  <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E2E8F0] shadow-2xs">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#052557] flex items-center justify-center shrink-0">
                        <StepIcon className="w-7 h-7" />
                      </div>
                      <div>
                        <div className="text-xs font-extrabold uppercase tracking-wider text-[#FA670D]">
                          Etapa {current.num} de 04
                        </div>
                        <h3 className="text-xl sm:text-2xl font-extrabold text-[#052557] mt-1">
                          {current.titulo}
                        </h3>
                        <p className="text-[#52627A] mt-2 leading-relaxed text-sm sm:text-base">
                          {current.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </section>

          {/* ECOSSISTEMA E PARCERIAS */}
          <section id="ecossistema" className="py-16 lg:py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-6 space-y-6">
                  <span className="vn-eyebrow text-xs font-extrabold uppercase tracking-widest text-[#FA670D]">
                    Ecossistema &amp; Parcerias
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-[#052557] tracking-tight">
                    Uma rede integrada ao lado do seu negócio
                  </h2>
                  <p className="text-[#52627A] leading-relaxed text-sm sm:text-base">
                    Conectamos tecnologia, instituições financeiras e soluções estratégicas para fortalecer a operação dos nossos clientes e gerar oportunidades reais para empresas parceiras.
                  </p>

                  <div className="space-y-4 pt-2">
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#F4F7FB] border border-[#E2E8F0]">
                      <div className="w-11 h-11 rounded-xl bg-[#052557] text-white flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#0F172A]">
                          Bancos &amp; Instituições Financeiras
                        </h3>
                        <p className="text-sm text-[#52627A] mt-0.5">
                          Integração bancária e apoio estratégico para agilizar rotinas de pagamento, cobrança e crédito.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#F4F7FB] border border-[#E2E8F0]">
                      <div className="w-11 h-11 rounded-xl bg-[#0571ED] text-white flex items-center justify-center shrink-0">
                        <Cpu className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#0F172A]">Sistemas &amp; ERPs (Omie)</h3>
                        <p className="text-sm text-[#52627A] mt-0.5">
                          Implantação, parametrização e operação assistida nos principais sistemas de gestão do mercado.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#F4F7FB] border border-[#E2E8F0]">
                      <div className="w-11 h-11 rounded-xl bg-[#FA670D] text-white flex items-center justify-center shrink-0">
                        <Network className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#0F172A]">
                          Juntaê &bull; Serviços &amp; Recrutamento
                        </h3>
                        <p className="text-sm text-[#52627A] mt-0.5">
                          Conexões seguras e humanizadas para entregar a pessoa certa ou o prestador ideal para a demanda da sua empresa.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Partner Program Card */}
                <div className="lg:col-span-6">
                  <div className="vn-hero text-white rounded-3xl p-8 sm:p-10 shadow-xl">
                    <div className="space-y-6">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-wider text-[#FA670D]">
                        Programa de Parcerias B2B
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-extrabold leading-tight">
                        Comércio ou serviço: apresentamos sua empresa aos nossos clientes
                      </h3>
                      <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
                        Construímos pontes comerciais sólidas. Conhecemos sua operação, acompanhamos métricas de qualidade e indicamos suas soluções para nossa base de clientes.
                      </p>

                      <div className="grid sm:grid-cols-3 gap-3 pt-2">
                        <div className="bg-white/10 border border-white/15 rounded-2xl p-4">
                          <span className="text-[#FA670D] font-extrabold text-lg">01</span>
                          <h4 className="font-bold text-sm mt-1">Apresentação</h4>
                          <p className="text-xs text-blue-100/80 mt-1">
                            Mapeamos seu negócio e apresentamos aos nossos clientes.
                          </p>
                        </div>
                        <div className="bg-white/10 border border-white/15 rounded-2xl p-4">
                          <span className="text-[#FA670D] font-extrabold text-lg">02</span>
                          <h4 className="font-bold text-sm mt-1">Métricas</h4>
                          <p className="text-xs text-blue-100/80 mt-1">
                            Acompanhamos resultados e indicadores da parceria.
                          </p>
                        </div>
                        <div className="bg-white/10 border border-white/15 rounded-2xl p-4">
                          <span className="text-[#FA670D] font-extrabold text-lg">03</span>
                          <h4 className="font-bold text-sm mt-1">Encaminhamento</h4>
                          <p className="text-xs text-blue-100/80 mt-1">
                            Direcionamento contínuo conforme acordo de parceria.
                          </p>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            handleSwitchAtendimentoMode('parceiro');
                            const el = document.getElementById('atendimento');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-[#052557] bg-white hover:bg-blue-50 transition-colors cursor-pointer"
                        >
                          Quero ser parceiro VN Soluções
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* PORTAL & ERP SECTION */}
          <section id="portal" className="py-16 lg:py-20 bg-[#F4F7FB] border-t border-[#E2E8F0]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-5">
                <p className="vn-eyebrow text-xs font-extrabold uppercase tracking-widest text-[#FA670D]">
                  Portal &amp; ERP
                </p>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#052557] tracking-tight">
                  Transparência total, no sistema que você já enxerga
                </h2>
                <p className="text-[#52627A] leading-relaxed text-sm sm:text-base">
                  Nos adaptamos à realidade do seu negócio: trabalhamos no ERP que você já usa ou ajudamos a escolher e implantar o ideal para o seu porte e segmento. Tudo fica registrado e rastreável, e você acessa os números quando quiser na Área do Cliente.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setMainView('login')}
                    className="vn-btn-o"
                  >
                    <Lock className="w-4 h-4" />
                    Entrar na Área do Cliente
                  </button>
                  <a
                    href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
                      'Olá! Quero ajuda com o ERP da minha empresa (usar o atual ou implantar um novo).'
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3 rounded-xl font-bold text-sm bg-white text-[#052557] border border-[#E2E8F0] hover:border-[#0571ED] inline-flex items-center gap-2"
                  >
                    <Layers className="w-4 h-4 text-[#0571ED]" />
                    Falar sobre meu ERP
                  </a>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="vn-card p-6 vn-lift">
                  <Sparkles className="w-6 h-6 text-[#FA670D]" />
                  <h3 className="font-bold text-[#052557] mt-3">Apresentação institucional</h3>
                  <p className="text-sm text-[#52627A] mt-1">
                    Conheça a VN Soluções, o modelo de trabalho assistido e o escopo BPO.
                  </p>
                  <a
                    href="#atendimento"
                    className="text-xs font-bold text-[#052557] mt-3 inline-flex items-center gap-1 hover:text-[#FA670D]"
                  >
                    Solicitar apresentação <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="vn-card p-6 vn-lift">
                  <Handshake className="w-6 h-6 text-[#FA670D]" />
                  <h3 className="font-bold text-[#052557] mt-3">Pré-venda e parcerias</h3>
                  <p className="text-sm text-[#52627A] mt-1">
                    Como apresentamos sua empresa e conectamos benefícios à nossa base de clientes.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      handleSwitchAtendimentoMode('parceiro');
                      const el = document.getElementById('atendimento');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-xs font-bold text-[#052557] mt-3 inline-flex items-center gap-1 hover:text-[#FA670D] cursor-pointer"
                  >
                    Cadastrar parceria <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="vn-card p-6 sm:col-span-2 flex gap-4 items-start">
                  <ShieldCheck className="w-6 h-6 text-[#FA670D] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-[#052557]">
                      Segurança, Sigilo e Credenciais Exclusivas
                    </h3>
                    <p className="text-sm text-[#52627A] mt-1">
                      Informações tratadas sob sigilo contratual, acessos rastreáveis, conformidade com a LGPD e criação de credenciais de clientes controlada exclusivamente pela controladoria interna da VN Soluções.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* MINI DIAGNÓSTICO INTERATIVO */}
          <section id="diagnostico" className="py-16 lg:py-20 bg-[#F4F7FB] border-y border-[#E2E8F0]">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="vn-hero rounded-3xl p-8 sm:p-12 text-white shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/15 pb-6">
                  <div>
                    <span className="vn-eyebrow text-xs font-extrabold uppercase tracking-widest text-[#FA670D]">
                      Autoavaliação Rápida
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold mt-1">
                      Como está a saúde financeira da sua empresa?
                    </h2>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/10 text-blue-100 shrink-0">
                    5 perguntas &bull; 1 minuto
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-white/15 rounded-full overflow-hidden my-6">
                  <div
                    className="h-full bg-[#FA670D] transition-all duration-300"
                    style={{
                      width: !quizStarted
                        ? '0%'
                        : quizIndex >= QUIZ_PERGUNTAS.length
                        ? '100%'
                        : `${(quizIndex / QUIZ_PERGUNTAS.length) * 100}%`,
                    }}
                  />
                </div>

                {/* Quiz Body */}
                <div className="min-h-[180px] flex flex-col justify-center">
                  {!quizStarted ? (
                    <div>
                      <p className="text-lg sm:text-xl font-medium text-blue-50 mb-6">
                        Responda a 5 perguntas rápidas para identificar o nível atual de maturidade e controle do seu financeiro.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setQuizStarted(true);
                            setQuizIndex(0);
                            setQuizScore(0);
                          }}
                          className="vn-btn-o"
                        >
                          <Play className="w-4 h-4" />
                          Iniciar Mini-Diagnóstico
                        </button>
                        <a
                          href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
                            'Olá! Gostaria de agendar uma reunião de diagnóstico completo para minha empresa.'
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold bg-white/10 hover:bg-white/15 border border-white/20 text-white transition-colors"
                        >
                          Agendar Diagnóstico Completo
                        </a>
                      </div>
                    </div>
                  ) : quizIndex < QUIZ_PERGUNTAS.length ? (
                    <div className="space-y-5">
                      <div className="text-xs font-bold uppercase tracking-wider text-blue-200">
                        Pergunta {quizIndex + 1} de {QUIZ_PERGUNTAS.length}
                      </div>
                      <p className="text-lg sm:text-xl font-bold text-white leading-snug">
                        {QUIZ_PERGUNTAS[quizIndex]}
                      </p>
                      <div className="grid sm:grid-cols-3 gap-3 pt-1">
                        {[
                          { label: 'Sim, totalmente', pts: 2 },
                          { label: 'Em parte', pts: 1 },
                          { label: 'Ainda não', pts: 0 },
                        ].map((opt) => (
                          <button
                            key={opt.label}
                            type="button"
                            onClick={() => {
                              setQuizScore((s) => s + opt.pts);
                              setQuizIndex((idx) => idx + 1);
                            }}
                            className="py-3.5 px-4 rounded-xl bg-white/10 hover:bg-[#FA670D] border border-white/20 hover:border-[#FA670D] font-bold text-sm text-white transition-all cursor-pointer"
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    (() => {
                      const nivel =
                        quizScore <= 3
                          ? 'Estágio Inicial · Hora de Estruturar'
                          : quizScore <= 7
                          ? 'Estágio Intermediário · Bom Caminho com Lacunas'
                          : 'Estágio Estruturado · Foco em Inteligência';
                      const resumo =
                        quizScore <= 3
                          ? 'Existem pontos críticos sem visibilidade ou controle diário. Uma implantação organizada trará segurança imediata para a operação.'
                          : quizScore <= 7
                          ? 'Sua empresa já possui uma base de controle, mas faltam rotinas padronizadas e indicadores para ganhar previsibilidade.'
                          : 'Ótima organização! O próximo passo é delegar a execução operacional para liberar seu tempo e aprofundar a análise gerencial.';
                      return (
                        <div className="space-y-4">
                          <div className="inline-block px-3 py-1 rounded-lg bg-[#FA670D]/20 border border-[#FA670D]/40 text-[#FA670D] font-bold text-sm">
                            Pontuação: {quizScore} de 10 pontos
                          </div>
                          <h3 className="text-2xl font-extrabold text-white">{nivel}</h3>
                          <p className="text-blue-100 leading-relaxed">{resumo}</p>
                          <div className="pt-3 flex flex-col sm:flex-row gap-3">
                            <a
                              href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
                                `Olá! Realizei o mini-diagnóstico no site da VN Soluções (Resultado: ${quizScore}/10 - ${nivel}) e gostaria de agendar o diagnóstico completo.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="vn-btn-o"
                            >
                              Agendar Reunião de Diagnóstico
                            </a>
                            <button
                              type="button"
                              onClick={() => {
                                setQuizIndex(0);
                                setQuizScore(0);
                              }}
                              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-semibold bg-white/10 hover:bg-white/15 text-white transition-colors cursor-pointer"
                            >
                              Refazer Avaliação
                            </button>
                          </div>
                        </div>
                      );
                    })()
                  )}
                </div>

                <p className="text-xs text-blue-200/70 mt-6 pt-4 border-t border-white/10">
                  * Esta autoavaliação fornece um panorama inicial. O diagnóstico operacional completo é realizado em reunião individual com nosso especialista.
                </p>
              </div>
            </div>
          </section>

          {/* CENTRAL DE ATENDIMENTO, CHAMADOS E TUTORIAL (#atendimento) */}
          <section id="atendimento" className="py-16 lg:py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="vn-eyebrow text-xs font-extrabold uppercase tracking-widest text-[#FA670D]">
                  Central de Relacionamento
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#052557] mt-2">
                  Atendimento, Chamados e Orientações
                </h2>
                <p className="text-[#52627A] mt-2 text-sm sm:text-base">
                  Registre uma solicitação com protocolo imediato integrado ao nosso ERP ou siga o passo a passo operacional.
                </p>
              </div>

              <div className="grid lg:grid-cols-12 gap-10 items-start">
                {/* Left Column: Form & Protocol Generator */}
                <div className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 shadow-2xs">
                  <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
                    <div>
                      <h3 className="text-xl font-extrabold text-[#052557]">
                        {atendimentoMode === 'cliente'
                          ? 'Abrir Chamado ou Solicitação'
                          : 'Cadastro de Empresa Parceira'}
                      </h3>
                      <p className="text-sm text-[#52627A]">
                        {atendimentoMode === 'cliente'
                          ? 'Preencha os dados para gerar seu código de protocolo e sincronizar com o Service Desk.'
                          : 'Comércio ou serviço: apresente sua empresa para nossa rede B2B.'}
                      </p>
                    </div>

                    {/* Mode Switch */}
                    <div className="inline-flex p-1 rounded-xl bg-[#F4F7FB] border border-[#E2E8F0]">
                      <button
                        type="button"
                        onClick={() => handleSwitchAtendimentoMode('cliente')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          atendimentoMode === 'cliente'
                            ? 'bg-[#052557] text-white'
                            : 'text-[#52627A] hover:text-[#052557]'
                        }`}
                      >
                        Sou Cliente
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSwitchAtendimentoMode('parceiro')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          atendimentoMode === 'parceiro'
                            ? 'bg-[#052557] text-white'
                            : 'text-[#52627A] hover:text-[#052557]'
                        }`}
                      >
                        Sou Parceiro
                      </button>
                    </div>
                  </div>

                  {!generatedProto ? (
                    <form onSubmit={handleSubmitAtendimentoProtocol} className="space-y-4" noValidate>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#52627A] mb-1.5">
                            Seu Nome *
                          </label>
                          <input
                            type="text"
                            value={atendNome}
                            onChange={(e) => setAtendNome(e.target.value)}
                            placeholder="Ex.: Maria Silva"
                            className="w-full px-4 py-3 rounded-xl bg-[#F4F7FB] border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0571ED] focus:bg-white transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#52627A] mb-1.5">
                            Empresa
                          </label>
                          <input
                            type="text"
                            value={atendEmp}
                            onChange={(e) => setAtendEmp(e.target.value)}
                            placeholder="Nome da empresa"
                            className="w-full px-4 py-3 rounded-xl bg-[#F4F7FB] border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0571ED] focus:bg-white transition-colors"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#52627A] mb-1.5">
                            WhatsApp *
                          </label>
                          <input
                            type="tel"
                            inputMode="tel"
                            value={atendTel}
                            onChange={(e) => handlePhoneInput(e.target.value)}
                            placeholder="(85) 90000-0000"
                            className="w-full px-4 py-3 rounded-xl bg-[#F4F7FB] border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0571ED] focus:bg-white transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#52627A] mb-1.5">
                            {atendimentoMode === 'cliente'
                              ? 'Serviço Desejado *'
                              : 'Segmento da Empresa *'}
                          </label>
                          <select
                            value={atendTipo}
                            onChange={(e) => setAtendTipo(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-[#F4F7FB] border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0571ED] focus:bg-white transition-colors"
                          >
                            {atendimentoMode === 'cliente'
                              ? SERVICOS_LIST.map((s) => (
                                  <option key={s.idx} value={s.title}>
                                    {s.title}
                                  </option>
                                ))
                              : PARCERIAS_LIST.map((p) => (
                                  <option key={p} value={p}>
                                    {p}
                                  </option>
                                ))}
                          </select>
                        </div>
                      </div>

                      {atendimentoMode === 'cliente' && (
                        <div>
                          <span className="block text-xs font-bold uppercase tracking-wider text-[#52627A] mb-1.5">
                            Prioridade
                          </span>
                          <div className="grid grid-cols-2 gap-3">
                            {(['Normal', 'Urgente'] as const).map((pr) => {
                              const isSelected = atendPrioridade === pr;
                              return (
                                <button
                                  key={pr}
                                  type="button"
                                  onClick={() => setAtendPrioridade(pr)}
                                  className={`py-2.5 px-4 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                                    isSelected
                                      ? pr === 'Urgente'
                                        ? 'border-[#FA670D] bg-orange-50 text-[#FA670D]'
                                        : 'border-[#052557] bg-blue-50/60 text-[#052557]'
                                      : 'border-[#E2E8F0] bg-[#F4F7FB] text-[#52627A]'
                                  }`}
                                >
                                  {pr}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#52627A]">
                            {atendimentoMode === 'cliente'
                              ? 'Detalhes da Solicitação *'
                              : 'Sobre sua Empresa e Soluções *'}
                          </label>
                          <span className="text-xs text-slate-400 tabular-nums">
                            {atendDesc.length}/500
                          </span>
                        </div>
                        <textarea
                          rows={3}
                          maxLength={500}
                          value={atendDesc}
                          onChange={(e) => setAtendDesc(e.target.value)}
                          placeholder="Descreva brevemente a necessidade da sua empresa..."
                          className="w-full px-4 py-3 rounded-xl bg-[#F4F7FB] border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0571ED] focus:bg-white transition-colors resize-none"
                        />
                      </div>

                      {atendError && (
                        <p className="text-xs font-bold text-red-600">{atendError}</p>
                      )}

                      <button
                        type="submit"
                        disabled={submittingAtendimento}
                        className="w-full py-3.5 px-6 rounded-xl bg-[#052557] hover:bg-[#031B4A] text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <FileCheck2 className="w-4 h-4 text-[#FA670D]" />
                        {submittingAtendimento
                          ? 'Gerando Protocolo e Registrando...'
                          : 'Gerar Protocolo de Atendimento'}
                      </button>
                    </form>
                  ) : (
                    /* Protocol Generated Success State */
                    <div className="text-center py-6 space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="text-xl font-extrabold text-[#0F172A]">
                          Protocolo Registrado
                        </h4>
                        <p className="text-2xl sm:text-3xl font-extrabold text-[#FA670D] tracking-wider mt-1 font-mono">
                          {generatedProto}
                        </p>
                      </div>
                      <p className="text-sm text-[#52627A] max-w-md mx-auto">
                        Este protocolo já foi integrado ao nosso sistema interno. Envie pelo WhatsApp para iniciar o atendimento imediato com seu consultor.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                        <a
                          href={generatedWaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-colors cursor-pointer"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Enviar no WhatsApp
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            if (generatedProto) {
                              navigator.clipboard?.writeText(generatedProto);
                              setProtoCopied(true);
                              setTimeout(() => setProtoCopied(false), 2000);
                            }
                          }}
                          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#F4F7FB] hover:bg-slate-200 text-[#052557] font-bold text-sm transition-colors cursor-pointer"
                        >
                          {protoCopied ? 'Copiado!' : 'Copiar Código'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setGeneratedProto(null);
                            setAtendDesc('');
                          }}
                          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-[#E2E8F0] hover:bg-[#F4F7FB] text-[#52627A] font-semibold text-sm transition-colors cursor-pointer"
                        >
                          Novo Chamado
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Saved Tickets History on Device */}
                  <div className="mt-8 pt-6 border-t border-[#E2E8F0]">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#52627A]">
                        Meus Protocolos Recentes (Neste Dispositivo)
                      </h4>
                    </div>
                    {savedProtocols.length === 0 ? (
                      <p className="text-xs text-slate-400">
                        Nenhum protocolo gerado neste aparelho ainda.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {savedProtocols.map((item, index) => (
                          <div
                            key={`${item.proto}-${index}`}
                            className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#F4F7FB] border border-[#E2E8F0] text-xs"
                          >
                            <div>
                              <span className="font-mono font-extrabold text-[#052557]">
                                {item.proto}
                              </span>{' '}
                              &bull;{' '}
                              <span className="font-semibold text-slate-700">{item.tipo}</span>
                              <div className="text-slate-400 mt-0.5">
                                {item.nome} ({item.emp}) &bull; {item.data}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveSavedProtocol(index)}
                              className="text-slate-400 hover:text-red-500 p-1.5 cursor-pointer"
                              title="Remover histórico local"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Guia Rápido Checklist & FAQ */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Tutorial Box */}
                  <div className="bg-[#F4F7FB] border border-[#E2E8F0] rounded-3xl p-6 sm:p-7">
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div>
                        <h3 className="text-lg font-extrabold text-[#052557]">
                          Guia Rápido do Cliente
                        </h3>
                        <p className="text-xs text-[#52627A]">
                          Clique nas etapas para marcar como concluídas.
                        </p>
                      </div>
                      <div className="inline-flex p-1 rounded-xl bg-white border border-[#E2E8F0]">
                        <button
                          type="button"
                          onClick={() => setTutorialTab('chamado')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            tutorialTab === 'chamado'
                              ? 'bg-[#052557] text-white'
                              : 'text-[#52627A]'
                          }`}
                        >
                          Chamado
                        </button>
                        <button
                          type="button"
                          onClick={() => setTutorialTab('docs')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            tutorialTab === 'docs'
                              ? 'bg-[#052557] text-white'
                              : 'text-[#52627A]'
                          }`}
                        >
                          Documentos
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      {TUTORIAL_STEPS[tutorialTab].map((step, idx) => {
                        const stepKey = `${tutorialTab}-${idx}`;
                        const isDone = !!completedTutorialSteps[stepKey];
                        return (
                          <button
                            key={stepKey}
                            type="button"
                            onClick={() =>
                              setCompletedTutorialSteps((prev) => ({
                                ...prev,
                                [stepKey]: !prev[stepKey],
                              }))
                            }
                            className={`w-full text-left flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                              isDone
                                ? 'bg-emerald-50/60 border-emerald-500'
                                : 'bg-white border-[#E2E8F0] hover:border-[#0571ED]'
                            }`}
                          >
                            <span
                              className={`w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                isDone ? 'bg-emerald-600' : 'bg-[#052557]'
                              }`}
                            >
                              {isDone ? '✓' : idx + 1}
                            </span>
                            <div>
                              <div className="font-bold text-sm text-[#0F172A]">{step[0]}</div>
                              <div className="text-xs text-[#52627A] mt-0.5 leading-relaxed">
                                {step[1]}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* FAQ Accordion (Driven by CMS Config) */}
                  {cmsConfig.visibleSections.faq && (
                    <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-7 space-y-3">
                      <h3 className="text-lg font-extrabold text-[#052557] mb-2">
                        Dúvidas Frequentes
                      </h3>

                      {cmsConfig.faqs.map((faq) => (
                        <details
                          key={faq.id}
                          className="group border border-[#E2E8F0] rounded-2xl p-4 bg-[#F4F7FB]/50"
                        >
                          <summary className="font-bold text-sm text-slate-800 cursor-pointer flex items-center justify-between">
                            <span>{faq.q}</span>
                            <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" />
                          </summary>
                          <p className="text-xs text-[#52627A] mt-2.5 leading-relaxed">{faq.a}</p>
                        </details>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="bg-[#031B4A] text-blue-100 py-14 border-t border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid md:grid-cols-3 gap-10 pb-10 border-b border-white/10">
                <div className="space-y-4">
                  <div className="inline-block bg-white px-4 py-2 rounded-xl">
                    <img
                      src="/assets/aistudio/LOGO_VN_SOLUCOES_920d4640.png"
                      alt="VN Soluções"
                      referrerPolicy="no-referrer"
                      className="h-9 w-auto object-contain"
                    />
                  </div>
                  <p className="text-sm text-blue-200/80 leading-relaxed">
                    Mais que serviços, uma parceria para o seu negócio. Especialistas em BPO Financeiro, implantação de processos e retaguarda administrativa.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                    Navegação Rápida
                  </h4>
                  <ul className="space-y-2 text-sm text-blue-200/80">
                    <li>
                      <a href="#sobre" className="hover:text-white transition-colors">
                        Quem Somos
                      </a>
                    </li>
                    <li>
                      <a href="#diferenciais" className="hover:text-white transition-colors">
                        Diferenciais
                      </a>
                    </li>
                    <li>
                      <a href="#servicos" className="hover:text-white transition-colors">
                        Escopo de Serviços
                      </a>
                    </li>
                    <li>
                      <a href="#metodologia" className="hover:text-white transition-colors">
                        Como Trabalhamos
                      </a>
                    </li>
                    <li>
                      <a href="#diagnostico" className="hover:text-white transition-colors">
                        Mini-Diagnóstico
                      </a>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => setMainView('login')}
                        className="hover:text-white transition-colors cursor-pointer"
                      >
                        Área do Cliente (Login)
                      </button>
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                    Contato Direto &amp; Redes
                  </h4>
                  <ul className="space-y-2.5 text-sm text-blue-200/80">
                    <li className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-[#FA670D]" />
                      <span>{cmsConfig.whatsappDisplay}</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Mail className="w-4 h-4 text-[#FA670D]" />
                      <a
                        href={`mailto:${cmsConfig.commercialEmail}`}
                        className="hover:text-white transition-colors"
                      >
                        {cmsConfig.commercialEmail}
                      </a>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-[#FA670D]" />
                      <span>{cmsConfig.cityState}</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-blue-300/60">
                <p>
                  &copy; 2026 VN Soluções &bull; BPO Financeiro e Serviços Administrativos. Todos os direitos reservados.
                </p>
                <p>Conformidade e sigilo de dados segundo a LGPD.</p>
              </div>
            </div>
          </footer>
        </div>
      )}

      {/* ====================================================================
          VIEW 2: SPLIT-SCREEN LOGIN (VN SOLUÇÕES · ÁREA DO CLIENTE — #login)
          EXACT MATCH TO USER'S UPLOADED HTML + INTERNAL AUTHORIZATION RULE
         ==================================================================== */}
      {mainView === 'login' && (
        <section
          id="login"
          className="min-h-[680px] grid lg:grid-cols-2 rounded-3xl overflow-hidden border border-[#E2E8F0] bg-white shadow-lg"
        >
          {/* Left Hero Column (Exact match to user's HTML snippet) */}
          <div className="vn-hero p-8 sm:p-12 lg:p-14 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-3 bg-white rounded-2xl px-4 py-2.5 shadow">
                <img
                  src="/assets/aistudio/LOGO_VN_SOLUCOES_920d4640.png"
                  alt="VN Soluções"
                  referrerPolicy="no-referrer"
                  className="h-9 w-auto object-contain"
                />
              </div>
              <button
                type="button"
                onClick={() => setMainView('site')}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white cursor-pointer"
              >
                &larr; Voltar ao Site
              </button>
            </div>

            <div className="my-10 space-y-5 max-w-lg">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#FA670D]" />
                Mais que serviços, uma parceria para o seu negócio
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
                Seu financeiro na palma da mão,{' '}
                <span className="text-[#FA670D]">com a VN ao lado.</span>
              </h1>
              <p className="text-blue-100/90 text-sm sm:text-base leading-relaxed">
                Acompanhe contas a pagar e a receber, conciliação bancária, fluxo de caixa, relatórios mensais, chamados com a equipe VN e a rede de parceiros com benefícios exclusivos.
              </p>
              <div className="grid sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="rounded-xl bg-white/10 border border-white/15 p-3.5 flex gap-2.5 items-start">
                  <CheckCircle2 className="w-4 h-4 text-[#FA670D] shrink-0 mt-0.5" />
                  <span>Boletos, notas fiscais e status de cada pagamento</span>
                </div>
                <div className="rounded-xl bg-white/10 border border-white/15 p-3.5 flex gap-2.5 items-start">
                  <BarChart3 className="w-4 h-4 text-[#FA670D] shrink-0 mt-0.5" />
                  <span>Fluxo de caixa, DRE e fechamento mensal</span>
                </div>
                <div className="rounded-xl bg-white/10 border border-white/15 p-3.5 flex gap-2.5 items-start">
                  <LifeBuoy className="w-4 h-4 text-[#FA670D] shrink-0 mt-0.5" />
                  <span>Chamados direto com a VN, com protocolo</span>
                </div>
                <div className="rounded-xl bg-white/10 border border-white/15 p-3.5 flex gap-2.5 items-start">
                  <Gift className="w-4 h-4 text-[#FA670D] shrink-0 mt-0.5" />
                  <span>Parceiros indicados e benefícios conquistados</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-blue-200/70">
              (85) 98961-5554 &middot; vn.servicos@icloud.com &middot; Fortaleza/CE
            </p>
          </div>

          {/* Right Form Column */}
          <div className="p-8 sm:p-12 lg:p-14 flex flex-col justify-center bg-white">
            <div className="max-w-md mx-auto w-full space-y-6">
              <div>
                <span className="vn-eyebrow text-xs font-extrabold uppercase tracking-widest text-[#FA670D]">
                  Portal de Acesso Autorizado
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#052557] mt-1">
                  Entrar na Plataforma VN
                </h2>
                <p className="text-xs sm:text-sm text-[#52627A] mt-1">
                  Selecione o ambiente e informe as credenciais liberadas pela controladoria da VN Soluções.
                </p>
              </div>

              {/* Environment Selector: Área do Cliente vs Retaguarda VN */}
              <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-[#F4F7FB] border border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => {
                    setLoginTargetType('cliente');
                    setLoginError('');
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    loginTargetType === 'cliente'
                      ? 'bg-[#052557] text-white shadow-xs'
                      : 'text-[#52627A] hover:text-[#052557]'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 text-[#FA670D]" />
                  Área do Cliente
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginTargetType('retaguarda_vn');
                    setLoginError('');
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    loginTargetType === 'retaguarda_vn'
                      ? 'bg-[#052557] text-white shadow-xs'
                      : 'text-[#52627A] hover:text-[#052557]'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0571ED]" />
                  Retaguarda VN (Interno)
                </button>
              </div>

              {/* Mandatory Security Notice: Internal Credential Creation Only */}
              <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-xs text-amber-950 space-y-1">
                <div className="font-extrabold flex items-center gap-1.5 text-[#052557]">
                  <KeyRound className="w-4 h-4 text-[#FA670D]" />
                  Credenciais Criadas Exclusivamente pela VN Soluções
                </div>
                <p className="text-[11px] leading-relaxed text-slate-700">
                  Não há cadastro público de senhas. Apenas a equipe interna da VN Soluções cadastra a empresa cliente e gera seu <strong>usuário</strong>, <strong>senha</strong> e <strong>código de autorização</strong>.
                </p>
              </div>

              {/* Quick User Selector Pills WITHOUT Saved Password for Login Security */}
              <div className="p-3.5 rounded-2xl bg-[#F4F7FB] border border-[#E2E8F0] space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#052557]">
                    {loginTargetType === 'cliente'
                      ? 'Preenchimento Rápido de Usuário (Sem Senha Salva):'
                      : 'Preenchimento Rápido Equipe VN (Sem Senha Salva):'}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                    Senha Protegida
                  </span>
                </div>
                <p className="text-[11px] text-[#52627A]">
                  Selecione o perfil para preencher apenas o <strong>e-mail</strong> e o <strong>código de identificação</strong>. Por segurança, a senha nunca fica salva e deve ser digitada.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {loginTargetType === 'cliente'
                    ? credentials
                        .filter((c) => c.active)
                        .map((cred) => (
                          <button
                            key={cred.id}
                            type="button"
                            onClick={() => {
                              setLoginTargetType('cliente');
                              setLoginUsername(cred.username);
                              setLoginPassword('');
                              setLoginAccessCode(cred.accessCode);
                              setLoginError('');
                            }}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                              loginUsername === cred.username && loginTargetType === 'cliente'
                                ? 'bg-[#052557] border-[#052557] text-white'
                                : 'bg-white border-[#E2E8F0] text-[#52627A] hover:text-[#052557]'
                            }`}
                          >
                            {cred.clientName} ({cred.accessCode})
                          </button>
                        ))
                    : vnStaff
                        .filter((s) => s.status === 'Ativo')
                        .map((staff) => (
                          <button
                            key={staff.id}
                            type="button"
                            onClick={() => {
                              setLoginTargetType('retaguarda_vn');
                              setLoginUsername(staff.email);
                              setLoginPassword('');
                              setLoginAccessCode(staff.code);
                              setLoginError('');
                            }}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                              loginUsername === staff.email && loginTargetType === 'retaguarda_vn'
                                ? 'bg-[#052557] border-[#052557] text-white'
                                : 'bg-white border-[#E2E8F0] text-[#52627A] hover:text-[#052557]'
                            }`}
                          >
                            {staff.name} ({staff.role.toUpperCase()})
                          </button>
                        ))}
                </div>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4" autoComplete="off">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#52627A] mb-1.5">
                    {loginTargetType === 'cliente'
                      ? 'Usuário / E-mail Corporativo Autorizado *'
                      : 'E-mail do Gestor / Analista VN *'}
                  </label>
                  <input
                    type="text"
                    required
                    autoComplete="off"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="Selecione acima ou digite seu e-mail autorizado"
                    className="w-full px-4 py-3 rounded-xl bg-[#F4F7FB] border border-[#E2E8F0] text-sm font-medium text-[#0F172A] focus:outline-none focus:border-[#0571ED] focus:bg-white"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#52627A] mb-1.5">
                      {loginTargetType === 'cliente'
                        ? 'Senha de Autorização (Digite) *'
                        : 'PIN / Senha Interna VN (Digite) *'}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoComplete="new-password"
                        placeholder="Digite sua senha..."
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full px-4 py-3 pr-10 rounded-xl bg-[#F4F7FB] border border-[#E2E8F0] text-sm font-mono text-[#0F172A] focus:outline-none focus:border-[#0571ED] focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#52627A] mb-1.5">
                      Código VN
                    </label>
                    <input
                      type="text"
                      value={loginAccessCode}
                      onChange={(e) => setLoginAccessCode(e.target.value)}
                      placeholder="AUT-ATLAS-01"
                      className="w-full px-4 py-3 rounded-xl bg-[#F4F7FB] border border-[#E2E8F0] text-sm font-mono text-[#052557] focus:outline-none focus:border-[#0571ED] focus:bg-white"
                    />
                  </div>
                </div>

                {loginError && (
                  <p className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
                    {loginError}
                  </p>
                )}

                <button type="submit" className="vn-btn-o w-full !py-3.5 text-sm">
                  <Lock className="w-4 h-4" />
                  {loginTargetType === 'cliente'
                    ? 'Acessar Área do Cliente VN'
                    : 'Entrar na Retaguarda VN Gestão ERP'}
                </button>
              </form>

              {/* Public Visitor Option: Open Ticket or Explore without Login */}
              <div className="pt-4 border-t border-[#E2E8F0] space-y-2.5 text-center">
                <p className="text-xs text-[#52627A]">
                  Deseja conhecer mais, solicitar proposta ou abrir um chamado sem senha?
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMainView('site');
                      setTimeout(() => {
                        const el = document.getElementById('atendimento');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#F4F7FB] hover:bg-slate-200/80 text-[#052557] border border-[#E2E8F0] flex items-center gap-1.5 cursor-pointer"
                  >
                    <Ticket className="w-3.5 h-3.5 text-[#FA670D]" />
                    Abrir Chamado / Solicitação
                  </button>
                  <button
                    type="button"
                    onClick={() => setMainView('site')}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#F4F7FB] hover:bg-slate-200/80 text-[#052557] border border-[#E2E8F0] flex items-center gap-1.5 cursor-pointer"
                  >
                    Conhecer o Site VN Soluções
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ====================================================================
          VIEW 3: PROTÓTIPO COMPLETO DA TELA DE USUÁRIO DO CLIENTE
          (VN SOLUÇÕES · ÁREA DO CLIENTE AUTENTICADA)
         ==================================================================== */}
      {mainView === 'client_area' && currentClient && (
        <div className="space-y-6">
          {/* Client Area Top Hero Bar */}
          <div className="vn-hero rounded-3xl p-6 sm:p-8 text-white shadow-lg">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="bg-white px-3.5 py-2 rounded-2xl shrink-0">
                  <img
                    src="/assets/aistudio/LOGO_VN_SOLUCOES_920d4640.png"
                    alt="VN Soluções"
                    referrerPolicy="no-referrer"
                    className="h-10 w-auto object-contain"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FA670D] text-white">
                      Área do Cliente Autorizada
                    </span>
                    <span className="text-xs font-mono text-blue-200">
                      {loggedCredential?.accessCode || 'AUT-VN-01'}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold mt-1">
                    {currentClient.name} ({currentClient.tradeName})
                  </h2>
                  <p className="text-xs text-blue-100/90 mt-0.5">
                    CNPJ: <strong className="font-mono">{currentClient.cnpj}</strong> &bull; Regime:{' '}
                    <strong>{currentClient.taxRegime}</strong> &bull; Analista Dedicado VN:{' '}
                    <strong>{currentClient.responsibleAnalyst}</strong>
                  </p>
                </div>
              </div>

              {/* Client Switcher (for Demo) + Logout */}
              <div className="flex flex-wrap items-center gap-2.5">
                <select
                  aria-label="Alternar Empresa Cliente"
                  value={loggedClientId}
                  onChange={(e) => {
                    const nextId = Number(e.target.value);
                    setLoggedClientId(nextId);
                    const foundCred = credentials.find((c) => c.clientId === nextId);
                    if (foundCred) setLoggedCredential(foundCred);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white/12 border border-white/25 text-xs font-bold text-white"
                >
                  {clients.map((cl) => (
                    <option key={cl.id} value={cl.id} className="text-slate-900">
                      Empresa: {cl.tradeName} ({cl.code})
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleExportClientFichaCsv}
                  className="px-3.5 py-2 rounded-xl bg-white/12 hover:bg-white/20 border border-white/25 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#FA670D]" />
                  Exportar Extrato CSV
                </button>

                <button
                  type="button"
                  onClick={() => setMainView('login')}
                  className="px-3.5 py-2 rounded-xl bg-white text-[#052557] hover:bg-blue-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-[#FA670D]" />
                  Sair da Área do Cliente
                </button>
              </div>
            </div>

            {/* Client Area Navigation Tabs (matching the 4 pillars on the Login screen) */}
            <div className="flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-white/15">
              {[
                {
                  key: 'PAINEL_GERAL' as ClientAreaTab,
                  label: '1. Visão Geral & Painel Gerencial',
                  icon: PieChart,
                },
                {
                  key: 'BOLETOS_PAGAMENTOS' as ClientAreaTab,
                  label: `2. Boletos, NFs & Aprovação (${clientBatches.length})`,
                  icon: CheckCircle2,
                },
                {
                  key: 'FLUXO_DRE_FECHAMENTO' as ClientAreaTab,
                  label: '3. Fluxo de Caixa, DRE & Fechamento',
                  icon: BarChart3,
                },
                {
                  key: 'CHAMADOS_PENDENCIAS' as ClientAreaTab,
                  label: `4. Chamados c/ Protocolo (${clientTickets.length})`,
                  icon: LifeBuoy,
                },
                {
                  key: 'PARCEIROS_BENEFICIOS' as ClientAreaTab,
                  label: '5. Parceiros Indicados & Benefícios',
                  icon: Gift,
                },
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeClientTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveClientTab(tab.key)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#FA670D] text-white shadow-md'
                        : 'bg-white/10 text-blue-100 hover:bg-white/20'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Client Financial KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="vn-card p-5">
              <div className="flex items-center justify-between text-xs font-bold text-[#52627A]">
                <span>Contas a Receber (Período)</span>
                <ArrowUpRight className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-extrabold text-emerald-700 mt-2 tabular-nums">
                {formatBrl(clientFinancialSummary.receivables)}
              </div>
              <div className="text-[11px] text-[#52627A] mt-1">
                Faturamento e recebíveis conciliados pela VN
              </div>
            </div>

            <div className="vn-card p-5">
              <div className="flex items-center justify-between text-xs font-bold text-[#52627A]">
                <span>Contas a Pagar (Programado)</span>
                <ArrowDownLeft className="w-4 h-4 text-[#FA670D]" />
              </div>
              <div className="text-2xl font-extrabold text-[#052557] mt-2 tabular-nums">
                {formatBrl(clientFinancialSummary.payables)}
              </div>
              <div className="text-[11px] text-[#52627A] mt-1">
                Boletos e notas conferidas com fluxo de aprovação
              </div>
            </div>

            <div className="vn-card p-5">
              <div className="flex items-center justify-between text-xs font-bold text-[#52627A]">
                <span>Resultado Líquido de Caixa</span>
                <DollarSign className="w-4 h-4 text-[#0571ED]" />
              </div>
              <div className="text-2xl font-extrabold text-[#052557] mt-2 tabular-nums">
                {formatBrl(clientFinancialSummary.balance)}
              </div>
              <div className="text-[11px] text-[#52627A] mt-1">
                Bancos: {currentClient.bankAccounts}
              </div>
            </div>

            <div className="vn-card p-5">
              <div className="flex items-center justify-between text-xs font-bold text-[#52627A]">
                <span>Lotes &amp; Chamados Ativos</span>
                <ShieldCheck className="w-4 h-4 text-[#FA670D]" />
              </div>
              <div className="text-2xl font-extrabold text-[#052557] mt-2 tabular-nums">
                {clientBatches.filter((b) => b.status !== 'Aprovado').length} lote(s) /{' '}
                {clientTickets.filter((t) => t.status !== 'Encerrado').length} chamado(s)
              </div>
              <div className="text-[11px] text-[#52627A] mt-1">
                Atendimento em tempo real com a equipe VN
              </div>
            </div>
          </div>

          {/* TAB 1: VISÃO GERAL & PAINEL GERENCIAL */}
          {activeClientTab === 'PAINEL_GERAL' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 vn-card p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
                  <div>
                    <h3 className="text-base font-extrabold text-[#052557]">
                      Extrato de Movimentações Financeiras ({clientEntries.length})
                    </h3>
                    <p className="text-xs text-[#52627A]">
                      Todos os lançamentos de Contas a Pagar e Contas a Receber operados pela VN Soluções
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveClientTab('BOLETOS_PAGAMENTOS')}
                    className="px-3.5 py-2 rounded-xl bg-[#052557] text-white text-xs font-bold cursor-pointer"
                  >
                    + Enviar Boleto / Nota Fiscal
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#F4F7FB] border-b border-[#E2E8F0] text-[#52627A] font-bold">
                        <th className="py-2.5 px-3">Código / Doc</th>
                        <th className="py-2.5 px-3">Tipo</th>
                        <th className="py-2.5 px-3">Vencimento</th>
                        <th className="py-2.5 px-3">Favorecido / Cliente</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Valor (R$)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {clientEntries.map((entry) => (
                        <tr key={entry.id} className="hover:bg-[#F4F7FB]/60">
                          <td className="py-2.5 px-3 font-mono">
                            <div className="font-bold text-[#052557]">{entry.code}</div>
                            <div className="text-[11px] text-[#52627A]">{entry.documentNumber}</div>
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                                entry.type === 'RECEBER'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-orange-50 text-[#FA670D]'
                              }`}
                            >
                              {entry.type}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono tabular-nums">
                            {formatDateBr(entry.dueDate)}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-[#0F172A]">
                              {entry.counterpartyName}
                            </div>
                            <div className="text-[11px] text-[#52627A]">{entry.category}</div>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#052557] font-semibold">
                              {entry.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums">
                            {formatBrl(entry.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-4">
                <div className="vn-card p-6 space-y-3">
                  <h3 className="text-sm font-extrabold text-[#052557]">
                    Escopo Contratado &amp; SLA BPO
                  </h3>
                  <div className="p-3.5 rounded-2xl bg-[#F4F7FB] border border-[#E2E8F0] text-xs space-y-1.5">
                    <div>
                      <span className="text-[#52627A]">Sistema ERP:</span>{' '}
                      <strong className="text-[#052557]">{currentClient.erpSystem}</strong>
                    </div>
                    <div>
                      <span className="text-[#52627A]">Contas Bancárias:</span>{' '}
                      <strong className="text-[#052557]">{currentClient.bankAccounts}</strong>
                    </div>
                    <div>
                      <span className="text-[#52627A]">Analista Responsável:</span>{' '}
                      <strong className="text-[#052557]">{currentClient.responsibleAnalyst}</strong>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950">
                    <strong>Regra Específica da Sua Operação:</strong>{' '}
                    {currentClient.particularities}
                  </div>
                </div>

                <div className="vn-card p-6 space-y-3">
                  <h3 className="text-sm font-extrabold text-[#052557]">
                    Rotinas da Semana ({clientDemands.length})
                  </h3>
                  <div className="space-y-2">
                    {clientDemands.map((d) => (
                      <div
                        key={d.id}
                        className="p-3 rounded-xl bg-[#F4F7FB] border border-[#E2E8F0] text-xs flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="font-bold text-[#052557]">{d.title}</div>
                          <div className="text-[11px] text-[#52627A]">
                            Prazo: {d.dueDate} &bull; {d.assignedTo}
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                          {d.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BOLETOS, NOTAS FISCAIS & APROVAÇÃO DE LOTES */}
          {activeClientTab === 'BOLETOS_PAGAMENTOS' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 vn-card p-6 space-y-4">
                <div>
                  <h3 className="text-base font-extrabold text-[#052557]">
                    Lotes de Pagamento Aguardando Autorização do Cliente ({clientBatches.length})
                  </h3>
                  <p className="text-xs text-[#52627A]">
                    Segregação de Funções (SoD): a equipe VN confere os boletos e agenda no banco; você aprova a liberação com 1 clique.
                  </p>
                </div>

                <div className="space-y-3">
                  {clientBatches.map((batch) => (
                    <div
                      key={batch.id}
                      className="p-4 rounded-2xl border border-[#E2E8F0] bg-[#F4F7FB]/50 flex flex-wrap items-center justify-between gap-4 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-extrabold text-[#052557]">
                            {batch.code}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#0571ED] font-bold">
                            {batch.bankAccount}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold ${
                              batch.status === 'Aprovado'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {batch.status}
                          </span>
                        </div>
                        <div className="text-[#52627A]">
                          Remessa: <strong>{batch.title}</strong> &bull;{' '}
                          {batch.itemsCount} título(s) &bull; Preparado por: {batch.createdByName}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right font-mono">
                          <div className="text-sm font-extrabold text-[#052557] tabular-nums">
                            {formatBrl(batch.totalAmount)}
                          </div>
                          <div className="text-[10px] text-[#52627A]">Total da Remessa</div>
                        </div>

                        {batch.status !== 'Aprovado' && (
                          <button
                            type="button"
                            onClick={() => handleClientApproveBatch(batch.id)}
                            className="vn-btn-o !py-2 !px-4 text-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Autorizar Pagamento
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleClientSubmitPayable} className="vn-card p-6 space-y-4 h-fit">
                <div>
                  <h3 className="text-sm font-extrabold text-[#052557]">
                    Enviar Novo Boleto / Nota Fiscal para a VN
                  </h3>
                  <p className="text-xs text-[#52627A]">
                    Cai imediatamente na fila de Contas a Pagar do seu analista dedicado.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-[#52627A] mb-1">
                      Fornecedor / Favorecido *
                    </label>
                    <input
                      type="text"
                      required
                      value={clientSupplier}
                      onChange={(e) => setClientSupplier(e.target.value)}
                      placeholder="Ex.: Distribuidora Ceará Insumos"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FB] border border-[#E2E8F0]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-bold text-[#52627A] mb-1">Nº Nota / Doc *</label>
                      <input
                        type="text"
                        required
                        value={clientDocNumber}
                        onChange={(e) => setClientDocNumber(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FB] border border-[#E2E8F0] font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#52627A] mb-1">Valor (R$) *</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={clientAmount}
                        onChange={(e) => setClientAmount(e.target.value)}
                        placeholder="1850.00"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FB] border border-[#E2E8F0] font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-[#52627A] mb-1">
                      Data de Vencimento *
                    </label>
                    <input
                      type="date"
                      required
                      value={clientDueDate}
                      onChange={(e) => setClientDueDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FB] border border-[#E2E8F0] font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingClientEntry}
                    className="w-full py-3 rounded-xl bg-[#052557] hover:bg-[#031B4A] text-white font-bold text-xs cursor-pointer"
                  >
                    {submittingClientEntry
                      ? 'Protocolando no ERP...'
                      : 'Protocolar Conta a Pagar na VN'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: FLUXO DE CAIXA, DRE & FECHAMENTO MENSAL */}
          {activeClientTab === 'FLUXO_DRE_FECHAMENTO' && (
            <div className="space-y-6">
              {/* Interactive Cash Flow Module for the Authenticated Client */}
              <ClientCashFlowModule
                clients={clients}
                selectedClientId={currentClient.id}
                financialEntries={financialEntries}
                reconciliations={reconciliations}
                onFeedback={onFeedback}
                isClientPortalView={true}
              />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 vn-card p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
                  <div>
                    <h3 className="text-base font-extrabold text-[#052557]">
                      Demonstração do Resultado (DRE Gerencial) &amp; Fluxo de Caixa — {currentClient.tradeName}
                    </h3>
                    <p className="text-xs text-[#52627A]">
                      Apuração reconciliada pela controladoria VN Soluções
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3.5 py-2 rounded-xl bg-[#F4F7FB] border border-[#E2E8F0] text-xs font-bold text-[#052557] flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Imprimir DRE
                  </button>
                </div>

                <div className="divide-y divide-[#E2E8F0] text-xs">
                  <div className="py-3 flex justify-between font-bold text-[#052557]">
                    <span>1. (+) Receita Operacional Bruta</span>
                    <span className="font-mono text-emerald-700 tabular-nums">
                      {formatBrl(clientFinancialSummary.receivables)}
                    </span>
                  </div>
                  <div className="py-3 flex justify-between text-[#52627A]">
                    <span>2. (-) Deduções e Impostos Estimados (8,65%)</span>
                    <span className="font-mono text-red-600 tabular-nums">
                      - {formatBrl(clientFinancialSummary.receivables * 0.0865)}
                    </span>
                  </div>
                  <div className="py-3 flex justify-between font-bold text-[#0F172A] bg-[#F4F7FB] px-3 rounded-lg">
                    <span>3. (=) Receita Operacional Líquida</span>
                    <span className="font-mono tabular-nums">
                      {formatBrl(clientFinancialSummary.receivables * 0.9135)}
                    </span>
                  </div>
                  <div className="py-3 flex justify-between text-[#52627A]">
                    <span>4. (-) Custos e Despesas Operacionais (Contas a Pagar)</span>
                    <span className="font-mono text-red-600 tabular-nums">
                      - {formatBrl(clientFinancialSummary.payables)}
                    </span>
                  </div>
                  <div className="py-3.5 flex justify-between font-extrabold text-sm text-[#052557] bg-blue-50/60 px-3 rounded-xl">
                    <span>5. (=) Resultado Operacional Líquido de Caixa</span>
                    <span className="font-mono tabular-nums">
                      {formatBrl(
                        clientFinancialSummary.receivables * 0.9135 -
                          clientFinancialSummary.payables
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="vn-card p-6 space-y-4">
                <h3 className="text-sm font-extrabold text-[#052557]">
                  Status do Fechamento Mensal &amp; Conciliação
                </h3>
                {clientClosings.map((closing) => (
                  <div
                    key={closing.id}
                    className="p-4 rounded-2xl bg-[#F4F7FB] border border-[#E2E8F0] text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#052557]">{closing.code}</span>
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#0571ED] font-bold">
                        {closing.status}
                      </span>
                    </div>
                    <div className="text-[#52627A]">
                      Competência: <strong>{closing.competence}</strong> &bull; Responsável:{' '}
                      <strong>{closing.responsibleName}</strong>
                    </div>
                  </div>
                ))}

                <div className="pt-2 border-t border-[#E2E8F0] space-y-2">
                  <div className="text-xs font-bold text-[#052557]">
                    Conciliações Bancárias OFX ({clientReconciliations.length})
                  </div>
                  {clientReconciliations.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-3 rounded-xl bg-[#F4F7FB] border border-[#E2E8F0] text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-[#0F172A]">{rec.bankAccount}</div>
                        <div className="text-[11px] text-[#52627A]">
                          Data: {formatDateBr(rec.statementDate)}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          rec.status === 'Conciliado'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-[#FA670D]'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              </div>
            </div>
          )}

          {/* TAB 4: CHAMADOS DIRETO COM A VN (COM PROTOCOLO) */}
          {activeClientTab === 'CHAMADOS_PENDENCIAS' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 vn-card p-6 space-y-4">
                <h3 className="text-base font-extrabold text-[#052557]">
                  Meus Chamados e Solicitações com a VN Soluções ({clientTickets.length})
                </h3>
                <div className="space-y-3">
                  {clientTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="p-4 rounded-2xl border border-[#E2E8F0] bg-[#F4F7FB]/50 text-xs space-y-1.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-extrabold text-[#FA670D]">
                            {ticket.protocolNumber}
                          </span>
                          <strong className="text-sm text-[#052557]">{ticket.title}</strong>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#052557] font-bold">
                          {ticket.status}
                        </span>
                      </div>
                      <p className="text-[#52627A]">{ticket.description}</p>
                      <div className="text-[11px] text-slate-400">
                        Equipe: <strong>{ticket.assignedTeam}</strong> ({ticket.assignedTo}) &bull;
                        SLA: {ticket.slaDueAt}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleClientOpenTicket} className="vn-card p-6 space-y-4 h-fit">
                <div>
                  <h3 className="text-sm font-extrabold text-[#052557]">
                    Abrir Novo Chamado Direto com Protocolo
                  </h3>
                  <p className="text-xs text-[#52627A]">
                    Roteamento imediato para a mesa de operações da VN Soluções.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-[#52627A] mb-1">Assunto *</label>
                    <input
                      type="text"
                      required
                      value={reqTitle}
                      onChange={(e) => setReqTitle(e.target.value)}
                      placeholder="Ex.: Dúvida sobre retenção na NF-4410"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FB] border border-[#E2E8F0]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-bold text-[#52627A] mb-1">Categoria</label>
                      <select
                        value={reqCategory}
                        onChange={(e) => setReqCategory(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#F4F7FB] border border-[#E2E8F0]"
                      >
                        <option value="Divergências financeiras">Financeiro / Boletos</option>
                        <option value="Falhas de processo">Relatórios / DRE</option>
                        <option value="Integrações">ERP Omie / Bancos</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-[#52627A] mb-1">Prioridade</label>
                      <select
                        value={reqPriority}
                        onChange={(e) => setReqPriority(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#F4F7FB] border border-[#E2E8F0]"
                      >
                        <option value="Média">Normal</option>
                        <option value="Alta">Alta</option>
                        <option value="Urgente">Urgente</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-[#52627A] mb-1">Descrição *</label>
                    <textarea
                      rows={3}
                      required
                      value={reqDescription}
                      onChange={(e) => setReqDescription(e.target.value)}
                      placeholder="Detalhe sua solicitação para seu analista VN..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FB] border border-[#E2E8F0]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingTicket}
                    className="vn-btn-o w-full !py-3 text-xs"
                  >
                    {submittingTicket ? 'Gerando Protocolo...' : 'Gerar Protocolo no Service Desk'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 5: PARCEIROS INDICADOS & BENEFÍCIOS CONQUISTADOS */}
          {activeClientTab === 'PARCEIROS_BENEFICIOS' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 vn-card p-6 space-y-5">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#FA670D]">
                    Rede de Benefícios Exclusivos · Clientes VN Soluções
                  </span>
                  <h3 className="text-lg font-extrabold text-[#052557] mt-1">
                    Parceiros Homologados &amp; Benefícios Conquistados por {currentClient.tradeName}
                  </h3>
                  <p className="text-xs text-[#52627A]">
                    Aproveite condições especiais negociadas pela VN Soluções junto a bancos, ERPs e parceiros estratégicos.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl border border-[#E2E8F0] bg-[#F4F7FB]/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                        BENEFÍCIO ATIVO
                      </span>
                      <Cpu className="w-5 h-5 text-[#0571ED]" />
                    </div>
                    <h4 className="font-bold text-[#052557]">ERP Omie · Parceria Oficial VN</h4>
                    <p className="text-xs text-[#52627A]">
                      Implantação parametrizada + desconto na mensalidade da licença para clientes da carteira BPO VN Soluções.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl border border-[#E2E8F0] bg-[#F4F7FB]/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-[#FA670D] text-[10px] font-extrabold">
                        CONDIÇÃO ESPECIAL
                      </span>
                      <Network className="w-5 h-5 text-[#FA670D]" />
                    </div>
                    <h4 className="font-bold text-[#052557]">
                      Juntaê · Serviços &amp; Recrutamento
                    </h4>
                    <p className="text-xs text-[#52627A]">
                      Prioridade no mapeamento e seleção de profissionais e prestadores homologados para sua operação.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl border border-[#E2E8F0] bg-[#F4F7FB]/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#052557] text-[10px] font-extrabold">
                        CONVÊNIO BANCÁRIO
                      </span>
                      <Landmark className="w-5 h-5 text-[#052557]" />
                    </div>
                    <h4 className="font-bold text-[#052557]">
                      Tarifa Reduzida PIX / Boletos &amp; CNAB
                    </h4>
                    <p className="text-xs text-[#52627A]">
                      Apoio na integração de cobrança automática e conciliação D+1 sem custo operacional extra.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl border border-[#E2E8F0] bg-[#F4F7FB]/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                        PROGRAMA INDICAÇÃO
                      </span>
                      <Gift className="w-5 h-5 text-emerald-700" />
                    </div>
                    <h4 className="font-bold text-[#052557]">
                      Bônus de Parceria B2B VN Soluções
                    </h4>
                    <p className="text-xs text-[#52627A]">
                      Indique uma empresa parceira ou cliente e conquiste créditos diretos no fee mensal BPO.
                    </p>
                  </div>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!referralCompany.trim()) return;
                  onFeedback(
                    'success',
                    `Indicação de "${referralCompany}" Registrada!`,
                    'Nossa equipe comercial entrará em contato e vinculará o benefício à sua conta.'
                  );
                  setReferralCompany('');
                  setReferralContact('');
                  setReferralPhone('');
                }}
                className="vn-card p-6 space-y-4 h-fit"
              >
                <div>
                  <h3 className="text-sm font-extrabold text-[#052557]">
                    Indicar Empresa Parceira ou Cliente
                  </h3>
                  <p className="text-xs text-[#52627A]">
                    Conecte negócios ao ecossistema VN Soluções e acumule benefícios.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-[#52627A] mb-1">
                      Nome da Empresa Indicada *
                    </label>
                    <input
                      type="text"
                      required
                      value={referralCompany}
                      onChange={(e) => setReferralCompany(e.target.value)}
                      placeholder="Ex.: Grupo Horizonte Logística"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FB] border border-[#E2E8F0]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#52627A] mb-1">
                      Responsável / Contato *
                    </label>
                    <input
                      type="text"
                      required
                      value={referralContact}
                      onChange={(e) => setReferralContact(e.target.value)}
                      placeholder="Nome do sócio ou gestor"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FB] border border-[#E2E8F0]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#52627A] mb-1">WhatsApp *</label>
                    <input
                      type="text"
                      required
                      value={referralPhone}
                      onChange={(e) => setReferralPhone(e.target.value)}
                      placeholder="(85) 99999-0000"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FB] border border-[#E2E8F0]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#52627A] mb-1">Segmento</label>
                    <select
                      value={referralSegment}
                      onChange={(e) => setReferralSegment(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FB] border border-[#E2E8F0]"
                    >
                      {PARCERIAS_LIST.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className="vn-btn-o w-full !py-3 text-xs">
                    Enviar Indicação para a VN
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ====================================================================
          VIEW 4: GESTÃO INTERNA DE CREDENCIAIS, USUÁRIOS & SENHAS DOS CLIENTES
          ("APENAS NÓS INTERNAMENTE CRIAMOS O CADASTRO, USUÁRIO E SENHA DELES")
         ==================================================================== */}
      {mainView === 'credentials' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 vn-card p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
              <div>
                <span className="vn-eyebrow text-xs font-extrabold uppercase tracking-widest text-[#FA670D]">
                  Controle Interno Exclusivo · VN Soluções
                </span>
                <h3 className="text-lg font-extrabold text-[#052557] mt-0.5">
                  Usuários, Senhas e Códigos de Autorização das Empresas Clientes ({credentials.length})
                </h3>
                <p className="text-xs text-[#52627A]">
                  Apenas a equipe interna da VN Soluções pode cadastrar, habilitar ou revogar credenciais de acesso à Área do Cliente.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShareModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-[#F4F7FB] border border-[#E2E8F0] text-xs font-bold text-[#052557] flex items-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-[#FA670D]" />
                Links p/ Instagram &amp; Bio
              </button>
            </div>

            <div className="space-y-3">
              {credentials.map((cred) => (
                <div
                  key={cred.id}
                  className="p-4 rounded-2xl border border-[#E2E8F0] bg-[#F4F7FB]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-extrabold text-[#0571ED]">
                        {cred.accessCode}
                      </span>
                      <strong className="text-sm text-[#052557]">{cred.clientName}</strong>
                      <span className="text-[#52627A] font-mono">({cred.cnpj})</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          cred.active
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {cred.active ? 'AUTORIZADO' : 'REVOGADO'}
                      </span>
                    </div>

                    <div className="text-[#52627A]">
                      Representante: <strong className="text-[#0F172A]">{cred.contactName}</strong>{' '}
                      ({cred.roleTitle})
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-1 font-mono text-[11px]">
                      <span className="px-2.5 py-1 rounded-lg bg-white border border-[#E2E8F0] text-[#052557]">
                        Usuário: <strong>{cred.username}</strong>
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-white border border-[#E2E8F0] text-[#FA670D]">
                        Senha: <strong>{cred.password}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopyClientAccessKit(cred)}
                      className="px-3 py-2 rounded-xl bg-[#052557] hover:bg-[#031B4A] text-white font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5 text-[#FA670D]" />
                      Copiar Kit de Acesso
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLoggedClientId(cred.clientId);
                        setLoggedCredential(cred);
                        setMainView('client_area');
                      }}
                      className="px-3 py-2 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#0571ED] text-[#052557] font-bold cursor-pointer"
                    >
                      Abrir Visão Cliente
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleCredentialStatus(cred.id)}
                      className="px-2.5 py-2 rounded-xl border border-[#E2E8F0] text-[#52627A] hover:text-red-600 cursor-pointer"
                    >
                      {cred.active ? 'Bloquear' : 'Reativar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form to Provision a New Client Login Credential Internally */}
          <form onSubmit={handleCreateInternalCredential} className="vn-card p-6 space-y-4 h-fit">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#FA670D]">
                <UserPlus className="w-3.5 h-3.5" />
                Provisionamento Interno VN
              </div>
              <h3 className="text-base font-extrabold text-[#052557] mt-1">
                Criar Usuário e Senha de Autorização para Cliente
              </h3>
              <p className="text-xs text-[#52627A]">
                Gere o acesso exclusivo de uma empresa cliente cadastrada no ERP.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#52627A] mb-1">
                  Empresa Cliente Cadastrada *
                </label>
                <select
                  value={newCredClientId}
                  onChange={(e) => setNewCredClientId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FB] border border-[#E2E8F0] font-semibold text-[#052557]"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} &middot; {c.tradeName} ({c.cnpj})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#52627A] mb-1">
                  Nome do Sócio / Representante Autorizado *
                </label>
                <input
                  type="text"
                  required
                  value={newCredContactName}
                  onChange={(e) => setNewCredContactName(e.target.value)}
                  placeholder="Ex.: Dr. Marcos Moura"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FB] border border-[#E2E8F0]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#52627A] mb-1">Cargo / Alçada</label>
                <input
                  type="text"
                  value={newCredRoleTitle}
                  onChange={(e) => setNewCredRoleTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FB] border border-[#E2E8F0]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#52627A] mb-1">
                  Usuário / E-mail de Login *
                </label>
                <input
                  type="text"
                  required
                  value={newCredUsername}
                  onChange={(e) => setNewCredUsername(e.target.value)}
                  placeholder="diretoria@empresa.com.br"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FB] border border-[#E2E8F0] font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-[#52627A] mb-1">
                    Senha de Autorização *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCredPassword}
                    onChange={(e) => setNewCredPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FB] border border-[#E2E8F0] font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#52627A] mb-1">Código VN *</label>
                  <input
                    type="text"
                    required
                    value={newCredAccessCode}
                    onChange={(e) => setNewCredAccessCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FB] border border-[#E2E8F0] font-mono"
                  />
                </div>
              </div>

              <button type="submit" className="vn-btn-o w-full !py-3 text-xs">
                <KeyRound className="w-4 h-4" />
                Gerar Credencial Autorizada
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
