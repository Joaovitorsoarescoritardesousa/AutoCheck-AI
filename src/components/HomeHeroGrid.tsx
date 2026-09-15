import React from 'react';
import { Wrench, Disc, Zap, Truck, Camera, ArrowRight, AlertTriangle } from 'lucide-react';
import { ServiceCategory } from '../types';

interface HomeHeroGridProps {
  onSelectCategory: (category: ServiceCategory) => void;
  onOpenCrashModal: () => void;
  onSelectEmergencyMode: (category?: ServiceCategory) => void;
}

export const HomeHeroGrid: React.FC<HomeHeroGridProps> = ({
  onSelectCategory,
  onOpenCrashModal,
}) => {
  return (
    <div className="space-y-4">
      {/* 4 Large Main Service Buttons */}
      <div className="grid grid-cols-2 gap-3">
        {/* 1. Mecânico */}
        <button
          id="btn-category-mecanico"
          onClick={() => onSelectCategory('mecanico')}
          className="group relative bg-gradient-to-b from-slate-900 to-slate-950 hover:from-slate-850 hover:to-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-4 text-left shadow-lg active:scale-[0.98] transition-all flex flex-col justify-between min-h-[140px]"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Wrench className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-blue-400 font-bold block mb-0.5">
              🚗 Oficina
            </span>
            <h2 className="text-lg font-black text-white leading-snug">
              Mecânico
            </h2>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
              Encontrar o mais próximo
            </p>
          </div>
        </button>

        {/* 2. Borracheiro */}
        <button
          id="btn-category-borracheiro"
          onClick={() => onSelectCategory('borracheiro')}
          className="group relative bg-gradient-to-b from-slate-900 to-slate-950 hover:from-slate-850 hover:to-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-4 text-left shadow-lg active:scale-[0.98] transition-all flex flex-col justify-between min-h-[140px]"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Disc className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-amber-400 font-bold block mb-0.5">
              🛞 Pneu & Roda
            </span>
            <h2 className="text-lg font-black text-white leading-snug">
              Borracheiro
            </h2>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
              Encontrar o mais próximo
            </p>
          </div>
        </button>

        {/* 3. Eletricista */}
        <button
          id="btn-category-eletricista"
          onClick={() => onSelectCategory('eletricista')}
          className="group relative bg-gradient-to-b from-slate-900 to-slate-950 hover:from-slate-850 hover:to-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-4 text-left shadow-lg active:scale-[0.98] transition-all flex flex-col justify-between min-h-[140px]"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Zap className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-purple-400 font-bold block mb-0.5">
              🔌 Bateria & Pane
            </span>
            <h2 className="text-lg font-black text-white leading-snug">
              Eletricista
            </h2>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
              Encontrar o mais próximo
            </p>
          </div>
        </button>

        {/* 4. Guincho */}
        <button
          id="btn-category-guincho"
          onClick={() => onSelectCategory('guincho')}
          className="group relative bg-gradient-to-b from-amber-950/40 to-slate-950 hover:from-amber-950/60 hover:to-slate-900 border border-amber-600/40 hover:border-amber-400 rounded-2xl p-4 text-left shadow-lg active:scale-[0.98] transition-all flex flex-col justify-between min-h-[140px]"
        >
          <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Truck className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-red-400 font-bold block mb-0.5 flex items-center gap-1">
              🚨 Socorro Urgente
            </span>
            <h2 className="text-lg font-black text-white leading-snug">
              Guincho
            </h2>
            <p className="text-[11px] text-amber-300/90 font-medium mt-1 line-clamp-1">
              Preciso de ajuda agora
            </p>
          </div>
        </button>
      </div>

      {/* 5th Highlighted Option: ANALISAR BATIDA (Tive uma batida) */}
      <button
        id="btn-analisar-batida"
        onClick={onOpenCrashModal}
        className="w-full relative overflow-hidden group bg-slate-900/90 hover:bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 hover:border-amber-500/50 shadow-lg active:scale-[0.99] transition-all text-left"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
              <Camera className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Análise da Batida
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/20">
                  IA
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Diagnóstico visual por foto com estimativa de danos e custos
              </p>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shrink-0 text-slate-300 group-hover:text-amber-400 group-hover:border-amber-500/40 transition-colors">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </button>
    </div>
  );
};
