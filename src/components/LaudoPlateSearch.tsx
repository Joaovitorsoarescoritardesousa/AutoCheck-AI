import React, { useState } from 'react';
import { Search, CheckCircle2, AlertTriangle, XCircle, ArrowRight, ShieldCheck, FileSearch, Sparkles, DollarSign, Clock, AlertOctagon } from 'lucide-react';
import { DEMO_LAUDOS } from '../data/mockVehicles';
import { LaudoInspection } from '../types';

interface LaudoPlateSearchProps {
  onSearchPlate: (plate: string) => void;
  onSelectDemoLaudo: (laudo: LaudoInspection) => void;
  onOpenAiQuickCheck: () => void;
  isSearching?: boolean;
}

export const LaudoPlateSearch: React.FC<LaudoPlateSearchProps> = ({
  onSearchPlate,
  onSelectDemoLaudo,
  onOpenAiQuickCheck,
  isSearching = false,
}) => {
  const [plateInput, setPlateInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = plateInput.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (clean.length >= 7) {
      onSearchPlate(clean);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
    setPlateInput(raw);
  };

  return (
    <div className="space-y-4 p-3.5">
      {/* Mobile Hero Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4 sm:p-5 text-white shadow-md border border-slate-800">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[10px] font-bold mb-2">
          <ShieldCheck className="w-3 h-3 text-blue-400" />
          Laudo Cautelar Digital via App
        </div>

        <h1 className="text-lg sm:text-xl font-black tracking-tight text-white leading-snug">
          Consulte o Histórico & Emita o Laudo Cautelar
        </h1>

        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
          Leilão, sinistros, perda total, FIPE, odômetro, micrômetro de pintura e estrutura monobloco na palma da mão.
        </p>

        {/* Brazilian Plate UI Box (Mobile Size) */}
        <form onSubmit={handleSubmit} className="mt-3.5 space-y-2.5">
          <div className="relative max-w-[260px] mx-auto bg-white rounded-xl border-3 border-slate-900 shadow-md overflow-hidden">
            {/* Mercosul Blue Header */}
            <div className="bg-[#003399] px-2.5 py-0.5 flex items-center justify-between text-white text-[10px] font-bold">
              <div className="flex items-center gap-1">
                <span className="w-3 h-2 bg-[#009b3a] inline-flex items-center justify-center relative overflow-hidden rounded-[1px]">
                  <span className="w-1 h-1 bg-[#fedf00] rotate-45"></span>
                </span>
                <span className="tracking-wide">BRASIL</span>
              </div>
              <span className="text-[8px] opacity-80 uppercase tracking-widest font-mono">MERCOSUL</span>
            </div>

            {/* Input */}
            <div className="px-2 py-1.5 flex items-center justify-center bg-white">
              <input
                type="text"
                value={plateInput}
                onChange={handleInputChange}
                placeholder="BRA2E19"
                maxLength={7}
                className="w-full text-center text-2xl font-black font-mono tracking-widest text-slate-900 uppercase bg-transparent outline-none placeholder:text-slate-300"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={plateInput.length < 7 || isSearching}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {isSearching ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Consultando bases & Gerando Laudo...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Consultar Placa & Gerar Laudo</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Quick Demo Vehicles */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800 flex items-center gap-1">
            <FileSearch className="w-3.5 h-3.5 text-blue-600" />
            Exemplos de Laudo Cautelar:
          </span>
          <span className="text-[10px] text-slate-500">1 toque para abrir</span>
        </div>

        <div className="space-y-2">
          {DEMO_LAUDOS.map((demo) => {
            const isAprovado = demo.verdict === 'APROVADO';
            const isApontamento = demo.verdict === 'APROVADO COM APONTAMENTO';

            return (
              <button
                key={demo.id}
                type="button"
                onClick={() => onSelectDemoLaudo(demo)}
                className="w-full text-left p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-400 transition-all flex items-center justify-between gap-3 shadow-2xs group active:scale-[0.99]"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      {demo.vehicle.placa}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        isAprovado
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isApontamento
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {isAprovado && <CheckCircle2 className="w-2.5 h-2.5" />}
                      {isApontamento && <AlertTriangle className="w-2.5 h-2.5" />}
                      {!isAprovado && !isApontamento && <XCircle className="w-2.5 h-2.5" />}
                      <span>{demo.verdict}</span>
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-800 truncate">
                    {demo.vehicle.marca} {demo.vehicle.modelo} {demo.vehicle.versao}
                  </p>

                  <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                    <span>FIPE: R$ {demo.vehicle.fipe.valorFipe.toLocaleString('pt-BR')}</span>
                    <span>•</span>
                    <span>{demo.vehicle.km.toLocaleString('pt-BR')} km</span>
                    <span>•</span>
                    <strong className="text-slate-700">Score {demo.score}/100</strong>
                  </div>
                </div>

                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tudo o que um Laudo Cautelar faz (Cards Informativos) */}
      <div className="pt-2 border-t border-slate-200 space-y-2">
        <span className="text-xs font-bold text-slate-800 block">
          O que este App de Laudo Cautelar avalia:
        </span>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-blue-600 font-bold text-[11px]">
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Passagem por Leilão</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              Pequena, média ou grande monta e seguradora.
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[11px]">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Preço Tabela FIPE</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              Cotação oficial de mercado e desvalorização.
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-purple-600 font-bold text-[11px]">
              <Clock className="w-3.5 h-3.5" />
              <span>KM & Odômetro</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              Detecção de adulteração de quilometragem.
            </p>
          </div>

          <div
            onClick={onOpenAiQuickCheck}
            className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-200 hover:border-purple-400 flex flex-col gap-1 cursor-pointer transition-all active:scale-95"
          >
            <div className="flex items-center gap-1.5 text-purple-700 font-bold text-[11px]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Foto IA</span>
            </div>
            <p className="text-[10px] text-purple-900 leading-tight">
              Envie foto da peça ou amassado para teste rápido.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
