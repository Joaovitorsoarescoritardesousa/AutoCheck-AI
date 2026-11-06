import React from 'react';
import { PaintPanelItem } from '../types';
import { Sparkles, Gauge } from 'lucide-react';

interface PaintMicrometerVisualProps {
  panels: PaintPanelItem[];
  onChangeMicrons?: (panelId: string, microns: number) => void;
  onSelectPanelForAi?: (panel: PaintPanelItem) => void;
  readOnly?: boolean;
}

export const PaintMicrometerVisual: React.FC<PaintMicrometerVisualProps> = ({
  panels,
  onChangeMicrons,
  onSelectPanelForAi,
  readOnly = false,
}) => {
  const originalCount = panels.filter((p) => p.status === 'original' || p.microns <= 150).length;
  const repinturaCount = panels.filter((p) => (p.status === 'repintura' || (p.microns > 150 && p.microns <= 240))).length;
  const massaCount = panels.filter((p) => p.status === 'massa' || p.microns > 240).length;
  const originalPercent = Math.round((originalCount / panels.length) * 100);

  const getPanelBadge = (microns: number) => {
    if (microns <= 150) {
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
        label: 'Original',
        desc: 'Padrão montadora',
      };
    }
    if (microns <= 240) {
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
        label: 'Repintura',
        desc: 'Retoque / verniz',
      };
    }
    return {
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      dot: 'bg-rose-500',
      label: 'Massa Plástica',
      desc: 'Funilaria pesada',
    };
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Title & Legend Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
              <Gauge className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Mapeamento de Pintura & Micrômetro (µm)
              </h3>
              <p className="text-xs text-slate-500">
                Aferição de espessura de camada em todos os painéis da carroceria
              </p>
            </div>
          </div>
        </div>

        {/* Global Originality Score */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Originalidade
            </span>
            <span className={`text-base font-extrabold ${originalPercent >= 85 ? 'text-emerald-600' : originalPercent >= 65 ? 'text-amber-600' : 'text-rose-600'}`}>
              {originalPercent}% Original
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700 border border-slate-200">
            {originalCount}/{panels.length}
          </div>
        </div>
      </div>

      {/* Micrometer Scale Reference */}
      <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
          <div>
            <span className="font-bold text-slate-800 block leading-tight">80 a 150 µm</span>
            <span className="text-[10px] text-slate-500">Padrão Original</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
          <div>
            <span className="font-bold text-slate-800 block leading-tight">151 a 240 µm</span>
            <span className="text-[10px] text-slate-500">Repintura Estética</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span>
          <div>
            <span className="font-bold text-slate-800 block leading-tight">&gt; 240 µm</span>
            <span className="text-[10px] text-slate-500">Massa Plástica</span>
          </div>
        </div>
      </div>

      {/* Panels Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {panels.map((panel) => {
          const badge = getPanelBadge(panel.microns);
          return (
            <div
              key={panel.id}
              className={`p-3 rounded-xl border transition-all ${badge.bg} flex flex-col justify-between gap-2`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-900 block truncate">
                    {panel.name}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                    <span className="text-[11px] font-semibold">
                      {badge.label}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm font-black text-slate-900 tracking-tight">
                    {panel.microns} <span className="text-[10px] font-medium text-slate-500">µm</span>
                  </span>
                </div>
              </div>

              {panel.notes && (
                <p className="text-[11px] text-slate-600 italic line-clamp-1">
                  {panel.notes}
                </p>
              )}

              {/* Slider for adjusting microns if editable */}
              {!readOnly && onChangeMicrons && (
                <div className="pt-1.5 border-t border-slate-200/60 flex items-center gap-2">
                  <input
                    type="range"
                    min="60"
                    max="500"
                    step="5"
                    value={panel.microns}
                    onChange={(e) => onChangeMicrons(panel.id, Number(e.target.value))}
                    className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                    title={`Ajustar espessura de ${panel.name}`}
                  />
                  {onSelectPanelForAi && (
                    <button
                      type="button"
                      onClick={() => onSelectPanelForAi(panel)}
                      className="p-1 rounded-md bg-white hover:bg-purple-50 text-purple-600 border border-purple-200 text-[10px] font-semibold shrink-0 transition-colors flex items-center gap-0.5"
                      title="Analisar foto desta peça com IA"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>IA</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Chips */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span>Originais: <strong className="text-emerald-700">{originalCount}</strong></span>
          <span>Repinturas: <strong className="text-amber-700">{repinturaCount}</strong></span>
          <span>Massa: <strong className="text-rose-700">{massaCount}</strong></span>
        </div>
        <span className="text-[11px] text-slate-400">
          Tolerância técnica de micrômetro calibrado: ± 3%
        </span>
      </div>
    </div>
  );
};
