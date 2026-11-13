import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Calendar,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Download,
  SlidersHorizontal,
  Building2,
  Sparkles,
  RefreshCw,
  Landmark,
  Edit3,
  Trash2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  ClientRecord,
  FinancialEntryRecord,
  BankReconciliationRecord,
  ClientBankAndCashAccount,
  DEFAULT_CLIENT_BANK_ACCOUNTS,
} from '../types/erp.ts';

interface ClientCashFlowModuleProps {
  clients: ClientRecord[];
  selectedClientId: number | 'ALL';
  onSelectClientId?: (id: number | 'ALL') => void;
  financialEntries: FinancialEntryRecord[];
  reconciliations: BankReconciliationRecord[];
  onCreateEntry?: (entryData: {
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
  onLiquidateEntry?: (
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
  onFeedback?: (type: 'success' | 'error' | 'warning', title: string, message: string) => void;
  isClientPortalView?: boolean;
}

function formatBrl(val: string | number | undefined | null): string {
  const num = Number(val || 0);
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDateBr(isoDate: string): string {
  if (!isoDate) return '-';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function isRealizedStatus(status: string, reconciled?: boolean): boolean {
  if (reconciled) return true;
  const s = (status || '').toLowerCase();
  return (
    s.includes('pago') ||
    s.includes('recebido') ||
    s.includes('liquidado') ||
    s.includes('conciliado') ||
    s.includes('baixado')
  );
}

export const ClientCashFlowModule: React.FC<ClientCashFlowModuleProps> = ({
  clients,
  selectedClientId,
  onSelectClientId,
  financialEntries,
  reconciliations,
  onCreateEntry,
  onLiquidateEntry,
  onFeedback,
  isClientPortalView = false,
}) => {
  const [viewMode, setViewMode] = useState<
    'DIARIO' | 'MENSAL' | 'PROJECAO' | 'CONTAS_SALDO_INICIAL'
  >('DIARIO');
  const [filterStatusMode, setFilterStatusMode] = useState<'AMBOS' | 'REALIZADO' | 'PREVISTO'>(
    'AMBOS'
  );
  const [selectedAccountId, setSelectedAccountId] = useState<string>('ALL_ACCOUNTS');

  const [projectionHorizonDays, setProjectionHorizonDays] = useState<15 | 30 | 60 | 90>(30);
  const [simulatedDefaultPct, setSimulatedDefaultPct] = useState<number>(0);
  const [simulatedExtraExpense, setSimulatedExtraExpense] = useState<number>(0);
  const [simulatedExtraRevenue, setSimulatedExtraRevenue] = useState<number>(0);

  // Bank & Cash Accounts with Initial Balance + Start Date ("A partir de")
  const [bankAccounts, setBankAccounts] = useState<ClientBankAndCashAccount[]>(() => {
    try {
      const saved = localStorage.getItem('vn_client_bank_cash_accounts_v2');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_CLIENT_BANK_ACCOUNTS;
  });

  const saveBankAccounts = (next: ClientBankAndCashAccount[]) => {
    setBankAccounts(next);
    try {
      localStorage.setItem('vn_client_bank_cash_accounts_v2', JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  // New / Edit Bank or Cash Account Form State
  const [editingAccId, setEditingAccId] = useState<string | null>(null);
  const [accClientId, setAccClientId] = useState<number>(
    selectedClientId === 'ALL' ? clients[0]?.id || 1 : selectedClientId
  );
  const [accName, setAccName] = useState('');
  const [accType, setAccType] = useState<ClientBankAndCashAccount['accountType']>('CONTA_CORRENTE');
  const [accBankInst, setAccBankInst] = useState('341 · Itaú Unibanco');
  const [accAgencyNumber, setAccAgencyNumber] = useState('Ag 0001 · CC 12345-6');
  const [accInitialBalance, setAccInitialBalance] = useState('25000.00');
  const [accInitialDate, setAccInitialDate] = useState('2026-11-01');

  // Quick Entry Form State
  const [showQuickModal, setShowQuickModal] = useState(false);
  const [quickType, setQuickType] = useState<'RECEBER' | 'PAGAR'>('RECEBER');
  const [quickCounterparty, setQuickCounterparty] = useState('');
  const [quickDescription, setQuickDescription] = useState('');
  const [quickCategory, setQuickCategory] = useState('Receita de Serviços / Vendas');
  const [quickCostCenter, setQuickCostCenter] = useState('Operações & Caixa Geral');
  const [quickAmount, setQuickAmount] = useState('');
  const [quickDueDate, setQuickDueDate] = useState('2026-11-18');
  const [quickDocNumber, setQuickDocNumber] = useState(
    () => `FLX-${Date.now().toString().slice(-4)}`
  );
  const [submittingQuick, setSubmittingQuick] = useState(false);

  const activeClient = useMemo(() => {
    if (selectedClientId === 'ALL') return null;
    return clients.find((c) => c.id === selectedClientId) || null;
  }, [clients, selectedClientId]);

  // Scoped Bank & Cash Accounts for the active client (or all clients)
  const scopedBankAccounts = useMemo(() => {
    return bankAccounts.filter(
      (acc) =>
        acc.active && (selectedClientId === 'ALL' || acc.clientId === Number(selectedClientId))
    );
  }, [bankAccounts, selectedClientId]);

  const activeSelectedAccount = useMemo(() => {
    if (selectedAccountId === 'ALL_ACCOUNTS') return null;
    return scopedBankAccounts.find((a) => a.id === selectedAccountId) || null;
  }, [scopedBankAccounts, selectedAccountId]);

  // Effective Initial Balance & Start Date ("A partir de") from registered Bank/Cash Accounts
  const { currentOpeningBalance, effectiveStartDate } = useMemo(() => {
    if (activeSelectedAccount) {
      return {
        currentOpeningBalance: Number(activeSelectedAccount.initialBalance || 0),
        effectiveStartDate: activeSelectedAccount.initialBalanceDate || '2026-11-01',
      };
    }
    if (scopedBankAccounts.length === 0) {
      return {
        currentOpeningBalance: 45000,
        effectiveStartDate: '2026-11-01',
      };
    }
    const totalInit = scopedBankAccounts.reduce(
      (sum, acc) => sum + Number(acc.initialBalance || 0),
      0
    );
    // Earliest initialBalanceDate among active accounts of the client
    const earliestDate = scopedBankAccounts
      .map((acc) => acc.initialBalanceDate || '2026-11-01')
      .sort()[0];

    return {
      currentOpeningBalance: totalInit,
      effectiveStartDate: earliestDate || '2026-11-01',
    };
  }, [activeSelectedAccount, scopedBankAccounts]);

  const safetyCushionAmount = useMemo(() => {
    if (selectedClientId === 'ALL') return 50000;
    return 20000;
  }, [selectedClientId]);

  // Filter financial entries by Client AND by >= effectiveStartDate ("Data de início do saldo")
  const { scopedEntries, entriesBeforeCutoffCount } = useMemo(() => {
    const clientFiltered = financialEntries.filter(
      (e) => selectedClientId === 'ALL' || e.clientId === selectedClientId
    );
    const afterCutoff = clientFiltered
      .filter((e) => !effectiveStartDate || e.dueDate >= effectiveStartDate)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    const beforeCount = clientFiltered.length - afterCutoff.length;

    return {
      scopedEntries: afterCutoff,
      entriesBeforeCutoffCount: Math.max(0, beforeCount),
    };
  }, [financialEntries, selectedClientId, effectiveStartDate]);

  // Aggregate Totals (Previsto vs Realizado starting from effectiveStartDate)
  const summaryMetrics = useMemo(() => {
    let entriesInPlanned = 0;
    let entriesInRealized = 0;
    let entriesOutPlanned = 0;
    let entriesOutRealized = 0;

    scopedEntries.forEach((e) => {
      const val = Number(e.amount || 0);
      const realized = isRealizedStatus(e.status, e.reconciled);
      if (e.type === 'RECEBER') {
        entriesInPlanned += val;
        if (realized) entriesInRealized += val;
      } else {
        entriesOutPlanned += val;
        if (realized) entriesOutRealized += val;
      }
    });

    const netPlanned = entriesInPlanned - entriesOutPlanned;
    const netRealized = entriesInRealized - entriesOutRealized;
    const finalProjectedBalance = currentOpeningBalance + netPlanned;
    const currentRealizedBalance = currentOpeningBalance + netRealized;

    const inRealizationPct =
      entriesInPlanned > 0 ? Math.round((entriesInRealized / entriesInPlanned) * 100) : 100;
    const outRealizationPct =
      entriesOutPlanned > 0 ? Math.round((entriesOutRealized / entriesOutPlanned) * 100) : 100;

    return {
      entriesInPlanned,
      entriesInRealized,
      entriesInPending: Math.max(0, entriesInPlanned - entriesInRealized),
      entriesOutPlanned,
      entriesOutRealized,
      entriesOutPending: Math.max(0, entriesOutPlanned - entriesOutRealized),
      netPlanned,
      netRealized,
      finalProjectedBalance,
      currentRealizedBalance,
      inRealizationPct,
      outRealizationPct,
    };
  }, [scopedEntries, currentOpeningBalance]);

  // Daily Cash Flow Rows (Dia a Dia)
  const dailyCashFlowRows = useMemo(() => {
    const mapByDate = new Map<
      string,
      {
        date: string;
        inPlanned: number;
        inRealized: number;
        outPlanned: number;
        outRealized: number;
        itemsCount: number;
      }
    >();

    scopedEntries.forEach((e) => {
      const d = e.dueDate || '2026-11-15';
      const current = mapByDate.get(d) || {
        date: d,
        inPlanned: 0,
        inRealized: 0,
        outPlanned: 0,
        outRealized: 0,
        itemsCount: 0,
      };
      const val = Number(e.amount || 0);
      const realized = isRealizedStatus(e.status, e.reconciled);

      if (e.type === 'RECEBER') {
        current.inPlanned += val;
        if (realized) current.inRealized += val;
      } else {
        current.outPlanned += val;
        if (realized) current.outRealized += val;
      }
      current.itemsCount += 1;
      mapByDate.set(d, current);
    });

    const sortedDates = Array.from(mapByDate.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    let runningPlannedBalance = currentOpeningBalance;
    let runningRealizedBalance = currentOpeningBalance;

    return sortedDates.map((row) => {
      const dayNetPlanned = row.inPlanned - row.outPlanned;
      const dayNetRealized = row.inRealized - row.outRealized;
      runningPlannedBalance += dayNetPlanned;
      runningRealizedBalance += dayNetRealized;

      return {
        ...row,
        dayNetPlanned,
        dayNetRealized,
        runningPlannedBalance,
        runningRealizedBalance,
      };
    });
  }, [scopedEntries, currentOpeningBalance]);

  // Monthly Cash Flow Rows (Consolidado Mensal)
  const monthlyCashFlowRows = useMemo(() => {
    const baseMonths = [
      {
        competence: '09/2026',
        label: 'Setembro/2026 (Fechado)',
        inPlanned: Math.round(summaryMetrics.entriesInPlanned * 0.88),
        inRealized: Math.round(summaryMetrics.entriesInPlanned * 0.88),
        outPlanned: Math.round(summaryMetrics.entriesOutPlanned * 0.85),
        outRealized: Math.round(summaryMetrics.entriesOutPlanned * 0.85),
      },
      {
        competence: '10/2026',
        label: 'Outubro/2026 (Fechado)',
        inPlanned: Math.round(summaryMetrics.entriesInPlanned * 0.94),
        inRealized: Math.round(summaryMetrics.entriesInPlanned * 0.93),
        outPlanned: Math.round(summaryMetrics.entriesOutPlanned * 0.91),
        outRealized: Math.round(summaryMetrics.entriesOutPlanned * 0.91),
      },
      {
        competence: '11/2026',
        label: 'Novembro/2026 (Competência Atual)',
        inPlanned: summaryMetrics.entriesInPlanned,
        inRealized: summaryMetrics.entriesInRealized,
        outPlanned: summaryMetrics.entriesOutPlanned,
        outRealized: summaryMetrics.entriesOutRealized,
      },
      {
        competence: '12/2026',
        label: 'Dezembro/2026 (Projeção Futura Baseada no ERP)',
        inPlanned: Math.round(summaryMetrics.entriesInPlanned * 1.12),
        inRealized: 0,
        outPlanned: Math.round(summaryMetrics.entriesOutPlanned * 1.06),
        outRealized: 0,
      },
    ];

    let accBalance = currentOpeningBalance;
    return baseMonths.map((m) => {
      const netPlanned = m.inPlanned - m.outPlanned;
      const netRealized = m.inRealized - m.outRealized;
      accBalance += netPlanned;
      return {
        ...m,
        netPlanned,
        netRealized,
        projectedClosingBalance: accBalance,
      };
    });
  }, [summaryMetrics, currentOpeningBalance]);

  // Scenario Simulation Calculation
  const simulationResult = useMemo(() => {
    const horizonMultiplier =
      projectionHorizonDays === 15
        ? 0.5
        : projectionHorizonDays === 30
        ? 1
        : projectionHorizonDays === 60
        ? 2
        : 3;

    const baseExpectedIn =
      summaryMetrics.entriesInPending * horizonMultiplier + simulatedExtraRevenue;
    const defaultLoss = baseExpectedIn * (simulatedDefaultPct / 100);
    const adjustedIn = Math.max(0, baseExpectedIn - defaultLoss);

    const adjustedOut =
      summaryMetrics.entriesOutPending * horizonMultiplier + simulatedExtraExpense;

    const netCashChange = adjustedIn - adjustedOut;
    const simulatedFinalBalance = summaryMetrics.currentRealizedBalance + netCashChange;

    return {
      baseExpectedIn,
      defaultLoss,
      adjustedIn,
      adjustedOut,
      netCashChange,
      simulatedFinalBalance,
      belowSafetyCushion: simulatedFinalBalance < safetyCushionAmount,
    };
  }, [
    projectionHorizonDays,
    simulatedDefaultPct,
    simulatedExtraExpense,
    simulatedExtraRevenue,
    summaryMetrics,
    safetyCushionAmount,
  ]);

  const dailyChartData = useMemo(() => {
    const startPoint = {
      name: formatDateBr(effectiveStartDate).slice(0, 5),
      fullDate: `Abertura (${formatDateBr(effectiveStartDate)})`,
      entradasPrevistas: 0,
      saidasPrevistas: 0,
      saldoRealizado: Math.round(currentOpeningBalance),
      saldoProjetado: Math.round(currentOpeningBalance),
    };
    const points = dailyCashFlowRows.map((r) => ({
      name: formatDateBr(r.date).slice(0, 5),
      fullDate: formatDateBr(r.date),
      entradasPrevistas: Math.round(r.inPlanned),
      saidasPrevistas: Math.round(r.outPlanned),
      saldoRealizado: Math.round(r.runningRealizedBalance),
      saldoProjetado: Math.round(r.runningPlannedBalance),
    }));
    return [startPoint, ...points];
  }, [dailyCashFlowRows, effectiveStartDate, currentOpeningBalance]);

  const projectionChartData = useMemo(() => {
    const baseBal = summaryMetrics.currentRealizedBalance;
    const stepChange = simulationResult.netCashChange / 4;
    return [
      {
        etapa: `Início (${formatDateBr(effectiveStartDate).slice(0, 5)})`,
        saldoProjetado: Math.round(currentOpeningBalance),
        colchaoSeguranca: Math.round(safetyCushionAmount),
      },
      {
        etapa: 'Hoje (Realizado)',
        saldoProjetado: Math.round(baseBal),
        colchaoSeguranca: Math.round(safetyCushionAmount),
      },
      {
        etapa: `+${Math.round(projectionHorizonDays * 0.25)}d`,
        saldoProjetado: Math.round(baseBal + stepChange),
        colchaoSeguranca: Math.round(safetyCushionAmount),
      },
      {
        etapa: `+${Math.round(projectionHorizonDays * 0.5)}d`,
        saldoProjetado: Math.round(baseBal + stepChange * 2),
        colchaoSeguranca: Math.round(safetyCushionAmount),
      },
      {
        etapa: `+${Math.round(projectionHorizonDays * 0.75)}d`,
        saldoProjetado: Math.round(baseBal + stepChange * 3),
        colchaoSeguranca: Math.round(safetyCushionAmount),
      },
      {
        etapa: `+${projectionHorizonDays} dias`,
        saldoProjetado: Math.round(simulationResult.simulatedFinalBalance),
        colchaoSeguranca: Math.round(safetyCushionAmount),
      },
    ];
  }, [
    effectiveStartDate,
    currentOpeningBalance,
    summaryMetrics.currentRealizedBalance,
    simulationResult,
    projectionHorizonDays,
    safetyCushionAmount,
  ]);

  // Save or Update Bank / Cash Account with Initial Balance & Start Date
  const handleSaveBankAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const targetClient =
      clients.find((c) => c.id === Number(accClientId)) || activeClient || clients[0];
    if (!targetClient || !accName.trim()) return;

    if (editingAccId) {
      const updated = bankAccounts.map((acc) =>
        acc.id === editingAccId
          ? {
              ...acc,
              clientId: targetClient.id,
              clientName: targetClient.tradeName,
              accountName: accName.trim(),
              accountType: accType,
              bankInstitution: accBankInst,
              agencyAndAccount: accAgencyNumber,
              initialBalance: Number(accInitialBalance || 0),
              initialBalanceDate: accInitialDate || '2026-11-01',
            }
          : acc
      );
      saveBankAccounts(updated);
      setEditingAccId(null);
      if (onFeedback) {
        onFeedback(
          'success',
          `Conta / Caixa Atualizado (${accName})`,
          `Saldo inicial de ${formatBrl(accInitialBalance)} a partir de ${formatDateBr(
            accInitialDate
          )} salvo e recalculado com os lançamentos.`
        );
      }
    } else {
      const newAcc: ClientBankAndCashAccount = {
        id: `acc-${Date.now()}`,
        clientId: targetClient.id,
        clientName: targetClient.tradeName,
        accountName: accName.trim(),
        accountType: accType,
        bankInstitution: accBankInst,
        agencyAndAccount: accAgencyNumber,
        initialBalance: Number(accInitialBalance || 0),
        initialBalanceDate: accInitialDate || '2026-11-01',
        active: true,
      };
      saveBankAccounts([...bankAccounts, newAcc]);
      if (onFeedback) {
        onFeedback(
          'success',
          `Nova Conta Bancária / Caixa Cadastrada para ${targetClient.tradeName}`,
          `Saldo inicial de ${formatBrl(newAcc.initialBalance)} configurado a partir de ${formatDateBr(
            newAcc.initialBalanceDate
          )}.`
        );
      }
    }

    setAccName('');
    setAccInitialBalance('15000.00');
  };

  const handleEditAccountClick = (acc: ClientBankAndCashAccount) => {
    setEditingAccId(acc.id);
    setAccClientId(acc.clientId);
    setAccName(acc.accountName);
    setAccType(acc.accountType);
    setAccBankInst(acc.bankInstitution);
    setAccAgencyNumber(acc.agencyAndAccount);
    setAccInitialBalance(String(acc.initialBalance));
    setAccInitialDate(acc.initialBalanceDate);
    setViewMode('CONTAS_SALDO_INICIAL');
  };

  const handleDeleteAccountClick = (id: string) => {
    const next = bankAccounts.filter((a) => a.id !== id);
    saveBankAccounts(next);
    if (selectedAccountId === id) setSelectedAccountId('ALL_ACCOUNTS');
    if (onFeedback) {
      onFeedback('warning', 'Conta / Caixa Removida', 'O saldo consolidado foi recalculado.');
    }
  };

  const handleQuickCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onCreateEntry) return;
    const targetClient = activeClient || clients[0];
    if (!targetClient) return;

    setSubmittingQuick(true);
    try {
      await onCreateEntry({
        clientId: targetClient.id,
        type: quickType,
        counterpartyName: quickCounterparty,
        counterpartyDoc: targetClient.cnpj,
        category: quickCategory,
        costCenter: quickCostCenter,
        description: quickDescription || `Lançamento direto no Fluxo de Caixa (${quickType})`,
        amount: quickAmount,
        dueDate: quickDueDate,
        documentNumber: quickDocNumber,
      });
      setShowQuickModal(false);
      setQuickCounterparty('');
      setQuickDescription('');
      setQuickAmount('');
      setQuickDocNumber(`FLX-${Date.now().toString().slice(-4)}`);
    } finally {
      setSubmittingQuick(false);
    }
  };

  const handleExportCsv = () => {
    const header =
      'Data;Entradas Previstas;Entradas Realizadas;Saidas Previstas;Saidas Realizadas;Geracao Liquida;Saldo Projetado\n';
    const lines = dailyCashFlowRows
      .map(
        (r) =>
          `${r.date};${r.inPlanned.toFixed(2)};${r.inRealized.toFixed(2)};${r.outPlanned.toFixed(
            2
          )};${r.outRealized.toFixed(2)};${r.dayNetPlanned.toFixed(
            2
          )};${r.runningPlannedBalance.toFixed(2)}`
      )
      .join('\n');
    const blob = new Blob([header + lines], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fluxo_caixa_vn_${
      activeClient ? activeClient.code : 'consolidado'
    }_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    if (onFeedback) {
      onFeedback(
        'success',
        'Fluxo de Caixa Exportado (CSV)',
        'Arquivo gerado e pronto para abertura no Excel ou Google Sheets.'
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* TOP CONTROL BAR: CLIENT SELECTOR, ACCOUNT FILTER, VIEW MODES & ACTIONS */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-[#0571ED]/10 text-[#0571ED] text-[11px] font-extrabold uppercase tracking-wider">
                Daily Cash Flow &amp; Tesouraria BPO
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {activeClient
                  ? `${activeClient.code} · ${activeClient.tradeName}`
                  : `Consolidado Multiempresa (${clients.length} empresas)`}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-mono font-bold">
                Saldo Inicial a partir de: {formatDateBr(effectiveStartDate)}
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-[#052557]">
              Fluxo de Caixa Diário, Mensal, Previsto vs. Realizado &amp; Contas/Caixa
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!isClientPortalView && onSelectClientId && (
              <div className="flex items-center gap-1.5 bg-[#F4F7FB] border border-slate-200 rounded-xl px-3 py-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#0571ED]" />
                <select
                  aria-label="Selecionar Empresa no Fluxo de Caixa"
                  value={selectedClientId}
                  onChange={(e) => {
                    onSelectClientId(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value));
                    setSelectedAccountId('ALL_ACCOUNTS');
                  }}
                  className="text-xs font-bold text-[#052557] bg-transparent focus:outline-none"
                >
                  <option value="ALL">Todas as Empresas (Consolidado)</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} · {c.tradeName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Account / Cash Register Selector */}
            <div className="flex items-center gap-1.5 bg-[#F4F7FB] border border-slate-200 rounded-xl px-3 py-1.5">
              <Landmark className="w-3.5 h-3.5 text-[#FA670D]" />
              <select
                aria-label="Selecionar Conta Bancária ou Caixa"
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="text-xs font-bold text-[#052557] bg-transparent focus:outline-none"
              >
                <option value="ALL_ACCOUNTS">
                  Todas as Contas &amp; Caixas ({scopedBankAccounts.length})
                </option>
                {scopedBankAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.accountName} · Início {formatDateBr(acc.initialBalanceDate)} (
                    {formatBrl(acc.initialBalance)})
                  </option>
                ))}
              </select>
            </div>

            {onCreateEntry && (
              <button
                type="button"
                onClick={() => setShowQuickModal(true)}
                className="px-3.5 py-2 rounded-xl bg-[#FA670D] hover:bg-[#E05500] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Lançar Entrada / Saída
              </button>
            )}

            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3 py-2 rounded-xl bg-[#F4F7FB] hover:bg-slate-200/70 border border-slate-200 text-[#052557] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#0571ED]" />
              CSV
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-2 rounded-xl bg-[#052557] hover:bg-[#031B4A] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir
            </button>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 bg-[#F4F7FB] p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('DIARIO')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                viewMode === 'DIARIO'
                  ? 'bg-[#052557] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#052557]'
              }`}
            >
              1. Fluxo Diário (Previsto vs. Realizado)
            </button>
            <button
              type="button"
              onClick={() => setViewMode('MENSAL')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                viewMode === 'MENSAL'
                  ? 'bg-[#052557] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#052557]'
              }`}
            >
              2. Fluxo Mensal Comparativo
            </button>
            <button
              type="button"
              onClick={() => setViewMode('PROJECAO')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                viewMode === 'PROJECAO'
                  ? 'bg-[#FA670D] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#052557]'
              }`}
            >
              3. Projeção Futura (15/30/60/90d)
            </button>
            <button
              type="button"
              onClick={() => setViewMode('CONTAS_SALDO_INICIAL')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'CONTAS_SALDO_INICIAL'
                  ? 'bg-[#0571ED] text-white shadow-xs'
                  : 'text-[#052557] hover:bg-blue-50'
              }`}
            >
              <Landmark className="w-3.5 h-3.5" />
              4. Cadastro de Contas Bancárias &amp; Caixa (Saldo Inicial + Data)
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-slate-600">Filtro de Títulos:</span>
            {(['AMBOS', 'REALIZADO', 'PREVISTO'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setFilterStatusMode(m)}
                className={`px-2.5 py-1 rounded-lg font-bold border cursor-pointer ${
                  filterStatusMode === m
                    ? 'bg-blue-50 border-[#0571ED] text-[#0571ED]'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {m === 'AMBOS'
                  ? 'Previsto + Realizado'
                  : m === 'REALIZADO'
                  ? 'Somente Realizado'
                  : 'Somente Previsto (Aberto)'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5 EXECUTIVE CASH FLOW KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Saldo Bancário Inicial + Data de Corte */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Saldo Inicial (Contas + Caixa)
            </span>
            <span className="w-8 h-8 rounded-xl bg-slate-100 text-[#052557] flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </span>
          </div>
          <div className="my-2">
            <div className="text-xl font-extrabold text-[#052557] font-mono tabular-nums">
              {formatBrl(currentOpeningBalance)}
            </div>
            <div className="text-[11px] text-slate-600 mt-0.5 font-mono">
              A partir de: <strong>{formatDateBr(effectiveStartDate)}</strong>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setViewMode('CONTAS_SALDO_INICIAL')}
            className="text-[11px] font-bold text-[#0571ED] hover:underline text-left cursor-pointer"
          >
            Configurar contas, saldo e data →
          </button>
        </div>

        {/* Card 2: Entradas (Previsto vs Realizado) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Entradas (&ge; {formatDateBr(effectiveStartDate)})
            </span>
            <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className="my-2">
            <div className="text-xl font-extrabold text-emerald-700 font-mono tabular-nums">
              + {formatBrl(summaryMetrics.entriesInPlanned)}
            </div>
            <div className="text-[11px] text-slate-600 mt-0.5 font-mono tabular-nums">
              Realizado: <strong>{formatBrl(summaryMetrics.entriesInRealized)}</strong> (
              {summaryMetrics.inRealizationPct}%)
            </div>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${Math.min(100, summaryMetrics.inRealizationPct)}%` }}
            />
          </div>
        </div>

        {/* Card 3: Saídas (Previsto vs Realizado) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-700">
              Saídas (&ge; {formatDateBr(effectiveStartDate)})
            </span>
            <span className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </span>
          </div>
          <div className="my-2">
            <div className="text-xl font-extrabold text-red-600 font-mono tabular-nums">
              - {formatBrl(summaryMetrics.entriesOutPlanned)}
            </div>
            <div className="text-[11px] text-slate-600 mt-0.5 font-mono tabular-nums">
              Pago: <strong>{formatBrl(summaryMetrics.entriesOutRealized)}</strong> (
              {summaryMetrics.outRealizationPct}%)
            </div>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 rounded-full"
              style={{ width: `${Math.min(100, summaryMetrics.outRealizationPct)}%` }}
            />
          </div>
        </div>

        {/* Card 4: Geração Líquida Operacional */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Geração Líquida Período
            </span>
            <span className="w-8 h-8 rounded-xl bg-blue-50 text-[#0571ED] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="my-2">
            <div
              className={`text-xl font-extrabold font-mono tabular-nums ${
                summaryMetrics.netPlanned >= 0 ? 'text-[#0571ED]' : 'text-red-600'
              }`}
            >
              {summaryMetrics.netPlanned >= 0 ? '+ ' : ''}
              {formatBrl(summaryMetrics.netPlanned)}
            </div>
            <div className="text-[11px] text-slate-600 mt-0.5 font-mono tabular-nums">
              Realizado hoje: <strong>{formatBrl(summaryMetrics.netRealized)}</strong>
            </div>
          </div>
          <div className="text-[11px] text-slate-500">
            Entradas menos Saídas a partir de {formatDateBr(effectiveStartDate)}
          </div>
        </div>

        {/* Card 5: Saldo Final Projetado */}
        <div className="bg-[#052557] text-white rounded-2xl p-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200">
              Saldo Final c/ Lançamentos
            </span>
            <span className="w-8 h-8 rounded-xl bg-white/10 text-[#FA670D] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div className="my-2">
            <div className="text-xl font-extrabold text-white font-mono tabular-nums">
              {formatBrl(summaryMetrics.finalProjectedBalance)}
            </div>
            <div className="text-[11px] text-blue-200 mt-0.5 font-mono tabular-nums">
              Saldo Realizado: <strong>{formatBrl(summaryMetrics.currentRealizedBalance)}</strong>
            </div>
          </div>
          <div className="text-[11px] text-emerald-300 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Saldo Inicial + Lançamentos ERP
          </div>
        </div>
      </div>

      {/* ====================================================================
          VIEW 4: CADASTRO DE CONTAS BANCÁRIAS E CAIXA (SALDO INICIAL + DATA DE CORTE)
         ==================================================================== */}
      {viewMode === 'CONTAS_SALDO_INICIAL' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-slate-200 bg-[#F8FAFC] flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-extrabold text-[#052557]">
                  Contas Bancárias e Caixas Cadastrados ({scopedBankAccounts.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Cada conta define seu <strong>Saldo Inicial</strong> e a <strong>Data de Início (&ldquo;A partir de&rdquo;)</strong> para iniciar o cálculo automático de saldo somando os lançamentos financeiros posteriores.
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-200">
              {scopedBankAccounts.map((acc) => {
                // Calculate specific account movement since its initialBalanceDate
                const accEntries = financialEntries.filter(
                  (e) =>
                    e.clientId === acc.clientId &&
                    e.dueDate >= acc.initialBalanceDate
                );
                const accIn = accEntries
                  .filter((e) => e.type === 'RECEBER')
                  .reduce((s, e) => s + Number(e.amount || 0), 0);
                const accOut = accEntries
                  .filter((e) => e.type === 'PAGAR')
                  .reduce((s, e) => s + Number(e.amount || 0), 0);
                const currentCalculated = Number(acc.initialBalance || 0) + accIn - accOut;

                return (
                  <div key={acc.id} className="p-5 text-xs space-y-3 hover:bg-slate-50">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`px-2.5 py-1 rounded-lg font-extrabold text-[10px] uppercase ${
                            acc.accountType === 'CAIXA_INTERNO'
                              ? 'bg-amber-100 text-amber-800'
                              : acc.accountType === 'INVESTIMENTO'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-[#052557]'
                          }`}
                        >
                          {acc.accountType === 'CAIXA_INTERNO'
                            ? 'Caixa Interno'
                            : acc.accountType === 'INVESTIMENTO'
                            ? 'Reserva / Invest.'
                            : 'Conta Bancária'}
                        </span>
                        <div>
                          <div className="text-sm font-extrabold text-[#052557]">
                            {acc.accountName}
                          </div>
                          <div className="text-slate-500 font-mono">
                            Empresa: <strong>{acc.clientName}</strong> &bull; {acc.bankInstitution} (
                            {acc.agencyAndAccount})
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditAccountClick(acc)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-[#052557] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#0571ED]" />
                          Editar Saldo / Data
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAccountClick(acc.id)}
                          className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 cursor-pointer"
                          title="Remover conta/caixa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 p-3.5 rounded-xl bg-[#F4F7FB] border border-slate-200 font-mono">
                      <div>
                        <span className="text-[10px] font-sans font-bold uppercase text-slate-400 block">
                          Data de Início (&ldquo;A partir de&rdquo;)
                        </span>
                        <strong className="text-[#0571ED] text-sm">
                          {formatDateBr(acc.initialBalanceDate)}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] font-sans font-bold uppercase text-slate-400 block">
                          Saldo Inicial na Data
                        </span>
                        <strong className="text-[#052557] text-sm tabular-nums">
                          {formatBrl(acc.initialBalance)}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] font-sans font-bold uppercase text-slate-400 block">
                          Lançamentos (&ge; {formatDateBr(acc.initialBalanceDate)})
                        </span>
                        <span className="text-emerald-700 font-bold">
                          +{formatBrl(accIn)}
                        </span>{' '}
                        /{' '}
                        <span className="text-red-600 font-bold">
                          -{formatBrl(accOut)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-sans font-bold uppercase text-slate-400 block">
                          Saldo Calculado c/ Lançamentos
                        </span>
                        <strong className="text-emerald-700 text-sm tabular-nums">
                          {formatBrl(currentCalculated)}
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form to Register or Edit Bank Account / Cash Register */}
          <form
            onSubmit={handleSaveBankAccount}
            className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3.5 h-fit shadow-xs text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-[#052557]">
                {editingAccId
                  ? 'Editar Saldo Inicial e Data da Conta/Caixa'
                  : 'Cadastrar Nova Conta Bancária ou Caixa'}
              </h3>
              {editingAccId && (
                <button
                  type="button"
                  onClick={() => setEditingAccId(null)}
                  className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
              )}
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Empresa Cliente *</label>
              <select
                value={accClientId}
                onChange={(e) => setAccClientId(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-bold text-[#052557]"
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
                <label className="block font-bold text-slate-700 mb-1">Tipo de Conta *</label>
                <select
                  value={accType}
                  onChange={(e) =>
                    setAccType(e.target.value as ClientBankAndCashAccount['accountType'])
                  }
                  className="w-full px-2.5 py-2 border border-slate-300 rounded-xl bg-white font-semibold"
                >
                  <option value="CONTA_CORRENTE">Conta Corrente Bancária</option>
                  <option value="CAIXA_INTERNO">Caixa Interno / Tesouraria</option>
                  <option value="INVESTIMENTO">Conta Aplicação / Reserva</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Banco / Origem *</label>
                <input
                  type="text"
                  required
                  value={accBankInst}
                  onChange={(e) => setAccBankInst(e.target.value)}
                  placeholder="Ex.: 341 · Itaú / Caixa Interno"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Nome de Identificação da Conta ou Caixa *
              </label>
              <input
                type="text"
                required
                value={accName}
                onChange={(e) => setAccName(e.target.value)}
                placeholder="Ex.: Itaú Movimento Principal / Caixa Matriz"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Agência &amp; Conta / Código do Caixa
              </label>
              <input
                type="text"
                value={accAgencyNumber}
                onChange={(e) => setAccAgencyNumber(e.target.value)}
                placeholder="Ag 0412 · CC 88410-2"
                className="w-full px-3 py-2 font-mono border border-slate-300 rounded-xl"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 space-y-3">
              <div className="font-extrabold text-[#052557]">
                Parâmetros para Início do Cálculo de Saldo:
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Saldo Inicial (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={accInitialBalance}
                    onChange={(e) => setAccInitialBalance(e.target.value)}
                    className="w-full px-3 py-2 font-mono font-bold text-[#052557] bg-white border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Data (&ldquo;A partir de&rdquo;) *
                  </label>
                  <input
                    type="date"
                    required
                    value={accInitialDate}
                    onChange={(e) => setAccInitialDate(e.target.value)}
                    className="w-full px-3 py-2 font-mono font-bold text-[#0571ED] bg-white border border-slate-300 rounded-xl"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                O sistema partirá de <strong>{formatBrl(accInitialBalance)}</strong> na data{' '}
                <strong>{formatDateBr(accInitialDate)}</strong> e somará/subtrairá automaticamente todos os lançamentos com data igual ou posterior.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#052557] hover:bg-[#0571ED] text-white font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {editingAccId
                ? 'Salvar Novo Saldo Inicial e Data'
                : 'Cadastrar Conta / Caixa e Iniciar Cálculo'}
            </button>
          </form>
        </div>
      )}

      {/* ====================================================================
          VIEW 1: FLUXO DE CAIXA DIÁRIO (DIA A DIA)
         ==================================================================== */}
      {viewMode === 'DIARIO' && (
        <div className="space-y-6">
          {/* Recharts Daily Balance & Cash Flow Variation Chart */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-extrabold text-[#052557]">
                  Curva de Variação de Saldo ao Longo do Tempo (Recharts — Previsto vs. Realizado)
                </h3>
                <p className="text-xs text-slate-500">
                  Acompanhamento visual de Entradas, Saídas, Saldo Acumulado Realizado e Saldo Projetado a partir de {formatDateBr(effectiveStartDate)}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#0571ED] text-[11px] font-bold font-mono">
                Saldo Inicial: {formatBrl(currentOpeningBalance)}
              </span>
            </div>

            <div className="h-[290px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={dailyChartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#475569' }}
                    tickFormatter={(v) => `R$ ${(Number(v) / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value: unknown) => formatBrl(Number(value || 0))}
                    labelStyle={{ fontWeight: 700, color: '#052557' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar
                    dataKey="entradasPrevistas"
                    name="Entradas do Dia"
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                    barSize={18}
                  />
                  <Bar
                    dataKey="saidasPrevistas"
                    name="Saídas do Dia"
                    fill="#EF4444"
                    radius={[4, 4, 0, 0]}
                    barSize={18}
                  />
                  <Area
                    type="monotone"
                    dataKey="saldoRealizado"
                    name="Saldo Acumulado Realizado"
                    fill="#0571ED"
                    fillOpacity={0.12}
                    stroke="#0571ED"
                    strokeWidth={2.5}
                  />
                  <Line
                    type="monotone"
                    dataKey="saldoProjetado"
                    name="Saldo Acumulado Projetado"
                    stroke="#052557"
                    strokeWidth={2.5}
                    dot={{ r: 3.5 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Daily Cash Flow Table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-extrabold text-[#052557]">
                  Evolução Diária de Caixa — Previsto vs. Realizado &amp; Saldo Acumulado (A partir de{' '}
                  {formatDateBr(effectiveStartDate)})
                </h3>
                <p className="text-xs text-slate-500">
                  Cálculo iniciado em {formatDateBr(effectiveStartDate)} com saldo de abertura de{' '}
                  <strong>{formatBrl(currentOpeningBalance)}</strong>
                  {entriesBeforeCutoffCount > 0 &&
                    ` (${entriesBeforeCutoffCount} lançamento(s) anteriores à data de corte já compõem o saldo inicial)`}
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
                  <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" /> Entradas do Dia
                </span>
                <span className="flex items-center gap-1.5 font-semibold text-red-600">
                  <span className="w-2.5 h-2.5 rounded-xs bg-red-500" /> Saídas do Dia
                </span>
                <span className="flex items-center gap-1.5 font-semibold text-[#052557]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0571ED]" /> Saldo Acumulado
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F4F7FB] border-b border-slate-200 text-[#052557] font-extrabold">
                    <th className="py-3 px-4">Data</th>
                    <th className="py-3 px-4 text-right text-emerald-700">Entradas Previstas</th>
                    <th className="py-3 px-4 text-right text-emerald-800">Entradas Realizadas</th>
                    <th className="py-3 px-4 text-right text-red-600">Saídas Previstas</th>
                    <th className="py-3 px-4 text-right text-red-800">Saídas Realizadas</th>
                    <th className="py-3 px-4 text-right">Saldo do Dia (Líquido)</th>
                    <th className="py-3 px-4 text-right">Saldo Acumulado Realizado</th>
                    <th className="py-3 px-4 text-right bg-blue-50/60">Saldo Acumulado Projetado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {/* Opening Balance Row */}
                  <tr className="bg-slate-50/80 font-semibold text-slate-700">
                    <td className="py-2.5 px-4 font-mono">
                      SALDO INICIAL ({formatDateBr(effectiveStartDate)})
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono">-</td>
                    <td className="py-2.5 px-4 text-right font-mono">-</td>
                    <td className="py-2.5 px-4 text-right font-mono">-</td>
                    <td className="py-2.5 px-4 text-right font-mono">-</td>
                    <td className="py-2.5 px-4 text-right font-mono">-</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-[#052557] tabular-nums">
                      {formatBrl(currentOpeningBalance)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-[#052557] bg-blue-50/40 tabular-nums">
                      {formatBrl(currentOpeningBalance)}
                    </td>
                  </tr>

                  {dailyCashFlowRows.map((row) => (
                    <tr key={row.date} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-[#052557]">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#0571ED]" />
                          {formatDateBr(row.date)}
                          <span className="text-[10px] font-normal text-slate-400">
                            ({row.itemsCount})
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-700 tabular-nums">
                        {row.inPlanned > 0 ? `+ ${formatBrl(row.inPlanned)}` : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-800 tabular-nums">
                        {row.inRealized > 0 ? `+ ${formatBrl(row.inRealized)}` : 'R$ 0,00'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-red-600 tabular-nums">
                        {row.outPlanned > 0 ? `- ${formatBrl(row.outPlanned)}` : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-red-800 tabular-nums">
                        {row.outRealized > 0 ? `- ${formatBrl(row.outRealized)}` : 'R$ 0,00'}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-mono font-bold tabular-nums ${
                          row.dayNetPlanned >= 0 ? 'text-emerald-700' : 'text-red-600'
                        }`}
                      >
                        {row.dayNetPlanned >= 0 ? '+ ' : ''}
                        {formatBrl(row.dayNetPlanned)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-slate-800 tabular-nums">
                        {formatBrl(row.runningRealizedBalance)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-extrabold text-[#052557] bg-blue-50/40 tabular-nums">
                        {formatBrl(row.runningPlannedBalance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detailed Analytical Ledger with 1-Click Liquidation */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 bg-[#F8FAFC]">
              <div>
                <h3 className="text-sm font-extrabold text-[#052557]">
                  Movimentações Analíticas do Fluxo de Caixa ({scopedEntries.length} títulos a partir de{' '}
                  {formatDateBr(effectiveStartDate)})
                </h3>
                <p className="text-xs text-slate-500">
                  Clique em &ldquo;Confirmar Baixa / Realizar&rdquo; para converter um título previsto em realizado imediatamente
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="py-2.5 px-4">Vencimento / Código</th>
                    <th className="py-2.5 px-4">Natureza</th>
                    <th className="py-2.5 px-4">Empresa Cliente / Contraparte</th>
                    <th className="py-2.5 px-4">Categoria &amp; Conta</th>
                    <th className="py-2.5 px-4 text-right">Valor</th>
                    <th className="py-2.5 px-4">Estágio no Caixa</th>
                    {onLiquidateEntry && <th className="py-2.5 px-4 text-right">Ação Rápida</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {scopedEntries
                    .filter((entry) => {
                      const realized = isRealizedStatus(entry.status, entry.reconciled);
                      if (filterStatusMode === 'REALIZADO') return realized;
                      if (filterStatusMode === 'PREVISTO') return !realized;
                      return true;
                    })
                    .map((entry) => {
                      const realized = isRealizedStatus(entry.status, entry.reconciled);
                      return (
                        <tr key={entry.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-mono">
                            <div className="font-bold text-[#052557]">
                              {formatDateBr(entry.dueDate)}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {entry.code} · {entry.documentNumber}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                                entry.type === 'RECEBER'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-red-50 text-red-700 border border-red-200'
                              }`}
                            >
                              {entry.type === 'RECEBER' ? 'ENTRADA (+)' : 'SAÍDA (-)'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{entry.counterpartyName}</div>
                            <div className="text-slate-500">{entry.clientName}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-slate-800">{entry.category}</div>
                            <div className="text-[11px] text-slate-500">{entry.bankAccount}</div>
                          </td>
                          <td
                            className={`py-3 px-4 text-right font-mono font-extrabold tabular-nums ${
                              entry.type === 'RECEBER' ? 'text-emerald-700' : 'text-red-600'
                            }`}
                          >
                            {entry.type === 'RECEBER' ? '+ ' : '- '}
                            {formatBrl(entry.amount)}
                          </td>
                          <td className="py-3 px-4">
                            {realized ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                                <CheckCircle2 className="w-3 h-3" />
                                Realizado ({entry.status})
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                                Previsto ({entry.status})
                              </span>
                            )}
                          </td>
                          {onLiquidateEntry && (
                            <td className="py-3 px-4 text-right">
                              {!realized ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    onLiquidateEntry(entry.id, {
                                      type: entry.type,
                                      counterpartyName: entry.counterpartyName,
                                      amount: entry.amount,
                                      dueDate: entry.dueDate,
                                      category: entry.category,
                                      costCenter: entry.costCenter,
                                      documentNumber: entry.documentNumber,
                                      description: entry.description,
                                      status:
                                        entry.type === 'RECEBER'
                                          ? 'Recebido / Conciliado'
                                          : 'Pago / Conciliado',
                                      adjustmentReason:
                                        'Baixa rápida confirmada diretamente no módulo de Fluxo de Caixa',
                                    })
                                  }
                                  className="px-2.5 py-1 rounded-lg bg-[#0571ED] hover:bg-[#052557] text-white text-[11px] font-bold cursor-pointer"
                                >
                                  Confirmar Baixa / Realizar
                                </button>
                              ) : (
                                <span className="text-[11px] font-mono text-slate-400">
                                  Conciliado
                                </span>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          VIEW 2: FLUXO DE CAIXA MENSAL (PREVISTO VS REALIZADO)
         ==================================================================== */}
      {viewMode === 'MENSAL' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
          <div>
            <h3 className="text-base font-extrabold text-[#052557]">
              Demonstrativo Mensal Comparativo — Previsto vs. Realizado por Competência
            </h3>
            <p className="text-xs text-slate-500">
              Visão executiva de fechamento de caixa com gráfico comparativo Recharts e índice de aderência orçamentária
            </p>
          </div>

          <div className="h-[280px] w-full bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-4">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyCashFlowRows} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="competence" tick={{ fontSize: 11, fill: '#052557', fontWeight: 700 }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#475569' }}
                  tickFormatter={(v) => `R$ ${(Number(v) / 1000).toFixed(0)}k`}
                />
                <Tooltip formatter={(value: unknown) => formatBrl(Number(value || 0))} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="inPlanned" name="Entradas Previstas" fill="#6EE7B7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="inRealized" name="Entradas Realizadas" fill="#059669" radius={[4, 4, 0, 0]} />
                <Bar dataKey="outPlanned" name="Saídas Previstas" fill="#FCA5A5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="outRealized" name="Saídas Realizadas" fill="#DC2626" radius={[4, 4, 0, 0]} />
                <Line
                  type="monotone"
                  dataKey="projectedClosingBalance"
                  name="Saldo Final Projetado"
                  stroke="#052557"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F4F7FB] border-b border-slate-200 text-[#052557] font-extrabold">
                  <th className="py-3 px-4">Competência</th>
                  <th className="py-3 px-4 text-right text-emerald-700">Entradas Previstas</th>
                  <th className="py-3 px-4 text-right text-emerald-800">Entradas Realizadas</th>
                  <th className="py-3 px-4 text-right text-red-600">Saídas Previstas</th>
                  <th className="py-3 px-4 text-right text-red-800">Saídas Realizadas</th>
                  <th className="py-3 px-4 text-right">Resultado Caixa Previsto</th>
                  <th className="py-3 px-4 text-right">Resultado Caixa Realizado</th>
                  <th className="py-3 px-4 text-right bg-blue-50/60">Saldo Final Projetado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {monthlyCashFlowRows.map((m) => (
                  <tr key={m.competence} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-extrabold text-[#052557]">{m.competence}</div>
                      <div className="text-[11px] text-slate-500">{m.label}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-emerald-700 tabular-nums">
                      {formatBrl(m.inPlanned)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-800 tabular-nums">
                      {formatBrl(m.inRealized)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-red-600 tabular-nums">
                      {formatBrl(m.outPlanned)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-red-800 tabular-nums">
                      {formatBrl(m.outRealized)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-[#0571ED] tabular-nums">
                      {formatBrl(m.netPlanned)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {formatBrl(m.netRealized)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-extrabold text-[#052557] bg-blue-50/40 tabular-nums">
                      {formatBrl(m.projectedClosingBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ====================================================================
          VIEW 3: PROJEÇÃO DE LIQUIDEZ 15/30/60/90 DIAS & SIMULADOR DE CENÁRIOS
         ==================================================================== */}
      {viewMode === 'PROJECAO' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="vn-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-[#052557] flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#FA670D]" />
                Parâmetros da Projeção &amp; Estresse
              </h3>
              <button
                type="button"
                onClick={() => {
                  setSimulatedDefaultPct(0);
                  setSimulatedExtraExpense(0);
                  setSimulatedExtraRevenue(0);
                }}
                className="text-[11px] font-bold text-[#0571ED] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Resetar
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Horizonte de Projeção de Caixa
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {([15, 30, 60, 90] as const).map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setProjectionHorizonDays(days)}
                      className={`py-2 rounded-xl font-extrabold border cursor-pointer ${
                        projectionHorizonDays === days
                          ? 'bg-[#052557] text-white border-[#052557]'
                          : 'bg-[#F4F7FB] text-slate-700 border-slate-200'
                      }`}
                    >
                      {days} dias
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Taxa Simulada de Inadimplência / Atraso ({simulatedDefaultPct}%)
                </label>
                <input
                  type="range"
                  min={0}
                  max={50}
                  step={5}
                  value={simulatedDefaultPct}
                  onChange={(e) => setSimulatedDefaultPct(Number(e.target.value))}
                  className="w-full accent-[#FA670D]"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>0% (Base)</span>
                  <span>15% (Moderado)</span>
                  <span>30% (Crítico)</span>
                  <span>50% (Estresse)</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Simular Nova Despesa / Investimento Extra (R$)
                </label>
                <input
                  type="number"
                  step="500"
                  value={simulatedExtraExpense}
                  onChange={(e) => setSimulatedExtraExpense(Number(e.target.value || 0))}
                  className="w-full px-3 py-2 rounded-xl bg-[#F4F7FB] border border-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Simular Entrada Extra / Antecipação de Recebíveis (R$)
                </label>
                <input
                  type="number"
                  step="500"
                  value={simulatedExtraRevenue}
                  onChange={(e) => setSimulatedExtraRevenue(Number(e.target.value || 0))}
                  className="w-full px-3 py-2 rounded-xl bg-[#F4F7FB] border border-slate-200 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 vn-card p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-[#052557]">
                  Resultado da Projeção de Caixa para {projectionHorizonDays} Dias
                </h3>
                <p className="text-xs text-slate-500">
                  Cálculo baseado no Saldo Realizado Hoje ({formatBrl(summaryMetrics.currentRealizedBalance)}) + títulos em aberto do ERP
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${
                  simulationResult.belowSafetyCushion
                    ? 'bg-red-100 text-red-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {simulationResult.belowSafetyCushion ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5" /> Atenção: Abaixo do Colchão de Segurança
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Liquidez Saudável Garantida
                  </>
                )}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                <div className="text-emerald-800 font-bold">Entradas Projetadas Líquidas</div>
                <div className="text-lg font-extrabold text-emerald-700 font-mono mt-1 tabular-nums">
                  + {formatBrl(simulationResult.adjustedIn)}
                </div>
                {simulationResult.defaultLoss > 0 && (
                  <div className="text-[11px] text-red-600 mt-1 font-mono">
                    Retenção p/ inadimplência: - {formatBrl(simulationResult.defaultLoss)}
                  </div>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-red-50/70 border border-red-200">
                <div className="text-red-800 font-bold">Saídas Projetadas Totais</div>
                <div className="text-lg font-extrabold text-red-600 font-mono mt-1 tabular-nums">
                  - {formatBrl(simulationResult.adjustedOut)}
                </div>
                <div className="text-[11px] text-slate-600 mt-1">
                  Contas a pagar em aberto + extras
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#052557] text-white">
                <div className="text-blue-200 font-bold">
                  Saldo Bancário em +{projectionHorizonDays} Dias
                </div>
                <div className="text-lg font-extrabold text-white font-mono mt-1 tabular-nums">
                  {formatBrl(simulationResult.simulatedFinalBalance)}
                </div>
                <div className="text-[11px] text-blue-200 mt-1 font-mono">
                  Variação: {simulationResult.netCashChange >= 0 ? '+ ' : ''}
                  {formatBrl(simulationResult.netCashChange)}
                </div>
              </div>
            </div>

            <div className="h-[250px] w-full bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projectionChartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="etapa" tick={{ fontSize: 11, fill: '#052557', fontWeight: 700 }} />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#475569' }}
                    tickFormatter={(v) => `R$ ${(Number(v) / 1000).toFixed(0)}k`}
                  />
                  <Tooltip formatter={(value: unknown) => formatBrl(Number(value || 0))} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <ReferenceLine
                    y={safetyCushionAmount}
                    stroke="#FA670D"
                    strokeDasharray="4 4"
                    label={{
                      value: 'Colchão Mínimo',
                      position: 'insideTopRight',
                      fill: '#FA670D',
                      fontSize: 10,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="saldoProjetado"
                    name={`Trajetória Projetada (${projectionHorizonDays}d)`}
                    stroke="#0571ED"
                    strokeWidth={3}
                    fill="#0571ED"
                    fillOpacity={0.18}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="p-4 rounded-2xl bg-[#F4F7FB] border border-slate-200 text-xs space-y-1.5">
              <div className="font-extrabold text-[#052557]">
                Parecer Automático da Controladoria VN Soluções:
              </div>
              <p className="text-slate-600 leading-relaxed">
                {simulationResult.belowSafetyCushion
                  ? `No cenário simulado para ${projectionHorizonDays} dias (com ${simulatedDefaultPct}% de inadimplência), o saldo final projetado de ${formatBrl(
                      simulationResult.simulatedFinalBalance
                    )} fica abaixo do colchão mínimo de segurança (${formatBrl(
                      safetyCushionAmount
                    )}). Recomendamos acionar a régua preventiva de cobrança em Contas a Receber ou renegociar prazos de fornecedores.`
                  : `Mesmo considerando o horizonte de ${projectionHorizonDays} dias e ${simulatedDefaultPct}% de inadimplência, a empresa mantém saldo projetado positivo de ${formatBrl(
                      simulationResult.simulatedFinalBalance
                    )}, preservando o colchão de segurança de ${formatBrl(
                      safetyCushionAmount
                    )} com folga operacional.`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: LANÇAMENTO RÁPIDO DIRETO NO FLUXO DE CAIXA */}
      {showQuickModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <form
            onSubmit={handleQuickCreateSubmit}
            className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-extrabold text-[#052557]">
                Novo Lançamento Direto no Fluxo de Caixa
              </h3>
              <button
                type="button"
                onClick={() => setShowQuickModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
              >
                Fechar
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setQuickType('RECEBER');
                  setQuickCategory('Receita de Serviços / Vendas');
                }}
                className={`py-2 rounded-xl font-extrabold border cursor-pointer ${
                  quickType === 'RECEBER'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                + Entrada (A Receber)
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuickType('PAGAR');
                  setQuickCategory('Fornecedores & Despesas Operacionais');
                }}
                className={`py-2 rounded-xl font-extrabold border cursor-pointer ${
                  quickType === 'PAGAR'
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                - Saída (A Pagar)
              </button>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Cliente / Fornecedor / Favorecido *
              </label>
              <input
                type="text"
                required
                value={quickCounterparty}
                onChange={(e) => setQuickCounterparty(e.target.value)}
                placeholder="Ex.: Clínica São Lucas / Distribuidora Nordeste"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Valor (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={quickAmount}
                  onChange={(e) => setQuickAmount(e.target.value)}
                  placeholder="2450.00"
                  className="w-full px-3 py-2 font-mono border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Data no Caixa *</label>
                <input
                  type="date"
                  required
                  value={quickDueDate}
                  onChange={(e) => setQuickDueDate(e.target.value)}
                  className="w-full px-3 py-2 font-mono border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Descrição / Histórico *</label>
              <input
                type="text"
                required
                value={quickDescription}
                onChange={(e) => setQuickDescription(e.target.value)}
                placeholder="Ex.: Recebimento parcela contrato / Pagamento fornecedor"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowQuickModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submittingQuick}
                className="px-4 py-2 rounded-xl bg-[#052557] hover:bg-[#0571ED] text-white font-extrabold cursor-pointer"
              >
                {submittingQuick ? 'Gravando...' : 'Salvar no Fluxo de Caixa'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
