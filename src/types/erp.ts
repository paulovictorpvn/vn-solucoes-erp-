export type ModuleKey =
  | 'overview'
  | 'clients'
  | 'crm'
  | 'contracts'
  | 'financial_payable'
  | 'financial_receivable'
  | 'payment_batches'
  | 'reconciliation'
  | 'closing_dre'
  | 'demands_processes'
  | 'service_desk'
  | 'incident_management'
  | 'system_health'
  | 'workspace_hub'
  | 'ai_intelligence'
  | 'data_protection'
  | 'client_portal_website'
  | 'cash_flow'
  | 'site_settings'
  | 'qa_security';

export interface FeatureSpec {
  code: string;
  moduleName: string;
  screenTitle: string;
  objective: string;
  allowedUsers: string;
  permissions: string;
  dataEntities: string;
  validations: string[];
  processSteps: string[];
  dependencies: string;
  possibleErrors: string;
  auditRule: string;
  notificationsRule: string;
  automatedTests: string;
  acceptanceCriteria: string;
  operationalInstructions: string;
}

export const MODULE_SPECS: Record<ModuleKey, FeatureSpec> = {
  overview: {
    code: 'GOV-EXE-001',
    moduleName: 'Rentabilidade e controladoria',
    screenTitle: 'Visão Executiva Multiempresa & Controladoria BPO',
    objective: 'Consolidar a saúde operacional dos clientes BPO, rentabilidade da carteira, aprovações críticas e chamados prioritários.',
    allowedUsers: 'Diretoria, Gestores de Operação, Supervisores Financeiros e Analistas BPO',
    permissions: 'Consultar indicadores multiempresa, filtrar contexto por cliente, auditar bloqueios e acionar contingência.',
    dataEntities: 'Empresa, Cliente, Contrato, Lançamento, Lote, Conciliação, Fechamento, Chamado, Incidente, Evento de Auditoria',
    validations: [
      'Isolamento multiempresa validado no servidor em todas as agregações',
      'Reconciliação estrita entre indicadores financeiros e lançamentos de origem',
      'Segregação entre indicadores de produtividade BPO e indicadores técnicos de plataforma',
    ],
    processSteps: [
      '1. Selecionar contexto (Global Multiempresa ou Cliente específico)',
      '2. Inspecionar fila de aprovações bancárias e divergências de conciliação',
      '3. Acompanhar SLA do VN Service Desk e saúde técnica da plataforma',
      '4. Executar decisão gerencial com confirmação no servidor e registro em trilha imutável',
    ],
    dependencies: 'Financeiro, Conciliação, Fechamento, VN Service Desk, VN System Health',
    possibleErrors: 'Divergência de saldo não conciliada, lote aguardando alçada, token de integração expirado',
    auditRule: 'Toda filtragem crítica ou ação gerencial gera evento rastreável com correlationId',
    notificationsRule: 'Alertas imediatos para chamados S1/S2 e lotes acima da alçada de R$ 15.000,00',
    automatedTests: 'Invariante de soma DRE, isolamento entre clientes e validação de alçada',
    acceptanceCriteria: 'Nenhuma operação crítica considerada concluída sem confirmação persistida no PostgreSQL',
    operationalInstructions: 'Utilize o seletor de cliente no topo para isolar instantaneamente todos os módulos ou mantenha "Visão Consolidada" para governança da carteira.',
  },
  clients: {
    code: 'CAD-CLI-002',
    moduleName: 'Empresas e clientes',
    screenTitle: 'Gestão de Empresas, Particularidades e Onboarding BPO',
    objective: 'Manter o cadastro estruturado de clientes BPO, regime tributário, bancos, analista responsável e particularidades operacionais obrigatórias.',
    allowedUsers: 'Gestores, Supervisores e Analistas de Onboarding',
    permissions: 'Consultar, Criar, Editar, Inativar (proibida exclusão física com histórico vinculado)',
    dataEntities: 'Cliente, Unidade, Conta Bancária, Particularidade, Contrato, Responsável',
    validations: [
      'Validação de formato e unicidade de CNPJ no banco de dados',
      'Obrigatoriedade de regime tributário, sistema ERP e particularidades operacionais',
      'Prevenção de duplicidade cadastral antes da liberação do onboarding',
    ],
    processSteps: [
      '1. Criar cadastro manual ou converter a partir do CRM',
      '2. Validar CNPJ e verificar ausência de duplicidade',
      '3. Registrar contas bancárias e particularidades críticas do cliente',
      '4. Definir analista responsável e liberar onboarding contratual',
    ],
    dependencies: 'CRM e comercial, Contratos e serviços, Permissões',
    possibleErrors: 'CNPJ duplicado, campos obrigatórios ausentes, conta bancária inconsistente',
    auditRule: 'Histórico completo de alterações de regime tributário e particularidades preservado',
    notificationsRule: 'Notifica supervisor financeiro e analista ao liberar novo cliente para operação',
    automatedTests: 'Bloqueio de CNPJ duplicado e integridade referencial contra exclusão',
    acceptanceCriteria: 'Particularidades do cliente visíveis em todas as telas financeiras vinculadas',
    operationalInstructions: 'Sempre consulte o campo "Particularidades do Cliente" antes de aprovar lotes ou encerrar conciliações.',
  },
  crm: {
    code: 'CRM-COM-003',
    moduleName: 'CRM e comercial',
    screenTitle: 'Pipeline Comercial, Diagnóstico BPO e Conversão Automática',
    objective: 'Gerenciar leads, diagnóstico de volume operacional, propostas e conversão direta em cliente ativo sem recadastro manual.',
    allowedUsers: 'Comercial, Diretoria e Gestores de Carteira',
    permissions: 'Consultar, Criar Lead, Atualizar Etapa, Aprovar Proposta, Converter em Cliente',
    dataEntities: 'Lead, Diagnóstico, Proposta, Cliente, Contrato',
    validations: [
      'Impedir conversão duplicada de lead já convertido',
      'Reaproveitamento integral de CNPJ, razão social, regime tributário e escopo na conversão',
    ],
    processSteps: [
      '1. Entrada do lead e identificação de origem',
      '2. Diagnóstico técnico e volumétrico da operação financeira',
      '3. Emissão de proposta e negociação de escopo',
      '4. Aprovação e conversão automática em Cliente + Contrato ativo',
    ],
    dependencies: 'Empresas e clientes, Contratos e serviços',
    possibleErrors: 'Lead já convertido, CNPJ já cadastrado na base ativa',
    auditRule: 'Registra vínculo imutável entre o código do lead original e o cliente/contrato gerado',
    notificationsRule: 'Dispara aviso de onboarding para equipe de implantação após conversão',
    automatedTests: 'Teste de ponta a ponta Lead -> Cliente -> Contrato sem perda de campos',
    acceptanceCriteria: 'Conversão cria registro em clients e contracts em transação consistente',
    operationalInstructions: 'Ao aprovar uma negociação, utilize "Converter em Cliente + Contrato" para reaproveitar automaticamente os dados diagnosticados.',
  },
  contracts: {
    code: 'CTR-SRV-004',
    moduleName: 'Contratos e serviços',
    screenTitle: 'Catálogo de Serviços, Vigência, Aditivos e Rentabilidade',
    objective: 'Controlar escopo contratado, vigência, índice de reajuste (IPCA/IGP-M/INCC), versão contratual e margem operacional por cliente.',
    allowedUsers: 'Diretoria, Controladoria e Gestores',
    permissions: 'Consultar, Criar Contrato, Registrar Aditivo, Atualizar Escopo Futuro',
    dataEntities: 'Contrato, Serviço, Pacote, Cliente, Demanda',
    validations: [
      'Mudanças contratuais atualizam rotinas futuras preservando o histórico já executado',
      'Valor mensal positivo e vigência consistente',
    ],
    processSteps: [
      '1. Selecionar pacote de serviços BPO e definir escopo',
      '2. Calcular precificação e margem frente ao custo operacional',
      '3. Registrar assinatura e ativar geração de rotinas',
    ],
    dependencies: 'Empresas e clientes, Demandas e tarefas, Rentabilidade e controladoria',
    possibleErrors: 'Escopo incompatível com regime tributário, vigência expirada sem renovação',
    auditRule: 'Versionamento de contrato a cada aditivo ou reajuste anual',
    notificationsRule: 'Alerta de vencimento contratual e janela de reajuste 30 dias antes',
    automatedTests: 'Cálculo de margem líquida por contrato e preservação de histórico',
    acceptanceCriteria: 'Contrato ativo vinculado às rotinas recorrentes do cliente',
    operationalInstructions: 'Acompanhe o comparativo entre Honorário Mensal (Fee) e Custo Operacional BPO para monitorar a rentabilidade real.',
  },
  financial_payable: {
    code: 'FIN-PAG-005',
    moduleName: 'Contas a pagar',
    screenTitle: 'Contas a Pagar, Validação Documental e Prevenção de Duplicidade',
    objective: 'Registrar despesas, validar fornecedor/documento, classificar centro de custo e encaminhar para lote de aprovação com chave idempotente.',
    allowedUsers: 'Analistas BPO, Supervisores Financeiros e Gestores',
    permissions: 'Consultar, Criar Lançamento, Classificar, Encaminhar para Aprovação',
    dataEntities: 'Lançamento, Fornecedor, Parcela, Categoria, Centro de Custo, Documento',
    validations: [
      'Valor estritamente positivo e data de vencimento válida',
      'Verificação obrigatória de chave de idempotência para impedir pagamento duplicado',
      'Associação obrigatória de número de documento fiscal/boleto e centro de custo',
    ],
    processSteps: [
      '1. Receber documento fiscal/boleto e extrair dados (manual ou OCR IA)',
      '2. Validar fornecedor, valores e ausência de duplicidade',
      '3. Classificar categoria e centro de custo conforme particularidade do cliente',
      '4. Salvar lançamento e encaminhar para lote de aprovação',
    ],
    dependencies: 'Documentos, Pagamentos e aprovações, Conciliação',
    possibleErrors: 'Tentativa de lançamento duplicado, valor inválido, fornecedor com dados bancários divergentes',
    auditRule: 'Todo lançamento criado ou rejeitado por idempotência gera registro em audit_logs',
    notificationsRule: 'Notifica supervisor quando despesa aguarda inclusão em lote',
    automatedTests: 'Rejeição determinística de payload com mesma chave de idempotência',
    acceptanceCriteria: 'Despesa persistida no PostgreSQL com status padronizado e rastreabilidade completa',
    operationalInstructions: 'O motor de idempotência impede que um clique duplo ou reenvio de formulário gere dois compromissos financeiros.',
  },
  financial_receivable: {
    code: 'FIN-REC-006',
    moduleName: 'Contas a receber',
    screenTitle: 'Contas a Receber, Faturamento, Baixas e Inadimplência',
    objective: 'Controlar receitas, faturamento de convênios/clientes pagadores, conciliação de créditos e gestão de cobrança.',
    allowedUsers: 'Analistas BPO, Supervisores Financeiros e Gestores',
    permissions: 'Consultar, Registrar Receita, Conciliar Crédito, Baixar, Encaminhar Cobrança',
    dataEntities: 'Lançamento, Pagador, Parcela, Movimentação, Conciliação',
    validations: [
      'Créditos sem identificação permanecem em análise (proibida baixa automática indevida)',
      'Valor positivo e vínculo com conta bancária do cliente',
    ],
    processSteps: [
      '1. Registrar receita prevista e identificar cliente pagador',
      '2. Acompanhar liquidação no extrato bancário',
      '3. Conciliar crédito identificado e efetuar baixa no fluxo de caixa',
    ],
    dependencies: 'Conciliação, Fechamento financeiro',
    possibleErrors: 'Recebimento não identificado no extrato, taxa de adquirente divergente',
    auditRule: 'Registro imutável de quem autorizou a baixa ou manteve crédito em análise',
    notificationsRule: 'Alerta de títulos vencidos para régua de cobrança',
    automatedTests: 'Bloqueio de baixa automática para créditos sem pagador identificado',
    acceptanceCriteria: 'Fluxo de caixa reconciliado com os lançamentos de origem',
    operationalInstructions: 'Créditos PIX/TED não identificados devem ser mantidos em "Em análise" até validação documental junto ao cliente.',
  },
  payment_batches: {
    code: 'FIN-LOT-007',
    moduleName: 'Pagamentos e aprovações',
    screenTitle: 'Lotes de Pagamento, Alçadas e Segregação de Funções (SoD)',
    objective: 'Conferir, aprovar ou reprovar lotes bancários garantindo que o executor não aprove a própria operação quando exigida independência.',
    allowedUsers: 'Supervisores Financeiros, Diretoria e Aprovadores de Cliente',
    permissions: 'Montar Lote, Conferir, Aprovar, Reprovar, Liberar Inclusão Bancária',
    dataEntities: 'Lote, Pagamento, Aprovação, Evento de Auditoria',
    validations: [
      'Segregação de Funções (Seção 10): o usuário criador do lote é bloqueado de autoaprovar como analista',
      'Qualquer alteração crítica invalida aprovações anteriores',
      'Lotes com divergência documental ficam bloqueados para liberação bancária',
    ],
    processSteps: [
      '1. Montar lote e validar dados bancários dos favorecidos',
      '2. Revisar documentos e particularidades de alçada do cliente',
      '3. Aprovar ou reprovar com parecer formal gravado em transação',
      '4. Liberar inclusão bancária e confirmar efetivação',
    ],
    dependencies: 'Contas a pagar, Conciliação, Compliance e auditoria',
    possibleErrors: 'Violação de segregação de funções, divergência entre NF e boleto no lote',
    auditRule: 'Trilha de auditoria imutável registrando UID do criador, UID do aprovador, horário e parecer',
    notificationsRule: 'Alerta imediato ao aprovação/reprovação de lote diário',
    automatedTests: 'Teste de segurança garantindo bloqueio HTTP 400 em tentativa de autoaprovação por analista',
    acceptanceCriteria: 'Aprovação persistida no banco e refletida imediatamente na trilha de auditoria',
    operationalInstructions: 'Para testar a Segregação de Funções (Seção 10), alterne o perfil simulado na aprovação ou aprove como Gestor/Supervisor independente.',
  },
  reconciliation: {
    code: 'FIN-CON-008',
    moduleName: 'Conciliação',
    screenTitle: 'Conciliação Bancária Inteligente & Tratamento de Divergências',
    objective: 'Cruzar movimentações de extrato com lançamentos do sistema, exibir score de confiança e abrir chamado automático em divergências.',
    allowedUsers: 'Analistas BPO, Supervisores Financeiros e Controladoria',
    permissions: 'Importar Extrato, Conciliar, Registrar Justificativa, Abrir Ocorrência Financeira',
    dataEntities: 'Extrato, Movimentação, Conciliação, Lançamento, Chamado',
    validations: [
      'Proibida conclusão de conciliação com diferença nominal != R$ 0,00 sem lançamento de ajuste justificado',
      'Abertura automática de chamado no VN Service Desk ao detectar tentativa de fechamento com divergência',
    ],
    processSteps: [
      '1. Importar extrato OFX/API e validar duplicidades',
      '2. Analisar correspondência sugerida e nível de confiança (%)',
      '3. Tratar divergências (ex.: diferença de R$ 250,00 em AçoForte)',
      '4. Concluir conciliação ou manter em análise com chamado vinculado',
    ],
    dependencies: 'Contas a pagar, Contas a receber, Fechamento financeiro, VN Service Desk',
    possibleErrors: 'Diferença de valor entre extrato e NF, lançamento ausente, crédito não identificado',
    auditRule: 'Registra código técnico RECON_DIFF e abre protocolo no Service Desk automaticamente',
    notificationsRule: 'Notifica supervisor financeiro sobre divergências que bloqueiam fechamento',
    automatedTests: 'Cenário obrigatório Seção 13: diferença de R$ 250,00 mantida em análise com mensagem clara',
    acceptanceCriteria: 'Nenhuma diferença financeira passa despercebida ou sem responsável atribuído',
    operationalInstructions: 'Experimente clicar em "Tentar Conciliar" no item com diferença de R$ 250,00 para ver a proteção da Seção 13 e abertura automática de chamado.',
  },
  closing_dre: {
    code: 'FIN-FEC-009',
    moduleName: 'Fechamento financeiro',
    screenTitle: 'Fechamento Financeiro Mensal, Checklist de Bloqueios e DRE',
    objective: 'Garantir que a competência contábil/financeira só seja entregue após conciliação validada, checklist cumprido e DRE reconciliada.',
    allowedUsers: 'Supervisores Financeiros, Controladoria e Diretoria',
    permissions: 'Abrir Competência, Revisar Classificações, Gerar DRE, Aprovar Fechamento, Entregar',
    dataEntities: 'Fechamento, Checklist, Conciliação, DRE, Cliente',
    validations: [
      'Bloqueio automático de fechamento quando há divergência bancária pendente na competência',
      'Exigência de justificativa formal para pendências não impeditivas',
    ],
    processSteps: [
      '1. Reunir documentos e validar 100% das conciliações bancárias',
      '2. Revisar classificações e centros de custo',
      '3. Gerar DRE Gerencial reconciliada com os registros de origem',
      '4. Aprovar com diretoria e liberar entrega ao cliente',
    ],
    dependencies: 'Conciliação, Documentos, Relatórios e dashboards',
    possibleErrors: 'Competência bloqueada por divergência bancária, DRE com pendência documental',
    auditRule: 'Entrega de DRE gera snapshot auditado com competência, autor e timestamp',
    notificationsRule: 'Notifica cliente e gestor na conclusão da entrega mensal',
    automatedTests: 'Cálculo exato de Resultado Líquido (Receitas - Despesas) sem resíduo de arredondamento',
    acceptanceCriteria: 'DRE 100% reconciliável com os lançamentos de origem do cliente',
    operationalInstructions: 'Clientes com divergência ativa na conciliação (como Vértice Engenharia) permanecem com status "Bloqueado" até o saneamento.',
  },
  demands_processes: {
    code: 'OPE-DEM-010',
    moduleName: 'Demandas e tarefas',
    screenTitle: 'Gestão de Demandas, Rotinas Recorrentes, Processos e Filas',
    objective: 'Controlar a execução padronizada de processos versionados, checklists, prazos, evidências e fila de processamento assíncrono.',
    allowedUsers: 'Toda a equipe operacional e gestores VN',
    permissions: 'Consultar, Executar Checklist, Anexar Evidência, Revisar, Reprocessar Fila',
    dataEntities: 'Demanda, Tarefa, Processo, Versão de Processo, Fila de Processamento',
    validations: [
      'Identificação imediata de tarefas com divergência, bloqueadas ou aguardando aprovação',
      'Reprocessamento de jobs em fila controlado por idempotência',
    ],
    processSteps: [
      '1. Geração automática pela recorrência contratual ou abertura manual',
      '2. Execução guiada pelo processo versionado e registro de evidência',
      '3. Revisão pelo supervisor e encerramento auditado',
    ],
    dependencies: 'Contratos e serviços, Documentos, Motor de automação e filas',
    possibleErrors: 'Falha em job externo (ex.: token expirado), checklist incompleto',
    auditRule: 'Cada execução de fila e conclusão de tarefa registra horário, tentativas e resultado',
    notificationsRule: 'Alerta sobre tarefas próximas do vencimento ou jobs na fila de falhas',
    automatedTests: 'Reprocessamento controlado de job com falha sem duplicar registros',
    acceptanceCriteria: 'Equipe sabe exatamente o que fazer, qual regra observar e quem deve revisar',
    operationalInstructions: 'Acompanhe as demandas operacionais por cliente e gerencie a Fila de Processamento Assíncrono (OCR, Sincronizações e Lotes).',
  },
  service_desk: {
    code: 'GOV-SDK-004',
    moduleName: 'VN Service Desk',
    screenTitle: 'VN Central de Incidentes — Chamados Internos, Divergências e SLA',
    objective: 'Registrar, classificar, encaminhar automaticamente, escalonar e validar a resolução de incidentes técnicos e divergências operacionais.',
    allowedUsers: 'Operadores, Analistas, Supervisores, Equipe Técnica, Gestores e Administradores',
    permissions: 'Abrir Chamado, Triar, Atribuir, Escalonar, Resolver, Validar e Encerrar',
    dataEntities: 'Chamado, Evidência, Base de Conhecimento, Incidente Vinculado',
    validations: [
      'Separação obrigatória entre Prioridade Operacional (Baixa..Urgente) e Severidade (S1..S4)',
      'Roteamento automático para equipe destino conforme categoria (Seção 4.8)',
      'Proibido encerrar chamado sem Correção Aplicada, Evidência de Teste e Validação Formal (Seção 4.12)',
    ],
    processSteps: [
      '1. Abertura manual (botão Reportar Problema) ou automática pelo sistema',
      '2. Classificação e encaminhamento automático para a equipe responsável',
      '3. Análise, contenção e aplicação da solução com evidência de teste',
      '4. Validação independente pelo solicitante/gestor e encerramento definitivo',
    ],
    dependencies: 'Todos os módulos do VN Gestão, VN Incident Management',
    possibleErrors: 'Tentativa de encerramento sem validação de teste, SLA crítico S1 próximo do limite',
    auditRule: 'Toda transição de status exige responsável, data e preserva histórico imutável',
    notificationsRule: 'S1 aciona notificação imediata ao gestor e líder técnico; S2 fila prioritária',
    automatedTests: 'Validação do bloqueio de encerramento sem evidência de teste (Seção 4.12)',
    acceptanceCriteria: 'Nenhum problema técnico ou divergência financeira fica sem responsável, prazo ou validação',
    operationalInstructions: 'Utilize os filtros gerenciais para inspecionar chamados por severidade, origem (Automática vs Manual) e valide a regra de encerramento.',
  },
  incident_management: {
    code: 'TECH-INC-005',
    moduleName: 'Monitoramento técnico',
    screenTitle: 'VN Incident Management — Causa Raiz (5 Porquês), GMUD e Base de Conhecimento',
    objective: 'Gerenciar incidentes técnicos, vincular múltiplos chamados afetados, documentar Causa Raiz (RCA) e controlar Mudanças Técnicas (GMUD).',
    allowedUsers: 'Engenharia de Plataforma, Responsável por Segurança e Diretoria VN',
    permissions: 'Registrar Incidente, Elaborar RCA 5 Porquês, Aprovar GMUD, Publicar Artigo KB',
    dataEntities: 'Incidente, Problema (RCA), Mudança Técnica (GMUD), Artigo da Base de Conhecimento',
    validations: [
      'Proibido registrar senhas, tokens ou dados sensíveis nos logs e registros de incidente (Seção 5.2)',
      'Toda mudança técnica exige plano de testes, plano de implantação e plano de reversão (Rollback)',
    ],
    processSteps: [
      '1. Correlacionar eventos e erros em um Incidente Técnico principal',
      '2. Aplicar medida de contenção imediata e mapear clientes impactados',
      '3. Executar análise estruturada dos 5 Porquês para identificar causa raiz técnica e operacional',
      '4. Aprovar GMUD com plano de reversão e publicar artigo na Base de Conhecimento',
    ],
    dependencies: 'VN Service Desk, VN System Health, Compliance e auditoria',
    possibleErrors: 'Recorrência por falta de prevenção, mudança emergencial sem revisão posterior',
    auditRule: 'Versionamento completo de GMUDs e vínculo rastreável com incidentes resolvidos',
    notificationsRule: 'Notifica gestores de carteira sobre clientes impactados e previsão de normalização',
    automatedTests: 'Sanitização de logs e integridade de vínculo Incidente <-> Chamados',
    acceptanceCriteria: 'Todo incidente S1/S2 possui análise de causa raiz, plano preventivo e artigo KB',
    operationalInstructions: 'Consulte a análise dos 5 Porquês dos incidentes ativos, aprove GMUDs com plano de rollback e pesquise soluções na Base de Conhecimento.',
  },
  system_health: {
    code: 'TECH-MON-007',
    moduleName: 'Monitoramento técnico',
    screenTitle: 'VN System Health — Observabilidade, Logs Estruturados, Backups e RPO/RTO',
    objective: 'Monitorar em tempo real a disponibilidade, latência, saúde por módulo, logs estruturados com correlationId e política de backups.',
    allowedUsers: 'Engenharia de Confiabilidade, Administradores e Diretoria',
    permissions: 'Monitorar Telemetria Real, Auditar Logs Estruturados, Verificar Backups e RPO/RTO',
    dataEntities: 'Métricas de Saúde, Evento de Auditoria / Log Estruturado, Registro de Backup',
    validations: [
      'Indicadores técnicos isolados de indicadores de produtividade da equipe BPO (Seção 14)',
      'Logs estruturados com correlationId, módulo, operação, resultado e severidade sem expor segredos',
    ],
    processSteps: [
      '1. Acompanhar disponibilidade, tempo de resposta e conexões ativas com o Cloud SQL',
      '2. Inspecionar saúde específica de cada módulo (Financeiro, Pagamentos, Importações, Integrações)',
      '3. Auditar trilha imutável de logs estruturados por correlationId',
      '4. Verificar execução de backups criptografados e testes de restauração (RPO/RTO)',
    ],
    dependencies: 'Banco de dados Cloud SQL, Motor de Filas, Integrações Externas',
    possibleErrors: 'Aumento na taxa de erros de API, fila acumulada, falha de token externo',
    auditRule: 'Trilha de auditoria append-only protegida contra alteração comum',
    notificationsRule: 'Distingue alertas informativos de incidentes críticos que exigem ação imediata',
    automatedTests: 'Verificação de conectividade Cloud SQL e integridade da tabela audit_logs',
    acceptanceCriteria: 'Visibilidade completa da estabilidade técnica da plataforma desde a fundação',
    operationalInstructions: 'Filtre os logs estruturados por severidade ou correlationId para rastrear qualquer operação de ponta a ponta.',
  },
  workspace_hub: {
    code: 'INT-WKS-012',
    moduleName: 'Integrações',
    screenTitle: 'Central Google Workspace BPO (12 Apps Integrados com Confirmação Segura)',
    objective: 'Integrar Gmail, Sheets, Drive, Calendar, Docs, Slides, Tasks, Chat, Forms, Keep, Meet e Contacts diretamente ao fluxo operacional BPO.',
    allowedUsers: 'Analistas BPO, Supervisores e Gestores autenticados com conta Google',
    permissions: 'Consultar dados autorizados via OAuth2 em memória e executar mutações mediante confirmação explícita',
    dataEntities: 'Integração, Token em Memória, Arquivos Drive, Planilhas DRE, Eventos, Tarefas, Espaços Meet/Chat',
    validations: [
      'Token OAuth2 mantido exclusivamente em memória (jamais em localStorage/sessionStorage)',
      'Confirmação explícita obrigatória do usuário antes de qualquer operação que crie, altere, envie ou exclua dados no Google Workspace',
    ],
    processSteps: [
      '1. Autenticar com o botão oficial "Sign in with Google" concedendo permissão do usuário',
      '2. Selecionar o aplicativo Google Workspace desejado (Gmail, Sheets, Drive, Calendar, Docs, Slides, Tasks, Chat, Forms, Keep, Meet, Contacts)',
      '3. Consultar itens em tempo real ou preparar ação operacional (ex.: exportar DRE para Sheets ou agendar reunião de fechamento)',
      '4. Confirmar explicitamente no modal de segurança antes de efetivar qualquer gravação externa',
    ],
    dependencies: 'Autenticação OAuth2 Google, Fechamento financeiro, Comunicação e chamados',
    possibleErrors: 'Token expirado (abre incidente se recorrente), permissão não concedida, pré-requisito de configuração do Google Chat no Console',
    auditRule: 'Toda sincronização ou criação de artefato externo registra evento em audit_logs',
    notificationsRule: 'Confirmação visual imediata com link direto para o recurso criado no Google Workspace',
    automatedTests: 'Verificação de armazenamento em memória do token e modal de confirmação pré-mutação',
    acceptanceCriteria: '12 integrações Google Workspace acessíveis com proteção de confirmação em todas as escritas',
    operationalInstructions: 'Conecte sua conta Google para listar e-mails, arquivos, agendas, tarefas e contatos reais, ou gerar planilhas DRE, contratos Docs e salas Meet.',
  },
  ai_intelligence: {
    code: 'AIA-MOD-015',
    moduleName: 'Inteligência artificial',
    screenTitle: 'VN IA — OCR de Imagens, Auditoria de Vídeo, Busca Fundamentada, Voz TTS e Áudio Lyria',
    objective: 'Acelerar a operação BPO e a controladoria com modelos Gemini server-side para leitura documental, análise de vídeo, pesquisa fiscal, briefing por voz e áudio corporativo.',
    allowedUsers: 'Analistas BPO, Controladoria, Auditores e Gestores',
    permissions: 'Executar análises de IA via rotas seguras no servidor (/api/ai/*) sem exposição de chave no navegador',
    dataEntities: 'Documento, Vídeo de Auditoria, Consulta Regulatória, Briefing de Voz WAV, Trilha Sonora MP3',
    validations: [
      '100% das chamadas @google/genai executadas no backend (server.ts) com User-Agent aistudio-build',
      'Validação humana obrigatória antes de transformar extração de IA em lançamento contábil definitivo',
    ],
    processSteps: [
      '1. Selecionar a capacidade de IA desejada (Imagem Gemini 4 Argon, Vídeo Gemini 4 Argon, Baixa Latência Gemini 3.1 Flash Lite, Google Search Gemini 4 Hydrogen, TTS Gemini 3.8 Flash TTS ou Música Lyria 3)',
      '2. Enviar arquivo ou contexto operacional do cliente para processamento no servidor',
      '3. Revisar o resultado estruturado, fontes web ou reproduzir o áudio gerado',
    ],
    dependencies: 'Documentos, Fechamento financeiro, VN Service Desk',
    possibleErrors: 'Chave de API sem faturamento para modelos pagos, arquivo acima do limite',
    auditRule: 'Cada execução de IA é registrada na trilha de auditoria e vinculada ao módulo de origem',
    notificationsRule: 'Feedback imediato de latência, modelo utilizado e resultado estruturado',
    automatedTests: 'Execução server-side de todas as 6 modalidades solicitadas pelo usuário',
    acceptanceCriteria: 'Nenhuma chave de API exposta no cliente e todas as 6 ferramentas IA operacionais',
    operationalInstructions: 'Utilize os cartões abaixo para testar OCR de notas fiscais, análise de vídeos de auditoria, consulta fiscal com Google Search, leitura em voz alta e geração de trilha sonora.',
  },
  qa_security: {
    code: 'SEC-QAT-012',
    moduleName: 'Compliance e auditoria',
    screenTitle: 'Segurança, Segregação de Funções, Testes Automatizados e Critérios de Aceite (Seções 10, 12 e 15)',
    objective: 'Validar em tempo real os invariantes de segurança, isolamento multiempresa, idempotência, segregação de funções e os 13 critérios de aceite para publicação.',
    allowedUsers: 'Diretoria, Auditoria Interna, Segurança da Informação e QA',
    permissions: 'Executar bateria de testes de integridade, auditar matriz RBAC e homologar versão',
    dataEntities: 'Usuário, Perfil, Permissão, Evento de Auditoria, Relatório de Homologação',
    validations: [
      'Verificação ativa dos 13 Critérios de Aceite da Seção 15',
      'Simulação executável de testes unitários, integração, ponta a ponta, segurança e recuperação (Seção 12)',
    ],
    processSteps: [
      '1. Inspecionar a Matriz de Permissões e Segregação de Funções (RBAC/ABAC)',
      '2. Executar a Bateria de Testes Automatizados (Unitários, Integração, E2E, Segurança e Recuperação)',
      '3. Conferir o Checklist Oficial de Publicação (13 requisitos da Seção 15)',
    ],
    dependencies: 'Todos os módulos do VN Gestão',
    possibleErrors: 'Violação de invariante de soma, tentativa de acesso cruzado entre empresas',
    auditRule: 'Toda execução da suíte de homologação registra log de conformidade',
    notificationsRule: 'Sinaliza imediatamente qualquer teste reprovado',
    automatedTests: 'Suíte interativa validando CNPJ, idempotência, SoD, rateio centesimal e transição de estados',
    acceptanceCriteria: '100% dos 13 critérios de aceite verificados e aprovados pelo gestor responsável',
    operationalInstructions: 'Execute a suíte de verificação ao vivo para comprovar matematicamente as regras de negócio e segurança da especificação.',
  },
  data_protection: {
    code: 'SEC-BKP-006',
    moduleName: 'VN Data Protection',
    screenTitle: 'VN Data Protection — Backups Cloud SQL, Retenção, Cloud Storage & RPO/RTO (Seção 6.5)',
    objective: 'Configurar a frequência, retenção, criptografia e destino Cloud Storage (GCS) dos backups do Cloud SQL, auditar logs de execução e validar testes periódicos de restauração.',
    allowedUsers: 'Engenharia de Confiabilidade, Administradores de Banco de Dados, Segurança da Informação e Diretoria',
    permissions: 'Configurar Política de Backup, Acionar Snapshot Manual, Executar Teste de Restauração em Homologação, Auditar Logs GCS',
    dataEntities: 'Política de Backup, Snapshot Cloud SQL, Bucket Cloud Storage, Log de Execução de Backup, Evento de Auditoria',
    validations: [
      'Destino Cloud Storage obrigatório em bucket redundante com criptografia AES-256-GCM / KMS',
      'Proibida redução de retenção abaixo do mínimo regulatório sem aprovação de GMUD',
      'Todo backup exige verificação de integridade (checksum SHA-256) e registro de RPO/RTO',
    ],
    processSteps: [
      '1. Definir frequência de backup (WAL contínuo + snapshots programados) e janela de retenção',
      '2. Configurar bucket de destino no Google Cloud Storage (multi-região / us-east1)',
      '3. Auditar logs de execução automática e manual com tamanho, duração e hash SHA-256',
      '4. Executar simulação de restauração em ambiente isolado de homologação para comprovar RTO/RPO',
    ],
    dependencies: 'Banco de dados Cloud SQL, Google Cloud Storage, VN System Health, Compliance e auditoria',
    possibleErrors: 'Falha de permissão IAM no bucket GCS, timeout de snapshot, checksum divergente',
    auditRule: 'Toda alteração de política de retenção ou disparo de backup/restore gera registro imutável em audit_logs',
    notificationsRule: 'Alerta crítico S1 imediato caso qualquer execução de backup falhe ou ultrapasse a janela de RPO',
    automatedTests: 'Verificação de checksum SHA-256 e teste automatizado de restore em banco de homologação',
    acceptanceCriteria: 'Backups automáticos criptografados fora do servidor principal com logs auditáveis e restauração testada',
    operationalInstructions: 'Configure abaixo a política de frequência, retenção e bucket Cloud Storage, dispare snapshots sob demanda e inspecione os logs de execução da Seção 6.5.',
  },
  client_portal_website: {
    code: 'WEB-PRT-016',
    moduleName: 'Comunicação',
    screenTitle: 'Website Institucional VN Soluções & Portal do Cliente BPO (Conectado ao ERP)',
    objective: 'Conectar o Website Comercial e a Área Exclusiva da Empresa Cliente diretamente ao núcleo do VN Gestão (CRM, Financeiro, Lotes, Demandas e Service Desk).',
    allowedUsers: 'Visitantes Comerciais, Empresas Clientes Autenticadas e Gestores VN',
    permissions: 'Solicitar Diagnóstico BPO, Consultar DRE/Fluxo da Empresa, Aprovar Lotes do Cliente, Solicitar Serviços e Abrir Chamados',
    dataEntities: 'Lead CRM, Empresa Cliente, Lote de Pagamento, Demanda Operacional, Chamado Service Desk',
    validations: [
      'Isolamento absoluto: cada empresa cliente visualiza exclusivamente seus próprios contratos, lotes, DRE e chamados',
      'Toda solicitação ou chamado aberto pelo cliente no portal reflete instantaneamente no VN Service Desk e na fila do analista',
    ],
    processSteps: [
      '1. Visitante preenche diagnóstico na Landing Page -> cria Lead automaticamente no CRM do ERP',
      '2. Empresa cliente acessa o Portal do Cliente -> visualiza DRE, lotes pendentes e serviços contratados',
      '3. Cliente aprova lote ou envia solicitação/chamado -> reflete em tempo real nos módulos internos do VN Gestão',
    ],
    dependencies: 'CRM e comercial, Empresas e clientes, Pagamentos e aprovações, VN Service Desk',
    possibleErrors: 'Credencial de cliente inativa, tentativa de aprovação sem justificativa',
    auditRule: 'Toda ação originada no Website ou Portal do Cliente recebe tag de origem externa e correlationId próprio',
    notificationsRule: 'Notifica imediatamente o analista responsável e o supervisor financeiro no ERP',
    automatedTests: 'Sincronização bidirecional Website/Portal <-> ERP em tempo real',
    acceptanceCriteria: '100% das interações feitas no Website ou Portal do Cliente aparecem imediatamente nos módulos do ERP',
    operationalInstructions: 'Alterne entre a Landing Page Institucional e a Área Logada da Empresa Cliente para testar a comunicação em tempo real com o ERP.',
  },
  cash_flow: {
    code: 'FIN-FLX-017',
    moduleName: 'Fluxo de caixa e liquidez',
    screenTitle: 'Fluxo de Caixa por Empresa Cliente — Diário, Mensal, Previsto vs. Realizado & Projeção',
    objective: 'Controlar a evolução diária e mensal de entradas e saídas, comparar valores previstos versus realizados/conciliados e projetar o saldo bancário futuro de cada empresa cliente.',
    allowedUsers: 'Diretoria, Supervisores Financeiros, Analistas BPO e Clientes (via Área do Cliente)',
    permissions: 'Consultar Fluxo Diário/Mensal, Ajustar Saldo Inicial Bancário, Simular Cenários de Liquidez, Lançar/Liquidar Títulos e Exportar Demonstrativo',
    dataEntities: 'Empresa Cliente, Conta Bancária, Saldo Inicial, Lançamento a Receber, Lançamento a Pagar, Projeção de Caixa',
    validations: [
      'Isolamento estrito de saldo inicial e movimentações por empresa cliente',
      'Separação determinística entre valores Realizados (liquidados/conciliados) e Previstos (em aberto/agendados)',
      'Alerta preventivo imediato sempre que o saldo projetado ficar abaixo do colchão mínimo de segurança',
    ],
    processSteps: [
      '1. Selecionar a empresa cliente e conferir o Saldo Bancário Inicial das contas vinculadas',
      '2. Alternar entre a visão Diária (dia a dia), Mensal (competência) ou Projeção (15/30/60/90 dias)',
      '3. Analisar o comparativo Previsto vs. Realizado e lançar ou liquidar títulos diretamente na grade',
    ],
    dependencies: 'Contas a pagar, Contas a receber, Conciliação, Fechamento financeiro, Portal do Cliente',
    possibleErrors: 'Descasamento de caixa projetado, título vencido não liquidado, saldo inicial desatualizado',
    auditRule: 'Qualquer ajuste de saldo inicial ou liquidação rápida no fluxo gera evento rastreável em audit_logs',
    notificationsRule: 'Alerta visual imediato para dias com saldo projetado negativo ou necessidade de capital de giro',
    automatedTests: 'Invariante matemática: Saldo Final = Saldo Inicial + Entradas - Saídas em todas as janelas',
    acceptanceCriteria: 'Sincronização em tempo real entre lançamentos financeiros, fluxo de caixa e Área do Cliente',
    operationalInstructions: 'Use os botões no topo do Fluxo de Caixa para alternar entre Diário, Mensal e Projeção de Cenários, ou registre uma entrada/saída rápida sem sair da tela.',
  },
  site_settings: {
    code: 'ADM-CMS-018',
    moduleName: 'Configurações do site, acessos e equipe VN',
    screenTitle: 'Central de Configurações do Site (CMS), Credenciais de Clientes & Equipe Interna VN',
    objective: 'Gerenciar em tempo real todo o conteúdo do Website Institucional (textos, WhatsApp, Bio do Instagram, serviços, FAQ, parcerias, cores e seções visíveis), as credenciais exclusivas das empresas clientes e o quadro de colaboradores internos da VN Soluções.',
    allowedUsers: 'Diretoria e Gestores Administrativos da VN Soluções',
    permissions: 'Editar Conteúdo do Site, Controlar Visibilidade de Seções, Cadastrar/Editar Colaboradores Internos VN, Emitir/Revogar Senhas de Clientes',
    dataEntities: 'Configuração CMS, Seção do Site, Colaborador Interno VN, Carteira de Clientes, Credencial de Acesso do Cliente',
    validations: [
      'Apenas colaboradores internos autorizados da VN podem criar ou alterar credenciais de empresas clientes',
      'Cada colaborador da VN possui perfil de alçada (Gestor, Supervisor, Analista, Comercial, Engenharia) e carteira de clientes definida',
      'Alterações de textos, WhatsApp, cores e visibilidade do site refletem instantaneamente no Website Público e Link da Bio',
    ],
    processSteps: [
      '1. Gerenciar a Equipe Interna da VN (cadastrar colaboradores, definir cargo/alçada e vincular empresas clientes)',
      '2. Emitir ou atualizar Usuário, Senha e Código VN-AUTH exclusivos para cada empresa cliente',
      '3. Personalizar textos, contatos, WhatsApp, serviços, FAQ, regras de parceria e seções visíveis do Website',
    ],
    dependencies: 'Website e Portal do Cliente, Empresas e clientes, Segurança e governança',
    possibleErrors: 'Colaborador bloqueado tentando aprovar lote, seção desativada sem link equivalente',
    auditRule: 'Toda criação/alteração de usuário interno VN, credencial de cliente ou publicação no site é auditada',
    notificationsRule: 'Gera Kit de Acesso formatado para envio imediato ao cliente ou colaborador via WhatsApp',
    automatedTests: 'Propagação instantânea das configurações do CMS para o Website Público (?view=site)',
    acceptanceCriteria: '100% dos textos, contatos, seções visíveis, credenciais de clientes e operadores internos da VN gerenciáveis sem código',
    operationalInstructions: 'Navegue pelas abas abaixo para gerenciar a Equipe Interna da VN, as Credenciais das Empresas Clientes e a personalização completa do Website e Link da Bio.',
  },
};

