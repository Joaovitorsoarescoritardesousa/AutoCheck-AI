import React from 'react';
import { ShieldCheck, Plus, History, Camera, Search, FileText, CheckCircle2, FolderOpen } from 'lucide-react';

interface HeaderProps {
  onOpenHistory: () => void;
  onNewLaudo: () => void;
  onOpenAiInspection: () => void;
  historyCount: number;
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
  onQuickCamera?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHistory,
  onNewLaudo,
  onOpenAiInspection,
  historyCount,
  activeTab,
  onSelectTab,
  onQuickCamera,
}) => {
  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3.5 sm:px-6 py-2.5 shadow-2xs">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        {/* Brand identity */}
        <div
          onClick={() => onSelectTab?.('search')}
          className="flex items-center gap-2.5 cursor-pointer select-none"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 leading-none">
                Laudo <span className="text-blue-600">Cautelar</span>
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200/80">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium leading-none mt-0.5 hidden xs:block">
              Perícia de Identificação, Lataria & Estrutura
            </p>
          </div>
        </div>

        {/* Center Desktop Navigation Tabs (Hidden on mobile phones) */}
        {onSelectTab && (
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => onSelectTab('search')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'search'
                  ? 'bg-white text-blue-600 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Consultar Placa</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('editor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'editor'
                  ? 'bg-white text-blue-600 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Vistoria</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('certificate')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'certificate'
                  ? 'bg-white text-blue-600 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Laudo Oficial</span>
            </button>

            <button
              type="button"
              onClick={onOpenHistory}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 transition-all"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Salvos</span>
              {historyCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                  {historyCount}
                </span>
              )}
            </button>
          </nav>
        )}

        {/* Right action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Single Unified Camera Trigger (shown on desktop, where mobile bottom nav is hidden) */}
          {onQuickCamera && (
            <button
              id="btn-header-camera-quick"
              onClick={onQuickCamera}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 active:scale-95 transition-all text-xs font-bold cursor-pointer"
              title="Abrir Câmera para Tirar Foto"
            >
              <Camera className="w-4 h-4 text-blue-600" />
              <span>Câmera</span>
            </button>
          )}

          {/* New Laudo Button */}
          <button
            id="btn-header-novo-laudo"
            onClick={onNewLaudo}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
            title="Iniciar Novo Laudo Cautelar"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Novo</span>
          </button>

          {/* History Icon Button (Mobile visible) */}
          <button
            id="btn-header-history"
            onClick={onOpenHistory}
            className="md:hidden relative p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 active:scale-95 transition-all cursor-pointer"
            title="Histórico de Laudos"
          >
            <History className="w-4 h-4" />
            {historyCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
                {historyCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
