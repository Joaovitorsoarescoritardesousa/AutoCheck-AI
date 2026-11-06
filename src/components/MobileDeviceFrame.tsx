import React from 'react';
import { Smartphone, Monitor, Wifi, Battery, Signal, Camera } from 'lucide-react';

interface MobileDeviceFrameProps {
  children: React.ReactNode;
  isMobileDeviceView: boolean;
  onToggleView: (isMobile: boolean) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  savedCount: number;
  onQuickCamera?: () => void;
}

export const MobileDeviceFrame: React.FC<MobileDeviceFrameProps> = ({
  children,
  isMobileDeviceView,
  onToggleView,
  activeTab,
  onSelectTab,
  savedCount,
  onQuickCamera,
}) => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center">
      {/* Top Device Switcher Toolbar (Hidden in print) */}
      <div className="print:hidden w-full bg-slate-950/90 border-b border-slate-800 px-4 py-2 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
          <span className="text-xs font-bold text-white tracking-wide">
            App Laudo Cautelar Veicular
          </span>
          <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
            Padrão Mobile Brasil
          </span>
        </div>

        {/* View mode toggle: Smartphone vs Full Screen */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => onToggleView(true)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              isMobileDeviceView
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Visualizar como aplicativo no celular"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Ver no Celular</span>
          </button>

          <button
            type="button"
            onClick={() => onToggleView(false)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              !isMobileDeviceView
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Visualizar em tela cheia"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Tela Cheia</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full flex-1 flex items-center justify-center p-0 sm:p-6 sm:py-8">
        {isMobileDeviceView ? (
          /* Realistic Smartphone Mockup Frame */
          <div className="relative w-full max-w-[412px] h-[92vh] max-h-[890px] bg-slate-950 rounded-[44px] p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_0_10px_#1e293b,0_0_0_12px_#0f172a] border-4 border-slate-800 flex flex-col overflow-hidden">
            {/* Phone Screen Container */}
            <div className="w-full h-full bg-slate-50 text-slate-900 rounded-[34px] overflow-hidden flex flex-col relative shadow-inner">
              {/* iOS / Android Status Bar */}
              <div className="print:hidden h-10 bg-slate-900 text-white px-6 flex items-center justify-between text-xs select-none shrink-0 z-30">
                <span className="font-semibold text-[11px] tracking-tight">09:41</span>
                {/* Dynamic Island / Speaker Pill */}
                <div className="w-20 h-4 bg-black rounded-full mx-auto -mt-1 flex items-center justify-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-900/80 mr-1.5"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-900"></span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Signal className="w-3 h-3" />
                  <Wifi className="w-3 h-3" />
                  <Battery className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Scrollable Mobile App Body */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth pb-16">
                {children}
              </div>

              {/* Mobile Native Bottom Navigation Bar */}
              <div className="print:hidden absolute bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 flex items-center justify-around z-30 shadow-lg">
                <button
                  type="button"
                  onClick={() => onSelectTab('search')}
                  className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all ${
                    activeTab === 'search' ? 'text-blue-600 font-bold scale-105' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span className="text-lg">🔍</span>
                  <span className="text-[10px] leading-tight">Buscar</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectTab('editor')}
                  className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all ${
                    activeTab === 'editor' ? 'text-blue-600 font-bold scale-105' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span className="text-lg">📋</span>
                  <span className="text-[10px] leading-tight">Vistoria</span>
                </button>

                {/* Central Quick Camera Button */}
                {onQuickCamera && (
                  <button
                    type="button"
                    onClick={onQuickCamera}
                    className="flex flex-col items-center justify-center -mt-5 transition-transform active:scale-95 group px-1"
                    title="Tirar Foto com a Câmera"
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/40 border-2 border-white group-hover:bg-blue-700 transition-colors">
                      <Camera className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <span className="text-[10px] font-bold text-blue-600 mt-0.5">Câmera</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onSelectTab('certificate')}
                  className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all ${
                    activeTab === 'certificate' ? 'text-blue-600 font-bold scale-105' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span className="text-lg">📄</span>
                  <span className="text-[10px] leading-tight">Laudo</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectTab('history')}
                  className={`relative flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all ${
                    activeTab === 'history' ? 'text-blue-600 font-bold scale-105' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span className="text-lg">📁</span>
                  <span className="text-[10px] leading-tight">Salvos</span>
                  {savedCount > 0 && (
                    <span className="absolute top-1 right-4 w-3.5 h-3.5 bg-blue-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                      {savedCount}
                    </span>
                  )}
                </button>
              </div>

              {/* iPhone Home Bar indicator */}
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-900/30 rounded-full pointer-events-none z-30"></div>
            </div>
          </div>
        ) : (
          /* Full Screen Responsive View */
          <div className="w-full max-w-4xl bg-slate-100 text-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700/50">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};
