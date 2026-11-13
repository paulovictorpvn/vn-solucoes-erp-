import React, { useState } from 'react';
import {
  Camera,
  Video,
  Zap,
  Globe,
  Volume2,
  Music,
  Upload,
  Sparkles,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { getBackendAuthToken } from '../lib/firebase.ts';

interface AiIntelligenceHubProps {
  selectedClientName: string;
  selectedClientParticularities: string;
  onRefreshErp: () => Promise<void>;
}

interface OcrResult {
  documentType?: string;
  counterpartyName?: string;
  cnpjOrCpf?: string;
  totalAmount?: string;
  dueDate?: string;
  suggestedCategory?: string;
  suggestedCostCenter?: string;
  complianceAlerts?: string[];
  summary?: string;
}

export const AiIntelligenceHub: React.FC<AiIntelligenceHubProps> = ({
  selectedClientName,
  selectedClientParticularities,
  onRefreshErp,
}) => {
  // 1. Image Analysis (gemini-4-argon)
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  // 2. Video Analysis (gemini-4-argon)
  const [videoName, setVideoName] = useState<string | null>(null);
  const [videoPrompt, setVideoPrompt] = useState(
    'Identifique os pontos críticos desta reunião de fechamento/auditoria, divergências citadas e ações corretivas.'
  );
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoAnalysis, setVideoAnalysis] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

  // 3. Low-Latency Validation (gemini-3.1-flash-lite)
  const [quickQuery, setQuickQuery] = useState(
    'Posso aprovar um lote de R$ 18.450,00 sem centro de custo de frota vinculado?'
  );
  const [quickLoading, setQuickLoading] = useState(false);
  const [quickResponse, setQuickResponse] = useState<{ text: string; latencyMs: number } | null>(null);

  // 4. Search Grounding (gemini-4-hydrogen + googleSearch)
  const [searchQuery, setSearchQuery] = useState(
    'Alíquotas atuais de retenção PCC (4,65%) e IRRF em notas fiscais de serviços B2B no Brasil e regras de conciliação'
  );
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<{
    text: string;
    sources: Array<{ title?: string; uri?: string }>;
  } | null>(null);

  // 5. Text-to-Speech (gemini-3.8-flash-tts)
  const [ttsText, setTtsText] = useState(
    `Resumo executivo ${selectedClientName}: fechamento contábil em andamento com disponibilidade técnica de 99,98% e proteção ativa contra duplicidades.`
  );
  const [ttsMode, setTtsMode] = useState<'dialogue' | 'single'>('dialogue');
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsAudioUrl, setTtsAudioUrl] = useState<string | null>(null);
  const [ttsError, setTtsError] = useState<string | null>(null);

  // 6. Music Generation (lyria-3-clip-preview / lyria-3-pro-preview)
  const [musicPrompt, setMusicPrompt] = useState(
    'Modern corporate ambient instrumental track, warm piano and subtle acoustic guitar, calm executive financial studio atmosphere'
  );
  const [musicDuration, setMusicDuration] = useState<'clip' | 'full'>('clip');
  const [musicLoading, setMusicLoading] = useState(false);
  const [musicResult, setMusicResult] = useState<{
    model: string;
    audioDataUrl: string;
    lyrics: string;
  } | null>(null);
  const [musicError, setMusicError] = useState<string | null>(null);

  // Gera uma Nota Fiscal sintética em canvas para teste imediato caso o usuário não envie arquivo local
  const generateSampleInvoiceBase64 = (): { base64: string; dataUrl: string } => {
    const canvas = document.createElement('canvas');
    canvas.width = 680;
    canvas.height = 420;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 680, 420);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.strokeRect(16, 16, 648, 388);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('DANFE — NOTA FISCAL ELETRÔNICA Nº 99412', 36, 56);
      ctx.font = '15px monospace';
      ctx.fillText('EMISSOR: SUPRIMENTOS TECH & CLOUD LTDA', 36, 100);
      ctx.fillText('CNPJ: 31.442.890/0001-77', 36, 130);
      ctx.fillText(`TOMADOR: ${selectedClientName}`, 36, 165);
      ctx.fillText('DESCRIÇÃO: LICENCIAMENTO SERVIDOR E INFRAESTRUTURA BPO', 36, 205);
      ctx.fillText('VALOR BRUTO: R$ 16.800,00 | RETENÇÃO ISS/IRRF: R$ 781,20', 36, 245);
      ctx.font = 'bold 18px monospace';
      ctx.fillText('VALOR LÍQUIDO DO BOLETO: R$ 16.018,80', 36, 290);
      ctx.fillText('VENCIMENTO: 25/11/2026 | CENTRO DE CUSTO: CC-TI-MATRIZ', 36, 330);
    }
    const dataUrl = canvas.toDataURL('image/png');
    return { base64: dataUrl.split(',')[1], dataUrl };
  };

  const handleAnalyzeImage = async (base64Data: string, mimeType: string) => {
    setImageLoading(true);
    setImageError(null);
    try {
      const token = await getBackendAuthToken();
      const res = await fetch('/api/ai/analyze-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          base64Data,
          mimeType,
          promptContext: `Analise este documento fiscal para o cliente ${selectedClientName} (Particularidades: ${selectedClientParticularities}). Extraia emissor, CNPJ, valor líquido, vencimento, centro de custo e alertas de conformidade.`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao analisar documento.');
      setOcrResult(data);
      await onRefreshErp();
    } catch (err: unknown) {
      setImageError(err instanceof Error ? err.message : 'Erro na análise de imagem.');
    } finally {
      setImageLoading(false);
    }
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      setImagePreview(result);
      const base64 = result.split(',')[1];
      if (base64) {
        handleAnalyzeImage(base64, file.type || 'image/png');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoName(file.name);
    setVideoLoading(true);
    setVideoError(null);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const result = String(reader.result || '');
        const base64Data = result.split(',')[1];
        const token = await getBackendAuthToken();
        const res = await fetch('/api/ai/analyze-video', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            base64Data,
            mimeType: file.type || 'video/mp4',
            prompt: videoPrompt,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao analisar vídeo.');
        setVideoAnalysis(data.analysis);
      } catch (err: unknown) {
        setVideoError(err instanceof Error ? err.message : 'Falha ao analisar vídeo.');
      } finally {
        setVideoLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleQuickValidate = async () => {
    setQuickLoading(true);
    try {
      const token = await getBackendAuthToken();
      const res = await fetch('/api/ai/quick-validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: quickQuery,
          clientContext: `${selectedClientName} — ${selectedClientParticularities}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro na validação rápida.');
      setQuickResponse({ text: data.text, latencyMs: data.latencyMs });
    } catch (err: unknown) {
      setQuickResponse({
        text: err instanceof Error ? err.message : 'Erro na consulta.',
        latencyMs: 0,
      });
    } finally {
      setQuickLoading(false);
    }
  };

  const handleSearchGrounding = async () => {
    setSearchLoading(true);
    try {
      const token = await getBackendAuthToken();
      const res = await fetch('/api/ai/search-grounding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro na pesquisa Google Search.');
      setSearchResult({ text: data.text, sources: data.sources || [] });
    } catch (err: unknown) {
      setSearchResult({
        text: err instanceof Error ? err.message : 'Erro na pesquisa.',
        sources: [],
      });
    } finally {
      setSearchLoading(false);
    }
  };

  const handleGenerateTts = async () => {
    setTtsLoading(true);
    setTtsError(null);
    try {
      const token = await getBackendAuthToken();
      const res = await fetch('/api/ai/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: ttsText, mode: ttsMode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro na síntese de voz.');
      setTtsAudioUrl(data.audioDataUrl);
    } catch (err: unknown) {
      setTtsError(err instanceof Error ? err.message : 'Erro ao gerar fala.');
    } finally {
      setTtsLoading(false);
    }
  };

  const handleGenerateMusic = async () => {
    setMusicLoading(true);
    setMusicError(null);
    try {
      const token = await getBackendAuthToken();
      const res = await fetch('/api/ai/generate-music', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt: musicPrompt, durationType: musicDuration }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar trilha sonora.');
      setMusicResult(data);
    } catch (err: unknown) {
      setMusicError(err instanceof Error ? err.message : 'Erro na geração musical.');
    } finally {
      setMusicLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Análise de Imagens e OCR Fiscal (gemini-4-argon) */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="space-y-0.5">
              <div className="text-xs text-slate-500">
                <span>OCR &amp; Visão Computacional</span>
                <span aria-hidden="true"> · </span>
                <span className="font-mono">gemini-4-argon</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Camera className="w-4 h-4 text-slate-700" />
                <span>Leitura de Notas Fiscais, Boletos e Comprovantes</span>
              </h3>
            </div>
            <button
              type="button"
              onClick={() => {
                const sample = generateSampleInvoiceBase64();
                setImagePreview(sample.dataUrl);
                handleAnalyzeImage(sample.base64, 'image/png');
              }}
              disabled={imageLoading}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md whitespace-nowrap shrink-0"
            >
              Simular DANFE NF-99412
            </button>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex-1 cursor-pointer border border-dashed border-slate-300 hover:border-slate-400 rounded-md p-3 text-center transition-colors">
              <input type="file" accept="image/*" onChange={handleImageFileUpload} className="hidden" />
              <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-700">
                <Upload className="w-4 h-4" />
                <span>Enviar Foto de Nota Fiscal ou Comprovante (PNG/JPG)</span>
              </div>
            </label>
          </div>

          {imagePreview && (
            <div className="border border-slate-200 rounded-md p-2 bg-slate-50">
              <img
                src={imagePreview}
                alt="Prévia do documento fiscal analisado"
                referrerPolicy="no-referrer"
                className="max-h-36 mx-auto object-contain rounded"
              />
            </div>
          )}

          {imageLoading && (
            <div className="text-xs text-slate-600 font-mono">
              Processando imagem com gemini-4-argon no servidor...
            </div>
          )}

          {imageError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-800">{imageError}</div>
          )}

          {ocrResult && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md space-y-2 text-xs">
              <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Extração Concluída: {ocrResult.documentType}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 font-mono text-[11px] text-slate-700">
                <div>Fornecedor: {ocrResult.counterpartyName}</div>
                <div>CNPJ/CPF: {ocrResult.cnpjOrCpf || 'N/A'}</div>
                <div>Valor: {ocrResult.totalAmount}</div>
                <div>Vencimento: {ocrResult.dueDate || 'A definir'}</div>
                <div>Categoria: {ocrResult.suggestedCategory || 'Despesa Operacional'}</div>
                <div>Centro Custo: {ocrResult.suggestedCostCenter || 'CC-GERAL'}</div>
              </div>
              <p className="text-slate-600">{ocrResult.summary}</p>
            </div>
          )}
        </div>

        {/* 2. Análise de Vídeos Operacionais e Reuniões de Auditoria (gemini-4-argon) */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="space-y-0.5">
              <div className="text-xs text-slate-500">
                <span>Compreensão Multimodal de Vídeo</span>
                <span aria-hidden="true"> · </span>
                <span className="font-mono">gemini-4-argon</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Video className="w-4 h-4 text-slate-700" />
                <span>Auditoria de Vídeos de Fechamento e Gravações de Incidentes</span>
              </h3>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Instrução de Análise</label>
            <input
              type="text"
              value={videoPrompt}
              onChange={(e) => setVideoPrompt(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md"
            />
          </div>

          <label className="block cursor-pointer border border-dashed border-slate-300 hover:border-slate-400 rounded-md p-3 text-center transition-colors">
            <input type="file" accept="video/*" onChange={handleVideoFileUpload} className="hidden" />
            <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-700">
              <Upload className="w-4 h-4" />
              <span>{videoName ? `Vídeo selecionado: ${videoName}` : 'Enviar Vídeo MP4/WebM para Análise Gemini 4 Argon'}</span>
            </div>
          </label>

          {videoLoading && (
            <div className="text-xs text-slate-600 font-mono">Analisando quadros e áudio do vídeo com gemini-4-argon...</div>
          )}
          {videoError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-800">{videoError}</div>
          )}
          {videoAnalysis && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
              {videoAnalysis}
            </div>
          )}
        </div>

        {/* 3. Validação Instantânea de Baixa Latência (gemini-3.1-flash-lite) */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="space-y-0.5">
              <div className="text-xs text-slate-500">
                <span>Motor de Regras Ultra-Rápido</span>
                <span aria-hidden="true"> · </span>
                <span className="font-mono">gemini-3.1-flash-lite</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-slate-700" />
                <span>Consulta Instantânea de Particularidades e Alçadas</span>
              </h3>
            </div>
            {quickResponse && (
              <span className="text-xs font-mono text-emerald-700 tabular-nums">{quickResponse.latencyMs} ms</span>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={quickQuery}
              onChange={(e) => setQuickQuery(e.target.value)}
              className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-md"
              placeholder="Pergunte sobre uma regra de aprovação ou bloqueio..."
            />
            <button
              type="button"
              onClick={handleQuickValidate}
              disabled={quickLoading}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md whitespace-nowrap shrink-0"
            >
              {quickLoading ? 'Validando...' : 'Validar Regra'}
            </button>
          </div>

          {quickResponse && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
              {quickResponse.text}
            </div>
          )}
        </div>

        {/* 4. Busca Fundamentada Google Search (gemini-4-hydrogen + googleSearch) */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="space-y-0.5">
              <div className="text-xs text-slate-500">
                <span>Grounding com Google Search Ao Vivo</span>
                <span aria-hidden="true"> · </span>
                <span className="font-mono">gemini-4-hydrogen</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-slate-700" />
                <span>Pesquisa Tributária, Retenções e Índices Financeiros</span>
              </h3>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-md"
            />
            <button
              type="button"
              onClick={handleSearchGrounding}
              disabled={searchLoading}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md whitespace-nowrap shrink-0"
            >
              {searchLoading ? 'Buscando...' : 'Pesquisar Web'}
            </button>
          </div>

          {searchResult && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md space-y-3 text-xs">
              <div className="text-slate-800 whitespace-pre-wrap leading-relaxed">{searchResult.text}</div>
              {searchResult.sources.length > 0 && (
                <div className="border-t border-slate-200 pt-2 space-y-1">
                  <div className="font-semibold text-slate-700">Fontes verificadas no Google Search:</div>
                  <div className="flex flex-wrap gap-2">
                    {searchResult.sources.map((src, idx) => (
                      <a
                        key={idx}
                        href={src.uri}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-slate-700 underline hover:text-slate-900"
                      >
                        <span>{src.title || src.uri}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 5. Conversão de Texto em Fala Executiva (gemini-3.8-flash-tts) */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="space-y-0.5">
              <div className="text-xs text-slate-500">
                <span>Síntese de Voz Multi-Speaker</span>
                <span aria-hidden="true"> · </span>
                <span className="font-mono">gemini-3.8-flash-tts</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-slate-700" />
                <span>Narração de Briefing DRE e Alertas do Turno</span>
              </h3>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md">
              <button
                type="button"
                onClick={() => setTtsMode('dialogue')}
                className={`px-2.5 py-1 text-xs font-medium rounded ${
                  ttsMode === 'dialogue' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Diálogo (2 Vozes)
              </button>
              <button
                type="button"
                onClick={() => setTtsMode('single')}
                className={`px-2.5 py-1 text-xs font-medium rounded ${
                  ttsMode === 'single' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Direto
              </button>
            </div>
          </div>

          <textarea
            rows={2}
            value={ttsText}
            onChange={(e) => setTtsText(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md"
          />

          <button
            type="button"
            onClick={handleGenerateTts}
            disabled={ttsLoading}
            className="w-full py-2 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md flex items-center justify-center gap-2"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{ttsLoading ? 'Sintetizando WAV 24kHz...' : 'Ouvir Briefing Executivo (Gemini 3.8 Flash TTS)'}</span>
          </button>

          {ttsError && <div className="p-2.5 bg-red-50 border border-red-200 rounded text-xs text-red-800">{ttsError}</div>}
          {ttsAudioUrl && (
            <div className="pt-1">
              <audio controls src={ttsAudioUrl} className="w-full h-9" />
            </div>
          )}
        </div>

        {/* 6. Geração de Música e Ambientação BPO (lyria-3-clip-preview / lyria-3-pro-preview) */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="space-y-0.5">
              <div className="text-xs text-slate-500">
                <span>Áudio Generativo Corporativo</span>
                <span aria-hidden="true"> · </span>
                <span className="font-mono">
                  {musicDuration === 'clip' ? 'lyria-3-clip-preview' : 'lyria-3-pro-preview'}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Music className="w-4 h-4 text-slate-700" />
                <span>Trilha de Atendimento, Onboarding e Foco Operacional</span>
              </h3>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md">
              <button
                type="button"
                onClick={() => setMusicDuration('clip')}
                className={`px-2.5 py-1 text-xs font-medium rounded ${
                  musicDuration === 'clip' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Clip 30s
              </button>
              <button
                type="button"
                onClick={() => setMusicDuration('full')}
                className={`px-2.5 py-1 text-xs font-medium rounded ${
                  musicDuration === 'full' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Faixa Completa
              </button>
            </div>
          </div>

          <input
            type="text"
            value={musicPrompt}
            onChange={(e) => setMusicPrompt(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md"
          />

          <button
            type="button"
            onClick={handleGenerateMusic}
            disabled={musicLoading}
            className="w-full py-2 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {musicLoading
                ? 'Gerando áudio MP3 com Lyria 3...'
                : `Gerar Trilha Sonora (${musicDuration === 'clip' ? 'Lyria 3 Clip' : 'Lyria 3 Pro'})`}
            </span>
          </button>

          {musicError && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded text-xs text-red-800">{musicError}</div>
          )}
          {musicResult && (
            <div className="space-y-2 pt-1">
              <audio controls src={musicResult.audioDataUrl} className="w-full h-9" />
              {musicResult.lyrics && (
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-600 font-mono">
                  {musicResult.lyrics}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
