import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Link2,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import { getBackendAuthToken } from '../lib/firebase.ts';
import { ClientRecord, ServiceCatalogItem } from '../types/erp.ts';

interface ServiceCatalogManagerProps {
  clients: ClientRecord[];
  serviceCatalog: ServiceCatalogItem[];
  onRefresh: () => Promise<void>;
  onFeedback: (type: 'success' | 'error' | 'warning', title: string, message: string) => void;
}

export const ServiceCatalogManager: React.FC<ServiceCatalogManagerProps> = ({
  clients,
  serviceCatalog,
  onRefresh,
  onFeedback,
}) => {
  const [selectedClientId, setSelectedClientId] = useState<number>(clients[0]?.id || 1);
  const [selectedServiceId, setSelectedServiceId] = useState<number>(serviceCatalog[0]?.id || 1);
  const [customParameters, setCustomParameters] = useState(
    'Alçada dupla acima de R$ 15.000,00 · Envio de prévia de lote até 14h00 · Validação de retenções 4,65% PCC'
  );
  const [dueDate, setDueDate] = useState('2026-11-18');
  const [assigning, setAssigning] = useState(false);

  // New Service Catalog Form
  const [newSrvName, setNewSrvName] = useState('');
  const [newSrvCategory, setNewSrvCategory] = useState('Controladoria & Conciliação');
  const [newSrvRecurrence, setNewSrvRecurrence] = useState<
    'Diária' | 'Semanal' | 'Quinzenal' | 'Mensal'
  >('Mensal');
  const [newSrvFee, setNewSrvFee] = useState('1900.00');
  const [newSrvSla, setNewSrvSla] = useState('Até o 3º dia útil');
  const [newSrvChecklist, setNewSrvChecklist] = useState(
    '1. Coletar documentos · 2. Conferir impostos e centros de custo · 3. Emitir relatório validado'
  );
  const [newSrvDocs, setNewSrvDocs] = useState('Extratos bancários, Notas Fiscais e Comprovantes');
  const [newSrvRules, setNewSrvRules] = useState(
    'Proibida entrega sem dupla revisão da supervisão financeira.'
  );
  const [creatingService, setCreatingService] = useState(false);

  const handleAssignServiceToClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setAssigning(true);
    try {
      const token = await getBackendAuthToken();
      const response = await fetch(`/api/erp/clients/${selectedClientId}/assign-service`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceId: selectedServiceId,
          customParameters,
          dueDate,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao atrelar serviço.');
      onFeedback(
        'success',
        `Serviço ${data.service.code} Atrelado a ${data.client.tradeName}`,
        `Escopo contratual atualizado e Demanda Operacional ${data.demand.code} gerada automaticamente na fila da equipe!`
      );
      await onRefresh();
    } catch (err: unknown) {
      onFeedback(
        'error',
        'Erro ao Atrelar Serviço',
        err instanceof Error ? err.message : 'Verifique os dados.'
      );
    } finally {
      setAssigning(false);
    }
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingService(true);
    try {
      const token = await getBackendAuthToken();
      const response = await fetch('/api/erp/service-catalog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newSrvName,
          category: newSrvCategory,
          defaultRecurrence: newSrvRecurrence,
          defaultFee: newSrvFee,
          slaHours: newSrvSla,
          checklistTemplate: newSrvChecklist,
          requiredDocuments: newSrvDocs,
          parameterRules: newSrvRules,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao criar serviço.');
      setNewSrvName('');
      onFeedback(
        'success',
        `Novo Serviço Parametrizado Cadastrado (${data.code})`,
        `${data.name} adicionado ao Catálogo BPO e disponível para vinculação imediata.`
      );
      await onRefresh();
    } catch (err: unknown) {
      onFeedback(
        'error',
        'Erro no Cadastro de Serviço',
        err instanceof Error ? err.message : 'Verifique os campos.'
      );
    } finally {
      setCreatingService(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Atrelar Serviço & Parâmetros ao Cliente -> Gera Demanda + Atualiza Contrato */}
        <form
          onSubmit={handleAssignServiceToClient}
          className="bg-white border border-slate-200 rounded-lg p-5 space-y-3.5 text-xs"
        >
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5">
            <Link2 className="w-4 h-4 text-[#0052CC]" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Atrelar Serviço Acordado & Gerar Demanda para o Cliente
              </h3>
              <p className="text-slate-500">
                Vincula parâmetros operacionais ao contrato e cria a rotina na fila de Demandas
              </p>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              1. Selecionar Empresa Cliente *
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(Number(e.target.value))}
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} · {c.tradeName} ({c.taxRegime})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              2. Selecionar Serviço do Catálogo BPO *
            </label>
            <select
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(Number(e.target.value))}
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md"
            >
              {serviceCatalog.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} · {s.name} ({s.defaultRecurrence})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              3. Parâmetros Específicos Acordados com o Cliente *
            </label>
            <textarea
              rows={3}
              required
              value={customParameters}
              onChange={(e) => setCustomParameters(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-md"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Prazo da Próxima Entrega / Execução
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-1.5 font-mono border border-slate-300 rounded-md"
            />
          </div>

          <button
            type="submit"
            disabled={assigning}
            className="w-full py-2 bg-[#0052CC] hover:bg-blue-700 text-white font-semibold rounded-md flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            {assigning
              ? 'Vinculando Serviço e Gerando Demanda...'
              : 'Atrelar ao Cliente + Gerar Demanda Operacional'}
          </button>
        </form>

        {/* Card 2: Catálogo de Serviços & Parâmetros Cadastrados */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#0052CC]" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Catálogo de Serviços BPO & Parâmetros de Entrega ({serviceCatalog.length} serviços)
                </h3>
                <p className="text-xs text-slate-500">
                  Cada serviço define recorrência, SLA, documentos obrigatórios, checklist e regras de bloqueio
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {serviceCatalog.map((srv) => (
              <div
                key={srv.id}
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#0052CC]">
                    {srv.code} · {srv.defaultRecurrence}
                  </span>
                  <span className="font-mono font-semibold text-slate-900">
                    R$ {srv.defaultFee}/mês
                  </span>
                </div>
                <div className="font-bold text-slate-900">{srv.name}</div>
                <div className="text-slate-600">
                  <strong>SLA Acordado:</strong> {srv.slaHours}
                </div>
                <div className="text-slate-600">
                  <strong>Checklist:</strong> {srv.checklistTemplate}
                </div>
                <div className="text-slate-600">
                  <strong>Documentos Exigidos:</strong> {srv.requiredDocuments}
                </div>
                <div className="text-amber-900 bg-amber-50/80 border border-amber-200 p-1.5 rounded">
                  <strong>Regra Parametrizada:</strong> {srv.parameterRules}
                </div>
              </div>
            ))}
          </div>

          {/* Mini-Form to Add New Service to Catalog */}
          <form
            onSubmit={handleCreateService}
            className="pt-3 border-t border-slate-200 space-y-3 text-xs"
          >
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#FF6B00]" />
              Cadastrar Novo Serviço e Parâmetros no Catálogo
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  required
                  value={newSrvName}
                  onChange={(e) => setNewSrvName(e.target.value)}
                  placeholder="Nome do Serviço (ex.: Auditoria de Folha & Encargos BPO)"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <select
                  value={newSrvRecurrence}
                  onChange={(e) =>
                    setNewSrvRecurrence(
                      e.target.value as 'Diária' | 'Semanal' | 'Quinzenal' | 'Mensal'
                    )
                  }
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md"
                >
                  <option value="Diária">Recorrência: Diária</option>
                  <option value="Semanal">Recorrência: Semanal</option>
                  <option value="Quinzenal">Recorrência: Quinzenal</option>
                  <option value="Mensal">Recorrência: Mensal</option>
                </select>
              </div>
              <div>
                <input
                  type="text"
                  value={newSrvSla}
                  onChange={(e) => setNewSrvSla(e.target.value)}
                  placeholder="SLA (ex.: Até 5º dia útil)"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md"
                />
              </div>
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={newSrvChecklist}
                  onChange={(e) => setNewSrvChecklist(e.target.value)}
                  placeholder="Checklist padrão..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md"
                />
              </div>
              <div className="sm:col-span-2 flex items-center gap-2">
                <input
                  type="text"
                  value={newSrvRules}
                  onChange={(e) => setNewSrvRules(e.target.value)}
                  placeholder="Parâmetros e travas de governança..."
                  className="flex-1 px-3 py-1.5 border border-slate-300 rounded-md"
                />
                <button
                  type="submit"
                  disabled={creatingService}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-md flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Adicionar
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
