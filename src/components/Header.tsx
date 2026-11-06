import React from 'react';
import { ShieldCheck, Plus, History, Camera } from 'lucide-react';

interface HeaderProps {
  onOpenHistory: () => void;
  onNewLaudo: () => void;
  onOpenAiInspection: () => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHistory,
  onNewLaudo,
  onOpenAiInspection,
  historyCount,
}) => {
  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3.5 py-2.5 shadow-2xs">
      <div className="flex items-center justify-between gap-2">
        {/* Brand identity */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <ShieldCheck className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold tracking-tight text-slate-900 leading-none">
                Laudo <span className="text-blue-600">Cautelar</span>
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200/80">
                APP
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium leading-none mt-0.5">
              Histórico, Lataria & Estrutura
            </p>
          </div>
        </div>

        {/* Right app bar actions */}
        <div className="flex items-center gap-1.5">
          {/* Quick Photo AI */}
          <button
            id="btn-header-camera-ai"
            onClick={onOpenAiInspection}
            className="p-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 active:scale-95 transition-all"
            title="Análise com IA por Foto"
          >
            <Camera className="w-4 h-4 text-purple-600" />
          </button>

          {/* New Laudo */}
          <button
            id="btn-header-novo-laudo"
            onClick={onNewLaudo}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
            title="Novo Laudo Cautelar"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="text-[11px]">Novo</span>
          </button>

          {/* History */}
          <button
            id="btn-header-history"
            onClick={onOpenHistory}
            className="relative p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 active:scale-95 transition-all"
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
