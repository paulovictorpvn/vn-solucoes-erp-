# VN Soluções · BPO Financeiro e Serviços Administrativos

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-3.4-38BDF8.svg)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%26%20Firestore-FFCA28.svg)](https://firebase.google.com/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF.svg)](https://vitejs.dev/)

Plataforma integrada de **BPO Financeiro, Retaguarda ERP, Website Institucional, Link da Bio e Área do Cliente**, desenvolvida com foco em alta performance, usabilidade moderna (estilo Sistema Operacional) e rigor técnico.

---

## 🌟 Principais Módulos do Sistema

1. **Website Institucional & Link da Bio (`WebsiteAndClientPortal.tsx`)**
   - Sintonizado com o design system oficial da VN Soluções (Fortaleza/CE).
   - Apresentação de serviços, diferenciais, princípios inegociáveis e ecossistema de parcerias B2B.
   - **Central de Atendimento c/ Protocolo**: Geração imediata de códigos (`VN-YYMMDD-XXXX`) integrados ao VN Service Desk e CRM.
   - **Mini-Diagnóstico Interativo (Quiz)**: Autoavaliação financeira em 5 etapas para captação de leads.

2. **Área do Cliente & Parceiro (`WebsiteAndClientPortal.tsx`)**
   - Acesso restrito com usuário e senha gerados exclusivamente pela equipe VN (garantindo segurança e LGPD).
   - Painel individual por empresa cliente com extrato financeiro, boletos, conciliação e aprovação de lotes de pagamento com Segregação de Funções (SoD).

3. **Módulo de Fluxo de Caixa Diário e Mensal (`ClientCashFlowModule.tsx`)**
   - Visão comparativa **Previsto vs. Realizado** (Diária e Mensal).
   - **Contas Bancárias e Caixas**: Cadastro com **Saldo Inicial** e **Data de Início ("A partir de")**, calculando o saldo acumulado de forma automática.
   - **Projeção de Liquidez & Simulador de Estresse (15/30/60/90 dias)** com gráficos visuais em **Recharts** (`ComposedChart`, `AreaChart`).

4. **Gerenciador de CMS e Governança de Acessos (`SiteAndAccessSettingsManager.tsx`)**
   - Edição em tempo real de textos, contatos, links de WhatsApp da Bio do Instagram e visibilidade de seções do site.
   - Gestão do quadro de operadores internos da VN (Gestor, Supervisor, Analista, Comercial, Engenharia) e liberação de credenciais de empresas clientes.

5. **Retaguarda ERP & Governança Executiva (`ExecutiveBiDashboard.tsx`, `FinancialSmartHub.tsx`, etc.)**
   - Visão executiva com KPIs (Receita Mensal, Custos Operacionais, Chamados Ativos, Uptime).
   - Filtros globais de data com presets e seletores por empresa (isolamento multiempresa).
   - Módulos completos de Contas a Pagar + Extrator IA PDF, Contas a Receber + Cobrança, Conciliação OFX e Fechamento DRE.

---

## 🚀 Como Executar Localmente

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/vn-solucoes-erp.git
   cd vn-solucoes-erp
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento (Vite + Express):
   ```bash
   npm run dev
   ```

4. Acesse no navegador:
   `http://localhost:3000`

---

## 🔒 Segurança & Compliance
- **Firebase Auth & Firestore**: Autenticação segura e regras de segurança (`firestore.rules`) com validação de chaves e proteção anti-atualização.
- **Auditoria**: Trilha completa de auditoria (`audit_logs`) para todas as alterações cadastrais e financeiras.

---

## 📄 Licença
Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.
