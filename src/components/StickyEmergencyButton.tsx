import React, { useState } from 'react';
import { AlertOctagon, Wrench, Disc, Zap, Truck, X } from 'lucide-react';
import { ServiceCategory } from '../types';

interface StickyEmergencyButtonProps {
  onSelectCategory: (category: ServiceCategory) => void;
}

export const StickyEmergencyButton: React.FC<StickyEmergencyButtonProps> = ({
  onSelectCategory,
}) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handlePick = (category: ServiceCategory) => {
    setIsSheetOpen(false);
    onSelectCategory(category);
  };

  return (
    <>
      {/* Floating Bottom Button */}
      <div className="fixed bottom-4 left-0 right-0 z-40 px-4 pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          <button
            id="btn-sticky-emergency"
            onClick={() => setIsSheetOpen(true)}
            className="w-full bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-black text-base py-3.5 px-5 rounded-2xl shadow-2xl shadow-red-600/40 border border-red-400/50 flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all"
            aria-label="Preciso de ajuda urgente"
          >
            <AlertOctagon className="w-5 h-5 animate-pulse" />
            <span className="tracking-wide">🚨 PRECISO DE AJUDA AGORA</span>
          </button>
        </div>
      </div>

      {/* Quick Choice Drawer */}
      {isSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 font-bold text-sm">
                  SOS
                </span>
                <div>
                  <h3 className="text-lg font-black text-white leading-tight">
                    O que você precisa agora?
                  </h3>
                  <p className="text-xs text-slate-400">
                    Toque para ver profissionais a poucos minutos
                  </p>
                </div>
              </div>
              <button
                id="btn-close-sticky-sheet"
                onClick={() => setIsSheetOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                id="btn-quick-guincho"
                onClick={() => handlePick('guincho')}
                className="p-4 rounded-2xl bg-red-950/60 border-2 border-red-600/60 hover:border-red-500 text-left transition-all active:scale-95"
              >
                <Truck className="w-7 h-7 text-red-400 mb-2" />
                <h4 className="text-base font-black text-white">🚨 Guincho</h4>
                <p className="text-[11px] text-red-200 mt-0.5">Socorro imediato</p>
              </button>

              <button
                id="btn-quick-borracheiro"
                onClick={() => handlePick('borracheiro')}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500 text-left transition-all active:scale-95"
              >
                <Disc className="w-7 h-7 text-amber-400 mb-2" />
                <h4 className="text-base font-black text-white">🛞 Borracheiro</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Pneu furado / socorro</p>
              </button>

              <button
                id="btn-quick-mecanico"
                onClick={() => handlePick('mecanico')}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-blue-500 text-left transition-all active:scale-95"
              >
                <Wrench className="w-7 h-7 text-blue-400 mb-2" />
                <h4 className="text-base font-black text-white">🔧 Mecânico</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Oficina mais próxima</p>
              </button>

              <button
                id="btn-quick-eletricista"
                onClick={() => handlePick('eletricista')}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-purple-500 text-left transition-all active:scale-95"
              >
                <Zap className="w-7 h-7 text-purple-400 mb-2" />
                <h4 className="text-base font-black text-white">🔌 Eletricista</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Bateria e pane elétrica</p>
              </button>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Ou ligue para socorro público:</span>
              <div className="flex gap-2">
                <a href="tel:192" className="text-red-400 font-bold hover:underline">SAMU 192</a>
                <span>•</span>
                <a href="tel:193" className="text-red-400 font-bold hover:underline">Bombeiros 193</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