export interface ClientRecord {
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
}

export interface CrmLeadRecord {
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
  convertedClientId?: number | null;
}

export interface ContractRecord {
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
}

export interface FinancialEntryRecord {
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
  approvedByUid?: string | null;
  approvedByName?: string | null;
  batchCode?: string | null;
  idempotencyKey: string;
  reconciled: boolean;
}

export interface PaymentBatchRecord {
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
  approvedByUid?: string | null;
  approvedByName?: string | null;
  approvalNotes?: string | null;
  idempotencyKey: string;
}

export interface BankReconciliationRecord {
  id: number;
  code: string;
  clientId: number;
  clientName: string;
  bankAccount: string;
  statementDate: string;
  statementDescription: string;
  statementAmount: string;
  linkedEntryCode?: string | null;
  ledgerAmount: string;
  differenceAmount: string;
  confidenceScore: number;
  status: string;
  justification?: string | null;
  reviewedByName?: string | null;
}

export interface FinancialClosingRecord {
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
  pendingJustifications?: string | null;
  status: string;
  responsibleName: string;
  approvedByName?: string | null;
}

export interface DemandTaskRecord {
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
  evidenceNotes?: string | null;
}

export interface ServiceDeskTicketRecord {
  id: number;
  protocolNumber: string;
  internalCode: string;
  requesterUid: string;
  requesterName: string;
  clientId?: number | null;
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
  evidenceNotes?: string | null;
  status: string;
  originType: string;
  correlationId: string;
  appVersion: string;
  appliedSolution?: string | null;
  testEvidence?: string | null;
  validatedBy?: string | null;
  incidentCode?: string | null;
  createdAt?: string;
}

