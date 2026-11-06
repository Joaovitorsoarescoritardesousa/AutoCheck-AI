import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  X,
  RotateCcw,
  Check,
  SwitchCamera,
  Zap,
  ZapOff,
  Grid,
  AlertCircle,
  FolderOpen,
  RefreshCw,
} from 'lucide-react';

interface CameraViewfinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapturePhoto: (photoBase64: string) => void;
  categoryLabel?: string;
  instruction?: string;
}

export const CameraViewfinderModal: React.FC<CameraViewfinderModalProps> = ({
  isOpen,
  onClose,
  onCapturePhoto,
  categoryLabel = 'Foto do Veículo',
  instruction = 'Enquadre a peça, placa ou detalhe dentro da marcação',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileFallbackInputRef = useRef<HTMLInputElement>(null);

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);

  // Play a realistic mechanical shutter click sound using Web Audio API
  const playShutterSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Quick dual-click burst simulating shutter opening and closing
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch {
      // Audio playback might be restricted if user hasn't interacted, ignore gracefully
    }
  }, []);

  // Stop camera tracks cleanly
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsTorchOn(false);
  }, []);

  // Start live camera stream
  const startCamera = useCallback(async () => {
    if (!isOpen) return;

    setIsLoading(true);
    setCameraError(null);
    stopStream();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Câmera não suportada neste navegador.');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      // Check if torch/flashlight is supported
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const capabilities = (videoTrack.getCapabilities && videoTrack.getCapabilities()) as any;
        if (capabilities && capabilities.torch) {
          setHasTorch(true);
        } else {
          setHasTorch(false);
        }
      }
    } catch (err: any) {
      console.warn('Camera access failed, falling back:', err);
      let message = 'Não foi possível acessar a câmera.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message = 'Permissão para usar a câmera foi negada. Permita o acesso nas configurações do navegador ou use o envio de arquivo.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message = 'Nenhuma câmera detectada neste aparelho. Você pode selecionar uma foto da galeria.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        message = 'A câmera está sendo utilizada por outro aplicativo. Feche outros apps e tente novamente.';
      }
      setCameraError(message);
    } finally {
      setIsLoading(false);
    }
  }, [isOpen, facingMode, stopStream]);

  // Toggle Torch/Flashlight
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;

    try {
      const nextState = !isTorchOn;
      await (track as any).applyConstraints({
        advanced: [{ torch: nextState }],
      });
      setIsTorchOn(nextState);
    } catch (e) {
      console.warn('Torch toggle failed:', e);
    }
  };

  // Switch between front and rear cameras
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Lifecycle
  useEffect(() => {
    if (isOpen) {
      setCapturedImage(null);
      startCamera();
    } else {
      stopStream();
      setCapturedImage(null);
    }

    return () => {
      stopStream();
    };
  }, [isOpen, facingMode, startCamera, stopStream]);

  // Capture current frame from live video
  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Trigger visual flash and sound
    setIsFlashing(true);
    playShutterSound();
    setTimeout(() => setIsFlashing(false), 180);

    // If using user/front camera, flip horizontally for mirror preview match
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get high-quality JPEG
    const base64 = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedImage(base64);

    // Stop video tracks while reviewing photo
    stopStream();
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  // Confirm photo and pass back
  const handleConfirm = () => {
    if (capturedImage) {
      onCapturePhoto(capturedImage);
      handleClose();
    }
  };

  // Close modal
  const handleClose = () => {
    stopStream();
    setCapturedImage(null);
    onClose();
  };

  // Fallback: Pick file from gallery/disk if camera fails
  const handleFallbackFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setCapturedImage(base64);
      stopStream();
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between select-none animate-in fade-in duration-200">
      {/* Hidden fallback file input */}
      <input
        ref={fileFallbackInputRef}
        type="file"
        accept="image/*"
        onChange={handleFallbackFile}
        className="hidden"
      />

      {/* Camera Top Bar */}
      <div className="w-full px-4 py-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="w-9 h-9 rounded-full bg-black/50 text-white hover:bg-black/80 flex items-center justify-center backdrop-blur-sm transition-all"
            title="Fechar Câmera"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <h3 className="text-white text-xs font-bold leading-tight flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              <span>{categoryLabel}</span>
            </h3>
            <p className="text-[10px] text-slate-300 line-clamp-1">{instruction}</p>
          </div>
        </div>

        {/* Action icons (Grid, Torch, Flip) */}
        {!capturedImage && !cameraError && (
          <div className="flex items-center gap-2">
            {hasTorch && (
              <button
                type="button"
                onClick={toggleTorch}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  isTorchOn
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'bg-black/50 text-white hover:bg-black/80 backdrop-blur-sm'
                }`}
                title="Luz / Flash"
              >
                {isTorchOn ? <Zap className="w-4 h-4 fill-current" /> : <ZapOff className="w-4 h-4" />}
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowGrid(!showGrid)}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                showGrid
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-black/50 text-slate-300 hover:bg-black/80 backdrop-blur-sm'
              }`}
              title="Linhas de Enquadramento"
            >
              <Grid className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={toggleFacingMode}
              className="w-9 h-9 rounded-full bg-black/50 text-white hover:bg-black/80 flex items-center justify-center backdrop-blur-sm transition-all"
              title="Alternar Câmera Frontal / Traseira"
            >
              <SwitchCamera className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Main Viewport Container */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden bg-black">
        {/* Shutter White Flash Animation */}
        {isFlashing && (
          <div className="absolute inset-0 bg-white z-40 pointer-events-none animate-out fade-out duration-150" />
        )}

        {/* Live Video Preview */}
        {!capturedImage && !cameraError && (
          <div className="relative w-full h-full flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
            />

            {/* Grid Overlay */}
            {showGrid && (
              <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 z-10 border border-white/20">
                <div className="border-r border-b border-white/20"></div>
                <div className="border-r border-b border-white/20"></div>
                <div className="border-b border-white/20"></div>
                <div className="border-r border-b border-white/20"></div>
                <div className="border-r border-b border-white/20"></div>
                <div className="border-b border-white/20"></div>
                <div className="border-r border-white/20"></div>
                <div className="border-r border-white/20"></div>
                <div></div>
              </div>
            )}

            {/* Vehicle Inspection Target Reticle (Corner Brackets) */}
            <div className="absolute inset-8 sm:inset-16 pointer-events-none z-10 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="w-8 h-8 border-t-2 border-l-2 border-blue-400 rounded-tl-lg shadow-sm"></div>
                <div className="w-8 h-8 border-t-2 border-r-2 border-blue-400 rounded-tr-lg shadow-sm"></div>
              </div>

              {/* Center Crosshair / Instruction Pill */}
              <div className="self-center bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-lg">
                <Camera className="w-3.5 h-3.5 text-blue-400" />
                <span>Mantenha o foco firme e clique no botão circular</span>
              </div>

              <div className="flex justify-between items-end">
                <div className="w-8 h-8 border-b-2 border-l-2 border-blue-400 rounded-bl-lg shadow-sm"></div>
                <div className="w-8 h-8 border-b-2 border-r-2 border-blue-400 rounded-br-lg shadow-sm"></div>
              </div>
            </div>

            {isLoading && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-3 z-30 text-white">
                <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
                <span className="text-xs font-semibold">Abrindo a câmera do celular...</span>
              </div>
            )}
          </div>
        )}

        {/* Captured Photo Preview State */}
        {capturedImage && (
          <div className="relative w-full h-full flex flex-col items-center justify-center p-2 bg-slate-950">
            <img
              src={capturedImage}
              alt="Foto Capturada"
              className="max-h-[75vh] w-auto max-w-full object-contain rounded-2xl border border-white/20 shadow-2xl"
            />
            <div className="absolute top-4 left-4 bg-emerald-600/90 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-md">
              <Check className="w-3.5 h-3.5" />
              <span>Foto Capturada</span>
            </div>
          </div>
        )}

        {/* Camera Error / Permission Fallback Screen */}
        {cameraError && !capturedImage && (
          <div className="max-w-md mx-auto p-6 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-4 text-white z-20 m-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Acesso à Câmera</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{cameraError}</p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={startCamera}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Tentar Novamente</span>
              </button>

              <button
                type="button"
                onClick={() => fileFallbackInputRef.current?.click()}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-2 border border-slate-700 transition-all active:scale-95"
              >
                <FolderOpen className="w-4 h-4 text-blue-400" />
                <span>Escolher Foto da Galeria / Arquivo</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Camera Bottom Controls */}
      <div className="w-full bg-gradient-to-t from-black via-black/80 to-transparent p-4 pb-8 flex items-center justify-around z-20 shrink-0">
        {!capturedImage ? (
          <>
            {/* Gallery Fallback Option */}
            <button
              type="button"
              onClick={() => fileFallbackInputRef.current?.click()}
              className="flex flex-col items-center gap-1 text-slate-300 hover:text-white transition-all text-[10px] font-medium"
              title="Abrir Arquivo ou Galeria"
            >
              <div className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-slate-200" />
              </div>
              <span>Galeria</span>
            </button>

            {/* Shutter Button */}
            <button
              type="button"
              onClick={handleCapture}
              disabled={isLoading || !!cameraError}
              className="relative w-18 h-18 rounded-full border-4 border-white/80 p-1 flex items-center justify-center active:scale-90 transition-transform disabled:opacity-40"
              title="Capturar Foto"
            >
              <div className="w-full h-full bg-white rounded-full hover:bg-slate-100 shadow-[0_0_15px_rgba(255,255,255,0.6)] flex items-center justify-center">
                <Camera className="w-6 h-6 text-slate-900" />
              </div>
            </button>

            {/* Flip Camera Option */}
            <button
              type="button"
              onClick={toggleFacingMode}
              className="flex flex-col items-center gap-1 text-slate-300 hover:text-white transition-all text-[10px] font-medium"
              title="Girar Câmera"
            >
              <div className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
                <SwitchCamera className="w-5 h-5 text-slate-200" />
              </div>
              <span>Inverter</span>
            </button>
          </>
        ) : (
          /* Review / Confirm Controls */
          <div className="w-full max-w-sm flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={handleRetake}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Tirar Outra</span>
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-95 transition-all"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Usar Foto</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
