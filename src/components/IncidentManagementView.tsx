import React, { useState } from 'react';
import {
  AlertOctagon,
  GitBranch,
  BookOpen,
  CheckCircle2,
  PlusCircle,
  Edit3,
  ShieldAlert,
} from 'lucide-react';
import { getBackendAuthToken } from '../lib/firebase.ts';
import {
  TechnicalIncidentRecord,
  TechnicalChangeRecord,
  KnowledgeArticleRecord,
} from '../types/erp.ts';

interface IncidentManagementViewProps {
  technicalIncidents: TechnicalIncidentRecord[];
  technicalChanges: TechnicalChangeRecord[];
  knowledgeArticles: KnowledgeArticleRecord[];
  onRefresh: () => Promise<void>;
  onFeedback: (type: 'success' | 'error' | 'warning', title: string, message: string) => void;
}

export const IncidentManagementView: React.FC<IncidentManagementViewProps> = ({
  technicalIncidents,
  technicalChanges,
  knowledgeArticles,
  onRefresh,
  onFeedback,
}) => {
  const [selectedIncidentId, setSelectedIncidentId] = useState<number | null>(
    technicalIncidents[0]?.id || null
  );
  const [affectedService, setAffectedService] = useState(
    'Motor de Consistência de Conciliação & Fechamento DRE'
  );
  const [moduleName, setModuleName] = useState('Conciliação');
  const [severity, setSeverity] = useState('S2 - Alta');
  const [impactedClientsCount, setImpactedClientsCount] = useState(1);
  const [affectedOperations, setAffectedOperations] = useState(
    'Bloqueio preventivo de encerramento da conciliação REC-102 e competência 11/2026'
  );
  const [technicalError, setTechnicalError] = useState(
    'RECON_DIFF_250_UNJUSTIFIED: Statement (18700.00) != Ledger (18450.00)'
  );
  const [rootCauseSymptom, setRootCauseSymptom] = useState(
    'Divergência nominal de R$ 250,00 entre o valor liquidado no extrato bancário e o lançamento da Nota Fiscal.'
  );
  const [why1, setWhy1] = useState(
    'Por que a conciliação travou? Porque o extrato registrou R$ 18.700,00 e a NF-44910 estava lançada por R$ 18.450,00.'
  );
  const [why2, setWhy2] = useState(
    'Por que o boleto bancário tinha R$ 250,00 a mais? Porque o fornecedor emitiu o boleto somando frete acessório de descarga.'
  );
  const [why3, setWhy3] = useState(
    'Por que o frete não estava lançado no Contas a Pagar? Porque o CT-e complementar foi enviado pelo fornecedor 24h após a NF de mercadoria.'
  );
  const [why4, setWhy4] = useState(
    'Por que a diferença não foi detectada antes do pagamento? Porque a conferência confrontou apenas o cabeçalho da NF sem validar a linha digitável do boleto.'
  );
  const [why5, setWhy5] = useState(
    'Por que o processo permitiu isso (Causa Raiz)? Ausência de trava de conferência cruzada obrigatória entre valor nominal do boleto e soma de NF + CT-e no protocolo.'
  );
  const [rootCauseTechnical, setRootCauseTechnical] = useState(
    'Desmembramento pendente de despesa acessória (frete CT-e) vinculada ao lançamento principal LAN-8041.'
  );
  const [rootCauseOperational, setRootCauseOperational] = useState(
    'Protocolo de boleto realizado antes da recepção do documento auxiliar de transporte.'
  );
  const [containmentMeasure, setContainmentMeasure] = useState(
    'Bloqueio automático da conciliação REC-102 e retenção do fechamento mensal até anexação do CT-e.'
  );
  const [definitiveFix, setDefinitiveFix] = useState(
    'Ajuste documentado no lançamento LAN-8041 com vínculo ao CT-e complementar e reexecução da conciliação.'
  );
  const [preventionPlan, setPreventionPlan] = useState(
    'Ativação de validação cruzada via OCR IA (Boleto vs NF) no momento da importação em Contas a Pagar.'
  );
  const [publishToKb, setPublishToKb] = useState(true);
  const [savingRca, setSavingRca] = useState(false);

  const handleLoadIncidentToForm = (inc: TechnicalIncidentRecord) => {
    setSelectedIncidentId(inc.id);
    setAffectedService(inc.affectedService);
    setModuleName(inc.moduleName);
    setSeverity(inc.severity);
    setImpactedClientsCount(inc.impactedClientsCount);
    setAffectedOperations(inc.affectedOperations);
    setTechnicalError(inc.technicalError);
    setRootCauseSymptom(inc.rootCauseSymptom);
    setRootCauseTechnical(inc.rootCauseTechnical);
    setRootCauseOperational(inc.rootCauseOperational);
    setContainmentMeasure(inc.containmentMeasure);
    setDefinitiveFix(inc.definitiveFix);
    setPreventionPlan(inc.preventionPlan);

    const lines = (inc.fiveWhysAnalysis || '').split('\n');
    setWhy1(lines[0] || '');
    setWhy2(lines[1] || '');
    setWhy3(lines[2] || '');
    setWhy4(lines[3] || '');
    setWhy5(lines[4] || '');
  };

  const handleStartNewRca = () => {
    setSelectedIncidentId(null);
    setAffectedService('');
    setModuleName('Financeiro');
    setSeverity('S2 - Alta');
    setImpactedClientsCount(1);
    setAffectedOperations('');
    setTechnicalError('');
    setRootCauseSymptom('');
    setWhy1('');
    setWhy2('');
    setWhy3('');
    setWhy4('');
    setWhy5('');
    setRootCauseTechnical('');
    setRootCauseOperational('');
    setContainmentMeasure('');
    setDefinitiveFix('');
    setPreventionPlan('');
  };

  const handleSubmitRca = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingRca(true);
    try {
      const token = await getBackendAuthToken();
      const response = await fetch('/api/erp/incidents/rca', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          incidentId: selectedIncidentId,
          affectedService,
          moduleName,
          severity,
          impactedClientsCount,
          affectedOperations,
          technicalError,
          rootCauseSymptom,
          why1,
          why2,
          why3,
          why4,
          why5,
          rootCauseTechnical,
          rootCauseOperational,
          containmentMeasure,
          definitiveFix,
          preventionPlan,
          publishToKnowledgeBase: publishToKb,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao salvar RCA 5 Porquês.');
      onFeedback(
        'success',
        `Análise de Causa Raiz (5 Porquês — Seção 5.3) Salva em ${data.code}`,
        publishToKb
          ? 'RCA registrada com sucesso e artigo preventivo publicado na Base de Conhecimento.'
          : 'RCA atualizada e auditada com sucesso.'
      );
      await onRefresh();
    } catch (err: unknown) {
      onFeedback(
        'error',
        'Erro ao Salvar RCA',
        err instanceof Error ? err.message : 'Verifique os campos obrigatórios.'
      );
    } finally {
      setSavingRca(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Structured 5 Whys Root Cause Analysis Builder (Section 5.3) */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-[#FF6B00]" />
              Formulário Estruturado de Análise de Causa Raiz (Método dos 5 Porquês — Seção 5.3)
            </h2>
            <p className="text-xs text-slate-500">
              Integra sintoma observado, impacto operacional, cadeia dos 5 Porquês, causa raiz técnica/operacional e plano de prevenção
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleStartNewRca}
              className="px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-md hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#0052CC]" />
              Novo Incidente / Nova RCA
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmitRca} className="space-y-4 text-xs">
          {/* Bloco 1: Contexto, Sintoma e Impacto */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-800 mb-1">
                Serviço / Fluxo Crítico Afetado *
              </label>
              <input
                type="text"
                required
                value={affectedService}
                onChange={(e) => setAffectedService(e.target.value)}
                placeholder="Ex.: Motor de Conciliação Bancária & Fechamento DRE"
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">Módulo de Origem *</label>
              <select
                value={moduleName}
                onChange={(e) => setModuleName(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md"
              >
                <option value="Conciliação">Conciliação</option>
                <option value="Contas a pagar">Contas a pagar</option>
                <option value="Pagamentos e aprovações">Pagamentos e aprovações</option>
                <option value="Fechamento financeiro">Fechamento financeiro</option>
                <option value="Integrações">Integrações</option>
                <option value="Segurança e acesso">Segurança e acesso</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Severidade & Clientes Impactados
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-md"
                >
                  <option value="S1 - Crítica">S1 - Crítica</option>
                  <option value="S2 - Alta">S2 - Alta</option>
                  <option value="S3 - Média">S3 - Média</option>
                  <option value="S4 - Baixa">S4 - Baixa</option>
                </select>
                <input
                  type="number"
                  min={0}
                  max={500}
                  value={impactedClientsCount}
                  onChange={(e) => setImpactedClientsCount(Number(e.target.value))}
                  className="w-16 px-2 py-1.5 bg-white font-mono border border-slate-300 rounded-md"
                  title="Quantidade de clientes impactados"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-800 mb-1">
                Sintoma Observado (O que aconteceu?) *
              </label>
              <input
                type="text"
                required
                value={rootCauseSymptom}
                onChange={(e) => setRootCauseSymptom(e.target.value)}
                placeholder="Descreva o sintoma visível na operação..."
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Impacto Operacional e Financeiro *
              </label>
              <input
                type="text"
                required
                value={affectedOperations}
                onChange={(e) => setAffectedOperations(e.target.value)}
                placeholder="Quais entregas ou rotinas foram impactadas?"
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Código Técnico do Erro / Alerta
              </label>
              <input
                type="text"
                value={technicalError}
                onChange={(e) => setTechnicalError(e.target.value)}
                placeholder="Ex.: RECON_DIFF_250"
                className="w-full px-3 py-1.5 bg-white font-mono border border-slate-300 rounded-md"
              />
            </div>
          </div>

          {/* Bloco 2: Cadeia Estruturada dos 5 Porquês */}
          <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-2.5">
            <div className="font-bold text-slate-900">
              Investigação Sequencial — Método dos 5 Porquês (Seção 5.3)
            </div>
            <div className="grid grid-cols-1 gap-2.5">
              {[
                { label: '1º Por quê? (Gatilho Imediato)', val: why1, setter: setWhy1 },
                { label: '2º Por quê? (Origem da Divergência)', val: why2, setter: setWhy2 },
                { label: '3º Por quê? (Falha no Fluxo / Entrada)', val: why3, setter: setWhy3 },
                { label: '4º Por quê? (Lacuna de Validação)', val: why4, setter: setWhy4 },
                {
                  label: '5º Por quê? (Causa Raiz Sistêmica / Processo)',
                  val: why5,
                  setter: setWhy5,
                },
              ].map((step, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="w-64 shrink-0 font-semibold text-slate-700">
                    {step.label}:
                  </span>
                  <input
                    type="text"
                    required
                    value={step.val}
                    onChange={(e) => step.setter(e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded-md"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Bloco 3: Causas Classificadas, Contenção, Correção e Prevenção */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Causa Raiz Técnica Consolidada *
              </label>
              <textarea
                rows={2}
                required
                value={rootCauseTechnical}
                onChange={(e) => setRootCauseTechnical(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Causa Raiz Operacional Consolidada *
              </label>
              <textarea
                rows={2}
                required
                value={rootCauseOperational}
                onChange={(e) => setRootCauseOperational(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Medida de Contenção Imediata *
              </label>
              <textarea
                rows={2}
                required
                value={containmentMeasure}
                onChange={(e) => setContainmentMeasure(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md"
              />
            </div>
            <div className="md:col-span-1">
              <label className="block font-semibold text-slate-800 mb-1">
                Correção Definitiva Aplicada *
              </label>
              <textarea
                rows={2}
                required
                value={definitiveFix}
                onChange={(e) => setDefinitiveFix(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-800 mb-1">
                Medidas Preventivas e Plano de Não Recorrência (Seção 5.3) *
              </label>
              <textarea
                rows={2}
                required
                value={preventionPlan}
                onChange={(e) => setPreventionPlan(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200">
            <label className="flex items-center gap-2 text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={publishToKb}
                onChange={(e) => setPublishToKb(e.target.checked)}
              />
              <span>
                Gerar/atualizar automaticamente artigo preventivo na Base de Conhecimento (Seção 4.10)
              </span>
            </label>

            <button
              type="submit"
              disabled={savingRca}
              className="px-4 py-2 bg-[#0052CC] hover:bg-blue-700 text-white font-semibold rounded-md flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              {savingRca
                ? 'Salvando RCA 5 Porquês...'
                : selectedIncidentId
                ? 'Atualizar RCA 5 Porquês do Incidente Selecionado'
                : 'Registrar Novo Incidente com RCA 5 Porquês'}
            </button>
          </div>
        </form>
      </div>

      {/* Lista de Incidentes Técnicos Registrados */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">
          Histórico de Incidentes Técnicos & Análises de Causa Raiz ({technicalIncidents.length})
        </h3>
        <div className="space-y-3">
          {technicalIncidents.map((inc) => (
            <div
              key={inc.id}
              className={`p-4 rounded-lg border text-xs space-y-2.5 ${
                selectedIncidentId === inc.id
                  ? 'bg-blue-50/40 border-[#0052CC]'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-700" />
                  <span className="font-mono font-bold text-red-700">{inc.code}</span> ·{' '}
                  <strong className="text-slate-900">{inc.affectedService}</strong> ({inc.severity})
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-600">
                    Clientes impactados: {inc.impactedClientsCount} · Status:{' '}
                    <strong className="text-emerald-700">{inc.status}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleLoadIncidentToForm(inc)}
                    className="px-2.5 py-1 bg-white border border-slate-300 rounded hover:bg-slate-100 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    Carregar nos 5 Porquês
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-2.5 bg-white border border-slate-200 rounded">
                  <div className="font-semibold text-slate-800">Sintoma & Impacto</div>
                  <p className="text-slate-600 mt-0.5">{inc.rootCauseSymptom}</p>
                  <p className="text-slate-500 mt-1">
                    <strong>Impacto:</strong> {inc.affectedOperations}
                  </p>
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded">
                  <div className="font-semibold text-slate-800">Cadeia dos 5 Porquês</div>
                  <p className="text-slate-600 mt-0.5 whitespace-pre-line">{inc.fiveWhysAnalysis}</p>
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded">
                  <div className="font-semibold text-slate-800">Correção & Plano Preventivo</div>
                  <p className="text-slate-600 mt-0.5">
                    <strong>Correção:</strong> {inc.definitiveFix}
                  </p>
                  <p className="text-emerald-800 mt-1">
                    <strong>Prevenção:</strong> {inc.preventionPlan}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* GMUD & Base de Conhecimento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
            <GitBranch className="w-4 h-4 text-[#0052CC]" />
            Gestão de Mudanças Técnicas — GMUD com Plano de Rollback (Seção 5.5)
          </h3>
          {technicalChanges.map((chg) => (
            <div
              key={chg.id}
              className="p-3.5 bg-slate-50 border border-slate-200 rounded-md text-xs space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-[#0052CC]">
                  {chg.code} · {chg.targetVersion}
                </span>
                <span className="font-semibold text-emerald-700">{chg.status}</span>
              </div>
              <div className="font-semibold text-slate-900">{chg.title}</div>
              <div className="text-slate-600">
                <strong>Plano de Testes:</strong> {chg.testPlan}
              </div>
              <div className="text-slate-600">
                <strong>Plano de Reversão (Rollback):</strong> {chg.rollbackPlan}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-[#0052CC]" />
            Base de Conhecimento de Incidentes e Soluções ({knowledgeArticles.length} artigos)
          </h3>
          {knowledgeArticles.map((kb) => (
            <div
              key={kb.id}
              className="p-3.5 bg-slate-50 border border-slate-200 rounded-md text-xs space-y-1.5"
            >
              <div className="font-mono text-[11px] text-slate-500">
                {kb.code} · Origem: {kb.ticketProtocol} · Módulo: {kb.affectedModule}
              </div>
              <div className="font-semibold text-slate-900">{kb.title}</div>
              <div className="text-slate-600">
                <strong>Causa Raiz:</strong> {kb.rootCause}
              </div>
              <div className="text-slate-600">
                <strong>Como Corrigir:</strong> {kb.howToFix}
              </div>
              <div className="text-emerald-800">
                <strong>Como Prevenir:</strong> {kb.howToPrevent}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