export interface TechnicalIncidentRecord {
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
}

export interface TechnicalChangeRecord {
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
}

export interface KnowledgeArticleRecord {
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
}

export interface AuditLogRecord {
  id: number;
  eventId: string;
  actorUid: string;
  actorName: string;
  moduleName: string;
  operation: string;
  clientName: string;
  correlationId: string;
  result: string;
  errorCode?: string | null;
  severity: string;
  details: string;
  createdAt?: string;
}

export interface BackgroundJobRecord {
  id: number;
  jobCode: string;
  originModule: string;
  jobType: string;
  clientName: string;
  status: string;
  attempts: number;
  maxAttempts: number;
  resultSummary: string;
  errorMessage?: string | null;
  nextAction: string;
}

export interface ExternalIntegrationRecord {
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
  lastErrorMessage?: string | null;
}

export interface SystemHealthMetrics {
  availabilityPct: string;
  avgResponseMs: number;
  errorRatePct: string;
  memoryUsageMb: number;
  cpuLoadPct: number;
  activeDbConnections: number;
  pendingQueues: number;
  rpoTarget: string;
  rtoTarget: string;
  lastBackupAt: string;
  lastRestoreTestAt: string;
  environment: string;
}

export interface BackupPolicyConfig {
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
}

export interface BackupExecutionLogRecord {
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
}

