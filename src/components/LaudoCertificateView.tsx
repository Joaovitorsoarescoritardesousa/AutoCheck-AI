import React, { useState } from 'react';
import { LaudoInspection, InspectionPhoto } from '../types';
import { PhotoCaptureBar } from './PhotoCaptureBar';
import {
  Printer,
  Share2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  QrCode,
  MapPin,
  Calendar,
  ArrowLeft,
  BookmarkCheck,
  Check,
  DollarSign,
  Camera,
  Edit,
} from 'lucide-react';

interface LaudoCertificateViewProps {
  laudo: LaudoInspection;
  onBackToEdit: () => void;
  onSaveToHistory: (laudo: LaudoInspection) => void;
  onAddPhoto: (photo: InspectionPhoto) => void;
  onRemovePhoto: (id: string) => void;
}

export const LaudoCertificateView: React.FC<LaudoCertificateViewProps> = ({
  laudo,
  onBackToEdit,
  onSaveToHistory,
  onAddPhoto,
  onRemovePhoto,
}) => {
  const [savedBadge, setSavedBadge] = useState(false);

  const isAprovado = laudo.verdict === 'APROVADO';
  const isApontamento = laudo.verdict === 'APROVADO COM APONTAMENTO';

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `📋 *LAUDO CAUTELAR VEICULAR*\n\n` +
      `🚗 *Veículo:* ${laudo.vehicle.marca} ${laudo.vehicle.modelo} ${laudo.vehicle.versao}\n` +
      `🔢 *Placa:* ${laudo.vehicle.placa} | *Ano:* ${laudo.vehicle.anoFab}/${laudo.vehicle.anoMod}\n` +
      `💰 *FIPE:* R$ ${laudo.vehicle.fipe.valorFipe.toLocaleString('pt-BR')}\n` +
      `🎯 *Veredito:* ${laudo.verdict}\n` +
      `⭐ *Score:* ${laudo.score}/100\n` +
      `📄 *Protocolo:* ${laudo.numeroLaudo}\n` +
      `🔑 *Autenticidade:* ${laudo.codigoAutenticidade}\n\n` +
      `*Resumo do Laudo:* ${laudo.resumoParecer}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleSave = () => {
    onSaveToHistory(laudo);
    setSavedBadge(true);
    setTimeout(() => setSavedBadge(false), 3000);
  };

  return (
    <div className="space-y-3 p-3">
      {/* Mobile Top Actions */}
      <div className="print:hidden flex items-center justify-between gap-1.5 bg-white border border-slate-200 rounded-2xl p-2.5 shadow-2xs">
        <button
          type="button"
          onClick={onBackToEdit}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition-colors"
          title="Editar checklist ou itens da vistoria"
        >
          <Edit className="w-3.5 h-3.5" />
          <span className="text-[11px]">Editar Vistoria</span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleSave}
            className={`px-2.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
              savedBadge
                ? 'bg-emerald-600 text-white'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300'
            }`}
          >
            {savedBadge ? <Check className="w-3.5 h-3.5" /> : <BookmarkCheck className="w-3.5 h-3.5 text-blue-600" />}
            <span className="text-[11px]">{savedBadge ? 'Salvo!' : 'Salvar'}</span>
          </button>

          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="px-2.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs flex items-center gap-1 shadow-2xs active:scale-95 transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="text-[11px]">WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-2.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 shadow-2xs active:scale-95 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="text-[11px]">PDF</span>
          </button>
        </div>
      </div>

      {/* Official Certificate Paper Layout */}
      <div
        id="certificate-print-area"
        className="bg-white border-2 border-slate-300 rounded-2xl p-4 sm:p-6 shadow-md space-y-4 text-slate-900 print:border-none print:p-0 print:shadow-none"
      >
        {/* Certificate Header */}
        <div className="border-b-2 border-slate-900 pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-900 text-white flex items-center justify-center font-black shadow-xs shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500 block">
                  CERTIFICADO OFICIAL
                </span>
                <h1 className="text-base sm:text-lg font-black tracking-tight uppercase leading-tight">
                  Laudo Cautelar Veicular
                </h1>
              </div>
            </div>

            <div className="text-right text-[10px] font-mono text-slate-500 shrink-0">
              <div>Nº {laudo.numeroLaudo}</div>
              <div className="text-blue-700 font-bold">{laudo.codigoAutenticidade}</div>
            </div>
          </div>
        </div>

        {/* Identificação de Dados Demonstrativos Fictícios (Não oficial DETRAN/SENATRAN) */}
        {(laudo.isDemonstrativeScenario || laudo.vehicle.placa.startsWith('DEMO')) && (
          <div className="rounded-xl border-2 border-amber-300 bg-amber-50/90 p-3 text-amber-950 flex items-start gap-2.5 text-xs shadow-2xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-[10px] uppercase tracking-wider text-amber-900 bg-amber-200/90 px-2 py-0.5 rounded border border-amber-300">
                  Cenário Demonstrativo • Dados Fictícios
                </span>
                <span className="text-[10px] text-amber-800 font-bold">
                  Placa de Demonstração ({laudo.vehicle.placa})
                </span>
              </div>
              <p className="text-[11px] text-amber-900 mt-1 leading-relaxed font-medium">
                {laudo.demonstrativeDisclaimer ||
                  'Este laudo apresenta um cenário demonstrativo para exibição do aplicativo. Os dados são fictícios e não representam informações oficiais do DETRAN, SENATRAN ou de qualquer base governamental real.'}
              </p>
            </div>
          </div>
        )}

        {/* Verdict Stamp */}
        <div
          className={`rounded-2xl p-3.5 border-2 flex items-center justify-between gap-3 ${
            isAprovado
              ? 'bg-emerald-50/80 border-emerald-500 text-emerald-950'
              : isApontamento
              ? 'bg-amber-50/80 border-amber-500 text-amber-950'
              : 'bg-rose-50/80 border-rose-500 text-rose-950'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-white ${
                isAprovado ? 'bg-emerald-600' : isApontamento ? 'bg-amber-500' : 'bg-rose-600'
              }`}
            >
              {isAprovado && <CheckCircle2 className="w-6 h-6" />}
              {isApontamento && <AlertTriangle className="w-6 h-6" />}
              {!isAprovado && !isApontamento && <XCircle className="w-6 h-6" />}
            </div>

            <div className="min-w-0">
              <span className="text-[9px] font-extrabold uppercase tracking-wider block opacity-75">
                Veredito Final
              </span>
              <h2 className="text-base sm:text-lg font-black uppercase tracking-tight truncate">
                {laudo.verdict}
              </h2>
              <p className="text-[10px] line-clamp-2 leading-tight">
                {laudo.resumoParecer}
              </p>
            </div>
          </div>

          <div className="text-center bg-white/90 rounded-xl p-2 border border-current shrink-0 min-w-[60px]">
            <span className="text-[9px] font-bold block text-slate-400">SCORE</span>
            <span className="text-xl font-black text-slate-900 leading-none">{laudo.score}</span>
            <span className="text-[8px] text-slate-400 block">/100</span>
          </div>
        </div>

        {/* Location & Date Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2 rounded-xl bg-slate-50 text-[10px] text-slate-600 border border-slate-200">
          <div className="flex items-center gap-1 truncate">
            <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
            <span className="truncate">{laudo.enderecoVistoria}, {laudo.cidadeUf}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0 text-slate-500">
            <Calendar className="w-3 h-3" />
            <span>{laudo.dataEmissao} às {laudo.horaEmissao}</span>
          </div>
        </div>

        {/* 1. Vehicle & FIPE Data */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
            1. Dados do Veículo & FIPE
          </span>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[9px] text-slate-400 block">Placa</span>
              <span className="font-mono font-bold text-slate-900">{laudo.vehicle.placa}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[9px] text-slate-400 block">Veículo</span>
              <span className="font-bold text-slate-900 truncate block">{laudo.vehicle.marca} {laudo.vehicle.modelo}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[9px] text-slate-400 block">Ano Fab/Mod</span>
              <span className="font-bold text-slate-900">{laudo.vehicle.anoFab}/{laudo.vehicle.anoMod}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[9px] text-slate-400 block">Odômetro (KM)</span>
              <span className="font-mono font-bold text-slate-900">{laudo.vehicle.km.toLocaleString('pt-BR')} km</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[9px] text-slate-400 block">Chassi (VIN)</span>
              <span className="font-mono text-[10px] font-bold text-slate-900 truncate block">{laudo.vehicle.chassi}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[9px] text-slate-400 block">Renavam</span>
              <span className="font-mono text-[10px] font-bold text-slate-900 truncate block">{laudo.vehicle.renavam}</span>
            </div>
            <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-200 col-span-2 flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-900 flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-emerald-700" />
                Valor Tabela FIPE:
              </span>
              <strong className="text-xs font-black text-emerald-950">
                R$ {laudo.vehicle.fipe.valorFipe.toLocaleString('pt-BR')}
              </strong>
            </div>
          </div>
        </div>

        {/* 2. Procedência & Histórico */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
            2. Histórico & Procedência
          </span>
          <div className="space-y-1 text-xs">
            <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-slate-600 text-[11px]">Passagem por Leilão:</span>
              <strong className={`text-[11px] ${laudo.docCheck.leilao === 'Nenhum' ? 'text-emerald-700' : 'text-rose-700'}`}>
                {laudo.docCheck.leilao}
              </strong>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-slate-600 text-[11px]">Sinistro Indenizado:</span>
              <strong className={`text-[11px] ${!laudo.docCheck.sinistro ? 'text-emerald-700' : 'text-rose-700'}`}>
                {laudo.docCheck.sinistro ? 'Consta Sinistro' : 'Nada Consta'}
              </strong>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-slate-600 text-[11px]">Roubo / Furto:</span>
              <strong className={`text-[11px] ${laudo.docCheck.rouboFurto === 'Nada Consta' ? 'text-emerald-700' : 'text-rose-700'}`}>
                {laudo.docCheck.rouboFurto}
              </strong>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-slate-600 text-[11px]">Bloqueios Renajud:</span>
              <strong className={`text-[11px] ${laudo.docCheck.bloqueioJudicial === 'Nada Consta' ? 'text-emerald-700' : 'text-rose-700'}`}>
                {laudo.docCheck.bloqueioJudicial}
              </strong>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-slate-600 text-[11px]">Débitos DETRAN / IPVA:</span>
              <strong className={`text-[11px] ${laudo.docCheck.debitosMultas === 'Quitado / Sem débitos' ? 'text-emerald-700' : 'text-amber-700'}`}>
                {laudo.docCheck.debitosMultas}
              </strong>
            </div>
          </div>
        </div>

        {/* 3. Estrutura Resumo */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
            3. Estrutura Monobloco (Longarinas & Colunas)
          </span>
          <div className="grid grid-cols-2 gap-1 text-[11px]">
            {laudo.structuralCheck.slice(0, 8).map((item) => (
              <div key={item.id} className="p-1.5 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="truncate mr-1 text-[10px] text-slate-700">{item.name}</span>
                <span className={`text-[9px] font-bold px-1 rounded uppercase ${
                  item.status === 'original' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Apontamentos */}
        {laudo.apontamentos.length > 0 && (
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-1">
            <span className="text-[10px] font-bold text-amber-900 uppercase block">
              Apontamentos Registrados:
            </span>
            {laudo.apontamentos.map((ap, i) => (
              <div key={i} className="text-[11px] text-amber-950 flex items-start gap-1">
                <span>•</span>
                <span>{ap}</span>
              </div>
            ))}
          </div>
        )}

        {/* 5. Câmera & Fotos da Vistoria (Tirar Fotos na Hora) */}
        <div className="space-y-2 pt-2 border-t border-slate-200">
          <div className="print:hidden">
            <PhotoCaptureBar
              photos={laudo.photos}
              onAddPhoto={onAddPhoto}
              onRemovePhoto={onRemovePhoto}
            />
          </div>

          {/* Fotos para Impressão */}
          {laudo.photos.length > 0 && (
            <div className="hidden print:block space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">
                Fotos Anexadas à Vistoria:
              </span>
              <div className="grid grid-cols-4 gap-2">
                {laudo.photos.map((ph) => (
                  <div key={ph.id} className="rounded-lg border border-slate-300 overflow-hidden">
                    <img src={ph.url} alt={ph.label} className="w-full h-20 object-cover" />
                    <span className="text-[8px] font-bold p-1 block truncate text-center bg-slate-50">
                      {ph.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Certificate QR & Footer */}
        <div className="pt-3 border-t-2 border-slate-900 flex items-center justify-between gap-3 text-[10px]">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-slate-100 border border-slate-300 rounded flex items-center justify-center shrink-0">
              <QrCode className="w-8 h-8 text-slate-800" />
            </div>
            <div>
              <span className="font-bold text-slate-800 block text-[10px]">Validação Digital</span>
              <span className="text-[9px] text-slate-400">Escaneie para validar autenticidade</span>
            </div>
          </div>

          <div className="text-right">
            <div className="font-bold text-slate-900 text-xs">{laudo.vistoriadorNome}</div>
            <div className="text-[9px] text-slate-400">{laudo.vistoriadorCertificado}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
