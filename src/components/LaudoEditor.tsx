import React, { useState } from 'react';
import {
  LaudoInspection,
  StructuralCheckItem,
  PaintPanelItem,
  LaudoVerdict,
} from '../types';
import { calculateLaudoVerdictAndScore } from '../data/mockVehicles';
import { PaintMicrometerVisual } from './PaintMicrometerVisual';
import { PhotoCaptureBar } from './PhotoCaptureBar';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Shield,
  Gauge,
  Wrench,
  Camera,
  Eye,
  Sparkles,
  DollarSign,
  History,
  AlertOctagon,
  Users,
  Car,
} from 'lucide-react';
import { InspectionPhoto } from '../types';

interface LaudoEditorProps {
  laudo: LaudoInspection;
  onUpdateLaudo: (updated: LaudoInspection) => void;
  onViewCertificate: () => void;
  onOpenAiForPanel: (panelName: string) => void;
  onAddPhoto: (photo: InspectionPhoto) => void;
  onRemovePhoto: (id: string) => void;
}

export const LaudoEditor: React.FC<LaudoEditorProps> = ({
  laudo,
  onUpdateLaudo,
  onViewCertificate,
  onOpenAiForPanel,
  onAddPhoto,
  onRemovePhoto,
}) => {
  const [activeTab, setActiveTab] = useState<'veiculo' | 'fipe_km' | 'estrutura' | 'pintura' | 'mecanica' | 'fotos'>('veiculo');

  // Helper to update and recalculate
  const updateAndRecalculate = (partial: Partial<LaudoInspection>) => {
    const next: LaudoInspection = { ...laudo, ...partial };
    const { verdict, score, apontamentos } = calculateLaudoVerdictAndScore(
      next.structuralCheck,
      next.paintPanels,
      next.docCheck,
      next.mechanicalCheck
    );
    next.verdict = verdict;
    next.score = score;
    next.apontamentos = apontamentos;
    onUpdateLaudo(next);
  };

  const handleVehicleChange = (field: string, value: any) => {
    updateAndRecalculate({
      vehicle: { ...laudo.vehicle, [field]: value },
    });
  };

  const handleDocCheckChange = (field: string, value: any) => {
    updateAndRecalculate({
      docCheck: { ...laudo.docCheck, [field]: value },
    });
  };

  const handleStructuralStatusChange = (id: string, newStatus: 'original' | 'apontamento' | 'reprovado') => {
    const updated = laudo.structuralCheck.map((item) =>
      item.id === id ? { ...item, status: newStatus } : item
    );
    updateAndRecalculate({ structuralCheck: updated });
  };

  const handlePaintMicronsChange = (panelId: string, microns: number) => {
    const updated = laudo.paintPanels.map((p) => {
      if (p.id === panelId) {
        let status: 'original' | 'repintura' | 'massa' = 'original';
        if (microns > 240) status = 'massa';
        else if (microns > 150) status = 'repintura';
        return { ...p, microns, status };
      }
      return p;
    });
    updateAndRecalculate({ paintPanels: updated });
  };

  const handleMechanicalChange = (field: string, value: any) => {
    updateAndRecalculate({
      mechanicalCheck: { ...laudo.mechanicalCheck, [field]: value },
    });
  };

  const handlePneuChange = (wheel: 'dianteiroEsqMm' | 'dianteiroDirMm' | 'traseiroEsqMm' | 'traseiroDirMm', value: number) => {
    updateAndRecalculate({
      mechanicalCheck: {
        ...laudo.mechanicalCheck,
        pneus: { ...laudo.mechanicalCheck.pneus, [wheel]: value },
      },
    });
  };

  const isAprovado = laudo.verdict === 'APROVADO';
  const isApontamento = laudo.verdict === 'APROVADO COM APONTAMENTO';

  return (
    <div className="space-y-3 p-3">
      {/* Mobile Top Verdict Badge */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                isAprovado
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                  : isApontamento
                  ? 'bg-amber-50 text-amber-600 border-amber-200'
                  : 'bg-rose-50 text-rose-600 border-rose-200'
              }`}
            >
              {isAprovado && <CheckCircle2 className="w-5 h-5" />}
              {isApontamento && <AlertTriangle className="w-5 h-5" />}
              {!isAprovado && !isApontamento && <XCircle className="w-5 h-5" />}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-xs bg-slate-100 px-1.5 py-0.2 rounded text-slate-800">
                  {laudo.vehicle.placa}
                </span>
                <span className="text-[10px] text-slate-400">Score {laudo.score}/100</span>
              </div>
              <h2
                className={`text-sm font-black tracking-tight truncate ${
                  isAprovado
                    ? 'text-emerald-700'
                    : isApontamento
                    ? 'text-amber-700'
                    : 'text-rose-700'
                }`}
              >
                {laudo.verdict}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onViewCertificate}
            className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Ver Laudo</span>
          </button>
        </div>

        {/* Risk Thermometer Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold">
            <span>Risco Cautelar:</span>
            <span className={isAprovado ? 'text-emerald-700' : isApontamento ? 'text-amber-700' : 'text-rose-700'}>
              {isAprovado ? 'Baixo Risco (Seguro)' : isApontamento ? 'Risco Médio (Apontamentos)' : 'Alto Risco (Reprovado)'}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
            <div
              className={`h-full transition-all duration-500 ${
                isAprovado ? 'bg-emerald-500' : isApontamento ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${laudo.score}%` }}
            ></div>
          </div>
        </div>

        {/* Alerta de Cenário Demonstrativo */}
        {(laudo.isDemonstrativeScenario || laudo.vehicle.placa.startsWith('DEMO')) && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-2 text-amber-900 text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0"></span>
            <span className="font-bold text-[11px]">Cenário Demonstrativo Fixo ({laudo.vehicle.placa}):</span>
            <span className="text-[10px] text-amber-800">Dados fictícios para apresentação do app. Não constitui base oficial DETRAN.</span>
          </div>
        )}
      </div>

      {/* Mobile Horizontal Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('veiculo')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
            activeTab === 'veiculo' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          <Car className="w-3 h-3" />
          <span>Dados & Histórico</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('fipe_km')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
            activeTab === 'fipe_km' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          <DollarSign className="w-3 h-3" />
          <span>FIPE & KM</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('estrutura')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
            activeTab === 'estrutura' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          <Shield className="w-3 h-3" />
          <span>Estrutura</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pintura')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
            activeTab === 'pintura' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          <Gauge className="w-3 h-3" />
          <span>Micrômetro</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('mecanica')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
            activeTab === 'mecanica' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          <Wrench className="w-3 h-3" />
          <span>Mecânica & Pneus</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('fotos')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
            activeTab === 'fotos' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          <Camera className="w-3 h-3" />
          <span>Fotos ({laudo.photos.length})</span>
        </button>
      </div>

      {/* TAB 1: DADOS & HISTÓRICO */}
      {activeTab === 'veiculo' && (
        <div className="space-y-3">
          {/* Identificação */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs space-y-2.5">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-blue-600" />
              <span>Identificação do Veículo</span>
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-slate-500 font-semibold block">Placa</label>
                <input
                  type="text"
                  value={laudo.vehicle.placa}
                  onChange={(e) => handleVehicleChange('placa', e.target.value.toUpperCase())}
                  className="w-full p-2 rounded-xl border border-slate-300 font-mono font-bold text-xs uppercase bg-slate-50"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-semibold block">Marca</label>
                <input
                  type="text"
                  value={laudo.vehicle.marca}
                  onChange={(e) => handleVehicleChange('marca', e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-semibold block">Modelo</label>
                <input
                  type="text"
                  value={laudo.vehicle.modelo}
                  onChange={(e) => handleVehicleChange('modelo', e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-semibold block">Ano Fab / Mod</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={laudo.vehicle.anoFab}
                    onChange={(e) => handleVehicleChange('anoFab', Number(e.target.value))}
                    className="w-1/2 p-2 rounded-xl border border-slate-300 text-xs text-center font-mono"
                  />
                  <span>/</span>
                  <input
                    type="number"
                    value={laudo.vehicle.anoMod}
                    onChange={(e) => handleVehicleChange('anoMod', Number(e.target.value))}
                    className="w-1/2 p-2 rounded-xl border border-slate-300 text-xs text-center font-mono"
                  />
                </div>
              </div>

              <div className="col-span-2">
                <label className="text-[10px] text-slate-500 font-semibold block">Versão</label>
                <input
                  type="text"
                  value={laudo.vehicle.versao}
                  onChange={(e) => handleVehicleChange('versao', e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-semibold block">Chassi (VIN)</label>
                <input
                  type="text"
                  value={laudo.vehicle.chassi}
                  onChange={(e) => handleVehicleChange('chassi', e.target.value.toUpperCase())}
                  className="w-full p-2 rounded-xl border border-slate-300 text-[11px] font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-semibold block">Número Motor</label>
                <input
                  type="text"
                  value={laudo.vehicle.motor}
                  onChange={(e) => handleVehicleChange('motor', e.target.value.toUpperCase())}
                  className="w-full p-2 rounded-xl border border-slate-300 text-[11px] font-mono"
                />
              </div>
            </div>
          </div>

          {/* Histórico Cautelar (Leilão, Sinistro, Roubo) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs space-y-2.5">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Histórico de Procedência</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div>
                <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">
                  Passagem por Leilão
                </label>
                <select
                  value={laudo.docCheck.leilao}
                  onChange={(e) => handleDocCheckChange('leilao', e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                >
                  <option value="Nenhum">Nenhum (Sem leilão)</option>
                  <option value="Leilão Financeira">Leilão Financeira (Financiamento)</option>
                  <option value="Leilão Seguradora Pequena Monta">Leilão Seguradora - Pequena Monta</option>
                  <option value="Leilão Seguradora Média Monta">Leilão Seguradora - Média Monta (Grave)</option>
                  <option value="Leilão Seguradora Grande Monta">Leilão Seguradora - Grande Monta (PT)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">
                  Sinistro com Indenização
                </label>
                <select
                  value={laudo.docCheck.sinistro ? 'true' : 'false'}
                  onChange={(e) => handleDocCheckChange('sinistro', e.target.value === 'true')}
                  className="w-full p-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                >
                  <option value="false">Nada Consta (Sem sinistros indenizados)</option>
                  <option value="true">Consta Sinistro com Indenização</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">
                  Roubo e Furto
                </label>
                <select
                  value={laudo.docCheck.rouboFurto}
                  onChange={(e) => handleDocCheckChange('rouboFurto', e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                >
                  <option value="Nada Consta">Nada Consta</option>
                  <option value="Recuperado de Furto">Recuperado de Furto Regularizado</option>
                  <option value="Alerta de Roubo Ativo">ALERTA ATIVO DE ROUBO/FURTO</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">
                  Bloqueios Judiciais (Renajud)
                </label>
                <select
                  value={laudo.docCheck.bloqueioJudicial}
                  onChange={(e) => handleDocCheckChange('bloqueioJudicial', e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                >
                  <option value="Nada Consta">Nada Consta (Livre)</option>
                  <option value="Restrição Renajud">Consta Restrição Renajud</option>
                  <option value="Bloqueio Policial">Bloqueio Policial / Administrativo</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">
                  Débitos DETRAN / IPVA
                </label>
                <select
                  value={laudo.docCheck.debitosMultas}
                  onChange={(e) => handleDocCheckChange('debitosMultas', e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                >
                  <option value="Quitado / Sem débitos">Quitado / Sem débitos</option>
                  <option value="Possui débitos pendentes">Possui débitos pendentes</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FIPE & HISTÓRICO DE KM */}
      {activeTab === 'fipe_km' && (
        <div className="space-y-3">
          {/* Tabela FIPE Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs space-y-2">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              <span>Cotação Oficial Tabela FIPE</span>
            </h3>

            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Valor Médio de Mercado
                </span>
                <span className="text-xl font-black text-emerald-950">
                  R$ {laudo.vehicle.fipe.valorFipe.toLocaleString('pt-BR')}
                </span>
                <span className="text-[10px] text-emerald-700 block mt-0.5">
                  Ref: {laudo.vehicle.fipe.mesReferencia} • Cód. {laudo.vehicle.fipe.codigoFipe}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              {laudo.vehicle.fipe.comparativoMercado}
            </p>
          </div>

          {/* Donos Anteriores */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs space-y-2">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>Proprietários & Uso Anterior</span>
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 block">Qtd. Proprietários</span>
                <span className="text-base font-black text-slate-800">
                  {laudo.vehicle.qtdProprietarios} {laudo.vehicle.qtdProprietarios === 1 ? 'dono' : 'donos'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 block">Tipo de Uso</span>
                <span className="text-xs font-bold text-slate-800">
                  {laudo.vehicle.tipoUsoAnterior}
                </span>
              </div>
            </div>
          </div>

          {/* Histórico de Odômetro (KM) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs space-y-2">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-purple-600" />
              <span>Auditoria de Odômetro (Quilometragem)</span>
            </h3>

            <div className="divide-y divide-slate-100 text-xs">
              {laudo.vehicle.historicoKm.map((kmItem, idx) => (
                <div key={idx} className="py-2 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block text-xs">
                      {kmItem.km.toLocaleString('pt-BR')} km
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {kmItem.origem} • {kmItem.data}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Regular
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ESTRUTURA */}
      {activeTab === 'estrutura' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
            <span className="font-bold text-slate-900 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>Estrutura Monobloco</span>
            </span>
            <span className="text-[10px] text-slate-500">Longarinas, Colunas e Painéis</span>
          </div>

          <div className="divide-y divide-slate-100">
            {laudo.structuralCheck.map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-slate-900 block truncate">
                    {item.name}
                  </span>
                  <span className="text-[10px] text-slate-500 block truncate">
                    {item.description}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleStructuralStatusChange(item.id, 'original')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      item.status === 'original'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    Original
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStructuralStatusChange(item.id, 'apontamento')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      item.status === 'apontamento'
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    Apont.
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStructuralStatusChange(item.id, 'reprovado')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      item.status === 'reprovado'
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    Reprov.
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PINTURA & MICRÔMETRO */}
      {activeTab === 'pintura' && (
        <PaintMicrometerVisual
          panels={laudo.paintPanels}
          onChangeMicrons={handlePaintMicronsChange}
          onSelectPanelForAi={(panel) => onOpenAiForPanel(panel.name)}
        />
      )}

      {/* TAB 5: MECÂNICA & PNEUS */}
      {activeTab === 'mecanica' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-blue-600" />
            <span>Pneus & Segurança</span>
          </h3>

          {/* 4 Tires Depth in mm */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-800 block">
              Sulcos dos 4 Pneus (mm - Mínimo Legal: 1.6mm)
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-slate-500 block">Dianteiro Esq.</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.1"
                    value={laudo.mechanicalCheck.pneus.dianteiroEsqMm}
                    onChange={(e) => handlePneuChange('dianteiroEsqMm', Number(e.target.value))}
                    className="w-full p-1.5 rounded-lg border border-slate-300 font-mono font-bold text-xs"
                  />
                  <span className="text-[11px] text-slate-500">mm</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block">Dianteiro Dir.</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.1"
                    value={laudo.mechanicalCheck.pneus.dianteiroDirMm}
                    onChange={(e) => handlePneuChange('dianteiroDirMm', Number(e.target.value))}
                    className="w-full p-1.5 rounded-lg border border-slate-300 font-mono font-bold text-xs"
                  />
                  <span className="text-[11px] text-slate-500">mm</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block">Traseiro Esq.</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.1"
                    value={laudo.mechanicalCheck.pneus.traseiroEsqMm}
                    onChange={(e) => handlePneuChange('traseiroEsqMm', Number(e.target.value))}
                    className="w-full p-1.5 rounded-lg border border-slate-300 font-mono font-bold text-xs"
                  />
                  <span className="text-[11px] text-slate-500">mm</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block">Traseiro Dir.</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.1"
                    value={laudo.mechanicalCheck.pneus.traseiroDirMm}
                    onChange={(e) => handlePneuChange('traseiroDirMm', Number(e.target.value))}
                    className="w-full p-1.5 rounded-lg border border-slate-300 font-mono font-bold text-xs"
                  />
                  <span className="text-[11px] text-slate-500">mm</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">
                Gravação do Chassi nos Vidros
              </label>
              <select
                value={laudo.mechanicalCheck.vidrosChassi}
                onChange={(e) => handleMechanicalChange('vidrosChassi', e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
              >
                <option value="Todos os vidros originais com gravação">Todos os vidros originais com gravação</option>
                <option value="Parabrisa substituído sem gravação">Parabrisa substituído sem gravação</option>
                <option value="Vidro lateral divergente">Vidro lateral divergente</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">
                Vazamentos no Motor
              </label>
              <select
                value={laudo.mechanicalCheck.vazamentoFluidos}
                onChange={(e) => handleMechanicalChange('vazamentoFluidos', e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
              >
                <option value="Nenhum vazamento">Nenhum vazamento (Seco)</option>
                <option value="Suor leve sem gotejamento">Suor leve sem gotejamento</option>
                <option value="Vazamento ativo de óleo/arrefecimento">Vazamento ativo</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">
                Luzes de Painel (Airbag / ABS)
              </label>
              <select
                value={laudo.mechanicalCheck.airbagAbs}
                onChange={(e) => handleMechanicalChange('airbagAbs', e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
              >
                <option value="Sistemas operantes sem falhas">Sistemas operantes sem falhas</option>
                <option value="Luz de advertência acesa no painel">Luz de advertência acesa no painel</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: FOTOS */}
      {activeTab === 'fotos' && (
        <div className="space-y-3">
          <PhotoCaptureBar
            photos={laudo.photos}
            onAddPhoto={onAddPhoto}
            onRemovePhoto={onRemovePhoto}
            onAnalyzeWithAi={() => onOpenAiForPanel('Geral')}
          />
        </div>
      )}
    </div>
  );
};
