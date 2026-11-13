export interface FallbackStore {
  users: Array<{
    id: number;
    uid: string;
    email: string;
    name: string;
    role: string;
    active: boolean;
    mfaEnabled: boolean;
    failedAttempts: number;
    lastLoginAt: Date;
    createdAt: Date;
  }>;
  clients: Array<{
    id: number;
    code: string;
    name: string;
    tradeName: string;
    cnpj: string;
    taxRegime: string;
    erpSystem: string;
    bankAccounts: string;
    responsibleAnalyst: string;
    particularities: string;
    onboardingStatus: string;
    status: string;
    monthlyFee: string;
    operationalCost: string;
    createdAt?: Date;
    updatedAt?: Date;
  }>;
  crmLeads: Array<{
    id: number;
    code: string;
    companyName: string;
    cnpj: string;
    contactName: string;
    email: string;
    phone: string;
    origin: string;
    stage: string;
    estimatedValue: string;
    taxRegime: string;
    proposedServices: string;
    assignedTo: string;
    notes: string;
    convertedClientId: number | null;
    createdAt?: Date;
    updatedAt?: Date;
  }>;
  contracts: Array<{
    id: number;
    code: string;
    clientId: number;
    clientName: string;
    packageName: string;
    servicesScope: string;
    monthlyValue: string;
    startDate: string;
    endDate: string;
    adjustmentIndex: string;
    version: number;
    status: string;
    responsibleName: string;
  }>;
  financialEntries: Array<{
    id: number;
    code: string;
    clientId: number;
    clientName: string;
    type: 'PAGAR' | 'RECEBER';
    counterpartyName: string;
    counterpartyDoc: string;
    category: string;
    costCenter: string;
    description: string;
    amount: string;
    dueDate: string;
    competence: string;
    documentNumber: string;
    bankAccount: string;
    status: string;
    createdByUid: string;
    createdByName: string;
    approvedByUid: string | null;
    approvedByName: string | null;
    batchCode: string | null;
    idempotencyKey: string;
    reconciled: boolean;
  }>;
  paymentBatches: Array<{
    id: number;
    code: string;
    clientId: number;
    clientName: string;
    title: string;
    bankAccount: string;
    totalAmount: string;
    itemsCount: number;
    status: string;
    createdByUid: string;
    createdByName: string;
    approvedByUid: string | null;
    approvedByName: string | null;
    approvalNotes: string | null;
    idempotencyKey: string;
  }>;
  bankReconciliations: Array<{
    id: number;
    code: string;
    clientId: number;
    clientName: string;
    bankAccount: string;
    statementDate: string;
    statementDescription: string;
    statementAmount: string;
    linkedEntryCode: string | null;
    ledgerAmount: string;
    differenceAmount: string;
    confidenceScore: number;
    status: string;
    justification: string | null;
    reviewedByName: string | null;
  }>;
  financialClosings: Array<{
    id: number;
    code: string;
    clientId: number;
    clientName: string;
    competence: string;
    checklistProgress: number;
    documentsStatus: string;
    reconciliationStatus: string;
    dreRevenue: string;
    dreExpenses: string;
    dreNetResult: string;
    pendingJustifications: string | null;
    status: string;
    responsibleName: string;
    approvedByName: string | null;
  }>;
  demandsTasks: Array<{
    id: number;
    code: string;
    clientId: number;
    clientName: string;
    moduleName: string;
    title: string;
    processName: string;
    processVersion: string;
    recurrence: string;
    checklistSummary: string;
    assignedTo: string;
    reviewerName: string;
    dueDate: string;
    status: string;
    evidenceNotes: string | null;
  }>;
  serviceDeskTickets: Array<{
    id: number;
    protocolNumber: string;
    internalCode: string;
    requesterUid: string;
    requesterName: string;
    clientId: number | null;
    clientName: string;
    originModule: string;
    originScreen: string;
    affectedFeature: string;
    category: string;
    subcategory: string;
    title: string;
    description: string;
    stepsToReproduce: string;
    expectedResult: string;
    obtainedResult: string;
    frequency: string;
    priority: string;
    severity: string;
    impact: string;
    blocksContinuity: boolean;
    assignedTo: string;
    assignedTeam: string;
    slaDueAt: string;
    evidenceNotes: string | null;
    status: string;
    originType: string;
    correlationId: string;
    appVersion: string;
    appliedSolution: string | null;
    testEvidence: string | null;
    validatedBy: string | null;
    incidentCode: string | null;
  }>;
  technicalIncidents: Array<{
    id: number;
    code: string;
    affectedService: string;
    moduleName: string;
    version: string;
    environment: string;
    durationMinutes: number;
    occurrencesCount: number;
    impactedClientsCount: number;
    affectedOperations: string;
    severity: string;
    technicalError: string;
    correlationId: string;
    responsibleTech: string;
    containmentMeasure: string;
    rootCauseSymptom: string;
    rootCauseTechnical: string;
    rootCauseOperational: string;
    fiveWhysAnalysis: string;
    definitiveFix: string;
    preventionPlan: string;
    status: string;
    validationStatus: string;
  }>;
  technicalChanges: Array<{
    id: number;
    code: string;
    title: string;
    justification: string;
    scope: string;
    affectedModules: string;
    risks: string;
    testPlan: string;
    deploymentPlan: string;
    rollbackPlan: string;
    approverName: string;
    targetVersion: string;
    isEmergency: boolean;
    status: string;
  }>;
  knowledgeArticles: Array<{
    id: number;
    code: string;
    ticketProtocol: string;
    title: string;
    problemDescription: string;
    rootCause: string;
    howToIdentify: string;
    howToFix: string;
    howToPrevent: string;
    affectedModule: string;
    fixedVersion: string;
    authorName: string;
  }>;
  auditLogs: Array<{
    id: number;
    eventId: string;
    actorUid: string;
    actorName: string;
    moduleName: string;
    operation: string;
    clientName: string;
    correlationId: string;
    result: string;
    errorCode: string | null;
    severity: string;
    details: string;
  }>;
  backgroundJobs: Array<{
    id: number;
    jobCode: string;
    originModule: string;
    jobType: string;
    clientName: string;
    status: string;
    attempts: number;
    maxAttempts: number;
    resultSummary: string;
    errorMessage: string | null;
    nextAction: string;
  }>;
  externalIntegrations: Array<{
    id: number;
    code: string;
    clientName: string;
    provider: string;
    authScope: string;
    status: string;
    lastSyncAt: string;
    nextSyncAt: string;
    errorCount: number;
    attempts: number;
    responsibleName: string;
    lastErrorMessage: string | null;
  }>;
  backupPolicy: {
    frequency: string;
    retentionDays: number;
    retentionLabel: string;
    gcsBucketUri: string;
    storageClass: string;
    encryptionMode: string;
    rpoTarget: string;
    rtoTarget: string;
    preUpdateAutoSnapshot: boolean;
    crossRegionReplication: boolean;
    updatedAt: string;
    updatedBy: string;
  };
  backupLogs: Array<{
    id: number;
    backupCode: string;
    startedAt: string;
    completedAt: string;
    durationSeconds: number;
    triggerType: 'Automático (Agendado)' | 'Manual (Sob Demanda)' | 'Pré-Atualização (GMUD)' | 'Teste de Restauração';
    gcsObjectUri: string;
    sizeMb: string;
    sha256Checksum: string;
    encryptionStatus: string;
    restoreVerificationStatus: string;
    status: 'Sucesso' | 'Validado em Homologação' | 'Em Execução' | 'Falha';
    triggeredBy: string;
    correlationId: string;
  }>;
  serviceCatalog: Array<{
    id: number;
    code: string;
    name: string;
    category: string;
    defaultRecurrence: 'Diária' | 'Semanal' | 'Quinzenal' | 'Mensal';
    defaultFee: string;
    slaHours: string;
    checklistTemplate: string;
    requiredDocuments: string;
    parameterRules: string;
    active: boolean;
  }>;
}

