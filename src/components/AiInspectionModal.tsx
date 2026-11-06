import React, { useState, useRef } from 'react';
import { X, Upload, Camera, Sparkles, CheckCircle2, AlertTriangle, XCircle, ArrowRight, Gauge, ShieldCheck, RefreshCw } from 'lucide-react';
import { AiInspectionResult } from '../types';
import { CameraViewfinderModal } from './CameraViewfinderModal';

interface AiInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyResultToLaudo?: (result: AiInspectionResult, photoUrl: string) => void;
  presetPartName?: string;
}

export const AiInspectionModal: React.FC<AiInspectionModalProps> = ({
  isOpen,
  onClose,
  onApplyResultToLaudo,
  presetPartName = '',
}) => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [partContext, setPartContext] = useState<string>(presetPartName || 'Geral (Carroceria / Estrutura)');
  const [userNotes, setUserNotes] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<AiInspectionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setPhotoUrl(base64);
      setPhotoBase64(base64);
      setResult(null);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRunAiAnalysis = async () => {
    if (!photoBase64) return;

    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/analyze-cautelar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: photoBase64,
          mimeType: 'image/jpeg',
          partContext,
          userNotes,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao comunicar com o servidor de IA.');
      }

      const data: AiInspectionResult = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Não foi possível concluir a análise pericial. Tente novamente.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApply = () => {
    if (result && photoUrl && onApplyResultToLaudo) {
      onApplyResultToLaudo(result, photoUrl);
      onClose();
    }
  };

  const handleReset = () => {
    setPhotoUrl(null);
    setPhotoBase64(null);
    setResult(null);
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-900 to-indigo-950 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-blue-300">
              <Sparkles className="w-4 h-4 text-purple-300" />
            </div>
            <div>
              <h2 className="text-base font-bold">Perícia Fotográfica por IA</h2>
              <p className="text-xs text-blue-200">
                Detecção de danos, repintura, alinhamento e risco estrutural
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {!photoUrl ? (
            /* Upload step */
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-2xl p-6 sm:p-8 text-center bg-slate-50/60 hover:bg-blue-50/30 transition-all flex flex-col items-center justify-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-blue-100/80 text-blue-600 flex items-center justify-center">
                  <Camera className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Tire uma foto ou envie uma imagem da peça
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    Focalize a peça sob boa iluminação: capô, porta, para-choque, longarina, solda, pneu ou numeração de chassi.
                  </p>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsCameraOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Usar Câmera</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold shadow-xs flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Galeria / Arquivo</span>
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Live Camera Viewfinder Modal */}
                <CameraViewfinderModal
                  isOpen={isCameraOpen}
                  onClose={() => setIsCameraOpen(false)}
                  onCapturePhoto={(photoBase64Data) => {
                    setPhotoUrl(photoBase64Data);
                    setPhotoBase64(photoBase64Data);
                    setResult(null);
                    setErrorMsg(null);
                    setIsCameraOpen(false);
                  }}
                  categoryLabel={partContext || 'Análise por Câmera'}
                  instruction="Enquadre o detalhe ou peça com iluminação clara para análise da IA"
                />
              </div>

              {/* Sample test suggestions */}
              <div>
                <span className="text-xs font-semibold text-slate-400 block mb-2">
                  Ou teste com fotos de amostra pericial:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const sample = 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80';
                      setPhotoUrl(sample);
                      setPhotoBase64(sample);
                      setPartContext('Frente e Para-choque Dianteiro');
                    }}
                    className="p-2 rounded-xl border border-slate-200 hover:border-blue-400 text-left bg-white text-xs font-semibold text-slate-700 hover:text-blue-600 flex flex-col gap-1 transition-all"
                  >
                    <span className="text-[11px] font-bold">1. Frente Íntegra</span>
                    <span className="text-[10px] text-slate-400">Padrão Original</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const sample = 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80';
                      setPhotoUrl(sample);
                      setPhotoBase64(sample);
                      setPartContext('Capô com Repintura e Retoque');
                    }}
                    className="p-2 rounded-xl border border-slate-200 hover:border-amber-400 text-left bg-white text-xs font-semibold text-slate-700 hover:text-amber-600 flex flex-col gap-1 transition-all"
                  >
                    <span className="text-[11px] font-bold">2. Repintura / Capô</span>
                    <span className="text-[10px] text-slate-400">Camada &gt; 220µm</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const sample = 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80';
                      setPhotoUrl(sample);
                      setPhotoBase64(sample);
                      setPartContext('Longarina e Estrutura Dianteira');
                    }}
                    className="p-2 rounded-xl border border-slate-200 hover:border-rose-400 text-left bg-white text-xs font-semibold text-slate-700 hover:text-rose-600 flex flex-col gap-1 transition-all"
                  >
                    <span className="text-[11px] font-bold">3. Dano Estrutural</span>
                    <span className="text-[10px] text-slate-400">Solda / Batida</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Analysis & Result step */
            <div className="space-y-4">
              {/* Photo preview + context inputs */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 max-h-56 flex items-center justify-center">
                <img
                  src={photoUrl}
                  alt="Peça em análise"
                  className="w-full h-56 object-cover"
                />
                <button
                  type="button"
                  onClick={handleReset}
                  className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-semibold backdrop-blur-xs flex items-center gap-1 transition-all"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Trocar Foto</span>
                </button>
              </div>

              {/* Context Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Peça / Região Inspecionada
                  </label>
                  <select
                    value={partContext}
                    onChange={(e) => setPartContext(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 bg-white outline-none focus:border-blue-500"
                  >
                    <option value="Geral (Carroceria / Estrutura)">Geral (Carroceria / Estrutura)</option>
                    <option value="Longarina Dianteira Esquerda">Longarina Dianteira Esquerda</option>
                    <option value="Longarina Dianteira Direita">Longarina Dianteira Direita</option>
                    <option value="Capô Dianteiro">Capô Dianteiro</option>
                    <option value="Teto">Teto</option>
                    <option value="Porta Dianteira Esquerda">Porta Dianteira Esquerda</option>
                    <option value="Porta Dianteira Direita">Porta Dianteira Direita</option>
                    <option value="Para-lama Dianteiro">Para-lama Dianteiro</option>
                    <option value="Tampa do Porta-Malas">Tampa do Porta-Malas</option>
                    <option value="Cofre do Motor">Cofre do Motor</option>
                    <option value="Gravação do Chassi">Gravação do Chassi</option>
                    <option value="Pneu / Roda / TWI">Pneu / Roda / TWI</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Observação do Vistoriador (Opcional)
                  </label>
                  <input
                    type="text"
                    value={userNotes}
                    onChange={(e) => setUserNotes(e.target.value)}
                    placeholder="Ex: Suspeita de retoque ou folga no para-choque"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Action Button */}
              {!result && (
                <button
                  type="button"
                  onClick={handleRunAiAnalysis}
                  disabled={isAnalyzing}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Processando Parecer Pericial de IA...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-purple-200" />
                      <span>Executar Análise Pericial por IA</span>
                    </>
                  )}
                </button>
              )}

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              {/* Result Card */}
              {result && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      {result.verdictImpact === 'Aprovado' && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      )}
                      {result.verdictImpact === 'Apontamento' && (
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                      )}
                      {result.verdictImpact === 'Reprovado' && (
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      )}
                      <div>
                        <span className="text-xs uppercase font-extrabold tracking-wider block text-slate-500">
                          Impacto no Laudo
                        </span>
                        <span
                          className={`text-sm font-extrabold ${
                            result.verdictImpact === 'Aprovado'
                              ? 'text-emerald-700'
                              : result.verdictImpact === 'Apontamento'
                              ? 'text-amber-700'
                              : 'text-rose-700'
                          }`}
                        >
                          {result.verdictImpact.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {result.estimatedPaintMicrons && (
                      <div className="text-right">
                        <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                          Micrômetro Estimado
                        </span>
                        <span className="text-sm font-black text-slate-900 flex items-center justify-end gap-1">
                          <Gauge className="w-3.5 h-3.5 text-blue-600" />
                          {result.estimatedPaintMicrons} µm
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">Condição Visual</span>
                      <span className="font-bold text-slate-800">{result.visualCondition}</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">Risco Estrutural</span>
                      <span className="font-bold text-slate-800">{result.structuralRisk}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-700 block mb-0.5">
                      Parecer do Perito IA:
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed bg-white p-2.5 rounded-xl border border-slate-200">
                      {result.technicalObservations}
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-700 block mb-0.5">
                      Recomendação Técnica:
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed bg-blue-50/70 text-blue-900 p-2.5 rounded-xl border border-blue-200">
                      {result.recommendation}
                    </p>
                  </div>

                  {onApplyResultToLaudo && (
                    <button
                      type="button"
                      onClick={handleApply}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs active:scale-[0.99] transition-all flex items-center justify-center gap-1.5"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Anexar Foto & Parecer ao Laudo Cautelar</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
