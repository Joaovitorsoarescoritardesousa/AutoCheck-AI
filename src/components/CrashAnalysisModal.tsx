import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Image as ImageIcon,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Truck,
  MapPin,
  X,
  Loader2,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  RotateCcw,
} from 'lucide-react';
import { CrashAnalysisResult, ServiceCategory } from '../types';

interface CrashAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (category: ServiceCategory) => void;
  onSaveToHistory: (result: CrashAnalysisResult, photoData: string) => void;
}

export const CrashAnalysisModal: React.FC<CrashAnalysisModalProps> = ({
  isOpen,
  onClose,
  onSelectCategory,
  onSaveToHistory,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [userNote, setUserNote] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<CrashAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Live Camera state & refs
  const [isLiveCameraOpen, setIsLiveCameraOpen] = useState<boolean>(false);
  const [isRequestingCamera, setIsRequestingCamera] = useState<boolean>(false);
  const [cameraPermissionError, setCameraPermissionError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Clean up camera stream when modal closes or unmounts
  const stopLiveCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsLiveCameraOpen(false);
    setIsRequestingCamera(false);
  };

  useEffect(() => {
    if (!isOpen) {
      stopLiveCamera();
    }
    return () => {
      stopLiveCamera();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Explicitly prompt device for native Camera Permission via standard getUserMedia API
  const handleStartCamera = async (targetFacing: 'environment' | 'user' = facingMode) => {
    setCameraPermissionError(null);
    setIsRequestingCamera(true);

    // Stop existing stream if any
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      // If browser doesn't support getUserMedia (rare), fallback directly to system capture input
      setIsRequestingCamera(false);
      cameraInputRef.current?.click();
      return;
    }

    try {
      // This call explicitly prompts the native OS / browser permission dialog on any device
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: targetFacing },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setIsLiveCameraOpen(true);
      setIsRequestingCamera(false);

      // Attach stream to video element
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((err) => {
            console.warn('Video play error:', err);
          });
        }
      }, 100);
    } catch (err: any) {
      console.warn('Camera permission or device error:', err);
      setIsRequestingCamera(false);

      if (
        err.name === 'NotAllowedError' ||
        err.name === 'PermissionDeniedError' ||
        err.name === 'SecurityError'
      ) {
        setCameraPermissionError(
          'Permissão da câmera negada no aparelho. Para tirar foto do dano, permita o acesso à câmera nas configurações do navegador ou use o seletor nativo do sistema.'
        );
      } else {
        // Fallback to system capture if hardware/stream unavailable
        setCameraPermissionError(
          'Não foi possível inicializar a câmera ao vivo. Você pode acionar a câmera nativa do sistema ou escolher uma foto da galeria.'
        );
      }
    }
  };

  // Toggle front/back camera
  const handleToggleCameraFacing = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    handleStartCamera(nextFacing);
  };

  // Capture frame from live video
  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Flip horizontally if front-facing for natural mirror feel
    if (facingMode === 'user') {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

    // Stop camera and set preview
    stopLiveCamera();
    setImagePreview(dataUrl);
    setAnalysisResult(null);
    setAnalysisError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImagePreview(dataUrl);
      setAnalysisResult(null);
      setAnalysisError(null);
    };
    reader.readAsDataURL(file);
  };

  const runAnalysis = async () => {
    if (!imagePreview) return;

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      let base64Data = imagePreview;

      // If it is an external URL (sample image), fetch and convert to base64
      if (imagePreview.startsWith('http')) {
        const response = await fetch(imagePreview);
        const blob = await response.blob();
        base64Data = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      }

      const res = await fetch('/api/analyze-crash', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: base64Data,
          userNotes: userNote,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Falha ao processar imagem');
      }

      const data: CrashAnalysisResult = await res.json();
      data.photoUrl = imagePreview;
      data.analyzedAt = new Date().toISOString();
      setAnalysisResult(data);
      onSaveToHistory(data, imagePreview);
    } catch (err: any) {
      console.error('Erro na análise:', err);
      setAnalysisError(
        'Não foi possível analisar a imagem agora. Verifique a conexão ou tente outra foto.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    stopLiveCamera();
    setImagePreview(null);
    setAnalysisResult(null);
    setAnalysisError(null);
    setUserNote('');
    setCameraPermissionError(null);
  };

  const handleFindRecommended = (category: ServiceCategory) => {
    stopLiveCamera();
    onClose();
    onSelectCategory(category);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl max-h-[94vh] flex flex-col my-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white leading-tight">
                Análise da Batida
              </h2>
              <p className="text-xs text-amber-400 font-medium">
                AutoCheck AI • Câmera & Diagnóstico Inteligente
              </p>
            </div>
          </div>
          <button
            id="btn-close-crash-modal"
            onClick={() => {
              stopLiveCamera();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 py-3 space-y-4 pr-1">
          {/* Hidden fallback file inputs */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* VIEW 1: LIVE CAMERA VIEWFINDER (When user requested camera and permission was granted) */}
          {isLiveCameraOpen ? (
            <div className="space-y-3.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                  <span className="text-xs font-black text-white uppercase tracking-wider">
                    Câmera: Análise da Batida
                  </span>
                </div>
                <button
                  onClick={handleToggleCameraFacing}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  title="Inverter Câmera (Traseira / Frontal)"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Inverter</span>
                </button>
              </div>

              {/* Video Stream Container with Framing Guides */}
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3] sm:aspect-video border border-amber-500/40 shadow-2xl flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${facingMode === 'user' ? '-scale-x-100' : ''}`}
                />

                {/* Framing guides overlay */}
                <div className="absolute inset-4 border border-dashed border-white/40 rounded-xl pointer-events-none flex flex-col justify-between p-2">
                  <div className="flex justify-between text-[10px] font-bold text-amber-400/90 bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm self-start">
                    📷 Câmera — Análise da Batida
                  </div>
                  <div className="text-center text-[10px] text-white/70 bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm self-center">
                    Enquadre a área amassada e mantenha o celular firme
                  </div>
                </div>
              </div>

              {/* Live Camera Controls */}
              <div className="flex items-center justify-around pt-2">
                <button
                  onClick={stopLiveCamera}
                  className="p-3 rounded-2xl bg-slate-950 text-slate-400 hover:text-white border border-slate-800 text-xs font-bold flex items-center gap-1.5 active:scale-95"
                >
                  <X className="w-4 h-4" />
                  <span>Cancelar</span>
                </button>

                {/* Big Round Shutter Button */}
                <button
                  id="btn-shutter-snap"
                  onClick={handleCapturePhoto}
                  className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 p-1 shadow-xl shadow-amber-500/30 flex items-center justify-center active:scale-95 transition-all"
                  title="Tirar foto"
                >
                  <div className="w-13 h-13 rounded-full border-2 border-slate-950 flex items-center justify-center bg-amber-400">
                    <Camera className="w-7 h-7 text-slate-950" />
                  </div>
                </button>

                {/* Fallback to gallery */}
                <button
                  onClick={() => {
                    stopLiveCamera();
                    galleryInputRef.current?.click();
                  }}
                  className="p-3 rounded-2xl bg-slate-950 text-slate-400 hover:text-amber-400 border border-slate-800 text-xs font-bold flex items-center gap-1.5 active:scale-95"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Galeria</span>
                </button>
              </div>
            </div>
          ) : !imagePreview ? (
            /* VIEW 2: Upload Choice Screen - Strictly following requested flow */
            <div className="space-y-5">
              <div className="text-center py-2">
                <h3 className="text-lg font-black text-white">
                  Como você quer adicionar a foto?
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Tire uma foto na hora com a câmera do seu aparelho ou escolha uma imagem salva.
                </p>
              </div>

              {/* Permission error warning if user previously blocked camera */}
              {cameraPermissionError && (
                <div className="p-3.5 bg-red-950/70 border border-red-800 rounded-2xl text-xs text-red-200 space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-red-300">Aviso de Permissão da Câmera:</p>
                      <p className="mt-0.5 text-slate-300">{cameraPermissionError}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleStartCamera()}
                      className="px-3 py-1.5 bg-red-800 hover:bg-red-700 text-white rounded-xl font-bold text-xs transition-colors"
                    >
                      Tentar permissão novamente
                    </button>
                    <button
                      onClick={() => cameraInputRef.current?.click()}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs transition-colors"
                    >
                      Abrir câmera do sistema
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons: Simple, Clean & Professional */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Camera Button */}
                <button
                  id="btn-tirar-foto"
                  onClick={() => handleStartCamera()}
                  disabled={isRequestingCamera}
                  className="bg-amber-500 hover:bg-amber-400 active:bg-amber-600 disabled:opacity-70 text-slate-950 font-semibold p-3.5 rounded-xl flex items-center gap-3 shadow-sm transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-950/10 flex items-center justify-center shrink-0">
                    {isRequestingCamera ? (
                      <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
                    ) : (
                      <Camera className="w-5 h-5 text-slate-950" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-bold block truncate">
                      Câmera: Análise da Batida
                    </span>
                    <span className="text-xs text-slate-900/70 block truncate">
                      {isRequestingCamera ? 'Solicitando permissão...' : 'Tirar foto agora'}
                    </span>
                  </div>
                </button>

                {/* 2. Gallery Button */}
                <button
                  id="btn-escolher-galeria"
                  onClick={() => galleryInputRef.current?.click()}
                  className="bg-slate-900 hover:bg-slate-850 active:bg-slate-800 text-slate-200 hover:text-white font-semibold p-3.5 rounded-xl border border-slate-800 hover:border-slate-700 flex items-center gap-3 transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 text-slate-300">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-bold block truncate">
                      Escolher da Galeria
                    </span>
                    <span className="text-xs text-slate-400 block truncate">
                      Carregar arquivo do aparelho
                    </span>
                  </div>
                </button>
              </div>

              <div className="bg-slate-950/70 border border-slate-800/70 rounded-xl p-3 text-xs text-slate-400 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  O aparelho solicita a permissão de câmera nativa no momento em que você tocar em &quot;Câmera: Análise da Batida&quot;.
                </span>
              </div>
            </div>
          ) : (
            /* VIEW 3: Image Preview & Results Screen */
            <div className="space-y-4">
              {/* Top Banner: "Foto selecionada ✓" as specified */}
              <div className="flex items-center justify-between p-2.5 px-3.5 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-black">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Foto selecionada ✓</span>
                </div>
                {!isAnalyzing && !analysisResult && (
                  <span className="text-[11px] text-slate-400">
                    Pronta para diagnóstico
                  </span>
                )}
              </div>

              {/* Photo Preview Card */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-black aspect-video max-h-60 flex items-center justify-center">
                <img
                  src={imagePreview}
                  alt="Foto do veículo"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* State 1: Ready to Analyze (Confirmation, Retake, Cancel) */}
              {!analysisResult && !isAnalyzing && (
                <div className="space-y-3.5">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Observação sobre o carro (opcional):
                    </label>
                    <input
                      type="text"
                      value={userNote}
                      onChange={(e) => setUserNote(e.target.value)}
                      placeholder="Ex: vazando líquido verde, pneu raspando..."
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {analysisError && (
                    <div className="p-3 bg-red-950/60 border border-red-800 rounded-xl text-xs text-red-300 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                      <div>
                        <p className="font-bold">Aviso:</p>
                        <p>{analysisError}</p>
                      </div>
                    </div>
                  )}

                  {/* Primary CTA: "Analisar dano" */}
                  <button
                    id="btn-analisar-dano"
                    onClick={runAnalysis}
                    className="w-full min-h-[48px] bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold py-3 px-4 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all text-sm"
                  >
                    <Sparkles className="w-4 h-4 fill-slate-950" />
                    <span>Analisar dano</span>
                  </button>

                  {/* Secondary Actions: Retake or Cancel */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      id="btn-tirar-outra-foto"
                      onClick={() => {
                        handleReset();
                        handleStartCamera();
                      }}
                      className="py-3 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 active:scale-[0.98] text-slate-300 text-xs font-bold border border-slate-800 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Camera className="w-3.5 h-3.5 text-amber-400" />
                      <span>Tirar outra foto</span>
                    </button>

                    <button
                      id="btn-cancelar-foto"
                      onClick={handleReset}
                      className="py-3 px-3 rounded-xl bg-slate-950 hover:bg-red-950/30 active:scale-[0.98] text-slate-400 hover:text-red-400 text-xs font-bold border border-slate-800 transition-all flex items-center justify-center gap-1.5"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Cancelar</span>
                    </button>
                  </div>
                </div>
              )}

              {/* State 2: Loading Analysis */}
              {isAnalyzing && (
                <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-6 text-center space-y-3">
                  <div className="relative w-12 h-12 mx-auto">
                    <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
                    <Sparkles className="w-5 h-5 text-amber-400 absolute inset-0 m-auto" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-white">
                      Analisando imagem...
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Identificando para-choque, lataria, alinhamento e gravidade mecânica.
                    </p>
                  </div>
                  <div className="flex justify-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce"></span>
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}

              {/* State 3: Analysis Results (Strictly conforming to user spec) */}
              {analysisResult && (
                <div className="space-y-3.5 animate-in fade-in duration-300">
                  {/* Safety Warning (If severe / not safe to drive) */}
                  {!analysisResult.safeToDrive && (
                    <div className="bg-red-950/80 border-2 border-red-600 rounded-2xl p-4 shadow-xl text-left">
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-0.5 animate-pulse" />
                        <div>
                          <h3 className="text-base font-black text-red-200 uppercase tracking-wide">
                            ⚠️ ATENÇÃO: RISCO AO DIRIGIR
                          </h3>
                          <p className="text-xs text-red-100 font-semibold mt-1">
                            {analysisResult.safetyWarning ||
                              'Não recomendamos continuar dirigindo. O dano pode envolver componentes vitais do veículo (suspensão, radiador ou roda).'}
                          </p>
                          <div className="mt-3">
                            <button
                              id="btn-result-call-guincho"
                              onClick={() => handleFindRecommended('guincho')}
                              className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-600/30"
                            >
                              <Truck className="w-4 h-4" />
                              🚨 ENCONTRAR GUINCHO IMEDIATO
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* General Emergency Guidance if injuries */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-[11px] text-slate-300 flex items-center justify-between gap-2">
                    <span>{analysisResult.emergencyGuidance}</span>
                    <a
                      href="tel:192"
                      className="px-2 py-1 bg-red-600/30 text-red-300 border border-red-500/40 rounded text-[10px] font-bold shrink-0 hover:bg-red-600 hover:text-white"
                    >
                      SAMU 192
                    </a>
                  </div>

                  {/* Identified Damage Card */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-left space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
                          Dano identificado
                        </span>
                        <h3 className="text-base sm:text-lg font-black text-white leading-snug mt-0.5">
                          {analysisResult.identifiedDamage}
                        </h3>
                      </div>
                      <span
                        className={`text-xs font-black px-2.5 py-1 rounded-full shrink-0 ${
                          analysisResult.severity === 'Alta'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                            : analysisResult.severity === 'Moderada'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        }`}
                      >
                        Gravidade: {analysisResult.severity}
                      </span>
                    </div>

                    {/* Possible Services */}
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 block mb-1.5">
                        Possíveis serviços necessários:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {analysisResult.possibleServices.map((service, idx) => (
                          <span
                            key={idx}
                            className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-200"
                          >
                            • {service}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Cost Estimate Section */}
                    <div className="pt-3 border-t border-slate-850">
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-400 block">
                        Estimativa aproximada
                      </span>
                      <div className="text-2xl font-black text-white mt-0.5">
                        {analysisResult.estimatedCost.formattedRange}
                      </div>

                      {(analysisResult.estimatedCost.partsMin || analysisResult.estimatedCost.laborMin) && (
                        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-850 text-xs">
                          {analysisResult.estimatedCost.partsMin && (
                            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/80">
                              <span className="text-slate-400 block text-[10px]">Peças aproximadas:</span>
                              <span className="font-bold text-white">
                                R$ {analysisResult.estimatedCost.partsMin} – R$ {analysisResult.estimatedCost.partsMax}
                              </span>
                            </div>
                          )}
                          {analysisResult.estimatedCost.laborMin && (
                            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/80">
                              <span className="text-slate-400 block text-[10px]">Mão de obra:</span>
                              <span className="font-bold text-white">
                                R$ {analysisResult.estimatedCost.laborMin} – R$ {analysisResult.estimatedCost.laborMax}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      <p className="text-[11px] text-slate-400 italic mt-2">
                        "{analysisResult.disclaimer}"
                      </p>
                    </div>
                  </div>

                  {/* Recommendation and Action Buttons */}
                  <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/40 rounded-2xl p-4 space-y-2.5">
                    <div className="text-xs text-amber-300 font-bold">
                      💡 Recomendação do AutoCheck AI:
                    </div>
                    <p className="text-sm font-semibold text-white">
                      "Pela imagem, recomendamos{' '}
                      <span className="text-amber-400 underline decoration-amber-400 font-bold">
                        {analysisResult.recommendedCategoryLabel}
                      </span>
                      ."
                    </p>

                    {/* Big Button: Find Nearest Recommended Service */}
                    <button
                      id="btn-find-recommended"
                      onClick={() => handleFindRecommended(analysisResult.recommendedCategory)}
                      className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>
                        📍 ENCONTRAR {analysisResult.recommendedCategoryLabel.toUpperCase()} MAIS PRÓXIMA
                      </span>
                    </button>

                    {/* Also offer Tow Truck if safeToDrive is false or as alternative */}
                    <button
                      id="btn-call-guincho-option"
                      onClick={() => handleFindRecommended('guincho')}
                      className="w-full bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white font-bold py-2.5 px-4 rounded-xl text-xs border border-slate-800 flex items-center justify-center gap-2 transition-all"
                    >
                      <Truck className="w-4 h-4 text-amber-400" />
                      <span>🚨 Ou chamar guincho se o carro não puder rodar</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
