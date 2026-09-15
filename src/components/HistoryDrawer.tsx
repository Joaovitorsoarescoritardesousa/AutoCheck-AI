import React from 'react';
import { X, Trash2, Calendar, Wrench, ShieldAlert, ArrowRight } from 'lucide-react';
import { CrashHistoryItem } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: CrashHistoryItem[];
  onClearHistory: () => void;
  onSelectHistoryItem: (item: CrashHistoryItem) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory,
  onSelectHistoryItem,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col p-5 shadow-2xl">
        {/* Top bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-black text-white">
              Histórico de Análises
            </h2>
            <p className="text-xs text-slate-400">
              Registros salvos localmente no seu aparelho
            </p>
          </div>
          <button
            id="btn-close-history"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-12 px-4 text-slate-400">
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500">
                <Wrench className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-white">
                Nenhuma análise no histórico
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Ao tirar uma foto e analisar uma batida com a IA, o relatório ficará salvo aqui para consulta.
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-2.5 shadow-md hover:border-slate-700 transition-all"
              >
                <div className="flex gap-3">
                  <img
                    src={item.photoUrl}
                    alt={item.damage}
                    className="w-20 h-20 object-cover rounded-xl border border-slate-800 shrink-0 bg-slate-900"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 text-[10px] text-slate-400 mb-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.date).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span
                        className={`font-bold px-1.5 py-0.5 rounded text-[9px] ${
                          item.severity === 'Alta'
                            ? 'bg-red-500/20 text-red-400'
                            : item.severity === 'Moderada'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {item.severity}
                      </span>
                    </div>

                    <h4 className="text-xs font-black text-white line-clamp-2 leading-tight">
                      {item.damage}
                    </h4>

                    <div className="text-xs font-black text-amber-400 mt-1">
                      {item.estimate}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">
                    Recomendado:{' '}
                    <span className="font-bold text-white">{item.recommendedService}</span>
                  </span>
                  {!item.safeToDrive && (
                    <span className="text-[10px] text-red-400 font-bold flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> Reboque indicado
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="pt-3 border-t border-slate-800">
            <button
              id="btn-clear-history"
              onClick={onClearHistory}
              className="w-full py-2.5 px-3 rounded-xl border border-red-900/60 text-red-400 hover:bg-red-950/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar histórico</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
