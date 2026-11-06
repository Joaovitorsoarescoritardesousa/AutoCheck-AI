import React, { useState } from 'react';
import { X, Search, FileText, CheckCircle2, AlertTriangle, XCircle, Trash2, Calendar, MapPin, Eye } from 'lucide-react';
import { LaudoInspection } from '../types';

interface LaudoHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: LaudoInspection[];
  onSelectLaudo: (laudo: LaudoInspection) => void;
  onDeleteLaudo: (id: string) => void;
  onClearAll: () => void;
}

export const LaudoHistoryModal: React.FC<LaudoHistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onSelectLaudo,
  onDeleteLaudo,
  onClearAll,
}) => {
  const [filterText, setFilterText] = useState('');
  const [verdictFilter, setVerdictFilter] = useState<'todos' | 'APROVADO' | 'APROVADO COM APONTAMENTO' | 'REPROVADO'>('todos');

  if (!isOpen) return null;

  const filtered = history.filter((item) => {
    const matchesText =
      item.vehicle.placa.toLowerCase().includes(filterText.toLowerCase()) ||
      item.vehicle.modelo.toLowerCase().includes(filterText.toLowerCase()) ||
      item.numeroLaudo.toLowerCase().includes(filterText.toLowerCase());

    const matchesVerdict = verdictFilter === 'todos' || item.verdict === verdictFilter;

    return matchesText && matchesVerdict;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">Meus Laudos Cautelares Salvos</h2>
              <p className="text-xs text-slate-400">
                {history.length} laudo{history.length !== 1 ? 's' : ''} registrado{history.length !== 1 ? 's' : ''} neste dispositivo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Buscar por placa, modelo ou protocolo..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setVerdictFilter('todos')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                verdictFilter === 'todos'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Todos ({history.length})
            </button>
            <button
              onClick={() => setVerdictFilter('APROVADO')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                verdictFilter === 'APROVADO'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Aprovados
            </button>
            <button
              onClick={() => setVerdictFilter('APROVADO COM APONTAMENTO')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                verdictFilter === 'APROVADO COM APONTAMENTO'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Apontamentos
            </button>
            <button
              onClick={() => setVerdictFilter('REPROVADO')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                verdictFilter === 'REPROVADO'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Reprovados
            </button>
          </div>
        </div>

        {/* List Content */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <FileText className="w-10 h-10 mx-auto opacity-40" />
              <p className="text-xs font-semibold text-slate-600">
                Nenhum laudo encontrado com os filtros aplicados.
              </p>
            </div>
          ) : (
            filtered.map((item) => {
              const isAprovado = item.verdict === 'APROVADO';
              const isApontamento = item.verdict === 'APROVADO COM APONTAMENTO';

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-sm text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        {item.vehicle.placa}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                          isAprovado
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isApontamento
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {isAprovado && <CheckCircle2 className="w-3 h-3" />}
                        {isApontamento && <AlertTriangle className="w-3 h-3" />}
                        {!isAprovado && !isApontamento && <XCircle className="w-3 h-3" />}
                        <span>{item.verdict}</span>
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        {item.score} pts
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-800">
                      {item.vehicle.marca} {item.vehicle.modelo} {item.vehicle.versao} ({item.vehicle.anoMod})
                    </h4>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {item.dataEmissao}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3" />
                        {item.cidadeUf}
                      </span>
                      <span>•</span>
                      <span className="font-mono text-slate-500">
                        {item.numeroLaudo}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectLaudo(item);
                        onClose();
                      }}
                      className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Abrir Laudo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteLaudo(item.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
                      title="Excluir este laudo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={onClearAll}
              className="text-rose-600 hover:text-rose-700 font-semibold text-[11px] flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Limpar todos os laudos salvos</span>
            </button>
            <span className="text-slate-400 text-[11px]">
              Armazenado com segurança localmente
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