export interface ServiceCatalogItem {
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
}

export interface VnStaffMember {
  id: string;
  code: string;
  name: string;
  email: string;
  role: 'gestor' | 'supervisor' | 'analista' | 'comercial' | 'engenharia';
  jobTitle: string;
  department: string;
  phone: string;
  accessPin: string;
  assignedClientIds: number[] | 'ALL';
  status: 'Ativo' | 'Férias' | 'Bloqueado';
  permissionsSummary: string;
  lastActiveAt: string;
}

export interface WebsiteServiceCardConfig {
  id: string;
  tag: string;
  title: string;
  summary: string;
  bullets: string[];
  deliverable: string;
}

export interface WebsiteFaqItemConfig {
  id: string;
  q: string;
  a: string;
}

export interface WebsiteCmsConfig {
  brandTagline: string;
  heroBadge: string;
  heroTitle: string;
  heroHighlightWord: string;
  heroSubtitle: string;
  whatsappNumber: string;
  whatsappDisplay: string;
  commercialEmail: string;
  instagramHandle: string;
  cityState: string;
  businessHours: string;
  accentColor: string;
  partnerBonusPercent: number;
  partnerBonusRules: string;
  diagnosticTitle: string;
  diagnosticSubtitle: string;
  visibleSections: {
    quemSomos: boolean;
    principios: boolean;
    diferenciais: boolean;
    servicos: boolean;
    metodologia: boolean;
    parcerias: boolean;
    portalErp: boolean;
    diagnostico: boolean;
    atendimento: boolean;
    guiaRapido: boolean;
    faq: boolean;
  };
  services: WebsiteServiceCardConfig[];
  faqs: WebsiteFaqItemConfig[];
}