export const memoryStore: FallbackStore = {
  users: [
    {
      id: 1,
      uid: 'uid-gestor-vn',
      email: 'paulovictor85571590@gmail.com',
      name: 'Paulo Victor — Diretor de Operações VN',
      role: 'gestor',
      active: true,
      mfaEnabled: true,
      failedAttempts: 0,
      lastLoginAt: new Date(),
      createdAt: new Date(),
    },
    {
      id: 2,
      uid: 'uid-sup-fin',
      email: 'carla.mendes@vnsolucoes.com.br',
      name: 'Carla Mendes — Supervisora Financeira',
      role: 'supervisor',
      active: true,
      mfaEnabled: true,
      failedAttempts: 0,
      lastLoginAt: new Date(),
      createdAt: new Date(),
    },
    {
      id: 3,
      uid: 'uid-ana-bpo',
      email: 'lucas.rocha@vnsolucoes.com.br',
      name: 'Lucas Rocha — Analista BPO Sênior',
      role: 'analista',
      active: true,
      mfaEnabled: true,
      failedAttempts: 0,
      lastLoginAt: new Date(),
      createdAt: new Date(),
    },
  ],
  clients: [
    {
      id: 1,
      code: 'CLI-001',
      name: 'Grupo Vértice Engenharia e Infraestrutura S.A.',
      tradeName: 'Vértice Engenharia',
      cnpj: '14.289.401/0001-52',
      taxRegime: 'Lucro Real',
      erpSystem: 'Omie ERP + Integração CNAB Itaú',
      bankAccounts: 'Itaú Empresas (Ag 0391 CC 44810-2) · BTG Pactual Corporate',
      responsibleAnalyst: 'Lucas Rocha',
      particularities:
        'Exige dupla aprovação para lotes acima de R$ 15.000,00; proibido pagamento sem NF anexada e centro de custo de obra validado.',
      onboardingStatus: 'Concluído',
      status: 'Aprovado',
      monthlyFee: '8500.00',
      operationalCost: '3400.00',
    },
    {
      id: 2,
      code: 'CLI-002',
      name: 'Clínica Médica Integrada VidaPlena Ltda',
      tradeName: 'Clínica VidaPlena',
      cnpj: '27.614.890/0001-19',
      taxRegime: 'Lucro Presumido',
      erpSystem: 'ContaAzul Pro + Adquirente Rede/Stone',
      bankAccounts: 'Bradesco Saúde (Ag 2104 CC 9912-8) · Sicredi PJ',
      responsibleAnalyst: 'Lucas Rocha',
      particularities:
        'Conciliação diária de repasses médicos e glosas de convênios; fechamento DRE até o 4º dia útil.',
      onboardingStatus: 'Concluído',
      status: 'Aprovado',
      monthlyFee: '5900.00',
      operationalCost: '2450.00',
    },
    {
      id: 3,
      code: 'CLI-003',
      name: 'NorteSul Distribuidora e Logística Reversa Ltda',
      tradeName: 'NorteSul Logística',
      cnpj: '33.901.772/0001-84',
      taxRegime: 'Lucro Real',
      erpSystem: 'TOTVS Protheus + API Santander',
      bankAccounts: 'Santander Empresas (Ag 1102 CC 130049-1)',
      responsibleAnalyst: 'Carla Mendes',
      particularities:
        'Validação estrita de CT-e e MDF-e antes de liberar lotes de frete; retenção de INSS/ISS auditada por filial.',
      onboardingStatus: 'Concluído',
      status: 'Aprovado',
      monthlyFee: '11200.00',
      operationalCost: '4800.00',
    },
    {
      id: 4,
      code: 'CLI-004',
      name: ' Solaris Energia Fotovoltaica e Projetos Ltda',
      tradeName: 'Solaris Energia',
      cnpj: '41.008.312/0001-06',
      taxRegime: 'Simples Nacional',
      erpSystem: 'Nibo + Banco Inter PJ',
      bankAccounts: 'Banco Inter PJ (CC 8841209-4)',
      responsibleAnalyst: 'Lucas Rocha',
      particularities:
        'Rateio centesimal por usina solar; alerta automático em compras de inversores importados.',
      onboardingStatus: 'Em processamento',
      status: 'Aprovado',
      monthlyFee: '4200.00',
      operationalCost: '1650.00',
    },
  ],
  crmLeads: [
    {
      id: 1,
      code: 'CRM-101',
      companyName: ' Rede Gastronômica Sabor & Arte S.A.',
      cnpj: '19.442.810/0001-33',
      contactName: 'Henrique Vasconcelos',
      email: 'henrique@saborearte.com.br',
      phone: '(11) 98821-4402',
      origin: 'Indicação Diretoria',
      stage: 'Negociação',
      estimatedValue: '7800.00',
      taxRegime: 'Lucro Presumido',
      proposedServices: 'BPO Financeiro Completo + Conciliação de Cartões/iFood + DRE Multiloja',
      assignedTo: 'Paulo Victor',
      notes: '4 unidades em São Paulo; busca reduzir divergências de taxas de adquirentes.',
      convertedClientId: null,
    },
    {
      id: 2,
      code: 'CRM-102',
      companyName: 'TechNova SaaS & Cloud Solutions Ltda',
      cnpj: '48.119.503/0001-71',
      contactName: 'Beatriz Alencar',
      email: 'beatriz@technova.io',
      phone: '(21) 99104-8820',
      origin: 'Inbound Google',
      stage: 'Proposta',
      estimatedValue: '5400.00',
      taxRegime: 'Lucro Real',
      proposedServices: 'Contas a Pagar + Faturamento Recorrente + Controladoria',
      assignedTo: 'Carla Mendes',
      notes: 'Receita recorrente com 400 clientes B2B; requer integração Google Workspace.',
      convertedClientId: null,
    },
  ],
  contracts: [
    {
      id: 1,
      code: 'CTR-2026-01',
      clientId: 1,
      clientName: 'Vértice Engenharia',
      packageName: 'BPO Enterprise Controladoria & Obras',
      servicesScope: 'Contas a pagar, Contas a receber, Conciliação diária, Lotes CNAB, DRE por Centro de Custo',
      monthlyValue: '8500.00',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      adjustmentIndex: 'IPCA',
      version: 2,
      status: 'Aprovado',
      responsibleName: 'Paulo Victor',
    },
    {
      id: 2,
      code: 'CTR-2026-02',
      clientId: 2,
      clientName: 'Clínica VidaPlena',
      packageName: 'BPO Saúde & Conciliação de Convênios',
      servicesScope: 'Faturamento médico, Repasse de corpo clínico, Conciliação de cartões e DRE mensal',
      monthlyValue: '5900.00',
      startDate: '2026-02-01',
      endDate: '2027-01-31',
      adjustmentIndex: 'IGP-M',
      version: 1,
      status: 'Aprovado',
      responsibleName: 'Carla Mendes',
    },
    {
      id: 3,
      code: 'CTR-2026-03',
      clientId: 3,
      clientName: 'NorteSul Logística',
      packageName: 'BPO Full Corporativo & Auditoria Fiscal',
      servicesScope: 'Gestão de fretes, Auditoria de CT-e, Lotes diários Santander, Fechamento contábil',
      monthlyValue: '11200.00',
      startDate: '2026-01-15',
      endDate: '2027-01-14',
      adjustmentIndex: 'IPCA',
      version: 3,
      status: 'Aprovado',
      responsibleName: 'Carla Mendes',
    },
    {
      id: 4,
      code: 'CTR-2026-04',
      clientId: 4,
      clientName: 'Solaris Energia',
      packageName: 'BPO Growth & Rateio de Projetos',
      servicesScope: 'Contas a pagar, Conciliação Inter PJ, Fluxo de caixa por usina',
      monthlyValue: '4200.00',
      startDate: '2026-06-01',
      endDate: '2027-05-31',
      adjustmentIndex: 'INCC',
      version: 1,
      status: 'Aprovado',
      responsibleName: 'Lucas Rocha',
    },
  ],
  financialEntries: [
    {
      id: 1,
      code: 'LAN-8041',
      clientId: 1,
      clientName: 'Vértice Engenharia',
      type: 'PAGAR',
      counterpartyName: 'AçoForte Siderurgia e Metais Ltda',
      counterpartyDoc: '08.412.990/0001-11',
      category: 'Insumos de Obra',
      costCenter: 'Obra Residencial Aurora',
      description: 'Fornecimento de vergalhões estruturais CA-50 — Lote 04',
      amount: '18450.00',
      dueDate: '2026-11-15',
      competence: '11/2026',
      documentNumber: 'NF-44910',
      bankAccount: 'Itaú Empresas (Ag 0391)',
      status: 'Aguardando aprovação',
      createdByUid: 'uid-gestor-vn',
      createdByName: 'Paulo Victor',
      approvedByUid: null,
      approvedByName: null,
      batchCode: 'LOT-2026-091',
      idempotencyKey: 'idem-lan-8041-vertice',
      reconciled: false,
    },
    {
      id: 2,
      code: 'LAN-8042',
      clientId: 2,
      clientName: 'Clínica VidaPlena',
      type: 'PAGAR',
      counterpartyName: 'BioMed Diagnósticos Hospitalares S.A.',
      counterpartyDoc: '11.209.334/0001-60',
      category: 'Materiais Laboratoriais',
      costCenter: 'Unidade Diagnóstica Paulista',
      description: 'Reagentes e insumos de imagem — Competência Novembro',
      amount: '6320.00',
      dueDate: '2026-11-18',
      competence: '11/2026',
      documentNumber: 'NF-19022',
      bankAccount: 'Bradesco Saúde (Ag 2104)',
      status: 'Aprovado',
      createdByUid: 'uid-ana-bpo',
      createdByName: 'Lucas Rocha',
      approvedByUid: 'uid-sup-fin',
      approvedByName: 'Carla Mendes',
      batchCode: 'LOT-2026-092',
      idempotencyKey: 'idem-lan-8042-vidaplena',
      reconciled: true,
    },
    {
      id: 3,
      code: 'LAN-8043',
      clientId: 1,
      clientName: 'Vértice Engenharia',
      type: 'RECEBER',
      counterpartyName: 'SPE Incorporadora Parque das Águas',
      counterpartyDoc: '22.881.104/0001-05',
      category: 'Medição de Engenharia',
      costCenter: 'Obra Residencial Aurora',
      description: '6ª Medição Contratual de Execução Civil (Retenção 4,65% aplicada)',
      amount: '64200.00',
      dueDate: '2026-11-20',
      competence: '11/2026',
      documentNumber: 'NFS-e 2094',
      bankAccount: 'Itaú Empresas (Ag 0391)',
      status: 'Conciliado',
      createdByUid: 'uid-ana-bpo',
      createdByName: 'Lucas Rocha',
      approvedByUid: 'uid-sup-fin',
      approvedByName: 'Carla Mendes',
      batchCode: null,
      idempotencyKey: 'idem-lan-8043-vertice-rec',
      reconciled: true,
    },
    {
      id: 4,
      code: 'LAN-8044',
      clientId: 3,
      clientName: 'NorteSul Logística',
      type: 'RECEBER',
      counterpartyName: 'Varejo Nacional E-Commerce S.A.',
      counterpartyDoc: '03.771.902/0001-98',
      category: 'Receita de Frete Dedicado',
      costCenter: 'Hub Logístico Cajamar',
      description: 'Fatura quinzenal de distribuição last-mile',
      amount: '42800.00',
      dueDate: '2026-11-16',
      competence: '11/2026',
      documentNumber: 'FAT-8810',
      bankAccount: 'Santander Empresas (Ag 1102)',
      status: 'Em análise',
      createdByUid: 'uid-sup-fin',
      createdByName: 'Carla Mendes',
      approvedByUid: null,
      approvedByName: null,
      batchCode: null,
      idempotencyKey: 'idem-lan-8044-nortesul-rec',
      reconciled: false,
    },
    {
      id: 5,
      code: 'LAN-8045',
      clientId: 1,
      clientName: 'Vértice Engenharia',
      type: 'RECEBER',
      counterpartyName: 'Consórcio Viário Metropolitano Sul',
      counterpartyDoc: '15.702.410/0001-88',
      category: 'Medição de Engenharia',
      costCenter: 'Infraestrutura Rodoviária Lote 2',
      description: 'Liquidação de medição de terraplenagem e drenagem — Etapa Hoje',
      amount: '51800.00',
      dueDate: '2026-11-13',
      competence: '11/2026',
      documentNumber: 'NFS-e 2108',
      bankAccount: 'Itaú Empresas (Ag 0391)',
      status: 'Conciliado',
      createdByUid: 'uid-gestor-vn',
      createdByName: 'Paulo Victor',
      approvedByUid: 'uid-sup-fin',
      approvedByName: 'Carla Mendes',
      batchCode: null,
      idempotencyKey: 'idem-lan-8045-vertice-hoje',
      reconciled: true,
    },
    {
      id: 6,
      code: 'LAN-8046',
      clientId: 2,
      clientName: 'Clínica VidaPlena',
      type: 'RECEBER',
      counterpartyName: 'Operadora Saúde Bradesco Nacional',
      counterpartyDoc: '04.812.900/0001-12',
      category: 'Faturamento de Convênios',
      costCenter: 'Unidade Diagnóstica Paulista',
      description: 'Repasse de exames laboratoriais e ressonância magnética',
      amount: '38900.00',
      dueDate: '2026-11-10',
      competence: '11/2026',
      documentNumber: 'FAT-CONV-712',
      bankAccount: 'Bradesco Saúde (Ag 2104)',
      status: 'Conciliado',
      createdByUid: 'uid-ana-bpo',
      createdByName: 'Lucas Rocha',
      approvedByUid: 'uid-sup-fin',
      approvedByName: 'Carla Mendes',
      batchCode: null,
      idempotencyKey: 'idem-lan-8046-vidaplena-rec',
      reconciled: true,
    },
    {
      id: 7,
      code: 'LAN-8047',
      clientId: 4,
      clientName: 'Solaris Energia',
      type: 'RECEBER',
      counterpartyName: 'Agropecuária Santa Luzia S.A.',
      counterpartyDoc: '29.104.552/0001-31',
      category: 'Implantação Usina Solar',
      costCenter: 'Projeto Fotovoltaico 1.2 MWp',
      description: 'Parcela de comissionamento de usina solar fotovoltaica',
      amount: '29400.00',
      dueDate: '2026-10-22',
      competence: '10/2026',
      documentNumber: 'NFS-e 889',
      bankAccount: 'Banco Inter PJ (CC 8841209-4)',
      status: 'Conciliado',
      createdByUid: 'uid-ana-bpo',
      createdByName: 'Lucas Rocha',
      approvedByUid: 'uid-gestor-vn',
      approvedByName: 'Paulo Victor',
      batchCode: null,
      idempotencyKey: 'idem-lan-8047-solaris-out',
      reconciled: true,
    },
    {
      id: 8,
      code: 'LAN-8048',
      clientId: 3,
      clientName: 'NorteSul Logística',
      type: 'PAGAR',
      counterpartyName: 'PetroDiesel Distribuidora de Combustíveis Ltda',
      counterpartyDoc: '09.331.480/0001-74',
      category: 'Frota & Combustíveis',
      costCenter: 'Hub Logístico Cajamar',
      description: 'Abastecimento de frota rodoviária dedicada — Quinzena Outubro',
      amount: '16750.00',
      dueDate: '2026-10-14',
      competence: '10/2026',
      documentNumber: 'NF-77410',
      bankAccount: 'Santander Empresas (Ag 1102)',
      status: 'Conciliado',
      createdByUid: 'uid-sup-fin',
      createdByName: 'Carla Mendes',
      approvedByUid: 'uid-gestor-vn',
      approvedByName: 'Paulo Victor',
      batchCode: 'LOT-2026-084',
      idempotencyKey: 'idem-lan-8048-nortesul-out',
      reconciled: true,
    },
    {
      id: 9,
      code: 'LAN-8049',
      clientId: 4,
      clientName: 'Solaris Energia',
      type: 'PAGAR',
      counterpartyName: 'WEG Solar Equipamentos Elétricos S.A.',
      counterpartyDoc: '84.429.695/0001-11',
      category: 'Insumos de Obra',
      costCenter: 'Projeto Fotovoltaico 1.2 MWp',
      description: 'Aquisição de inversores string trifásicos e módulos 550W',
      amount: '14200.00',
      dueDate: '2026-09-18',
      competence: '09/2026',
      documentNumber: 'NF-55912',
      bankAccount: 'Banco Inter PJ (CC 8841209-4)',
      status: 'Conciliado',
      createdByUid: 'uid-ana-bpo',
      createdByName: 'Lucas Rocha',
      approvedByUid: 'uid-sup-fin',
      approvedByName: 'Carla Mendes',
      batchCode: 'LOT-2026-079',
      idempotencyKey: 'idem-lan-8049-solaris-set',
      reconciled: true,
    },
    {
      id: 10,
      code: 'LAN-8050',
      clientId: 3,
      clientName: 'NorteSul Logística',
      type: 'RECEBER',
      counterpartyName: 'Indústria Farmacêutica BioVida S.A.',
      counterpartyDoc: '61.092.440/0001-09',
      category: 'Receita de Frete Dedicado',
      costCenter: 'Cadeia Fria & Refrigerados',
      description: 'Contrato logístico de transporte refrigerado — Setembro/2026',
      amount: '58600.00',
      dueDate: '2026-09-25',
      competence: '09/2026',
      documentNumber: 'FAT-8590',
      bankAccount: 'Santander Empresas (Ag 1102)',
      status: 'Conciliado',
      createdByUid: 'uid-sup-fin',
      createdByName: 'Carla Mendes',
      approvedByUid: 'uid-gestor-vn',
      approvedByName: 'Paulo Victor',
      batchCode: null,
      idempotencyKey: 'idem-lan-8050-nortesul-set',
      reconciled: true,
    },
  ],
  paymentBatches: [
    {
      id: 1,
      code: 'LOT-2026-091',
      clientId: 1,
      clientName: 'Vértice Engenharia',
      title: 'Remessa CNAB 240 — Fornecedores de Obra (Alçada Dupla)',
      bankAccount: 'Itaú Empresas (Ag 0391 CC 44810-2)',
      totalAmount: '18450.00',
      itemsCount: 3,
      status: 'Aguardando Aprovação',
      createdByUid: 'uid-gestor-vn',
      createdByName: 'Paulo Victor',
      approvedByUid: null,
      approvedByName: null,
      approvalNotes: 'Aguardando aprovação independente (teste de Segregação de Funções).',
      idempotencyKey: 'idem-batch-091',
    },
    {
      id: 2,
      code: 'LOT-2026-092',
      clientId: 2,
      clientName: 'Clínica VidaPlena',
      title: 'Lote PIX Programado — Laboratórios e Repasses Médicos',
      bankAccount: 'Bradesco Saúde (Ag 2104 CC 9912-8)',
      totalAmount: '14920.00',
      itemsCount: 5,
      status: 'Aprovado',
      createdByUid: 'uid-ana-bpo',
      createdByName: 'Lucas Rocha',
      approvedByUid: 'uid-sup-fin',
      approvedByName: 'Carla Mendes',
      approvalNotes: 'Conferência de NFs e retenções validada pela supervisão.',
      idempotencyKey: 'idem-batch-092',
    },
    {
      id: 3,
      code: 'LOT-2026-093',
      clientId: 3,
      clientName: 'NorteSul Logística',
      title: 'Remessa Agregados & Pedágio — Filial Sudeste',
      bankAccount: 'Santander Empresas (Ag 1102 CC 130049-1)',
      totalAmount: '29150.00',
      itemsCount: 8,
      status: 'Bloqueado (Divergência Documental)',
      createdByUid: 'uid-ana-bpo',
      createdByName: 'Lucas Rocha',
      approvedByUid: null,
      approvedByName: null,
      approvalNotes: 'Bloqueado preventivamente: CT-e #9912 com chave de acesso pendente de validação SEFAZ.',
      idempotencyKey: 'idem-batch-093',
    },
  ],
  bankReconciliations: [
    {
      id: 1,
      code: 'REC-101',
      clientId: 1,
      clientName: 'Vértice Engenharia',
      bankAccount: 'Itaú Empresas (Ag 0391)',
      statementDate: '2026-11-12',
      statementDescription: 'TED RECEBIDA SPE PARQUE DAS AGUAS',
      statementAmount: '64200.00',
      linkedEntryCode: 'LAN-8043',
      ledgerAmount: '64200.00',
      differenceAmount: '0.00',
      confidenceScore: 100,
      status: 'Conciliado',
      justification: 'Correspondência exata entre extrato OFX e NFS-e 2094.',
      reviewedByName: 'Carla Mendes',
    },
    {
      id: 2,
      code: 'REC-102',
      clientId: 1,
      clientName: 'Vértice Engenharia',
      bankAccount: 'Itaú Empresas (Ag 0391)',
      statementDate: '2026-11-13',
      statementDescription: 'PAGTO BOLETO ACOFORTE SIDERURGIA',
      statementAmount: '18700.00',
      linkedEntryCode: 'LAN-8041',
      ledgerAmount: '18450.00',
      differenceAmount: '250.00',
      confidenceScore: 78,
      status: 'Com divergência',
      justification:
        'Diferença de R$ 250,00 entre extrato (R$ 18.700,00) e NF-44910 (R$ 18.450,00). Bloqueio ativo conforme Seção 13.',
      reviewedByName: 'Lucas Rocha',
    },
    {
      id: 3,
      code: 'REC-103',
      clientId: 2,
      clientName: 'Clínica VidaPlena',
      bankAccount: 'Bradesco Saúde (Ag 2104)',
      statementDate: '2026-11-13',
      statementDescription: 'PIX RECEBIDO NAO IDENTIFICADO CPF ***409**',
      statementAmount: '1280.00',
      linkedEntryCode: null,
      ledgerAmount: '0.00',
      differenceAmount: '1280.00',
      confidenceScore: 35,
      status: 'Em análise',
      justification: 'Crédito sem identificação do paciente pagador; mantido em análise (proibida baixa automática).',
      reviewedByName: 'Lucas Rocha',
    },
  ],
  financialClosings: [
    {
      id: 1,
      code: 'FEC-2026-11-CLI1',
      clientId: 1,
      clientName: 'Vértice Engenharia',
      competence: '11/2026',
      checklistProgress: 75,
      documentsStatus: 'Conferido',
      reconciliationStatus: 'Bloqueado (Divergência R$ 250,00 em REC-102)',
      dreRevenue: '312500.00',
      dreExpenses: '218400.00',
      dreNetResult: '94100.00',
      pendingJustifications:
        'Fechamento bloqueado pelo motor de consistência até resolução da diferença de R$ 250,00 em REC-102.',
      status: 'Bloqueado',
      responsibleName: 'Lucas Rocha',
      approvedByName: null,
    },
    {
      id: 2,
      code: 'FEC-2026-11-CLI2',
      clientId: 2,
      clientName: 'Clínica VidaPlena',
      competence: '11/2026',
      checklistProgress: 100,
      documentsStatus: 'Validado 100%',
      reconciliationStatus: 'Conciliado',
      dreRevenue: '189400.00',
      dreExpenses: '121300.00',
      dreNetResult: '68100.00',
      pendingJustifications: 'Competência validada e entregue com DRE reconciliada.',
      status: 'Entregue',
      responsibleName: 'Carla Mendes',
      approvedByName: 'Paulo Victor',
    },
  ],
  demandsTasks: [
    {
      id: 1,
      code: 'DEM-301',
      clientId: 1,
      clientName: 'Vértice Engenharia',
      moduleName: 'Conciliação',
      title: 'Sanear divergência de R$ 250,00 no boleto AçoForte (REC-102)',
      processName: 'PROC-FIN-008: Conciliação Bancária Diária',
      processVersion: 'v2.4',
      recurrence: 'Diária',
      checklistSummary: '4/5 itens concluídos (aguardando carta de anuência de juros/frete)',
      assignedTo: 'Lucas Rocha',
      reviewerName: 'Carla Mendes',
      dueDate: '2026-11-13',
      status: 'Com divergência',
      evidenceNotes: 'Extrato Itaú e NF-44910 anexados ao chamado PROTO-2026-1001.',
    },
    {
      id: 2,
      code: 'DEM-302',
      clientId: 2,
      clientName: 'Clínica VidaPlena',
      moduleName: 'Fechamento financeiro',
      title: 'Exportar DRE Gerencial e apresentar em reunião mensal Google Meet',
      processName: 'PROC-FIN-009: Fechamento Contábil e DRE',
      processVersion: 'v3.1',
      recurrence: 'Mensal',
      checklistSummary: '6/6 itens concluídos',
      assignedTo: 'Carla Mendes',
      reviewerName: 'Paulo Victor',
      dueDate: '2026-11-14',
      status: 'Concluído',
      evidenceNotes: 'DRE reconciliada com 100% dos lançamentos de origem.',
    },
  ],
  serviceDeskTickets: [
    {
      id: 1,
      protocolNumber: 'PROTO-2026-1001',
      internalCode: 'CHM-2026-4401',
      requesterUid: 'uid-ana-bpo',
      requesterName: 'Sistema Automático VN / Lucas Rocha',
      clientId: 1,
      clientName: 'Vértice Engenharia',
      originModule: 'Conciliação',
      originScreen: 'Conciliação Bancária Inteligente',
      affectedFeature: 'FIN-CON-008 — Validação de Diferença Extrato vs Lançamento',
      category: 'Divergências financeiras',
      subcategory: 'Conciliação inconsistente',
      title: 'Diferença de R$ 250,00 detectada entre extrato Itaú e NF-44910 (AçoForte)',
      description:
        'O motor de conciliação bloqueou o encerramento do item REC-102 pois o débito bancário foi de R$ 18.700,00 e a NF registrada é de R$ 18.450,00.',
      stepsToReproduce: '1. Acessar Conciliação Bancária CLI-001\n2. Selecionar item REC-102\n3. Acionar Conciliar',
      expectedResult: 'Diferença R$ 0,00 ou documento complementar de encargo/frete.',
      obtainedResult: 'Diferença nominal de R$ 250,00 bloqueando o fechamento mensal.',
      frequency: 'Pontual',
      priority: 'Alta',
      severity: 'S2 - Alta',
      impact: 'Bloqueia fechamento da competência 11/2026 da Vértice Engenharia.',
      blocksContinuity: true,
      assignedTo: 'Carla Mendes',
      assignedTeam: 'Supervisor financeiro',
      slaDueAt: '30m resp / 4h sol',
      evidenceNotes: 'Correlation ID corr-recon-250 vinculado automaticamente.',
      status: 'Em análise',
      originType: 'Automática',
      correlationId: 'corr-recon-250',
      appVersion: 'v3.4.2-prod',
      appliedSolution: null,
      testEvidence: null,
      validatedBy: null,
      incidentCode: 'INC-2026-01',
    },
    {
      id: 2,
      protocolNumber: 'PROTO-2026-1002',
      internalCode: 'CHM-2026-4402',
      requesterUid: 'uid-sup-fin',
      requesterName: 'Carla Mendes',
      clientId: 3,
      clientName: 'NorteSul Logística',
      originModule: 'Integrações',
      originScreen: 'Monitoramento de Conectores Bancários',
      affectedFeature: 'INT-BNK-012 — Webhook Extrato Santander',
      category: 'Integrações',
      subcategory: 'Token expirado',
      title: 'Renovação de certificado mTLS na sincronização automática Santander',
      description: 'A fila JOB-902 reportou expiração preventiva do token secundário de leitura de extratos.',
      stepsToReproduce: 'Execução agendada às 06:00 UTC do job de importação.',
      expectedResult: 'Renovação transparente via refresh token.',
      obtainedResult: 'HTTP 401 capturado e isolado na fila de retentativa.',
      frequency: 'Única',
      priority: 'Média',
      severity: 'S3 - Média',
      impact: 'Importação realizada via contingência OFX sem impacto no SLA do cliente.',
      blocksContinuity: false,
      assignedTo: 'Rafael Costa',
      assignedTeam: 'Equipe de integração',
      slaDueAt: '2h resp / 1 dia útil',
      evidenceNotes: 'Logs sanitizados anexados.',
      status: 'Resolvido',
      originType: 'Automática',
      correlationId: 'corr-int-902',
      appVersion: 'v3.4.2-prod',
      appliedSolution: 'Rotação do par de chaves mTLS e reprocessamento idempotente do job JOB-902.',
      testEvidence: 'Teste de integração executado com 0 duplicidades.',
      validatedBy: 'Paulo Victor — Diretor de Operações VN',
      incidentCode: 'INC-2026-02',
    },
  ],
  technicalIncidents: [
    {
      id: 1,
      code: 'INC-2026-01',
      affectedService: 'Motor de Consistência de Conciliação & Fechamento DRE',
      moduleName: 'Conciliação',
      version: 'v3.4.2-prod',
      environment: 'Produção',
      durationMinutes: 22,
      occurrencesCount: 1,
      impactedClientsCount: 1,
      affectedOperations: 'Conclusão de conciliação REC-102 e liberação de DRE CLI-001',
      severity: 'S2 - Alta',
      technicalError: 'RECON_DIFF_250_UNJUSTIFIED: Statement (18700.00) != Ledger (18450.00)',
      correlationId: 'corr-recon-250',
      responsibleTech: 'Carla Mendes / Rafael Costa',
      containmentMeasure: 'Bloqueio imediato do fechamento de Novembro/2026 da Vértice Engenharia para preservar integridade da DRE.',
      rootCauseSymptom: 'Boleto bancário liquidado por valor R$ 250,00 superior à Nota Fiscal de origem.',
      rootCauseTechnical: 'Taxa de frete acessório cobrada no boleto sem desmembramento prévio no lançamento LAN-8041.',
      rootCauseOperational: 'Fornecedor emitiu boleto com frete incluso após envio da NF principal.',
      fiveWhysAnalysis:
        '1. Por que a conciliação travou? Porque houve diferença de R$ 250,00.\n2. Por que o boleto tinha R$ 250,00 a mais? Porque incluiu frete de descarga.\n3. Por que o frete não estava no lançamento? Porque o CT-e chegou 24h após a NF.\n4. Por que não foi conciliado manualmente sem documento? Porque a regra Seção 13 proíbe conciliar diferença != 0 sem ajuste.\n5. Como prevenir? Validação OCR cruzada entre valor do boleto e valor da NF na entrada.',
      definitiveFix: 'Abertura automática do chamado PROTO-2026-1001 e solicitação do documento de frete complementar.',
      preventionPlan: 'Regra de comparação automática Boleto vs NF via OCR Gemini 4 Argon no recebimento documental.',
      status: 'Em contenção validada',
      validationStatus: 'Dupla validação ativa',
    },
  ],
  technicalChanges: [
    {
      id: 1,
      code: 'GMUD-2026-018',
      title: 'Implantação de Chave de Idempotência Obrigatória e Trava SoD em Lotes CNAB',
      justification: 'Impedir qualquer risco de pagamento duplicado ou autoaprovação de lotes financeiros.',
      scope: 'Módulos de Contas a Pagar, Lotes de Pagamento e Conciliação Bancária',
      affectedModules: 'Contas a pagar · Pagamentos e aprovações · Compliance e auditoria',
      risks: 'Baixo — validação aditiva em nível de repositório e banco de dados.',
      testPlan: 'Execução da suíte automatizada TST-03 (Idempotência) e TST-04 (Segregação de Funções).',
      deploymentPlan: 'Deploy blue/green sem indisponibilidade na versão v3.4.2-prod.',
      rollbackPlan: 'Reversão instantânea de feature flag e restauração de snapshot transacional.',
      approverName: 'Paulo Victor — Diretor de Operações VN',
      targetVersion: 'v3.4.2-prod',
      isEmergency: false,
      status: 'Implantada e Homologada',
    },
  ],
  knowledgeArticles: [
    {
      id: 1,
      code: 'KB-FIN-001',
      ticketProtocol: 'PROTO-2026-1001',
      title: 'Procedimento Padrão para Tratamento de Diferença entre Boleto e Nota Fiscal na Conciliação',
      problemDescription: 'Divergência nominal entre o valor debitado no extrato bancário e o lançamento originado pela Nota Fiscal.',
      rootCause: 'Cobrança de frete acessório, juros ou tarifa de boleto não discriminada na NF original.',
      howToIdentify: 'O módulo de Conciliação exibe alerta vermelho e bloqueia o botão Conciliar com código RECON_DIFF.',
      howToFix: 'Solicitar documento comprobatório da diferença, registrar lançamento complementar vinculado e reexecutar a conciliação.',
      howToPrevent: 'Utilizar o OCR Inteligente (Gemini 4 Argon) para confrontar linha digitável do boleto com o valor líquido da NF no ato do protocolo.',
      affectedModule: 'Conciliação',
      fixedVersion: 'v3.4.2-prod',
      authorName: 'Carla Mendes',
    },
  ],
  auditLogs: [
    {
      id: 1,
      eventId: 'EVT-900101',
      actorUid: 'uid-gestor-vn',
      actorName: 'Paulo Victor — Diretor de Operações VN',
      moduleName: 'Monitoramento técnico',
      operation: 'PLATFORM_BOOTSTRAP_VERIFIED',
      clientName: 'Multiempresa VN Gestão',
      correlationId: 'corr-boot-001',
      result: 'SUCESSO',
      errorCode: null,
      severity: 'INFO',
      details: 'Inicialização verificada com isolamento multiempresa, Segregação de Funções (SoD) e motor de idempotência.',
    },
    {
      id: 2,
      eventId: 'EVT-900102',
      actorUid: 'uid-ana-bpo',
      actorName: 'Lucas Rocha — Analista BPO Sênior',
      moduleName: 'Conciliação',
      operation: 'RECONCILIATION_DIVERGENCE_DETECTED',
      clientName: 'Vértice Engenharia',
      correlationId: 'corr-recon-250',
      result: 'BLOQUEADO',
      errorCode: 'RECON_DIFF_250',
      severity: 'WARN',
      details: 'Diferença de R$ 250,00 detectada em REC-102 (AçoForte). Fechamento bloqueado e protocolo PROTO-2026-1001 aberto.',
    },
  ],
  backgroundJobs: [
    {
      id: 1,
      jobCode: 'JOB-901',
      originModule: 'Conciliação',
      jobType: 'Importação e Validação de Extrato OFX Itaú',
      clientName: 'Vértice Engenharia',
      status: 'Concluído',
      attempts: 1,
      maxAttempts: 3,
      resultSummary: '48 movimentações processadas · 0 duplicidades · 1 divergência isolada (REC-102).',
      errorMessage: null,
      nextAction: 'Nenhuma ação pendente',
    },
    {
      id: 2,
      jobCode: 'JOB-902',
      originModule: 'Integrações',
      jobType: 'Sincronização CNAB / Webhook Santander Empresas',
      clientName: 'NorteSul Logística',
      status: 'Aguardando Reprocessamento',
      attempts: 2,
      maxAttempts: 3,
      resultSummary: 'Pausado preventivamente após rotação de credencial OAuth/mTLS.',
      errorMessage: 'AUTH_TOKEN_ROTATED: Requer reprocessamento idempotente autorizado.',
      nextAction: 'Acionar botão "Reprocessar Fila" para concluir sem duplicar registros',
    },
  ],
  externalIntegrations: [
    {
      id: 1,
      code: 'INT-01',
      clientName: 'Multiempresa VN Gestão',
      provider: 'Google Workspace (12 Apps OAuth2)',
      authScope: 'Gmail, Sheets, Drive, Calendar, Docs, Slides, Tasks, Chat, Forms, Keep, Meet, Contacts',
      status: 'Operacional',
      lastSyncAt: '13/11/2026 09:40',
      nextSyncAt: 'Tempo real (In-Memory Token)',
      errorCount: 0,
      attempts: 1,
      responsibleName: 'Paulo Victor',
      lastErrorMessage: null,
    },
  ],
  backupPolicy: {
    frequency: 'WAL Contínuo (5m) + Snapshot Completo a cada 6h',
    retentionDays: 1825,
    retentionLabel: '90 dias Hot + 5 anos (1.825 dias) Archive Contábil/Fiscal',
    gcsBucketUri: 'gs://vn-solucoes-bpo-backups-us-east1/cloudsql/ai-studio-17bf0707/',
    storageClass: 'Multi-Regional Standard + Coldline Archive',
    encryptionMode: 'AES-256-GCM (Google Cloud KMS Customer-Managed Key)',
    rpoTarget: '5 minutos (Point-in-Time Recovery ativo)',
    rtoTarget: '15 minutos (Failover automatizado multi-zona)',
    preUpdateAutoSnapshot: true,
    crossRegionReplication: true,
    updatedAt: '13/11/2026 06:00 UTC',
    updatedBy: 'Paulo Victor — Diretor de Operações VN',
  },
  backupLogs: [
    {
      id: 1,
      backupCode: 'BKP-20261113-0600',
      startedAt: '13/11/2026 06:00:02 UTC',
      completedAt: '13/11/2026 06:00:44 UTC',
      durationSeconds: 42,
      triggerType: 'Automático (Agendado)',
      gcsObjectUri: 'gs://vn-solucoes-bpo-backups-us-east1/cloudsql/ai-studio-17bf0707/2026-11-13T0600_full.sql.gz.enc',
      sizeMb: '148.6 MB',
      sha256Checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      encryptionStatus: 'Criptografado AES-256-GCM (KMS)',
      restoreVerificationStatus: 'Integridade SHA-256 Verificada',
      status: 'Sucesso',
      triggeredBy: 'Cloud Scheduler / Motor VN Data Protection',
      correlationId: 'corr-bkp-0600',
    },
    {
      id: 2,
      backupCode: 'BKP-20261112-2215',
      startedAt: '12/11/2026 22:15:10 UTC',
      completedAt: '12/11/2026 22:15:48 UTC',
      durationSeconds: 38,
      triggerType: 'Pré-Atualização (GMUD)',
      gcsObjectUri: 'gs://vn-solucoes-bpo-backups-us-east1/cloudsql/ai-studio-17bf0707/2026-11-12T2215_gmud018.sql.gz.enc',
      sizeMb: '146.2 MB',
      sha256Checksum: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
      encryptionStatus: 'Criptografado AES-256-GCM (KMS)',
      restoreVerificationStatus: 'Snapshot Pré-Deploy GMUD-2026-018 Homologado',
      status: 'Sucesso',
      triggeredBy: 'Paulo Victor (Gate GMUD-2026-018)',
      correlationId: 'corr-bkp-gmud18',
    },
    {
      id: 3,
      backupCode: 'RST-20261110-1400',
      startedAt: '10/11/2026 14:00:00 UTC',
      completedAt: '10/11/2026 14:08:19 UTC',
      durationSeconds: 499,
      triggerType: 'Teste de Restauração',
      gcsObjectUri: 'gs://vn-solucoes-bpo-backups-us-east1/cloudsql/ai-studio-17bf0707/restore_drill_staging.log',
      sizeMb: '144.9 MB',
      sha256Checksum: '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
      encryptionStatus: 'Descriptografia KMS Validada em Homologação',
      restoreVerificationStatus: 'RTO atingido em 8m19s (Meta < 15m) · 16/16 tabelas íntegras',
      status: 'Validado em Homologação',
      triggeredBy: 'Rafael Costa — Engenharia de Confiabilidade',
      correlationId: 'corr-restore-drill-1011',
    },
  ],
  serviceCatalog: [
    {
      id: 1,
      code: 'SRV-BPO-01',
      name: 'Gestão Diária de Contas a Pagar & Remessa Bancária CNAB/PIX',
      category: 'Operação Financeira',
      defaultRecurrence: 'Diária',
      defaultFee: '2400.00',
      slaHours: 'Até 15h00 do dia útil',
      checklistTemplate: '1. Receber NF/Boleto · 2. Validar CNPJ e retenções (4,65% PCC / ISS / INSS) · 3. Classificar centro de custo · 4. Gerar lote para aprovação',
      requiredDocuments: 'Nota Fiscal (XML/PDF), Boleto Bancário ou Dados PIX do favorecido, Pedido/Ordem de Compra',
      parameterRules: 'Bloqueio automático sem documento fiscal; exige Segregação de Funções (SoD) na aprovação do lote.',
      active: true,
    },
    {
      id: 2,
      code: 'SRV-BPO-02',
      name: 'Conciliação Bancária & Auditoria de Adquirentes / Cartões',
      category: 'Controladoria & Conciliação',
      defaultRecurrence: 'Diária',
      defaultFee: '1850.00',
      slaHours: 'D+1 até 11h00',
      checklistTemplate: '1. Importar extrato OFX/API · 2. Parear lançamentos · 3. Isolar diferenças != R$ 0,00 · 4. Abrir chamado automático se divergente',
      requiredDocuments: 'Extrato OFX/API Bancária, Relatório de Liquidação de Adquirentes (Stone/Rede/Cielo)',
      parameterRules: 'Tolerância zero para diferenças nominais (Seção 13); proibida baixa automática de PIX não identificado.',
      active: true,
    },
    {
      id: 3,
      code: 'SRV-BPO-03',
      name: 'Fechamento Financeiro Mensal, DRE Gerencial & Reunião Executiva',
      category: 'Controladoria & Estratégia',
      defaultRecurrence: 'Mensal',
      defaultFee: '2950.00',
      slaHours: 'Até o 5º dia útil do mês subsequente',
      checklistTemplate: '1. Auditar 100% das conciliações · 2. Revisar rateios por centro de custo · 3. Emitir DRE reconciliada · 4. Apresentar em reunião Google Meet',
      requiredDocuments: 'Conciliação 100% fechada, Relatório de Provisões, Folha/Encargos e Extratos de Aplicação',
      parameterRules: 'Trava automática caso exista conciliação pendente ou divergência em aberto na competência.',
      active: true,
    },
    {
      id: 4,
      code: 'SRV-BPO-04',
      name: 'Faturamento, Emissão de NFS-e & Régua Ativa de Cobrança',
      category: 'Contas a Receber',
      defaultRecurrence: 'Semanal',
      defaultFee: '1600.00',
      slaHours: 'Emissão em até 4h após medição',
      checklistTemplate: '1. Validar medição/contrato · 2. Calcular retenções na fonte · 3. Emitir NFS-e e boleto · 4. Disparar lembrete D-2 e D+3',
      requiredDocuments: 'Medição aprovada ou Contrato ativo, Dados cadastrais atualizados do tomador',
      parameterRules: 'Validação de alíquota de ISS municipal e retenções federais antes do envio ao cliente.',
      active: true,
    },
  ],
};

