import React from 'react';
import { AlertCircle, X, ChevronRight, ShieldAlert, PhoneCall } from 'lucide-react';
import { EMERGENCY_PROBLEMS } from '../data/mockProviders';
import { EmergencyProblemId, ServiceCategory } from '../types';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProblem: (problemId: EmergencyProblemId, category: ServiceCategory) => void;
  onOpenCrashModal: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
  onSelectProblem,
  onOpenCrashModal,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl max-h-[92vh] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="emergency-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black animate-pulse">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-red-400">
                MODO DE EMERGÊNCIA
              </span>
              <h2 id="emergency-title" className="text-xl font-black text-white leading-tight">
                O que aconteceu?
              </h2>
            </div>
          </div>

          <button
            id="btn-close-emergency-modal"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 py-2.5">
          Fique calmo. Escolha a opção abaixo e nós encontramos a ajuda ideal na sua localização:
        </p>

        {/* Problems List */}
        <div className="space-y-2.5 overflow-y-auto pr-1 py-1">
          {EMERGENCY_PROBLEMS.map((problem) => (
            <button
              key={problem.id}
              id={`btn-emergency-${problem.id}`}
              onClick={() => {
                if (problem.id === 'batida') {
                  onClose();
                  onOpenCrashModal();
                } else {
                  onSelectProblem(problem.id, problem.recommendedCategory);
                }
              }}
              className="w-full group bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-amber-500 rounded-2xl p-3.5 text-left flex items-center justify-between gap-3 active:scale-[0.98] transition-all shadow-md"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <span className="text-2xl shrink-0 p-2 rounded-xl bg-slate-900 border border-slate-800 group-hover:scale-110 transition-transform">
                  {problem.icon}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                      {problem.label}
                    </h3>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 shrink-0">
                      ➔ {problem.categoryLabel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {problem.subtitle}
                  </p>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-slate-800 group-hover:bg-amber-500 group-hover:text-slate-950 text-slate-400 flex items-center justify-center shrink-0 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          ))}
        </div>

        {/* Safety Hotline Note */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2 bg-red-950/40 p-3 rounded-xl border border-red-900/50">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <p className="text-[11px] text-red-200">
              Vítimas ou risco de vida?
            </p>
          </div>
          <div className="flex gap-2">
            <a
              id="link-call-samu-emergency"
              href="tel:192"
              className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold flex items-center gap-1"
            >
              <PhoneCall className="w-3 h-3" /> SAMU 192
            </a>
            <a
              id="link-call-bombeiros-emergency"
              href="tel:193"
              className="px-2.5 py-1 bg-red-700 hover:bg-red-600 text-white rounded-lg text-xs font-bold flex items-center gap-1"
            >
              193
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