export const DEFAULT_VN_STAFF: VnStaffMember[] = [
  {
    id: 'vn-staff-1',
    code: 'OP-VN-01',
    name: 'Paulo Victor Nicolau',
    email: 'paulovictor85571590@gmail.com',
    role: 'gestor',
    jobTitle: 'Diretor Geral & Gestor de Operações BPO',
    department: 'Diretoria & Controladoria',
    phone: '(85) 99988-0101',
    accessPin: 'VN-MASTER-01',
    assignedClientIds: 'ALL',
    status: 'Ativo',
    permissionsSummary: 'Alçada Plena · Aprovação de Lotes, Configurações do Site, Equipe e Fechamento DRE',
    lastActiveAt: 'Online agora',
  },
  {
    id: 'vn-staff-2',
    code: 'OP-VN-02',
    name: 'Mariana Costa',
    email: 'mariana.costa@vnsolucoes.com.br',
    role: 'supervisor',
    jobTitle: 'Supervisora Financeira & Revisora Independente',
    department: 'Supervisão BPO & Conciliação',
    phone: '(85) 99988-0202',
    accessPin: 'VN-SUP-2026',
    assignedClientIds: 'ALL',
    status: 'Ativo',
    permissionsSummary: 'Revisão Independente (SoD) · Aprovação de Lotes, Conciliação e Fechamento Mensal',
    lastActiveAt: 'Há 8 minutos',
  },
  {
    id: 'vn-staff-3',
    code: 'OP-VN-03',
    name: 'Lucas Albuquerque',
    email: 'lucas.bpo@vnsolucoes.com.br',
    role: 'analista',
    jobTitle: 'Analista BPO Financeiro Sênior',
    department: 'Operação Contas a Pagar & Receber',
    phone: '(85) 99988-0303',
    accessPin: 'VN-ANA-3030',
    assignedClientIds: [1, 2],
    status: 'Ativo',
    permissionsSummary: 'Execução Operacional · Lançamentos, Triagem de Boletos/NFs, Preparação de Lotes',
    lastActiveAt: 'Há 14 minutos',
  },
  {
    id: 'vn-staff-4',
    code: 'OP-VN-04',
    name: 'Camila Fontenele',
    email: 'camila.bpo@vnsolucoes.com.br',
    role: 'analista',
    jobTitle: 'Analista BPO & Faturamento Clínico/Serviços',
    department: 'Operação Contas a Receber & Conciliação',
    phone: '(85) 99988-0404',
    accessPin: 'VN-ANA-4040',
    assignedClientIds: [2, 3],
    status: 'Ativo',
    permissionsSummary: 'Execução Operacional · Contas a Receber, Conciliação OFX e Atendimento ao Cliente',
    lastActiveAt: 'Há 25 minutos',
  },
  {
    id: 'vn-staff-5',
    code: 'OP-VN-05',
    name: 'Rafael Montenegro',
    email: 'comercial@vnsolucoes.com.br',
    role: 'comercial',
    jobTitle: 'Executivo Comercial & Parcerias B2B',
    department: 'Comercial, Diagnóstico & Onboarding',
    phone: '(85) 99988-0505',
    accessPin: 'VN-COM-5050',
    assignedClientIds: 'ALL',
    status: 'Ativo',
    permissionsSummary: 'CRM Comercial · Triagem de Leads do Site, Propostas e Programa de Parcerias',
    lastActiveAt: 'Há 1 hora',
  },
];

