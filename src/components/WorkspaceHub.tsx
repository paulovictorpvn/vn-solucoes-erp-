import React, { useState } from 'react';
import {
  Mail,
  FileSpreadsheet,
  FolderOpen,
  Calendar,
  FileText,
  Presentation,
  CheckSquare,
  MessageSquare,
  ClipboardList,
  StickyNote,
  Video,
  Users,
  RefreshCw,
  Send,
  Plus,
  ExternalLink,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';

interface WorkspaceHubProps {
  accessToken: string | null;
  userEmail: string | null;
  selectedClientName: string;
  onLoginClick: () => Promise<void>;
  isLoggingIn: boolean;
  onRecordAction: (title: string, details: string) => void;
}

type WorkspaceAppId =
  | 'gmail'
  | 'sheets'
  | 'drive'
  | 'calendar'
  | 'docs'
  | 'slides'
  | 'tasks'
  | 'chat'
  | 'forms'
  | 'keep'
  | 'contacts';

interface PendingMutation {
  appName: string;
  actionTitle: string;
  description: string;
  affectedItem: string;
  execute: () => Promise<void>;
}

export const WorkspaceHub: React.FC<WorkspaceHubProps> = ({
  accessToken,
  userEmail,
  selectedClientName,
  onLoginClick,
  isLoggingIn,
  onRecordAction,
}) => {
  const [activeApp, setActiveApp] = useState<WorkspaceAppId>('gmail');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [items, setItems] = useState<Array<{ id: string; title: string; subtitle: string; link?: string }>>([]);

  // Formulários operacionais para cada app
  const [emailTo, setEmailTo] = useState('financeiro@cliente-bpo.com.br');
  const [emailSubject, setEmailSubject] = useState(`Fechamento DRE & Conciliação — ${selectedClientName}`);
  const [emailBody, setEmailBody] = useState(
    `Prezado cliente (${selectedClientName}),\n\nSegue resumo de conciliação bancária e DRE auditada pelo VN Gestão ERP.\n\nAtenciosamente,\nControladoria VN Soluções`
  );
  const [resourceTitle, setResourceTitle] = useState(`VN Gestão — ${selectedClientName} (Nov/2026)`);
  const [keepLocalNotes, setKeepLocalNotes] = useState<Array<{ id: string; title: string; body: string; updated: string }>>([
    {
      id: 'KEEP-01',
      title: 'Checklist de Aprovação Dupla — Horizonte Logística',
      body: 'Lotes acima de R$ 15.000,00 exigem validação prévia de centro de custo de frota e dupla assinatura.',
      updated: '13/11/2026 08:40',
    },
    {
      id: 'KEEP-02',
      title: 'Regra de Conciliação — Vértice Engenharia',
      body: 'Conferir retenções de ISS/INSS/IRRF antes de liberar pagamento de empreiteiros no Banco do Brasil.',
      updated: '13/11/2026 09:15',
    },
  ]);

  // Modal de Confirmação Obrigatória para operações que criam/modificam/enviam dados do usuário
  const [pendingMutation, setPendingMutation] = useState<PendingMutation | null>(null);

  const apps: Array<{ id: WorkspaceAppId; label: string; scopeSummary: string; icon: React.ReactNode }> = [
    { id: 'gmail', label: 'Gmail', scopeSummary: 'Leitura e envio de alertas BPO', icon: <Mail className="w-4 h-4" /> },
    { id: 'sheets', label: 'Google Sheets', scopeSummary: 'Planilhas de Caixa e DRE', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: 'drive', label: 'Google Drive', scopeSummary: 'Pastas fiscais e comprovantes', icon: <FolderOpen className="w-4 h-4" /> },
    { id: 'calendar', label: 'Google Calendar', scopeSummary: 'Agenda de fechamento e lotes', icon: <Calendar className="w-4 h-4" /> },
    { id: 'docs', label: 'Google Docs', scopeSummary: 'Contratos e atas de fechamento', icon: <FileText className="w-4 h-4" /> },
    { id: 'slides', label: 'Google Slides', scopeSummary: 'Apresentações executivas DRE', icon: <Presentation className="w-4 h-4" /> },
    { id: 'tasks', label: 'Google Tasks', scopeSummary: 'Checklists operacionais diários', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'chat', label: 'Google Chat', scopeSummary: 'Salas de resposta a incidentes', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'forms', label: 'Google Forms', scopeSummary: 'Diagnóstico e onboarding BPO', icon: <ClipboardList className="w-4 h-4" /> },
    { id: 'keep', label: 'Google Keep', scopeSummary: 'Notas de particularidades', icon: <StickyNote className="w-4 h-4" /> },
    { id: 'contacts', label: 'Contacts', scopeSummary: 'Diretório de decisores e sócios', icon: <Users className="w-4 h-4" /> },
  ];

  const fetchWorkspaceData = async (appId: WorkspaceAppId) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (appId === 'keep') {
      setItems(
        keepLocalNotes.map((n) => ({
          id: n.id,
          title: n.title,
          subtitle: `${n.body} · Atualizado em ${n.updated}`,
        }))
      );
      return;
    }

    if (!accessToken) {
      setErrorMsg('Conecte sua conta Google no botão acima para consultar dados ao vivo com sua permissão.');
      return;
    }

    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${accessToken}` };

      if (appId === 'gmail') {
        const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=6', { headers });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || 'Erro ao consultar Gmail.');
        const list = data.messages || [];
        const details = await Promise.all(
          list.slice(0, 5).map(async (m: { id: string }) => {
            const dRes = await fetch(
              `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From`,
              { headers }
            );
            const dJson = await dRes.json();
            const headersArr: Array<{ name: string; value: string }> = dJson.payload?.headers || [];
            const subj = headersArr.find((h) => h.name === 'Subject')?.value || '(Sem assunto)';
            const from = headersArr.find((h) => h.name === 'From')?.value || '';
            return { id: m.id, title: subj, subtitle: `De: ${from}` };
          })
        );
        setItems(details);
      } else if (appId === 'drive' || appId === 'sheets' || appId === 'docs' || appId === 'slides' || appId === 'forms') {
        const mimeFilter =
          appId === 'sheets'
            ? "mimeType='application/vnd.google-apps.spreadsheet'"
            : appId === 'docs'
            ? "mimeType='application/vnd.google-apps.document'"
            : appId === 'slides'
            ? "mimeType='application/vnd.google-apps.presentation'"
            : appId === 'forms'
            ? "mimeType='application/vnd.google-apps.form'"
            : 'trashed=false';
        const res = await fetch(
          `https://www.googleapis.com/drive/v3/files?pageSize=8&q=${encodeURIComponent(mimeFilter)}&fields=files(id,name,mimeType,modifiedTime,webViewLink)`,
          { headers }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || 'Erro ao consultar arquivos.');
        setItems(
          (data.files || []).map((f: { id: string; name: string; mimeType: string; modifiedTime?: string; webViewLink?: string }) => ({
            id: f.id,
            title: f.name,
            subtitle: `${f.mimeType.split('.').pop()} · Modificado: ${f.modifiedTime ? new Date(f.modifiedTime).toLocaleDateString('pt-BR') : 'Recente'}`,
            link: f.webViewLink,
          }))
        );
      } else if (appId === 'calendar') {
        const res = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=6&singleEvents=true&orderBy=startTime&timeMin=${encodeURIComponent(
            new Date().toISOString()
          )}`,
          { headers }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || 'Erro ao consultar Google Calendar.');
        setItems(
          (data.items || []).map((ev: { id: string; summary?: string; start?: { dateTime?: string; date?: string }; htmlLink?: string }) => ({
            id: ev.id,
            title: ev.summary || 'Compromisso de Fechamento',
            subtitle: `Início: ${ev.start?.dateTime || ev.start?.date || 'Agendado'}`,
            link: ev.htmlLink,
          }))
        );
      } else if (appId === 'tasks') {
        const res = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists?maxResults=6', { headers });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || 'Erro ao consultar Google Tasks.');
        setItems(
          (data.items || []).map((t: { id: string; title: string; updated?: string }) => ({
            id: t.id,
            title: t.title,
            subtitle: `Lista de Tarefas BPO · Atualizada em ${t.updated ? new Date(t.updated).toLocaleDateString('pt-BR') : 'Hoje'}`,
          }))
        );
      } else if (appId === 'chat') {
        const res = await fetch('https://chat.googleapis.com/v1/spaces?pageSize=6', { headers });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(
            data.error?.message ||
              'Google Chat app not found. Configure o Chat App no Google Cloud Console (veja link abaixo).'
          );
        }
        setItems(
          (data.spaces || []).map((s: { name: string; displayName?: string; spaceType?: string }) => ({
            id: s.name,
            title: s.displayName || s.name,
            subtitle: `Espaço Google Chat · Tipo: ${s.spaceType || 'SPACE'}`,
          }))
        );
      } else if (appId === 'contacts') {
        const res = await fetch(
          'https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,organizations&pageSize=8',
          { headers }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || 'Erro ao consultar Google Contacts.');
        setItems(
          (data.connections || []).map(
            (c: {
              resourceName: string;
              names?: Array<{ displayName?: string }>;
              emailAddresses?: Array<{ value?: string }>;
              organizations?: Array<{ name?: string }>;
            }) => ({
              id: c.resourceName,
              title: c.names?.[0]?.displayName || 'Contato Comercial',
              subtitle: `${c.emailAddresses?.[0]?.value || 'Sem e-mail'} · ${c.organizations?.[0]?.name || 'Cliente'}`,
            })
          )
        );
      }
      onRecordAction(`WORKSPACE_FETCH_${appId.toUpperCase()}`, `Consulta realizada no aplicativo ${appId} para ${selectedClientName}.`);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Erro ao comunicar com a API do Google Workspace.');
    } finally {
      setLoading(false);
    }
  };

  // Prepara mutação sempre exigindo confirmação explícita do usuário
  const requestConfirmedExecution = () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (activeApp === 'keep') {
      setPendingMutation({
        appName: 'Google Keep / Notas Operacionais VN',
        actionTitle: 'Adicionar Nota de Particularidade Operacional',
        description: `Deseja registrar a nota "${resourceTitle}" no caderno de particularidades de ${selectedClientName}?`,
        affectedItem: resourceTitle,
        execute: async () => {
          const newNote = {
            id: `KEEP-0${keepLocalNotes.length + 1}`,
            title: resourceTitle,
            body: `Particularidade validada para o cliente ${selectedClientName}.`,
            updated: new Date().toLocaleString('pt-BR'),
          };
          setKeepLocalNotes([newNote, ...keepLocalNotes]);
          setSuccessMsg(`Nota "${resourceTitle}" adicionada com sucesso.`);
          onRecordAction('CREATE_KEEP_NOTE', `Nota operacional registrada: ${resourceTitle}`);
        },
      });
      return;
    }

    if (!accessToken) {
      setErrorMsg('Autentique-se primeiro com o botão "Sign in with Google" antes de executar ações de criação ou envio.');
      return;
    }

    const appConfig = apps.find((a) => a.id === activeApp);

    setPendingMutation({
      appName: appConfig?.label || activeApp,
      actionTitle:
        activeApp === 'gmail'
          ? `Enviar E-mail via Gmail para ${emailTo}`
          : `Criar Recurso em ${appConfig?.label}: "${resourceTitle}"`,
      description:
        activeApp === 'gmail'
          ? `Confirma o envio do e-mail "${emailSubject}" em seu nome para ${emailTo}?`
          : `Confirma a criação do item "${resourceTitle}" em sua conta do ${appConfig?.label}?`,
      affectedItem: activeApp === 'gmail' ? `${emailTo} — ${emailSubject}` : resourceTitle,
      execute: async () => {
        setLoading(true);
        try {
          const headers = {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          };

          if (activeApp === 'gmail') {
            const rawLines = [
              `To: ${emailTo}`,
              `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(emailSubject)))}?=`,
              'Content-Type: text/plain; charset="UTF-8"',
              '',
              emailBody,
            ];
            const base64EncodedEmail = btoa(unescape(encodeURIComponent(rawLines.join('\r\n'))))
              .replace(/\+/g, '-')
              .replace(/\//g, '_')
              .replace(/=+$/, '');

            const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
              method: 'POST',
              headers,
              body: JSON.stringify({ raw: base64EncodedEmail }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error?.message || 'Falha ao enviar e-mail.');
            setSuccessMsg(`E-mail enviado com sucesso! ID da mensagem: ${data.id}`);
          } else if (activeApp === 'sheets') {
            const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
              method: 'POST',
              headers,
              body: JSON.stringify({
                properties: { title: resourceTitle },
              }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error?.message || 'Falha ao criar planilha.');
            setSuccessMsg(`Planilha criada com sucesso: ${data.spreadsheetUrl}`);
            setItems((prev) => [
              { id: data.spreadsheetId, title: resourceTitle, subtitle: 'Nova planilha DRE BPO criada agora', link: data.spreadsheetUrl },
              ...prev,
            ]);
          } else if (activeApp === 'drive') {
            const res = await fetch('https://www.googleapis.com/drive/v3/files', {
              method: 'POST',
              headers,
              body: JSON.stringify({
                name: resourceTitle,
                mimeType: 'application/vnd.google-apps.folder',
              }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error?.message || 'Falha ao criar pasta no Drive.');
            setSuccessMsg(`Pasta "${resourceTitle}" criada no Google Drive (ID: ${data.id}).`);
            await fetchWorkspaceData('drive');
          } else if (activeApp === 'calendar') {
            const start = new Date(Date.now() + 3600 * 1000).toISOString();
            const end = new Date(Date.now() + 7200 * 1000).toISOString();
            const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
              method: 'POST',
              headers,
              body: JSON.stringify({
                summary: resourceTitle,
                description: `Rotina agendada pelo VN Gestão ERP para ${selectedClientName}`,
                start: { dateTime: start },
                end: { dateTime: end },
              }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error?.message || 'Falha ao criar evento.');
            setSuccessMsg(`Evento "${resourceTitle}" agendado no Google Calendar.`);
            await fetchWorkspaceData('calendar');
          } else if (activeApp === 'docs') {
            const res = await fetch('https://docs.googleapis.com/v1/documents', {
              method: 'POST',
              headers,
              body: JSON.stringify({ title: resourceTitle }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error?.message || 'Falha ao criar Google Doc.');
            setSuccessMsg(`Documento "${resourceTitle}" criado (ID: ${data.documentId}).`);
            setItems((prev) => [
              {
                id: data.documentId,
                title: resourceTitle,
                subtitle: 'Contrato / Ata criado no Google Docs',
                link: `https://docs.google.com/document/d/${data.documentId}/edit`,
              },
              ...prev,
            ]);
          } else if (activeApp === 'slides') {
            const res = await fetch('https://slides.googleapis.com/v1/presentations', {
              method: 'POST',
              headers,
              body: JSON.stringify({ title: resourceTitle }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error?.message || 'Falha ao criar apresentação.');
            setSuccessMsg(`Apresentação executiva "${resourceTitle}" criada no Google Slides.`);
            setItems((prev) => [
              {
                id: data.presentationId,
                title: resourceTitle,
                subtitle: 'Apresentação de Resultados DRE criada no Slides',
                link: `https://docs.google.com/presentation/d/${data.presentationId}/edit`,
              },
              ...prev,
            ]);
          } else if (activeApp === 'tasks') {
            const res = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
              method: 'POST',
              headers,
              body: JSON.stringify({ title: resourceTitle }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error?.message || 'Falha ao criar lista no Google Tasks.');
            setSuccessMsg(`Checklist "${resourceTitle}" criado no Google Tasks.`);
            await fetchWorkspaceData('tasks');
          } else if (activeApp === 'forms') {
            const res = await fetch('https://forms.googleapis.com/v1/forms', {
              method: 'POST',
              headers,
              body: JSON.stringify({
                info: {
                  title: resourceTitle,
                  documentTitle: resourceTitle,
                },
              }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error?.message || 'Falha ao criar Google Form.');
            setSuccessMsg(`Formulário de Onboarding "${resourceTitle}" criado (URI: ${data.responderUri || data.formId}).`);
            setItems((prev) => [
              {
                id: data.formId,
                title: resourceTitle,
                subtitle: 'Formulário de Diagnóstico BPO criado',
                link: data.responderUri,
              },
              ...prev,
            ]);
          } else {
            await fetchWorkspaceData(activeApp);
            setSuccessMsg(`Sincronização executada para ${appConfig?.label}.`);
          }

          onRecordAction(
            `WORKSPACE_MUTATION_${activeApp.toUpperCase()}`,
            `Operação confirmada pelo usuário executada em ${appConfig?.label}: ${resourceTitle}`
          );
        } catch (err: unknown) {
          setErrorMsg(err instanceof Error ? err.message : 'Erro ao executar operação no Google Workspace.');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Barra de Conexão OAuth2 em Memória */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Autenticação Google Workspace OAuth 2.0</span>
            <span aria-hidden="true">·</span>
            <span>Token isolado em memória RAM</span>
            <span aria-hidden="true">·</span>
            <span>{accessToken ? `Conectado como ${userEmail}` : 'Aguardando autorização do operador'}</span>
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            Conector Oficial 1P Google Workspace — 12 Aplicativos Operacionais BPO
          </h3>
          <p className="text-xs text-slate-600">
            Todas as operações que criam, enviam ou alteram dados em sua conta Google exigem confirmação explícita antes da execução.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onLoginClick}
            disabled={isLoggingIn}
            className="gsi-material-button"
          >
            <div className="gsi-material-button-state"></div>
            <div className="gsi-material-button-content-wrapper">
              <div className="gsi-material-button-icon">
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  ></path>
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  ></path>
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  ></path>
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  ></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
              </div>
              <span className="gsi-material-button-contents">
                {isLoggingIn ? 'Autenticando...' : accessToken ? 'Renovar Escopos Google' : 'Sign in with Google'}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Seletor dos 12 Aplicativos Google Workspace */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {apps.map((app) => {
          const isSelected = activeApp === app.id;
          return (
            <button
              key={app.id}
              type="button"
              onClick={() => {
                setActiveApp(app.id);
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`p-3 rounded-lg border text-left transition-colors ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                {app.icon}
                <span className={`text-[11px] font-mono ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>1P API</span>
              </div>
              <div className="text-xs font-semibold whitespace-nowrap truncate">{app.label}</div>
              <div className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                {app.scopeSummary}
              </div>
            </button>
          );
        })}
      </div>

      {/* Avisos de Pré-requisito Específicos (Chat e Keep) */}
      {activeApp === 'chat' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-xs text-amber-900 space-y-1.5">
          <div className="font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Pré-requisitos da API Google Chat (Contas Google Workspace Business/Enterprise)</span>
          </div>
          <p>
            1. O Google Chat requer uma conta corporativa Google Workspace (contas consumidoras <code>@gmail.com</code> não são suportadas pela API do Chat).
            2. É necessário configurar o aplicativo uma única vez na página{' '}
            <a
              href="https://console.cloud.google.com/apis/api/chat.googleapis.com/hangouts-chat?project=gen-lang-client-0260462522"
              target="_blank"
              rel="noreferrer"
              className="underline font-medium"
            >
              Google Chat API &gt; Configuration no Google Cloud Console (Projeto gen-lang-client-0260462522)
            </a>
            .
          </p>
        </div>
      )}

      {activeApp === 'keep' && (
        <div className="bg-slate-100 border border-slate-200 rounded-lg p-4 text-xs text-slate-700 space-y-1">
          <div className="font-semibold text-slate-900">
            Nota sobre Google Keep API &amp; Caderno de Particularidades VN
          </div>
          <p>
            A API REST do Google Keep (<code>keep.googleapis.com</code>) é restrita a contas Enterprise com delegação em todo o domínio. Para garantir disponibilidade em qualquer conta, o VN Gestão sincroniza as notas de particularidades operacionais diretamente neste módulo e no banco PostgreSQL.
          </p>
        </div>
      )}

      {/* Área de Operação do Aplicativo Selecionado */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 className="text-sm font-semibold text-slate-900">
                Ação Operacional — {apps.find((a) => a.id === activeApp)?.label}
              </h4>
              <p className="text-xs text-slate-500">Cliente em contexto: {selectedClientName}</p>
            </div>
            <button
              type="button"
              onClick={() => fetchWorkspaceData(activeApp)}
              disabled={loading}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Consultar {apps.find((a) => a.id === activeApp)?.label}</span>
            </button>
          </div>

          {activeApp === 'gmail' ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Destinatário</label>
                <input
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Assunto</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Mensagem de Controladoria</label>
                <textarea
                  rows={4}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <button
                type="button"
                onClick={requestConfirmedExecution}
                disabled={loading}
                className="w-full py-2 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Revisar e Enviar Notificação por Gmail</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Título do Recurso ({apps.find((a) => a.id === activeApp)?.label})
                </label>
                <input
                  type="text"
                  value={resourceTitle}
                  onChange={(e) => setResourceTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <button
                type="button"
                onClick={requestConfirmedExecution}
                disabled={loading}
                className="w-full py-2 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>
                  {activeApp === 'sheets'
                    ? 'Exportar Planilha DRE no Google Sheets'
                    : activeApp === 'calendar'
                    ? 'Agendar Fechamento no Google Calendar'
                    : activeApp === 'docs'
                    ? 'Gerar Minuta Contratual no Google Docs'
                    : activeApp === 'slides'
                    ? 'Gerar Apresentação Mensal no Google Slides'
                    : activeApp === 'tasks'
                    ? 'Criar Checklist BPO no Google Tasks'
                    : activeApp === 'forms'
                    ? 'Criar Formulário de Diagnóstico no Google Forms'
                    : `Executar Ação em ${apps.find((a) => a.id === activeApp)?.label}`}
                </span>
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200 text-xs text-red-800">{errorMsg}</div>
          )}
          {successMsg && (
            <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">{successMsg}</div>
          )}
        </div>

        {/* Lista de Resultados do Aplicativo */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-sm font-semibold text-slate-900">
              Registros Sincronizados — {apps.find((a) => a.id === activeApp)?.label}
            </h4>
            <span className="text-xs text-slate-500 font-mono tabular-nums">{items.length} registro(s)</span>
          </div>

          {items.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <p className="text-xs text-slate-500">
                Clique em <strong>Consultar {apps.find((a) => a.id === activeApp)?.label}</strong> para listar seus dados reais com permissão OAuth, ou crie um novo item ao lado.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {items.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-900 truncate">{item.title}</div>
                    <div className="text-xs text-slate-500 truncate mt-0.5">{item.subtitle}</div>
                  </div>
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded flex items-center gap-1 shrink-0"
                    >
                      <span>Abrir</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Confirmação Obrigatória antes de qualquer mutação na conta Google do usuário */}
      {pendingMutation && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
              <ShieldCheck className="w-5 h-5 text-slate-900 shrink-0" />
              <span>Confirmação de Operação Externa ({pendingMutation.appName})</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{pendingMutation.description}</p>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800 font-mono">
              Item afetado: {pendingMutation.affectedItem}
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPendingMutation(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  const fn = pendingMutation.execute;
                  setPendingMutation(null);
                  await fn();
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md"
              >
                Confirmar e Executar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
