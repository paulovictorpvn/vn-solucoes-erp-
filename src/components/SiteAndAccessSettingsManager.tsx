import React, { useState } from 'react';
import {
  Users,
  ShieldCheck,
  Globe,
  Sliders,
  HelpCircle,
  Lock,
  Plus,
  Check,
  Copy,
  RefreshCw,
  Eye,
  Trash2,
  Edit3,
  KeyRound,
  Building2,
  Share2,
  Sparkles,
} from 'lucide-react';
import {
  ClientRecord,
  VnStaffMember,
  WebsiteCmsConfig,
  DEFAULT_WEBSITE_CMS_CONFIG,
} from '../types/erp.ts';

export interface ClientPortalCredentialItem {
  clientId: number;
  clientCode: string;
  companyName: string;
  cnpj: string;
  loginUser: string;
  passwordPlain: string;
  authCode: string;
  allowedContact: string;
  status: 'Ativo' | 'Bloqueado';
  updatedAt: string;
  createdByVnStaff: string;
}

interface SiteAndAccessSettingsManagerProps {
  clients: ClientRecord[];
  vnStaff: VnStaffMember[];
  activeStaffId: string;
  onSelectActiveStaff: (staff: VnStaffMember) => void;
  onUpdateVnStaff: (nextStaff: VnStaffMember[]) => void;
  cmsConfig: WebsiteCmsConfig;
  onUpdateCmsConfig: (nextConfig: WebsiteCmsConfig) => void;
  clientCredentials: ClientPortalCredentialItem[];
  onUpdateClientCredentials: (nextCreds: ClientPortalCredentialItem[]) => void;
  onOpenWebsitePreview: (subView: 'site' | 'login' | 'client_area') => void;
  onFeedback: (type: 'success' | 'error' | 'warning', title: string, message: string) => void;
}