export const DEFAULT_WEBSITE_CMS_CONFIG: WebsiteCmsConfig = {
  brandTagline: 'Mais que serviços, uma parceria para o seu negócio.',
  heroBadge: 'VN Soluções · BPO Financeiro & Gestão Administrativa',
  heroTitle: 'Clareza financeira, rotina sob controle e tempo livre para você crescer.',
  heroHighlightWord: 'parceria',
  heroSubtitle:
    'Assumimos o operacional financeiro da sua empresa — contas a pagar, contas a receber, conciliação bancária diária, fluxo de caixa e DRE comentada — com processo auditável, tecnologia própria e atendimento próximo.',
  whatsappNumber: '5585999990000',
  whatsappDisplay: '(85) 99999-0000',
  commercialEmail: 'contato@vnsolucoes.com.br',
  instagramHandle: '@vnsolucoes',
  cityState: 'Fortaleza · CE (Atendimento Nacional Digital)',
  businessHours: 'Segunda a Sexta · 08h00 às 18h00',
  accentColor: '#FA670D',
  partnerBonusPercent: 15,
  partnerBonusRules:
    'Indique uma empresa parceira para o BPO Financeiro da VN Soluções: a cada contrato fechado, você recebe 15% de desconto progressivo na sua mensalidade (cumulativo até 100%) ou repasse recorrente de parceiro indicador.',
  diagnosticTitle: 'Descubra em 60 segundos o nível de maturidade financeira da sua empresa',
  diagnosticSubtitle:
    'Responda 5 perguntas rápidas e receba um diagnóstico imediato com plano de ação recomendado pela VN Soluções.',
  visibleSections: {
    quemSomos: true,
    principios: true,
    diferenciais: true,
    servicos: true,
    metodologia: true,
    parcerias: true,
    portalErp: true,
    diagnostico: true,
    atendimento: true,
    guiaRapido: true,
    faq: true,
  },
  services: [
    {
      id: 'srv-pagar',
      tag: 'ROTINA DIÁRIA',
      title: 'Contas a Pagar & Agendamento Bancário',
      summary:
        'Recebemos notas e boletos, conferimos retenções fiscais, classificamos por centro de custo e deixamos tudo agendado no seu banco para você apenas autorizar.',
      bullets: [
        'Triagem diária de boletos, NFs e comprovantes',
        'Agendamento bancário com Segregação de Funções (SoD)',
        'Zero multas por esquecimento ou pagamento em duplicidade',
      ],
      deliverable: 'Lotes diários conferidos + comprovantes arquivados por competência',
    },
    {
      id: 'srv-receber',
      tag: 'LIQUIDEZ & COBRANÇA',
      title: 'Contas a Receber, Faturamento & Régua Ativa',
      summary:
        'Emitimos notas fiscais e boletos, controlamos recebimentos PIX/cartão/convênios e executamos a régua preventiva de cobrança com cordialidade.',
      bullets: [
        'Emissão de NFS-e e boletos registrados conforme contrato',
        'Baixa diária de créditos identificados no extrato',
        'Lembretes preventivos antes e após o vencimento',
      ],
      deliverable: 'Relatório semanal de carteira a receber e controle de inadimplência',
    },
    {
      id: 'srv-conciliacao',
      tag: 'PRECISÃO CENTESIMAL',
      title: 'Conciliação Bancária Diária (OFX / API)',
      summary:
        'Cruzamos centavo por centavo o extrato de todas as contas bancárias e adquirentes com os lançamentos do sistema, apontando qualquer divergência na hora.',
      bullets: [
        'Conciliação diária de múltiplas contas e bancos',
        'Auditoria de taxas de maquininha e tarifas bancárias',
        'Nenhum lançamento encerrado com diferença sem justificativa',
      ],
      deliverable: 'Saldos bancários 100% auditados e prontos para a contabilidade',
    },
    {
      id: 'srv-fluxo',
      tag: 'VISÃO DE FUTURO',
      title: 'Fluxo de Caixa Diário, Mensal & Projetado',
      summary:
        'Saiba exatamente quanto vai entrar, quanto vai sair e qual será o saldo do caixa nos próximos 15, 30, 60 e 90 dias, comparando Previsto vs. Realizado.',
      bullets: [
        'Visão diária e mensal de geração líquida de caixa',
        'Comparativo claro entre Previsto e Realizado',
        'Simulação de cenários para tomada de decisão segura',
      ],
      deliverable: 'Painel de Fluxo de Caixa atualizado em tempo real no Portal do Cliente',
    },
    {
      id: 'srv-dre',
      tag: 'CONTROLADORIA',
      title: 'Fechamento Mensal & DRE Gerencial Comentada',
      summary:
        'Transformamos números soltos em um relatório executivo claro: margem de contribuição, ponto de equilíbrio, evolução de custos e reunião mensal de resultados.',
      bullets: [
        'DRE gerencial por competência e regime de caixa',
        'Análise horizontal e vertical de despesas por centro de custo',
        'Integração limpa com a sua contabilidade fiscal',
      ],
      deliverable: 'Book de Fechamento Mensal + DRE Comentada até o 5º dia útil',
    },
    {
      id: 'srv-adm',
      tag: 'APOIO EXECUTIVO',
      title: 'Serviços Administrativos & Organização Digital',
      summary:
        'Apoiamos a rotina administrativa da sua empresa com organização de contratos, dossiês de fornecedores, integração com contabilidade e suporte dedicado.',
      bullets: [
        'Gestão de contratos, reajustes e certidões',
        'Arquivo digital organizado e auditável na nuvem',
        'Atendimento direto com protocolo rastreável na Área do Cliente',
      ],
      deliverable: 'Operação administrativa enxuta, organizada e sem gargalos',
    },
  ],
  faqs: [
    {
      id: 'faq-1',
      q: 'A VN Soluções movimenta o dinheiro da minha conta bancária?',
      a: 'Não. Trabalhamos com Segregação Estrita de Funções (SoD): nossa equipe opera com perfil de preparador/operador (agenda o pagamento e anexa a nota fiscal/boleto), e somente o sócio ou diretor da sua empresa autoriza a liberação final no aplicativo do banco ou no Portal do Cliente.',
    },
    {
      id: 'faq-2',
      q: 'Como funciona o acesso à Área do Cliente? Qualquer pessoa pode se cadastrar?',
      a: 'Por segurança bancária e sigilo empresarial, não existe auto-cadastro público. O usuário, a senha e o Código de Autorização (VN-AUTH) são gerados exclusivamente de forma interna pela nossa equipe de controladoria e entregues diretamente ao responsável pela empresa cliente.',
    },
    {
      id: 'faq-3',
      q: 'O BPO Financeiro substitui o meu contador?',
      a: 'Não — somos parceiros estratégicos do seu contador! Enquanto o contador cuida da apuração fiscal, tributária e trabalhista, a VN Soluções assume a gestão financeira diária (contas a pagar, receber, conciliação e fluxo de caixa) e entrega toda a movimentação já conciliada e organizada para a contabilidade.',
    },
    {
      id: 'faq-4',
      q: 'Como acompanho o Fluxo de Caixa e abro solicitações no dia a dia?',
      a: 'Você recebe acesso exclusivo à Área do Cliente VN Soluções, onde acompanha em tempo real seu Fluxo de Caixa (Diário e Mensal), aprova lotes de pagamento, consulta sua DRE e abre chamados com número de protocolo imediato.',
    },
  ],
};

