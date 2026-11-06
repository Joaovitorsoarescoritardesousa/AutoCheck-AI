import React from 'react';
import { Camera, Search, FileText, CheckCircle2, FolderOpen } from 'lucide-react';

interface MobileDeviceFrameProps {
  children: React.ReactNode;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  savedCount: number;
  onQuickCamera?: () => void;
}

export const MobileDeviceFrame: React.FC<MobileDeviceFrameProps> = ({
  children,
  activeTab,
  onSelectTab,
  savedCount,
  onQuickCamera,
}) => {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col antialiased">
      {/* Main Content Area (Responsive Desktop & Mobile) */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-3 sm:px-6 py-3 sm:py-6 pb-24 md:pb-8">
        {children}
      </main>

      {/* Mobile-Only Bottom Navigation Bar (Hidden on Desktop) */}
      <nav
        aria-label="Navegação Mobile"
        className="md:hidden print:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 flex items-center justify-around z-30 shadow-lg"
      >
        <button
          type="button"
          onClick={() => onSelectTab('search')}
          className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all ${
            activeTab === 'search' ? 'text-blue-600 font-bold scale-105' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] leading-tight">Buscar</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('editor')}
          className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all ${
            activeTab === 'editor' ? 'text-blue-600 font-bold scale-105' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span className="text-[10px] leading-tight">Vistoria</span>
        </button>

        {/* Central Quick Camera Button on Mobile */}
        {onQuickCamera && (
          <button
            type="button"
            onClick={onQuickCamera}
            className="flex flex-col items-center justify-center -mt-6 transition-transform active:scale-90 group px-1"
            title="Tirar Foto com a Câmera"
          >
            <div className="w-13 h-13 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/40 border-2 border-white group-hover:bg-blue-700 transition-colors">
              <Camera className="w-6 h-6 stroke-[2.2]" />
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
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-[10px] leading-tight">Laudo</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('history')}
          className={`relative flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all ${
            activeTab === 'history' ? 'text-blue-600 font-bold scale-105' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FolderOpen className="w-5 h-5" />
          <span className="text-[10px] leading-tight">Salvos</span>
          {savedCount > 0 && (
            <span className="absolute top-1 right-3 w-4 h-4 bg-blue-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
              {savedCount}
            </span>
          )}
        </button>
      </nav>
    </div>
  );
};