export const SiteAndAccessSettingsManager: React.FC<SiteAndAccessSettingsManagerProps> = ({
  clients,
  vnStaff,
  activeStaffId,
  onSelectActiveStaff,
  onUpdateVnStaff,
  cmsConfig,
  onUpdateCmsConfig,
  clientCredentials,
  onUpdateClientCredentials,
  onOpenWebsitePreview,
  onFeedback,
}) => {
  const [activeTab, setActiveTab] = useState<
    'EQUIPE_VN' | 'CREDENCIAIS_CLIENTES' | 'TEXTOS_CONTATOS_BIO' | 'SERVICOS_FAQ' | 'SECOES_CORES'
  >('TEXTOS_CONTATOS_BIO');

  const activeStaff = vnStaff.find((s) => s.id === activeStaffId) || vnStaff[0];
  const isAuthorizedForCms =
    !activeStaff ||
    activeStaff.role === 'gestor' ||
    activeStaff.role === 'supervisor' ||
    activeStaff.role === 'comercial';

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Staff Form State
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffRole, setStaffRole] = useState<VnStaffMember['role']>('analista');
  const [staffJobTitle, setStaffJobTitle] = useState('Analista BPO Financeiro');
  const [staffDept, setStaffDept] = useState('Operação Contas a Pagar & Receber');
  const [staffPhone, setStaffPhone] = useState('(85) 99988-0000');
  const [staffPin, setStaffPin] = useState(() => `VN-OP-${Math.floor(1000 + Math.random() * 9000)}`);
  const [staffScopeAll, setStaffScopeAll] = useState(true);
  const [staffClientIds, setStaffClientIds] = useState<number[]>([1]);

  // Client Credential Form State
  const [selectedClientIdForCred, setSelectedClientIdForCred] = useState<number>(
    clients[0]?.id || 1
  );
  const [credLoginUser, setCredLoginUser] = useState('');
  const [credPassword, setCredPassword] = useState('');
  const [credAuthCode, setCredAuthCode] = useState('');
  const [credContactName, setCredContactName] = useState('');

  // New Service / New FAQ Form State
  const [newSrvTag, setNewSrvTag] = useState('GESTÃO BPO');
  const [newSrvTitle, setNewSrvTitle] = useState('');
  const [newSrvSummary, setNewSrvSummary] = useState('');
  const [newSrvDeliverable, setNewSrvDeliverable] = useState('');

  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqA, setNewFaqA] = useState('');

  const baseAppUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const copyText = (text: string, key: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    onFeedback('success', `${label} Copiado`, 'Pronto para colar no WhatsApp ou Instagram.');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Staff Handlers
  const handleSaveStaffMember = (e: React.FormEvent) => {
    e.preventDefault();
    const rolePermissionsMap: Record<VnStaffMember['role'], string> = {
      gestor: 'Alçada Plena · Diretoria, Aprovação de Lotes, Configurações do Site e Equipe VN',
      supervisor: 'Revisão Independente (SoD) · Aprovação de Lotes, Conciliação e Fechamento DRE',
      analista: 'Execução Operacional · Lançamentos, Triagem de Boletos/NFs e Preparação de Lotes',
      comercial: 'CRM Comercial · Triagem de Leads do Site, Propostas e Programa de Parcerias',
      engenharia: 'Confiabilidade & Segurança · Backups Cloud SQL, Logs e Gestão de Incidentes',
    };

    if (editingStaffId) {
      const updated = vnStaff.map((member) =>
        member.id === editingStaffId
          ? {
              ...member,
              name: staffName,
              email: staffEmail,
              role: staffRole,
              jobTitle: staffJobTitle,
              department: staffDept,
              phone: staffPhone,
              accessPin: staffPin,
              assignedClientIds: staffScopeAll ? ('ALL' as const) : staffClientIds,
              permissionsSummary: rolePermissionsMap[staffRole],
            }
          : member
      );
      onUpdateVnStaff(updated);
      setEditingStaffId(null);
      onFeedback(
        'success',
        'Colaborador Interno VN Atualizado',
        `Permissões e carteira de ${staffName} salvas com sucesso.`
      );
    } else {
      const newMember: VnStaffMember = {
        id: `vn-staff-${Date.now()}`,
        code: `OP-VN-0${vnStaff.length + 1}`,
        name: staffName,
        email: staffEmail,
        role: staffRole,
        jobTitle: staffJobTitle,
        department: staffDept,
        phone: staffPhone,
        accessPin: staffPin,
        assignedClientIds: staffScopeAll ? 'ALL' : staffClientIds,
        status: 'Ativo',
        permissionsSummary: rolePermissionsMap[staffRole],
        lastActiveAt: 'Recém-cadastrado',
      };
      onUpdateVnStaff([...vnStaff, newMember]);
      onFeedback(
        'success',
        'Novo Colaborador da VN Cadastrado',
        `${newMember.code} — ${newMember.name} liberado para acessar o sistema de gerenciamento.`
      );
    }

    setStaffName('');
    setStaffEmail('');
    setStaffPin(`VN-OP-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  const handleEditStaffClick = (member: VnStaffMember) => {
    setEditingStaffId(member.id);
    setStaffName(member.name);
    setStaffEmail(member.email);
    setStaffRole(member.role);
    setStaffJobTitle(member.jobTitle);
    setStaffDept(member.department);
    setStaffPhone(member.phone);
    setStaffPin(member.accessPin);
    if (member.assignedClientIds === 'ALL') {
      setStaffScopeAll(true);
    } else {
      setStaffScopeAll(false);
      setStaffClientIds(member.assignedClientIds);
    }
  };

  const handleToggleStaffStatus = (id: string) => {
    const updated = vnStaff.map((m) =>
      m.id === id
        ? { ...m, status: (m.status === 'Ativo' ? 'Bloqueado' : 'Ativo') as VnStaffMember['status'] }
        : m
    );
    onUpdateVnStaff(updated);
    onFeedback('warning', 'Status de Acesso Interno Alterado', 'Permissão do operador atualizada.');
  };

  // Client Credential Handlers
  const handleSelectClientForCred = (clientId: number) => {
    setSelectedClientIdForCred(clientId);
    const existing = clientCredentials.find((c) => c.clientId === clientId);
    if (existing) {
      setCredLoginUser(existing.loginUser);
      setCredPassword(existing.passwordPlain);
      setCredAuthCode(existing.authCode);
      setCredContactName(existing.allowedContact);
    } else {
      const target = clients.find((c) => c.id === clientId);
      const slug = (target?.tradeName || 'cliente').toLowerCase().replace(/[^a-z0-9]/g, '');
      setCredLoginUser(`financeiro@${slug}.com.br`);
      setCredPassword(`Vn@${slug.slice(0, 4).toUpperCase()}2026!`);
      setCredAuthCode(`VN-AUTH-${clientId}09`);
      setCredContactName(`Diretoria ${target?.tradeName || ''}`);
    }
  };

  const handleSaveClientCredential = (e: React.FormEvent) => {
    e.preventDefault();
    const targetClient = clients.find((c) => c.id === selectedClientIdForCred) || clients[0];
    if (!targetClient) return;

    const existingIdx = clientCredentials.findIndex((c) => c.clientId === targetClient.id);
    const nextItem: ClientPortalCredentialItem = {
      clientId: targetClient.id,
      clientCode: targetClient.code,
      companyName: targetClient.tradeName,
      cnpj: targetClient.cnpj,
      loginUser: credLoginUser || `financeiro@${targetClient.code.toLowerCase()}.com.br`,
      passwordPlain: credPassword || 'Vn@2026!',
      authCode: credAuthCode || `VN-AUTH-${targetClient.id}00`,
      allowedContact: credContactName || `Diretoria ${targetClient.tradeName}`,
      status: 'Ativo',
      updatedAt: new Date().toLocaleString('pt-BR'),
      createdByVnStaff: 'Controladoria Interna VN',
    };

    const nextList = [...clientCredentials];
    if (existingIdx >= 0) {
      nextList[existingIdx] = nextItem;
    } else {
      nextList.push(nextItem);
    }
    onUpdateClientCredentials(nextList);
    onFeedback(
      'success',
      `Credencial Exclusiva de ${targetClient.tradeName} Salva`,
      `Usuário ${nextItem.loginUser} e código ${nextItem.authCode} liberados para a Área do Cliente.`
    );
  };

  const handleToggleClientCredStatus = (clientId: number) => {
    const nextList = clientCredentials.map((c) =>
      c.clientId === clientId
        ? { ...c, status: (c.status === 'Ativo' ? 'Bloqueado' : 'Ativo') as 'Ativo' | 'Bloqueado' }
        : c
    );
    onUpdateClientCredentials(nextList);
    onFeedback(
      'warning',
      'Status de Credencial do Cliente Atualizado',
      'Acesso da empresa cliente alterado imediatamente.'
    );
  };

  // Services & FAQ Handlers
  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSrvTitle.trim()) return;
    const nextSrv = {
      id: `srv-${Date.now()}`,
      tag: newSrvTag,
      title: newSrvTitle,
      summary: newSrvSummary,
      bullets: [
        'Execução padronizada com checklist auditável',
        'Atendimento dedicado pela equipe VN Soluções',
        'Relatórios claros na Área do Cliente',
      ],
      deliverable: newSrvDeliverable || 'Entrega validada no Portal do Cliente',
    };
    onUpdateCmsConfig({
      ...cmsConfig,
      services: [...cmsConfig.services, nextSrv],
    });
    setNewSrvTitle('');
    setNewSrvSummary('');
    setNewSrvDeliverable('');
    onFeedback('success', 'Serviço Adicionado ao Website', `${nextSrv.title} publicado no site.`);
  };

  const handleRemoveService = (id: string) => {
    onUpdateCmsConfig({
      ...cmsConfig,
      services: cmsConfig.services.filter((s) => s.id !== id),
    });
    onFeedback('warning', 'Serviço Removido do Site', 'Card removido da vitrine pública.');
  };

  const handleAddFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaqQ.trim() || !newFaqA.trim()) return;
    onUpdateCmsConfig({
      ...cmsConfig,
      faqs: [...cmsConfig.faqs, { id: `faq-${Date.now()}`, q: newFaqQ, a: newFaqA }],
    });
    setNewFaqQ('');
    setNewFaqA('');
    onFeedback('success', 'Pergunta Frequente Adicionada', 'Nova dúvida publicada na seção FAQ.');
  };

  const handleRemoveFaq = (id: string) => {
    onUpdateCmsConfig({
      ...cmsConfig,
      faqs: cmsConfig.faqs.filter((f) => f.id !== id),
    });
    onFeedback('warning', 'Pergunta Removida do FAQ', 'Item excluído do site público.');
  };

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#052557] text-white text-[11px] font-extrabold uppercase tracking-wider">
              CMS &amp; Governança de Acessos VN
            </span>
            <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Sincronizado em Tempo Real com o Site e Portal
            </span>
          </div>
          <h2 className="text-lg font-extrabold text-[#052557] mt-1">
            Configurações do Site, Equipe Interna VN &amp; Credenciais de Clientes
          </h2>
          <p className="text-xs text-slate-500">
            Gerencie quem trabalha na VN Soluções, libere acessos de clientes e personalize 100% do Website Institucional e Link da Bio.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <span
            className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold border flex items-center gap-1.5 ${
              isAuthorizedForCms
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-300 text-amber-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Perfil Ativo: {activeStaff?.name} ({activeStaff?.role.toUpperCase()})
          </span>
          <button
            type="button"
            onClick={() => onOpenWebsitePreview('site')}
            className="px-3.5 py-2 rounded-xl bg-[#0571ED] hover:bg-[#052557] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            Ir para o Website Principal
          </button>
          <button
            type="button"
            onClick={() => onOpenWebsitePreview('login')}
            className="px-3.5 py-2 rounded-xl bg-[#FA670D] hover:bg-[#E05500] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            Ver Tela de Login (Cliente / Equipe VN)
          </button>
        </div>
      </div>

      {!isAuthorizedForCms && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-950 text-[11px] font-extrabold uppercase">
              Acesso Restrito · Governança CMS VN Soluções
            </div>
            <h3 className="text-base font-extrabold text-[#052557]">
              Este módulo de gerenciamento do CMS é exclusivo para perfis autorizados da equipe VN (Diretoria / Gestor, Supervisor ou Comercial)
            </h3>
            <p className="text-xs text-slate-700">
              O operador atual (<strong>{activeStaff?.name}</strong> — perfil <strong>{activeStaff?.role.toUpperCase()}</strong>) possui alçada estritamente operacional/técnica e não pode alterar textos públicos, links da Bio do Instagram ou visibilidade de seções do site.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              const director = vnStaff.find((s) => s.role === 'gestor') || vnStaff[0];
              if (director) {
                onSelectActiveStaff(director);
                onFeedback(
                  'success',
                  'Alçada Autorizada Ativada',
                  `Sessão alternada para ${director.name} (${director.jobTitle}) com permissão total sobre o CMS do site.`
                );
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-[#052557] hover:bg-[#0571ED] text-white text-xs font-extrabold shrink-0 cursor-pointer shadow-xs"
          >
            Autenticar como Gestor Autorizado VN
          </button>
        </div>
      )}

      {/* NAVIGATION TABS */}
      <div className="flex flex-wrap items-center gap-2 bg-white border border-slate-200 p-2 rounded-2xl shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab('EQUIPE_VN')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'EQUIPE_VN'
              ? 'bg-[#052557] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4 text-[#FA670D]" />
          1. Equipe Interna VN (Operadores do Sistema)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('CREDENCIAIS_CLIENTES')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'CREDENCIAIS_CLIENTES'
              ? 'bg-[#052557] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <KeyRound className="w-4 h-4 text-[#0571ED]" />
          2. Credenciais de Empresas Clientes
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('TEXTOS_CONTATOS_BIO')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'TEXTOS_CONTATOS_BIO'
              ? 'bg-[#052557] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Globe className="w-4 h-4 text-emerald-500" />
          3. Textos, WhatsApp, Parcerias &amp; Link da Bio
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('SERVICOS_FAQ')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'SERVICOS_FAQ'
              ? 'bg-[#052557] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-amber-500" />
          4. Serviços, Diagnóstico &amp; FAQ do Site
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('SECOES_CORES')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'SECOES_CORES'
              ? 'bg-[#052557] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-4 h-4 text-purple-500" />
          5. Seções Visíveis &amp; Cores de Destaque
        </button>
      </div>

      {/* ====================================================================
          TAB 1: EQUIPE INTERNA DA VN SOLUÇÕES (QUEM TRABALHA NA VN)
         ==================================================================== */}
      {activeTab === 'EQUIPE_VN' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-slate-200 bg-[#F8FAFC] flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-extrabold text-[#052557]">
                  Quadro de Colaboradores e Operadores Internos da VN Soluções ({vnStaff.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Controle quem trabalha na VN, sua alçada operacional (Gestor, Supervisor, Analista) e quais empresas clientes cada operador gerencia
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-200">
              {vnStaff.map((member) => {
                const isCurrentOperator = member.id === activeStaffId;
                const assignedNames =
                  member.assignedClientIds === 'ALL'
                    ? `Carteira Completa (${clients.length} empresas)`
                    : clients
                        .filter(
                          (c) =>
                            Array.isArray(member.assignedClientIds) &&
                            member.assignedClientIds.includes(c.id)
                        )
                        .map((c) => c.tradeName)
                        .join(', ') || 'Nenhuma empresa vinculada';

                return (
                  <div
                    key={member.id}
                    className={`p-5 text-xs space-y-3 transition-colors ${
                      isCurrentOperator ? 'bg-blue-50/40' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2.5 py-1 rounded-lg bg-[#052557] text-white font-mono font-bold">
                          {member.code}
                        </span>
                        <div>
                          <div className="text-sm font-extrabold text-[#052557] flex items-center gap-2">
                            {member.name}
                            {isCurrentOperator && (
                              <span className="px-2 py-0.5 rounded-full bg-[#0571ED] text-white text-[10px] font-bold">
                                Operador Ativo na Sessão
                              </span>
                            )}
                          </div>
                          <div className="text-slate-500">
                            {member.jobTitle} &bull; {member.department}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            member.status === 'Ativo'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {member.status}
                        </span>

                        <button
                          type="button"
                          onClick={() => onSelectActiveStaff(member)}
                          disabled={member.status !== 'Ativo'}
                          className={`px-3 py-1.5 rounded-xl font-bold text-[11px] cursor-pointer ${
                            isCurrentOperator
                              ? 'bg-emerald-600 text-white'
                              : 'bg-[#0571ED] hover:bg-[#052557] text-white disabled:opacity-40'
                          }`}
                        >
                          {isCurrentOperator ? 'Sessão Ativa' : 'Assumir Operador'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleEditStaffClick(member)}
                          className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 cursor-pointer"
                          title="Editar colaborador"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleStaffStatus(member.id)}
                          className="px-2.5 py-1 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer"
                        >
                          {member.status === 'Ativo' ? 'Bloquear' : 'Ativar'}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 p-3 rounded-xl bg-[#F4F7FB] border border-slate-200/80">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">
                          Login Interno &amp; PIN
                        </span>
                        <span className="font-mono font-bold text-[#052557]">{member.email}</span>
                        <span className="block font-mono text-[11px] text-[#FA670D] font-bold">
                          PIN: {member.accessPin}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">
                          Carteira de Clientes Atribuída
                        </span>
                        <span className="font-bold text-slate-800">{assignedNames}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">
                            Alçada Operacional
                          </span>
                          <span className="font-bold text-[#0571ED] uppercase">{member.role}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            copyText(
                              `*ACESSO INTERNO RETAGUARDA — VN SOLUÇÕES*\nColaborador: ${member.name} (${member.code})\nCargo: ${member.jobTitle}\nE-mail: ${member.email}\nPIN Interno: ${member.accessPin}\nCarteira: ${assignedNames}\nLink Retaguarda: ${baseAppUrl}`,
                              `staff-${member.id}`,
                              'Credencial Interna VN'
                            )
                          }
                          className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-[#0571ED] text-[#052557] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          {copiedKey === `staff-${member.id}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-[#0571ED]" />
                          )}
                          Copiar Acesso
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form to Add / Edit VN Staff Member */}
          <form
            onSubmit={handleSaveStaffMember}
            className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3.5 h-fit shadow-xs text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-[#052557]">
                {editingStaffId
                  ? 'Editar Colaborador da VN'
                  : 'Cadastrar Novo Colaborador Interno VN'}
              </h3>
              {editingStaffId && (
                <button
                  type="button"
                  onClick={() => setEditingStaffId(null)}
                  className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
              )}
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nome Completo *</label>
              <input
                type="text"
                required
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                placeholder="Ex.: Fernanda Lima"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                E-mail Corporativo de Login *
              </label>
              <input
                type="email"
                required
                value={staffEmail}
                onChange={(e) => setStaffEmail(e.target.value)}
                placeholder="fernanda.bpo@vnsolucoes.com.br"
                className="w-full px-3 py-2 font-mono border border-slate-300 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Alçada no Sistema *</label>
                <select
                  value={staffRole}
                  onChange={(e) => setStaffRole(e.target.value as VnStaffMember['role'])}
                  className="w-full px-2.5 py-2 border border-slate-300 rounded-xl bg-white font-semibold"
                >
                  <option value="analista">Analista BPO (Executor)</option>
                  <option value="supervisor">Supervisor (Revisor SoD)</option>
                  <option value="gestor">Diretor / Gestor (Plena)</option>
                  <option value="comercial">Comercial &amp; CRM</option>
                  <option value="engenharia">Engenharia &amp; Backups</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">PIN / Senha Interna *</label>
                <input
                  type="text"
                  required
                  value={staffPin}
                  onChange={(e) => setStaffPin(e.target.value)}
                  className="w-full px-3 py-2 font-mono font-bold text-[#FA670D] border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Cargo *</label>
                <input
                  type="text"
                  required
                  value={staffJobTitle}
                  onChange={(e) => setStaffJobTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">WhatsApp</label>
                <input
                  type="text"
                  value={staffPhone}
                  onChange={(e) => setStaffPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#F4F7FB] border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#052557]">Carteira de Empresas Clientes</span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={staffScopeAll}
                    onChange={(e) => setStaffScopeAll(e.target.checked)}
                  />
                  <span className="font-semibold">Todas as empresas</span>
                </label>
              </div>

              {!staffScopeAll && (
                <div className="space-y-1 pt-1">
                  {clients.map((c) => (
                    <label key={c.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={staffClientIds.includes(c.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setStaffClientIds([...staffClientIds, c.id]);
                          } else {
                            setStaffClientIds(staffClientIds.filter((id) => id !== c.id));
                          }
                        }}
                      />
                      <span>
                        {c.code} · {c.tradeName}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#052557] hover:bg-[#0571ED] text-white font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {editingStaffId
                ? 'Salvar Alterações do Colaborador'
                : 'Liberar Colaborador na Retaguarda VN'}
            </button>
          </form>
        </div>
      )}

      {/* ====================================================================
          TAB 2: CREDENCIAIS EXCLUSIVAS DE EMPRESAS CLIENTES
         ==================================================================== */}
      {activeTab === 'CREDENCIAIS_CLIENTES' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-slate-200 bg-[#F8FAFC]">
              <h3 className="text-sm font-extrabold text-[#052557]">
                Credenciais Emitidas Internamente para Empresas Clientes ({clientCredentials.length})
              </h3>
              <p className="text-xs text-slate-500">
                Regra de Segurança: O site público não permite auto-cadastro de senha. Somente a equipe VN cria e entrega este Kit de Acesso ao cliente.
              </p>
            </div>

            <div className="divide-y divide-slate-200">
              {clientCredentials.map((cred) => (
                <div key={cred.clientId} className="p-5 text-xs space-y-3 hover:bg-slate-50">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-mono font-extrabold text-[#0571ED]">
                        {cred.clientCode}
                      </span>{' '}
                      &bull; <strong className="text-sm text-[#052557]">{cred.companyName}</strong>{' '}
                      <span className="text-slate-400 font-mono">({cred.cnpj})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          cred.status === 'Ativo'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {cred.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSelectClientForCred(cred.clientId)}
                        className="px-2.5 py-1 rounded-lg border border-slate-300 hover:bg-slate-100 font-bold text-[#052557] cursor-pointer"
                      >
                        Editar Senha
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleClientCredStatus(cred.clientId)}
                        className="px-2.5 py-1 rounded-lg border border-slate-300 hover:bg-slate-100 font-semibold text-slate-600 cursor-pointer"
                      >
                        {cred.status === 'Ativo' ? 'Bloquear' : 'Liberar'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-[#F4F7FB] border border-slate-200 font-mono">
                    <div>
                      <span className="text-[10px] font-sans font-bold uppercase text-slate-400 block">
                        Usuário / E-mail
                      </span>
                      <strong className="text-[#052557]">{cred.loginUser}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-sans font-bold uppercase text-slate-400 block">
                        Senha de Acesso
                      </span>
                      <strong className="text-slate-900">{cred.passwordPlain}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-sans font-bold uppercase text-slate-400 block">
                          Código de Autorização
                        </span>
                        <strong className="text-[#FA670D]">{cred.authCode}</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          copyText(
                            `*KIT DE ACESSO — ÁREA DO CLIENTE VN SOLUÇÕES*\nEmpresa: ${cred.companyName} (${cred.cnpj})\nLink Direto: ${baseAppUrl}/?view=portal\nUsuário: ${cred.loginUser}\nSenha: ${cred.passwordPlain}\nCódigo de Autorização: ${cred.authCode}`,
                            `cred-${cred.clientId}`,
                            'Kit de Acesso do Cliente'
                          )
                        }
                        className="px-3 py-1.5 rounded-lg bg-[#052557] hover:bg-[#0571ED] text-white font-sans font-bold flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === `cred-${cred.clientId}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        Copiar Kit WhatsApp
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form
            onSubmit={handleSaveClientCredential}
            className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3.5 h-fit shadow-xs text-xs"
          >
            <h3 className="text-sm font-extrabold text-[#052557]">
              Gerar ou Atualizar Senha de Empresa Cliente
            </h3>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Empresa Cliente BPO *</label>
              <select
                value={selectedClientIdForCred}
                onChange={(e) => handleSelectClientForCred(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-bold text-[#052557]"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} · {c.tradeName} ({c.cnpj})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Usuário / E-mail Autorizado *
              </label>
              <input
                type="text"
                required
                value={credLoginUser}
                onChange={(e) => setCredLoginUser(e.target.value)}
                placeholder="financeiro@empresa.com.br"
                className="w-full px-3 py-2 font-mono border border-slate-300 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Senha Exclusiva *</label>
                <input
                  type="text"
                  required
                  value={credPassword}
                  onChange={(e) => setCredPassword(e.target.value)}
                  placeholder="Vn@2026!"
                  className="w-full px-3 py-2 font-mono border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Código VN-AUTH *</label>
                <input
                  type="text"
                  required
                  value={credAuthCode}
                  onChange={(e) => setCredAuthCode(e.target.value)}
                  placeholder="VN-AUTH-109"
                  className="w-full px-3 py-2 font-mono font-bold text-[#FA670D] border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Sócio / Gestor Responsável no Cliente
              </label>
              <input
                type="text"
                value={credContactName}
                onChange={(e) => setCredContactName(e.target.value)}
                placeholder="Diretoria Financeira"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#FA670D] hover:bg-[#E05500] text-white font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              Salvar e Liberar Acesso do Cliente
            </button>
          </form>
        </div>
      )}

      {/* ====================================================================
          TAB 3: TEXTOS, CONTATOS, WHATSAPP, PARCERIAS & LINKS DA BIO
         ==================================================================== */}
      {activeTab === 'TEXTOS_CONTATOS_BIO' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs text-xs">
            <h3 className="text-sm font-extrabold text-[#052557] border-b border-slate-100 pb-3">
              Editor de Textos Principais, Contatos, WhatsApp e Regras de Parceria
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Selo Superior (Hero Badge)</label>
                <input
                  type="text"
                  value={cmsConfig.heroBadge}
                  onChange={(e) => onUpdateCmsConfig({ ...cmsConfig, heroBadge: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Slogan / Assinatura da Marca</label>
                <input
                  type="text"
                  value={cmsConfig.brandTagline}
                  onChange={(e) =>
                    onUpdateCmsConfig({ ...cmsConfig, brandTagline: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Título Principal da Capa (Hero Title)
              </label>
              <input
                type="text"
                value={cmsConfig.heroTitle}
                onChange={(e) => onUpdateCmsConfig({ ...cmsConfig, heroTitle: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-[#052557]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Subtítulo Explicativo da Capa
              </label>
              <textarea
                rows={2}
                value={cmsConfig.heroSubtitle}
                onChange={(e) => onUpdateCmsConfig({ ...cmsConfig, heroSubtitle: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  WhatsApp Oficial (somente dígitos c/ DDI)
                </label>
                <input
                  type="text"
                  value={cmsConfig.whatsappNumber}
                  onChange={(e) =>
                    onUpdateCmsConfig({ ...cmsConfig, whatsappNumber: e.target.value })
                  }
                  className="w-full px-3 py-2 font-mono border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  WhatsApp Formatado no Site
                </label>
                <input
                  type="text"
                  value={cmsConfig.whatsappDisplay}
                  onChange={(e) =>
                    onUpdateCmsConfig({ ...cmsConfig, whatsappDisplay: e.target.value })
                  }
                  className="w-full px-3 py-2 font-mono border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Instagram Oficial</label>
                <input
                  type="text"
                  value={cmsConfig.instagramHandle}
                  onChange={(e) =>
                    onUpdateCmsConfig({ ...cmsConfig, instagramHandle: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">E-mail Comercial</label>
                <input
                  type="text"
                  value={cmsConfig.commercialEmail}
                  onChange={(e) =>
                    onUpdateCmsConfig({ ...cmsConfig, commercialEmail: e.target.value })
                  }
                  className="w-full px-3 py-2 font-mono border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Base / Atendimento</label>
                <input
                  type="text"
                  value={cmsConfig.cityState}
                  onChange={(e) => onUpdateCmsConfig({ ...cmsConfig, cityState: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Bônus de Indicação Parceiro (%)
                </label>
                <input
                  type="number"
                  min={5}
                  max={50}
                  value={cmsConfig.partnerBonusPercent}
                  onChange={(e) =>
                    onUpdateCmsConfig({
                      ...cmsConfig,
                      partnerBonusPercent: Number(e.target.value || 15),
                    })
                  }
                  className="w-full px-3 py-2 font-mono font-bold text-[#FA670D] border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Regra Oficial do Programa de Parcerias &amp; Indicação Premiada
              </label>
              <textarea
                rows={2}
                value={cmsConfig.partnerBonusRules}
                onChange={(e) =>
                  onUpdateCmsConfig({ ...cmsConfig, partnerBonusRules: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          {/* Right Column: Shareable Links Hub for Instagram Bio & WhatsApp */}
          <div className="bg-[#031B4A] text-white rounded-2xl p-6 space-y-4 shadow-md text-xs h-fit">
            <div className="flex items-center gap-2 text-[#FA670D] font-extrabold uppercase tracking-wider">
              <Share2 className="w-4 h-4" />
              Links Oficiais p/ Bio do Instagram &amp; Redes
            </div>
            <p className="text-slate-300 leading-relaxed">
              Copie qualquer um dos links abaixo para colocar na Bio do Instagram ({cmsConfig.instagramHandle}), Stories ou disparo de WhatsApp:
            </p>

            {[
              {
                key: 'bio-site',
                title: '1. Website Completo VN Soluções (Bio Principal)',
                url: `${baseAppUrl}/?view=site`,
              },
              {
                key: 'bio-atendimento',
                title: '2. Abrir Chamado / Solicitar Proposta Direto',
                url: `${baseAppUrl}/?view=site#atendimento`,
              },
              {
                key: 'bio-diag',
                title: '3. Quiz Mini-Diagnóstico Financeiro (60s)',
                url: `${baseAppUrl}/?view=site#diagnostico`,
              },
              {
                key: 'bio-portal',
                title: '4. Login Direto · Área do Cliente',
                url: `${baseAppUrl}/?view=portal`,
              },
            ].map((item) => (
              <div
                key={item.key}
                className="p-3.5 rounded-xl bg-[#052557] border border-white/10 space-y-2"
              >
                <div className="font-bold text-white">{item.title}</div>
                <div className="font-mono text-[11px] text-blue-200 truncate">{item.url}</div>
                <button
                  type="button"
                  onClick={() => copyText(item.url, item.key, item.title)}
                  className="w-full py-2 rounded-lg bg-[#FA670D] hover:bg-[#E05500] text-white font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copiedKey === item.key ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Link Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copiar Link para Instagram
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ====================================================================
          TAB 4: SERVIÇOS, DIAGNÓSTICO & FAQ DO SITE
         ==================================================================== */}
      {activeTab === 'SERVICOS_FAQ' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          {/* Services Column */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-extrabold text-[#052557]">
              Cards de Serviços Exibidos no Site ({cmsConfig.services.length})
            </h3>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {cmsConfig.services.map((srv) => (
                <div
                  key={srv.id}
                  className="p-3.5 rounded-xl bg-[#F4F7FB] border border-slate-200 flex items-start justify-between gap-3"
                >
                  <div>
                    <span className="text-[10px] font-extrabold text-[#0571ED] uppercase">
                      {srv.tag}
                    </span>
                    <div className="font-bold text-[#052557] text-sm">{srv.title}</div>
                    <p className="text-slate-600 mt-0.5">{srv.summary}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveService(srv.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                    title="Remover serviço do site"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <form
              onSubmit={handleAddService}
              className="pt-3 border-t border-slate-200 space-y-2.5"
            >
              <div className="font-extrabold text-[#052557]">Adicionar Novo Card de Serviço</div>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={newSrvTag}
                  onChange={(e) => setNewSrvTag(e.target.value)}
                  placeholder="Tag (ex: BPO)"
                  className="px-3 py-2 border border-slate-300 rounded-xl"
                />
                <input
                  type="text"
                  required
                  value={newSrvTitle}
                  onChange={(e) => setNewSrvTitle(e.target.value)}
                  placeholder="Título do Serviço *"
                  className="col-span-2 px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
              <textarea
                rows={2}
                required
                value={newSrvSummary}
                onChange={(e) => setNewSrvSummary(e.target.value)}
                placeholder="Descrição clara do benefício para o cliente *"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
              <input
                type="text"
                value={newSrvDeliverable}
                onChange={(e) => setNewSrvDeliverable(e.target.value)}
                placeholder="Entregável principal (ex: Relatório semanal + DRE)"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-[#052557] hover:bg-[#0571ED] text-white font-bold cursor-pointer"
              >
                + Publicar Serviço no Website
              </button>
            </form>
          </div>

          {/* FAQ Column */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-extrabold text-[#052557]">
              Perguntas Frequentes (FAQ) do Website ({cmsConfig.faqs.length})
            </h3>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {cmsConfig.faqs.map((f) => (
                <div
                  key={f.id}
                  className="p-3.5 rounded-xl bg-[#F4F7FB] border border-slate-200 flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="font-bold text-[#052557]">{f.q}</div>
                    <p className="text-slate-600 mt-1">{f.a}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFaq(f.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                    title="Excluir pergunta"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddFaq} className="pt-3 border-t border-slate-200 space-y-2.5">
              <div className="font-extrabold text-[#052557]">Adicionar Nova Pergunta ao FAQ</div>
              <input
                type="text"
                required
                value={newFaqQ}
                onChange={(e) => setNewFaqQ(e.target.value)}
                placeholder="Pergunta frequente do cliente *"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
              <textarea
                rows={2}
                required
                value={newFaqA}
                onChange={(e) => setNewFaqA(e.target.value)}
                placeholder="Resposta oficial da VN Soluções *"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-[#052557] hover:bg-[#0571ED] text-white font-bold cursor-pointer"
              >
                + Publicar Pergunta no FAQ
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          TAB 5: CONTROLE DE SEÇÕES VISÍVEIS & CORES DE DESTAQUE
         ==================================================================== */}
      {activeTab === 'SECOES_CORES' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-[#052557]">
                  Controle de Visibilidade das Seções do Website Público
                </h3>
                <p className="text-slate-500">
                  Ative ou oculte blocos do site instantaneamente conforme sua estratégia comercial
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onUpdateCmsConfig(DEFAULT_WEBSITE_CMS_CONFIG);
                  onFeedback(
                    'success',
                    'Padrões Originais Restaurados',
                    'Todas as seções, cores e textos originais da VN Soluções foram restaurados.'
                  );
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Restaurar Padrão Original VN
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(
                [
                  { key: 'quemSomos', label: '1. Quem Somos & Posicionamento' },
                  { key: 'principios', label: '2. Nossos 4 Princípios Inegociáveis' },
                  { key: 'diferenciais', label: '3. Diferenciais Competitivos VN' },
                  { key: 'servicos', label: '4. Vitrine Interativa de Serviços BPO' },
                  { key: 'metodologia', label: '5. Metodologia em 4 Etapas' },
                  { key: 'parcerias', label: '6. Ecossistema & Programa de Parcerias B2B' },
                  { key: 'portalErp', label: '7. Demonstração Área do Cliente & ERP' },
                  { key: 'diagnostico', label: '8. Quiz Mini-Diagnóstico Financeiro (5 perguntas)' },
                  { key: 'atendimento', label: '9. Central de Atendimento & Protocolo VN' },
                  { key: 'guiaRapido', label: '10. Guia Rápido de Onboarding do Cliente' },
                  { key: 'faq', label: '11. Perguntas Frequentes (FAQ)' },
                ] as const
              ).map((sec) => {
                const isVisible = cmsConfig.visibleSections[sec.key];
                return (
                  <label
                    key={sec.key}
                    className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                      isVisible
                        ? 'bg-emerald-50/40 border-emerald-200 text-[#052557]'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <span className="font-bold">{sec.label}</span>
                    <input
                      type="checkbox"
                      checked={isVisible}
                      onChange={(e) =>
                        onUpdateCmsConfig({
                          ...cmsConfig,
                          visibleSections: {
                            ...cmsConfig.visibleSections,
                            [sec.key]: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4 accent-[#0571ED]"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 h-fit shadow-xs">
            <h3 className="text-sm font-extrabold text-[#052557]">
              Cor de Destaque e Conversão do Site
            </h3>
            <p className="text-slate-500">
              Escolha a tonalidade de destaque para botões de ação, selos e protocolos:
            </p>

            <div className="space-y-2.5">
              {[
                { color: '#FA670D', label: 'Laranja Oficial VN Soluções (#FA670D)' },
                { color: '#0571ED', label: 'Azul Royal Tecnológico (#0571ED)' },
                { color: '#10B981', label: 'Verde Esmeralda Financeiro (#10B981)' },
                { color: '#D97706', label: 'Âmbar Executivo (#D97706)' },
              ].map((opt) => (
                <button
                  key={opt.color}
                  type="button"
                  onClick={() => onUpdateCmsConfig({ ...cmsConfig, accentColor: opt.color })}
                  className={`w-full p-3 rounded-xl border flex items-center justify-between font-bold cursor-pointer ${
                    cmsConfig.accentColor === opt.color
                      ? 'border-[#052557] bg-blue-50/30 text-[#052557]'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span
                      className="w-5 h-5 rounded-full border border-black/10"
                      style={{ backgroundColor: opt.color }}
                    />
                    {opt.label}
                  </span>
                  {cmsConfig.accentColor === opt.color && (
                    <Check className="w-4 h-4 text-[#052557]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