export interface ClientBankAndCashAccount {
  id: string;
  clientId: number;
  clientName: string;
  accountName: string;
  accountType: 'CONTA_CORRENTE' | 'CAIXA_INTERNO' | 'INVESTIMENTO';
  bankInstitution: string;
  agencyAndAccount: string;
  initialBalance: number;
  initialBalanceDate: string; // YYYY-MM-DD ("Saldo inicial a partir de")
  active: boolean;
}

export const DEFAULT_CLIENT_BANK_ACCOUNTS: ClientBankAndCashAccount[] = [
  {
    id: 'acc-atlas-1',
    clientId: 1,
    clientName: 'Atlas Engenharia',
    accountName: 'Itaú Empresas (Movimento Principal)',
    accountType: 'CONTA_CORRENTE',
    bankInstitution: '341 · Itaú Unibanco',
    agencyAndAccount: 'Ag 0412 · CC 88410-2',
    initialBalance: 64500,
    initialBalanceDate: '2026-11-01',
    active: true,
  },
  {
    id: 'acc-atlas-2',
    clientId: 1,
    clientName: 'Atlas Engenharia',
    accountName: 'Caixa Interno de Obras & Tesouraria',
    accountType: 'CAIXA_INTERNO',
    bankInstitution: 'Caixa Físico / Fundo Fixo',
    agencyAndAccount: 'CX-OBRAS-01',
    initialBalance: 20000,
    initialBalanceDate: '2026-11-01',
    active: true,
  },
  {
    id: 'acc-vida-1',
    clientId: 2,
    clientName: 'Clínica Vida Plena',
    accountName: 'Unicred Saúde (Conta Convênios & PIX)',
    accountType: 'CONTA_CORRENTE',
    bankInstitution: '136 · Unicred',
    agencyAndAccount: 'Ag 2104 · CC 44120-9',
    initialBalance: 54300,
    initialBalanceDate: '2026-11-01',
    active: true,
  },
  {
    id: 'acc-vida-2',
    clientId: 2,
    clientName: 'Clínica Vida Plena',
    accountName: 'Caixa Recepção Clínica',
    accountType: 'CAIXA_INTERNO',
    bankInstitution: 'Caixa Interno Recepção',
    agencyAndAccount: 'CX-CLIN-01',
    initialBalance: 8000,
    initialBalanceDate: '2026-11-01',
    active: true,
  },
  {
    id: 'acc-vertice-1',
    clientId: 3,
    clientName: 'Vértice Tech SaaS',
    accountName: 'BTG Pactual Empresas (Recebíveis SaaS)',
    accountType: 'CONTA_CORRENTE',
    bankInstitution: '208 · BTG Pactual',
    agencyAndAccount: 'Ag 0001 · CC 709123-5',
    initialBalance: 98400,
    initialBalanceDate: '2026-11-01',
    active: true,
  },
  {
    id: 'acc-vertice-2',
    clientId: 3,
    clientName: 'Vértice Tech SaaS',
    accountName: 'CDB Liquidez Diária (Reserva de Caixa)',
    accountType: 'INVESTIMENTO',
    bankInstitution: '208 · BTG Pactual',
    agencyAndAccount: 'INV-CDB-DI',
    initialBalance: 20000,
    initialBalanceDate: '2026-11-01',
    active: true,
  },
];



