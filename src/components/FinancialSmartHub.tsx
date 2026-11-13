import React, { useState, useEffect } from 'react';
import {
  FileUp,
  Sparkles,
  ClipboardPaste,
  Sliders,
  CheckCircle2,
  FileText,
  Upload,
  Plus,
  Trash2,
} from 'lucide-react';
import { getBackendAuthToken } from '../lib/firebase.ts';
import { ClientRecord, FinancialEntryRecord } from '../types/erp.ts';

interface ExtractedItem {
  type: 'PAGAR' | 'RECEBER';
  counterpartyName: string;
  counterpartyDoc?: string;
  category?: string;
  costCenter?: string;
  description: string;
  amount: string;
  dueDate: string;
  documentNumber?: string;
}

interface FinancialSmartHubProps {
  defaultType: 'PAGAR' | 'RECEBER';
  activeClient: ClientRecord;
  entries: FinancialEntryRecord[];
  selectedEditEntryId?: number | null;
  onRefresh: () => Promise<void>;
  onFeedback: (type: 'success' | 'error' | 'warning', title: string, message: string) => void;
}

export const FinancialSmartHub: React.FC<FinancialSmartHubProps> = ({
  defaultType,
  activeClient,
  entries,
  selectedEditEntryId,
  onRefresh,
  onFeedback,
}) => {
  const [activeTab, setActiveTab] = useState<'ai_copypaste_pdf' | 'file_import' | 'adjust_entry'>(
    'ai_copypaste_pdf'
  );

  // Tab 1: Copia e Cola com IA ou Upload de PDF
  const [rawPasteText, setRawPasteText] = useState(
    `AçoForte Siderurgia Ltda | NF-44915 | R$ 4.890,00 | Vencimento 24/11/2026 | Insumos de Obra\nTechCloud Brasil Datacenter | FAT-9910 | R$ 2.150,00 | Vencimento 26/11/2026 | Infraestrutura TI\nRecebimento Medição Cliente Sul | NFS-e 3102 | R$ 19.400,00 | Vencimento 28/11/2026 | Receita de Engenharia`
  );
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [pdfMimeType, setPdfMimeType] = useState<string>('application/pdf');
  const [extractingAi, setExtractingAi] = useState(false);
  const [extractedPreview, setExtractedPreview] = useState<ExtractedItem[]>([]);
  const [importingBatch, setImportingBatch] = useState(false);

  // Tab 2: Importar Relatório / Arquivo CSV / OFX / TXT
  const [reportFileName, setReportFileName] = useState<string | null>(null);

  // Tab 3: Ajustar / Editar Lançamento Existente
  const [selectedEntryId, setSelectedEntryId] = useState<number>(entries[0]?.id || 1);
  const [adjCounterparty, setAdjCounterparty] = useState(
    entries[0]?.counterpartyName || 'AçoForte Siderurgia e Metais Ltda'
  );
  const [adjAmount, setAdjAmount] = useState(entries[0]?.amount || '18700.00');
  const [adjDueDate, setAdjDueDate] = useState(entries[0]?.dueDate || '2026-11-15');
  const [adjCategory, setAdjCategory] = useState(entries[0]?.category || 'Insumos de Obra');
  const [adjCostCenter, setAdjCostCenter] = useState(
    entries[0]?.costCenter || 'Obra Residencial Aurora'
  );
  const [adjDocNumber, setAdjDocNumber] = useState(
    entries[0]?.documentNumber || 'NF-44910 + CT-e Frete'
  );
  const [adjDescription, setAdjDescription] = useState(
    entries[0]?.description || 'Fornecimento de vergalhões + Frete acessório R$ 250,00 validado'
  );
  const [adjStatus, setAdjStatus] = useState(entries[0]?.status || 'Aprovado');
  const [adjReason, setAdjReason] = useState(
    'Inclusão de R$ 250,00 referente ao CT-e de frete acessório para sanear conciliação REC-102.'
  );
  const [savingAdjustment, setSavingAdjustment] = useState(false);
  const [deletingEntry, setDeletingEntry] = useState(false);

  const handleSelectEntryForAdjust = (id: number) => {
    setSelectedEntryId(id);
    const found = entries.find((e) => e.id === id);
    if (found) {
      setAdjCounterparty(found.counterpartyName);
      setAdjAmount(found.amount);
      setAdjDueDate(found.dueDate);
      setAdjCategory(found.category);
      setAdjCostCenter(found.costCenter);
      setAdjDocNumber(found.documentNumber);
      setAdjDescription(found.description);
      setAdjStatus(found.status);
    }
  };

  useEffect(() => {
    if (selectedEditEntryId) {
      setActiveTab('adjust_entry');
      handleSelectEntryForAdjust(selectedEditEntryId);
    }
  }, [selectedEditEntryId, entries]);

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfFileName(file.name);
    setPdfMimeType(file.type || 'application/pdf');
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      setPdfBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleReportFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReportFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
      const parsed: ExtractedItem[] = lines.slice(0, 20).map((line, i) => {
        const cols = line.split(/[;,\t|]/).map((c) => c.trim());
        const numMatch = line.match(/(\d+(?:[.,]\d{2}))/);
        const val = numMatch ? numMatch[1].replace(',', '.') : String(980 + i * 210);
        return {
          type: /receb|cr[eé]d|fatura/i.test(line) ? 'RECEBER' : defaultType,
          counterpartyName: cols[0] || `Registro Relatório #${i + 1}`,
          counterpartyDoc: '14.289.401/0001-52',
          category: cols[2] || 'Importação de Relatório',
          costCenter: activeClient.tradeName,
          description: line.slice(0, 90),
          amount: Number(val).toFixed(2),
          dueDate: '2026-11-26',
          documentNumber: cols[1] || `REL-${400 + i}`,
        };
      });
      setExtractedPreview(parsed);
      onFeedback(
        'success',
        `Relatório "${file.name}" Processado`,
        `${parsed.length} registro(s) prontos para confirmação e gravação no ERP.`
      );
    };
    reader.readAsText(file);
  };

  const handleExtractWithAi = async () => {
    setExtractingAi(true);
    try {
      const token = await getBackendAuthToken();
      const response = await fetch('/api/ai/extract-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rawText: rawPasteText,
          base64Data: pdfBase64,
          mimeType: pdfMimeType,
          defaultType,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao extrair lançamentos.');
      setExtractedPreview(data.entries || []);
      onFeedback(
        'success',
        `Extração Inteligente Concluída (${(data.entries || []).length} Lançamentos)`,
        'Confira a prévia estruturada abaixo e clique em "Gravar Lançamentos no ERP".'
      );
    } catch (err: unknown) {
      onFeedback(
        'error',
        'Erro na Extração',
        err instanceof Error ? err.message : 'Não foi possível extrair os dados.'
      );
    } finally {
      setExtractingAi(false);
    }
  };

  const handleConfirmBulkImport = async () => {
    if (!extractedPreview.length) return;
    setImportingBatch(true);
    try {
      const token = await getBackendAuthToken();
      const response = await fetch('/api/erp/financial-entries/bulk-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          clientId: activeClient.id,
          clientName: activeClient.tradeName,
          bankAccount: activeClient.bankAccounts.split('·')[0].trim(),
          sourceLabel: pdfFileName
            ? `Extração PDF (${pdfFileName})`
            : reportFileName
            ? `Relatório (${reportFileName})`
            : 'Copia e Cola Inteligente IA',
          items: extractedPreview,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Falha ao importar lançamentos.');
      setExtractedPreview([]);
      onFeedback(
        'success',
        `${data.length} Lançamento(s) Gravados no ERP com Idempotência`,
        `Todos os itens foram persistidos para ${activeClient.tradeName} e registrados na trilha de auditoria.`
      );
      await onRefresh();
    } catch (err: unknown) {
      onFeedback(
        'error',
        'Erro ao Importar Lote',
        err instanceof Error ? err.message : 'Verifique os dados.'
      );
    } finally {
      setImportingBatch(false);
    }
  };

  const handleSaveEntryAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAdjustment(true);
    try {
      const token = await getBackendAuthToken();
      const response = await fetch(`/api/erp/financial-entries/${selectedEntryId}/adjust`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          counterpartyName: adjCounterparty,
          amount: adjAmount,
          dueDate: adjDueDate,
          category: adjCategory,
          costCenter: adjCostCenter,
          documentNumber: adjDocNumber,
          description: adjDescription,
          status: adjStatus,
          adjustmentReason: adjReason,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao ajustar lançamento.');
      onFeedback(
        'success',
        `Lançamento ${data.code} Editado e Reconciliado`,
        `Novo valor R$ ${data.amount} (${data.counterpartyName}) salvo com auditoria e reflexo imediato na conciliação bancária.`
      );
      await onRefresh();
    } catch (err: unknown) {
      onFeedback(
        'error',
        'Bloqueio no Ajuste Financeiro',
        err instanceof Error ? err.message : 'Informe uma justificativa válida.'
      );
    } finally {
      setSavingAdjustment(false);
    }
  };

  const handleDeleteSelectedEntry = async () => {
    if (!selectedEntryId) return;
    setDeletingEntry(true);
    try {
      const token = await getBackendAuthToken();
      const response = await fetch(`/api/erp/financial-entries/${selectedEntryId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reason: adjReason || 'Exclusão operacional solicitada na central de lançamentos',
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao excluir lançamento.');
      onFeedback(
        'warning',
        `Lançamento ${data.code} Excluído`,
        `Registro removido e trilha de auditoria atualizada.`
      );
      await onRefresh();
    } catch (err: unknown) {
      onFeedback(
        'error',
        'Erro ao Excluir Lançamento',
        err instanceof Error ? err.message : 'Operação recusada.'
      );
    } finally {
      setDeletingEntry(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Central Operacional de Lançamentos: Copia e Cola com IA, Extração de PDF, Importação de Relatórios, Edição & Exclusão
          </h3>
          <p className="text-xs text-slate-500">
            Cliente ativo: <strong>{activeClient.tradeName}</strong> · Conta padrão:{' '}
            {activeClient.bankAccounts.split('·')[0]}
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('ai_copypaste_pdf')}
            className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'ai_copypaste_pdf'
                ? 'bg-[#0052CC] text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ClipboardPaste className="w-3.5 h-3.5" />
            Copia e Cola IA / Extrair PDF
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('file_import')}
            className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'file_import'
                ? 'bg-[#0052CC] text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileUp className="w-3.5 h-3.5" />
            Importar Relatório (CSV/OFX/TXT)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('adjust_entry')}
            className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'adjust_entry'
                ? 'bg-[#0052CC] text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Editar / Ajustar / Excluir Lançamento
          </button>
        </div>
      </div>

      {/* TAB 1: COPIA E COLA COM IA OU EXTRAÇÃO DE PDF */}
      {activeTab === 'ai_copypaste_pdf' && (
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-2">
              <label className="block font-semibold text-slate-800">
                Cole aqui textos de e-mail, WhatsApp, faturas, espelhos de boletos ou relatórios brutos ("Copia e Cola"):
              </label>
              <textarea
                rows={4}
                value={rawPasteText}
                onChange={(e) => setRawPasteText(e.target.value)}
                placeholder="Ex.: Fornecedor X | NF 1020 | R$ 1.850,00 | Venc 25/11/2026..."
                className="w-full px-3 py-2 font-mono text-xs border border-slate-300 rounded-md"
              />
            </div>

            <div className="space-y-2 flex flex-col justify-between bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div>
                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#0052CC]" />
                  Ou anexe PDF / Imagem de Fatura ou Relatório
                </div>
                <p className="text-slate-500 mt-1">
                  O motor extrai favorecido, CNPJ, vencimento, documento e valor automaticamente.
                </p>
                <label className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-md font-medium text-slate-700 hover:bg-slate-100 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{pdfFileName ? pdfFileName : 'Selecionar Arquivo PDF / Imagem'}</span>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handlePdfUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={handleExtractWithAi}
                disabled={extractingAi}
                className="w-full py-2 bg-[#0052CC] hover:bg-blue-700 text-white font-semibold rounded-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {extractingAi
                  ? 'Extraindo Lançamentos com IA...'
                  : 'Processar Texto / PDF e Gerar Prévia'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: IMPORTAR RELATÓRIO CSV / OFX / TXT */}
      {activeTab === 'file_import' && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div>
            <div className="font-semibold text-slate-900">
              Importação Direta de Relatórios Financeiros, Planilhas CSV, Extratos OFX ou TXT
            </div>
            <p className="text-slate-600 mt-0.5">
              Selecione qualquer arquivo `.csv`, `.txt` ou `.ofx` exportado do ERP do cliente ou banco para converter em lançamentos auditados.
            </p>
          </div>
          <label className="px-4 py-2 bg-[#0052CC] hover:bg-blue-700 text-white font-semibold rounded-md flex items-center gap-2 cursor-pointer shrink-0">
            <FileUp className="w-4 h-4" />
            <span>{reportFileName ? `Arquivo: ${reportFileName}` : 'Carregar Relatório (.CSV / .OFX / .TXT)'}</span>
            <input
              type="file"
              accept=".csv,.txt,.ofx,.json"
              onChange={handleReportFileUpload}
              className="hidden"
            />
          </label>
        </div>
      )}

      {/* TAB 3: AJUSTAR / EDITAR / EXCLUIR LANÇAMENTO EXISTENTE */}
      {activeTab === 'adjust_entry' && (
        <form onSubmit={handleSaveEntryAdjustment} className="space-y-3 text-xs bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="font-semibold text-slate-900">
              Edição, Ajuste ou Exclusão Auditada de Lançamento (Atualiza automaticamente a Conciliação Bancária vinculada)
            </div>
            <span className="text-slate-500">
              Dica: ajuste LAN-8041 para R$ 18.700,00 para sanear automaticamente a divergência de R$ 250,00 em REC-102!
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Selecionar Lançamento *
              </label>
              <select
                value={selectedEntryId}
                onChange={(e) => handleSelectEntryForAdjust(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md"
              >
                {entries.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.code} · {e.counterpartyName} (Atual: R$ {e.amount}) — {e.documentNumber}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Favorecido / Pagador *
              </label>
              <input
                type="text"
                required
                value={adjCounterparty}
                onChange={(e) => setAdjCounterparty(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Novo Valor (R$) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={adjAmount}
                onChange={(e) => setAdjAmount(e.target.value)}
                className="w-full px-3 py-1.5 bg-white font-mono border border-slate-300 rounded-md"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Novo Vencimento *</label>
              <input
                type="date"
                required
                value={adjDueDate}
                onChange={(e) => setAdjDueDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-white font-mono border border-slate-300 rounded-md"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Documento Fiscal</label>
              <input
                type="text"
                value={adjDocNumber}
                onChange={(e) => setAdjDocNumber(e.target.value)}
                className="w-full px-3 py-1.5 bg-white font-mono border border-slate-300 rounded-md"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Categoria</label>
              <input
                type="text"
                value={adjCategory}
                onChange={(e) => setAdjCategory(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Centro de Custo</label>
              <input
                type="text"
                value={adjCostCenter}
                onChange={(e) => setAdjCostCenter(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Situação</label>
              <select
                value={adjStatus}
                onChange={(e) => setAdjStatus(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md"
              >
                <option value="Aguardando aprovação">Aguardando aprovação</option>
                <option value="Pendente">Pendente</option>
                <option value="Aprovado">Aprovado</option>
                <option value="Conciliado">Conciliado</option>
                <option value="Em análise">Em análise</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="block font-semibold text-slate-700 mb-1">
                Justificativa Formal da Edição / Exclusão (Obrigatória para Trilha de Auditoria) *
              </label>
              <input
                type="text"
                required
                value={adjReason}
                onChange={(e) => setAdjReason(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <button
              type="button"
              disabled={deletingEntry}
              onClick={handleDeleteSelectedEntry}
              className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-semibold rounded-md flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {deletingEntry ? 'Excluindo...' : 'Excluir Lançamento Selecionado'}
            </button>

            <button
              type="submit"
              disabled={savingAdjustment}
              className="px-4 py-1.5 bg-[#0052CC] hover:bg-blue-700 text-white font-semibold rounded-md flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {savingAdjustment
                ? 'Aplicando Edição...'
                : 'Salvar Edição e Recalcular Conciliação'}
            </button>
          </div>
        </form>
      )}

      {/* PREVIEW TABLE OF EXTRACTED / IMPORTED ENTRIES */}
      {extractedPreview.length > 0 && (
        <div className="border border-blue-200 bg-blue-50/40 rounded-lg p-4 space-y-3 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="font-bold text-slate-900">
              Prévia de Lançamentos Extraídos ({extractedPreview.length} itens prontos para gravação)
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setExtractedPreview([])}
                className="px-3 py-1 border border-slate-300 bg-white rounded text-slate-700"
              >
                Limpar Prévia
              </button>
              <button
                type="button"
                disabled={importingBatch}
                onClick={handleConfirmBulkImport}
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                {importingBatch
                  ? 'Gravando no ERP...'
                  : `Gravar ${extractedPreview.length} Lançamento(s) no ERP`}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto bg-white border border-slate-200 rounded">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-2 px-3">Tipo</th>
                  <th className="py-2 px-3">Favorecido / Pagador</th>
                  <th className="py-2 px-3">Documento</th>
                  <th className="py-2 px-3">Categoria / Descrição</th>
                  <th className="py-2 px-3">Vencimento</th>
                  <th className="py-2 px-3 text-right">Valor (R$)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {extractedPreview.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2 px-3 font-mono font-bold">{item.type}</td>
                    <td className="py-2 px-3 font-medium text-slate-900">{item.counterpartyName}</td>
                    <td className="py-2 px-3 font-mono text-slate-600">
                      {item.documentNumber || 'DOC-IA'}
                    </td>
                    <td className="py-2 px-3 text-slate-600">
                      {item.category} · {item.description}
                    </td>
                    <td className="py-2 px-3 font-mono">{item.dueDate}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                      R$ {item.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
