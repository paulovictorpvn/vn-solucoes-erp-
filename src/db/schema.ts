import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  numeric,
} from 'drizzle-orm/pg-core';

// 1. Usuários e Segurança (8.1 & 10)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  name: text('name').notNull().default('Operador VN'),
  role: text('role').notNull().default('gestor'), // gestor | supervisor_financeiro | analista_bpo | suporte_tecnico | admin
  active: boolean('active').notNull().default(true),
  mfaEnabled: boolean('mfa_enabled').notNull().default(true),
  failedAttempts: integer('failed_attempts').notNull().default(0),
  lastLoginAt: timestamp('last_login_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 2. Empresas e Clientes BPO (8.2)
export const clients = pgTable('clients', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  tradeName: text('trade_name').notNull(),
  cnpj: text('cnpj').notNull().unique(),
  taxRegime: text('tax_regime').notNull(), // Simples Nacional | Lucro Presumido | Lucro Real
  erpSystem: text('erp_system').notNull(),
  bankAccounts: text('bank_accounts').notNull(),
  responsibleAnalyst: text('responsible_analyst').notNull(),
  particularities: text('particularities').notNull(),
  onboardingStatus: text('onboarding_status').notNull().default('Concluído'),
  status: text('status').notNull().default('Aprovado'),
  monthlyFee: numeric('monthly_fee', { precision: 12, scale: 2 }).notNull().default('0.00'),
  operationalCost: numeric('operational_cost', { precision: 12, scale: 2 }).notNull().default('0.00'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 3. CRM e Comercial (8.3)
export const crmLeads = pgTable('crm_leads', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  companyName: text('company_name').notNull(),
  cnpj: text('cnpj').notNull(),
  contactName: text('contact_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  origin: text('origin').notNull(),
  stage: text('stage').notNull().default('Diagnóstico'), // Entrada | Diagnóstico | Proposta | Negociação | Aprovado | Convertido
  estimatedValue: numeric('estimated_value', { precision: 12, scale: 2 }).notNull().default('0.00'),
  taxRegime: text('tax_regime').notNull().default('Lucro Presumido'),
  proposedServices: text('proposed_services').notNull(),
  assignedTo: text('assigned_to').notNull(),
  notes: text('notes').notNull(),
  convertedClientId: integer('converted_client_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 4. Contratos e Serviços (8.4)
export const contracts = pgTable('contracts', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  clientId: integer('client_id').notNull(),
  clientName: text('client_name').notNull(),
  packageName: text('package_name').notNull(),
  servicesScope: text('services_scope').notNull(),
  monthlyValue: numeric('monthly_value', { precision: 12, scale: 2 }).notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  adjustmentIndex: text('adjustment_index').notNull().default('IPCA'),
  version: integer('version').notNull().default(1),
  status: text('status').notNull().default('Aprovado'),
  responsibleName: text('responsible_name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 5. Lançamentos Financeiros — Contas a Pagar & Receber (8.5 & 8.6)
export const financialEntries = pgTable('financial_entries', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  clientId: integer('client_id').notNull(),
  clientName: text('client_name').notNull(),
  type: text('type').notNull(), // PAGAR | RECEBER
  counterpartyName: text('counterparty_name').notNull(),
  counterpartyDoc: text('counterparty_doc').notNull(),
  category: text('category').notNull(),
  costCenter: text('cost_center').notNull(),
  description: text('description').notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  dueDate: text('due_date').notNull(),
  competence: text('competence').notNull(),
  documentNumber: text('document_number').notNull(),
  bankAccount: text('bank_account').notNull(),
  status: text('status').notNull().default('Pendente'), // Rascunho | Pendente | Aguardando aprovação | Aprovado | Reprovado | Em processamento | Concluído | Com divergência | Bloqueado | Cancelado
  createdByUid: text('created_by_uid').notNull(),
  createdByName: text('created_by_name').notNull(),
  approvedByUid: text('approved_by_uid'),
  approvedByName: text('approved_by_name'),
  batchCode: text('batch_code'),
  idempotencyKey: text('idempotency_key').notNull().unique(),
  reconciled: boolean('reconciled').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 6. Lotes de Pagamento e Aprovações (8.7)
export const paymentBatches = pgTable('payment_batches', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  clientId: integer('client_id').notNull(),
  clientName: text('client_name').notNull(),
  title: text('title').notNull(),
  bankAccount: text('bank_account').notNull(),
  totalAmount: numeric('total_amount', { precision: 12, scale: 2 }).notNull(),
  itemsCount: integer('items_count').notNull(),
  status: text('status').notNull().default('Aguardando aprovação'), // Em análise | Aguardando aprovação | Aprovado | Reprovado | Concluído | Com divergência | Bloqueado
  createdByUid: text('created_by_uid').notNull(),
  createdByName: text('created_by_name').notNull(),
  approvedByUid: text('approved_by_uid'),
  approvedByName: text('approved_by_name'),
  approvalNotes: text('approval_notes'),
  idempotencyKey: text('idempotency_key').notNull().unique(),
  approvedAt: timestamp('approved_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 7. Conciliação Bancária (8.8)
export const bankReconciliations = pgTable('bank_reconciliations', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  clientId: integer('client_id').notNull(),
  clientName: text('client_name').notNull(),
  bankAccount: text('bank_account').notNull(),
  statementDate: text('statement_date').notNull(),
  statementDescription: text('statement_description').notNull(),
  statementAmount: numeric('statement_amount', { precision: 12, scale: 2 }).notNull(),
  linkedEntryCode: text('linked_entry_code'),
  ledgerAmount: numeric('ledger_amount', { precision: 12, scale: 2 }).notNull(),
  differenceAmount: numeric('difference_amount', { precision: 12, scale: 2 }).notNull().default('0.00'),
  confidenceScore: integer('confidence_score').notNull().default(100),
  status: text('status').notNull().default('Em análise'), // Pendente | Em análise | Concluído | Com divergência | Bloqueado
  justification: text('justification'),
  reviewedByName: text('reviewed_by_name'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 8. Fechamento Financeiro e DRE (8.9)
export const financialClosings = pgTable('financial_closings', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  clientId: integer('client_id').notNull(),
  clientName: text('client_name').notNull(),
  competence: text('competence').notNull(),
  checklistProgress: integer('checklist_progress').notNull().default(0),
  documentsStatus: text('documents_status').notNull().default('Em análise'),
  reconciliationStatus: text('reconciliation_status').notNull().default('Em análise'),
  dreRevenue: numeric('dre_revenue', { precision: 12, scale: 2 }).notNull().default('0.00'),
  dreExpenses: numeric('dre_expenses', { precision: 12, scale: 2 }).notNull().default('0.00'),
  dreNetResult: numeric('dre_net_result', { precision: 12, scale: 2 }).notNull().default('0.00'),
  pendingJustifications: text('pending_justifications'),
  status: text('status').notNull().default('Em análise'), // Em processamento | Em análise | Com divergência | Aguardando aprovação | Aprovado | Concluído | Bloqueado
  responsibleName: text('responsible_name').notNull(),
  approvedByName: text('approved_by_name'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 9. Demandas, Tarefas e Processos (8.10)
export const demandsTasks = pgTable('demands_tasks', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  clientId: integer('client_id').notNull(),
  clientName: text('client_name').notNull(),
  moduleName: text('module_name').notNull(),
  title: text('title').notNull(),
  processName: text('process_name').notNull(),
  processVersion: text('process_version').notNull().default('v2.4'),
  recurrence: text('recurrence').notNull().default('Mensal'),
  checklistSummary: text('checklist_summary').notNull(),
  assignedTo: text('assigned_to').notNull(),
  reviewerName: text('reviewer_name').notNull(),
  dueDate: text('due_date').notNull(),
  status: text('status').notNull().default('Pendente'),
  evidenceNotes: text('evidence_notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 10. VN Service Desk — Central Interna de Chamados, Incidentes e Divergências (Seção 4)
export const serviceDeskTickets = pgTable('service_desk_tickets', {
  id: serial('id').primaryKey(),
  protocolNumber: text('protocol_number').notNull().unique(),
  internalCode: text('internal_code').notNull().unique(),
  requesterUid: text('requester_uid').notNull(),
  requesterName: text('requester_name').notNull(),
  clientId: integer('client_id'),
  clientName: text('client_name').notNull().default('Plataforma Interna VN'),
  originModule: text('origin_module').notNull(),
  originScreen: text('origin_screen').notNull(),
  affectedFeature: text('affected_feature').notNull(),
  category: text('category').notNull(), // Incidentes técnicos | Divergências financeiras | Divergências cadastrais | Falhas de processo | Segurança e acesso | Integrações
  subcategory: text('subcategory').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  stepsToReproduce: text('steps_to_reproduce').notNull(),
  expectedResult: text('expected_result').notNull(),
  obtainedResult: text('obtained_result').notNull(),
  frequency: text('frequency').notNull().default('Eventual'),
  priority: text('priority').notNull().default('Normal'), // Baixa | Normal | Alta | Urgente
  severity: text('severity').notNull().default('S3'), // S1 | S2 | S3 | S4
  impact: text('impact').notNull(),
  blocksContinuity: boolean('blocks_continuity').notNull().default(false),
  assignedTo: text('assigned_to').notNull(),
  assignedTeam: text('assigned_team').notNull(),
  slaDueAt: text('sla_due_at').notNull(),
  evidenceNotes: text('evidence_notes'),
  status: text('status').notNull().default('Aberto'), // Aberto | Triagem | Classificação | Atribuição | Em análise | Em correção | Aguardando informação | Em validação | Resolvido | Encerrado | Reaberto | Encaminhado a terceiro
  originType: text('origin_type').notNull().default('Manual'), // Manual | Automática
  correlationId: text('correlation_id').notNull(),
  appVersion: text('app_version').notNull().default('v3.4.2-prod'),
  appliedSolution: text('applied_solution'),
  testEvidence: text('test_evidence'),
  validatedBy: text('validated_by'),
  incidentCode: text('incident_code'),
  closedAt: timestamp('closed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 11. VN Incident Management — Gestão de Incidentes Técnicos e Causa Raiz (Seção 5)
export const technicalIncidents = pgTable('technical_incidents', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  affectedService: text('affected_service').notNull(),
  moduleName: text('module_name').notNull(),
  version: text('version').notNull().default('v3.4.2-prod'),
  environment: text('environment').notNull().default('Produção'),
  durationMinutes: integer('duration_minutes').notNull().default(0),
  occurrencesCount: integer('occurrences_count').notNull().default(1),
  impactedClientsCount: integer('impacted_clients_count').notNull().default(1),
  affectedOperations: text('affected_operations').notNull(),
  severity: text('severity').notNull().default('S2'), // S1 | S2 | S3 | S4
  technicalError: text('technical_error').notNull(),
  correlationId: text('correlation_id').notNull(),
  responsibleTech: text('responsible_tech').notNull(),
  containmentMeasure: text('containment_measure').notNull(),
  rootCauseSymptom: text('root_cause_symptom').notNull(),
  rootCauseTechnical: text('root_cause_technical').notNull(),
  rootCauseOperational: text('root_cause_operational').notNull(),
  fiveWhysAnalysis: text('five_whys_analysis').notNull(),
  definitiveFix: text('definitive_fix').notNull(),
  preventionPlan: text('prevention_plan').notNull(),
  status: text('status').notNull().default('Em análise'),
  validationStatus: text('validation_status').notNull().default('Pendente'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 12. Gestão de Mudanças Técnicas - GMUD (5.4)
export const technicalChanges = pgTable('technical_changes', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  title: text('title').notNull(),
  justification: text('justification').notNull(),
  scope: text('scope').notNull(),
  affectedModules: text('affected_modules').notNull(),
  risks: text('risks').notNull(),
  testPlan: text('test_plan').notNull(),
  deploymentPlan: text('deployment_plan').notNull(),
  rollbackPlan: text('rollback_plan').notNull(),
  approverName: text('approver_name').notNull(),
  targetVersion: text('target_version').notNull(),
  isEmergency: boolean('is_emergency').notNull().default(false),
  status: text('status').notNull().default('Aprovado'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 13. Base de Conhecimento (4.11)
export const knowledgeArticles = pgTable('knowledge_articles', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  ticketProtocol: text('ticket_protocol').notNull(),
  title: text('title').notNull(),
  problemDescription: text('problem_description').notNull(),
  rootCause: text('root_cause').notNull(),
  howToIdentify: text('how_to_identify').notNull(),
  howToFix: text('how_to_fix').notNull(),
  howToPrevent: text('how_to_prevent').notNull(),
  affectedModule: text('affected_module').notNull(),
  fixedVersion: text('fixed_version').notNull(),
  authorName: text('author_name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 14. Trilha de Auditoria Imutável & Logs Estruturados (6.4 & 7.3)
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  eventId: text('event_id').notNull().unique(),
  actorUid: text('actor_uid').notNull(),
  actorName: text('actor_name').notNull(),
  moduleName: text('module_name').notNull(),
  operation: text('operation').notNull(),
  clientName: text('client_name').notNull().default('Global'),
  correlationId: text('correlation_id').notNull(),
  result: text('result').notNull(), // SUCESSO | FALHA | BLOQUEADO | ALERTA
  errorCode: text('error_code'),
  severity: text('severity').notNull().default('INFO'), // INFO | WARN | S1 | S2 | S3
  details: text('details').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 15. Motor de Automação, Filas e Documentos OCR (8.11 & 11)
export const backgroundJobs = pgTable('background_jobs', {
  id: serial('id').primaryKey(),
  jobCode: text('job_code').notNull().unique(),
  originModule: text('origin_module').notNull(),
  jobType: text('job_type').notNull(),
  clientName: text('client_name').notNull(),
  status: text('status').notNull().default('Concluído'), // Em processamento | Concluído | Falha no processamento | Aguardando reprocessamento
  attempts: integer('attempts').notNull().default(1),
  maxAttempts: integer('max_attempts').notNull().default(3),
  resultSummary: text('result_summary').notNull(),
  errorMessage: text('error_message'),
  nextAction: text('next_action').notNull(),
  startedAt: timestamp('started_at').defaultNow(),
  completedAt: timestamp('completed_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 16. Integrações Externas (8.12)
export const externalIntegrations = pgTable('external_integrations', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  clientName: text('client_name').notNull(),
  provider: text('provider').notNull(),
  authScope: text('auth_scope').notNull(),
  status: text('status').notNull().default('Concluído'), // Concluído | Com divergência | Falha no processamento | Em processamento
  lastSyncAt: text('last_sync_at').notNull(),
  nextSyncAt: text('next_sync_at').notNull(),
  errorCount: integer('error_count').notNull().default(0),
  attempts: integer('attempts').notNull().default(1),
  responsibleName: text('responsible_name').notNull(),
  lastErrorMessage: text('last_error_message'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
