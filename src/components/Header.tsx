import React from 'react';
import { ShieldAlert, History, PhoneCall, Zap } from 'lucide-react';

interface HeaderProps {
  onOpenHistory: () => void;
  onOpenEmergencyCall: () => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHistory,
  onOpenEmergencyCall,
  historyCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/20">
            <Zap className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-extrabold tracking-tight text-white leading-none">
                AutoCheck <span className="text-amber-400">AI</span>
              </h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                SOS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              Precisou de ajuda? Resolva rápido.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-emergency-hotline"
            onClick={onOpenEmergencyCall}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-950/80 text-red-300 border border-red-800/60 hover:bg-red-900/60 active:scale-95 transition-all text-xs font-bold"
            title="Ligar para Emergência (192/193)"
          >
            <PhoneCall className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            <span>192/193</span>
          </button>

          <button
            id="btn-view-history"
            onClick={onOpenHistory}
            className="relative p-2 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800 hover:text-white active:scale-95 transition-all"
            title="Histórico de Análises"
            aria-label="Abrir histórico de batidas"
          >
            <History className="w-4 h-4" />
            {historyCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center">
                {historyCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
